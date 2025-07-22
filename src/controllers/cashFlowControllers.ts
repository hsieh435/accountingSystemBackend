import pool from "@/db";
import { Request, Response } from "express";
import { success, error } from "@/utils/response";
import * as cashFlowServices from "@/services/cashFlowServices";



const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;



export async function cashFlowList(req: Request, res: Response) {
  try {
    const searchingResult = await pool.query(`SELECT * FROM cashflow_list where currency LIKE '%${req.body.currencyId}%' ORDER BY created_date`);
    // console.log("searchingResult:", searchingResult.rows);
    if (searchingResult) {
      res.json(success({ data: searchingResult.rows, req, res }));
    }
  } catch (err) {
    res.json(error({ message: "Server error", req, res }));
  }
}



export async function cashFlowCreate(req: Request, res: Response) {
  console.log("Request:", req.headers);

  try {
    const createResult = await cashFlowServices.insertCashflowData(req.body);
    console.log("createResult:", createResult);
    if (createResult) {
      res.json(success({ data: createResult, message: "建立成功", req, res }));
    } else {
      res.json(error({ message: "資料錯誤", req, res }));
    }
  } catch (err) {
    res.json(error({ message: "Server error", req, res }));
  }
}



export async function cashFlowUpdate(req: Request, res: Response) {
  // console.log("Request:", req.body);

  try {
    const updateResult = await cashFlowServices.createUser(req.body);
    if (updateResult) {
      res.json(success({ message: "修改成功", req, res }));
    } else {
      res.json(error({ message: "修改失敗", req, res }));
    }
  } catch (err) {
    res.status(500).json(error({ message: "Server error", req, res }));
  }
}



export async function cashFlowDelete(req: Request, res: Response) {
  // console.log("Request:", req.params.cashflowId);

  try {
    const removeResult =
      await pool.query(`DELETE FROM public.cashflow_list	WHERE cashflow_id = '${req.params.cashflowId}'`);
    // console.log("searchingResult:", searchingResult.rows);
    if (removeResult.rowCount === 1) {
      res.json(success({ message: "刪除成功", req, res }));
    } else {
      res.json(error({ message: "刪除失敗", req, res }));
    }
  } catch (err) {
    res.json(error({ message: "Server error", req, res }));
  }
}
