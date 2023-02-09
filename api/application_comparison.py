
from application_functions import get_info_application
from application_helper_functions import check_access_comparison, check_comparison_row_exist
from functions_get import filter_row
from models import Application, ApplicationComparison, ApplicationUser
from my_engine import session_scope


@check_access_comparison
def add_comparison_row(login: str, number: str) -> dict:
    """Функция для добавления строки в таблицу сравнения"""
    if not number.isdigit():
        return {"status": 400, "message": f'Невозможно перевести в число, строку "{number}"'}

    with session_scope() as session:
        user_id, = session.query(ApplicationUser.id).filter(ApplicationUser.login == login).one()
        main_row = 0 if session.query(ApplicationComparison).filter(ApplicationComparison.user_id == user_id).count() else 1

        if len(number) == 7:
            # Проверка на существование записи с данным номером АСУ
            if filter_row(number_asu=number.zfill(7), sort_name='number_pp', sort_by='ASC')["status"] == 200:
                session.add(ApplicationComparison(user_id=user_id, number_asu=number, main_row=main_row))
            else:
                return {"status": 404, "message": f"В перечне ВКТМЦ заявки с №АСУ '{number}' не найдено"}
        else:
            if session.query(Application).get(number):
                session.add(ApplicationComparison(user_id=user_id, application_id=number, main_row=main_row))
            else:
                return {"status": 404, "message": f"Заявки с номером '{number}' не найдено"}

    return {"status": 200}


@check_access_comparison
@check_comparison_row_exist
def delete_comparison_row(login: str, comparison_id: int) -> dict:
    """Функция удаления строки из сравнительной таблицы пользователя"""
    with session_scope() as session:
        user_id, = session.query(ApplicationUser.id).filter(ApplicationUser.login == login).one()
        
        if comparison_id not in tuple([_ for _, in session.query(ApplicationComparison.id).filter(ApplicationComparison.user_id == user_id).all()]):
            return {"status": 400, "message": "Данная строка в сравнительной таблице вам не принадлежит"}

        comparison: ApplicationComparison = session.query(ApplicationComparison).get(comparison_id)

        if comparison.main_row == 1:
            return {"status": 400, "message": "Нельзя удалить основную строку для сравнения"}
        else:
            session.delete(comparison)
    
    
    return {"status": 200}


@check_access_comparison
def delete_all_comparison_rows(login: str) -> dict:
    """Функция удаления всех строк из сравнительной таблицы пользователя"""
    with session_scope() as session:
        user_id, = session.query(ApplicationUser.id).filter(ApplicationUser.login == login).one()
        session.query(ApplicationComparison).filter(ApplicationComparison.user_id == user_id).delete(synchronize_session='fetch')
    
    return {"status": 200}


@check_access_comparison
@check_comparison_row_exist
def make_main_comparison_row(login: str, comparison_id: int) -> dict:
    """Функция назначения новой основной строки для сравнения"""
    with session_scope() as session:
        user_id, = session.query(ApplicationUser.id).filter(ApplicationUser.login == login).one()
        
        if comparison_id not in tuple([_ for _, in session.query(ApplicationComparison.id).filter(ApplicationComparison.user_id == user_id).all()]):
            return {"status": 400, "message": "Данная строка в сравнительной таблице вам не принадлежит"}

        session.query(ApplicationComparison).filter(ApplicationComparison.user_id == user_id).update({"main_row": 0})
        session.query(ApplicationComparison).filter(ApplicationComparison.id == comparison_id).update({"main_row": 1})

    return {"status": 200}


@check_access_comparison
def get_comparison_rows(login: str) -> dict:
    """Функция получения строк для сравнения"""
    with session_scope() as session:
        user_id, = session.query(ApplicationUser.id).filter(ApplicationUser.login == login).one()
        main_row = dict(session.query(ApplicationComparison.id, 
                                      ApplicationComparison.number_asu,
                                      ApplicationComparison.application_id).filter(ApplicationComparison.main_row == 1,
                                                                                   ApplicationComparison.user_id == user_id).first() or {})
        
        # Если нет основной строки, значит не нужно ничего выводить
        if not main_row:
            return {"status": 404, "message": "Строки для сравнения не найдены"}

        needed_keys = ("nm_code", "product_name", "product_type", "ntd", "extra_options",
                       "measure", "product_group", "sample_size", "article_group", "note", "item_number")

        if main_row.get("number_asu"):
            main_row_values = dict((k, v) for k, v in filter_row(number_asu=str(main_row.get("number_asu")).zfill(7), 
                                                                 sort_name='number_pp',
                                                                 sort_by='ASC')['vktmc_row'][0].items() if k in needed_keys)
        else:
            main_row_values = dict((k.replace("_info", ""), v or None) for k, v in get_info_application(
                application_id=main_row.get("application_id"))["info"].items() if k.replace("_info", "") in needed_keys)

        result = [{"comparison_id": main_row["id"], 
                   "number": str(main_row["number_asu"]).zfill(7) if main_row["number_asu"] else main_row["application_id"], 
                   "values": dict((k, {"value": v, "difference": False}) for k, v in main_row_values.items())}]
        
        all_rows = [dict(_) for _ in session.query(ApplicationComparison.id,
                                                   ApplicationComparison.number_asu,
                                                   ApplicationComparison.application_id).filter(ApplicationComparison.main_row == 0,
                                                                                                ApplicationComparison.user_id == user_id).all()]
        # Можно искать одним запросом сделав in в бд, но дедлайн завтра
        for item in all_rows:
            if item.get("number_asu"):
                row_values = dict((k, v) for k, v in filter_row(number_asu=str(item.get("number_asu")).zfill(7),
                                                                sort_name='number_pp',
                                                                sort_by='ASC')['vktmc_row'][0].items() if k in needed_keys)
            else:
                row_values = dict((k.replace("_info", ""), v or None) for k, v in get_info_application(
                    application_id=item.get("application_id"))["info"].items() if k.replace("_info", "") in needed_keys)

            result.append({"comparison_id": item["id"],
                           "number": str(item["number_asu"]).zfill(7) if item["number_asu"] else item["application_id"],
                           "values": dict((k, {"value": v, "difference": True if v != main_row_values[k] else False}) for k, v in row_values.items())})

    return {"status": 200, "result": result}