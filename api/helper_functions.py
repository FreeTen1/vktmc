from datetime import datetime
import pytz
from my_sql import my_sql

DB_VKTMC = my_sql()

QUERY_INSERT_DICT = {
    'measure': "INSERT INTO `measure`(`name`) VALUES ('{}')", 
    'measure_check': "SELECT COUNT(*) FROM `measure` WHERE `name` = '{}'", 
    'product_group': "INSERT INTO `product_group`(`id`, `name`) VALUES ('{}', '{}')", 
    'item_number': "INSERT INTO `item_number`(`id`, `name`) VALUES ('{}', '{}')",
    'sample_size': "INSERT INTO `sample_size`(`name`) VALUES ('{}')"
    # 'article_group': "INSERT INTO `article_group`(`name`, `description`) VALUES ('{}', '{}')"
}
QUERY_DELETE_DICT = {
    'measure': "UPDATE `measure` SET `is_archived` = 1 WHERE `name` = '{}'", 
    'product_group': "UPDATE `product_group` SET `is_archived` = 1 WHERE `id` = '{}'", 
    'item_number': "UPDATE `item_number` SET `is_archived` = 1 WHERE `id` = '{}'",
    'sample_size': "UPDATE `sample_size` SET `is_archived`= 1 WHERE `name` = '{}'"
    # 'article_group': "DELETE FROM `article_group` WHERE `name` = '{}'"
}
QUERY_COME_BACK_DICT = {
    'measure': "UPDATE `measure` SET `is_archived` = 0 WHERE `name` = '{}'", 
    'product_group': "UPDATE `product_group` SET `is_archived` = 0 WHERE `id` = '{}'", 
    'item_number': "UPDATE `item_number` SET `is_archived` = 0 WHERE `id` = '{}'",
    'sample_size': "UPDATE `sample_size` SET `is_archived` = 0 WHERE `name` = '{}'"
    # 'article_group': "DELETE FROM `article_group` WHERE `name` = '{}'"
}
RU_ROW_NAME = {
    'number_pp': '№ п/п', 
    'number_asu': '№ АСУ-Метро', 
    'nm_code': 'Код по НМ', 
    'product_name': 'Наименование изделия', 
    'product_type': 'Тип продукции', 
    'ntd': 'НТД (№ чертежа, ГОСТ, ОСТ, ТУ и т.п.)', 
    'extra_options': 'Доп. параметры (сорт, размер, вес, рост, класс точности и др.)', 
    'measure': 'Единица измерения', 
    'product_group': 'Группа продукции', 
    'sample_size': 'Размер выборки, %', 
    'control_card': 'Карта контроля', 
    'article_group': 'Группа изделия', 
    'note': 'Примечание', 
    'item_number': 'Вид номенклатуры'
}


def is_empty(query):
    """
    Ф-ция для проверки на существование строк в запросе
    если пусто вернёт True
    если не пусто вернёт False
    """
    data = DB_VKTMC.select(query)
    return not bool(data)


def add_product_type_row(product_type_name):
    """
    Добавить в таблицу product_type
    """
    DB_VKTMC.insert(f"INSERT INTO `product_type`(`name`) VALUES ('{product_type_name}')")


def add_product_name_row(product_name, product_type_name=None):
    """
    Добавить в таблицу product_name
    """
    if product_type_name:
        DB_VKTMC.insert(f"INSERT INTO `product_name`(`name`, `product_type_id`) VALUES ('{product_name}', (SELECT `id` FROM `product_type` WHERE BINARY `name` = '{product_type_name}'))")
    else:
        DB_VKTMC.insert(f"INSERT INTO `product_name`(`name`, `product_type_id`) VALUES ('{product_name}', NULL)")


def add_ntd_row(ntd_name):
    """
    Добавить в таблицу ntd
    """
    ntd_name = str(ntd_name).replace('\\', '\\\\').replace("'", "\\'").strip()
    DB_VKTMC.insert(f"INSERT INTO `ntd`(`name`) VALUES ('{ntd_name}')")


