import asyncio
import os
from active_directory import get_user_by_login
from functions_get import filter_row, get_id_name_row, get_name_row
from application_helper_functions import GENERAL_STRUCT, add_application_in_vktmc, add_new_application, check_access_edit, check_application_exist, check_required_fields, checks_true_values, filter_dict, find_changed_values, general_filter_dict, get_access, get_list_application, get_list_application_completed, update_vktmc_row_from_application
from models import ApplicationAttachedFile, ApplicationUser, Application, ApplicationHistory, ApplicationInfo, ApplicationNmCode, ApplicationStatus, ItemNumber, Measure, NMCode, ProductGroup, SampleSize, Vktmc, t_all_rows
from my_engine import session_scope
import openpyxl
from sqlalchemy import func, text



def application_auth(login: str) -> dict:
    """
    Авторизация в ресурсе заявок\n
    Вывод информации о пользователе.\n
    Вывод структуры страницы для пользователя.
    """
    with session_scope() as session:
        user_db: ApplicationUser = session.query(ApplicationUser).\
            filter(ApplicationUser.login == login).first()
        if user_db:
            user = {
                "id": user_db.id,
                "login": user_db.login,
                "email": user_db.email,
                "full_name": user_db.full_name,
                "departament": user_db.departament,
                "access": user_db.access
            }
            return {"status": 200, "user": user, "general_struct": GENERAL_STRUCT[user_db.access]}
        else:
            return {"status": 400, "message": "Ошибка прав доступа"}


def get_applications(login: str) -> dict:
    """Получить записи в зависимости от прав доступа."""
    user = application_auth(login).get("user")
    if not user:
        return {"status": 400, "message": "Ошибка прав доступа"}
    body = {}
    body["application_completed"] = get_list_application_completed()

    access = user.get("access")
    user_id = user.get("id")
    if access == "creator":
        body["application_action"] = get_list_application(statuses=(2, 5), responsible=Application.creator_id == user_id)
        body["application_await"] = get_list_application(statuses=(1, 3, 4), responsible=Application.creator_id == user_id)
        body["application_draft"] = get_list_application(statuses=(7, ), responsible=Application.creator_id == user_id)
    
    elif access == "cma_redactor":
        body["application_action"] = get_list_application(statuses=(1, 4), responsible=Application.responsible_cma_id == user_id)
        body["application_await"] = get_list_application(statuses=(2, 3, 5), responsible=Application.responsible_cma_id == user_id)
    
    elif access == "tb_redactor":
        body["application_action"] = get_list_application(statuses=(3, ), responsible=Application.responsible_tb_id == user_id)
        body["application_await"] = get_list_application(statuses=(1, 2, 4, 5), responsible=Application.responsible_tb_id == user_id)
    
    elif access == "cma_admin":
        body["application_action"] = get_list_application(statuses=(1, 4), responsible=Application.responsible_cma_id == None)
        body["application_await"] = get_list_application(statuses=(1, 2, 3, 4, 5), responsible=Application.responsible_cma_id != None)
    
    elif access == "tb_admin":
        body["application_action"] = get_list_application(statuses=(3, ), responsible=Application.responsible_tb_id == None) + get_list_application(statuses=(8, ), responsible=Application.responsible_tb_id != None)
        body["application_await"] = get_list_application(statuses=(1, 2, 3, 4, 5), responsible=Application.responsible_tb_id != None)
    
    body["status"] = 200
    return body


