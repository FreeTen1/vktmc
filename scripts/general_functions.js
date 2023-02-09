// Получить дату
function getDate() {
    let date_to = new Date();
    let dd_from = String(date_to.getDate()).padStart(2, '0');
    let mm_from = String(date_to.getMonth() + 1).padStart(2, '0');
    let yyyy_from = date_to.getFullYear();

    let date_from = new Date()
    date_from.setDate(date_to.getDate() - 1)
    let dd_to = String(date_from.getDate()).padStart(2, '0');
    let mm_to = String(date_from.getMonth() + 1).padStart(2, '0');
    let yyyy_to = date_from.getFullYear();

    date_to = yyyy_from + '-' + mm_from + '-' + dd_from;
    date_from = yyyy_to + '-' + mm_to + '-' + dd_to;
    return [date_from, date_to]
}

// создание списков
async function makeOption(value_list) {
    let result_str = ``
    value_list.forEach(item => {
        result_str += `<option value="${item['value']}">${item['description'] ? item['description'] : ''}</option>`
    })
    return result_str
}

// наполнение списками input
async function updateManuals() {
    await queryAPI_get('get_value_list').then(i => {
        let response = JSON.parse(i)
        makeOption(response['product_name']).then(i => {
            document.querySelector("#filter_product_name_list").innerHTML = i
            document.querySelector("#add_edit_product_name_list").innerHTML = i
        })
        makeOption(response['ntd']).then(i => {
            document.querySelector("#filter_ntd_list").innerHTML = i
            document.querySelector("#add_edit_ntd_list").innerHTML = i
        })
        makeOption(response['measure']).then(i => {
            document.querySelector("#filter_measure_list").innerHTML = i
            document.querySelector("#add_edit_measure_list").innerHTML = i
        })
        makeOption(response['product_group']).then(i => {
            document.querySelector("#filter_product_group_list").innerHTML = i
            document.querySelector("#add_edit_product_group_list").innerHTML = i
        })
        makeOption(response['sample_size']).then(i => {
            document.querySelector("#filter_sample_size_list").innerHTML = i
            document.querySelector("#add_edit_sample_size_list").innerHTML = i
        })
        makeOption(response['article_group']).then(i => {
            document.querySelector("#filter_article_group_list").innerHTML = i
            document.querySelector("#add_edit_article_group_list").innerHTML = i
        })
        makeOption(response['item_number']).then(i => {
            document.querySelector("#filter_item_number_list").innerHTML = i
            document.querySelector("#add_edit_item_number_list").innerHTML = i
        })
    }).catch(() => {
        errorWin(`Нет соединения с сервером`)
    })
}

// Удаление объекта по id
function deleteElemById(id) {
    let some_elem = document.querySelector(`#${id}`)
    if (some_elem) {
        some_elem.remove()
    }
}

//Открытие или закрытие блока с поиском (меняет высоту таблицы)
async function openCloseSearch() {
    let search_div = document.querySelector('.search_div') // кнопка для вывода блока
    let search_block = document.querySelector('.search_block') // блок с содержимым
    document.querySelector('.report_block').classList.remove('display_flex')
    document.querySelector('.report_block').classList.add('display_none')
    document.querySelector('.report_div').querySelector('img').src = 'img/arrow_down.svg'

    document.querySelector('.column_display_block').classList.remove('display_flex')
    document.querySelector('.column_display_block').classList.add('display_none')
    document.querySelector('.column_display_div').querySelector('img').src = 'img/arrow_down.svg'
    if (search_block.classList.contains('display_none')) { // Раскрытие
        search_div.querySelector('img').src = 'img/arrow_up.svg'
        document.querySelector('.main_table_div').classList.add('lower_height_main_table_div')
        document.querySelector('.table_scroll_div').classList.add('lower_height_table_scroll_div')
    } else { // Закрытие
        search_div.querySelector('img').src = 'img/arrow_down.svg'
        document.querySelector('.main_table_div').classList.remove('lower_height_main_table_div')
        document.querySelector('.table_scroll_div').classList.remove('lower_height_table_scroll_div')
    }
    search_block.classList.toggle('display_none')
}


