// Функция создания options для select'a
function makeOptions(options_list) {
    // список словарей с обязательными ключами:
    // - value (вставляется в атрибут value тэга option)
    // - inner_text (вставляется как текст внутрь тэга option)
    // ф-ция возвращает html строку с option'ами

    let options_str = ``
    options_list.forEach(dict => {
        options_str += `<option value="${dict["value"] || ""}">${dict["inner_text"] || ""}</option>`
    })
    return options_str
}


// Функция изменения прав доступа у пользователя
function changeAccess(user_login, user_fio, new_access, old_value, select_elem) {
    let background = document.querySelector("#background")
    background.className = "display_flex"
    let accept_window = document.createElement("div")
    accept_window.id = "main_accept_change_access_div"
    accept_window.innerHTML = `
    <div id="head_red_line"></div>
    <div id="accept_change_access_text">
        <p id="accept_change_p_head">Изменить права доступа</p>
        <p><span id="accept_change_fio">${user_fio}</span></p>
        <p>на <span id="accept_change_access">${new_access}</span></p>
    </div>
    <div id="accept_change_access_buttons">
        <div class="button" id="button_yes">Изменить</div>
        <div class="button" id="button_no">Отмена</div>
    </div>
    `
    background.appendChild(accept_window)
    
    // закрытие окна
    button_no.addEventListener("click", () => {
        accept_window.remove()
        background.className = "display_none"
        select_elem.value = old_value
    })

    // обращение к апи для обновления прав пользователя
    button_yes.addEventListener("click", () => {
        queryAPI_put({"login": login, "update_user_login": user_login, "access": new_access}, "update_new_user").then(i => {
            let response = JSON.parse(i)
            if(response["status"] == 200) {
                successfullyWin(`Права "${user_login}" успешно изменены на "${new_access}"`)
                writeAllUsers()
            } else {
                errorWin(response["message"])
            }
        })
        accept_window.remove()
        background.className = "display_none"
    })
}

// Функция для удаления пользователя
function deleteUser(user_login, elem) {
    let background = document.querySelector("#background")
    background.className = "display_flex"
    let delete_window = document.createElement("div")
    delete_window.id = "delete_user_main_div"
    delete_window.innerHTML = `
    <div id="head_red_line"></div>
    <p>Вы действительно хотите удалить пользователя "<span>${user_login}</span>"</p>
    <div id="id1">
        <div class="button" id="delete_user_yes">Да</div>
        <div class="button" id="delete_user_no">Нет</div>
    </div>
    `
    background.appendChild(delete_window)

    // закрытие окна
    delete_window.querySelector("#delete_user_no").addEventListener("click", () => {
        delete_window.remove()
        background.className = "display_none"
    })

    // удаление пользователя
    delete_window.querySelector("#delete_user_yes").addEventListener("click", () => {
        queryAPI_delete({"login": login, "delete_user_login": user_login}, `delete_user`).then(i => {
            let response = JSON.parse(i)
            if (response["status"] == 200) {
                successfullyWin(`Пользователь "${user_login}" успешно удалён`)
                elem.remove()
                let user_count = document.querySelector("#user_count")
                user_count.innerHTML = Number(user_count.textContent) - 1
            } else {
                errorWin(response["message"])
            }
        })
        delete_window.remove()
        background.className = "display_none"
    })
}


function writeAllUsers() {
    addLoading()
    queryAPI_get(`get_all_users?login=${login}`).then(i => {
        let response = JSON.parse(i)
        // В response уже есть вся инфа из БД можно её юзать если вдруг скажут выводит департамент или ещё что-то)))
        if (response["status"] == 200) {
            let table = document.querySelector(".table_scroll_div")
            table.innerHTML = ''
            response["all_users"].forEach(user => {
                let new_row = document.createElement("div")
                new_row.classList.add("row")
                new_row.setAttribute("user_id", user["id"])
                new_row.innerHTML = `
                <div class="head_col user_id">${user["id"]}</div>
                <div class="head_col user_fio">${user["full_name"]}</div>
                <div class="head_col user_login"><img src="img/dog.svg">${user["login"]}</div>
                <div class="head_col user_access"><select class="access_select access_select_row">${makeOptions(ACCESS_LIST)}</select></div>
                <div class="head_col user_delete"><img src="../img/close_button.svg" class="delete_user" title="Удалить"></div>
                `
                new_row.querySelector("select").value = user["access"]
                table.appendChild(new_row)
            })

            // Навесить event для изменения прав доступа (появляется окно подтверждения) (после вывода всех пользователей)
            Array.from(document.querySelectorAll(".access_select_row")).forEach(elem => {
                elem.addEventListener("focus", () => {
                    window.old_value = elem.value
                })
                elem.addEventListener("change", e => {
                    let user_login = elem.parentElement.parentElement.querySelector(".user_login").textContent
                    let user_fio = elem.parentElement.parentElement.querySelector(".user_fio").textContent
                    let new_access = elem.value
                    changeAccess(user_login, user_fio, new_access, old_value, elem)
                })

            })

            // Навесить event для удаления пользователя (появляется окно подтверждения) (после вывода всех пользователей)
            Array.from(document.querySelectorAll(".delete_user")).forEach(elem => {
                elem.addEventListener("click", () => {
                    let user_login = elem.parentElement.parentElement.querySelector(".user_login").textContent
                    deleteUser(user_login, elem.parentElement.parentElement)
                })
            })

            // Записать кол-во пользователей
            document.querySelector("#user_count").innerHTML = response["all_users"].length
        } else {
            errorWin(response["message"])
        }
        removeLoading()
    })
}
