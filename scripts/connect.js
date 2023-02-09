async function queryAPI_get(query) {
    let res = await fetch(`/vvktmc/${query}`, {
        method: "GET",
    })
    return await res.text()
}

async function queryAPI_post(data, query) {
    let res = await fetch(`/vvktmc/${query}`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    return await res.text()
}

async function queryAPI_delete(data, query) {
    let res = await fetch(`/vvktmc/${query}`, {
        method: "DELETE",
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    return await res.text()
}

async function queryAPI_put(data, query) {
    let res = await fetch(`/vvktmc/${query}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    return await res.text()
}

async function fileAPI(data={menu:"allplaces",session:1},url='query/fileController.php'){
    let res = await fetch(url, {
                method:"POST",
                body:data,
                processData: false,
                contentType: false
    });
    return await res.text();
}

// ф-ия запроса к API
async function php_query(data, url='query/JSAPI.php'){
    let res = await fetch(url, {
        method:"POST",
        body:JSON.stringify(data) 
    })
    return await res.text()
}

// Функция для отправки файла
async function queryAPI_post_file(data, query) {
    let res = await fetch(`/vvktmc/${query}`, {
        method: "POST",
        body: data
    })
    return await res.text()
}