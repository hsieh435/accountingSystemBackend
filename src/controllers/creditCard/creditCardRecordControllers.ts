import pool from "@/db";
import { Request, Response } from "express";
import { success, error } from "@/utils/response";
import * as creditCardRecordServices from "@/services/creditCard/creditCardRecordServices";
import { keysToCamel } from "@/utils/tools";



export async function creditCardRecordList(req: Request, res: Response) {
  // console.log("Request body:", req.body);

  try {
    const searchingResult = await creditCardRecordServices.searchingCreditCardRecordList(req.body);
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



export async function searchingCreditCardRecordById(req: Request, res: Response) {

  try {
    const searchingResult =
      await pool.query(`SELECT * FROM creditcard_trade where trade_id = '${req.params.tradeId}' AND creditcard_id = '${req.body.creditCardId}' AND user_id='${req.body.userId}'`);
    // console.log("searchingResult:", searchingResult.rows);
    if (searchingResult.rows.length === 1) {
      res.json(success({ data: keysToCamel(searchingResult.rows[0]), req, res }));
    } else {
      res.json(error({ message: "信用卡不存在", req, res }));
    }
  } catch (err) {
    res.json(error({ req, res }));
  }
}



export async function creditCardRecordCreate(req: Request, res: Response) {

  try {
    const createResult = await creditCardRecordServices.insertCreditCardData(req.body);
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



export async function creditCardRecordUpdate(req: Request, res: Response) {

  try {
    const updateResult = await creditCardRecordServices.updateCreditCardData(req.body);
    if (updateResult) {
      res.json(success({ message: "修改成功", req, res }));
    } else {
      res.json(error({ message: "修改失敗", req, res }));
    }
  } catch (err) {
    res.status(500).json(error({ req, res }));
  }
}



export async function creditCardRecordDelete(req: Request, res: Response) {

  try {
    const removeResult = await creditCardRecordServices.removeCreditCardData(req.body);
    if (removeResult.success === true) {
      res.json(success({ message: removeResult.message, req, res }));
    } else {
      res.json(error({ message: removeResult.message, req, res }));
    }
  } catch (err) {
    res.json(error({ req, res }));
  }
};
