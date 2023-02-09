// заполнение select списком сотрудников
function load_responsible_select(select) {
    queryAPI_get(`get_all_responsible?login=${login}`).then(i => {
        let responsible_response = JSON.parse(i)
        if (responsible_response["status"] == 200) {
            // Заполнение выпадающего списка
            select.innerHTML = '<option></option>'
            responsible_response["responsible_list"].forEach(responsible => {
                let new_option = new Option(responsible["option_text"], responsible["value"])
                select.appendChild(new_option)
            })

            // Заполнение select для переназначения в application_await
            let all_select_in_application_await = Array.from(document.querySelector("#application_await").querySelectorAll("select"))
            all_select_in_application_await.forEach(sel => {
                sel.innerHTML = ""
            })
            select.querySelectorAll("option").forEach(item => {
                if (item.value) {
                    all_select_in_application_await.forEach(sel => {
                        let new_option = new Option(item.innerText, item.value)
                        sel.appendChild(new_option)
                    })
                }
            })
            all_select_in_application_await.forEach(sel => {
                sel.value = sel.getAttribute("responsible")
                let listener = e => {
                    let resp = e.currentTarget.value
                    let application_id = Number(e.currentTarget.parentElement.parentElement.querySelector(".application_id_row").innerText)
                    queryAPI_put({ "login": login, "fio": resp, "application_ids": [application_id, ]}, "appoint_responsible").then(i => {
                        let response = JSON.parse(i)
                        if (response["status"] == 200) {
                            successfullyWin(`Сотрудник "${resp}" успешно назначен ответственным на заявку с номером ${application_id}`, "Успешно!")
                            output_applications(access=window.access).then(() => {
                                load_responsible_select(select)
                            })
                        } else {
                            response["message"] ? errorWinOk(response["message"]) : errorWin("Неизвестная ошибка!!")
                        }
                    })
                }
                sel.removeEventListener('change', listener)
                sel.addEventListener("change", listener)
            })
        } else {
            errorWin(application_response["message"] ? application_response["message"] : 'Неизвестная ошибка!!')
        }
    })
}

// Получить список id заявок из чекбоксов
function get_ids_list_from_checkboxes() {
    let checkboxes = Array.from(document.querySelectorAll(".draft_checkboxes"))
    let application_id_list = []
    checkboxes.forEach(elem => {
        if (elem.checked) {
            application_id_list.push(Number(elem.parentElement.parentElement.querySelector(".application_id_row").textContent))
        }
    })
    return application_id_list
}

// Отрисовка кнопок возврата в черновики для создателей
function come_back_to_draft(application_id, responsible_cma) {
    if (responsible_cma) {
        return responsible_cma
    } else {
        return `<div class="button come_back_to_draft_buttons" application_id="${application_id}">Вернуть в черновик</div>`
    }
}

