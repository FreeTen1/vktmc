from sqlalchemy import Column, DateTime, ForeignKey, String, Table, Text, text
from sqlalchemy.dialects.mysql import BIGINT, INTEGER, TEXT, TINYINT
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()
metadata = Base.metadata


class NMCode(Base):
    __tablename__ = 'NM_code'

    number_asu = Column(INTEGER(7, zerofill=True), primary_key=True, nullable=False, comment='№ АСУ-Метро')
    nm_code = Column(BIGINT(20), primary_key=True, nullable=False, comment='Код по НМ')


class ArticleGroup(Base):
    __tablename__ = 'article_group'

    id = Column(INTEGER(11), primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)


class ControlCardFile(Base):
    __tablename__ = 'control_card_files'

    number_asu = Column(INTEGER(7, zerofill=True), primary_key=True, comment=' Номер асу')
    file_name = Column(String(255), nullable=False, comment='Названия файла к карте контроля')


class ItemNumber(Base):
    __tablename__ = 'item_number'

    id = Column(INTEGER(11), primary_key=True)
    name = Column(String(255), nullable=False)
    is_archived = Column(TINYINT(1), nullable=False, server_default=text("'0'"))


class Measure(Base):
    __tablename__ = 'measure'

    id = Column(INTEGER(11), primary_key=True)
    name = Column(String(255), nullable=False)
    is_archived = Column(TINYINT(1), nullable=False, server_default=text("'0'"))


class Ntd(Base):
    __tablename__ = 'ntd'

    id = Column(INTEGER(11), primary_key=True)
    name = Column(String(255), nullable=False)
    is_archived = Column(TINYINT(1), nullable=False, server_default=text("'0'"))


class ProductGroup(Base):
    __tablename__ = 'product_group'

    id = Column(INTEGER(11), primary_key=True)
    name = Column(String(255), nullable=False)
    is_archived = Column(TINYINT(1), nullable=False, server_default=text("'0'"))


class ProductType(Base):
    __tablename__ = 'product_type'

    id = Column(INTEGER(11), primary_key=True)
    name = Column(String(255), nullable=False)


class SampleSize(Base):
    __tablename__ = 'sample_size'

    id = Column(INTEGER(11), primary_key=True)
    name = Column(String(255), nullable=False)
    is_archived = Column(TINYINT(1), nullable=False, server_default=text("'0'"))


class User(Base):
    __tablename__ = 'users'
    __table_args__ = {'comment': 'Таблица пользователей заходивших на сайт'}

    id = Column(INTEGER(11), primary_key=True, comment='id пользователя')
    login = Column(String(255), nullable=False, comment='логин пользователя')
    email = Column(String(255), comment='почта пользователя')
    full_name = Column(String(255), nullable=False, comment='ФИО пользователя')
    access = Column(String(10), nullable=False, server_default=text("'user'"), comment='права пользователя')
    registration_date = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"), comment='дата регистрации пользователя')
    last_login_date = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"), comment='дата последнего входа')


class LogsReport(Base):
    __tablename__ = 'logs_reports'
    __table_args__ = {'comment': 'логи по скачиванию отчётов'}

    id = Column(INTEGER(11), primary_key=True, comment='id скачивания')
    user_id = Column(ForeignKey('users.id', ondelete='CASCADE', onupdate='CASCADE'), nullable=False, index=True, comment='id пользователя')
    comp_ip = Column(String(50), nullable=False, comment='ip компьютера')
    report_name = Column(String(255), nullable=False, comment='название скачиваемого отчёта')
    info = Column(TEXT, comment='Дополнительная информация об отчёте')
    datetime = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"), comment='время скачивания отчёта')

    user = relationship('User')


class ProductName(Base):
    __tablename__ = 'product_name'

    id = Column(INTEGER(11), primary_key=True)
    name = Column(String(255), nullable=False)
    product_type_id = Column(ForeignKey('product_type.id'), index=True)

    product_type = relationship('ProductType')


class Setting(Base):
    __tablename__ = 'settings'

    id = Column(INTEGER(11), primary_key=True, comment='Уникальный id настройки')
    user_id = Column(ForeignKey('users.id', ondelete='CASCADE', onupdate='CASCADE'), nullable=False, index=True, comment='id пользователя')
    number_display_row = Column(INTEGER(11), nullable=False, server_default=text("'25'"), comment='кол-во отображаемых строк')

    user = relationship('User')


