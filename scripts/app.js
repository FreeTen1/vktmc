var limit_rows = 25
// авторизация
queryAPI_post({"login": login}, "auth").then(i => {
    let response = JSON.parse(i)
    if (response['status'] == 200){
        document.querySelector("#userName").textContent = response['fio']
        limit_rows = response['number_display_row']
        document.querySelector(".select_limited_div").querySelectorAll(".select_limit_row_value").forEach(elem => {
            if (elem.textContent.includes(limit_rows)) {
                elem.classList.add("selected_pag")
            }
        })
        if (response['access'] == 'admin') {
            let add_div = document.createElement('div')
            add_div.className = 'button'
            add_div.id = 'add_row_button'
            add_div.setAttribute('onclick', 'openCloseAddEditNewRow()')
            add_div.innerHTML = `<img src="img/plus.svg" alt=""><p>Добавить запись</p>`
            document.querySelector(".select_button_div").insertBefore(add_div, document.querySelector("#right_action"))

            let add_div_sidebar = document.createElement('li')
            add_div_sidebar.className = 'top25 navmenu'
            add_div_sidebar.title = 'Добавить запись'
            add_div_sidebar.setAttribute('onclick', 'openCloseAddEditNewRow()')
            add_div_sidebar.innerHTML = '<img src="img/sidebar/addRow.svg"> <p>Добавить запись</p> <img src="img/sidebar/right.svg" class="right">'
            document.querySelector("#navmenu").appendChild(add_div_sidebar)

            // Обновление карт контроля
            let div_update_control_card = document.createElement("div")
            div_update_control_card.className = "drop_down_buttons"
            div_update_control_card.innerHTML = `
            <img src="img/update_control_card_img.svg" alt="">
            <p>Обновить карты контроля</p>
            `
            document.querySelector("#right_action").insertBefore(div_update_control_card, document.querySelector(".search_div"))
            div_update_control_card.addEventListener("click", () => {
                addLoading('Обновления карт контроля')
                queryAPI_put({"login": login}, "update_control_card").then(i => {
                    let response = JSON.parse(i)
                    if (response["status"] == 200) {
                        successfullyWin("Успешно обновлено!")
                        getNumber_pp()
                    } else {
                        response["message"] ? errorWin(response["message"]) : errorWin("Неизвестная ошибка!")
                    }
                    removeLoading()
                })
            })

            // инструкция
            document.querySelector("#instruction").href = "instruction/instruction_admin.pdf"
            
            // редактирование записи
            document.body.oncontextmenu = function () { return false } // Отключение ПКМ в блоке
            document.querySelector(".table_scroll_div").addEventListener('mousedown', e => {
                deleteElemById('pop_up_div')
                if (e.which == 3) {
                    e.path.forEach(element => { if (element.classList == "table_row_div") { curr_row = element } })
                    let number_pp = curr_row.querySelector("p").textContent
                    let pop_up_div = document.createElement('div')
                    pop_up_div.id = 'pop_up_div'
                    pop_up_div.setAttribute("style", `position: absolute; left: ${e.pageX + 15}px; top: ${e.pageY - 120}px;`)
                    pop_up_div.innerHTML = `
                        <div id=pop_up_edit onclick="deleteElemById('pop_up_div'); copyEdit(${number_pp}, 'edit')">Редактировать</div>
                        <div id=pop_up_copy onclick="deleteElemById('pop_up_div'); copyEdit(${number_pp}, 'copy')">Копировать</div>
                        <div id=pop_up_copy onclick="deleteElemById('pop_up_div'); deleteRow(${number_pp})">Удалить</div>
                    `
                    document.body.appendChild(pop_up_div)
                    document.body.addEventListener('click', () => { deleteElemById('pop_up_div') })
                }
            })

            // выгрузка по датам
            makeDivForLoadDate(main_id='date_excel_changed_row', is_archived=0, report_name='Изменённые позиции', description='Записи, у которых были изменены «Группа продукции» и/или «Размер выборки, %', query='get_excel_file_date_change_row')
            makeDivForLoadDate(main_id='date_excel_deleted', is_archived=1, report_name='Удалённые позиции', description='Записи, удаленные из перечня ВКТМЦ', query='get_excel_file_date')
            makeDivForLoadDate(main_id='date_excel', is_archived=0, report_name='Добавленные позиции', description='Записи, добавленные в перечень ВКТМЦ', query='get_excel_file_date')

            document.body.oncontextmenu = function () { return false } // выключение ПКМ в блоке
        } else if (response['access'] == 'user') {
            // инструкция для обычных пользователей
            document.querySelector("#instruction").href = "instruction/instruction_user.pdf"
        }
    } else if (response['status'] == 404) {
        errorWin(response['message'])
        addLoading()
    }
}).catch(() => {errorWin("Нет соединения с сервером!")})
var filter_on = false
autosize(document.querySelector('#add_edit_note'))