//Открытие или закрытие блока с отчётами (меняет высоту таблицы)
async function openCloseReport() {
    let report_div = document.querySelector('.report_div') // кнопка для вывода блока
    let report_block = document.querySelector('.report_block') // блок с содержимым
    document.querySelector('.search_block').classList.remove('display_flex')
    document.querySelector('.search_block').classList.add('display_none')
    document.querySelector('.search_div').querySelector('img').src = 'img/arrow_down.svg'

    document.querySelector('.column_display_block').classList.remove('display_flex')
    document.querySelector('.column_display_block').classList.add('display_none')
    document.querySelector('.column_display_div').querySelector('img').src = 'img/arrow_down.svg'
    if (report_block.classList.contains('display_none')) { // Раскрытие
        report_div.querySelector('img').src = 'img/arrow_up.svg'
        document.querySelector('.main_table_div').classList.add('lower_height_main_table_div')
        document.querySelector('.table_scroll_div').classList.add('lower_height_table_scroll_div')
    } else { // Закрытие
        report_div.querySelector('img').src = 'img/arrow_down.svg'
        document.querySelector('.main_table_div').classList.remove('lower_height_main_table_div')
        document.querySelector('.table_scroll_div').classList.remove('lower_height_table_scroll_div')
    }
    report_block.classList.toggle('display_none')
}
//Открытие или закрытие блока с отображением столбцов
async function openCloseColumnDisplay() {
    let column_display_div = document.querySelector('.column_display_div') // кнопка для вывода блока
    let column_display_block = document.querySelector('.column_display_block') // блок с содержимым
    document.querySelector('.search_block').classList.remove('display_flex')
    document.querySelector('.search_block').classList.add('display_none')
    document.querySelector('.search_div').querySelector('img').src = 'img/arrow_down.svg'

    document.querySelector('.report_block').classList.remove('display_flex')
    document.querySelector('.report_block').classList.add('display_none')
    document.querySelector('.report_div').querySelector('img').src = 'img/arrow_down.svg'
    if (column_display_block.classList.contains('display_none')) { // Раскрытие
        column_display_div.querySelector('img').src = 'img/arrow_up.svg'
        document.querySelector('.main_table_div').classList.add('lower_height_main_table_div')
        document.querySelector('.table_scroll_div').classList.add('lower_height_table_scroll_div')
    } else { // Закрытие
        column_display_div.querySelector('img').src = 'img/arrow_down.svg'
        document.querySelector('.main_table_div').classList.remove('lower_height_main_table_div')
        document.querySelector('.table_scroll_div').classList.remove('lower_height_table_scroll_div')
    }
    column_display_block.classList.toggle('display_none')
}

//Открытие и закрытие блока добавления записи
async function openCloseAddEditNewRow(add = true) {
    document.querySelector("#add_edit_new_row_div").querySelector(".button").id = "add_new_row"
    document.querySelector("#add_edit_new_row_div").querySelector(".button").textContent = "Сохранить"
    document.querySelector("#add_edit_head").querySelector("p").innerHTML = "Добавить новую запись"
    document.querySelector("#add_edit_number_asu").readOnly = false
    document.querySelector("#add_edit_control_card").removeAttribute("style")
    let background = document.querySelector("#add_edit_new_row_background")
    background.classList.toggle('display_none')
    let inputs = background.querySelectorAll("input")
    inputs.forEach(element => { element.value = '' }) // обнуление всех input 
    // обнуление кодов по нм
    document.querySelector("#add_edit_nm_code_values").innerHTML = ` 
    <div>
        <input type="number" id="main_add_edit_nm_code_input" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
        <img src="img/plus.svg" id="plus_nm_code" alt="">
        <p></p>
    </div>
    `
    document.querySelector('#add_edit_note').value = ''
    resizeTextArea('add_edit_note')
    if (add) {
        queryAPI_get('get_last_row').then(i => {
            let response = JSON.parse(i)
            document.querySelector("#add_edit_number_pp").value = response['number_pp']
            document.querySelector("#add_edit_number_asu").value = response['number_asu']
        })
    }

    document.querySelector("#main_add_edit_nm_code_input").addEventListener("input", e => {
        let parent_div = e.currentTarget.parentNode
        let value = e.currentTarget.value
        // Проверка на кол-во символов
        if (value.length <= 15) {
            // отрисовка кол-ва символов
            value.length != 0 ? parent_div.querySelector("p").innerHTML = value.length : parent_div.querySelector("p").innerHTML = ''
        } else {
            e.currentTarget.value = value.slice(0, 15)
        }
    })
}


