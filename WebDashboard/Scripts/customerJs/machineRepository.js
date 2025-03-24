const machineRepository = {
    //打api取得所有機器資料
    async fetchAllMachineData() {
        try {
            let response = await fetch(`${window.location.origin}/api/machines`); // 也可以用完整 API URL
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching machines:", error);
            return null;
        }
    },

    //打api取得單一機器資料
    async fetchMachineData(id) {
        try {
            let response = await fetch(`${window.location.origin}/api/machine/${id}`); // 也可以用完整 API URL
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching machines:", error);
            return null;
        }
    }
}

export default machineRepository;