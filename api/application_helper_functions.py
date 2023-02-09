from functions_get import filter_row, get_last_row
from models import Application, ApplicationComparison, ApplicationHistory, ApplicationInfo, ApplicationNmCode, ApplicationUser
from functions import add_vktmc_row, delete_nm_code, update_vktmc_row
from my_engine import session_scope
from helper_functions import RU_ROW_NAME


# Структура страницы в зависимости от прав доступа
GENERAL_STRUCT = {
    "creator": {
        "available_inputs": {
            "application_id_info": False,
            "nm_code_info": True,
            "product_name_info": True,
            "product_type_info": True,
            "ntd_info": True,
            "extra_options_info": True,
            "measure_info": True,
            "product_group_info": True,
            "sample_size_info": True,
            "article_group_info": True,
            "item_number_info": False,
            "note_info": True,
            "comment_info": False
        },
        "send_buttons": [
            {
                "id": "create_draft",
                "set_status": 7,
                "inner_text": "Сохранить черновик"
            },
            {
                "id": "send_in_cma",
                "set_status": 1,
                "inner_text": "Отправить в ЦМА"
            }
        ],
        "set_responsible": False
    },
    "cma_redactor": {
        "available_inputs": {
            "application_id_info": False,
            "nm_code_info": True,
            "product_name_info": True,
            "product_type_info": True,
            "ntd_info": True,
            "extra_options_info": True,
            "measure_info": True,
            "product_group_info": False,
            "sample_size_info": False,
            "article_group_info": True,
            "item_number_info": True,
            "note_info": True,
            "comment_info": True
        },
        "send_buttons": [
            {
                "id": "send_in_departament",
                "set_status": 2,
                "inner_text": "Отправить в подразделение"
            },
            {
                "id": "send_in_tb",
                "set_status": 3,
                "inner_text": "Отправить в ТБ"
            },
        ],
        "set_responsible": False
    },
    "cma_admin": {
        "available_inputs": {
            "application_id_info": False,
            "nm_code_info": False,
            "product_name_info": False,
            "product_type_info": False,
            "ntd_info": False,
            "extra_options_info": False,
            "measure_info": False,
            "product_group_info": False,
            "sample_size_info": False,
            "article_group_info": False,
            "item_number_info": False,
            "note_info": False,
            "comment_info": False
        },
        "send_buttons": None,
        "set_responsible": True
    },
    "tb_admin": {
        "available_inputs": {
            "application_id_info": False,
            "nm_code_info": False,
            "product_name_info": False,
            "product_type_info": False,
            "ntd_info": False,
            "extra_options_info": False,
            "measure_info": False,
            "product_group_info": True,
            "sample_size_info": True,
            "article_group_info": False,
            "item_number_info": False,
            "note_info": False,
            "comment_info": True
        },
        "send_buttons": [
            {
                "id": "send_in_tb",
                "set_status": 3,
                "inner_text": "Отправить редактору ТБ"
            },
            {
                "id": "add_to_vktmc",
                "set_status": 6,
                "inner_text": "Добавить в ВКТМЦ"
            }
        ],
        "set_responsible": True
    },
    "tb_redactor": {
        "available_inputs": {
            "application_id_info": False,
            "nm_code_info": False,
            "product_name_info": False,
            "product_type_info": False,
            "ntd_info": False,
            "extra_options_info": False,
            "measure_info": False,
            "product_group_info": True,
            "sample_size_info": True,
            "article_group_info": False,
            "item_number_info": False,
            "note_info": False,
            "comment_info": True
        },
        "send_buttons": [
            {
                "id": "send_in_departament",
                "set_status": 5,
                "inner_text": "Отправить в подразделение"
            },
            {
                "id": "send_in_cma",
                "set_status": 4,
                "inner_text": "Отправить в ЦМА"
            },
            {
                "id": "send_in_tb_admin",
                "set_status": 8,
                "inner_text": "Отправить админу ТБ"
            }
        ],
        "set_responsible": False
    }
}


def check_required_fields(values: dict, required_keys: tuple):
    """
    Проверка обязательных полей
    False - Всё хорошо
    True - Всё плохо
    """
    check_list = [repr(RU_ROW_NAME.get(key)) for key in required_keys if not values.get(key)]
    if check_list:
        return {"status": 400, "message": f'Пожалуйста заполните следующие поля: {", ".join(check_list)}'}
    else:
        return False


def general_filter_dict(dict_: dict) -> dict:
    """Фильтрация словаря. Превращает булевы нули в None и isdigit в int"""
    return {k: (int(v) if k in ("product_group", "item_number") else (v if type(v) == list else str(v).strip())) if v else None for k, v in dict_.items()}