// Создание номеров страничек в пагинации 
function makePaginationNumber(current_page) {
    if (current_page <= window.total_page && current_page >= 1) {
        let page_numbers_div = document.querySelector('#page_numbers')
        let html_str = ``
        if (current_page + 2 >= window.total_page) {
            html_str = `
            <div class="page_number_button" page_info="${window.total_page - 4}">${window.total_page - 4}</div>
            <div class="page_number_button" page_info="${window.total_page - 3}">${window.total_page - 3}</div>
            <div class="page_number_button" page_info="${window.total_page - 2}">${window.total_page - 2}</div>
            <div class="page_number_button" page_info="${window.total_page - 1}">${window.total_page - 1}</div>
            <div class="page_number_button" page_info="${window.total_page}">${window.total_page}</div>
            `
        }
        else {
            if (current_page - 2 <= 1) {
                html_str = `
                <div class="page_number_button" page_info="1">1</div>
                <div class="page_number_button" page_info="2">2</div>
                <div class="page_number_button" page_info="3">3</div>
                <div class="page_number_button" page_info="4">4</div>
                <div class="page_number_button" page_info="5">5</div>
                `
            } else {
                html_str = `
                <div class="page_number_button" page_info="${current_page - 2}">${current_page - 2}</div>
                <div class="page_number_button" page_info="${current_page - 1}">${current_page - 1}</div>
                <div class="page_number_button" page_info="${current_page}">${current_page}</div>
                <div class="page_number_button" page_info="${current_page + 1}">${current_page + 1}</div>
                <div class="page_number_button" page_info="${current_page + 2}">${current_page + 2}</div>
                `
            }
        }
        if (window.total_page <= 5) {
            html_str = ``
            for (let i = 0; i < window.total_page; i++) {
                html_str += `<div class="page_number_button" page_info="${i + 1}">${i + 1}</div>`
            }
        }
        page_numbers_div.innerHTML = html_str
        page_numbers_div.querySelectorAll('div').forEach(element => {
            element.textContent == current_page ? element.classList.add('selected') : element.classList.remove('selected')
        })

        document.querySelector("#limited_div").querySelector("p").innerHTML = `${(Number(document.querySelector('.selected').textContent) - 1) * limit_rows + 1} - ${window.vktmc_row ? (Number(document.querySelector('.selected').textContent) * limit_rows > window.vktmc_row.length ? window.vktmc_row.length : (Number(document.querySelector('.selected').textContent)) * limit_rows) : (Number(document.querySelector('.selected').textContent) * limit_rows > window.number_pp_list.length ? window.number_pp_list.length : (Number(document.querySelector('.selected').textContent)) * limit_rows)} из ${window.vktmc_row ? window.vktmc_row.length : window.number_pp_list.length}`
    }
}


//Получение списка всех id записей
async function getNumber_pp() {
    addLoading()
    await queryAPI_get('get_vktmc_row').then(values => {
        let response = JSON.parse(values)
        window.number_pp_list = response['ids_list']
        window.total_page = response['ids_list'].length % limit_rows == 0 ? Math.floor(response['ids_list'].length / limit_rows) : Math.floor(response['ids_list'].length / limit_rows) + 1
        makePaginationNumber(window.total_page)
        showVktmcRow(window.number_pp_list[Number(document.querySelector('.selected').textContent - 1) * limit_rows], window.number_pp_list[Number(document.querySelector('.selected').textContent - 1) * limit_rows + limit_rows - 1] ? window.number_pp_list[Number(document.querySelector('.selected').textContent - 1) * limit_rows + limit_rows - 1] : window.number_pp_list[window.number_pp_list.length - 1]) // вызов функции отрисовки записей
        removeLoading()
    }).catch(e => {
        errorWin(`Нет соединения с сервером`)
        removeLoading()
    })
}


