<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="img/title/ico.png" type="image/png">
    <!-- main style -->
    <link rel="stylesheet" href="style/general_style/person_info.css">
    <link rel="stylesheet" href="style/general_style/loading.css">
    <link rel="stylesheet" href="style/general_style/sidebar.css">
    <link rel="stylesheet" href="style/general_style/main_style.css">
    <link rel="stylesheet" href="style/general_style/footer.css">
    
    <!-- additional style -->
    <link rel="stylesheet" href="style/filter.css">
    <link rel="stylesheet" href="style/table_style.css">
    <link rel="stylesheet" href="style/filter.css">
    <link rel="stylesheet" href="style/pagination.css">
    <link rel="stylesheet" href="style/new_row.css">
    <link rel="stylesheet" href="style/pop_up.css">
    <link rel="stylesheet" href="style/new_options.css">
    <link rel="stylesheet" href="style/apply_date.css">
    <title>ВКТМЦ</title>
</head>
<body>
    <?php
        $curl = curl_init();
        // $login = "torchkov-mv";
        // $ip = "1.1.1.1";
        $login = @$_SERVER['REMOTE_USER'];
        $ip = @$_SERVER['REMOTE_ADDR'];
        curl_setopt_array($curl, array(
            CURLOPT_URL => 'http://localhost:5013/auth',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS =>'{
                "login": "'.$login.'"
            }',
            CURLOPT_HTTPHEADER => array(
            'Content-Type: application/json'
            ),
        ));
        
        $response = curl_exec($curl);
        
        curl_close($curl);
        $response = json_decode($response);
        if ($response) {
            if ($response->status == 200) {
                echo '
                <script type="text/javascript">
                    const login = "'.$login.'"
                    const ip = "'.$ip.'"
                </script>
                ';
    
                $scripts = '
                <script src="scripts/eWindow.js"></script>
                <script src="scripts/autosize.js"></script>
                <script src="scripts/sidebar.js"></script>
                <script src="scripts/connect.js"></script>
                <script src="scripts/general_functions.js"></script>
                <script src="scripts/app.js"></script>
                <script src="scripts/warning.js"></script>
                ';
            } else {
                echo '
                <script src="scripts/eWindow.js"></script>
                <script>errorWinOk("У вас нет прав на данный ресурс")</script>
                ';
                exit();
            };
        } else {
            echo '
            <script src="scripts/eWindow.js"></script>
            <script>errorWinOk("Нет соединения с сервером(((((((((((((((((((((")</script>
            ';
            exit();
        }
        
    ?>

    <!-- sidebar -->
    <aside class="w71">
        <div id=aside>
            <header>
                <img src="img/sidebar/mmlogo.svg" id=logo><img src="img/sidebar/logoline.svg" id=logoline>
            </header>

            <ul id="navmenu">
                <li  class="navmenu" title="Поиск" onclick="openCloseSearch()">
                    <img src="img/sidebar/search.svg">
                    <p>Поиск</p><img src="img/sidebar/right.svg" class="right">
                </li>

                <li class="borderBottom navmenu" title="Отчёты" onclick="openCloseReport()">
                    <img src="img/sidebar/report.svg">
                    <p>Отчёты</p>
                    <img src="img/sidebar/right.svg" class="right">
                </li>

                <li class="top25 navmenu" title="Заявки" onclick="location.href += 'application'">
                    <img src="img/sidebar/application.svg">
                    <p>Заявки</p>
                    <img src="img/sidebar/right.svg" class="right">
                </li>

            </ul>

            <div id="nav">
                <img src="img/sidebar/navOpen.svg" alt="">
            </div>

            <footer>
                <img src="img/sidebar/cmappLogo.svg">
                <div>
                    <p id=feedback>cmaoa@mosmetro.ru</p>
                    <a id= "instruction" target="_blank" href="">Инструкция</a>
                </div>
            </footer>
        </div>
    </aside>

    <section>
        <!-- Хедер с информацией из АД -->
        <nav>
            <ul>
                <li>ВКТМЦ</li>
                <!-- <li> <img class="next" src="img/person_info/navNext.svg"> </li>
                <li>Ещё что-то</li> -->
            </ul>
            <div id=profil>
                <div id=userName>Иванов Иван Иванович</div>
                <div id=userPhoto><img src="img/person_info/profil.png"></div>
            </div>
        </nav>

        <div id="content" style="display: flex;flex-direction: column;justify-content: space-between;">
            <div id="function_div"> <!-- Блок функций -->
                <!-- Блок раскрытия блоков -->
                <div class="select_button_div">
                    <div id="left_action">
                        <div class="column_display_div" onclick="openCloseColumnDisplay()"><img src="img/arrow_down.svg" alt=""><p>Скрыть\показать столбцы</p></div>
                        <div class="drop_down_buttons report_div" onclick="openCloseReport()"><img src="img/arrow_down.svg" alt=""><p>Отчёты</p></div>
                    </div>

                    <div id="right_action">
                        <div class="drop_down_buttons search_div" onclick="openCloseSearch()"><img src="img/arrow_down.svg" alt=""><p>Поиск</p></div>
                    </div>
                </div>
                <!-- Конец блока раскрытия блоков -->

                <!-- Блок поиска -->
                <div class="dropdown_div search_block display_none">

                    <div class="block_filter_divs">
                        <div class="single_block_filter_divs">
                            <div class="single_item label">
                                <label for="number_pp">№ П/П</label>
                            </div>

                            <div class="single_item input">
                                <x-field>
                                    <input type="number" id="number_pp" placeholder="№ П/П">
                                    <span class="close" onclick="this.previousElementSibling.value = ''; this.previousElementSibling.removeAttribute('style')">
                                    &times;
                                    </span>
                                </x-field>
                            </div>
                        </div>

                        <div class="single_block_filter_divs">
                            <div class="single_item label">
                                <label for="number_asu">№ АСУ-Метро</label>
                            </div>

                            <div class="single_item input">
                                <x-field>
                                    <input type="number" id="number_asu" placeholder="№ АСУ-Метро">
                                    <span class="close" onclick="this.previousElementSibling.value = ''; this.previousElementSibling.removeAttribute('style')">
                                    &times;
                                    </span>
                                </x-field>
                            </div>
                        </div>

                        <div class="single_block_filter_divs">
                            <div class="single_item label">
                                <label for="NM_code">Код по НМ</label>
                            </div>

                            <div class="single_item input">
                                <x-field>
                                    <input type="number" id="NM_code" placeholder="Код по НМ">
                                    <span class="close" onclick="this.previousElementSibling.value = ''; this.previousElementSibling.removeAttribute('style')">
                                    &times;
                                    </span>
                                </x-field>
                            </div>
                        </div>

                        <div class="single_block_filter_divs">
                            <div class="single_item label">
                                <label for="product_name">Наименование изделия</label>
                            </div>

                            <div class="single_item input">
                                <x-field>
                                    <input type="text" list="filter_product_name_list" id="product_name" placeholder="Наименование изделия" autocomplete="off">
                                    <span class="close" onclick="this.previousElementSibling.value = ''; this.previousElementSibling.removeAttribute('style')">
                                    &times;
                                    </span>
                                </x-field>
                                <datalist id="filter_product_name_list">
                                    <option value="Наименование изделия"></option>
                                </datalist>
                            </div>
                        </div>

                        <div class="single_block_filter_divs">
                            <div class="single_item label">
                                <label for="product_type">Тип изделия</label>
                            </div>

                            <div class="single_item input">
                                <x-field>
                                    <input type="text" list="filter_product_type_list" id="product_type" placeholder="Тип изделия" autocomplete="off">
                                    <span class="close" onclick="this.previousElementSibling.value = ''; this.previousElementSibling.removeAttribute('style')">
                                    &times;
                                    </span>
                                </x-field>
                                <datalist id="filter_product_type_list">
                                    <!-- <option value="Тип изделия"></option> -->
                                </datalist>
                            </div>
                        </div>

                    </div>

                    <div class="block_filter_divs">
                        <div class="single_block_filter_divs">
                            <div class="single_item label">
                                <label for="ntd">НТД</label>
                            </div>

                            <div class="single_item input">
                                <x-field>
                                    <input type="text" list="filter_ntd_list" id="ntd" placeholder="НТД" autocomplete="off">
                                    <span class="close" onclick="this.previousElementSibling.value = ''; this.previousElementSibling.removeAttribute('style')">
                                    &times;
                                    </span>
                                </x-field>
                                <datalist id="filter_ntd_list">
                                    <option value="НТД"></option>
                                </datalist>
                            </div>
                        </div>

                        <div class="single_block_filter_divs">
                            <div class="single_item label">
                                <label for="extra_options">Доп. параметры</label>
                            </div>

                            <div class="single_item input">
                                <x-field>
                                    <input type="text" id="extra_options" placeholder="Доп. параметры">
                                    <span class="close" onclick="this.previousElementSibling.value = ''; this.previousElementSibling.removeAttribute('style')">
                                    &times;
                                    </span>
                                </x-field>
                            </div>
                        </div>

                        <div class="single_block_filter_divs">
                            <div class="single_item label">
                                <label for="measure">Единица измерения</label>
                            </div>

                            <div class="single_item input">
                                <x-field>
                                    <input type="text" list="filter_measure_list" id="measure" placeholder="Единица измерения" autocomplete="off">
                                    <span class="close" onclick="this.previousElementSibling.value = ''; this.previousElementSibling.removeAttribute('style')">
                                    &times;
                                    </span>
                                </x-field>
                                <datalist id="filter_measure_list">
                                    <option value="Единица измерения"></option>
                                </datalist>
                            </div>
                        </div>

                        <div class="single_block_filter_divs">
                            <div class="single_item label">
                                <label for="product_group">Группа продукции</label>
                            </div>

                            <div class="single_item input">
                                <x-field>
                                    <input type="text" list="filter_product_group_list" id="product_group" placeholder="Группа продукции" autocomplete="off">
                                    <span class="close" onclick="this.previousElementSibling.value = ''; this.previousElementSibling.removeAttribute('style')">
                                    &times;
                                    </span>
                                </x-field>
                                <datalist id="filter_product_group_list">
                                    <option value="Группа продукции"></option>
                                </datalist>
                            </div>
                        </div>

                        <div class="single_block_filter_divs">
                            <div class="single_item label">
                                <label for="note">Примечание</label>
                            </div>

                            <div class="single_item input">
                                <x-field>
                                    <input type="text" id="note" placeholder="Примечание">
                                    <span class="close" onclick="this.previousElementSibling.value = ''; this.previousElementSibling.removeAttribute('style')">
                                    &times;
                                    </span>
                                </x-field>
                            </div>
                        </div>

                    </div>

                    <div class="block_filter_divs">
                        <div class="single_block_filter_divs">
                            <div class="single_item label">
                                <label for="sample_size">Размер выборки, %</label>
                            </div>

                            <div class="single_item input">
                                <x-field>
                                    <input type="text" list="filter_sample_size_list" id="sample_size" placeholder="Размер выборки, %" autocomplete="off">
                                    <span class="close" onclick="this.previousElementSibling.value = ''; this.previousElementSibling.removeAttribute('style')">
                                    &times;
                                    </span>
                                </x-field>
                                <datalist id="filter_sample_size_list">
                                    <option value="Размер выборки, %"></option>
                                </datalist>
                            </div>
                        </div>

                        <div class="single_block_filter_divs">
                            <div class="single_item label">
                                <label for="control_card">Карта контроля</label>
                            </div>

                            <div class="single_item input">
                                <x-field>
                                    <input type="text" id="control_card" placeholder="Карта контроля">
                                    <span class="close" onclick="this.previousElementSibling.value = ''; this.previousElementSibling.removeAttribute('style')">
                                    &times;
                                    </span>
                                </x-field>
                            </div>
                        </div>

                        <div class="single_block_filter_divs">
                            <div class="single_item label">
                                <label for="article_group">Группа изделия</label>
                            </div>

                            <div class="single_item input">
                                <x-field>
                                    <input type="text" list="filter_article_group_list" id="article_group" placeholder="Группа изделия" autocomplete="off">
                                    <span class="close" onclick="this.previousElementSibling.value = ''; this.previousElementSibling.removeAttribute('style')">
                                    &times;
                                    </span>
                                </x-field>
                                <datalist id="filter_article_group_list">
                                    <option value="Группа изделия"></option>
                                </datalist>
                            </div>
                        </div>

                        <div class="single_block_filter_divs">
                            <div class="single_item label">
                                <label for="item_number">Вид номенклатуры</label>
                            </div>

                            <div class="single_item input">
                                <x-field>
                                    <input type="text" list="filter_item_number_list" id="item_number" placeholder="Вид номенклатуры" autocomplete="off">
                                    <span class="close" onclick="this.previousElementSibling.value = ''; this.previousElementSibling.removeAttribute('style')">
                                    &times;
                                    </span>
                                </x-field>
                                <datalist id="filter_item_number_list">
                                    <option value="Вид номенклатуры"></option>
                                </datalist>
                            </div>
                        </div>

                        <div class="single_block_filter_divs single_block_filter_divs_buttons">
                            <div class="button" id="load_filter">Выгрузить</div>
                            <div class="button" id="drop_filter">Сбросить</div>
                            <div class="button" id="apply_filter">Применить</div>
                        </div>

                    </div>

                </div>
                <!-- конец блока поиска -->

                <!-- Блок отчётов -->
                <div class="dropdown_div report_block display_none">
                    <div class="reports_buttons_div">
                        <div class="single_reports_buttons_div">
                            <div class="button" id="total_vktmc_row">Выгрузить все</div>
                            <p>Выгрузить все актуальные записи</p>
                        </div>
                    </div>
                </div>
                <!-- Конец блока отчётов -->

                <!-- Блок отображения столбцов -->
                <div class="dropdown_div column_display_block display_none">
                    <div>
                        <div>
                            <label for="display_number_pp">№ П/П</label>
                            <input id= "display_number_pp" type="checkbox" column_name="number_pp_table" checked>
                        </div>
                        <div>
                            <label for="display_number_asu">№ АСУ-Метро</label>
                            <input id= "display_number_asu" type="checkbox" column_name="number_asu_table" checked>
                        </div>
                        <div>
                            <label for="display_nm_code">Код по НМ</label>
                            <input id= "display_nm_code" type="checkbox" column_name="NM_code_table" checked>
                        </div>
                        <div>
                            <label for="display_product_name">Наименование изделия</label>
                            <input id= "display_product_name" type="checkbox" column_name="product_name_table" checked>
                        </div>
                        <div>
                            <label for="display_product_type">Тип изделия </label>
                            <input id= "display_product_type" type="checkbox" column_name="product_type_table" checked>
                        </div>
                    </div>
                    <div>
                        <div>
                            <label for="display_ntd">НТД</label>
                            <input id= "display_ntd" type="checkbox" column_name="ntd_table" checked>
                        </div>
                        <div>
                            <label for="display_extra_options">Доп. параметры</label>
                            <input id= "display_extra_options" type="checkbox" column_name="extra_options_table" checked>
                        </div>
                        <div>
                            <label for="display_measure">Единица измерения</label>
                            <input id= "display_measure" type="checkbox" column_name="measure_table" checked>
                        </div>
                        <div>
                            <label for="display_product_group">Группа продукции</label>
                            <input id= "display_product_group" type="checkbox" column_name="product_group_table" checked>
                        </div>
                        <div>
                            <label for="display_note">Примечание</label>
                            <input id= "display_note" type="checkbox" column_name="note_table" checked>
                        </div>
                    </div>
                    <div>
                        <div>
                            <label for="display_sample_size">Размер выборки, %</label>
                            <input id= "display_sample_size" type="checkbox" column_name="sample_size_table" checked>
                        </div>
                        <div>
                            <label for="display_control_card">Карта контроля</label>
                            <input id= "display_control_card" type="checkbox" column_name="control_card_table" checked>
                        </div>
                        <div>
                            <label for="display_article_group">Группа изделия</label>
                            <input id= "display_article_group" type="checkbox" column_name="article_group_table" checked>
                        </div>
                        <div>
                            <label for="display_item_number">Вид номенклатуры</label>
                            <input id= "display_item_number" type="checkbox" column_name="item_number_table" checked>
                        </div>
                        <div>
                            <div class="button" id=button_display_column>Снять всё</div>
                        </div>
                    </div>
                </div>
                <!-- Конец блока отображения столбцов -->
            </div> <!-- Конец блока функций -->

            <!-- Блок таблицы -->
            <div class="main_table_div">
                <div id="head_row">
                    <div class="table_column_div number_pp_table" sort_name="number_pp" sort_by="ASC"><p>№ П/П</p><span></span></div>
                    <div class="table_column_div number_asu_table" sort_name="number_asu" sort_by="ASC"><p>№ АСУ-Метро</p><span></span></div>
                    <div class="table_column_div NM_code_table" sort_name="NM_code" sort_by="ASC"><p>Код по НМ</p><span></span></div>
                    <div class="table_column_div product_name_table" sort_name="product_name" sort_by="ASC"><p>Наименование изделия</p><span></span></div>
                    <div class="table_column_div product_type_table" sort_name="product_type" sort_by="ASC"><p>Тип изделия (серия, фирма, модель, артикул, код ОКПО и т.п.)</p><span></span></div>
                    <div class="table_column_div ntd_table" sort_name="ntd" sort_by="ASC"><p>НТД (№ чертежа, ГОСТ, ОСТ, ТУ и т.п.)</p><span></span></div>
                    <div class="table_column_div extra_options_table" sort_name="extra_options" sort_by="ASC"><p>Доп. параметры (сорт, размер, вес, рост, класс точности и др.)</p><span></span></div>
                    <div class="table_column_div measure_table" sort_name="measure" sort_by="ASC"><p>Единица измерения</p><span></span></div>
                    <div class="table_column_div product_group_table" sort_name="product_group" sort_by="ASC"><p>Группа продукции</p><span></span></div>
                    <div class="table_column_div sample_size_table" sort_name="sample_size" sort_by="ASC"><p>Размер выборки, %</p><span></span></div>
                    <div class="table_column_div control_card_table" sort_name="control_card" sort_by="ASC"><p>Карта контроля</p><span></span></div>
                    <div class="table_column_div article_group_table" sort_name="article_group" sort_by="ASC"><p>Группа изделия</p><span></span></div>
                    <div class="table_column_div note_table" sort_name="note" sort_by="ASC"><p>Примечание</p><span></span></div>
                    <div class="table_column_div item_number_table" sort_name="item_number" sort_by="ASC"><p>Вид номенклатуры</p><span></span></div>
                </div>

                <div class="table_scroll_div">
                    <!-- Записи -->
                </div>
            </div>
            <!-- Конец блока таблицы -->


            <div class="pagination_div"> <!-- Блок пагинации -->
                <div class="pages_div">
                    <p>страница</p>
                    <div class="page_number">
                        <img src="img/first_page.svg" alt="" page_info="first_page" style="margin: 0 5px;" title="Первая страница">
                        <img src="img/page_previous.svg" alt="" page_info="previous_page" title="Предыдущая страница">
                        <div id="page_numbers" class="page_number">
                            <!-- тут номера страничек -->
                        </div>
                        <img src="img/page_next.svg" alt="" page_info="next_page" title="Следующая страница">
                        <img src="img/last_page.svg" alt="" page_info="last_page" style="margin: 0 5px;" title="Последняя страница">
                        <input type="number" id="select_page_pagination_input" placeholder="Введите страницу">
                    </div>
                </div>

                <div id="limited_div"><img src="img/arrow_up.svg" alt=""><p>1-20 из 43874</p></div>

                <div class="select_limited_div" style="background-image: url('img/limited_bac_div.svg'); display: none;">
                    <p>Вывести:</p>
                    <hr>
                    <div class="select_limit_row_value" value='25'>25 строк</div>
                    <div class="select_limit_row_value" value='50'>50 строк</div>
                    <div class="select_limit_row_value" value='100'>100 строк</div>
                    <div class="select_limit_row_value" value='300'>300 строк</div>
                </div>
            </div> <!-- Конец пагинации -->
            <div id="add_edit_new_row_background" class="display_none">
                <div id="add_edit_new_row_div">
                    <div id="add_edit_head">
                        <p>Добавить новую запись</p>
                        <img src="img/close_button.svg" alt="" onclick="openCloseAddEditNewRow()">
                    </div>

                    <div id="add_edit_values_div">
                        <div>
                            <label for="add_edit_number_pp">№ П/П</label>
                            <input type="number" id="add_edit_number_pp" class="important_field" placeholder="обязательное поле" readonly>
                        </div>

                        <div>
                            <label for="add_edit_number_asu">№ АСУ-Метро</label>
                            <input type="number" id="add_edit_number_asu" class="important_field" placeholder="обязательное поле">
                        </div>
                        
                        <div id="add_edit_nm_code_div">
                            <label for="add_edit_nm_code">Код по НМ</label>
                            <div id="add_edit_nm_code_values">
                                <div>
                                    <input type="text" class="add_edit_nm_code" id="main_add_edit_nm_code_input" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                                    <img src="img/plus.svg" id="plus_nm_code" alt="">
                                </div>
                            </div>
                        </div>

                        <div>
                            <label for="add_edit_product_name">Наименование изделия</label>
                            <input type="text" list="add_edit_product_name_list" id="add_edit_product_name" autocomplete="off" class="important_field" placeholder="обязательное поле" maxlength="100">
                            <datalist id="add_edit_product_name_list">
                                <option value="Наименование изделия"></option>
                            </datalist>
                        </div>

                        <div>
                            <label for="add_edit_product_type">Тип изделия</label>
                            <input type="text" list="add_edit_product_type_list" id="add_edit_product_type" autocomplete="off" maxlength="100">
                            <datalist id="add_edit_product_type_list">
                                <!-- <option value="Тип изделия"></option> -->
                            </datalist>
                        </div>

                        <div>
                            <label for="add_edit_ntd">НТД</label>
                            <input type="text" list="add_edit_ntd_list" id="add_edit_ntd" autocomplete="off" maxlength="100">
                            <datalist id="add_edit_ntd_list">
                                <option value="НТД"></option>
                            </datalist>
                        </div>

                        <div>
                            <label for="add_edit_extra_options">Доп. параметры</label>
                            <input type="text" id="add_edit_extra_options" maxlength="100">
                        </div>

                        <div>
                            <label for="add_edit_measure">Единица измерения</label>
                            <input type="text" list="add_edit_measure_list" class="important_field" placeholder="обязательное поле" id="add_edit_measure" autocomplete="off" onchange="checkMainFields(event)">
                            <img src="img/circle_and_plus.svg" class="circle_and_plus" label_name="Единица измерения" table_name="measure" id="add_edit_measure_img" alt="" onclick="newOptionInField(event)">
                            <datalist id="add_edit_measure_list">
                                <option value="Единица измерения"></option>
                            </datalist>
                        </div>

                        <div>
                            <label for="add_edit_product_group">Группа продукции</label>
                            <input type="text" list="add_edit_product_group_list" class="important_field" placeholder="обязательное поле" id="add_edit_product_group" autocomplete="off" onchange="checkMainFields(event)">
                            <img src="img/circle_and_plus.svg" class="circle_and_plus" label_name="Группа продукции" table_name="product_group" id="add_edit_product_group_img" alt="" onclick="newOptionInField(event)">
                            <datalist id="add_edit_product_group_list">
                                <option value="Группа продукции"></option>
                            </datalist>
                        </div>


                        <div>
                            <label for="add_edit_sample_size">Размер выборки, %</label>
                            <input type="text" list="add_edit_sample_size_list" id="add_edit_sample_size" autocomplete="off" onchange="checkMainFields(event)">
                            <img src="img/circle_and_plus.svg" class="circle_and_plus" label_name="Размер выборки, %" table_name="sample_size" id="add_edit_sample_size_img" alt="" onclick="newOptionInField(event)">
                            <datalist id="add_edit_sample_size_list">
                                <option value="Размер выборки, %"></option>
                            </datalist>
                        </div>

                        <div>
                            <label for="add_edit_control_card">Карта контроля</label>
                            <input type="text" id="add_edit_control_card">
                        </div>

                        <div>
                            <label for="add_edit_article_group">Группа изделия</label>
                            <input type="text" list="add_edit_article_group_list" class="important_field" placeholder="обязательное поле" id="add_edit_article_group" autocomplete="off">
                            <datalist id="add_edit_article_group_list">
                                <option value="Группа изделия"></option>
                            </datalist>
                        </div>

                        <div>
                            <label for="add_edit_item_number">Вид номенклатуры</label>
                            <input type="text" list="add_edit_item_number_list" class="important_field" placeholder="обязательное поле" id="add_edit_item_number" autocomplete="off" onchange="checkMainFields(event)">
                            <img src="img/circle_and_plus.svg" class="circle_and_plus" label_name="Вид номенклатуры" table_name="item_number" id="add_edit_item_number_img" alt="" onclick="newOptionInField(event)">
                            <datalist id="add_edit_item_number_list">
                                <option value="Вид номенклатуры"></option>
                            </datalist>
                        </div>

                        <div>
                            <label for="add_edit_note">Примечание</label>
                            <!-- <input type="text" id="add_edit_note"> -->
                            <textarea name="" id="add_edit_note"></textarea>
                        </div>

                    </div>

                    <div class="button" id="add_new_row">Сохранить</div>
                </div>
            </div>

        </div>

    </section>

    <?php
        echo $scripts;
    ?>

</body>
</html>
