import pool from "@/db";
import { Request, Response } from "express";
import { success, error } from "@/utils/response";
import * as currencyAccountServices from "@/services/currencyAccount/currencyAccountListServices";
import { keysToCamel } from "@/utils/tools";



export async function currencyAccountList(req: Request, res: Response) {
  // console.log("Request body:", req.body);

  try {
    const searchingResult = await currencyAccountServices.searchingCurrencyAccountList(req.body);
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



export async function searchingCurrencyAccountById(req: Request, res: Response) {

  try {
    const searchingResult =
      await pool.query(`SELECT * FROM currency_account_list WHERE account_id = '${req.params.accountId}' AND user_id='${req.body.userId}'`);
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



export async function currencyAccountCreate(req: Request, res: Response) {

  try {
    const createResult = await currencyAccountServices.insertCurrencyAccountData(req.body);
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



export async function currencyAccountUpdate(req: Request, res: Response) {

  try {
    const updateResult = await currencyAccountServices.updateCurrencyAccountData(req.body);
    if (updateResult) {
      res.json(success({ message: "修改成功", req, res }));
    } else {
      res.json(error({ message: "修改失敗", req, res }));
    }
  } catch (err) {
    res.status(500).json(error({ req, res }));
  }
}



export async function enableCurrencyAccount(req: Request, res: Response) {
  req.body.accountId = req.params.accountId;

  try {
    const adjustResult = await currencyAccountServices.enableCurrencyAccountStatus(req.body);
    if (adjustResult) {
      res.json(success({ message: "啟用成功", req, res }));
    } else {
      res.json(error({ req, res }));
    }
  } catch (err) {
    res.json(error({ req, res }));
  }
}



export async function disableCurrencyAccount(req: Request, res: Response) {
  req.body.accountId = req.params.accountId;

  try {
    const adjustResult = await currencyAccountServices.disableCurrencyAccountStatus(req.body);
    if (adjustResult) {
      res.json(success({ message: "已停用", req, res }));
    } else {
      res.json(error({ req, res }));
    }
  } catch (err) {
    res.json(error({ req, res }));
  }
}



export async function currencyAccountDelete(req: Request, res: Response) {
  req.body.accountId = req.params.accountId;

  try {
    const removeResult = await currencyAccountServices.removeCurrencyAccountData(req.body);
    if (removeResult.success === true) {
      res.json(success({ message: removeResult.message, req, res }));
    } else {
      res.json(error({ message: removeResult.message, req, res }));
    }
  } catch (err) {
    res.json(error({ req, res }));
  }
};
