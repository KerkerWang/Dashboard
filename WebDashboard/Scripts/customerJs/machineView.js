import machineService from "./machineService.js"

const machineView = {
    //渲染圓餅圖
    async renderPieChart() {
        try {
            let data = await machineService.getDataForPieChart();
            if (window.pieChart instanceof Chart) {
                // 已經有圖表時，直接更新資料
                window.pieChart.data = data.doughnutPieData;
                window.pieChart.update();
            } else {
                let pieChartCanvas = $("#pieChart").get(0).getContext("2d");
                window.pieChart = new Chart(pieChartCanvas, {
                    type: 'pie',
                    data: data.doughnutPieData,
                    options: data.doughnutPieOptions
                });
            }
        } catch (error) {
            console.error("取得圖表資料時發生錯誤:", error);
        }
    },

    //渲染機器卡片
    async renderCards() {
        let dataArr = await machineService.getDataForCards();
        // 取得 <div id="machineStatusContainer">
        const machineStatusContainer = document.getElementById("machineStatusContainer");
        const cardContainer = document.createElement("div");
        cardContainer.className = "row";
        if (machineStatusContainer) {
            // 把 card 新增到 <div> 內部
            dataArr.forEach((d) => {
                const card = document.createElement("div");
                card.className = "card mb-3";
                card.innerHTML = `
                <div class="row g-0">
                    <div class="col-md-3">
                        <img src="${d.image}" class="img-fluid rounded-start" alt="${d.name}">
                    </div>
                    <div class="col-md-9">
                        <div class="card-body">
                            <h5 class="card-title">${d.name}</h5>
                                <p class="card-text"><strong>狀態：</strong>${d.status}</p>
                                <button class="btn btn-primary view-details-btn" data-bs-toggle="modal" data-bs-target="#machineModal"
                                    data-name="${d.name}">
                                    詳情
                                </button>
                        </div>
                    </div>
                </div>`;
                cardContainer.appendChild(card);
            })

            if (machineStatusContainer.childNodes.length !== 3) {
                machineStatusContainer.replaceChild(cardContainer,machineStatusContainer.childNodes[3]);
            } else {
                machineStatusContainer.appendChild(cardContainer);
            }
        } else {
            console.error("找不到 #machineStatusContainer，無法插入卡片！");
        }
    },

    async renderModal(id) {
        try {
            let data = await machineService.getDataForModal(id);
            // 更新 Modal 內容
            document.getElementById("modalMachineName").textContent = data.name;
            document.getElementById("modalMachineStatus").textContent = data.status;
            document.getElementById("modalMachineDatetime").textContent = data.lastUpdateTime;
            if (window.lineChart instanceof Chart) {
                // 已經有圖表時，直接更新資料
                window.lineChart.data = data.lineData;
                window.lineChart.update();
            } else {
                let lineChartCanvas = $("#lineChart").get(0).getContext("2d");
                window.lineChart = new Chart(lineChartCanvas, {
                    type: 'line',
                    data: data.lineData,
                    options: data.options
                });
            }
            const modal = document.getElementById("machineModal");
            // 顯示 modal（使用 Bootstrap 的方法）
            let bootstrapModal = bootstrap.Modal.getInstance(modal);
            bootstrapModal.show();
        } catch (error) {
            console.error("取得圖表資料時發生錯誤:", error);
        }
    },

    //渲染計時器
    renderCounterAndLastUpdateTime() {
        this.updateLastUpdateTime();
        //取得距離下次更新的秒數
        this.remainingTime = machineService.getNextUpdateTime();
        this.startCountdown();
    },

    //更新「上次更新時間」
    updateLastUpdateTime() {
        const lastUpdateElement = document.getElementById("lastUpdateTime");
        lastUpdateElement.textContent = `上次更新時間: ${new Date().toLocaleString()}`;
    },

    remainingTime: null, // 倒數計時的剩餘秒數
    countdownInterval: null,// 計時器 Interval 物件

    //開始計時器
    startCountdown() {
        // 先清除舊的 Interval 避免重複
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }

        this.countdownInterval = setInterval(() => {
            this.updateCountdown();
        }, 1000);
    },

    // 更新倒數計時
    updateCountdown() {
        if (this.remainingTime <= 0) {
            clearInterval(this.countdownInterval); // 停止計時
            this.renderPieChart(); // 重新渲染數據
            this.renderCards();
            this.remainingTime = machineService.getNextUpdateTime();
            // 計算新的更新時間並重新開始倒數
            this.updateLastUpdateTime();
            this.startCountdown(); // 重新開始計時器
            return;
        }

        let minutes = Math.floor(this.remainingTime / 60);
        let secs = this.remainingTime % 60;
        document.getElementById("countdown").textContent =
            `(${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} 後進行自動更新)`;

        this.remainingTime--; // 倒數減少 1 秒
    },
}
export default machineView;