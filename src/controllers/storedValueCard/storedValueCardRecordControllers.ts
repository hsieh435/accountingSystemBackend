import { Request, Response } from "express";
import { success, error } from "@/utils/response";
import * as storedValueCardRecordServices from "@/services/storedValueCard/storedValueCardRecordServices";
import { keysToCamel } from "@/utils/tools";

export async function storedValueCardRecordList(req: Request, res: Response) {
  try {
    const result = await storedValueCardRecordServices.searchingStoredValueCardRecordList(req.body);
    res.json(
      result.success
        ? success({ data: result.data, message: "查詢成功", req, res })
        : error({ message: "發生錯誤", req, res }),
    );
  } catch {
    res.json(error({ message: "發生錯誤", req, res }));
  }
}

export async function searchingStoredValueCardRecordById(req: Request, res: Response) {
  try {
    const result = await storedValueCardRecordServices.searchingStoredValueCardRecordById(req.body);
    res.json(
      result.success
        ? success({ data: keysToCamel(result.data), req, res })
        : error({ data: [], message: "支出紀錄不存在", req, res }),
    );
  } catch {
    res.json(error({ data: [], message: "支出紀錄不存在", req, res }));
  }
}

export async function storedValueCardRecordCreate(req: Request, res: Response) {
  try {
    const result = await storedValueCardRecordServices.insertStoredValueCardRecord(req.body);
    res.json(
      result.success
        ? success({ data: result, message: "建立成功", req, res })
        : error({ message: "資料錯誤", req, res }),
    );
  } catch {
    res.json(error({ req, res }));
  }
}

export async function storedValueCardRecordUpdate(req: Request, res: Response) {
  try {
    const updated = await storedValueCardRecordServices.updateStoredValueCardRecordData(req.body);
    res.json(updated ? success({ message: "修改成功", req, res }) : error({ message: "修改失敗", req, res }));
  } catch {
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
