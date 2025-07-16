import { Request, Response } from "express";
import { success, error } from "@/utils/response";



export async function getAllStockList(req: Request, res: Response) {

  const response = await fetch(`https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  // console.log("data:", data);
  res.json(success({ data: data, message: "查詢成功" }));
};



export async function getEachStockList(req: Request, res: Response) {

  const response = await fetch(`http://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${req.params.code}.tw`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  // console.log("data:", data);
  res.json(success({ data: data, message: "查詢成功" }));
};
// https://hackmd.io/@aaronlife/python-ex-stock-by-api
