from my_engine import session_scope
from models import t_all_rows, ArticleGroup, ItemNumber, Measure, Ntd, ProductGroup, ProductName, ProductType, SampleSize, Vktmc
from sqlalchemy import and_, text

from helper_functions import make_row_from_data_control_card

import asyncio



async def get_id_name_row(cls, is_archived=0):
    """Получить списки значений id, name"""
    with session_scope() as session:
        return [{'value': id_, 'description': name} for id_, name in session.query(cls.id, cls.name).filter(cls.is_archived == is_archived).order_by(cls.name).all()]


async def get_name_row(cls, is_archived=0) -> list:
    """Получить списки значений name"""
    with session_scope() as session:
        return [{'value': name} for name, in session.query(cls.name).filter(cls.is_archived == is_archived).order_by(cls.name).all()]


async def get_article_group_row() -> list:
    """Получение списка "Группа изделия" """
    with session_scope() as session:
        return [{'value': name, 'description': description} for name, description in session.query(ArticleGroup.name, ArticleGroup.description).order_by(ArticleGroup.name).all()]


async def get_product_name_row() -> list:
    """Получение списка "Наименование изделия" """
    with session_scope() as session:
        return [{'value': name} for name, in session.query(ProductName.name).distinct(ProductName.name).order_by(ProductName.name).all()]


def get_product_type_row(product_name: str) -> list:
    """Получение списка "Тип продукта" в зависимости от имени продукта"""
    with session_scope() as session:
        data = [{'value': name} for name, in session.query(ProductType.name).join(ProductName).filter(ProductName.name == product_name).order_by(ProductType.name).all()]
        return {"status": 200, "type_list": data} if data else {"status": 404, "message": "Типы продукции не найдены"}


def get_all_lists() -> dict:
    """Получить все справочники"""
    return {
        'status': 200, 
        'article_group': asyncio.run(get_article_group_row()), 
        'item_number': asyncio.run(get_id_name_row(ItemNumber, 0)), 
        'item_number_archived': asyncio.run(get_id_name_row(ItemNumber, 1)), 
        'measure': asyncio.run(get_name_row(Measure, is_archived=0)), 
        'measure_archived': asyncio.run(get_name_row(Measure, is_archived=1)), 
        'product_group': asyncio.run(get_id_name_row(ProductGroup, 0)), 
        'product_group_archived': asyncio.run(get_id_name_row(ProductGroup, 0)), 
        'product_name': asyncio.run(get_product_name_row()), 
        'sample_size': asyncio.run(get_name_row(SampleSize, is_archived=0)), 
        'sample_size_archived': asyncio.run(get_name_row(SampleSize, is_archived=1)), 
        'ntd': asyncio.run(get_name_row(Ntd, is_archived=0)),
        'ntd_archived': asyncio.run(get_name_row(Ntd, is_archived=1))
    }


def get_vktmc_row(**kwargs):
    """
    Получить значения таблицы vktmc
    kwargs['first_id'] - number_pp с которого начинать вывод
    kwargs['last_id'] - number_pp которым заканчивать (не включительно)
    """
    result_body = {}
    if not kwargs['first_id']: # если нет id начала, то отдать список всех id
        with session_scope() as session:
            result_body['ids_list'] = [_ for _, in session.query(Vktmc.number_pp).filter(Vktmc.is_archived == 0).all()]
    try:
        first_id = int(kwargs['first_id']) if kwargs['first_id'] else 1
        last_id = int(kwargs['last_id']) if kwargs['last_id'] else 1
    except ValueError as e:
        return {'status': 400, 'message': str(e)}
    except TypeError as e:
        return {'status': 400, 'message': str(e)}

    with session_scope() as session:
        data = session.query(t_all_rows.c.number_pp, t_all_rows.c.number_asu , t_all_rows.c.NM_code , t_all_rows.c.product_name , t_all_rows.c.product_type , 
            t_all_rows.c.ntd , t_all_rows.c.extra_options , t_all_rows.c.measure , t_all_rows.c.product_group , t_all_rows.c.sample_size , t_all_rows.c.control_card , 
            t_all_rows.c.article_group , t_all_rows.c.note , t_all_rows.c.item_number, t_all_rows.c.control_card_files).\
            filter(and_(
                    t_all_rows.c.number_pp >= first_id,
                    t_all_rows.c.number_pp <= last_id,
                    t_all_rows.c.is_archived == 0
                )
            ).order_by(t_all_rows.c.number_pp).all()

    result_body['vktmc_row'] = make_row_from_data_control_card(data)
    result_body['status'] = 200
    return result_body


def filter_row(**kwargs):
    filter_dict = [f"number_asu in (SELECT `number_asu` FROM `NM_code` WHERE `nm_code` like '%{value}%')" if key == 'NM_code' else (f"{key} LIKE '{value}'" if key in ('article_group', 'measure', 'sample_size') else f"{key} LIKE '%{value}%'") for key, value in kwargs.items() if kwargs.get(key, None) is not None and key != "sort_name" and key != "sort_by"]
    if not filter_dict:
        return {'status': 400, 'message': 'no parameter passed'}
    
    with session_scope() as session:
        data = session.query(t_all_rows.c.number_pp, t_all_rows.c.number_asu , t_all_rows.c.NM_code , t_all_rows.c.product_name , t_all_rows.c.product_type , 
            t_all_rows.c.ntd , t_all_rows.c.extra_options , t_all_rows.c.measure , t_all_rows.c.product_group , t_all_rows.c.sample_size , t_all_rows.c.control_card , 
            t_all_rows.c.article_group , t_all_rows.c.note , t_all_rows.c.item_number, t_all_rows.c.control_card_files).\
            filter(text(f"{' AND '.join(filter_dict)} AND is_archived = 0")).\
            order_by(text(f"{kwargs['sort_name']} {kwargs['sort_by']}")).all()
    
    return {'vktmc_row': make_row_from_data_control_card(data), 'status': 200} if data else {'status': 404}


def get_last_row():
    with session_scope() as session:
        number_pp, number_asu = session.query(Vktmc.number_pp, Vktmc.number_asu).order_by(Vktmc.number_pp.desc()).first()
    return {"number_pp": number_pp + 1, "number_asu": str(number_asu + 1).zfill(7), "status": 200}