def filter_dict(dict_: dict, access: str) -> dict:
    """
    Фильтрация словаря в зависимости от прав доступа.\n
    Превращает булевы нули в None (0, [], "", False и т.д.).\n
    Оставляет в словаре только те ключи которые должны быть у данных прав доступа
    """
    return {k: v for k, v in general_filter_dict(dict_).items() if GENERAL_STRUCT[access]["available_inputs"][f"{k}_info"]}


def add_new_application(creator_id: int, values: dict, application_type: int, set_status:int, number_asu: int = None) -> None:
    """
    Создание новой заявки со статусом - "Обработка заявки в ЦМА (1)"\n
    application_type:\n
        1 - Заявка на добавление записи;\n
        2 - Заявка на редактирование записи\n
    Возвращает id новой заявки
    """
    with session_scope() as session:
        new_application = Application(status_id=set_status, creator_id=creator_id, type_id=application_type, number_asu=number_asu)
        session.add(new_application)
        session.commit()

        if values.get("nm_code"):
            session.add_all([ApplicationNmCode(application_id=new_application.id, nm_code=nm_code)
                             for nm_code in values["nm_code"]])

        nm_codes = values.pop("nm_code", None) # Удаляем нм код для добавления в AppInfo и сохраняем его для логов
        nm_codes = "; ".join(list(map(str, nm_codes))) if nm_codes else None
        
        values["application_id"] = new_application.id

        session.add_all([ApplicationInfo(**values),
                         ApplicationHistory(**values, status_id=new_application.status_id, nm_code=nm_codes)])
    return values["application_id"]


def get_list_application_completed() -> list:
    """Получить список словарей заявок добавленных в ВКТМЦ\n"""
    with session_scope() as session:
        data = [{
            "application_id": _.id,
            "fio": _.creator.full_name,
            "departament": _.creator.departament,
            "status": _.status.description,
            "type": f"{_.type.name} №{str(_.number_asu).zfill(7)}" if _.number_asu else _.type.name,
            "responsible_cma": _.responsible_cma.full_name if _.responsible_cma else "",
            "responsible_tb": _.responsible_tb.full_name if _.responsible_tb else ""
    } for _ in session.query(Application).filter(Application.status_id == 6).all()]
    return data


def get_list_application(statuses: tuple, responsible: Application) -> list:
    """
    Получить список словарей заявок для определённого права доступа\n
    responsible передаётся с параметром поиска например:\n
    get_list_application(statuses=(1, 2, 3, 4, 5), responsible=Application.responsible_cma_id.like("%%"))
    """
    with session_scope() as session:
        data = [{
            "application_id": _.id,
            "fio": _.creator.full_name,
            "departament": _.creator.departament,
            "status": _.status.description,
            "type": f"{_.type.name} №{str(_.number_asu).zfill(7)}" if _.number_asu else _.type.name,
            "responsible_cma": _.responsible_cma.full_name if _.responsible_cma else "",
            "responsible_tb": _.responsible_tb.full_name if _.responsible_tb else ""
        } for _ in session.query(Application).filter(Application.status_id.in_(statuses), responsible).all()]

    return data


def get_access(login: str) -> str:
    """Получить значение прав доступа"""
    with session_scope() as session:
        access, = session.query(ApplicationUser.access).filter(ApplicationUser.login == login).one()
    return access


def add_application_in_vktmc(application_id: int, values: dict) -> dict:
    """Формирование структуры для отправки в перечень"""
    last_number_pp = get_last_row()
    last_number_pp.pop("status")
    values.update(last_number_pp)
    values["control_card"] = None
    NM_code = values.pop("nm_code")
    values["NM_code"] = NM_code if NM_code else []
    values.pop("comment")
    with session_scope() as session:
        creator_login = (session.query(Application).filter(Application.id == application_id).one()).creator.login
    
    return add_vktmc_row(login="molchanov-av", value_dict=values)


def update_vktmc_row_from_application(values: dict) -> dict:
    check_update = update_vktmc_row(value_dict=values, login="molchanov-av", ip="1.1.1.1")
    if check_update["status"] == 200:
        return delete_nm_code(nm_code=values["nm_code"], number_asu=values["number_asu"])
    else:
        return check_update


def check_application_exist(func):
    """
    Декоратор на проверку существования заявки.\n
    Обязательные аргументы:\n
    - application_id: int
    """
    def inner(*args, **kwargs):
        application_id = kwargs.get("application_id")

        with session_scope() as session:
            application: Application = session.query(Application).get(application_id)
            if not application:
                return {"status": 404, "message": f"Заявка с номером {application_id} не найдена"}

        return func(*args, **kwargs)
    return inner


