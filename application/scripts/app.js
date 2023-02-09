const accesses = {
    "creator": "Создатель заявок",
    "cma_redactor": "Ответственный в ЦМА",
    "cma_admin": "Администратор в ЦМА",
    "tb_redactor": "Ответственный в ТБ",
    "tb_admin": "Администратор в ТБ"
}
// авторизация
addLoading()
queryAPI_post({ "login": login }, "application_auth").then(i => {
    let response = JSON.parse(i)
    if (response["status"] == 200) {
        // Добавить кнопку назад в перечень
        let li_add = document.createElement("li")
        li_add.classList.add("navmenu")
        li_add.setAttribute("title", "Назад в перечень")
        li_add.setAttribute("onclick", 'location.href = "../"')
        li_add.innerHTML = `
        <img src="img/back_to_vktmc.svg">
        <p>Назад в перечень</p><img src="../img/sidebar/right.svg" class="right">
        `
        document.querySelector("#navmenu").appendChild(li_add)

        // Заполнение имени
        document.querySelector("#userName").innerHTML = `${response["user"]["full_name"]} (${accesses[response["user"]["access"]]})`

        // Проверка нужно ли формировать структуру input
        window.available_inputs = response["general_struct"]["available_inputs"]
        if (window.available_inputs) {
            // Создание кнопок
            let send_buttons = response["general_struct"]["send_buttons"]
            let buttons_info_buttons = document.querySelector("#buttons_info_buttons")
            if (send_buttons)
                send_buttons.forEach(button_info => {
                    let button = document.createElement("div")
                    button.className = "button"
                    button.id = button_info['id']
                    button.textContent = button_info['inner_text']
                    button.setAttribute("set_status", button_info['set_status'])
                    buttons_info_buttons.appendChild(button)
                })
        } else {
            document.querySelector("#main_application_info_background").remove()
        }

        // Заполнение справочниками только тем кому это необходимо
        if (["creator", "cma_redactor", "tb_redactor", "tb_admin"].includes(response["user"]["access"])) {
            updateManuals().then(() => { removeLoading() }) // Заполнение справочников datalist
        } else {
            removeLoading()
        }

        if (["cma_redactor", "cma_admin"].includes(response["user"]["access"])) {
            // Добавить кнопку сравнения заявок
            let li_add = document.createElement("li")
            li_add.classList.add("navmenu")
            li_add.classList.add("top25")
            li_add.setAttribute("title", "Сравнение заявок")
            li_add.setAttribute("onclick", "comparisonApplications()")
            li_add.innerHTML = `
            <img src="img/comparison.svg">
            <p>Сравнение заявок</p><img src="../img/sidebar/right.svg" class="right">
            `
            document.querySelector("#navmenu").appendChild(li_add)

            li_add = document.createElement("li")
            li_add.classList.add("navmenu")
            li_add.classList.add("top25")
            li_add.setAttribute("title", "Админ панель")
            li_add.setAttribute("onclick", `location.href = "../application_admin"`)
            li_add.innerHTML = `
            <img src="img/man_logo.svg">
            <p>Админ панель</p><img src="../img/sidebar/right.svg" class="right">
            `
            document.querySelector("#navmenu").appendChild(li_add)

            // создать вкладку со сравнением заявок
            let marker_comparison = document.createElement("div")
            marker_comparison.classList.add("markers")
            marker_comparison.id = "marker_comparison_application"
            marker_comparison.innerHTML = 'Сравнение заявок <span id="count_comparison_application_in_marker"></span>'
            main_markers_div.appendChild(marker_comparison)

            // создать таблицу со сравнением заявок
            let comparison_div = document.createElement("div")
            comparison_div.classList.add("application_table_divs")
            comparison_div.classList.add("comparison_application")
            comparison_div.classList.add("display_none")
            comparison_div.innerHTML = `
                <p>Сравнение</p>
                <div class="div_for_table">

                    <div class="head_row">
                        <div class="head_col number_comparison_row">№ АСУ/Заявки</div>
                        <div class="head_col nm_code_comparison_row">Код по НМ</div>
                        <div class="head_col product_name_comparison_row">Наименование изделия</div>
                        <div class="head_col product_type_comparison_row">Тип изделия</div>
                        <div class="head_col ntd_comparison_row">НТД</div>
                        <div class="head_col extra_options_comparison_row">Доп. параметры</div>
                        <div class="head_col measure_comparison_row">Единица измерения</div>
                        <div class="head_col product_group_comparison_row">Группа продукции</div>
                        <div class="head_col sample_size_comparison_row">Размер выборки, %</div>
                        <div class="head_col article_group_comparison_row">Группа изделия</div>
                        <div class="head_col note_comparison_row">Примечание</div>
                        <div class="head_col item_number_comparison_row">Вид номенклатуры</div>
                        <div class="head_col delete_comparison_row"></div>
                        <div class="head_col make_main_comparison_row"></div>
                    </div>

                    <div class="application_scroll_row_div" id="application_comparison" style="height: calc(96% - 37px);">
                    
                    </div>
                    <div class="button" id="delete_all_comparison_rows">Очистить всё</div>
                </div>
            `
            main_tables.appendChild(comparison_div)
            document.querySelector("#delete_all_comparison_rows").addEventListener("click", () => {
                queryAPI_delete({"login": login}, "delete_all_comparison_rows").then(i => {
                    let response = JSON.parse(i)
                    if (response["status"] == 200) {
                        draw_comparison_row()
                    } else {
                        response["message"] ? errorWin(response["message"]) : errorWin("Неизвестная ошибка!")
                    }
                })
            })
            draw_comparison_row()

            // Добавление крестиков для отчистки поля Тип изделия
            let new_span1 = document.createElement("span")
            new_span1.classList.add("span_item_close")
            new_span1.addEventListener("click", () => {document.querySelector("#product_type_info_div").value = ''})
            new_span1.innerHTML = '&times;'
            document.querySelector("#product_type_info_div").appendChild(new_span1)
            
            // Добавление крестиков для отчистки поля НТД
            let new_span2 = document.createElement("span")
            new_span2.classList.add("span_item_close")
            new_span2.addEventListener("click", () => {document.querySelector("#ntd_info_div").value = ''})
            new_span2.innerHTML = '&times;'
            document.querySelector("#ntd_info_div").appendChild(new_span2)
        }

        if (response["user"]["access"] == "creator") {
            // Добавить кнопку создания новой заявки
            let li_add = document.createElement("li")
            li_add.classList.add("navmenu")
            li_add.classList.add("top25")
            li_add.setAttribute("title", "Заявка на создание записи")
            li_add.setAttribute("onclick", "open_application_info(true)")
            li_add.innerHTML = `
            <img src="../img/sidebar/addRow.svg">
            <p>Заявка на создание записи</p><img src="../img/sidebar/right.svg" class="right">
            `
            document.querySelector("#navmenu").appendChild(li_add)

            // Добавить кнопку для для создания новой заявки на редактирование
            li_add = document.createElement("li")
            li_add.classList.add("navmenu")
            li_add.setAttribute("title", "Заявка на редактирование записи")
            li_add.setAttribute("onclick", "open_search_window()")
            li_add.innerHTML = `
            <img src="../img/sidebar/applicationEdit.svg">
            <p>Заявка на редактирование записи</p><img src="../img/sidebar/right.svg" class="right">
            `
            document.querySelector("#navmenu").appendChild(li_add)

            // Добавить кнопку для для множественной загрузки черновиков
            let li_file = document.createElement("li")
            li_file.classList.add("navmenu")
            li_file.setAttribute("title", "Множественная загрузка черновиков")
            li_file.setAttribute("onclick", "")
            li_file.innerHTML = `
            <img src="img/file_logo.svg" title="Множественная загрузка черновиков">
            <p>Множественная загрузка</p><img src="../img/sidebar/right.svg" class="right">
            <input id="load_draft_file" type="file" name="name" style="display: none;" accept=".xlsx"/>
            `
            document.querySelector("#navmenu").appendChild(li_file)
            li_file.addEventListener("click", () => {
                document.querySelector("#load_draft_file").click()
            })
            
            document.querySelector("#load_draft_file").addEventListener("change", e => {
                e.preventDefault
                let obj = new FormData()
                obj.append("file_routes", load_draft_file.files[0])
                obj.append("login", login)
                addLoading()
                queryAPI_post_file(obj, "load_application_from_file").then(i => {
                    let response = JSON.parse(i)
                    if(response["status"] == 200) {
                        response["message"] ? errorWinOk(response["message"], "Ошибки!") : successfullyWin("Файл загружен")
                    } else {
                        response["message"] ? errorWinOk(response["message"]) : errorWinOk("Неизвестная ошибка!")
                    }
                    output_applications(access="creator").then(() => {
                        removeLoading()
                    })
                })
                document.querySelector("#load_draft_file").value = ""
            })

            // создать вкладку с черновиками
            let draft_marker = document.createElement("div")
            draft_marker.classList.add("markers")
            draft_marker.id = "marker_draft_application"
            draft_marker.innerHTML = 'Черновики <span id="count_draft_in_marker"></span>'
            main_markers_div.appendChild(draft_marker)
            
            // создать таблицу с черновиками
            let draft_div = document.createElement("div")
            draft_div.classList.add("application_table_divs")
            draft_div.classList.add("draft_application")
            draft_div.classList.add("display_none")
            draft_div.innerHTML = `
                <p>Черновики</p>
                <div class="div_for_table">

                    <div class="head_row">
                        <div class="head_col checkbox_row"><input type="checkbox" class="my_checkbox" id="main_draft_checkbox"></div>
                        <div class="head_col application_id_row">№ П/П</div>
                        <div class="head_col fio_row">ФИО</div>
                        <div class="head_col departament_row">Подразделение</div>
                        <div class="head_col status_row">Статус</div>
                        <div class="head_col type_row">Тип заявки</div>
                        <div class="head_col responsible_cma_row">Ответственный в ЦМА</div>
                        <div class="head_col responsible_tb_row">Ответственный в ТБ</div>
                    </div>

                    <div class="application_scroll_row_div" id="application_draft" style="height: calc(96% - 37px);">

                    </div>
                    <div id="id312">
                        <div class="button" id="send_many_applications">Отправить в ЦМА</div>
                        <div class="button" id="delete_many_applications">Удалить заявки</div>
                    </div>
                </div>
            `
            main_tables.appendChild(draft_div)

            // Множественная отправка черновиков в ЦМА
            send_many_applications.addEventListener("click", () => {
                let application_id_list = get_ids_list_from_checkboxes()
                if (application_id_list.length == 0) {
                    errorWin("Не выбрана ни одна заявка")
                } else {
                    queryAPI_put({"application_id_list": application_id_list}, "create_many_application_from_draft").then(i => {
                        let response = JSON.parse(i)
                        if (response["status"] == 200) {
                            output_applications(access=window.access).then(() => {
                                successfullyWin("Отправлено!")
                                if (document.querySelectorAll(".draft_checkboxes").length == 0) {
                                    document.querySelector("#main_draft_checkbox").checked = false
                                }
                            })
                        } else {
                            response["message"] ? errorWin(response["message"]) : errorWin("Неизвестная ошибка!")
                        }
                    }).catch(() => { errorWin("Нет соединения с сервером!") })
                }
            })
            // Множественная удаление черновиков
            delete_many_applications.addEventListener("click", () => {
                let application_id_list = get_ids_list_from_checkboxes()
                if (application_id_list.length == 0) {
                    errorWin("Не выбрана ни одна заявка")
                } else {
                    queryAPI_delete({"application_id_list": application_id_list, "login": login}, "delete_many_application_from_draft").then(i => {
                        let response = JSON.parse(i)
                        if (response["status"] == 200) {
                            output_applications(access=window.access).then(() => {
                                successfullyWin("Черновики удалены")
                                if (document.querySelectorAll(".draft_checkboxes").length == 0) {
                                    document.querySelector("#main_draft_checkbox").checked = false
                                }
                            })
                        } else {
                            response["message"] ? errorWin(response["message"]) : errorWin("Неизвестная ошибка!")
                        }
                    }).catch(() => { errorWin("Нет соединения с сервером!") })
                }
            })
            // Добавление placeholder для Тип изделия и НТД
            document.querySelector("#product_type_info").setAttribute("placeholder", "обязательное поле")
            document.querySelector("#ntd_info").setAttribute("placeholder", "обязательное поле")

            // Добавление кнопки прикрепить файл
            let attached_files_div = document.querySelector("#attached_files_div")
            let new_div = document.createElement("div")
            new_div.innerHTML = `
            <img src="img/add_attached_file.svg" style="width: 50px;" id="add_attached_file_img" title="Прикрепить файлы" alt="">
            <p></p>
            <input type="file" class="display_none" id="attached_file_main_input" multiple>
            <span title="Сбросить файлы" class="span_attached_file_close">&times;</span>
            `
            attached_files_div.appendChild(new_div)
            let attached_file_main_input = new_div.querySelector("#attached_file_main_input")
            // изменение текста под картинкой
            attached_file_main_input.addEventListener("change", e => {
                if (e.currentTarget.files.length){
                    attached_files_div.querySelector("#attached_file_main_input").parentElement.querySelector("p").innerHTML = `Количество выбранных файлов: ${e.currentTarget.files.length}`
                }
                else {
                    attached_files_div.querySelector("#attached_file_main_input").parentElement.querySelector("p").innerHTML = ''
                }
                // проверка на максимальный размер файла
                let max_file_size = 10000000 // максимальное кол-во байт
                let one_Mb = 1000000 // 1 Мб ~= 1000000 б
                Array.from(e.currentTarget.files).forEach(file => {
                    if (file.size > max_file_size) {
                        new_div.querySelector("span").click()
                        errorWinOk(`${file.name} имеет размер ${(file.size / one_Mb).toFixed(1)} Мб. Максимальный размер файла: ${max_file_size / one_Mb} Мб`)
                    }
                })
            })
            // переадресация клика на input
            new_div.querySelector("#add_attached_file_img").addEventListener("click", () => {
                attached_file_main_input.click()
            })
            new_div.querySelector("span").addEventListener("click", e => {
                attached_file_main_input.value = ''
                let change_event = new Event("change")
                attached_file_main_input.dispatchEvent(change_event)
            })

        } else if (response["user"]["access"] == "tb_admin" || response["user"]["access"] == "cma_admin") {
            let head_checkbox = document.createElement("div")
            head_checkbox.classList.add("head_col")
            head_checkbox.classList.add("checkbox_row")
            head_checkbox.innerHTML = `<input type="checkbox" class="my_checkbox" id="main_draft_checkbox">`
            let head_await = document.querySelector("#application_await_head")
            head_await.insertBefore(head_checkbox, head_await.firstChild)
        }
        

        marker_event() // обновить события на нажатия маркеров
        output_applications(response["user"]["access"], response["general_struct"]["set_responsible"]) // Заполнение списков заявок
        window.access = response["user"]["access"]
    } else {
        errorWin(response["message"] ? response["message"] : 'Неизвестная ошибка!')
        setTimeout(() => {location.href = '../'}, 2000)
    }

}).catch(() => {
    errorWin("Нет соединения с сервером!")
    removeLoading()
})