//Вывод записей из БД ВКТМЦ
function showVktmcRow(first_id = null, last_id = null, first_id_filter = null) {
    let table_scroll_div = document.querySelector('.table_scroll_div')
    //вывод всех записей
    if (first_id && last_id) {
        queryAPI_get(`get_vktmc_row?first_id=${first_id}&last_id=${last_id}`).then(i => {
            let response = JSON.parse(i)
            if (response['status'] == 200) {
                let rows = response['vktmc_row']
                let html_str = ``
                rows.forEach(row => {
                    html_str += `
                    <div class="table_row_div">
                        <div class="table_column_div number_pp_table"><p>${row['number_pp']}</p></div>
                        <div class="table_column_div number_asu_table"><p>${row['number_asu']}</p></div>
                        <div class="table_column_div NM_code_table"><p>${row['nm_code'] ? row['nm_code'].join(';<br>') : ''}</p></div>
                        <div class="table_column_div product_name_table"><p>${row['product_name']}</p></div>
                        <div class="table_column_div product_type_table"><p>${row['product_type'] ? row['product_type'] : ''}</p></div>
                        <div class="table_column_div ntd_table"><p>${row['ntd'] ? row['ntd'] : ''}</p></div>
                        <div class="table_column_div extra_options_table"><p>${row['extra_options'] ? row['extra_options'] : ''}</p></div>
                        <div class="table_column_div measure_table"><p>${row['measure']}</p></div>
                        <div class="table_column_div product_group_table"><p>${row['product_group']}</p></div>
                        <div class="table_column_div sample_size_table"><p>${row['sample_size'] ? row['sample_size'] : ''}</p></div>
                        <div class="table_column_div control_card_table"><p><a target="_blank" href="${row['control_card'] ? (row['control_card'].toUpperCase() == 'НЕ ТРЕБУЕТСЯ' ? document.location.origin + '/get_control_card_file?name_file=Протокол СИЗ.pdf' : (row['control_card'].toUpperCase() == 'НЕТ' ? document.location.origin + '/get_control_card_file?name_file=Протокол.pdf' : document.location.origin + '/get_control_card_file?name_file='+row['file_name_control_card'])) : ''}">${row['control_card'] ? row['control_card'] : ''}</a></p></div>
                        <div class="table_column_div article_group_table"><p>${row['article_group'] ? row['article_group'] : ''}</p></div>
                        <div class="table_column_div note_table"><p>${row['note'] ? row['note'] : ''}</p></div>
                        <div class="table_column_div item_number_table"><p>${row['item_number']}</p></div>
                    </div>
                    `
                })
                table_scroll_div.innerHTML = html_str
                displayColumn()
            } else {
                errorWin(`Ошибка ${response['message']}`)
            }
        }).catch(() => {
            errorWin(`Нет соединения с сервером`)
        })
    }
    else if (first_id_filter || first_id_filter == 0) {
        let html_str = ``
        for (let i = first_id_filter; first_id_filter + limit_rows < window.vktmc_row.length ? i < first_id_filter + limit_rows : i < vktmc_row.length; i++) {
            html_str += `
            <div class="table_row_div">
                <div class="table_column_div number_pp_table"><p>${window.vktmc_row[i]['number_pp']}</p></div>
                <div class="table_column_div number_asu_table"><p>${window.vktmc_row[i]['number_asu']}</p></div>
                <div class="table_column_div NM_code_table"><p>${window.vktmc_row[i]['nm_code'] ? window.vktmc_row[i]['nm_code'].join(';<br>') : ''}</p></div>
                <div class="table_column_div product_name_table"><p>${window.vktmc_row[i]['product_name']}</p></div>
                <div class="table_column_div product_type_table"><p>${window.vktmc_row[i]['product_type'] ? window.vktmc_row[i]['product_type'] : ''}</p></div>
                <div class="table_column_div ntd_table"><p>${window.vktmc_row[i]['ntd'] ? window.vktmc_row[i]['ntd'] : ''}</p></div>
                <div class="table_column_div extra_options_table"><p>${window.vktmc_row[i]['extra_options'] ? window.vktmc_row[i]['extra_options'] : ''}</p></div>
                <div class="table_column_div measure_table"><p>${window.vktmc_row[i]['measure']}</p></div>
                <div class="table_column_div product_group_table"><p>${window.vktmc_row[i]['product_group']}</p></div>
                <div class="table_column_div sample_size_table"><p>${window.vktmc_row[i]['sample_size'] ? window.vktmc_row[i]['sample_size'] : ''}</p></div>
                <div class="table_column_div control_card_table"><p><a target="_blank" href="${window.vktmc_row[i]['control_card'] ? (window.vktmc_row[i]['control_card'].toUpperCase() == 'НЕТ' ? document.location.origin + '/get_control_card_file?name_file=Протокол.pdf' : (window.vktmc_row[i]['control_card'].toUpperCase() == 'НЕ ТРЕБУЕТСЯ' ? document.location.origin + '/get_control_card_file?name_file=Протокол СИЗ.pdf' : document.location.origin + '/get_control_card_file?name_file='+window.vktmc_row[i]['file_name_control_card'])) : ''}">${window.vktmc_row[i]['control_card'] ? window.vktmc_row[i]['control_card'] : ''}</a></p></div>
                <div class="table_column_div article_group_table"><p>${window.vktmc_row[i]['article_group'] ? window.vktmc_row[i]['article_group'] : ''}</p></div>
                <div class="table_column_div note_table"><p>${window.vktmc_row[i]['note'] ? window.vktmc_row[i]['note'] : ''}</p></div>
                <div class="table_column_div item_number_table"><p>${window.vktmc_row[i]['item_number']}</p></div>
            </div>
            `
        }
        table_scroll_div.innerHTML = html_str
        displayColumn()
    }
}


