from flask import Flask, Response, json, send_file
from flask_restful import Api, Resource, reqparse
from flask.wrappers import Request
from application_admin_functions import create_new_users, delete_user, find_user, get_all_access, get_all_users, update_new_user
from application_comparison import add_comparison_row, delete_all_comparison_rows, delete_comparison_row, get_comparison_rows, make_main_comparison_row
from config import API

from functions import add_new_manual, add_vktmc_row, authorization, delete_and_come_back_manual, delete_nm_code, get_excel_asu, get_excel_file_date, get_excel_file_date_change_row, get_excel_file_vktmc, save_settings, toggle_delete_vktmc_row, update_control_card, update_vktmc_row
from functions_get import filter_row, get_all_lists, get_last_row, get_vktmc_row, get_product_type_row
from helper_functions import QUERY_INSERT_DICT, QUERY_DELETE_DICT, QUERY_COME_BACK_DICT

from application_functions import application_auth, appoint_responsible, create_application, create_attached_files, create_many_application_from_draft, delete_attached_files, delete_many_application_from_draft, get_all_responsible, get_application_history, load_application_from_file, return_draft, update_application, get_info_application, get_applications

import os

from werkzeug.datastructures import FileStorage


class AnyJsonRequest(Request):
    def on_json_loading_failed(self, e):
        if e is not None:
            return super().on_json_loading_failed(e)


app = Flask(__name__)
api = Api(app, prefix='')


app.request_class = AnyJsonRequest

class _Resource(Resource):
    parser = reqparse.RequestParser(trim=True)
    #parser.add_argument('parser', type=str, default=False, required=True, choices=('M', 'F'), help='Bad choice: {error_msg}')

    def return_json(self, body, status):
        return Response(json.dumps(body, ensure_ascii=False), mimetype='application/json', status=status)

    def return_status(self, status):
        return Response(status=status)


# ВКТМЦ
class Vktmc(_Resource):
    """
    Работа со строками ВКТМЦ
    """

    def get(self):
        self.parser.add_argument('first_id')
        self.parser.add_argument('last_id')
        args: dict = self.parser.parse_args()
        body = get_vktmc_row(first_id=args['first_id'], last_id=args['last_id'])
        return self.return_json(body, body['status'])

    def post(self):
        key_tuple = {'number_pp', 'number_asu', 'NM_code', 'product_name', 'product_type', 'ntd', 'extra_options',
                     'measure', 'product_group', 'sample_size', 'control_card', 'article_group', 'note', 'item_number'}
        self.parser.add_argument('values', type=dict)
        self.parser.add_argument('login')

        args: dict = self.parser.parse_args()
        values = args['values']
        login = args['login']
        if not login:
            return self.return_json({'status': 400, 'message': "Вы передали логин"}, 400)
        if set(values.keys()) != key_tuple:
            return self.return_json({'status': 400, 'message': "Вы передали не все параметры"}, 400)

        body = add_vktmc_row(value_dict=values, login=login)
        return self.return_json(body, body['status'])

    def put(self):
        key_tuple = {'number_pp', 'number_asu', 'NM_code', 'product_name', 'product_type', 'ntd', 'extra_options',
                     'measure', 'product_group', 'sample_size', 'control_card', 'article_group', 'note', 'item_number'}
        self.parser.add_argument('values', type=dict)
        self.parser.add_argument('login')
        self.parser.add_argument('ip')

        args: dict = self.parser.parse_args()
        values = args['values']
        login = args['login']
        ip = args['ip']
        if not login:
            return self.return_json({'status': 400, 'message': "Вы не передали логин"}, 400)
        if not ip:
            return self.return_json({'status': 400, 'message': "Вы не передали ip компьютера"}, 400)
        if set(values.keys()) != key_tuple:
            return self.return_json({'status': 400, 'message': "Вы передали не все параметры"}, 400)
        if not values['number_asu']:
            return self.return_json({'status': 400, 'message': "'number_asu' не может быть пустым"}, 400)

        body = update_vktmc_row(value_dict=values, login=login, ip=ip)
        return self.return_json(body, body['status'])

    def delete(self):
        """
        Удаляет если не удалено, возвращает если удалено
        """
        self.parser.add_argument('number_pp')
        self.parser.add_argument('login')
        args: dict = self.parser.parse_args()
        if not args['login']:
            return self.return_json({'status': 400, 'message': "Вы не передали логин"}, 400)
        body = toggle_delete_vktmc_row(
            number_pp=args['number_pp'], login=args['login'])
        return self.return_json(body, body['status'])


