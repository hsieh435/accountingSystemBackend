"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
// 1. 讀取 CSV 檔案
var filePath = path.join(__dirname, "20250910.csv"); // CSV 路徑
var rawData = fs.readFileSync(filePath, "utf8");
// 2. 解析 CSV（以換行分列，再用逗號分欄）
var rows = rawData
    .split("\n") // 分行
    .map(function (row) { return row.trim(); }) // 去掉前後空格
    .filter(function (row) { return row.length > 0; }); // 避免空行
// 3. 處理資料
var newRows = rows.map(function (row, index) {
    var cols = row.split(","); // 分欄


    // A欄：逗號前文字
    var A = cols[0].split(",")[0].trim();
    // B欄與C欄：抓括號內文字並分割 " - "
    var B = "";
    var C = "";
    var cellB = cols[1] || "";
    var start = cellB.indexOf("(");
    var end = cellB.indexOf(")");
    if (start !== -1 && end !== -1 && end > start) {
        var inside = cellB.substring(start + 1, end);
        var splitIndex = inside.indexOf(" - ");
        if (splitIndex !== -1) {
            B = inside.substring(0, splitIndex).trim();
            C = inside.substring(splitIndex + 3).trim(); // 3 是 " - " 的長度
        }
    }
    return [C, B, A].join(",");
});
// 4. 輸出新 CSV
var outputPath = path.join(__dirname, "20250910000.csv");
fs.writeFileSync(outputPath, newRows.join("\n"), "utf8");
console.log("完成 CSV 處理，檔案產生於：", outputPath);