updateManuals()

getNumber_pp()


// пагинация
document.querySelector('.page_number').addEventListener('click', e => {
    let page_info = e.target.getAttribute('page_info')
    parseInt(page_info) ? makePaginationNumber(Number(page_info)) : '' //если номер страницы, то перейди на этот номер
    if (page_info == 'previous_page') { // если previous_page то перейди на предыдущую страницу
        let selected_page = Number(document.querySelector('.selected').textContent)
        makePaginationNumber(selected_page - 1)
    }
    if (page_info == 'next_page') { // если next_page то перейди на следующую страницу
        let selected_page = Number(document.querySelector('.selected').textContent)
        makePaginationNumber(selected_page + 1)
    }
    if (page_info == 'first_page') { // если first_page то перейди на первую страницу
        makePaginationNumber(1)
    }
    if (page_info == 'last_page') { // если last_page то перейди на последнюю страницу
        makePaginationNumber(window.total_page)
    }
    filter_on ? showVktmcRow(null, null, Number(document.querySelector('.selected').textContent - 1) * limit_rows) : showVktmcRow(window.number_pp_list[Number(document.querySelector('.selected').textContent - 1) * limit_rows], window.number_pp_list[Number(document.querySelector('.selected').textContent - 1) * limit_rows + limit_rows - 1] ? window.number_pp_list[Number(document.querySelector('.selected').textContent - 1) * limit_rows + limit_rows - 1] : window.number_pp_list[window.number_pp_list.length - 1]) // вызов функции отрисовки записей
})


// применение фильтра
document.querySelector("#apply_filter").addEventListener('click', e => {
    applyFilter()
})


// сброс фильтра
document.querySelector("#drop_filter").addEventListener('click', () => {
    document.querySelector("#head_row").querySelectorAll("span").forEach(item => {item.innerHTML = ''}) // убираю стрелочки
    document.querySelector("#head_row").querySelectorAll("div").forEach(item => {item.classList.remove('hover_div')}) // убираю указатель с заголовков
    window.vktmc_row ? delete window.vktmc_row : ''
    let inputs = document.querySelector(".search_block").querySelectorAll("input")
    inputs.forEach(element => {
        element.value = ''
        element.removeAttribute("style")
    })
    filter_on = false
    getNumber_pp()
})


// заполнение списком тип изделия в фильтрах
document.querySelector("#product_name").addEventListener('change', e => {
    queryAPI_get(`get_type_list?product_name=${e.target.value}`).then(i => {
        let response = JSON.parse(i)
        if (response['status'] == 200) {
            makeOption(response['type_list']).then(i => {
                document.querySelector("#filter_product_type_list").innerHTML = i
            })
        }
    }).catch(() => {
        errorWin(`Нет соединения с сервером`)
    })
})
// заполнение списком тип изделия в добавлении
document.querySelector("#add_edit_product_name").addEventListener('change', e => {
    queryAPI_get(`get_type_list?product_name=${e.target.value}`).then(i => {
        let response = JSON.parse(i)
        if (response['status'] == 200) {
            makeOption(response['type_list']).then(i => {
                document.querySelector("#add_edit_product_type_list").innerHTML = i
            })
        }
    }).catch(() => {
        errorWin(`Нет соединения с сервером`)
    })
})



