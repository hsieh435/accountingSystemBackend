import pool from "@/db";
import { Request, Response } from "express";
import { success, error } from "@/utils/response";
import * as cashFlowServices from "@/services/cashFlowServices";
import { keysToCamel } from "@/utils/tools";
import { searchingCashFlowList } from "@/services/cashFlowServices";



const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;



export async function cashFlowList(req: Request, res: Response) {
  req.body.userId = req.user.userId;

  try {
    const searchingResult = await searchingCashFlowList(req.body.currencyId, req.body.userId);
    console.log("searchingResult:", searchingResult);
    if (searchingResult.success === true) {
      res.json(success({ data: searchingResult.data, message: "查詢成功", req, res }));
    } else {
      res.json(error({ message: "發生錯誤0", req, res }));
    }
  } catch (err) {
    res.json(error({ message: "發生錯誤2", req, res }));
  }
}



export async function searchingCashFlowById(req: Request, res: Response) {
  req.body.userId = req.user.userId;

  try {
    const searchingResult =
      await pool.query(`SELECT * FROM cashflow_list where cashflow_id = '${req.params.cashflowId}' and user_id='${req.body.userId}'`);
    // console.log("searchingResult:", searchingResult.rows);
    if (searchingResult.rows.length === 1) {
      res.json(success({ data: keysToCamel(searchingResult.rows[0]), req, res }));
    } else {
      res.json(error({ message: "現金流不存在", req, res }));
    }
  } catch (err) {
    res.json(error({ req, res }));
  }
}



export async function cashFlowCreate(req: Request, res: Response) {
  req.body.userId = req.user.userId;

  try {
    const createResult = await cashFlowServices.insertCashflowData(req.body);
    console.log("createResult:", createResult);
    if (createResult.success === true) {
      res.json(success({ data: createResult, message: "建立成功", req, res }));
    } else {
      res.json(error({ message: "資料錯誤", req, res }));
    }
  } catch (err) {
    res.json(error({ req, res }));
  }
}



export async function cashFlowUpdate(req: Request, res: Response) {
  req.body.userId = req.user.userId;

  try {
    const updateResult = await cashFlowServices.cashflowDataUpdate(req.body);
    if (updateResult) {
      res.json(success({ message: "修改成功", req, res }));
    } else {
      res.json(error({ message: "修改失敗", req, res }));
    }
  } catch (err) {
    res.status(500).json(error({ req, res }));
  }
}



export async function cashFlowDelete(req: Request, res: Response) {
  req.body.userId = req.user.userId;

  try {
    const removeResult =
      await pool.query(`DELETE FROM public.cashflow_list	WHERE cashflow_id = '${req.params.cashflowId}' and user_id='${req.body.userId}'`);
    // console.log("removeResult:", removeResult);
    if (removeResult.rowCount === 1) {
      res.json(success({ message: "刪除成功", req, res }));
    } else {
      res.json(error({ message: "刪除失敗", req, res }));
    }
  } catch (err) {
    res.json(error({ req, res }));
  }
};
