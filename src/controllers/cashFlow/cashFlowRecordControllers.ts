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
    const searchingResult = await cashFlowRecordServices.searchingCashFlowRecordById(req.body);
    // console.log("searchingResult:", searchingResult.rows);
    if (searchingResult.success === true) {
      res.json(success({ data: keysToCamel(searchingResult.data[0]), req, res }));
    } else {
      res.json(error({ data: [], message: "支出紀錄不存在", req, res }));
    }
  } catch (err) {
    res.json(error({ data: [], message: "支出紀錄不存在", req, res }));
  }
}



export async function cashFlowRecordCreate(req: Request, res: Response) {
  // console.log("Request Body:", req.body);
  try {
    const createResult = await cashFlowRecordServices.insertCashFlowRecordData(req.body);
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

export async function cashFlowRecordUpdate(req: Request, res: Response) {
  try {
    const updateResult = await cashFlowRecordServices.updateCashFlowRecordData(req.body);
    if (updateResult) {
      res.json(success({ message: "修改成功", req, res }));
    } else {
      res.json(error({ message: "修改失敗", req, res }));
    }
  } catch (err) {
    res.status(500).json(error({ req, res }));
  }
}



// export async function cashFlowDelete(req: Request, res: Response) {
//   req.body.cashflowId = req.params.cashflowId;

//   try {
//     const removeResult = await cashFlowRecordServices.removeCashflowData(req.body);
//     if (removeResult.success === true) {
//       res.json(success({ message: removeResult.message, req, res }));
//     } else {
//       res.json(error({ message: removeResult.message, req, res }));
//     }
//   } catch (err) {
//     res.json(error({ req, res }));
//   }
// }
