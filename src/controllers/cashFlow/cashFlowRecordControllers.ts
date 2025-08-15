import pool from "@/db";
import { Request, Response } from "express";
import { success, error } from "@/utils/response";
import * as cashFlowRecordServices from "@/services/cashFlow/cashFlowRecordServices";
import { keysToCamel } from "@/utils/tools";



export async function cashFlowRecordList(req: Request, res: Response) {
  try {
    const searchingResult = await cashFlowRecordServices.searchingCashFlowRecordList(req.body);
    // console.log("searchingResult:", searchingResult);
    if (searchingResult.success === true) {
      res.json(success({ data: searchingResult.data, message: "查詢成功", req, res }));
    } else {
      res.json(error({ message: "發生錯誤", req, res }));
    }
  } catch (err) {
    res.json(error({ message: "發生錯誤", req, res }));
  }
}



export async function searchingCashFlowRecordById(req: Request, res: Response) {
  try {
    const searchingResult = await pool.query(
      `SELECT * FROM public.cashflow_trade where trade_id = '${req.params.tradeId}' and user_id='${req.body.userId}'`,
    );
    // console.log("searchingResult:", searchingResult.rows);
    if (searchingResult.rows.length === 1) {
      res.json(success({ data: keysToCamel(searchingResult.rows[0]), req, res }));
    } else {
      res.json(error({ message: "支出紀錄不存在", req, res }));
    }
  } catch (err) {
    res.json(error({ req, res }));
  }
}