class Filter(_Resource):
    def get(self):
        self.parser.add_argument('number_pp')
        self.parser.add_argument('number_asu')
        self.parser.add_argument('NM_code')
        self.parser.add_argument('product_name')
        self.parser.add_argument('product_type')
        self.parser.add_argument('ntd')
        self.parser.add_argument('extra_options')
        self.parser.add_argument('measure')
        self.parser.add_argument('product_group')
        self.parser.add_argument('sample_size')
        self.parser.add_argument('control_card')
        self.parser.add_argument('article_group')
        self.parser.add_argument('note')
        self.parser.add_argument('item_number')
        self.parser.add_argument('sort_name', default='number_pp')
        self.parser.add_argument('sort_by', default='ASC')

        args: dict = self.parser.parse_args()
        body = filter_row(**args)
        return self.return_json(body, body['status'])


class ValueLists(_Resource):
    def get(self):
        body = get_all_lists()
        return self.return_json(body, body["status"])


class TypeList(_Resource):
    def get(self):
        self.parser.add_argument('product_name')
        args: dict = self.parser.parse_args()
        body = get_product_type_row(args['product_name'])
        return self.return_json(body, body["status"])


class ExcelAsu(_Resource):
    def get(self):
        self.parser.add_argument('date')
        args: dict = self.parser.parse_args()
        date = args['date']
        path = f"excel_files/asu_excel_file_{date}.xlsx"
        if get_excel_asu(date):
            return self.return_json({'status': 200, 'path': path}, 200)
        else:
            return self.return_json({'status': 400}, 400)


