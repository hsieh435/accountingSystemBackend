import { Request, response, Response } from "express";
import { success, error } from "@/utils/response";

// 搜尋股票列表
export async function getAllStockList(req: Request, res: Response) {
  const response = await fetch("https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const jsonData = await response.json();
  // console.log("jsonData:", jsonData.length);

  const data = jsonData
    .filter(
      (item: any) =>
        item.Code.toLowerCase().includes(req.params.keyword.toLowerCase()) ||
        item.Name.toLowerCase().includes(req.params.keyword.toLowerCase()),
    )
    .map((item: any) => {
      return {
        value: item.Code,
        label: `${item.Code} - ${item.Name}`,
      };
    })
    .slice(0, 20);
  res.json(success({ data: JSON.stringify(data), message: "查詢成功", req, res }));
}

//
export async function getEachStockList(req: Request, res: Response) {
  const response = await fetch("https://openapi.twse.com.tw/v1/exchangeReport/BWIBBU_ALL", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const jsonData = await response.json();
  // console.log("jsonData:", jsonData);

  const data = jsonData
    .filter(
      (item: any) =>
        item.Code.toLowerCase().includes(req.params.keyword.toLowerCase()) ||
        item.Name.toLowerCase().includes(req.params.keyword.toLowerCase()),
    )
    .map((item: any) => {
      return {
        value: item.Code,
        label: `${item.Code} - ${item.Name}`,
      };
    })
    .slice(0, 20);
  res.json(success({ data: JSON.stringify(data), message: "查詢成功", req, res }));
}
// https://hackmd.io/@aaronlife/python-ex-stock-by-api
// tse_開頭為上市股票
// otc_開頭為上櫃股票

//
// https://mis.twse.com.tw/stock/index?lang=zhHant
export async function getStockPriceHistoryRecord(req: Request, res: Response) {
  const data: { stockNo: string; startYear: number; startMonth: number; endYear: number; endMonth: number } = req.body;
  // console.log("data:", data);

  // const aaaa = new Date(data.endYear, data.endMonth, 0);
  // console.log("aaaa:", aaaa.getDate());

  const dateStr = `${data.startYear}-${(data.startMonth).toString().padStart(2, "0")}-01`;
  const endDateStr =
    `${data.endYear}-${(data.endMonth).toString().padStart(2, "0")}-${new Date(data.endYear, data.endMonth, 0).getDate().toString().padStart(2, "0")}`;
  // console.log("data:", data.stockNo);
  // console.log("dateStr:", dateStr);
  // console.log("endDateStr:", endDateStr);
  try {
    const response = await fetch(
      `https://api.finmindtrade.com/api/v3/data?dataset=TaiwanStockPrice&stock_id=${data.stockNo}&date=${dateStr}&end_date=${endDateStr}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );
    const jsonData = await response.json();
    // console.log("response:", jsonData);
    res.json(success({ data: jsonData, message: jsonData.data.length > 0 ? "查詢成功" : "查無資料", req, res }));
  } catch (err) {
    console.log("err:", err);
    res.json(error({ data: [], req, res }));
  }
}

// https://api.finmindtrade.com/api/v3/data?dataset=TaiwanStockPrice&stock_id=2330&date=2025-08-01&end_date=2025-08-31

// https://mis.twse.com.tw/stock/index?lang=zhHant

// https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=202110011&stockNo=2330

// https://ithelp.ithome.com.tw/articles/10258478

// https://vocus.cc/article/667ebabbfd897800016b3086

// https://openapi.twse.com.tw/
// https://openapi.twse.com.tw/v1/exchangeReport/BWIBBU_ALL