class Vktmc(Base):
    __tablename__ = 'vktmc'

    number_pp = Column(INTEGER(11), primary_key=True, comment='№ п/п')
    number_asu = Column(INTEGER(7, zerofill=True), nullable=False, index=True, comment='№ АСУ-Метро')
    product_name = Column(ForeignKey('product_name.id'), nullable=False, index=True, comment='Наименование изделия')
    ntd = Column(ForeignKey('ntd.id'), index=True, comment='НТД (№ чертежа, ГОСТ, ОСТ, ТУ и т.п.)')
    extra_options = Column(Text, comment='Доп. параметры (сорт, размер, вес, рост, класс точности и др.)')
    measure = Column(ForeignKey('measure.id'), nullable=False, index=True, comment='Единица измерения')
    product_group = Column(ForeignKey('product_group.id'), nullable=False, index=True, comment='Группа продукции')
    sample_size = Column(ForeignKey('sample_size.id'), index=True, comment='Размер выборки, %')
    control_card = Column(String(255), comment='Карта контроля')
    article_group = Column(ForeignKey('article_group.id'), index=True, comment='Группа изделия')
    note = Column(Text, comment='Примечание')
    item_number = Column(ForeignKey('item_number.id'), nullable=False, index=True, comment='Номер номенклатуры ')
    date_time_add = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"), comment='Дата и время добавления записи')
    date_time_delete = Column(DateTime, comment='Дата и время удаления записи')
    user_id = Column(ForeignKey('users.id', ondelete='CASCADE', onupdate='CASCADE'), nullable=False, index=True, server_default=text("'1'"), comment='id пользователя (создатель)')
    user_delete_id = Column(ForeignKey('users.id'), index=True, comment='id пользователя (удаливший)')
    is_archived = Column(TINYINT(1), nullable=False, server_default=text("'0'"), comment='Удалена ли запись')

    article_group1 = relationship('ArticleGroup')
    item_number1 = relationship('ItemNumber')
    measure1 = relationship('Measure')
    ntd1 = relationship('Ntd')
    product_group1 = relationship('ProductGroup')
    product_name1 = relationship('ProductName')
    sample_size1 = relationship('SampleSize')
    user_delete = relationship('User', primaryjoin='Vktmc.user_delete_id == User.id')
    user = relationship('User', primaryjoin='Vktmc.user_id == User.id')


t_all_rows = Table(
    'all_rows', metadata,
    Column('number_pp', INTEGER(11)),
    Column('number_asu', INTEGER(7)),
    Column('NM_code', BIGINT(20)),
    Column('product_name', String(255)),
    Column('product_type', String(255)),
    Column('ntd', String(255)),
    Column('extra_options', Text),
    Column('measure', String(255)),
    Column('product_group', INTEGER(11)),
    Column('sample_size', String(255)),
    Column('control_card', String(255)),
    Column('article_group', String(255)),
    Column('note', Text),
    Column('item_number', INTEGER(11)),
    Column('control_card_files', String(255)),
    Column('is_archived', TINYINT(1))
)


class LogsChangeRow(Base):
    __tablename__ = 'logs_change_rows'
    __table_args__ = {'comment': 'Таблица изменений строк'}

    id = Column(INTEGER(11), primary_key=True, comment='id изменения')
    user_id = Column(ForeignKey('users.id', ondelete='CASCADE', onupdate='CASCADE'), nullable=False, index=True, comment='id пользователя')
    comp_ip = Column(String(50), nullable=False, comment='ip компьютера')
    number_pp = Column(ForeignKey('vktmc.number_pp'), nullable=False, index=True, comment='№ п/п')
    row_name = Column(String(255), nullable=False, comment='название столбца')
    ru_row_name = Column(String(255), nullable=False, comment='Название столбца в ресурсе')
    old_value = Column(Text, comment='старое значение')
    new_value = Column(Text, comment='новое значение')
    datetime_edit = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"), comment='дата и время редактирования')

    vktmc = relationship('Vktmc')
    user = relationship('User')


# Заявки
class ApplicationHistory(Base):
    __tablename__ = 'application_history'
    __table_args__ = {'comment': 'История заявок'}

    id = Column(INTEGER(10), primary_key=True, comment='id истории')
    application_id = Column(ForeignKey('applications.id', ondelete='CASCADE', onupdate='CASCADE'), nullable=False, index=True, comment='id заявки')
    status_id = Column(ForeignKey('application_statuses.id', onupdate='CASCADE'), nullable=False, index=True, comment='id статуса')
    nm_code = Column(Text, comment='код по НМ')
    product_name = Column(String(255), nullable=False, comment='наименование изделия')
    product_type = Column(String(255), comment='тип изделия')
    ntd = Column(String(255), comment='НТД (№ чертежа, ГОСТ, ОСТ, ТУ и т.п.)')
    extra_options = Column(Text, comment='доп. параметры (сорт, размер, вес, рост, класс точности и др.)\t')
    measure = Column(String(255), nullable=False, comment='единица измерения')
    product_group = Column(INTEGER, nullable=False, comment='группа продукции')
    sample_size = Column(String(255), comment='размер выборки, %')
    article_group = Column(String(255), nullable=False, comment='группа изделия')
    note = Column(Text, comment='примечание')
    item_number = Column(INTEGER, comment='вид номенклатуры')
    comment = Column(Text, comment='комментарий к заявке')
    datetime = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"), comment='дата и время изменения статуса')

    application = relationship('Application')
    status = relationship('ApplicationStatus')


