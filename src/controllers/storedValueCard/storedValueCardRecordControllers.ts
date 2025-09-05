import { Request, Response } from "express";
import { success, error } from "@/utils/response";
import * as storedValueCardRecordServices from "@/services/storedValueCard/storedValueCardRecordServices";
import { keysToCamel } from "@/utils/tools";



export async function storedValueCardRecordList(req: Request, res: Response) {
  try {
    const searchingResult = await storedValueCardRecordServices.searchingStoredValueCardRecordList(req.body);
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



export async function searchingStoredValueCardRecordById(req: Request, res: Response) {
  try {
    const searchingResult = await storedValueCardRecordServices.searchingStoredValueCardRecordById(req.body);
    // console.log("searchingResult:", searchingResult.rows);
    if (searchingResult.success === true) {
      res.json(success({ data: keysToCamel(searchingResult.data), req, res }));
    } else {
      res.json(error({ data: [], message: "支出紀錄不存在", req, res }));
    }
  } catch (err) {
    res.json(error({ data: [], message: "支出紀錄不存在", req, res }));
  }
}



export async function storedValueCardRecordCreate(req: Request, res: Response) {
  // console.log("Request:", req.body);
  try {
    const createResult = await storedValueCardRecordServices.insertStoredValueCardRecord(req.body);
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

export async function storedValueCardRecordUpdate(req: Request, res: Response) {
  console.log("Request:", req.body);
  try {
    const updateResult = await storedValueCardRecordServices.updateStoredValueCardRecordData(req.body);
    if (updateResult) {
      res.json(success({ message: "修改成功", req, res }));
    } else {
      res.json(error({ message: "修改失敗", req, res }));
    }
  } catch (err) {
    res.status(500).json(error({ req, res }));
  }
}



// export async function deleteStoredValueCardRecord(req: Request, res: Response) {
//   req.body.storedValueCardId = req.params.storedValueCardId;

//   try {
//     const removeResult = await storedValueCardRecordServices.deleteStoredValueCardRecordData(req.body);
//     if (removeResult.success === true) {
//       res.json(success({ message: removeResult.message, req, res }));
//     } else {
//       res.json(error({ message: removeResult.message, req, res }));
//     }
//   } catch (err) {
//     res.json(error({ req, res }));
//   }
// }
