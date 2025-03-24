import machineView from "./machineView.js";

document.addEventListener("DOMContentLoaded", () => {
    machineView.renderPieChart();
    machineView.renderCards();
    machineView.renderCounterAndLastUpdateTime();
});

document.addEventListener("click", function (event) {
    if (event.target.classList.contains("view-details-btn")) {
        const name = event.target.getAttribute("data-name");
        machineView.renderModal(name.substring(3), event);
    }

    if (event.target.classList.contains("data-update-btn")) {
        console.log(event.target);
        machineView.renderPieChart();
        machineView.renderCards();
    }
});