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
    <link rel="stylesheet" href="../application/style/main.css">
    
    <!-- additional style -->
    <link rel="stylesheet" href="style/main.css">

    <title>Администрирование заявок</title>
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
            if ($response->status == 200 && ($response->user->access == "cma_admin" || $response->user->access == "cma_redactor")) {
                echo '
                    <script type="text/javascript">
                        const login = "'.$login.'"
                        const ip = "'.$ip.'"
                    </script>
                ';
                $scripts = '
                    <script src="../scripts/connect.js"></script>
                    <script src="../scripts/eWindow.js"></script>
                    <script src="scripts/sidebar.js"></script>
                    <script src="scripts/functions.js"></script>
                    <script src="scripts/app.js"></script>

                    <script>document.querySelector("#userName").innerHTML = "'.$response->user->full_name.'"</script>
                ';
            } else {
                echo '
                    <script src="../scripts/eWindow.js"></script>
                    <script>errorWinOk(`У вас нет прав доступа в модуль администрирования заявок ВКТМЦ`)</script>
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
                <li class="top25 navmenu" title="Заявки" onclick="location.href = '../application'">
                    <img src="../img/sidebar/application.svg">
                    <p>Заявки</p>
                    <img src="../img/sidebar/right.svg" class="right">
                </li>

                <li class="navmenu" title="Перечень ВКТМЦ" onclick="location.href = '../'">
                    <img src="../application/img/back_to_vktmc.svg">
                    <p>Перечень ВКТМЦ</p><img src="../img/sidebar/right.svg" class="right">
                    <img src="../img/sidebar/right.svg" class="right">
                </li>

            </ul>

            <div id="nav">
                <img src="../img/sidebar/navOpen.svg" alt="">
            </div>

            <footer>
                <img src="../img/sidebar/cmappLogo.svg">
                <div>
                    <p id=feedback>cmaoa</p>
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
            <div id="events"> 
                <div class="purple_button" id="add_new_user"><img src="../img/plus.svg" alt="">Добавить пользователя</div>
            </div>
            
            <div id="main_content_div">
                <p>Все пользователи</p>
                <div id="main_table_div">
                    <div class="head_row">
                        <div class="head_col user_id">№ П/П</div>
                        <div class="head_col user_search"><img src="img/search.svg"><input class="input_text" id="search_user_fio_login" type="text" placeholder="ФИО/Логин"></div>
                        <div class="head_col user_access"><select class="access_select" id="search_user_access"><option value=""></option></select></div>
                        <div class="head_col user_delete"></div>
                    </div>

                    <div class="table_scroll_div">

                    </div>

                </div>
            </div>

            <div id="user_count_div">
                <p>Записей <img src="img/user_count_img.svg" alt=""> <span id="user_count"></span></p>
            </div>
        </div>

        <div id="background" class="display_none">
        <!-- всё что связанно с окнами подтверждения -->
        </div>

    </section>

    <?php
        echo $scripts;
    ?>
    
</body>
</html>
