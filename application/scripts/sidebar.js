nav.addEventListener('click', e => {
    let aside = document.querySelector("aside");
    if (aside.classList.contains('w527')) {
        aside.classList.remove("w527");
        aside.classList.add("w71");
        nav.querySelector("img").src = "../img/sidebar/navOpen.svg"

    } else {
        aside.classList.remove("w71");
        aside.classList.add("w527");
        nav.querySelector("img").src = "../img/sidebar/navClose.svg"
    }

})