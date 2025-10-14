import { Request, Response } from "express";
import { success, error } from "@/utils/response";
import * as stockAccountRecordServices from "@/services/stockAccount/stockAccountRecordServices";
import { keysToCamel } from "@/utils/tools";



export async function stockAccountRecordList(req: Request, res: Response) {
  try {
    const result = await stockAccountRecordServices.searchingStockAccountRecordList(req.body);
    res.json(result.success
      ? success({ data: result.data, message: "查詢成功", req, res })
      : error({ message: "發生錯誤", req, res })
    );
  } catch {
    res.json(error({ message: "發生錯誤", req, res }));
  }
}



export async function searchingStockAccountRecordById(req: Request, res: Response) {
  try {
    const searchingResult = await stockAccountRecordServices.getStockAccountRecordById(
      req.params.tradeId,
      req.params.accountId,
      req.body.userId,
    );

    res.json(searchingResult.success
      ? success({ data: keysToCamel(searchingResult.data), req, res })
      : error({ message: "存款帳戶不存在", req, res })
    );
  } catch {
    res.json(error({ req, res }));
  }
}



export async function stockAccountRecordCreate(req: Request, res: Response) {
  try {
    const result = await stockAccountRecordServices.insertStockAccountRecord(req.body);
    res.json(result.success
      ? success({ data: result, message: "建立成功", req, res })
      : error({ message: "資料錯誤", req, res })
    );
  } catch {
    res.json(error({ req, res }));
  }
}



export async function stockAccountRecordUpdate(req: Request, res: Response) {
  try {
    const updated = await stockAccountRecordServices.updateStockAccountRecord(req.body);
    res.json(updated
      ? success({ message: "修改成功", req, res })
      : error({ message: "修改失敗", req, res })
    );
  } catch {
    res.status(500).json(error({ req, res }));
  }
}



export async function stockAccountRecordDelete(req: Request, res: Response) {
  req.body.stockAccountId = req.params.stockAccountId;
  try {
    const result = await stockAccountRecordServices.removeStockAccountRecord(req.body);
    res.json(result.success
      ? success({ message: result.message, req, res })
      : error({ message: result.message, req, res })
    );
  } catch {
    res.json(error({ req, res }));
  }
};