@check_application_exist
def get_info_application(application_id: int) -> dict:
    """Получить детальную информацию (все значения) заявки"""
    with session_scope() as session:
        result = session.query(Application.id, ApplicationNmCode.nm_code,
                             ApplicationInfo.product_name, ApplicationInfo.product_type,
                             ApplicationInfo.ntd, ApplicationInfo.extra_options, ApplicationInfo.measure,
                             ApplicationInfo.product_group, ApplicationInfo.sample_size, ApplicationInfo.article_group,
                             ApplicationInfo.item_number, ApplicationInfo.note, ApplicationInfo.comment, Application.number_asu).\
            join(ApplicationInfo).\
            outerjoin(ApplicationNmCode).\
            filter(Application.id == application_id).all()
        
        
        measure_list = [_["value"] for _ in asyncio.run(get_name_row(Measure, is_archived=0))]
        product_group_list = [_["value"] for _ in asyncio.run(get_id_name_row(ProductGroup, 0))]
        sample_size_list = [_["value"] for _ in asyncio.run(get_name_row(SampleSize, is_archived=0))]
        item_number_list = [_["value"] for _ in asyncio.run(get_id_name_row(ItemNumber, 0))]
        
        
        message = f"{'Единицы измерения нет в справочнике. ' if result[0][6] not in measure_list else ''}"\
            f"{'Группы продукции нет в справочнике. ' if result[0][7] not in product_group_list else ''}"\
            f"{'Размера выборки нет в справочнике. ' if (result[0][8] not in sample_size_list if result[0][8] else False) else ''}"\
            f"{'Вида номенклатуры нет в справочнике. ' if (result[0][10] not in item_number_list if result[0][10] else False) else ''}"

        data = {
            "application_id_info": result[0][0],
            "nm_code_info": [_[1] for _ in result] if result[0][1] else [],
            "product_name_info": result[0][2],
            "product_type_info": result[0][3] if result[0][3] else "",
            "ntd_info": result[0][4] if result[0][4] else "",
            "extra_options_info": result[0][5] if result[0][5] else "",
            "measure_info": result[0][6],
            "product_group_info": result[0][7],
            "sample_size_info": result[0][8] if result[0][8] else "",
            "article_group_info": result[0][9],
            "item_number_info": result[0][10],
            "note_info": result[0][11] if result[0][11] else "",
            "comment_info": result[0][12] if result[0][12] else ""
        }

        new_values = find_changed_values(number_asu=result[0][13], new_values=dict([(k.replace("_info", ""), v if v else None) for k, v in data.items()])) if result[0][13] else None

        file_paths = [{"path": path, "attached_file_id": _id} for path, _id in session.query(ApplicationAttachedFile.path,
                                                                                            ApplicationAttachedFile.id).filter(ApplicationAttachedFile.application_id == application_id).all()]
        

    return {
        "status": 200,
        "info": data,
        "message": message,
        "new_changed_values": dict([(f"{k}_info", v) for k, v in new_values["new_changed_values"].items()]) if new_values else None,
        "old_changed_values": dict([(f"{k}_info", v) for k, v in new_values["old_changed_values"].items()]) if new_values else None,
        "file_paths": file_paths
    }


@check_application_exist
def get_application_history(application_id: int) -> dict:
    with session_scope() as session:
        data = session.query(ApplicationStatus.description.label("status_name"),
                             ApplicationHistory.nm_code,
                             ApplicationHistory.product_name,
                             ApplicationHistory.product_type,
                             ApplicationHistory.ntd,
                             ApplicationHistory.extra_options,
                             ApplicationHistory.measure,
                             ApplicationHistory.product_group,
                             ApplicationHistory.sample_size,
                             ApplicationHistory.article_group,
                             ApplicationHistory.note,
                             ApplicationHistory.item_number,
                             ApplicationHistory.comment,
                             func.date_format(ApplicationHistory.datetime, '%Y-%m-%d %T').label("datetime")).\
                                join(ApplicationStatus).filter(ApplicationHistory.application_id == application_id).\
                                    order_by(ApplicationHistory.datetime).all()
    
    return {"status": 200, "values": [dict(row) for row in data]}