//создание кнопки
function makeButton(value, button_id) {
    new_button = document.createElement('div')
    new_button.classList.add('button')
    new_button.id = button_id
    new_button.innerHTML = value
    return new_button
}

//Обновление размера TextArea
function resizeTextArea(id) {
    ta = document.querySelector(`#${id}`)
    evt = document.createEvent('Event')
    evt.initEvent('autosize:update', true, false)
    ta.dispatchEvent(evt)
}

//Ф-ция копирования \ редактирования
function copyEdit(number_pp, action) {
    addLoading()
    queryAPI_get(`filter?number_pp=${number_pp}`).then(i => {
        let response = JSON.parse(i)['vktmc_row'][0]
        if (action == 'edit') {
            openCloseAddEditNewRow(false)
            document.querySelector("#add_edit_new_row_div").querySelector(".button").id = "edit_row"
            document.querySelector("#add_edit_new_row_div").querySelector(".button").textContent = "Отредактировать"
            document.querySelector("#add_edit_head").querySelector("p").innerHTML = "Редактирование записи"
            document.querySelector("#add_edit_number_asu").readOnly = true
            document.querySelector("#add_edit_number_pp").value = response['number_pp']
            document.querySelector("#add_edit_number_asu").value = response['number_asu']
        }
        else if (action == 'copy') {
            openCloseAddEditNewRow()
        }

        if (response['nm_code']) {
            for (let i = 0; i < response['nm_code'].length; i++) {
                document.querySelector("#main_add_edit_nm_code_input").value = response['nm_code'][i]
                document.querySelector("#plus_nm_code").click()
            }
        }

        document.querySelector("#add_edit_product_name").value = response['product_name']
        document.querySelector("#add_edit_product_type").value = response['product_type']
        document.querySelector("#add_edit_ntd").value = response['ntd']
        document.querySelector("#add_edit_extra_options").value = response['extra_options']
        document.querySelector("#add_edit_measure").value = response['measure']
        document.querySelector("#add_edit_product_group").value = response['product_group']
        document.querySelector("#add_edit_sample_size").value = response['sample_size']
        document.querySelector("#add_edit_control_card").value = response['control_card']
        document.querySelector("#add_edit_article_group").value = response['article_group']
        document.querySelector("#add_edit_item_number").value = response['item_number']
        document.querySelector("#add_edit_note").value = response['note']
        document.querySelector("#add_edit_control_card").removeAttribute("style")
        if (response['product_group'] == 3) {
            document.querySelector("#add_edit_control_card").readOnly = true
            document.querySelector("#add_edit_control_card").style.background = 'rgb(106 105 105 / 31%)'
        } else {
            document.querySelector("#add_edit_control_card").readOnly = false
            document.querySelector("#add_edit_control_card").removeAttribute("style")
        }

        if (response['product_group'] != 2) {
            document.querySelector("#add_edit_sample_size").readOnly = true
            document.querySelector("#add_edit_sample_size").style.background = 'rgb(106 105 105 / 31%)'
        } else {
            document.querySelector("#add_edit_sample_size").readOnly = false
            document.querySelector("#add_edit_sample_size").removeAttribute("style")
        }
        resizeTextArea('add_edit_note')
        removeLoading()
    }).catch(() => {
        errorWin(`Нет соединения с сервером`)
    })
}