// добавление новой записи
document.querySelector("#add_edit_new_row_div").querySelector(".button").addEventListener("click", e => {
    let body = { "NM_code": [] }
    let inputs = document.querySelector("#add_edit_new_row_background").querySelectorAll('input')
    inputs.forEach(element => {
        (element.className == 'add_edit_nm_code') ? (element.value ? body['NM_code'].push(element.value) : '') : // Заполнение nm_code
            (element.value ? body[String(element.id).replace("add_edit_", '')] = element.value : body[String(element.id).replace("add_edit_", '')] = null) // Заполнение остальных полей
    })
    body['note'] = document.querySelector('#add_edit_note').value
    delete body.main_nm_code_input
    if (e.target.id == 'add_new_row') {
        if (Array.from(document.querySelector("#add_edit_new_row_div").querySelectorAll(".important_field")).every(item => { return Boolean(item.value) })) {
            // тут сбор и отправка в апи данных для добавления
            queryAPI_post({"values": body, "login":login}, 'add_vktmc_row').then(i => {
                let response = JSON.parse(i)
                if (response['status'] == 200) {
                    successfullyWin('Успешно добавлено!')
                    getNumber_pp()
                    openCloseAddEditNewRow()
                    updateManuals()
                } else if (response['status'] == 400 && Boolean(response['mistakes'])) {
                    let message_str = ``
                    response['mistakes'].forEach(item => {
                        message_str += `Код по НМ: ${item['nm_code']} есть у следующих № АСУ-Метро: ${item['number_asu'].join(', ')}\n`
                    })
                    errorWinOk(message_str)
                } else {
                    response['message']?errorWin(response['message']):errorWin('Ошибка! перепроверьте данные')
                }
            })
        } else {
            errorWin("Заполнены не все обязательные поля")
        }
    } else if (e.target.id == 'edit_row') {
        if (Array.from(document.querySelector("#add_edit_new_row_div").querySelectorAll(".important_field")).every(item => { return Boolean(item.value) })) {
            // тут сбор и отправка в апи данных для редактирования
            queryAPI_put({"values": body, "login":login, "ip":ip}, 'update_vktmc_row').then(i => {
                let response = JSON.parse(i)
                if (response['status'] == 200) {
                    queryAPI_delete({ "number_asu": body['number_asu'], "nm_code": body['NM_code'] }, 'delete_nm_code').then(i => {
                        let response = JSON.parse(i)
                        if (response['status'] == 200) {
                            successfullyWin('Успешно отредактировано!')
                            if (filter_on) {
                                let selected_page = Number(document.querySelector(".selected").textContent)
                                applyFilter().then(() => {
                                    makePaginationNumber(selected_page)
                                    document.querySelector(".selected").click()
                                })
                            } else {
                                document.querySelector('.page_number').click()
                            }
                            openCloseAddEditNewRow()
                        } else if (response['status'] == 400 && Boolean(response['mistakes'])) {
                            let message_str = ``
                            response['mistakes'].forEach(item => {
                                message_str += `Код по НМ: ${item['nm_code']} есть у следующих № АСУ-Метро: ${item['number_asu'].join(', ')}\n`
                            })
                            errorWinOk(message_str)
                        } else {
                            errorWin('Ошибка!')
                        }
                    })
                    updateManuals()
                } else {
                    errorWin(response['message']?response['message']:'Неизвестная ошибка!')
                }
            }).catch(() => {errorWin('Нет соединения с сервером')})
        } else {
            errorWin("Заполнены не все обязательные поля")
        }
    }
})