def create_application(login: str, values: dict, application_type: int, set_status: int, number_asu: str = None) -> dict:
    """Создание новой заявки"""
    # Проверка прав доступа
    user = application_auth(login).get("user", dict())
    if user.get("access") != "creator":
        return {"status": 400, "message": "Ошибка прав доступа"}

    values = general_filter_dict(values) # общая фильтрация значений

    if application_type == 1:
        # Проверка обязательных аргументов для заявок на добавление
        check_required = check_required_fields(values, ("product_name", "product_type", "ntd","measure", "product_group", "article_group"))
        if check_required:
            return check_required
        
        # фильтрация значений для заявок на добавление
        values = filter_dict(values, 'creator')

        # проверка есть ли такая же заявка на добавление в момент её создания, по определённым полям
        with session_scope() as session:
            exist_application = session.query(ApplicationInfo.product_name,
                                        ApplicationInfo.product_type, 
                                        ApplicationInfo.ntd, 
                                        ApplicationInfo.measure).all()
            
            if (values["product_name"], values["product_type"], values["ntd"], values["measure"]) in exist_application:
                user_name, = session.query(ApplicationUser.full_name).\
                    join(Application, Application.creator_id == ApplicationUser.id).\
                    join(ApplicationInfo, ApplicationInfo.application_id == Application.id).filter(ApplicationInfo.product_name == values["product_name"],
                                                                                                   ApplicationInfo.product_type == values["product_type"],
                                                                                                   ApplicationInfo.ntd == values["ntd"],
                                                                                                   ApplicationInfo.measure == values["measure"]).one()
                return {"status": 400, "message": f'Наименование изделия: "{values["product_name"]}", Тип изделия: "{values["product_type"] or "Отсутствует"}", НТД: "{values["ntd"] or "Отсутствует"}", Единица измерения: "{values["measure"]}" уже существует, создатель: {user_name};<hr>'}

        
            filter_dict_ = [f"{key} LIKE '{value}'" for key, value in values.items() if values.get(key, None) is not None and key in ("product_name",
                                                                                                                                    "product_type",
                                                                                                                                    "ntd",
                                                                                                                                    "measure")]
            
            check_exist_row_in_vktmc = session.query(t_all_rows.c.number_asu).filter(text(f"{' AND '.join(filter_dict_)} AND is_archived = 0")).all()
            
            if check_exist_row_in_vktmc:
                return {"status": 400, 
                        "message": f'Наименование изделия: "{values["product_name"]}", Тип изделия: "{values["product_type"] or "Отсутствует"}", НТД: "{values["ntd"] or "Отсутствует"}", Единица измерения: "{values["measure"]}" уже существует в самом перечне ВКТМЦ под номером АСУ {str(check_exist_row_in_vktmc[0][0]).zfill(7)};<hr>'}

        if values.get("nm_code"):

            # Проверка длинны НМ кода
            for item in values.get("nm_code"):
                if len(str(item)) > 15:
                    return {"status": 400, "message": "Длинна НМ кода больше 15"}
            
            with session_scope() as session:
                existing_nm_codes = [{"number_asu": number_asu, "nm_code": nm_code}
                                     for number_asu, nm_code in session.query(NMCode.number_asu, NMCode.nm_code).
                                     filter(NMCode.nm_code.in_(values["nm_code"])).all()]
            if existing_nm_codes:
                return {"status": 400, "message": "<pre>{}</pre>".
                        format(';\n'.join([f"код по НМ: '{_['nm_code']}' уже принадлежит номеру АСУ: '{str(_['number_asu']).zfill(7)}'"
                                           for _ in existing_nm_codes]))}
    else:
        # Проверка на наличие изменений
        changed_values = find_changed_values(number_asu=number_asu, new_values=values)["new_changed_values"]
        if not changed_values:
            return {"status": 400, "message": "Для отправки заявки необходимо внести изменения!"}
        
        # Проверка кодов по НМ
        if values.get("nm_code"):
            with session_scope() as session:
                data = [f"НМ код {_code} уже принадлежит номеру АСУ {str(_asu).zfill(7)}" for _asu, _code in session.query(NMCode.number_asu, NMCode.nm_code)
                        .filter(NMCode.number_asu != number_asu, NMCode.nm_code.in_(values["nm_code"])).all()]
                if data:
                    return {"status": 400, "message": "<pre>{}</pre>".format("; <br>".join(data))}
        
        # Проверка на существование данной заявки в данный момент
        with session_scope() as session:
            number_asu_and_users = dict([(str(asu).zfill(7), name) for asu, name in session.query(Application.number_asu,
                                                                                                  ApplicationUser.full_name).join(ApplicationUser,
                                                                                                                                  ApplicationUser.id == Application.creator_id).\
                                                                                                                                    filter(Application.number_asu != None,
                                                                                                                                            Application.status_id != 6).all()])
            if number_asu in number_asu_and_users.keys():
                return {"status": 400, "message": f"Заявка на редактирование позиции с номером АСУ: '{number_asu}' уже создана пользователем: {number_asu_and_users[number_asu]}"} 

    
    # тут проверки для фронта if гр.пр. != 2 и бла бла бла
    checks = checks_true_values(values)
    if checks["status"] != 200:
        return checks
    # --//--

    application_id = add_new_application(creator_id=user['id'], values=values, application_type=application_type, number_asu=number_asu, set_status=set_status)

    return {"status": 200, "application_id": application_id}


