import { Request, Response } from "express";
import { exchangerateApiKeys } from "@/apiKey";
import { handleControllersResponse } from "@/controllers/controllersTools";

// 貨幣匯率查詢參數 interface
export interface ICurrencyExRateSearchingParams {
  currencyId: string;
  startDate?: string;
  endDate?: string;
}

// GET https://v6.exchangerate-api.com/v6/YOUR-API-KEY/codes
// 查詢貨幣列表
export async function getCurrencyListByOuterApi(req: Request, res: Response) {
  try {
    const response = await fetch(`https://v6.exchangerate-api.com/v6/${exchangerateApiKeys}/codes`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    const currencyList: { currencyCode: string; currencyName: string }[] = [];
    data.supported_codes.forEach(function (item: string[]) {
      if (!currencyList.some((i) => i.currencyCode === item[0])) {
        currencyList.push({ currencyCode: item[0], currencyName: item[1] });
      }
    });

    const dataFiltered = currencyList.filter(
      (item: { currencyCode: string; currencyName: string }) =>
        item.currencyCode.toLowerCase().includes(req.params.keyword.toLowerCase()) ||
        item.currencyName.toLowerCase().includes(req.params.keyword.toLowerCase()),
    );

    await handleControllersResponse(res, req, dataFiltered);
  } catch (err) {
    await handleControllersResponse(res, req, { message: String(err) }, 500);
  }
}

// https://open.er-api.com/v6/latest/TWD
// 查詢最新匯率
export async function getLatestCurrencyExchangeRate(req: Request, res: Response) {
  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${req.params.currencyCode}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    await handleControllersResponse(res, req, response);
  } catch (err) {
    await handleControllersResponse(res, req, { message: String(err) }, 500);
  }
}

// 臺幣兌換外幣歷史紀錄查詢
export async function getCurrencyExRateHistory(req: Request, res: Response) {
  const params: ICurrencyExRateSearchingParams = req.body;

  try {
    const response = await fetch(
      `https://api.finmindtrade.com/api/v3/data?dataset=TaiwanExchangeRate&data_id=${params.currencyId}&date=${params.startDate}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );
    // console.log("data:", data);
    await handleControllersResponse(res, req, response);
  } catch (err) {
    await handleControllersResponse(res, req, { message: String(err) }, 500);
  }
}

// https://app.exchangerate-api.com/sign-in
// https://www.exchangerate-api.com/docs/historical-data-requests
