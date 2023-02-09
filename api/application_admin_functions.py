from active_directory import get_user_by_login
from models import ApplicationUser
from my_engine import session_scope


def check_application_admin(func):
    """
    Декоратор на проверку доступности к данным функциям.

    Обязательные аргументы:
    - login: str
    """
    def inner(*args, **kwargs):
        login = kwargs.get("login")
        with session_scope() as session:       
            user = session.query(ApplicationUser).filter(
                ApplicationUser.login == login).one_or_none()
            if user is not None:    
                if user.access in ('cma_admin','cma_redactor'):
                    try:
                        return func(*args, **kwargs)
                    except TypeError as e:
                        return {"status": 404, "message" :f"Error! {e}"}
                else:
                    return {"status": 400, "message": "Нет прав доступа"}
            else:
                return{"status":404,"message":"Пользователь не найден"}
    return inner


@check_application_admin
def get_all_access(login: str) -> dict:
    """
    Функция для получения списка возможных прав доступа к ресурсу.
    
    Обязательные аргументы:
    - login: str
    """
    access_list = ["creator", "cma_admin", "cma_redactor", "tb_admin", "tb_redactor"]
    return {"status": 200, "access_list": access_list} if access_list else {"status": 404, "message": "Права доступа не найдены!"}


@check_application_admin
def get_all_users(login: str) -> dict:
    """
    Функция отдаёт список пользователей

    Обязательные аргументы:
    - login: str
    """
    with session_scope() as session:
        users_list = session.query(ApplicationUser).all()
        return {"status": 200, "all_users": [{"id": _.id, 
                                              "login": _.login, 
                                              "email": _.email, 
                                              "full_name": _.full_name, 
                                              "access": _.access, 
                                              "department": _.departament} for _ in users_list]} if users_list else ({"status": 404, 
                                                                                                                      "message": "Пользователи не найдены"})


@check_application_admin
def create_new_users(login: str, new_users: dict) -> dict:
    """
    Функция создаёт новых пользователей

    Обязательные аргументы:
    - login: str
    - new_users: dict
    """
    all_users = [_.get("login") for _ in get_all_users(login = login)['all_users']]
    all_access = get_all_access(login = login)['access_list']
    
    user_info = []
    for user in new_users['new_users']:
        if user['access'] not in all_access:
            return({"status": 404, "message": f"Не существует прав доступа {user['access']}"})
        
        if user['login'] in all_users:
            return ({'status': 400, 'message': f'{user["login"]} уже есть в БД'})
        
        AD_user_info = get_user_by_login(user['login'])
        # AD_user_info = {
        #     "ad_user": user['login'],
        #     "email": f"{user['login']}@mosmetro.ru",
        #     "fio": f"{user['login']}",
        #     "company": "google"
        # }
        user_info.append({
            "login": AD_user_info["ad_user"],
            "email": AD_user_info["email"],
            "full_name": AD_user_info["fio"],
            "departament": AD_user_info["company"],
            "access": user['access']
        })
    
    with session_scope() as session:
        session.add_all([ApplicationUser(**_) for _ in user_info])
    
    return({'status':200})


@check_application_admin
def update_new_user(login: str, update_user_login: str, access: str) -> dict:
    """
    Функция изменяет права пользователя

    Обязательные аргументы:
    - login: str
    - update_user_login: str
    - access: str
    """
    with session_scope() as session:
        user = session.query(ApplicationUser).filter(ApplicationUser.login == update_user_login)
        user_data = user.one_or_none()
        
        if user_data.login == login:
            return {"status": 400, "message": "Нельзя менять себе права доступа"}
        
        if user_data is not None:
            if access in get_all_access(login = login)['access_list'] and access != user_data.access:
                user_data = {
                    "access" : access
                }
                user.update(user_data, synchronize_session=False)
                return {"status": 200, "message" : "Данные обновлены"}
            else:
                return{'status':400, 'message':'Заданы неверные права доступа или уже установлены права'}
        else:
            return {"status": 404, "message" : "Пользователь не найден"}


@check_application_admin
def find_user(login: str, find_login: str) -> dict:
    """
    Функция для поиска пользователя в AD

    Обязательные аргументы:
    - login: str
    - find_login: str
    """
    def check_letters(find_login: str):
        for letter in find_login:
            code = ord(letter)
            return not(1040 < code < 1103) and code != 1025 and code != 1105

    if check_letters(find_login):
        try:
            AD_user_info = get_user_by_login(find_login)
        except:
            return {"status": 404, "message": f"{find_login} - нет в AD"}
        # AD_user_info = {
        #     "ad_user": find_login,
        #     "email": f"{find_login}@mosmetro.ru",
        #     "fio": f"{find_login}",
        #     "company": "google"
        # }
        if AD_user_info is not None:
            return ({"status": 200, "user_info": {"login": AD_user_info["ad_user"],
                                                  "email": AD_user_info["email"],
                                                  "full_name": AD_user_info["fio"],
                                                  "departament": AD_user_info["company"]}})
        else:
            return ({"status": 404, "message": f"{find_login} - нет в AD"})

    else:
        return({"status": 400, "message": "Неверный формат ввода логина"})


@check_application_admin
def delete_user(login: str, delete_user_login: str) -> dict:
    """
    Функция для удаления пользователя

    Обязательные аргументы:
    - login: str
    - delete_user_login: str    
    """
    with session_scope() as session:
        try:
            if session.query(ApplicationUser).filter(ApplicationUser.login == delete_user_login).delete():
                return({"status": 200, "message": f"Пользователь {delete_user_login} удалён"})
        except:
            return {"status": 400, "message": "У данного сотрудника есть заявки, его нельзя удалить"}
        return({"status": 404, "message": f"Пользователя {delete_user_login} нет в БД"})
