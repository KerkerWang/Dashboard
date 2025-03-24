import machineRepository from "./machineRepository.js";

const machineService = {
    cachedAllMachineData: null,// 記錄 API 回傳資料，避免多次請求
    fetchPromise: null, // 存儲請求的 Promise，避免重複請求

    async fetchDataOnce() {
        if (!this.cachedAllMachineData) {
            if (!this.fetchPromise) {
                this.fetchPromise = machineRepository.fetchAllMachineData();
                this.cachedAllMachineData = await this.fetchPromise;
                this.fetchPromise = null; // 清除 Promise，確保未來可重新請求
            } else {
                this.cachedAllMachineData = await this.fetchPromise; // 等待已有的請求完成
            }
        }
    },

    //整理資料for pieChart
    async getDataForPieChart() {
        await this.fetchDataOnce();
        //處理資料
        // 篩選 health >= 60 的機器
        const healthyCount = this.cachedAllMachineData.filter(machine => machine.values.health >= 60).length;
        const count = this.cachedAllMachineData.length;

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

        await this.fetchDataOnce();

        let dataArr = [];
        this.cachedAllMachineData.forEach((machine) => {
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