@check_application_exist
@check_access_edit
def update_application(login: str, application_id: int, new_values: dict, new_status: int) -> dict:
    """
    Изменить значения заявки\n
    Аргументы:\n
    - application_id - id заявки которую хотите обновить\n
    - new_status - новый статус заявки\n
    - values - новые значения\n
      - пример:\n
            "values": {\n
                    "nm_code": [123, 321],\n
                    "product_name": "Трубка термоусаживаемая",\n
                    "product_type": "ТУТ нг-LS-5/2,5",\n
                    "ntd": "ТУ 2247-011-79523310-2006",\n
                    "extra_options": "Черная",\n
                    "measure": "м",\n
                    "product_group": 3,\n
                    "sample_size": null,\n
                    "article_group": "ЭЛТЕХ",\n
                    "item_number": null,\n
                    "note": "Каталог Электротехнический завод КВТ",\n
                    "comment": ""\n
            }\n
    """
    new_values = general_filter_dict(new_values)
    if not new_values:
        return {"status": 400, "message": "Вы не передали параметров"}
    
    # Проверка для ЦМА
    if new_status != 3:
        check_required = check_required_fields(new_values, ("product_name", "measure", "product_group", "article_group"))
        if check_required:
            return check_required
    else:
        check_required = check_required_fields(new_values, ("product_name", "measure", "product_group", "article_group", "item_number"))
        if check_required:
            return check_required
    
    checks = checks_true_values(new_values)
    if checks["status"] != 200:
        return checks
    
    # Добавление или редактирование в перечне ВКТМЦ
    if new_status == 6:
        best_dict = dict()
        best_dict.update(new_values)
        # Зануление полей Тип изделия и НТД при условии Отсутствует или Не требуется
        if str(best_dict.get("product_type")).upper() in ("ОТСУТСТВУЕТ", "НЕ ТРЕБУЕТСЯ"):
            best_dict["product_type"] = None
        
        if str(new_values.get("ntd")).upper() in ("ОТСУТСТВУЕТ", "НЕ ТРЕБУЕТСЯ"):
            best_dict["ntd"] = None
        
        best_dict["nm_code"] = new_values.get("nm_code")
        with session_scope() as session:
            number_asu, = session.query(Application.number_asu).filter(Application.id == application_id).first()
            if number_asu:
                number_pp, control_card = session.query(Vktmc.number_pp, Vktmc.control_card).filter(Vktmc.number_asu == number_asu).one()
                best_dict["number_asu"] = number_asu
                best_dict["number_pp"] = number_pp
                best_dict["control_card"] = control_card
                best_dict.pop("comment")
                check_mistakes = update_vktmc_row_from_application(values=best_dict)
                if check_mistakes["status"] != 200:
                    return check_mistakes
            else:
                check_mistakes = add_application_in_vktmc(application_id, best_dict)
                if check_mistakes["status"] != 200:
                    return check_mistakes

    current_data: dict = general_filter_dict(dict([(k.replace("_info", ""), v) for k, v in get_info_application(application_id=application_id)["info"].items()]))
    current_data.pop("application_id")

    values_for_update = dict([(k, v) for k, v in new_values.items() if current_data[k] != v])
    nm_codes = new_values.pop("nm_code")
    with session_scope() as session:
        # Проверка на доступность изменения поля пользователем
        access = get_access(login)
        block_keys = tuple(k.replace("_info", "") for k, v in GENERAL_STRUCT[access]["available_inputs"].items() if not v)
        if any(_ in block_keys for _ in tuple(values_for_update.keys())):
            return{"status": 400, "message": "Вы изменили неподходящее поле"}

        # Проверка: изменил ли пользователь статус
        current_status, = session.query(Application.status_id).filter(Application.id == application_id).one()
        if current_status == new_status and new_status != 7:
            return{"status": 400, "message": "Для начала назначьте ответственного"}

        # Проверка можно ли отправить в черновики
        if new_status == 7 and session.query(Application.responsible_cma_id).filter(Application.id == application_id).one()[0]:
            return {"status": 400, "message": "Нельзя отправлять в черновик заявка у которой уже есть ответственный в ЦМА"}

        # Проверка: поменялись поля или поменялся статус (user может изменить лишь статус)
        if values_for_update or current_status != new_status:
            # если изменились коды по НМ
            if "nm_code" in values_for_update.keys():
                session.query(ApplicationNmCode).filter(ApplicationNmCode.application_id == application_id).delete(synchronize_session='fetch')
                if values_for_update["nm_code"]:
                    session.add_all([ApplicationNmCode(application_id=application_id,nm_code=nm_code) for nm_code in values_for_update["nm_code"]])
                nm_codes = values_for_update.pop("nm_code")

            session.add(ApplicationHistory(**new_values,
                                    status_id=new_status,
                                    application_id=application_id,
                                    nm_code="; ".join(list(map(str, nm_codes)))
                                    if nm_codes else None))
        # если ещё что-то изменилось кроме кодов по нм
        # если next ступень
        if new_status in (1, 3, 6) and current_status != 8:
            values_for_update["comment"] = None
        
        if values_for_update:
            session.query(ApplicationInfo).filter(ApplicationInfo.application_id == application_id).update(values_for_update)

        # изменить статус, если сюда дошло, то статус точно отличается из-за проверки выше
        session.query(Application).filter(Application.id == application_id).update({"status_id": new_status})
    
    return {"status": 200}


