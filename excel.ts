import * as fs from "fs";
import * as path from "path";

// 1. 讀取 CSV 檔案
const filePath = path.join(__dirname, "20250910.csv"); // CSV 路徑
const rawData = fs.readFileSync(filePath, "utf8");

// 2. 解析 CSV（以換行分列，再用逗號分欄）
const rows = rawData
  .split("\n") // 分行
  .map((row) => row.trim()) // 去掉前後空格
  .filter((row) => row.length > 0); // 避免空行

// 3. 處理資料
const newRows = rows.map((row, index) => {
  const cols = row.split(","); // 分欄


  // A欄：逗號前文字
  const A = cols[0].split(",")[0];

  // B欄與C欄：抓括號內文字並分割 " - "
  let B = "";
  let C = "";
  const cellB = cols[1] || "";
  const start = cellB.indexOf("(");
  const end = cellB.indexOf(")");
  if (start !== -1 && end !== -1 && end > start) {
    const inside = cellB.substring(start + 1, end);
    const splitIndex = inside.indexOf(" - ");
    if (splitIndex !== -1) {
      B = inside.substring(0, splitIndex);
      C = inside.substring(splitIndex + 3); // 3 是 " - " 的長度
    }
  }

  return [A, B, C].join(",");
});

// 4. 輸出新 CSV
const outputPath = path.join(__dirname, "202509111111111.csv");
fs.writeFileSync(outputPath, newRows.join("\n"), "utf8");

console.log("完成 CSV 處理，檔案產生於：", outputPath);