// События на кнопки (обновление заявки, создание заявки)
document.querySelector("#buttons_info_buttons").addEventListener("click", e => {
    if (e.target.className == "button") {
        let button = e.target
        let application_id = Number($("#application_id_info").value)
        let body = {
            "login": login,
            "application_id": application_id,
            "new_status": Number(button.getAttribute("set_status")),
            "application_type": Number(window.application_type),
            "number_asu": window.number_asu,
            "set_status": Number(button.getAttribute("set_status")),
            "values": {}
        }
        // Заполнение всего кроме кодов по НМ
        let values = Array.from(document.querySelectorAll(".values_info"))
        values.forEach(element => {
            body["values"][element.id.replace("_info", "")] = element.value ? element.value : null
        })
        // Заполнение кодов по НМ
        let nm_codes_div = Array.from($("#info_nm_code_values").querySelectorAll(".nm_code_info_value"))
        if (nm_codes_div.length != 0){
            let nm_code_list = []
            nm_codes_div.forEach(element => {
                nm_code_list.push(Number(element.value))
            })
            body["values"]["nm_code"] = nm_code_list
        } else {
            body["values"]["nm_code"] = null
        }
        if (application_id) {
            queryAPI_put(body, "update_application").then(i => {
                let response = JSON.parse(i)
                if (response["status"] == 200) {
                    
                    // Нужно ли прикреплять файлы
                    if (window.access == "creator") {
                        if (document.querySelector("#attached_file_main_input").files.length) {
                            addLoading("Сохраняем прикреплённые файлы")
                            createAttachedFiles(application_id).then(() => {
                                removeLoading()
                                successfullyWin("Успешно!")
                            })
                        } else {
                            successfullyWin("Успешно!")
                        }
                    } else {
                        successfullyWin("Успешно!")
                    }
                    document.querySelector("#close_info").click()
                    output_applications(access=window.access)
                } else {
                    response["message"] ? errorWinOk(response["message"]) : (response["mistakes"] ? errorWinOk('Некоторые НМ коды уже заняты ') : errorWin("Неизвестная ошибка!"))
                }
            })
        } else {
            queryAPI_post(body, "create_application").then(i => {
                let response = JSON.parse(i)
                if (response["status"] == 200) {
                    // Нужно ли прикреплять файлы
                    if (document.querySelector("#attached_file_main_input").files.length) {
                        addLoading("Сохраняем прикреплённые файлы")
                        createAttachedFiles(response["application_id"]).then(() => {
                            removeLoading()
                            successfullyWin("Успешно!")
                        })
                    } else {
                        successfullyWin("Успешно!")
                    }
                    document.querySelector("#close_info").click()
                    output_applications(access=window.access)
                } else {
                    response["message"] ? errorWinOk(response["message"]) : errorWin("Неизвестная ошибка!")
                }
            }).catch(() => { errorWin("Нет соединения с сервером!") })
        }
    }
})


document.querySelector("#product_group_info").addEventListener("change", e => {
    // if (Number(e.target.value) == 2) {
    //     document.querySelector("#sample_size_info").value = "10 %"
    // }
    // sample_size_info = document.querySelector("#sample_size_info")
    // if (Number(e.target.value) != 2) {
    //     sample_size_info.value = ""
    //     sample_size_info.readOnly = true
    //     sample_size_info.style.background = "rgb(235, 235, 235)"
    // } else {
    //     sample_size_info.readOnly = false
    //     sample_size_info.style.background = "#FFFFFF"
    // }
})

// закрытие окна с историей жизни заявки
document.querySelector("#history_head").querySelector("img").addEventListener("click", () => {
    document.querySelector("#main_application_info_background").classList.add("display_none")
    document.querySelector("#main_application_history_div").classList.add("display_none")
})