def get_all_responsible(login: str) -> dict:
    """Получить список ответственных"""
    access = get_access(login)
    if access not in ("tb_admin", "cma_admin"):
        return {"status": 400, "message": "У вас нет прав на данный запрос"}
    with session_scope() as session:
        if access == "cma_admin":
            data = session.query(ApplicationUser.full_name, func.count(Application.responsible_cma_id)).\
                        outerjoin(Application, ApplicationUser.id == Application.responsible_cma_id).\
                        filter(ApplicationUser.access == "cma_redactor").group_by(ApplicationUser.full_name).all()
        elif access == "tb_admin":
            data = session.query(ApplicationUser.full_name, func.count(Application.responsible_tb_id)).\
                        outerjoin(Application, ApplicationUser.id == Application.responsible_tb_id).\
                        filter(ApplicationUser.access == "tb_redactor").group_by(ApplicationUser.full_name).all()
    
    return {"status": 200, "responsible_list": [{"value": full_name, "option_text": f"{full_name} ({count})"} for full_name, count in data]}


def appoint_responsible(login: str, fio: str, application_ids: list) -> dict:
    """Назначить ответственного"""
    if not fio or not application_ids:
        return {"status": 400, "message": "Не передано необходимые параметры"}

    access = get_access(login)
    if access not in ("tb_admin", "cma_admin"):
        return {"status": 400, "message": "У вас нет прав на данный запрос"}
    try:
        application_ids = list(map(int, application_ids))
    except ValueError as e:
        return {"status": 400, "message": "Фатальная ошибка. Не удалось перевести строку '{}' в int".format(e.args[0].split("'")[1])}
    
    with session_scope() as session:
        application_statuses = dict(session.query(Application.id, Application.status_id).filter(Application.id.in_(application_ids)).all())
        if 7 in application_statuses.values():
            return {"status": 400, "message": "Заявитель вернул некоторые заявки в черновик. Обновите страницу для актуализации информации"}

        user_id, = session.query(ApplicationUser.id).filter(ApplicationUser.full_name == fio).one()

        session.query(Application).filter(Application.id.in_(application_ids)).\
                                   update({"responsible_cma_id" if access == "cma_admin" else "responsible_tb_id" : user_id})
    
    
    return {"status": 200}


def return_draft(login: str, application_id: int) -> dict:
    with session_scope() as session:
        application: Application = session.query(Application).get(application_id)
        creator_login, = session.query(ApplicationUser.login).filter(ApplicationUser.login == login).one()
        
        if login != creator_login:
            return {"status": 400, "message": "Заявка принадлежит не вам"}
        
        if application.responsible_cma_id:
            return {"status": 400, "message": "Ответственный уже назначен, вернуть заявку нельзя!"}

        application.status_id = 7
    
    return {"status": 200}


def create_many_application_from_draft(application_id_list: list) -> dict:
    """Отправить черновики в ЦМА"""
    try:
        application_id_list = list(map(int, application_id_list))
    except ValueError:
        return {"status": 400, "message": "Неверные данные в списке application_ids (Невозможно перевести все значения в int)"}
    
    with session_scope() as session:
        session.query(Application).filter(Application.id.in_(application_id_list)).update({"status_id": 1})

    return {"status": 200}