document.querySelector("#add_edit_nm_code_values").addEventListener("click", e => {
    let main_add_edit_nm_code_input = document.querySelector("#main_add_edit_nm_code_input")
    if (e.target.id == 'plus_nm_code' && main_add_edit_nm_code_input.value) {
        let new_div = document.createElement("div")
        new_div.innerHTML = `
        <input type="number" class="add_edit_nm_code" value="${main_add_edit_nm_code_input.value}" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
        <img src="img/close_nm_code.svg" id="close_nm_code" alt="">
        <p>${main_add_edit_nm_code_input.value.length}</p>
        `
        main_add_edit_nm_code_input.value = ''
        main_add_edit_nm_code_input.parentNode.querySelector("p").innerHTML = ''
        document.querySelector("#add_edit_nm_code_values").append(new_div)
    } else if (e.target.id == 'close_nm_code') {
        e.target.parentNode.remove()
    }
})


//Общая выгрузка всех строк
document.querySelector("#total_vktmc_row").addEventListener("click", () => {
    addLoading()
    queryAPI_get(`get_excel_file_vktmc?login=${login}&ip=${ip}`).then((i) => {
        let response = JSON.parse(i)
        if (response['status'] == 200) {
            document.location = document.location.href + response['path']
        } else {
            response['message']?errorWin(response['message']):errorWin('Ошибка!')
        }
        removeLoading()
    }).catch(() => {
        errorWin(`Нет соединения с сервером`)
        removeLoading()
    })
})

//Выгрузка отфильтрованных строк
document.querySelector("#load_filter").addEventListener("click", () => {
    addLoading()
    let body = {}
    let inputs = document.querySelector('.search_block ').querySelectorAll('input')
    inputs.forEach(item => {
        item.value ? body[item.id] = item.value : ''
    })
    let query_list = []
    Object.keys(body).forEach(key => {
        query_list.push(`${key}=${body[key]}`)
    })
    queryAPI_get(`get_excel_file_filter_vktmc?${query_list.join('&')}&login=${login}&ip=${ip}`).then((i) => {
        let response = JSON.parse(i)
        if (response['status'] == 200) {
            document.location = document.location.href + response['path']
        } else {
            response['message']?errorWin(response['message']):errorWin('Ошибка!')
        }
        removeLoading()
    }).catch(() => {
        errorWin(`Нет соединения с сервером`)
        removeLoading()
    })
})

// Изменение количества выводимых строк
document.querySelector(".select_limited_div").addEventListener('click', e => {
    if (e.target.classList == 'select_limit_row_value') {
        limit_rows = Number(e.target.getAttribute('value'))
        queryAPI_put({"login":login, "number_display_row": limit_rows}, 'save_settings').then(i => {
            let response = JSON.parse(i)
            if (response['status'] == 200) {
                successfullyWin('Настройка сохранена')
                document.querySelector(".select_limited_div").querySelectorAll(".select_limit_row_value").forEach(elem => {
                    if (elem.textContent.includes(limit_rows)) {
                        elem.classList.add("selected_pag")
                    } else {
                        elem.classList.remove("selected_pag")
                    }
                })
            } else if (response['status'] == 400) {
                errorWin(response['message'])
            } else {
                errorWin('Неизвестная ошибка во время сохранения настройки "кол-во отображаемых строк"')
            }
        })
        filter_on ? document.querySelector("#apply_filter").click() : document.querySelector("#drop_filter").click()
        document.querySelector("#limited_div").querySelector("img").click()
    }
})
document.querySelector("#limited_div").querySelector("img").addEventListener("click", e => {
    let select_limited_div = document.querySelector(".select_limited_div")
    if (select_limited_div.style.display == "none") {
        select_limited_div.style.display = ''
        e.target.src = 'img/arrow_down.svg'
        document.querySelector('.select_limited_div').style.left = `${e.pageX - 85}px`
        document.querySelector('.select_limited_div').style.top = `${e.pageY - 135}px`
    } else {
        select_limited_div.style.display = "none"
        e.target.src = 'img/arrow_up.svg'
    }
})


// Изменение цвета input в фильтрации если там есть value #bee7bb
document.querySelector(".search_block").addEventListener('change', e => {
    if (e.target.tagName === 'INPUT')
        e.target.value ? e.target.style.background = "#bee7bb" : e.target.removeAttribute("style")
})