// функция удаления (архивирования записи)
function deleteRow(number_pp) {
    queryAPI_delete({"login": login, "number_pp": number_pp}, "delete_vktmc_row").then(i => {
        let response = JSON.parse(i)
        if (response['status'] == 200) {
            let selected_page = Number(document.querySelector(".selected").textContent)
            if (filter_on){
                applyFilter().then(e => {
                    selected_page <= window.total_page?makePaginationNumber(selected_page):makePaginationNumber(window.total_page)
                    document.querySelector(".selected").click()
                })
            } else {
                getNumber_pp().then(() => {
                    selected_page <= window.total_page?makePaginationNumber(selected_page):makePaginationNumber(window.total_page)
                    document.querySelector(".selected").click()
                    successfullyWin(response['message'])
                })
            }
        } else {
            response['message']?errorWin(response['message']):errorWin('Не известная ошибка!')
        }
    })
}


// Проверка обязательных полей на существование в базе
function checkMainFields(e) {
    if (e.target.id == "add_edit_product_group" && e.target.value == '3') {
        document.querySelector("#add_edit_control_card").readOnly = true
        document.querySelector("#add_edit_control_card").value = ''
        document.querySelector("#add_edit_control_card").style.background = 'rgb(106 105 105 / 31%)'
    } else if (e.target.id == "add_edit_product_group" && e.target.value != '3') {
        document.querySelector("#add_edit_control_card").readOnly = false
        document.querySelector("#add_edit_control_card").removeAttribute("style")
    }
    if (e.target.id == "add_edit_product_group" && e.target.value != '2') {
        document.querySelector("#add_edit_sample_size").readOnly = true
        document.querySelector("#add_edit_sample_size").value = ''
        document.querySelector("#add_edit_sample_size").style.background = 'rgb(106 105 105 / 31%)'
    } else if (e.target.id == "add_edit_product_group" && e.target.value == '2') {
        document.querySelector("#add_edit_sample_size").readOnly = false
        document.querySelector("#add_edit_sample_size").removeAttribute("style")
    }
    let option_list = []
    document.querySelector(`#${e.target.getAttribute('list')}`).querySelectorAll("option").forEach(item => { option_list.push(item.value) })
    if (!(option_list.includes(e.target.value))) {
        errorWin('Неверный выбор!')
        e.target.value = ''
    }
}

