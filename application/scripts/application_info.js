// Формирование структуры inputs
function inputs_struct(available_inputs) {
    for (let key of Object.keys(available_inputs)) {
        let element = document.querySelector(`#${key}`)
        element.removeAttribute("title")
        element.readOnly = !available_inputs[key]
        element.tagName == "SELECT" ? element.disabled = !available_inputs[key] : ''
        !available_inputs[key] ? element.style.background = "#ebebeb" : element.style.background = "#FFFFFF"
    }
}
//Обновление размера TextArea
autosize(document.querySelector('#note_info'))
autosize(document.querySelector('#comment_info'))
function resizeTextArea(id) {
    ta = document.querySelector(`#${id}`)
    evt = document.createEvent('Event')
    evt.initEvent('autosize:update', true, false)
    ta.dispatchEvent(evt)
}

// Отчистить окно информации
function clear__application_info() {
    // Очищение все input
    let inputs = Array.from(document.querySelector("#application_info_div").querySelectorAll("input"))
    inputs.forEach(input => {
        input.value = ''
    })
    // Очищение textarea
    document.querySelector("#application_info_div").querySelector("textarea").value = ""
    // Удаление всех кодов по НМ
    let close_nm_code = Array.from(document.querySelector("#application_info_div").querySelectorAll(".close_nm_code"))
    close_nm_code.forEach(element => { element.click() })
    resizeTextArea("note_info")
    resizeTextArea("comment_info")

    // обнуление input file для прикрепления
    let attached_file_main_input = document.querySelector("#attached_file_main_input")
    if (attached_file_main_input) {
        let change_event = new Event("change")
        attached_file_main_input.dispatchEvent(change_event)
    }

    // очищение файлов
    Array.from(document.querySelectorAll(".attached_file_main_div")).forEach(elem => {
        elem.remove()
    })
}

// Открыть окно информации
function open_application_info(buttons) {
    inputs_struct(window.available_inputs)
    buttons ? buttons_info_buttons.removeAttribute("style") : buttons_info_buttons.style.display = "none"
    window.application_type = 1
    window.number_asu = null
    clear__application_info()
    document.querySelector("#main_application_info_background").classList.remove("display_none")
    document.querySelector("#main_application_info").classList.remove("display_none")
}

// Закрыть окно информации
document.querySelector("#close_info").addEventListener("click", () => {
    clear__application_info()
    document.querySelector("#main_application_info_background").classList.add("display_none")
    document.querySelector("#main_application_info").classList.add("display_none")
})

// Открыть окно поиска записи по номеру асу
function open_search_window() {
    let background = document.querySelector("#main_application_info_background")
    background.classList.remove("display_none")
    let search_div = document.createElement("div")
    search_div.id = "search_vktmc_row_div"
    search_div.innerHTML = `
        <div id="search_div_head">
            <p>Поиск заявки</p>
            <img src="../img/close_button.svg" title="Закрыть окно">
        </div>
        <div id="search_div_main_block">
            <input type="text" placeholder="Введите номер АСУ" oninput="only_regex(this, /[0-9]/g)">
            <div class="button">Найти</div>
        </div>
    `
    background.appendChild(search_div)

    // Закрыть окно поиска записи по номеру асу
    search_div.querySelector("img").addEventListener("click", () => {
        document.querySelector("#main_application_info_background").classList.add("display_none")
        search_div.remove()
    })

    // Обработка enter при создании заявки на редактирование
    search_div.addEventListener('keydown', e => {
        if (e.key === "Enter") {
            search_div.querySelector(".button").click()
        }
    })

    // Произвести поиск
    search_div.querySelector(".button").addEventListener("click", () => {
        let number_asu = search_div.querySelector("input").value
        if (number_asu.length != 7) {
            errorWin("Длинна номера АСУ должна быть равна 7")
        } else {
            queryAPI_get(`filter?number_asu=${number_asu}`).then(i => {
                let response = JSON.parse(i)
                if (response["status"] == 200) {
                    let required_keys = ["nm_code", "product_name", "product_type", "ntd", "extra_options",
                        "measure", "product_group", "sample_size", "article_group", "note", "item_number"]
                    let row = response["vktmc_row"][0]
                    let new_application = {}
                    Object.keys(row).forEach(key => {
                        if (required_keys.includes(key))
                            new_application[`${key}_info`] = row[key]
                    })
                    search_div.querySelector("img").click()
                    open_application_info(true)
                    window.application_type = 2
                    window.number_asu = number_asu
                    Object.keys(new_application).forEach(key => {
                        if (key == "nm_code_info") {
                            let nm_codes = new_application[key]
                            if (nm_codes) {
                                nm_codes.forEach(nm_code => {
                                    $("#nm_code_info").value = nm_code
                                    $("#plus_nm_code").click()
                                })
                            }
                        } else {
                            $(`#${key}`).value = new_application[key]
                        }
                    })
                    resizeTextArea("note_info")
                    let event = new Event('change')
                    document.querySelector("#product_group_info").dispatchEvent(event)
                } else if (response["status"] == 404) {
                    errorWin("Запись не найдена")
                }
            })
            // .catch(() => { errorWin("Неизвестная ошибка") })
        }
    })
}