class ApplicationInfo(Base):
    __tablename__ = 'application_info'
    __table_args__ = {'comment': 'Таблица с данными для внесения в ВКТМЦ'}

    application_id = Column(ForeignKey('applications.id', ondelete='CASCADE', onupdate='CASCADE'), primary_key=True, nullable=False, comment='номер заявки')
    product_name = Column(String(255), nullable=False, comment='наименование изделия')
    product_type = Column(String(255), comment='тип изделия')
    ntd = Column(String(255), comment='НТД (№ чертежа, ГОСТ, ОСТ, ТУ и т.п.)')
    extra_options = Column(Text, comment='доп. параметры (сорт, размер, вес, рост, класс точности и др.)')
    measure = Column(String(255), nullable=False, comment='единица измерения')
    product_group = Column(INTEGER(10), nullable=False, comment='группа продукции')
    sample_size = Column(String(255), comment='размер выборки, %')
    article_group = Column(String(255), nullable=False, comment='группа изделия')
    note = Column(Text, comment='примечание')
    item_number = Column(INTEGER(10), comment='вид номенклатуры')
    comment = Column(Text, comment='комментарий к заявки')
    
    application = relationship('Application')


class ApplicationNmCode(Base):
    __tablename__ = 'application_nm_codes'
    __table_args__ = {'comment': 'Таблица с кодами по НМ для заявок'}

    application_id = Column(ForeignKey('applications.id', ondelete='CASCADE', onupdate='CASCADE'), primary_key=True, nullable=False, comment='номер заявки')
    nm_code = Column(BIGINT(20), primary_key=True, nullable=False, comment='код по НМ для заявки')

    application = relationship('Application')


class ApplicationStatus(Base):
    __tablename__ = 'application_statuses'
    __table_args__ = {'comment': 'Возможные статусы заявки'}

    id = Column(INTEGER(10), primary_key=True, comment='id статуса')
    description = Column(String(255), nullable=False, comment='описание статуса')


class ApplicationType(Base):
    __tablename__ = 'application_types'
    __table_args__ = {'comment': 'Таблица типов заявок'}

    id = Column(INTEGER(10), primary_key=True, comment='id типа')
    name = Column(String(50), nullable=False, comment='имя типа')


class ApplicationUser(Base):
    __tablename__ = 'application_users'
    __table_args__ = {'comment': 'Информация о пользователях'}

    id = Column(INTEGER, primary_key=True)
    login = Column(String(255), nullable=False, unique=True)
    email = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    access = Column(String(255), nullable=False)
    departament = Column(String(255), nullable=False)


class Application(Base):
    __tablename__ = 'applications'
    __table_args__ = {'comment': 'Таблица заявок'}

    id = Column(INTEGER(10), primary_key=True, comment='номер заявки')
    status_id = Column(ForeignKey('application_statuses.id', onupdate='CASCADE'), nullable=False, index=True, comment='статус заявки')
    type_id = Column(ForeignKey('application_types.id', ondelete='CASCADE', onupdate='CASCADE'), nullable=False, index=True)
    number_asu = Column(INTEGER(7, zerofill=True), comment='номер асу редактируемой заявки')
    creator_id = Column(ForeignKey('application_users.id', onupdate='CASCADE'), nullable=False, index=True, comment='создатель заявки')
    responsible_cma_id = Column(ForeignKey('application_users.id', onupdate='CASCADE'), index=True, comment='ответственный в ЦМА')
    responsible_tb_id = Column(ForeignKey('application_users.id', onupdate='CASCADE'), index=True, comment='ответственный в ТБ')
    datetime_created = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"), comment='Дата и время создания заявки')

    creator = relationship('ApplicationUser', primaryjoin='Application.creator_id == ApplicationUser.id')
    responsible_cma = relationship('ApplicationUser', primaryjoin='Application.responsible_cma_id == ApplicationUser.id')
    responsible_tb = relationship('ApplicationUser', primaryjoin='Application.responsible_tb_id == ApplicationUser.id')
    status = relationship('ApplicationStatus')
    type = relationship('ApplicationType')


class ApplicationComparison(Base):
    __tablename__ = 'application_comparison'

    id = Column(INTEGER, primary_key=True, comment='id заявки на сравнение')
    user_id = Column(ForeignKey('application_users.id', ondelete='RESTRICT', onupdate='CASCADE'), nullable=False, index=True, comment='id пользователя')
    number_asu = Column(INTEGER(7), comment='№ асу из ВКТМЦ')
    application_id = Column(ForeignKey('applications.id', ondelete='CASCADE', onupdate='CASCADE'), index=True, comment='№ заявки')
    main_row = Column(TINYINT(1), nullable=False, server_default=text("'0'"), comment='сравнивать с данной строкой?')

    application = relationship('Application')
    user = relationship('ApplicationUser')


class ApplicationAttachedFile(Base):
    __tablename__ = 'application_attached_files'
    __table_args__ = {'comment': 'Таблица прикреплённых файлов'}

    id = Column(INTEGER, primary_key=True, comment='id файла')
    application_id = Column(ForeignKey('applications.id', ondelete='CASCADE', onupdate='CASCADE'), nullable=False, index=True, comment='id заявки')
    path = Column(String(255), nullable=False, comment='путь к файлу')

    application = relationship('Application')