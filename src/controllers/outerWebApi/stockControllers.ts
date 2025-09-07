import { Request, response, Response } from "express";
import { success, error } from "@/utils/response";



// 搜尋股票列表
export async function getAllStockList(req: Request, res: Response) {
  try {
    const response = await fetch("https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockInfo", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (response.status === 200) {
      const jsonData = await response.json();
      // console.log("jsonData:", jsonData.data.length);
      // 3960
      const data: { stock_id: string; stock_name: string }[] = [];
      jsonData.data.forEach(function(item: { stock_id: string; stock_name: string }) {
        if (!data.some(i => i.stock_id === item.stock_id)) {
          data.push(item);
        }
      });

      const dataFiltered = data.filter((item: { stock_id: string; stock_name: string }) =>
        item.stock_id.toLowerCase().includes(req.params.keyword.toLowerCase()) ||
        item.stock_name.toLowerCase().includes(req.params.keyword.toLowerCase()),
      )
      res.json(success({ data: JSON.stringify(dataFiltered), message: "查詢成功", req, res }));
    } else {
      res.json(error({ data: [], req, res }));
    }
  } catch (err) {
    res.json(error({ data: [], req, res }));
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
        headers: { "Content-Type": "application/json" },
      },
    );
    const jsonData = await response.json();
    // console.log("response:", jsonData);
    res.json(success({ data: jsonData, message: "查詢成功", req, res }));
  } catch (err) {
    res.json(error({ data: [], req, res }));
  }
}



// 除權息
export async function getStockDividendInfo(req: Request, res: Response) {
  const data: { stockNo: string; startDate: string; endDate: string } = req.body;
  // console.log("data:", data);
  // TaiwanStockDividend

  try {
    const response = await fetch(
      `https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockDividendResult&data_id=${data.stockNo}&start_date=${data.startDate}&end_date=${data.endDate}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );
    const jsonData = await response.json();
    // console.log("response:", jsonData);
    res.json(success({ data: jsonData, message: "查詢成功", req, res }));
  } catch (err) {
    res.json(error({ data: [], req, res }));
  }
}



// PER：本益比（Price-to-Earning Ratio）
// PBR：股價淨值比（Price-to-Book Ratio）
export async function getStockPERInfo(req: Request, res: Response) {
  const data: { stockNo: string; startDate: string; endDate: string } = req.body;
  // console.log("data:", data);

  try {
    const response = await fetch(
      `https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockPER&data_id=${data.stockNo}&start_date=2000-01-01`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );
    const jsonData = await response.json();
    res.json(success({ data: jsonData, message: "查詢成功", req, res }));
  } catch (err) {
    res.json(error({ data: [], req, res }));
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