class ExcelFile(_Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('login', required=True)
    parser.add_argument('ip', required=True)

    def get(self):
        args: dict = self.parser.parse_args()
        path = f"../excel_files/excel_file_filter_vktmc.xlsx"
        body = get_excel_file_vktmc(path_save=path, is_filter=False, **args)
        return self.return_json(body, body['status'])


class ExcelFileFilter(_Resource):
    def get(self):
        self.parser.add_argument('number_pp')
        self.parser.add_argument('number_asu')
        self.parser.add_argument('NM_code')
        self.parser.add_argument('product_name')
        self.parser.add_argument('product_type')
        self.parser.add_argument('ntd')
        self.parser.add_argument('extra_options')
        self.parser.add_argument('measure')
        self.parser.add_argument('product_group')
        self.parser.add_argument('sample_size')
        self.parser.add_argument('control_card')
        self.parser.add_argument('article_group')
        self.parser.add_argument('note')
        self.parser.add_argument('item_number')
        self.parser.add_argument('login')
        self.parser.add_argument('ip')

        args: dict = self.parser.parse_args()
        if not args['login'] or not args['ip']:
            return self.return_json({"status": 400, "message": "Вы не передали login или ip"}, 400)
        path = f"../excel_files/excel_file_filter_vktmc.xlsx"
        body = get_excel_file_vktmc(path_save=path, is_filter=True, **args)
        return self.return_json(body, body['status'])


class ExcelFileDate(_Resource):
    """
    Получение excel файла по промежутку дат
    """
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('login', required=True)
    parser.add_argument('ip', required=True)
    parser.add_argument('date_from', required=True)
    parser.add_argument('date_to', required=True)
    parser.add_argument('is_archived', default=0)

    def get(self):
        args: dict = self.parser.parse_args()
        path = f"../excel_files/excel_file_{args['date_from']}_{args['date_to']}{'_deleted' if args['is_archived'] else ''}.xlsx"
        body = get_excel_file_date(login=args['login'], ip=args['ip'], date_from=args['date_from'],
                                   date_to=args['date_to'], path_save=path, is_archived=args['is_archived'])
        return self.return_json(body, body['status'])


class ExcelFileDateChange(_Resource):
    """
    Получение excel файла по промежутку дат для Изменения группы продукции и/или выборки
    """
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('login', required=True)
    parser.add_argument('ip', required=True)
    parser.add_argument('date_from', required=True)
    parser.add_argument('date_to', required=True)

    def get(self):
        args: dict = self.parser.parse_args()
        path = f"../excel_files/excel_file_{args['date_from']}_{args['date_to']}_change_row.xlsx"
        body = get_excel_file_date_change_row(login=args['login'],
                                              ip=args['ip'],
                                              date_from=args['date_from'],
                                              date_to=args['date_to'],
                                              path_save=path)
        return self.return_json(body, body['status'])


class Manuals(_Resource):
    """
    Операции над справочниками
    """

    def post(self):
        self.parser.add_argument('table_name')
        self.parser.add_argument('name')
        self.parser.add_argument('description')
        args: dict = self.parser.parse_args()
        if args['table_name'] not in QUERY_INSERT_DICT.keys():
            return self.return_json({'status': 404, 'message': 'table not found'}, 404)
        if not args['name']:
            return self.return_json({'status': 400, 'message': 'argument "name" was not passed'}, 400)

        if add_new_manual(args['table_name'], args['name'], args['description']):
            return self.return_json({'status': 200}, 200)
        else:
            return self.return_json({'status': 400}, 400)

    def put(self):
        self.parser.add_argument('table_name')
        self.parser.add_argument('name')
        args: dict = self.parser.parse_args()
        if args['table_name'] not in QUERY_COME_BACK_DICT.keys():
            return self.return_json({'status': 404, 'message': 'table not found'}, 404)

        if delete_and_come_back_manual(QUERY_COME_BACK_DICT.get(args['table_name'], None).format(args['name'])):
            return self.return_json({'status': 200}, 200)
        else:
            return self.return_json({'status': 400}, 400)

    def delete(self):
        self.parser.add_argument('table_name')
        self.parser.add_argument('name')
        args: dict = self.parser.parse_args()
        if args['table_name'] not in QUERY_DELETE_DICT.keys():
            return self.return_json({'status': 404, 'message': 'table not found'}, 404)

        if delete_and_come_back_manual(QUERY_DELETE_DICT.get(args['table_name'], None).format(args['name'])):
            return self.return_json({'status': 200}, 200)
        else:
            return self.return_json({'status': 400}, 400)


class NM_code(_Resource):
    """
    Операции над нм кодами
    """

    def delete(self):
        self.parser.add_argument('number_asu')
        self.parser.add_argument('nm_code', action="append")
        args: dict = self.parser.parse_args()
        body = delete_nm_code(**args)
        return self.return_json(body, body['status'])


class Auth(_Resource):
    """
    Авторизация
    """
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('login', required=True)

    def post(self):
        self.parser.add_argument('login')
        args: dict = self.parser.parse_args()
        body = authorization(args['login'])
        return self.return_json(body, body['status'])


class SaveSettings(_Resource):
    """
    Сохранение настроек, название параметров должно быть
    равно названию столбцов в БД
    """
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('login', required=True)
    parser.add_argument('number_display_row')

    def put(self):
        self.parser.add_argument('login')
        self.parser.add_argument('number_display_row')
        args: dict = self.parser.parse_args()
        body = save_settings(**args)
        return self.return_json(body, body['status'])


class LastRow(_Resource):
    """
    Получить id и number_asu последней строки 
    """

    def get(self):
        body = get_last_row()
        return self.return_json(body, body['status'])


class GetControlCardFile(_Resource):
    """
    Отправка PDF файла через API
    """
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('name_file', required=True)

    def get(self):
        args: dict = self.parser.parse_args()
        path = f"{os.path.abspath('../')}/control_card_files/{args.get('name_file')}"
        if os.path.exists(path):
            return send_file(f"{os.path.abspath('../')}/control_card_files/{args.get('name_file')}")
        else:
            return self.return_status(404)


class UpdateControlCard(_Resource):
    """
    Обновление файлов для карт контроля
    """
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('login', required=True)

    def put(self):
        args: dict = self.parser.parse_args()
        body = update_control_card(login=args.get('login'))
        return self.return_json(body, body['status'])


# Заявки ВКТМЦ
class ApplicationAuth(_Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('login', required=True)

    def post(self):
        args: dict = self.parser.parse_args()
        body = application_auth(args["login"])
        return self.return_json(body, body['status'])


class CreateApplication(_Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('values', type=dict, required=True)
    parser.add_argument('login', required=True)
    parser.add_argument('application_type', required=True, type=int)
    parser.add_argument('number_asu', type=str)
    parser.add_argument('set_status', type=int, required=True)

    def post(self):
        args: dict = self.parser.parse_args()
        body = create_application(login=args["login"], values=args["values"],
                                  application_type=args["application_type"], number_asu=args["number_asu"], set_status=args["set_status"])
        return self.return_json(body, body['status'])


class GetInfoApplication(_Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('application_id', required=True, type=int)

    def get(self):
        args: dict = self.parser.parse_args()
        body = get_info_application(application_id=args["application_id"])
        return self.return_json(body, body['status'])


class Applications(_Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('login', required=True)

    def get(self):
        args: dict = self.parser.parse_args()
        body = get_applications(login=args["login"])
        return self.return_json(body, body['status'])


class UpdateApplication(_Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('login', required=True)
    parser.add_argument('application_id', required=True, type=int)
    parser.add_argument('new_status', required=True, type=int)
    parser.add_argument('values', type=dict, required=True)
    def put(self):
        args: dict = self.parser.parse_args()
        body = update_application(login=args["login"], application_id=args["application_id"],
                                  new_values=args["values"], new_status=args["new_status"])
        return self.return_json(body, body['status'])


class Responsible(_Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('login', required=True)
    parser.add_argument('fio')
    parser.add_argument('application_ids', action="append")

    def get(self):
        args: dict = self.parser.parse_args()
        body = get_all_responsible(login=args["login"])
        return self.return_json(body, body['status'])
    
    def put(self):
        args: dict = self.parser.parse_args()
        body = appoint_responsible(login=args["login"], fio=args["fio"], application_ids=args["application_ids"])
        return self.return_json(body, body['status'])


class ReturnDraft(_Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('login', required=True)
    parser.add_argument('application_id', required=True)
    
    def put(self):
        args: dict = self.parser.parse_args()
        body = return_draft(login=args["login"], application_id=args["application_id"])
        return self.return_json(body, body['status'])


class CreateManyApplicationFromDraft(_Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('application_id_list', required=True, action="append")
    
    def put(self):
        args: dict = self.parser.parse_args()
        body = create_many_application_from_draft(application_id_list=args["application_id_list"])
        return self.return_json(body, body['status'])


class DeleteManyApplicationFromDraft(_Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('application_id_list', required=True, action="append")
    parser.add_argument('login', required=True, type=str)
    
    def delete(self):
        args: dict = self.parser.parse_args()
        body = delete_many_application_from_draft(application_id_list=args["application_id_list"], login=args["login"])
        return self.return_json(body, body['status'])


class LoadApplicationFromFile(_Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('file_routes', type=FileStorage, location="files", store_missing=False, required=True)
    parser.add_argument('login', type=str, location="values", required=True)
    
    def post(self):
        args: dict = self.parser.parse_args()
        body = load_application_from_file(login=args["login"], file=args["file_routes"])
        return self.return_json(body, body["status"])


class GetApplicationHistory(_Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('application_id', required=True, type=int)
    
    def get(self):
        args: dict = self.parser.parse_args()
        body = get_application_history(application_id=args["application_id"])
        return self.return_json(body, body['status'])


class CreateAttachedFiles(_Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('files', action="append", type=FileStorage, location="files", store_missing=False, required=True)
    parser.add_argument('login', type=str, location="values", required=True)
    parser.add_argument('application_id', type=int, location="values", required=True)
    
    def post(self):
        args: dict = self.parser.parse_args()
        body = create_attached_files(login=args["login"], files=args["files"], application_id=args["application_id"])
        return self.return_json(body, body["status"])


class DeleteAttachedFiles(_Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('attached_file_id', type=int, required=True)
    
    def delete(self):
        args: dict = self.parser.parse_args()
        body = delete_attached_files(attached_file_id=args["attached_file_id"])
        return self.return_json(body, body["status"])


class GetComparison(_Resource):
    """Получить все сравнения конкретного человека"""
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('login', required=True, type=str)

    def get(self):
        args: dict = self.parser.parse_args()
        body = get_comparison_rows(login=args["login"])
        return self.return_json(body, body['status'])


class AddComparison(_Resource):
    """Добавить строку в сравнения конкретного человека"""
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('login', required=True, type=str)
    parser.add_argument('number', required=True, type=str)

    def post(self):
        args: dict = self.parser.parse_args()
        body = add_comparison_row(login=args["login"], number=args["number"])
        return self.return_json(body, body['status'])


class DeleteComparison(_Resource):
    """Удалить строку в сравнения конкретного человека"""
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('login', required=True, type=str)
    parser.add_argument('comparison_id', required=True, type=int)

    def delete(self):
        args: dict = self.parser.parse_args()
        body = delete_comparison_row(login=args["login"], comparison_id=args["comparison_id"])
        return self.return_json(body, body['status'])


class DeleteAllComparison(_Resource):
    """Удалить все строки в сравнении для конкретного человека"""
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('login', required=True, type=str)

    def delete(self):
        args: dict = self.parser.parse_args()
        body = delete_all_comparison_rows(login=args["login"])
        return self.return_json(body, body['status'])


class MakeMainComparisonRow(_Resource):
    """Сделать строку основной для сравнения"""
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('login', required=True, type=str)
    parser.add_argument('comparison_id', required=True, type=int)

    def put(self):
        args: dict = self.parser.parse_args()
        body = make_main_comparison_row(login=args["login"], comparison_id=args["comparison_id"])
        return self.return_json(body, body['status'])


class GetAllAccess(_Resource):
    """Получить все возможные права доступа"""
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('login', required=True, type=str)

    def get(self):
        args: dict = self.parser.parse_args()
        body = get_all_access(login=args["login"])
        return self.return_json(body, body['status'])


class GetAllUsers(_Resource):
    """Получить список всех пользователей"""
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('login', required=True, type=str)

    def get(self):
        args: dict = self.parser.parse_args()
        body = get_all_users(login=args["login"])
        return self.return_json(body, body['status'])


class CreateNewUsers(_Resource):
    """Добавить пользователей"""
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('login', required=True, type=str)
    parser.add_argument('new_users_dict', required=True, type=dict)

    def post(self):
        args: dict = self.parser.parse_args()
        body = create_new_users(login=args["login"], new_users=args["new_users_dict"])
        return self.return_json(body, body['status'])


class UpdateNewUser(_Resource):
    """Добавить пользователей"""
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('login', required=True, type=str)
    parser.add_argument('update_user_login', required=True, type=str)
    parser.add_argument('access', required=True, type=str)

    def put(self):
        args: dict = self.parser.parse_args()
        body = update_new_user(login=args["login"], 
                               update_user_login=args["update_user_login"], 
                               access=args["access"])
        
        return self.return_json(body, body['status'])


class FindUser(_Resource):
    """Найти пользователя в АД"""
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('login', required=True, type=str)
    parser.add_argument('find_login', required=True, type=str)

    def get(self):
        args: dict = self.parser.parse_args()
        body = find_user(login=args["login"], find_login=args["find_login"])
        return self.return_json(body, body['status'])


class DeleteUser(_Resource):
    """Удалить пользователя из заявок"""
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('login', required=True, type=str)
    parser.add_argument('delete_user_login', required=True, type=str)

    def delete(self):
        args: dict = self.parser.parse_args()
        body = delete_user(login=args["login"], delete_user_login=args["delete_user_login"])
        return self.return_json(body, body['status'])


# ВКТМЦ
api.add_resource(Vktmc, '/get_vktmc_row', '/add_vktmc_row', '/update_vktmc_row', '/delete_vktmc_row')
api.add_resource(ValueLists, '/get_value_list')
api.add_resource(TypeList, '/get_type_list')
api.add_resource(ExcelAsu, '/get_excel_asu')
api.add_resource(ExcelFile, '/get_excel_file_vktmc')
api.add_resource(ExcelFileFilter, '/get_excel_file_filter_vktmc')
api.add_resource(ExcelFileDate, '/get_excel_file_date')
api.add_resource(ExcelFileDateChange, '/get_excel_file_date_change_row')
api.add_resource(Filter, '/filter')
api.add_resource(Manuals, '/manuals')
api.add_resource(NM_code, '/delete_nm_code')
api.add_resource(Auth, '/auth')
api.add_resource(SaveSettings, '/save_settings')
api.add_resource(LastRow, '/get_last_row')
api.add_resource(GetControlCardFile, '/get_control_card_file')
api.add_resource(UpdateControlCard, '/update_control_card')
# Заявки
api.add_resource(ApplicationAuth, '/application_auth')
api.add_resource(CreateApplication, '/create_application')
api.add_resource(Applications, '/get_applications')
api.add_resource(GetInfoApplication, '/get_info_application')
api.add_resource(UpdateApplication, '/update_application')
api.add_resource(Responsible, '/get_all_responsible', '/appoint_responsible')
api.add_resource(ReturnDraft, '/return_draft')
api.add_resource(CreateManyApplicationFromDraft, '/create_many_application_from_draft')
api.add_resource(DeleteManyApplicationFromDraft, '/delete_many_application_from_draft')
api.add_resource(LoadApplicationFromFile, '/load_application_from_file')
api.add_resource(GetApplicationHistory, '/get_application_history')
api.add_resource(CreateAttachedFiles, '/create_attached_files')
api.add_resource(DeleteAttachedFiles, '/delete_attached_files')
# Сравнение строк
api.add_resource(GetComparison, '/get_comparison_rows')
api.add_resource(AddComparison, '/add_comparison_row')
api.add_resource(DeleteComparison, '/delete_comparison_row')
api.add_resource(DeleteAllComparison, '/delete_all_comparison_rows')
api.add_resource(MakeMainComparisonRow, '/make_main_comparison_row')
# админка модуля заявок
api.add_resource(GetAllAccess, '/get_all_access')
api.add_resource(GetAllUsers, '/get_all_users')
api.add_resource(CreateNewUsers, '/create_new_users')
api.add_resource(UpdateNewUser, '/update_new_user')
api.add_resource(FindUser, '/find_user')
api.add_resource(DeleteUser, '/delete_user')

if __name__ == '__main__':
    app.run(host=API.get('host'), port=API.getint(
        'port'), debug=API.getboolean('debug'))