def check_access_edit(func):
    """
    Декоратор на проверку прав доступа к редактированию\n
    Обязательные аргументы:\n
    - application_id: int
    - login: str
    """
    def inner(*args, **kwargs):
        application_id = kwargs.get("application_id")
        login = kwargs.get("login")

        available_statuses = {
            "creator": (2, 5, 7),
            "cma_redactor": (1, 4),
            "tb_redactor": (3, ),
            "tb_admin": (8, 3)
        }

        with session_scope() as session:
            status: Application = session.query(Application).get(application_id).status_id
            access = session.query(ApplicationUser.access).filter(ApplicationUser.login == login).one()[0]
            if status not in available_statuses.get(access, ()):
                return {"status": 400, "message": "В данный момент у вас нет прав на редактирование этой заявки"}

        return func(*args, **kwargs)
    return inner


def find_changed_values(number_asu: str, new_values: dict) -> dict:
    """
    Функция для нахождения изменённых значений\n
    Обязательные аргументы:\n
    - number_asu: str
    - new_values: dict
      - new_values = {'article_group': 'ПС',
                      'comment': None,
                      'extra_options': None,
                      'item_number': 3,
                      'measure': 'шт',
                      'nm_code': [11107641,
                                  11112097],
                      'note': None,
                      'ntd': 'ТУ 16-536.628-80',
                      'product_group': 1,
                      'product_name': 'Автоматизированная система управления',
                      'product_type': 'АСУ-400У2',
                      'sample_size': None}
    """
    old_values = filter_row(number_asu=str(number_asu).zfill(7), sort_name='number_pp', sort_by='ASC')['vktmc_row'][0]
    new_changed_values = dict([(k, v) for k, v in new_values.items() if k in old_values.keys() and v != old_values[k]])
    return {
        "new_changed_values": new_changed_values,
        "old_changed_values": dict([(k, v) for k, v in old_values.items() if k in new_changed_values.keys()])
        }


def checks_true_values(values: dict) -> dict:
    """Функция с необходимыми "мелкими" проверками"""
    # Дефолтное значение размера выборки (должно быть "10 %")
    if values.get("product_group") == 2 and not values.get("sample_size"):
        values["sample_size"] = "10 %"
    
    # Проверка соответствия группы продукции и размера выборки
    if values.get("product_group") != 2 and values.get("sample_size"):
        return {'status': 400, 'message': 'Ошибка соответствия Группы продукции и Размера выборки'}
    
    # Проверка на правильность группы продукции
    if values.get("product_group") not in (1, 2, 3):
        return {'status': 400, 'message': 'Неверная Группа продукции (Группа продукции должна быть 1, 2 или 3)'}

    # Проверка соответствия группы продукции и вида номенклатуры
    if values.get("item_number") == 3 and values.get("product_group") != 1:
        return {'status': 400, 'message': 'Ошибка соответствия Группы продукции и Вида номенклатуры'}

    # Проверка на правильность группы продукции
    if values.get("product_group") not in (1, 2, 3):
        return {'status': 400, 'message': 'Неверная Группа продукции (Группа продукции должна быть 1, 2 или 3)'}
    
    return {"status": 200}


def check_access_comparison(func):
    """
    Декоратор на проверку доступа к функциям сравнения заявок.\n
    Пропускает только если access in ("cma_redactor", "cma_admin").\n
    Обязательные аргументы:\n
    - login: str
    """
    def inner(*args, **kwargs):
        login = kwargs.get("login")

        with session_scope() as session:
            access, = session.query(ApplicationUser.access).filter(ApplicationUser.login == login).one()
        
        if access in ("cma_redactor", "cma_admin"):
            return func(*args, **kwargs)
        else:
            return {"status": 400, "message": "У вас нет доступа к функциям сравнения строк"}
    
    return inner


def check_comparison_row_exist(func):
    """
    Декоратор на проверку существования строки в сравнительной таблице.\n
    Обязательные аргументы:\n
    - comparison_id: int
    """
    def inner(*args, **kwargs):
        comparison_id = kwargs.get("comparison_id")

        with session_scope() as session:
            comparison = session.query(ApplicationComparison).get(comparison_id)
        
        if comparison:
            return func(*args, **kwargs)
        else:
            return {"status": 404, "message": f"Строки с id = {comparison_id} не найдена в сравнительной таблице"}
    
    return inner
