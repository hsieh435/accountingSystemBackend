import pool from "@/db";
import { Request, Response } from "express";
import { success, error } from "@/utils/response";
import * as currencyAccountRecordServices from "@/services/currencyAccount/currencyAccountRecordServices";
import { keysToCamel } from "@/utils/tools";



export async function currencyAccountRecordList(req: Request, res: Response) {
  // console.log("Request body:", req.body);

  try {
    const searchingResult = await currencyAccountRecordServices.searchingCurrencyAccountRecordList(req.body);
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



export async function searchingCurrencyAccountRecordById(req: Request, res: Response) {

  try {
    const searchingResult =
      await pool.query(`SELECT * FROM currency_account_trade WHERE trade_id = '${req.body.tradeId}' AND account_id = '${req.body.accountId}' AND user_id='${req.body.userId}'`);
    // console.log("searchingResult:", searchingResult.rows);
    if (searchingResult.rows.length === 1) {
      res.json(success({ data: keysToCamel(searchingResult.rows[0]), req, res }));
    } else {
      res.json(error({ message: "存款帳戶不存在", req, res }));
    }
  } catch (err) {
    res.json(error({ req, res }));
  }
}



export async function currencyAccountRecordCreate(req: Request, res: Response) {

  try {
    const createResult = await currencyAccountRecordServices.insertCurrencyAccountRecord(req.body);
    // console.log("createResult:", createResult);
    if (createResult.success === true) {
      res.json(success({ data: createResult, message: "建立成功", req, res }));
    } else {
      res.json(error({ message: "資料錯誤", req, res }));
    }
  } catch (err) {
    res.json(error({ req, res }));
  }
}



export async function currencyAccountRecordUpdate(req: Request, res: Response) {

  try {
    const updateResult = await currencyAccountRecordServices.updateCurrencyAccountRecord(req.body);
    if (updateResult) {
      res.json(success({ message: "修改成功", req, res }));
    } else {
      res.json(error({ message: "修改失敗", req, res }));
    }
  } catch (err) {
    res.status(500).json(error({ req, res }));
  }
}



export async function currencyAccountRecordDelete(req: Request, res: Response) {

  try {
    const removeResult = await currencyAccountRecordServices.removeCurrencyAccountRecord(req.body);
    if (removeResult.success === true) {
      res.json(success({ message: removeResult.message, req, res }));
    } else {
      res.json(error({ message: removeResult.message, req, res }));
    }
  } catch (err) {
    res.json(error({ req, res }));
  }
};