// Вывод заявок
async function output_applications(access = '', can_set_responsible = false) {
    await queryAPI_get(`get_applications?login=${login}`).then(i => {
        let application_response = JSON.parse(i)
        if (application_response["status"] == 200) {
            let divs_keys = ["application_action", "application_await", "application_completed", "application_draft"]
            for (let key of divs_keys) {
                if (application_response[key]) {
                    let scroll_div = $(`#${key}`)
                    let html_str = ``
                    application_response[key].forEach(row => {
                        html_str += `
                        <div class="application_row ${key}_row" onclick="show_detail_info(this, event)">
                            ${key == "application_draft" || (access == "tb_admin" && key == "application_action") || (access == "cma_admin" && key == "application_action") ? '<div class="col checkbox_row"><input type="checkbox" class="my_checkbox draft_checkboxes"></div>' : ''}
                            <div class="col application_id_row">${row["application_id"]}</div>
                            <div class="col fio_row">${row["fio"]}</div>
                            <div class="col departament_row">${row["departament"]}</div>
                            <div class="col status_row">${row["status"]}</div>
                            <div class="col type_row">${row["type"]}</div>
                            <div class="col responsible_cma_row">${(access == 'creator' && key == "application_await") ? come_back_to_draft(row["application_id"], row["responsible_cma"]) : ((access == 'cma_admin' && key == "application_await") ? `<select responsible="${row["responsible_cma"]}"></select>` : row["responsible_cma"])}</div>
                            <div class="col responsible_tb_row">${(access == 'tb_admin' && key == "application_await") ? `<select responsible="${row["responsible_tb"]}"></select>` : row["responsible_tb"]}</div>
                        </div>
                        `
                    })
                    scroll_div.innerHTML = html_str
                }
            }
            // установка событий на кнопки возвращения в черновик для создателей
            if (access == 'creator') {
                // счётчик количества черновиков
                document.querySelector("#count_draft_in_marker").innerHTML = `(${application_response["application_draft"].length})`
                document.querySelectorAll(".come_back_to_draft_buttons").forEach(button => {
                    button.addEventListener("click", e => {
                        let application_id = Number(e.currentTarget.getAttribute("application_id"))
                        queryAPI_put({"login": login, "application_id": application_id}, "return_draft").then(i => {
                            let response = JSON.parse(i)
                            if (response["status"] == 200) {
                                output_applications(access=window.access)
                                successfullyWin(`Заявка с номером ${application_id} возвращена в черновики`)
                            } else {
                                errorWin(response["message"] ? response["message"] : 'Неизвестная ошибка!!')
                            }
                        })
                    })
                })
            }

            // События на checkboxes
            if (access == "creator" || access == "tb_admin"|| access == "cma_admin") {
                let checkboxes = Array.from(document.querySelectorAll(".draft_checkboxes"))
                checkboxes.forEach(elem => {
                    elem.addEventListener("change", () => {
                        document.querySelector("#main_draft_checkbox").checked = checkboxes.every(elem => elem.checked) ? true : false
                    })
                })
                document.querySelector("#main_draft_checkbox").addEventListener("change", () => {
                    checkboxes.every(elem => elem.checked) ? checkboxes.forEach(elem => { elem.checked = false }) : checkboxes.forEach(elem => { elem.checked = true })
                })
            }
            
            // Добавление возможности назначать сотрудников для админов
            let set_responsible =  can_set_responsible
            if (set_responsible) {
                let new_select = document.createElement("select")
                document.querySelector("#smt_id1").appendChild(new_select)
                load_responsible_select(new_select) // заполнение select списком сотрудников
                // Назначение ответственного
                new_select.addEventListener("change", e => {
                    let application_id_list = get_ids_list_from_checkboxes()
                    if (application_id_list.length == 0) {
                        errorWin("Не выбрана ни одна заявка")
                    } else if (!e.currentTarget.value){
                            errorWin("Выберите сотрудника")
                    } else {
                        let a = e.currentTarget.value
                        queryAPI_put({ "login": login, "fio": e.currentTarget.value, "application_ids": application_id_list}, "appoint_responsible").then(i => {
                            let response = JSON.parse(i)
                            if (response["status"] == 200) {
                                errorWinOk(`Сотрудник "${a}" успешно назначен ответственным на заявки с номерами ${application_id_list}`, "Успешно!")
                                output_applications(access=window.access).then(() => {
                                    if (document.querySelectorAll(".draft_checkboxes").length == 0) {
                                        document.querySelector("#main_draft_checkbox").checked = false
                                    }
                                    load_responsible_select(new_select) // заполнение select списком сотрудников
                                })
                            } else {
                                response["message"] ? errorWinOk(response["message"]) : errorWin("Неизвестная ошибка!!")
                            }
                        })
                    }
                    e.currentTarget.value = ''
                })
            }
        } else {
            errorWin(application_response["message"] ? application_response["message"] : 'Неизвестная ошибка!!')
        }

    }).catch(() => { errorWin("Нет соединения с сервером!") })
}

