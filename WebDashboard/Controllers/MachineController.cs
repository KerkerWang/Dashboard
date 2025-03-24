using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Hosting;
using System.Web.Http;

namespace WebDashboard.Controllers
{
    public class MachineController : ApiController
    {
        [HttpGet]
        [Route("api/machines")]
        public IHttpActionResult GetAllMachines()
        {
            try
            {
                string directoryPath = HostingEnvironment.MapPath("~/App_Data/");
                if (directoryPath == null || !Directory.Exists(directoryPath))
                    return NotFound();

                List<object> machines = new List<object>();

                // 按照檔名中的數字排序
                var files = Directory.GetFiles(directoryPath, "*.json")
                    .OrderBy(f =>
                    {
                        string fileName = Path.GetFileNameWithoutExtension(f); // 取得檔名 (去除 .json)
                        return int.TryParse(fileName.Replace("machine", ""), out int num) ? num : int.MaxValue;
                    });

                foreach (string filePath in files)
                {
                    string jsonData = File.ReadAllText(filePath);
                    var machine = JsonConvert.DeserializeObject<dynamic>(jsonData);

                    if (machine != null && machine.values != null && machine.values.Count > 0)
                    {
                        // 只保留最新一筆數據
                        machine.values = machine.values[0];
                        //machine.latestValue = machine.values[0];
                        // 移除 values，避免回傳過多資料
                        //machine.values = null;
                    }

                    machines.Add(machine);
                }

                return Json(machines);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        [HttpGet]
        [Route("api/machine/{id}")]
        public IHttpActionResult GetMachine(string id)
        {
            try
            {
                string directoryPath = HostingEnvironment.MapPath("~/App_Data/");
                if (directoryPath == null || !Directory.Exists(directoryPath))
                    return NotFound();

                string filePath = $"{directoryPath}machine{id}.json";

                string jsonData = File.ReadAllText(filePath);
                var machine = JsonConvert.DeserializeObject<dynamic>(jsonData);

                return Json(machine);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }
    }
}