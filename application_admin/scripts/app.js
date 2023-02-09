// Заполнение переменной ACCESS_LIST для выпадающих списков
queryAPI_get(`get_all_access?login=${login}`).then(i => {
    let response = JSON.parse(i)
    if (response["status"] == 200) {
        window.ACCESS_LIST = []
        response["access_list"].forEach(item => {
            ACCESS_LIST.push({"value": item, "inner_text": item})
        })
        // Заполнение select для поиска (после получения всех прав доступа)
        document.querySelector("#search_user_access").innerHTML = `<option value=""></option>${makeOptions(ACCESS_LIST)}`

        // Вывод всех пользователей на экран (после того как ACCESS_LIST точно заполнен)
        writeAllUsers()

    } else {
        errorWin(response["message"])
    }
})



// поиск в таблице по ФИО/Логину
document.querySelector("#search_user_fio_login").addEventListener("input", e => {
    document.querySelector("#search_user_access").value = ''
    let phrase = e.currentTarget.value.toUpperCase();
    let search_col = /[a-zA-Z]/.test(phrase[0]) ? Array.from(document.querySelectorAll(".user_login")) : Array.from(document.querySelectorAll(".user_fio"))
    search_col.forEach(item => {
        if (item.textContent.toUpperCase().includes(phrase)) {
            item.parentElement.style.display = "flex"
        } else {
            item.parentElement.style.display = "none"
        }
    })
})

// поиск в таблице по правам
document.querySelector("#search_user_access").addEventListener("change", e => {
    document.querySelector("#search_user_fio_login").value = ''
    let access = e.currentTarget.value
    let search_col = Array.from(document.querySelectorAll(".access_select_row"))
    search_col.forEach(item => {
        if (item.value == access) {
            item.parentElement.parentElement.style.display = "flex"
        } else if (access) {
            item.parentElement.parentElement.style.display = "none"
        } else {
            item.parentElement.parentElement.style.display = "flex"
        }
    })
})

// event на добавление пользователя
document.querySelector("#add_new_user").addEventListener("click", () => {
    let background = document.querySelector("#background")
    background.className = "display_flex"
    let search_window = document.createElement("div")
    search_window.id = "add_new_user_main_div"
    search_window.innerHTML = `
    <div id="id1" class="width100">
        <p>Добавить пользователя</p>
        <img src="../img/close_button.svg" title="Закрыть">
    </div>
    <div id="id2" class="width100">
        <label for="search_user_by_login">Поиск</label>
        <input type="text" class="input_text" id="search_user_by_login" placeholder="Введите login">
        <div class="button">Найти</div>
    </div>
    <div id="id3" class="width100">
        <h4>Результаты поиска</h4>
        <div id="search_result_main_div">

        </div>
    </div>
    <div id="id4" class="width100"><div class="button">Сохранить</div></div>
    `
    background.appendChild(search_window)
    
    // закрытие окна
    document.querySelector("#id1").querySelector("img").addEventListener("click", () => {
        search_window.remove()
        background.className = "display_none"
    })

    // добавление пользователя в список
    document.querySelector("#id2").querySelector(".button").addEventListener("click", () => {
        let search_login_user = document.querySelector("#search_user_by_login")
        if (search_login_user.value) {
            queryAPI_get(`find_user?login=${login}&find_login=${search_login_user.value}`).then(i => {
                let response = JSON.parse(i)
                if (response["status"] == 200) {
                    let new_div = document.createElement("div")
                    new_div.setAttribute("login", response["user_info"]["login"])
                    new_div.classList.add("user_search_row")
                    new_div.innerHTML = `
                    <p class="user_search_row_login_p"><img src="img/dog.svg">${response["user_info"]["email"]}</p>
                    <p>${response["user_info"]["full_name"]}</p>
                    <div>
                        <select class="user_search_row_login_select">${makeOptions(ACCESS_LIST)}</select>
                        <img src="../img/close_nm_code.svg" class="close_user_row" title="Убрать ${response["user_info"]["full_name"]}">
                    </div>
                    `
                    document.querySelector("#search_result_main_div").appendChild(new_div)
                    new_div.querySelector(".close_user_row").addEventListener("click", () => {
                        new_div.remove()
                    })
        
                    search_login_user.value = ''
                } else {
                    errorWin(response["message"])
                }

            })
        } else {
            errorWin("Введите login")
        }
    })
    // Обработка enter для кнопки "Найти"
    search_window.addEventListener('keydown', e => {
        if (e.key === "Enter") {
            document.querySelector("#id2").querySelector(".button").click()
        }
    })

    // сохранение пользователей
    document.querySelector("#id4").querySelector(".button").addEventListener("click", () => {
        let send_body = {"login": login, "new_users_dict": {"new_users": []}}
        Array.from(document.querySelectorAll(".user_search_row")).forEach(row => {
            send_body["new_users_dict"]["new_users"].push({
                "login": row.getAttribute("login"), 
                "access": row.querySelector("select").value
            })
        })
        if (send_body["new_users_dict"]["new_users"].length == 0) {
            errorWin("Добавьте пользователей")
        } else {
            queryAPI_post(send_body, "create_new_users").then(i => {
                let response = JSON.parse(i)
                if (response["status"] == 200) {
                    successfullyWin("Пользователи успешно добавлены!")
                    document.querySelector("#id1").querySelector("img").click()
                    writeAllUsers()
                } else {
                    errorWinOk(response["message"])
                }
            })
        }
    })
})