// Обработка клавиши enter в фильтрах
document.querySelector(".search_block").addEventListener('keydown', e => {
    if (e.keyCode === 13) {
        document.querySelector("#apply_filter").click()
    }
})

// Обработка клавиши enter в пагинации
document.querySelector("#select_page_pagination_input").addEventListener('keydown', e => {
    if (e.keyCode === 13) {
        if (e.target.value > window.total_page){
            makePaginationNumber(window.total_page)
            document.querySelector(".selected").click()
        } else {
            makePaginationNumber(Number(e.target.value))
            document.querySelector(".selected").click()    
        }
        e.target.value = ''
    }
})


// Сортировка по столбцам
document.querySelector("#head_row").addEventListener('click', e => {
    if (filter_on) {
        addLoading()
        let triangle = {"ASC": "&#9650;", "DESC": "&#9660;"}
        let sort_div = e.target.tagName === 'DIV'? e.target : e.target.parentNode
        let sort_name = e.target.tagName === 'DIV'? e.target.getAttribute('sort_name') : e.target.parentNode.getAttribute('sort_name')
        let sort_by = e.target.tagName === 'DIV'? e.target.getAttribute('sort_by') : e.target.parentNode.getAttribute('sort_by')
        let body = {}
        let inputs = document.querySelector('.search_block ').querySelectorAll('input')
        inputs.forEach(item => {
            item.value ? body[item.id] = item.value : ''
        })
        query_list = []
        Object.keys(body).forEach(key => {
            query_list.push(`${key}=${body[key]}`)
        })
        queryAPI_get(`filter?${query_list.join('&')}&sort_name=${sort_name}&sort_by=${sort_by}`).then(i => {
            response = JSON.parse(i)
            if (response['status'] == 200) {
                window.vktmc_row = response['vktmc_row']
                window.total_page = Math.floor(response['vktmc_row'].length / limit_rows) + 1
                makePaginationNumber(window.total_page)
                showVktmcRow(null, null, Number(document.querySelector('.selected').textContent - 1) * limit_rows)
                document.querySelector("#head_row").querySelectorAll("span").forEach(item => {item.innerHTML = ''}) // очищение стрелочек
                sort_div.querySelector("span").innerHTML = triangle[sort_by] // создание нужной стрелочки
                sort_div.getAttribute('sort_by') == "ASC" ? sort_div.setAttribute("sort_by", "DESC") : sort_div.setAttribute("sort_by", "ASC") // изменение сортировки стрелочки
                removeLoading()
            } else {
                errorWin('Не переданы параметры поиска')
                removeLoading()
            }
        }).catch(e => {
            errorWin(`Нет соединения с сервером`)
            removeLoading()
        })
    }
})


// отображение столбцов
document.querySelector(".column_display_block").addEventListener("click", () => {
    displayColumn()
})

document.querySelector("#button_display_column").addEventListener("click", () => {
    let checkboxes = Array.from(document.querySelector(".column_display_block").querySelectorAll("input"))
    let checkboxes_status = checkboxes.every(checkbox => {return checkbox.checked})
    if (checkboxes_status) {
        checkboxes.forEach(checkbox => {checkbox.checked = false})
    } else {
        checkboxes.forEach(checkbox => {checkbox.checked = true})
    }
})

// удрать возможность вписывать запретные символы в input при добавлении или редактировании
let add_edit_inputs = document.querySelector("#add_edit_values_div").querySelectorAll("input")
Array.from(add_edit_inputs).forEach(input => {
    input.oninput = () => {
        input.value = input.value.replace(/[<>!]/gi, '')
    }
})
let = add_edit_note = document.querySelector("#add_edit_note")
add_edit_note.oninput = () => {
    add_edit_note.value = add_edit_note.value.replace(/[<>!]/gi, '')
}

document.querySelector("#add_edit_product_group").addEventListener("change", e => {
    if (Number(e.target.value) == 2) {
        document.querySelector("#add_edit_sample_size").value = "10 %"
    }
})





