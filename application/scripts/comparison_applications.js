// Сравнение заявок
function comparisonApplications() {
    let background = document.querySelector("#main_application_info_background")
    background.classList.remove("display_none")
    let comparison_div = document.createElement("div")
    comparison_div.id = "comparison_rows_div"
    comparison_div.innerHTML = `
        <div id="comparison_div_head">
            <p>Сравнение заявок</p>
            <img src="../img/close_button.svg" title="Закрыть окно">
        </div>
        <div id="comparison_div_main_block">
            <input type="text" placeholder="Введите номер АСУ или номер заявки" title="Введите номер АСУ (7 цифр) или номер заявки (< 7 цифр)" oninput="only_regex(this, /[0-9]/g)">
            <div class="button">Найти</div>
        </div>
    `
    background.appendChild(comparison_div)

    // Закрыть окно поиска записи по номеру асу
    comparison_div.querySelector("img").addEventListener("click", () => {
        document.querySelector("#main_application_info_background").classList.add("display_none")
        comparison_div.remove()
    })

    // Произвести поиск и добавить строку для сравнения
    comparison_div.querySelector(".button").addEventListener("click", () => {
        let search_number = document.querySelector("#comparison_div_main_block").querySelector("input").value
        document.querySelector("#main_application_info_background").classList.add("display_none")
        comparison_div.remove()
        queryAPI_post({"login": login, "number": search_number}, "add_comparison_row").then(i => {
            let response = JSON.parse(i)
            if (response["status"] == 200) {
                addLoading()
                draw_comparison_row().then(() => {removeLoading()})
            } else {
                response["message"] ? errorWin(response["message"]) : errorWin("Неизвестная ошибка!")
            }
        })
    })

    // Обработка enter при создании заявки на редактирование
    comparison_div.addEventListener('keydown', e => {
        if (e.key === "Enter") {
            comparison_div.querySelector(".button").click()
        }
    })
}

async function draw_comparison_row() {
    let application_comparison = document.querySelector("#application_comparison")
    application_comparison.innerHTML = ''
    await queryAPI_get(`get_comparison_rows?login=${login}`).then(i => {
        let response = JSON.parse(i)
        if (response["status"] == 200) {
            response["result"].forEach(row => {
                let new_div = document.createElement("div")
                new_div.classList.add("application_row")
                new_div.innerHTML = `
                    <div class="col number_comparison_row">${row["number"]}</div>
                    <div class="col nm_code_comparison_row" style="${row["values"]["nm_code"]["difference"] ? 'background-color: #EFE6E6;' : ''}">${row["values"]["nm_code"]["value"] ? row["values"]["nm_code"]["value"].join("; ") : ''}</div>
                    <div class="col product_name_comparison_row" style="${row["values"]["product_name"]["difference"] ? 'background-color: #EFE6E6;' : ''}">${row["values"]["product_name"]["value"] || ''}</div>
                    <div class="col product_type_comparison_row" style="${row["values"]["product_type"]["difference"] ? 'background-color: #EFE6E6;' : ''}">${row["values"]["product_type"]["value"] || ''}</div>
                    <div class="col ntd_comparison_row" style="${row["values"]["ntd"]["difference"] ? 'background-color: #EFE6E6;' : ''}">${row["values"]["ntd"]["value"] || ''}</div>
                    <div class="col extra_options_comparison_row" style="${row["values"]["extra_options"]["difference"] ? 'background-color: #EFE6E6;' : ''}">${row["values"]["extra_options"]["value"] || ''}</div>
                    <div class="col measure_comparison_row" style="${row["values"]["measure"]["difference"] ? 'background-color: #EFE6E6;' : ''}">${row["values"]["measure"]["value"] || ''}</div>
                    <div class="col product_group_comparison_row" style="${row["values"]["product_group"]["difference"] ? 'background-color: #EFE6E6;' : ''}">${row["values"]["product_group"]["value"] || ''}</div>
                    <div class="col sample_size_comparison_row" style="${row["values"]["sample_size"]["difference"] ? 'background-color: #EFE6E6;' : ''}">${row["values"]["sample_size"]["value"] || ''}</div>
                    <div class="col article_group_comparison_row" style="${row["values"]["article_group"]["difference"] ? 'background-color: #EFE6E6;' : ''}">${row["values"]["article_group"]["value"] || ''}</div>
                    <div class="col note_comparison_row" style="${row["values"]["note"]["difference"] ? 'background-color: #EFE6E6;' : ''}">${row["values"]["note"]["value"] || ''}</div>
                    <div class="col item_number_comparison_row" style="${row["values"]["item_number"]["difference"] ? 'background-color: #EFE6E6;' : ''}">${row["values"]["item_number"]["value"] || ''}</div>
                    <div class="col delete_comparison_row"><div class="button delete_comparison_button" comparison_id="${row["comparison_id"] || ''}">Убрать</div></div>
                    <div class="col make_main_comparison_row"><div class="button make_main_comparison_button" comparison_id="${row["comparison_id"] || ''}">Основная</div></div>
                `
                application_comparison.appendChild(new_div)
            })
            // удаление строк
            document.querySelectorAll(".delete_comparison_button").forEach(button => {
                button.addEventListener("click", e => {
                    queryAPI_delete({"login": login, "comparison_id": button.getAttribute("comparison_id")}, "delete_comparison_row").then(i => {
                        let resp = JSON.parse(i)
                        if (resp["status"] == 200) {
                            addLoading()
                            draw_comparison_row().then(() => {removeLoading()})
                        } else {
                            resp["message"] ? errorWin(resp["message"]) : errorWin("Неизвестная ошибка!")
                        }
                    })
                })
            })
            // сделать строку основной
            document.querySelectorAll(".make_main_comparison_button").forEach(button => {
                button.addEventListener("click", e => {
                    queryAPI_put({"login": login, "comparison_id": button.getAttribute("comparison_id")}, "make_main_comparison_row").then(i => {
                        let resp = JSON.parse(i)
                        if (resp["status"] == 200) {
                            addLoading()
                            draw_comparison_row().then(() => {removeLoading()})
                        } else {
                            resp["message"] ? errorWin(resp["message"]) : errorWin("Неизвестная ошибка!")
                        }
                    })
                })
            })
        } else if (response["status"] != 404) {
            errorWin(response["message"])
        }
    })
}