//Редактирование справочника
function newOptionInField(e) {
    let only_name_list = ['measure', 'sample_size'] //список где 1 input (name)
    let table_name = e.target.getAttribute('table_name') // название таблицы
    let new_option_div = document.createElement('div') // само новое окно
    let label_name = e.target.getAttribute('label_name') // название справочника
    new_option_div.id = 'new_option_main_div'
    new_option_div.setAttribute('table_name', table_name)
    let html_str = `
        <div id="new_option_close_div"><p>Справочник "${label_name}"</p><img src="img/close_button.svg" alt=""></div>
        <div id="new_option_input_div">
            <div>
                <div id="add_new_manual_inputs_div">
                    <input type="text" id="add_new_manual_input_value" placeholder="введите новое значение">
                    <input type="text" id="add_new_manual_input_description" placeholder="введите описание">
                </div>
                <div id="add_new_option_button" class="button">Добавить</div>   
            </div>
        </div>

        <p style=" width: 95%; margin: 10px 0;">Список:</p>
        <div class="existing_option_div" id="existing_option_div_non_archived"></div>

        <p style=" width: 95%; margin: 10px 0;">Архив:</p>
        <div class="existing_option_div" id="existing_option_div_archived"></div>
    `
    new_option_div.innerHTML = html_str
    document.querySelector("#content").appendChild(new_option_div)
    only_name_list.includes(table_name) ? document.querySelector("#add_new_manual_input_description").remove() : ''
    addLoading('Загружаю список элементов')
    makeElementsManuals(table_name).then(() => { removeLoading() })

    // удаление (закрытие) окна
    document.querySelector("#new_option_close_div").querySelector("img").addEventListener('click', () => {
        deleteElemById("new_option_main_div")
    })

    // удаление элемента из списка
    document.querySelector("#existing_option_div_non_archived").addEventListener('click', e => {
        if (e.target.className == 'delete_manual_img') {
            let body = {
                "table_name": table_name,
                "name": element_name_value = e.target.parentElement.querySelector("span").textContent // parentElement это родительский элемент
            }
            queryAPI_delete(body, 'manuals').then(i => {
                let response = JSON.parse(i)
                if (response['status'] == 200) {
                    addLoading('Обновляю')
                    makeElementsManuals(table_name).then(() => {
                        removeLoading()
                        addLoading('Обновляю справочники')
                        updateManuals().then(() => { removeLoading() })
                    })
                } else if (response['status'] == 400) {
                    errorWin('Нельзя удалить т.к. есть записи с данным значением')
                }
            }).catch(() => {
                errorWin(`Нет соединения с сервером`)
            })
        }
    })

    // возвращение элемента из архива
    document.querySelector("#existing_option_div_archived").addEventListener('click', e => {
        if (e.target.className == 'come_back_from_archive_img') {
            let body = {
                "table_name": table_name,
                "name": element_name_value = e.target.parentElement.querySelector("span").textContent // parentElement это родительский элемент
            }
            queryAPI_put(body, 'manuals').then(i => {
                let response = JSON.parse(i)
                if (response['status'] == 200) {
                    addLoading('Обновляю')
                    makeElementsManuals(table_name).then(() => {
                        removeLoading()
                        addLoading('Обновляю справочники')
                        updateManuals().then(() => { removeLoading() })
                    })
                } else if (response['status'] == 400) {
                    errorWin('Если вы увидели это окно то...(сообщите создателю ресурса). Ну это просто невозможно)))')
                }
            }).catch(() => {
                errorWin(`Нет соединения с сервером`)
            })
        }
    })

    // добавление элемента
    document.querySelector("#add_new_option_button").addEventListener('click', () => {
        let body = {
            "table_name": table_name,
            "name": document.querySelector("#add_new_manual_input_value").value,
            "description": document.querySelector("#add_new_manual_input_description") ? document.querySelector("#add_new_manual_input_description").value : null
        }
        queryAPI_post(body, 'manuals').then(i => {
            let response = JSON.parse(i)
            if (response['status'] == 400) {
                errorWin('Данное значение присутствует в списке!')
            } else {
                addLoading('Обновляю справочники')
                updateManuals().then(() => {
                    removeLoading()
                    addLoading('Загружаю список элементов')
                    makeElementsManuals(table_name).then(() => {
                        removeLoading()
                        successfullyWin('Успешно!')
                    })
                })
            }
        }).catch(() => {
            errorWin(`Нет соединения с сервером`)
        })
    })
}
// отображение элементов списка на странице
async function makeElementsManuals(table_name) {
    document.querySelector("#existing_option_div_non_archived").innerHTML = ''
    document.querySelector("#existing_option_div_archived").innerHTML = ''
    await queryAPI_get('get_value_list').then(i => {
        let response = JSON.parse(i)
        // заполнение действующими списками
        response[table_name].sort().forEach(item => {
            let new_div = document.createElement("div")
            new_div.innerHTML = `
                <p><span>${item['value']}</span>${item['description'] ? ' : ' + item['description'] : ''}</p>
                <img src="img/delete_option.svg" alt="" class="delete_manual_img">
            `
            document.querySelector("#existing_option_div_non_archived").appendChild(new_div)
        })
        response[`${table_name}_archived`].sort().forEach(item => {
            let new_div = document.createElement("div")
            new_div.innerHTML = `
                <p><span>${item['value']}</span>${item['description'] ? ' : ' + item['description'] : ''}</p>
                <img src="img/come_back_from_archive.svg" alt="" class="come_back_from_archive_img">
            `
            document.querySelector("#existing_option_div_archived").appendChild(new_div)
        })
    })
}

