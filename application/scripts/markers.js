function marker_event(){
    let markers = Array.from(document.querySelectorAll(".markers"))
    markers.forEach(element => {
        element.addEventListener("click", e => {
            markers.forEach(item => {
                item.classList.remove("selected_marker")
            })
            e.currentTarget.classList.add("selected_marker")
    
            let all_table = Array.from(document.querySelectorAll(".application_table_divs"))
            all_table.forEach(table => {
                table.classList.remove("display_none")
            })

            let completed_application = document.querySelector(".completed_application")
            let current_application = document.querySelectorAll(".current_application")
            let draft_application = document.querySelector(".draft_application")
            let comparison_application = document.querySelector(".comparison_application")
    
            switch (e.currentTarget.id) {
                case "marker_current_applications":
                    completed_application.classList.add("display_none")
                    draft_application ? draft_application.classList.add("display_none") : ""
                    comparison_application ? comparison_application.classList.add("display_none") : ""
                    break
                case "marker_completed_application":
                    Array.from(current_application).forEach(table => {
                        table.classList.add("display_none")
                    })
                    draft_application ? draft_application.classList.add("display_none") : ""
                    comparison_application ? comparison_application.classList.add("display_none") : ""
                    break
                case "marker_draft_application":
                    Array.from(current_application).forEach(table => {
                        table.classList.add("display_none")
                    })
                    completed_application.classList.add("display_none")
                    comparison_application ? comparison_application.classList.add("display_none") : ""
                    break
                case "marker_comparison_application":
                    Array.from(current_application).forEach(table => {
                        table.classList.add("display_none")
                    })
                    completed_application.classList.add("display_none")
                    draft_application ? draft_application.classList.add("display_none") : ""
                    break
            }
        })
    })
}