// Работа с кодами по НМ
document.querySelector("#info_nm_code_values").addEventListener("click", e => {
    let nm_code_info = document.querySelector("#nm_code_info")
    if (e.target.id == 'plus_nm_code' && nm_code_info.value) {
        if (nm_code_info.value.length > 15) {
            errorWinOk("Длинна кода по НМ не должна превышать 15 символов")
        } else {
            let nm_code_value = String(nm_code_info.value).replace(",", "").replace(".", "")
            let new_div = document.createElement("div")
            new_div.innerHTML = `
            <input type="number" class="info_input_text nm_code_info_value" value="${nm_code_value}" readonly style="background: rgb(235, 235, 235);">
            <img src="../img/close_nm_code.svg" class="close_nm_code" alt="Удалить код по НМ" title="Удалить код по НМ">
            <p>${nm_code_value.length}</p>
            `
            nm_code_info.value = ''
            nm_code_info.parentNode.querySelector("p").innerHTML = ''
            document.querySelector("#info_nm_code_values").append(new_div)
        }
    } else if (Array.from(e.target.classList).includes('close_nm_code')) {
        e.target.parentNode.remove()
    }
})

// Подсчёт символов при вводе цифр в поле Код по НМ
document.querySelector("#nm_code_info").addEventListener("input", e => {
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


// создание списков
async function makeOption(value_list) {
    let result_str = ``
    value_list.forEach(item => {
        result_str += `<option value="${item['value']}">${item['description'] ? item['description'] : ''}</option>`
    })
    return result_str
}

// Наполнение списками input
async function updateManuals() {
    document.querySelector("#product_name_info").addEventListener("change", e => {
        queryAPI_get(`get_type_list?product_name=${e.target.value}`).then(i => {
            let response = JSON.parse(i)
            if (response["status"] == 200) {
                makeOption(response['type_list']).then(i => {
                    document.querySelector("#product_type_list").innerHTML = i
                })
            } else {
                document.querySelector("#product_type_list").innerHTML = ''
            }
        })
    })
    await queryAPI_get('get_value_list').then(i => {
        let response = JSON.parse(i)
        makeOption(response['product_name']).then(i => {
            document.querySelector("#product_name_list").innerHTML = i
        })
        makeOption(response['ntd']).then(i => {
            document.querySelector("#ntd_list").innerHTML = i
        })
        makeOption(response['measure']).then(i => {
            document.querySelector("#measure_list").innerHTML = i
        })
        makeOption(response['product_group']).then(i => {
            document.querySelector("#product_group_info").innerHTML = i
        })
        makeOption(response['sample_size']).then(i => {
            document.querySelector("#sample_size_list").innerHTML = i
        })
        makeOption(response['article_group']).then(i => {
            document.querySelector("#article_group_list").innerHTML = i
        })
        makeOption(response['item_number']).then(i => {
            document.querySelector("#item_number_list").innerHTML = i
        })
    }).catch(() => {
        errorWin(`Нет соединения с сервером`)
    })
}

// Сохранение прикреплённых файлов
async function createAttachedFiles(application_id) {
    let obj = new FormData()
    Array.from(document.querySelector("#attached_file_main_input").files).forEach(item => {
        obj.append("files", item)
    })
    obj.append("login", login)
    obj.append("application_id", application_id)

    await queryAPI_post_file(obj, "create_attached_files").then(i => {
        let response = JSON.parse(i)
        if (response["status"] != 200)
            response["message"] ? errorWinOk(response["message"]) : errorWinOk("Неизвестная ошибка!")
    })
}