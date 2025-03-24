import machineRepository from "./machineRepository.js";

let cachedAllMachineData = null; // 記錄 API 回傳資料，避免多次請求

const machineService = {
    //整理資料for pieChart
    async getDataForPieChart() {
        //確認有資料
        if (!cachedAllMachineData) {
            cachedAllMachineData = await machineRepository.fetchAllMachineData();
        }

        //處理資料
        // 篩選 health >= 60 的機器
        const healthyCount = cachedAllMachineData.filter(machine => machine.values.health >= 60).length;
        const count = cachedAllMachineData.length;

        let values = [];
        let labels = [];
        let backgroundColor = [];
        let borderColor = [];

        if (healthyCount === 0) {
            values = [count];
            labels = ["bad"];
            backgroundColor = ['rgba(54, 162, 235, 0.5)'];
            borderColor = ['rgba(54, 162, 235, 0.5)'];
        } else if (count === healthyCount) {
            values = [healthyCount];
            labels = ["good"];
            backgroundColor = ['rgba(255, 99, 132, 0.5)'];
            borderColor = ['rgba(255, 99, 132, 0.5)'];
        } else {
            values = [healthyCount, Math.abs(count - healthyCount)];
            labels = ["good", "bad"];
            backgroundColor = ['rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)'];
            borderColor = ['rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)'];
        }
        //設定圖表的資料
        let doughnutPieData = {
            datasets: [{
                data: values,  // 假設 API 回傳的數據是 { values: [1, 1.5, 2] }
                backgroundColor: backgroundColor,
                borderColor: borderColor,
            }],
            labels: labels  // 假設 API 回傳的標籤是 { labels: ["A", "B", "C"] }
        };
        let doughnutPieOptions = {
            responsive: true,
            animation: {
                animateScale: true,
                animateRotate: true
            }
        };

        let data = { doughnutPieData, doughnutPieOptions }

        return data;
    },

    //整理資料for cards
    async getDataForCards() {
        if (!cachedAllMachineData) {
            cachedAllMachineData = await machineRepository.fetchAllMachineData();
        }
        let dataArr = [];
        cachedAllMachineData.forEach((machine, index) => {
            let data = {
                image: machine.image,
                name: machine.name,
                health: machine.values.health,
                status: machine.status
            };
            dataArr.push(data);
        })
        return dataArr;
    },

    //整理資料for modal
    async getDataForModal(id) {
        let machineData = await machineRepository.fetchMachineData(id);

        const name = machineData.name;
        const status = machineData.status;
        let lastUpdateTime = null;
        let labels = [];
        let health = [];
        machineData.values.forEach((v, index) => {
            if (index === 0) {
                lastUpdateTime = v.datetime;
            }
            labels.unshift(v.datetime.substring(11));
            health.unshift(v.health);
        })
        let lineData = {
            labels: labels,
            datasets: [{
                label: '健康度',
                data: health,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1,
                fill: false
            }]
        };
        let options = {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    },
                    gridLines: {
                        color: "rgba(204, 204, 204,0.1)"
                    }
                }],
                xAxes: [{
                    gridLines: {
                        color: "rgba(204, 204, 204,0.1)"
                    }
                }]
            },
            legend: {
                display: false
            },
            elements: {
                point: {
                    radius: 0
                }
            }
        };
        let data = { lineData, options, name, status, lastUpdateTime };
        return data;
    },

    //計算距離下一次更新還有多少秒
    getNextUpdateTime() {
        let now = new Date();
        let currentMinutes = now.getMinutes();
        //let currentSeconds = now.getSeconds();

        // 計算下一個 09:01 / 09:11 / 09:21 / 09:31 ... 的分鐘數
        let nextUpdateMinute = Math.ceil(currentMinutes / 10) * 10 + 1;

        if (nextUpdateMinute >= 60) {
            now.setHours(now.getHours() + 1); // 跳到下一小時
            nextUpdateMinute = 1;
        }

        let nextUpdateTime = new Date(now);
        nextUpdateTime.setMinutes(nextUpdateMinute, 0, 0); // 設定分鐘數，秒數歸零

        //計算當前時間 (new Date()) 到 nextUpdateTime 之間的秒數
        let diffInSeconds = Math.round((nextUpdateTime - new Date()) / 1000);
        return diffInSeconds > 0 ? diffInSeconds : 0; // 避免負數
    }
};

