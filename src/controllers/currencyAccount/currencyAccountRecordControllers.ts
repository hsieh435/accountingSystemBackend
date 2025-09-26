import { Request, Response } from "express";
import { success, error } from "@/utils/response";
import * as currencyAccountRecordServices from "@/services/currencyAccount/currencyAccountRecordServices";

// Helper function for consistent response handling
const handleServiceResponse = (
  res: Response,
  result: any,
  req: Request,
  successMessage: string = "操作成功",
  errorMessage: string = "操作失敗"
) => {
  if (result?.success) {
    return res.json(success({
      data: result.data || result,
      message: successMessage,
      req,
      res
    }));
  }
  return res.json(error({
    message: result?.message || errorMessage,
    req,
    res
  }));
};

export async function currencyAccountRecordList(req: Request, res: Response) {
  try {
    const result = await currencyAccountRecordServices.searchingCurrencyAccountRecordList(req.body);
    handleServiceResponse(res, result, req, "查詢成功", "發生錯誤");
  } catch (err) {
    res.json(error({ message: "發生錯誤", req, res }));
  }
}

export async function searchingCurrencyAccountRecordById(req: Request, res: Response) {
  try {
    const result = await currencyAccountRecordServices.getCurrencyAccountRecordById(req.body);

    if (result.success) {
      res.json(success({ data: result.data, req, res }));
    } else {
      res.json(error({ message: "記錄不存在", req, res }));
    }
  } catch (err) {
    res.json(error({ req, res }));
  }
}

export async function currencyAccountRecordCreate(req: Request, res: Response) {
  try {
    const result = await currencyAccountRecordServices.insertCurrencyAccountRecord(req.body);
    handleServiceResponse(res, result, req, "建立成功", "資料錯誤");
  } catch (err) {
    res.json(error({ req, res }));
  }
}

export async function currencyAccountRecordUpdate(req: Request, res: Response) {
  try {
    const result = await currencyAccountRecordServices.updateCurrencyAccountRecord(req.body);
    const response = result
      ? success({ message: "修改成功", req, res })
      : error({ message: "修改失敗", req, res });

    res.status(result ? 200 : 500).json(response);
  } catch (err) {
    res.status(500).json(error({ req, res }));
  }
}

export async function currencyAccountRecordDelete(req: Request, res: Response) {
  try {
    const result = await currencyAccountRecordServices.removeCurrencyAccountRecord(req.body);
    handleServiceResponse(res, result, req, result?.message || "刪除成功", result?.message || "刪除失敗");
  } catch (err) {
    res.json(error({ req, res }));
  }
}
