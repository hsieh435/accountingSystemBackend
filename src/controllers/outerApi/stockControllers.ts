import { Request, Response } from "express";
import { handleControllersResponse } from "@/controllers/controllersTools";
import { getCurrentYear } from "@/utils/tools";

// 搜尋股票列表
export async function getAllStockList(req: Request, res: Response) {
  try {
    const response = await fetch("https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockInfo", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.FinMind_API_TOKEN}`,
      },
    });
    const jsonData = await response.json();
    // console.log("jsonData:", jsonData);
    const data: { stock_id: string; stock_name: string }[] = [];
    jsonData.data.forEach(function (item: { stock_id: string; stock_name: string }) {
      if (!data.some((i) => i.stock_id === item.stock_id)) {
        data.push(item);
      }
    });

    const dataFiltered = data.filter(
      (item: { stock_id: string; stock_name: string }) =>
        item.stock_id.toLowerCase().includes(req.params.keyword.toLowerCase()) ||
        item.stock_name.toLowerCase().includes(req.params.keyword.toLowerCase()),
    );

    await handleControllersResponse(res, req, { success: true, data: dataFiltered });
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

// https://mis.twse.com.tw/stock/index?lang=zhHant
export async function getStockPriceHistoryRecord(req: Request, res: Response) {
  const data: { stockNo: string; startDate: string; endDate: string } = req.body;
  // console.log("data:", data);

  try {
    const response = await fetch(
      `https://api.finmindtrade.com/api/v3/data?dataset=TaiwanStockPrice&stock_id=${data.stockNo}&date=${data.startDate}&end_date=${data.endDate}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.FinMind_API_TOKEN}`,
        },
      },
    );
    const jsonData = await response.json();
    await handleControllersResponse(res, req, { success: true, data: jsonData });
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

// 股利政策表
export async function getStockDividendPolicy(req: Request, res: Response) {
  const data: { stockNo: string; startDate: string; endDate: string } = req.body;
  // console.log("data:", data);
  if (new Date(data.startDate) < new Date("2006-01-01 00:00:00")) {
    data.startDate = "2006-01-01";
  }
}

// 除權除息結果表
export async function getStockDividendResult(req: Request, res: Response) {
  const data: { stockNo: string; startDate: string; endDate: string } = req.body;
  // console.log("data:", data);
  // TaiwanStockDividend
  // TaiwanStockDividendResult

  try {
    const dividendResultResponse = await fetch(
      `https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockDividend&data_id=${data.stockNo}&start_date=1990-01-01&end_date=${getCurrentYear()}-12-31`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.FinMind_API_TOKEN}`,
        },
      },
    );
    const jsonData = await dividendResultResponse.json();
    // console.log("jsonData:", jsonData);
    await handleControllersResponse(res, req, { success: true, data: jsonData });
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

// PER：本益比（Price-to-Earning Ratio）
// PBR：股價淨值比（Price-to-Book Ratio）
export async function getStockPerPbrInfo(req: Request, res: Response) {
  const data: { stockNo: string; startDate: string; endDate: string } = req.body;
  if (new Date(data.startDate) < new Date("2005-10-01 00:00:00")) {
    data.startDate = "2005-10-01";
  }
  // console.log("data:", data);

  try {
    const response = await fetch(
      `https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockPER&data_id=${data.stockNo}&start_date=${data.startDate}&end_date=${data.endDate}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.FinMind_API_TOKEN}`,
        },
      },
    );
    const jsonData = await response.json();
    // console.log("jsonData:", jsonData);
    await handleControllersResponse(res, req, { success: true, data: jsonData });
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

// https://api.docsaid.org/stocks/infos
// https://docsaid.org/blog/get-taiwan-all-stocks-info/

// https://mis.twse.com.tw/stock/index?lang=zhHant

// https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=202110011&stockNo=2330

// https://ithelp.ithome.com.tw/articles/10258478

// https://vocus.cc/article/667ebabbfd897800016b3086

// https://openapi.twse.com.tw/
// https://openapi.twse.com.tw/v1/exchangeReport/BWIBBU_ALL