export default machineService;

//export class MachineService {
//    constructor() {
//        this.machineRepository = MachineRepository;
//        this.cachedMachines = null; // 快取變數
//        this.healthyCount = null; //健康機器數量
//        this.count = null;
//    }

//    //打api取資料存成員
//    async getAllMachines() {
//        if (!this.cachedMachines) {
//            let machines = await this.machineRepository.getMachines();
//            if (!machines) return [];

//            this.cachedMachines = machines;
//            this.healthyCount = machines.filter(machine => machine.values.health >= 60).length;           // 篩選 health >= 60 的機器並快取
//            this.count = machines.length;
//        }
//        return this.cachedMachines;
//    }

//    //將資料放做成需要格式放到以machineView渲染圓餅圖
//    async loadPieChart() {
//        //確認有資料
//        if (!this.healthyCount) {
//            await this.getAllMachines();
//        }
//        if (!this.count) {
//            await this.getAllMachines();
//        }
//        //處理資料
//        let values = [];
//        let labels = [];
//        let backgroundColor = [];
//        let borderColor = [];
//        if (this.healthyCount === 0) {
//            values = [this.count];
//            labels = ["bad"];
//            backgroundColor = ['rgba(54, 162, 235, 0.5)'];
//            borderColor = ['rgba(54, 162, 235, 0.5)'];
//        } else if (this.count === this.healthyCount) {
//            values = [this.healthyCount];
//            labels = ["good"];
//            backgroundColor = ['rgba(255, 99, 132, 0.5)'];
//            borderColor = ['rgba(255, 99, 132, 0.5)'];
//        } else {
//            values = [this.count, this.healthyCount];
//            labels = ["good", "bad"];
//            backgroundColor = ['rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)'];
//            borderColor = ['rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)'];
//        }
//        //設定圖表的資料
//        var doughnutPieData = {
//            datasets: [{
//                data: values,  // 假設 API 回傳的數據是 { values: [1, 1.5, 2] }
//                /*data: [count],*/
//                backgroundColor: backgroundColor,
//                borderColor: borderColor,
//            }],
//            labels: labels
//            //labels: data.labels  // 假設 API 回傳的標籤是 { labels: ["A", "B", "C"] }
//        };
//        var doughnutPieOptions = {
//            responsive: true,
//            animation: {
//                animateScale: true,
//                animateRotate: true
//            }
//        };

//        MachineView.drawPieChart(doughnutPieData, doughnutPieOptions);
//        //if ($("#pieChart").length) {
//        //    var pieChartCanvas = $("#pieChart").get(0).getContext("2d");
//        //    var pieChart = new Chart(pieChartCanvas, {
//        //        type: 'pie',
//        //        data: doughnutPieData,
//        //        options: doughnutPieOptions
//        //    });
//        //}
//    }

//    //將資料放做成需要格式放到以machineView渲染機器卡片
//    async loadCards() {
//        if (!this.machines) {
//            await this.getAllMachines();
//        }
//        this.machines.forEach((machine, index) => {
//            const card = document.createElement("div");
//            card.className = "card mb-3";
//            card.innerHTML = `
//                <div class="row g-0">
//                    <div class="col-md-4">
//                        <img src="${machine.image}" class="img-fluid rounded-start" alt="${machine.name}">
//                    </div>
//                    <div class="col-md-8">
//                        <div class="card-body">
//                            <h5 class="card-title">${machine.name}</h5>
//                                <p class="card-text"><strong>狀態：</strong>${machine.status}</p>
//                                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#machineModal"
//                                    data-name="${machine.name}"
//                                    data-image="${machine.image}"
//                                    data-status="${machine.status}"
//                                    data-health="${machine.values.health}"
//                                    data-datetime="${machine.values.datetime}">
//                                    查看詳情
//                                </button>
//                        </div>
//                    </div>
//                </div>`;
//        })
//    }
//}