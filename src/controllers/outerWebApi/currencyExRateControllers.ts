import { Request, Response } from "express";
import { success, error } from "@/utils/response";



export async function getAllCurrencyRateList(req: Request, res: Response) {

  const response = await fetch("https://tw.rter.info/capi.php", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  console.log("data:", data);
  res.json(success({ data: data, message: "查詢成功", req, res }));
};




// 匯率
// https://tw.rter.info/capi.php


// 匯率
// https://tw.rter.info/json.php?t=currency&q=cash&iso=USD


// https://api.coinbase.com/v2/exchange-rates?currency=TWD
