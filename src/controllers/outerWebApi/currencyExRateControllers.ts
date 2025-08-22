import { Request, Response } from "express";
import { success, error } from "@/utils/response";



// 貨幣匯率查詢參數 interface
export interface ICurrencyExRateSearchingParams {
  currencyId: string;
  startDate?: string;
  endDate?: string;
}



// https://open.er-api.com/v6/latest/TWD
// 查詢最新匯率
export async function getLatestCurrencyExchangeRate(req: Request, res: Response) {
  const response = await fetch(`https://open.er-api.com/v6/latest/${req.params.currencyCode}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  // console.log("data:", data);
  res.json(success({ data: data, message: "查詢成功", req, res }));
};



// 臺幣兌換外幣歷史紀錄查詢
export async function getCurrencyExRateHistory(req: Request, res: Response) {
  const params: ICurrencyExRateSearchingParams = req.body;
  const response = await fetch(`https://api.finmindtrade.com/api/v3/data?dataset=TaiwanExchangeRate&data_id=${params.currencyId}&date=${params.startDate}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  // console.log("data:", data);
  res.json(success({ data: data, message: "查詢成功", req, res }));
}
// https://api.finmindtrade.com/api/v3/data?dataset=TaiwanExchangeRate&data_id=EUR&date=2006-01-01
