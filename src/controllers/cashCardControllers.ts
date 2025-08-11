import pool from "@/db";
import { Request, Response } from "express";
import { success, error } from "@/utils/response";
import * as cashCardServices from "@/services/cashCardServices";
import { keysToCamel } from "@/utils/tools";



// const jwt = require("jsonwebtoken");
// require("dotenv").config();
// const JWT_SECRET = process.env.JWT_SECRET;



export async function cashCardDataList(req: Request, res: Response) {
  // console.log("Request body:", req.body);

  try {
    const searchingResult = await cashCardServices.searchingCashCardList(req.body);
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



export async function searchingCashCardById(req: Request, res: Response) {

  try {
    const searchingResult =
      await pool.query(`SELECT * FROM cashcard_list where cashcard_id = '${req.params.cashCardId}' and user_id='${req.body.userId}'`);
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



export async function cashCardCreate(req: Request, res: Response) {

  try {
    const createResult = await cashCardServices.insertCashCardData(req.body);
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



export async function cashCardUpdate(req: Request, res: Response) {

  try {
    const updateResult = await cashCardServices.uodateCashCardData(req.body);
    if (updateResult) {
      res.json(success({ message: "修改成功", req, res }));
    } else {
      res.json(error({ message: "修改失敗", req, res }));
    }
  } catch (err) {
    res.status(500).json(error({ req, res }));
  }
}



export async function cashCardDelete(req: Request, res: Response) {
  req.body.cashcardId = req.params.cashCardId;

  try {
    const removeResult = await cashCardServices.removeCashCardData(req.body);
    if (removeResult.success === true) {
      res.json(success({ message: removeResult.message, req, res }));
    } else {
      res.json(error({ message: removeResult.message, req, res }));
    }
  } catch (err) {
    res.json(error({ req, res }));
  }
};