// Вывод информации о заявки в inputs
function show_detail_info(e, ev) {
    inputs_struct(window.available_inputs) // Формирование структуры inputs
    let buttons_info_buttons = $("#buttons_info_buttons")
    if (buttons_info_buttons && ev.target.tagName != "SELECT" && ev.target.tagName != "INPUT" && !ev.target.classList.contains("come_back_to_draft_buttons")) {
        let application_id = Number(e.querySelector(".application_id_row").textContent)
        if (e.classList.contains("application_action_row") || e.classList.contains("application_await_row") || e.classList.contains("application_draft_row")) {
            open_application_info((e.classList.contains("application_action_row") || e.classList.contains("application_draft_row")) ? true : false)
            addLoading()
            queryAPI_get(`get_info_application?application_id=${application_id}`).then(i => {
                let response = JSON.parse(i)
                if (response["status"] == 200) {
                    let info = response["info"]
                    Object.keys(info).forEach(key => {
                        if (key == "nm_code_info") {
                            let nm_codes = response["info"]["nm_code_info"]
                            nm_codes.forEach(nm_code => {
                                $("#nm_code_info").value = nm_code
                                $("#plus_nm_code").click()
                            })
                        } else {
                            $(`#${key}`).value = info[key]
                        }
                    })
                    resizeTextArea("note_info")
                    resizeTextArea("comment_info")
                    // Заполнение типа изделия
                    let event = new Event('change')
                    document.querySelector("#product_name_info").dispatchEvent(event)
                    // document.querySelector("#product_group_info").dispatchEvent(event)
                    
                    // Подцветка изменённых позиций
                    if (response["new_changed_values"] || response["old_changed_values"]) {
                        Object.keys(response["old_changed_values"]).forEach(key => {
                            let element = document.querySelector(`#${key}`)
                            element.style.background = "rgb(245 11 11 / 15%)"
                            if (key == "nm_code_info") {
                                element.title = `Старое значение: ${response["old_changed_values"][key] ? response["old_changed_values"][key] : "ОТСУТСТВУЕТ"}\nНовое  значение: ${response["new_changed_values"][key] ? response["new_changed_values"][key] : "ОТСУТСТВУЕТ"}`
                            } else{
                                element.title = `Старое значение: ${response["old_changed_values"][key] ? response["old_changed_values"][key] : "ОТСУТСТВУЕТ"}`
                            }
                        })
                    }

                    // отрисовка прикреплённых файлов
                    if (response["file_paths"]) {
                        response["file_paths"].forEach(attached_file => {
                            let new_file = document.createElement("div")
                            new_file.classList.add("attached_file_main_div")
                            new_file.setAttribute("attached_file_id", attached_file["attached_file_id"])
                            new_file.innerHTML = `
                            <a href="${attached_file["path"]}">
                                <img src="img/attached_file.svg" alt="">
                                <p>${attached_file["path"].replace("attached_files/", "")}</p>
                            </a>
                            ${(e.classList.contains("application_action_row") ||
                               e.classList.contains("application_draft_row"))
                                 ? '<span title="Удалить прикреплённый файл" class="span_attached_file_close delete_attached_file">&times;</span>'
                                 : ""}
                            `

                            if (document.querySelector("#add_attached_file_img"))
                                document.querySelector("#attached_files_div").insertBefore(new_file, document.querySelector("#add_attached_file_img").parentElement)
                            else 
                                document.querySelector("#attached_files_div").appendChild(new_file)
                        })

                        // event на удаление прикреплённых файлов если
                        if (e.classList.contains("application_action_row") || e.classList.contains("application_draft_row")) {
                            document.querySelectorAll(".delete_attached_file").forEach(span => {
                                span.addEventListener("click", () => {
                                    queryAPI_delete({"attached_file_id": span.parentElement.getAttribute("attached_file_id")}, 'delete_attached_files').then(i => {
                                        let response = JSON.parse(i)
                                        if (response["status"] == 200) {
                                            show_detail_info(e, ev)
                                        } else {
                                            errorWin(response["message"] ? response["message"] : 'Неизвестная ошибка!!')
                                        }
                                    })
                                })
                            })
                        }

                    }
                    
                    response["message"] ? errorWinOk(response["message"]) : ''
                } else {
                    response["message"] ? errorWin(response["message"]) : errorWin("Неизвестная ошибка!")
                }
                removeLoading()
            }).catch(() => { errorWin("Нет соединения с сервером!") })
        } else {
            // тут вывод для завершённых заявок
            document.querySelector("#main_application_info_background").classList.remove("display_none")
            document.querySelector("#main_application_history_div").classList.remove("display_none")

            let table_div = document.querySelector("#history_main_table_div").querySelector("tbody")
            table_div.innerHTML = ''
            addLoading()
            queryAPI_get(`get_application_history?application_id=${application_id}`).then(i => {
                let response = JSON.parse(i)
                if (response["status"] == 200) {
                    document.querySelector("#history_application_id").innerHTML = application_id
                    response["values"].forEach(row => {
                        let tr = document.createElement("tr")
                        tr.innerHTML = `
                            <td>${row["status_name"] || ""}</td>
                            <td>${row["nm_code"] || ""}</td>
                            <td>${row["product_name"] || ""}</td>
                            <td>${row["product_type"] || ""}</td>
                            <td>${row["ntd"] || ""}</td>
                            <td>${row["extra_options"] || ""}</td>
                            <td>${row["measure"] || ""}</td>
                            <td>${row["product_group"] || ""}</td>
                            <td>${row["sample_size"] || ""}</td>
                            <td>${row["article_group"] || ""}</td>
                            <td>${row["note"] || ""}</td>
                            <td>${row["item_number"] || ""}</td>
                            <td>${row["comment"] || ""}</td>
                            <td>${row["datetime"] || ""}</td>
                        `
                        table_div.appendChild(tr)
                    })
                } else {
                    response["message"] ? errorWin(response["message"]) : errorWin("Неизвестная ошибка!")
                }
                removeLoading()
            })
        }
    }
}

// Регулярное выражение на пропуск регулярного выражения
function only_regex(elem, reg) {
    elem.value = elem.value.match(reg) ? elem.value.match(reg).join('') : ''
}

// Регулярное выражение на исключение регулярного выражения
function not_regex(elem, reg) {
    let letter = elem.value.match(reg) ? elem.value.match(reg)[0] : null
    elem.value = letter ? elem.value.replace(letter, '') : elem.value
}