def add_measure_row(measure_name):
    """
    Добавить в таблицу measure
    """
    measure_name = str(measure_name).replace('\\', '\\\\').replace("'", "\\'").strip()
    DB_VKTMC.insert(f"INSERT INTO `measure`(`name`) VALUES ('{measure_name}')")


def add_sample_size_row(sample_size_name):
    """
    Добавить в таблицу sample_size
    """
    sample_size_name = str(sample_size_name).replace('\\', '\\\\').replace("'", "\\'").strip()
    DB_VKTMC.insert(f"INSERT INTO `sample_size`(`name`) VALUES ('{sample_size_name}')")


def make_row_from_data(data):
    result = {}
    for row in data:
        if row[0] not in result.keys():
            result[row[0]] = {
                "number_pp": row[0],
                "number_asu": str(row[1]).zfill(7),
                "nm_code": [row[2]] if row[2] else None,
                "product_name": row[3],
                "product_type": row[4] if row[4] else None,
                "ntd": row[5] if row[5] else None,
                "extra_options": row[6] if row[6] else None,
                "measure": row[7],
                "product_group": row[8],
                "sample_size": row[9] if row[9] else None,
                "control_card": row[10] if row[10] else None,
                "article_group": row[11] if row[11] else None,
                "note": row[12] if row[12] else None,
                "item_number": row[13]
            }
        else:
            result[row[0]]['nm_code'].append(row[2])
    return list(result.values())


def make_row_from_data_control_card(data):
    result = {}
    for row in data:
        if row[0] not in result.keys():
            result[row[0]] = {
                "number_pp": row[0],
                "number_asu": str(row[1]).zfill(7),
                "nm_code": [row[2]] if row[2] else None,
                "product_name": row[3],
                "product_type": row[4] if row[4] else None,
                "ntd": row[5] if row[5] else None,
                "extra_options": row[6] if row[6] else None,
                "measure": row[7],
                "product_group": row[8],
                "sample_size": row[9] if row[9] else None,
                "control_card": row[10] if row[10] else None,
                "article_group": row[11] if row[11] else None,
                "note": row[12] if row[12] else None,
                "item_number": row[13],
                "file_name_control_card": row[14] if row[14] else None
            }
        else:
            result[row[0]]['nm_code'].append(row[2])
    return list(result.values())


# Декоратор на проверку прав пользователя
def access_dec(func):
    def inner(*args, **kwargs):
        if not kwargs.get('login', None):
            return {'status': 400, 'message': 'Пользователь не передан в качестве аргумента!'}
        user_access = DB_VKTMC.selectOne(f"SELECT `access` FROM `users` WHERE `login` = '{kwargs['login']}'")
        if user_access:
            user_access = user_access[0]
        else:
            return {'status': 400, 'message': 'Пользователь не найден в базе данных!'}
        if user_access == 'admin':
            return func(*args, **kwargs)
        else:
            return {'status': 400, 'message': 'Ошибка прав доступа!'}
    return inner