// отображение столбцов
function displayColumn(){
    let button = document.querySelector("#button_display_column")
    if (!(Array.from(document.querySelector(".column_display_block").querySelectorAll("input")).every(checkbox => {return checkbox.checked}))){
        button.innerHTML = 'Отметить всё'
    } else {
        button.innerHTML = 'Снять всё'
    }
    if (Array.from(document.querySelector(".column_display_block").querySelectorAll("input")).every(checkbox => {return !(checkbox.checked)})) {
        Array.from(document.querySelectorAll(".table_row_div")).forEach(row => {row.style.borderBottom  = "none"})
    } else {
        Array.from(document.querySelectorAll(".table_row_div")).forEach(row => {row.removeAttribute("style")})
    }
    Array.from(document.querySelector(".column_display_block").querySelectorAll("input")).forEach(checkbox => {
        Array.from(document.querySelectorAll(`.${checkbox.getAttribute("column_name")}`)).forEach(column => {
            checkbox.checked?column.removeAttribute("style"):column.style.display = 'none'
        })
    })
}


// примирение фильтров
async function applyFilter() {
    addLoading()
    document.querySelector("#head_row").querySelectorAll("div").forEach(item => {item.classList.add('hover_div')})
    let body = {}
    let inputs = document.querySelector('.search_block ').querySelectorAll('input')
    inputs.forEach(item => {
        item.value ? body[item.id] = item.value : ''
    })
    query_list = []
    Object.keys(body).forEach(key => {
        query_list.push(`${key}=${body[key]}`)
    })

    await queryAPI_get(`filter?${query_list.join('&')}`).then(i => {
        response = JSON.parse(i)
        if (response['status'] == 200) {
            window.vktmc_row = response['vktmc_row']
            window.total_page = Math.floor(response['vktmc_row'].length / limit_rows) + 1
            makePaginationNumber(window.total_page)
            showVktmcRow(null, null, Number(document.querySelector('.selected').textContent - 1) * limit_rows)
            filter_on = true
            removeLoading()
        } else if (response['status'] == 404) {
            errorWin('Отсутствуют результаты поиска')
            document.querySelector(".table_scroll_div ").innerHTML = ''
            removeLoading()
            // getNumber_pp()
        } else {
            errorWin('Не переданы параметры поиска')
            removeLoading()
        }
    }).catch(e => {
        errorWin(`Нет соединения с сервером`)
        removeLoading()
    })
}


// выгрузка по датам
function makeDivForLoadDate(main_id, is_archived, report_name, description, query) {
    let date_excel_div = document.createElement('div')
    date_excel_div.className = 'single_reports_buttons_div'
    date_excel_div.innerHTML = `<div class="button" id="${main_id}">${report_name}</div><p>${description}</p>`
    document.querySelector(".reports_buttons_div").prepend(date_excel_div)
    document.querySelector(`#${main_id}`).addEventListener("click", () => {
        let apply_div = document.createElement("div")
        let date_list = getDate()
        apply_div.id = 'date_excel_div_apply'
        apply_div.innerHTML = `
        <div><h1>Выберите даты</h1><img src="img/close_button.svg"></div>
        <div>
            <label for="date_from_input">Дата начала включительно</label>
            <input type="date" id="date_from_input" value="${date_list[0]}"></input>
        </div>
        <div>
            <label for="date_to_input">Дата конца не включительно</label>
            <input type="date" id="date_to_input" value=${date_list[1]}></input>
        </div>
        <div class="button">Выгрузить</div>
        `
        document.body.appendChild(apply_div)
        apply_div.querySelector("img").addEventListener("click", () => {
            apply_div.remove()
        })
        document.querySelector("#date_excel_div_apply").querySelector(".button").addEventListener("click", () => {
            let date_from = document.querySelector("#date_from_input").value
            let date_to = document.querySelector("#date_to_input").value
            if (!date_from || !date_to) {
                errorWin('Заполните все поля')
            } else {
                addLoading()
                apply_div.remove()
                queryAPI_get(`${query}?login=${login}&ip=${ip}&date_from=${date_from}&date_to=${date_to}${is_archived?'&is_archived=1':''}`).then(i => {
                    let response = JSON.parse(i)
                    if (response["status"] == 200){
                        document.location = document.location.href + response['path']
                    } else {
                        response["message"]?errorWin(response["message"]):errorWin("Ошибка!")
                    }
                }).catch(() => {
                    errorWin("Неизвестная ошибка!")
                }).finally(() => {
                    removeLoading()
                })
            }
        })
    })
}


function openControlCardFile(file_name) {
    file_name ? (file_name.toUpperCase() == "НЕТ" ? location.href = `control_card_files/Протокол.pdf`: location.href = `control_card_files/${file_name}`) : ''
}