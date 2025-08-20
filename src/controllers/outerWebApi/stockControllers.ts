import { Request, Response } from "express";
import { success, error } from "@/utils/response";

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

export async function getEachStockList(req: Request, res: Response) {
  const response = await fetch("https://openapi.twse.com.tw/v1/exchangeReport/BWIBBU_ALL", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const jsonData = await response.json();
  console.log("jsonData:", jsonData);

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

// https://mis.twse.com.tw/stock/index?lang=zhHant

export async function getStockPriceByDateRange(req: Request, res: Response) {
  const data: { stockNo: string; startYear: number; startMonth: number; endYear: number; endMonth: number } = req.body;
  // console.log("data:", data);
  const resultData = [];
  if (data.startYear === data.endYear && data.startMonth === data.endMonth) {
    const response = await fetch(
      `https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&stockNo=${data.stockNo}&date=${data.startYear}${data.startMonth.toString().padStart(2, "0")}01`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );
    const responseData = await response.json();
    resultData.push(responseData);

  } else {
    const startDate = new Date(data.startYear, data.startMonth - 1, 1);
    const endDate = new Date(data.endYear, data.endMonth - 1, 1);
    let currentDate = startDate;

    for (let i = currentDate; currentDate <= endDate; currentDate.setMonth(currentDate.getMonth() + 1)) {
      const response = await fetch(
        `https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&stockNo=${data.stockNo}&date=${currentDate.getFullYear()}${(currentDate.getMonth() + 1).toString().padStart(2, "0")}01`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );
      const responseData = await response.json();
      if (responseData.total !== 0) {
        resultData.push(responseData);
      }
    }
  }
  // console.log("resultData:", resultData);
  res.json(success({ data: resultData, message: "查詢成功", req, res }));
}


// https://mis.twse.com.tw/stock/index?lang=zhHant

// https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=202110011&stockNo=2330

// https://ithelp.ithome.com.tw/articles/10258478

// https://vocus.cc/article/667ebabbfd897800016b3086

// https://openapi.twse.com.tw/
// https://openapi.twse.com.tw/v1/exchangeReport/BWIBBU_ALL
