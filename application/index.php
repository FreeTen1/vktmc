<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="../img/title/ico.png" type="image/png">
    <!-- main style -->
    <link rel="stylesheet" href="../style/general_style/person_info.css">
    <link rel="stylesheet" href="../style/general_style/loading.css">
    <link rel="stylesheet" href="../style/general_style/sidebar.css">
    <link rel="stylesheet" href="../style/general_style/main_style.css">
    <link rel="stylesheet" href="../style/general_style/footer.css">
    
    <!-- additional style -->
    <link rel="stylesheet" href="style/main.css">
    <link rel="stylesheet" href="style/table_style.css">
    <link rel="stylesheet" href="style/application_info.css">
    <link rel="stylesheet" href="style/search.css">
    <link rel="stylesheet" href="style/comparison.css">
    <link rel="stylesheet" href="style/application_history.css">

    <title>Заявки ВКТМЦ</title>
</head>
<body>
    <?php
        $curl = curl_init();
        // $login = "torchkov-mv";
        // $ip = "1.1.1.1";
        $login = @$_SERVER['REMOTE_USER'];
        $ip = @$_SERVER['REMOTE_ADDR'];
        curl_setopt_array($curl, array(
            CURLOPT_URL => 'http://localhost:5013/application_auth',
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
                    <script src="../scripts/connect.js"></script>
                    <script src="../scripts/eWindow.js"></script>
                    <script src="../scripts/autosize.js"></script>
                    <script src="scripts/sidebar.js"></script>
                    <script src="scripts/markers.js"></script>
                    <script src="scripts/application_functions.js"></script>
                    <script src="scripts/application_info.js"></script>
                    <script src="scripts/app.js"></script>
                    <script src="../scripts/warning.js"></script>
                    <script src="scripts/comparison_applications.js"></script>
                ';
            } else {
                echo '
                    <script src="../scripts/eWindow.js"></script>
                    <script>errorWinOk(`У вас нет прав доступа в модуль "Заявки ВКТМЦ", обратитесь по адресу `)</script>
                ';
                exit();
            };
        } else {
            echo '
            <script src="../scripts/eWindow.js"></script>
            <script>errorWinOk("Нет соединения с сервером(((((((((((((((((((((")</script>
            ';
            exit();
        }
        
    ?>
    <!-- sidebar -->
    <aside class="w71">
        <div id=aside>
            <header>
                <img src="../img/sidebar/mmlogo.svg" id=logo><img src="../img/sidebar/logoline.svg" id=logoline>
            </header>

            <ul id="navmenu">
                <!-- Тут кнопка добавления -->
            </ul>

            <div id="nav">
                <img src="../img/sidebar/navOpen.svg" alt="">
            </div>

            <footer>
                <img src="../img/sidebar/cmappLogo.svg">
                <div>
                    <p id=feedback>cmaoa@mosmetro.ru</p>
                    <a id= "instruction" target="_blank" href="">Инструкция</a>
                    <a id= "example_file_draft" href="example file/example_file_draft.xlsx">Шаблон файла загрузки</a>
                </div>
            </footer>
        </div>
    </aside>

    <section>
        <!-- Хедер с информацией из АД -->
        <nav>
            <ul>
                <li><a href="../">ВКТМЦ</a></li>
                <li> <img class="next" src="../img/person_info/navNext.svg"> </li>
                <li>Заявки ВКТМЦ</li>
            </ul>
            <div id=profil>
                <div id=userName></div>
                <div id=userPhoto><img src="../img/person_info/profil.png"></div>
            </div>
        </nav>

        <div id="content" style="display: flex;flex-direction: column;justify-content: space-between;">
            <div id="main_markers_div">
                <div class="markers selected_marker" id="marker_current_applications" style="">Текущие заявки</div>
                <div class="markers" id="marker_completed_application" style="">Добавленные заявки</div>
            </div>

            <div id="main_tables">

                <div class="application_table_divs current_application">
                    <p id="smt_id1">Заявки требуют действия</p>
                    <div class="div_for_table">

                        <div class="head_row" id="application_await_head">
                            <div class="head_col application_id_row">№ П/П</div>
                            <div class="head_col fio_row">ФИО</div>
                            <div class="head_col departament_row">Подразделение</div>
                            <div class="head_col status_row">Статус</div>
                            <div class="head_col type_row">Тип заявки</div>
                            <div class="head_col responsible_cma_row">Ответственный в ЦМА</div>
                            <div class="head_col responsible_tb_row">Ответственный в ТБ</div>
                        </div>

                        <div class="application_scroll_row_div" id="application_action"></div>

                    </div>
                </div>

                <div class="application_table_divs current_application">
                    <p>Заявки в ожидании</p>
                    <div class="div_for_table">

                        <div class="head_row">
                            <div class="head_col application_id_row">№ П/П</div>
                            <div class="head_col fio_row">ФИО</div>
                            <div class="head_col departament_row">Подразделение</div>
                            <div class="head_col status_row">Статус</div>
                            <div class="head_col type_row">Тип заявки</div>
                            <div class="head_col responsible_cma_row">Ответственный в ЦМА</div>
                            <div class="head_col responsible_tb_row">Ответственный в ТБ</div>
                        </div>

                        <div class="application_scroll_row_div" id="application_await"></div>

                    </div>
                </div>

                <div class="application_table_divs completed_application display_none">
                    <p>Завершённые заявки</p>
                    <div class="div_for_table">

                        <div class="head_row">
                            <div class="head_col application_id_row">№ П/П</div>
                            <div class="head_col fio_row">ФИО</div>
                            <div class="head_col departament_row">Подразделение</div>
                            <div class="head_col status_row">Статус</div>
                            <div class="head_col type_row">Тип заявки</div>
                            <div class="head_col responsible_cma_row">Ответственный в ЦМА</div>
                            <div class="head_col responsible_tb_row">Ответственный в ТБ</div>
                        </div>

                        <div class="application_scroll_row_div" id="application_completed"></div>

                    </div>
                </div>

            </div>

            <div id="footer">
                <div></div>
                <img src="img/footer_logo.svg" alt="">
            </div>


            <div class="display_none" id="main_application_info_background">
                <div class="display_none" id="main_application_info">
                    <div id="head_application_info">
                        <p>Заявка</p>
                        <img src="../img/close_button.svg" alt="Закрыть окно" title="Закрыть окно" id="close_info">
                    </div>

                    <div id="application_info_div">
                        <div>
                            <label class="values_info_labels" for="application_id_info">№ заявки</label>
                            <input type="number" id="application_id_info" class="important_field info_input_text" placeholder="Заполнится автоматически">
                        </div>

                        <div id="info_nm_code_div" style="align-items: baseline;">
                            <label class="values_info_labels" for="nm_code_info">Код по НМ</label>
                            <div id="info_nm_code_values"> 
                                <div>
                                    <input type="text" id="nm_code_info" class="info_input_text" oninput="only_regex(this, /\d/g)">
                                    <img src="../img/plus.svg" id="plus_nm_code" alt="">
                                    <p></p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label class="values_info_labels" for="product_name_info">Наименование изделия</label>
                            <input type="text" id="product_name_info" class="important_field values_info info_input_text" placeholder="обязательное поле" list="product_name_list" autocomplete="off">
                            <datalist id="product_name_list">
                                <option value="product_name_list"></option>
                            </datalist>
                        </div>

                        <div id="product_type_info_div">
                            <label class="values_info_labels" for="product_type_info">Тип изделия</label>
                            <input type="text" id="product_type_info" class="important_field values_info info_input_text" list="product_type_list" autocomplete="off">
                            <datalist id="product_type_list">
                                <!-- <option value="product_type_list"></option> -->
                            </datalist>
                            <!-- <div>
                                <input type="text" style="width: 58%;" id="product_type_info" class="important_field values_info info_input_text" list="product_type_list" autocomplete="off">
                                <datalist id="product_type_list">
                                    <option value="product_type_list"></option>
                                </datalist>
                                <label>
                                    <input type="radio" class="product_type_info_checkbox" name="product_type_info_checkbox" radio_value="1">
                                    Отсутствует
                                </label>
                                <label>
                                    <input type="radio" class="product_type_info_checkbox" name="product_type_info_checkbox" radio_value="2">
                                    Не требуется
                                </label>
                            </div> -->
                        </div>

                        <div id="ntd_info_div">
                            <label class="values_info_labels" for="ntd_info">НТД</label>
                            <input type="text" id="ntd_info" class="important_field values_info info_input_text" list="ntd_list" autocomplete="off">
                            <datalist id="ntd_list">
                                <option value="ntd_list"></option>
                            </datalist>
                            <!-- <div>
                                <input type="text" id="ntd_info" style="width: 58%;" class="important_field values_info info_input_text" list="ntd_list" autocomplete="off">
                                <datalist id="ntd_list">
                                    <option value="ntd_list"></option>
                                </datalist>
                                <label>
                                    <input type="radio" class="ntd_info_checkbox" name="ntd_info_checkbox" radio_value="1">
                                    Отсутствует
                                </label>
                                <label>
                                    <input type="radio" class="ntd_info_checkbox" name="ntd_info_checkbox" radio_value="2">
                                    Не требуется
                                </label>
                            </div> -->
                        </div>

                        <div>
                            <label class="values_info_labels" for="extra_options_info">Доп. параметры</label>
                            <input type="text" id="extra_options_info" class="values_info info_input_text" autocomplete="off">
                        </div>

                        <div>
                            <label class="values_info_labels" for="measure_info">Единица измерения</label>
                            <input type="text" id="measure_info" placeholder="обязательное поле" class="values_info info_input_text" list="measure_list" autocomplete="off" oninput="not_regex(this, /[a-z,A-Z]/g)">
                            <datalist id="measure_list">
                                <option value="боб"></option>
                            </datalist>
                        </div>

                        <div>
                            <label class="values_info_labels" for="product_group_info">Группа продукции</label>
                            <select id="product_group_info" placeholder="обязательное поле" class="values_info info_input_text"></select>
                        </div>

                        <div>
                            <label class="values_info_labels" for="sample_size_info">Размер выборки, %</label>
                            <input type="text" id="sample_size_info" class="values_info info_input_text" list="sample_size_list" autocomplete="off" oninput="not_regex(this, /[a-z,A-Z]/g)">
                            <datalist id="sample_size_list">
                                <option value="sample_size_list"></option>
                            </datalist>
                        </div>

                        <div>
                            <label class="values_info_labels" for="article_group_info">Группа изделия</label>
                            <input type="text" id="article_group_info" placeholder="обязательное поле" class="values_info info_input_text" list="article_group_list" autocomplete="off" oninput="not_regex(this, /[a-z,A-Z]/g)">
                            <datalist id="article_group_list">
                                <option value="article_group_list"></option>
                            </datalist>
                        </div>

                        <div>
                            <label class="values_info_labels" for="item_number_info">Вид номенклатуры</label>
                            <input type="text" id="item_number_info" class="values_info info_input_text" list="item_number_list" autocomplete="off" oninput="only_regex(this, /\d/g)">
                            <datalist id="item_number_list">
                                <option value="item_number_list"></option>
                            </datalist>
                        </div>

                        <div style="align-items: baseline;">
                            <label class="values_info_labels" for="note_info">Примечание</label>
                            <textarea name="" class="values_info" id="note_info"></textarea>
                        </div>

                        <div style="align-items: baseline;">
                            <label class="values_info_labels" for="comment_info">Комментарий</label>
                            <textarea id="comment_info" class="values_info"></textarea>
                        </div>

                        <div id="attached_files_div">
                            <!-- <div>
                                <a href=""><img src="img/attached_file.svg" alt=""><p>Название файла</p></a>
                                <input type="file" class="display_none attached_file_input">
                            </div> -->
                            
                        </div>
                    
                    </div>

                    <div id="buttons_info_buttons"></div>

                </div>

                <!-- Вывод истории о заявки -->
                <div class="display_none" id="main_application_history_div">
                    <div id="history_head">
                        <p>История заявки №<span id="history_application_id"></span></p>
                        <img src="../img/close_button.svg" alt="">
                    </div>

                    <div id="history_main_table_div">
                        <table>
                            <thead>
                                <tr>
                                    <th>Статус</th>
                                    <th>Код по НМ</th>
                                    <th>Наименование изделия</th>
                                    <th>Тип изделия</th>
                                    <th>НТД</th>
                                    <th>Доп. параметры</th>
                                    <th>Единица измерения</th>
                                    <th>Группа продукции	</th>
                                    <th>Размер выборки, %</th>
                                    <th>Группа изделия</th>
                                    <th>Примечание</th>
                                    <th>Вид номенклатуры</th>
                                    <th>Комментарий к заявке</th>
                                    <th>Дата и время изменения</th>
                                </tr>
                            </thead>
                            <tbody>
                                
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>

    </section>

    <?php
        echo $scripts;
    ?>
    
</body>
</html>