def delete_many_application_from_draft(application_id_list: list, login: str) -> dict:
    """Удалить черновики"""
    try:
        application_id_list = list(map(int, application_id_list))
    except ValueError:
        return {"status": 400, "message": "Неверные данные в списке application_ids (Невозможно перевести все значения в int)"}
    
    
    with session_scope() as session:
        # Общая проверка на правильность, выгруженные данные должны соответствовать переданным
        if not set(application_id_list) == {_ for _, in session.query(Application.id).join(ApplicationUser,
                                                                                           Application.creator_id == ApplicationUser.id).filter(Application.id.in_(application_id_list),
                                                                                                                                                ApplicationUser.login == login,
                                                                                                                                                Application.status_id == 7).all()}:
            return {"status": 400, "message": "Некорректные данные"}

        session.query(Application).filter(Application.id.in_(application_id_list)).delete()

    return {"status": 200}


def load_application_from_file(login: str, file) -> dict:
    """Функция загрузки заявок из файла"""
    file_type: str = file.filename.split(".")[-1]
    file_name = file.filename

    if file_type.lower() in ("xlsx"):
        if not os.path.exists("files_draft"):
            os.mkdir("files_draft")
        file.save(f"files_draft/{file_name}")

        wb = openpyxl.load_workbook(f"files_draft/{file_name}")
        sheet = wb.active
        error_message = ''
        for index, item in enumerate(list(sheet)[1:], 2):
            try:
                values = {
                    "nm_code": list(map(int, str(item[0].value).strip().split(";"))) if item[0].value else [],
                    "product_name": str(item[1].value).strip() if item[1].value else None,
                    "product_type": str(item[2].value).strip() if item[2].value else None,
                    "ntd": str(item[3].value).strip() if item[3].value else None,
                    "extra_options": str(item[4].value).strip() if item[4].value else None,
                    "measure": str(item[5].value).strip() if item[5].value else None,
                    "product_group": int(item[6].value) if item[6].value else None,
                    "sample_size": str(item[7].value).strip() if item[7].value else None,
                    "article_group": str(item[8].value).strip() if item[8].value else None,
                    "note": str(item[9].value).strip() if item[9].value else None,
                    "item_number": None,
                    "comment": None
                }
                
                action = create_application(login=login, values=values, application_type=1, set_status=7)
                if action["status"] != 200:
                    error_message += f'Строка {index} в файле содержит следующие ошибки: {action["message"].replace("<hr>", "")} Заявка не создана<hr>'
            
            except (TypeError, ValueError) as e:
                return {"status": 400,
                        "message": "</br>".join([f"Фатальная ошибка в строке {index}.",
                                                 "Невозможно преобразовать значение '{}' в число".format(e.args[0].split("'")[1]),
                                                 f"Информация до {index} строки была занесена в черновики.",
                                                 "Считывание файла прервано!"
                                                 ])
                        }

        os.remove(f"files_draft/{file_name}")
        return {"status": 200, "message": error_message if error_message else None}
    else:
        return {"status": 400, "message": f'Неверный формат файла: "{file_type}", загружайте "xlsx"'}


@check_application_exist
def create_attached_files(login: str, files: list, application_id: int) -> dict:
    """Функция для сохранения прикреплённых файлов"""
    
    dir_name = "attached_files"
    if not os.path.exists(f"../application/{dir_name}"):
        os.mkdir(f"../application/{dir_name}")
    
    file_name_list = []
    for file in files:
        file.save(f"../application/{dir_name}/{file.filename}")
        file_name_list.append(file.filename)
    
    with session_scope() as session:
        session.add_all([ApplicationAttachedFile(application_id=application_id, path=f'{dir_name}/{file_name}') for file_name in file_name_list])

    
    return {"status": 200}


def delete_attached_files(attached_file_id: int) -> dict:
    """Функция для удаления прикреплённых файлов"""
    with session_scope() as session:
        attached_file: ApplicationAttachedFile = session.query(ApplicationAttachedFile).get(attached_file_id)
        if not attached_file:
            return {"status": 404, "message": f'Прикреплённый файл с id: "{attached_file_id}" не найден!'}

        file_path = f"../application/{attached_file.path}"
        if os.path.exists(file_path):
            os.remove(file_path)
            session.delete(attached_file)
        else:
            return {"status": 404, "message": f'файл "{attached_file.path.replace("attached_files/", "")} не найден!"'}

    # if not os.path.exists(f"../application/{dir_name}"):
    #     os.mkdir(f"../application/{dir_name}")

    
    return {"status": 200}