# Декоратор сохранения лога редактирования строки
def save_edit_dec(func):
    def inner(*args, **kwargs):
        user_id = DB_VKTMC.selectOne(f"SELECT `id` FROM `users` WHERE `login` = '{kwargs['login']}'")
        if user_id:
            user_id = user_id[0]
        else:
            return {'status': 400, 'message': 'Пользователь не найден в базе данных!'}
        query = f"""
        SELECT 
            vktmc.number_pp, 
            vktmc.number_asu, 
            NM_code.nm_code AS 'Код по НМ', 
            product_name.name as 'Наименование изделия', 
            product_type.name as 'Тип изделия', 
            ntd.name as 'НТД', 
            extra_options, 
            measure.name as 'Единица измерения', 
            vktmc.product_group AS 'Группа продукции', 
            sample_size.name AS 'Размер выборки, %', 
            control_card, 
            article_group.name as 'Группа изделия', 
            note, 
            item_number AS 'Вид номенклатуры'

        FROM `vktmc`

        LEFT JOIN NM_code ON NM_code.number_asu = vktmc.number_asu
        JOIN product_name ON product_name.id = vktmc.product_name
        LEFT JOIN product_type ON product_type.id = product_name.product_type_id
        LEFT JOIN ntd ON ntd.id = vktmc.ntd
        JOIN measure ON measure.id = vktmc.measure
        LEFT JOIN sample_size ON sample_size.id = vktmc.sample_size
        LEFT JOIN article_group ON article_group.id = vktmc.article_group
        WHERE vktmc.number_asu = {kwargs['value_dict']['number_asu']}
        """
        old_row = make_row_from_data(DB_VKTMC.select(query))[0]
        new_row = {key.lower(): ([int(nm_code) for nm_code in value] if value else None) if type(value) == type(list()) else (None if not value else (int(value) if str(value).isdigit() else value)) for key, value in kwargs["value_dict"].items()}
        
        change_list = [{"row_name": key, "ru_row_name": RU_ROW_NAME[key], "old_value": old_row[key], "new_value": new_row[key]} for key in old_row.keys() if old_row[key] != new_row[key] and key != 'number_asu']
        
        query_list = [f"({user_id}, '{kwargs['ip']}', {int(kwargs['value_dict']['number_pp'])}, '{_['row_name']}', '{_['ru_row_name']}', {(repr(_['old_value']) if type(_['old_value']) != type(list()) else repr('; '.join(str(nm_code) for nm_code in _['old_value']))) if _['old_value'] else 'NULL'}, {(repr(_['new_value']) if type(_['new_value']) != type(list()) else repr('; '.join(str(nm_code) for nm_code in _['new_value']))) if _['new_value'] else 'NULL'}, '{datetime.now(pytz.timezone('Europe/Moscow')).strftime('%Y-%m-%d %H:%M:%S')}')" for _ in change_list]
        if not query_list:
            return {'status': 400, 'message': 'Вы ничего не отредактировали'}
        
        if DB_VKTMC.insert(f"INSERT INTO `logs_change_rows`(`user_id`, `comp_ip`, `number_pp`, `row_name`, `ru_row_name`, `old_value`, `new_value`, `datetime_edit`) VALUES {', '.join(query_list)}"):
            return func(*args, **kwargs)
        else: 
            return {'status': 400, 'message': 'Логирование не прошло!'}

    return inner


# Декоратор сохранения лога выгрузки отчётов
def save_report_dec(func):
    def inner(*args, **kwargs):
        result_func = func(*args, **kwargs)
        if result_func['status'] == 200:
            user_id = DB_VKTMC.selectOne(f"SELECT `id` FROM `users` WHERE `login` = '{kwargs['login']}'")
            if user_id:
                user_id = user_id[0]
            else:
                return {'status': 400, 'message': 'Пользователь не найден в базе данных!'}
            info_dict = {key: value for key, value in kwargs.items() if value and key != 'path_save' and key != 'login' and key != 'ip' and key != 'is_filter'}
            
            if func.__name__ == 'get_excel_file_vktmc':
                values = f"({user_id}, '{kwargs['ip']}', '{'Выгрузка с фильтрацией' if kwargs.get('is_filter', False) else 'Выгрузка всех строк'}', {repr('; '.join([f'{RU_ROW_NAME[k.lower()]}: {v}' for k, v in info_dict.items() if k.lower() in RU_ROW_NAME.keys()])) if kwargs.get('is_filter', False) else 'NULL'})"
            elif func.__name__ == 'get_excel_file_date':
                values = f"({user_id}, '{kwargs['ip']}', '{'Выгрузка по дате удалённых записей' if kwargs['is_archived'] else 'Выгрузка по дате'}', 'Дата начала: {kwargs['date_from']}; Дата конца: {kwargs['date_to']}')"
            elif func.__name__ == 'get_excel_file_date_change_row':
                values = f"({user_id}, '{kwargs['ip']}', 'Выгрузка по дате замена групп или выборки', 'Дата начала: {kwargs['date_from']}; Дата конца: {kwargs['date_to']}')"

            if DB_VKTMC.insert(f"INSERT INTO `logs_reports`(`user_id`, `comp_ip`, `report_name`, `info`) VALUES {values}"):
                return result_func
            else: 
                return {'status': 400, 'message': 'Логирование не прошло!'}
        else:
            return result_func
    
    return inner
