function $(str) {
    return document.querySelector(str)
}
//document.querySelector('#preloader').remove() // remove loading
async function addLoading(text = '') {
    let newData = document.createElement('div')
    newData.id = "preloader"
    let data = `<p id="loader_test">${text}</p><div id="loader"></div>`
    newData.innerHTML = data
    document.querySelector('#content').appendChild(newData)
}

async function removeLoading() {
    document.querySelector('#preloader') ? document.querySelector('#preloader').remove() : ''
}

async function errorWin(a) {
    let newId = Math.floor(Math.random() * (1 - 100000 + 1)) + 1;
    newId = 'winId' + newId;
    let newDiv = document.createElement('div');
    newDiv.classList.add('winInfo');
    newDiv.id = newId;
    newDiv.style.position = 'fixed';
    newDiv.style.width = '250px';
    newDiv.style.top = '250px';
    newDiv.style.left = '40%';
    newDiv.style.minWidth = '300px';
    newDiv.style.background = 'rgb(218, 32, 50)';
    newDiv.style.borderRadius = '25px';
    newDiv.style.transition = '3s';
    newDiv.style.opacity = 1; //0.0;
    newDiv.style.textAlign = 'center';
    newDiv.style.padding = '17px';
    newDiv.style.color = '#CC3333';
    newDiv.style.zIndex = '35';

    document.body.append(newDiv);
    let v = '<span style=\'opacity:1; font-size:17pt; color:#fff; \'>' + a + '</span>';
    let iWindow = document.querySelector('#' + newId);
    iWindow.innerHTML = v;
    let op = 0;

    function sayHi1() {
        iWindow.style.opacity = 1;
    }

    function sayHi() {
        iWindow.style.opacity = 0;
    }

    function sayHi3() {
        iWindow.remove();
    }
    setTimeout(sayHi1, 10);
    setTimeout(sayHi, 2000);
    setTimeout(sayHi3, 3000);
}

async function successfullyWin(a) {
    let newId = Math.floor(Math.random() * (1 - 100000 + 1)) + 1;
    newId = 'winId' + newId;
    let newDiv = document.createElement('div');
    newDiv.classList.add('winInfo');
    newDiv.id = newId;
    newDiv.style.position = 'fixed';
    newDiv.style.width = '250px';
    newDiv.style.top = '250px';
    newDiv.style.left = '40%';
    newDiv.style.minWidth = '300px';
    newDiv.style.background = 'rgb(32, 218, 50)';
    newDiv.style.borderRadius = '25px';
    newDiv.style.transition = '3s';
    newDiv.style.opacity = 1; //0.0;
    newDiv.style.textAlign = 'center';
    newDiv.style.padding = '17px';
    newDiv.style.color = '#CC3333';
    newDiv.style.zIndex = '35';

    document.body.append(newDiv);
    let v = '<span style=\'opacity:1; font-size:17pt; color:#fff; \'>' + a + '</span>';
    let iWindow = document.querySelector('#' + newId);
    iWindow.innerHTML = v;
    let op = 0;

    function sayHi1() {
        iWindow.style.opacity = 1;
    }

    function sayHi() {
        iWindow.style.opacity = 0;
    }

    function sayHi3() {
        iWindow.remove();
    }
    setTimeout(sayHi1, 10);
    setTimeout(sayHi, 2000);
    setTimeout(sayHi3, 3000);
}


async function errorWinOk(message, head = "Ошибка!") {
    let div = document.createElement("div")
    div.setAttribute("style", "height: 30%;position: absolute;top: 30%;left: 35%;width: 30%;background: #d3dbf0;display: flex;flex-direction: column;justify-content: space-between;padding: 10px;border-radius: 12px;align-items: center;border: 1px solid;")
    div.innerHTML = `
    <div style="color: #ff6d6d; font-size: 15px; font-weight: 600;">${head}</div>
    <div style="width: 100%; min-height: 61%; overflow-wrap: break-word; overflow-y: auto;">${message}</div>
    <div class="button" style="width: 50%;">Понятно</div>
    `
    document.body.append(div)
    div.querySelector(".button").addEventListener("click", () => {
        div.remove()
    })
}

