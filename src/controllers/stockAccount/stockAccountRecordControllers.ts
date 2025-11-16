import { Request, Response } from "express";
import * as stockAccountRecordServices from "@/services/stockAccount/stockAccountRecordServices";
import { handleControllersResponse } from "@/controllers/controllersTools";

export async function stockAccountRecordList(req: Request, res: Response) {
  try {
    const result = await stockAccountRecordServices.searchingStockAccountRecordList(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function searchingStockAccountRecordById(req: Request, res: Response) {
  try {
    const result = await stockAccountRecordServices.getStockAccountRecordById(
      req.body.tradeId,
      req.body.accountId,
      req.body.userId,
    );

    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function stockAccountRecordCreate(req: Request, res: Response) {
  try {
    const result = await stockAccountRecordServices.insertStockAccountRecord(req.body);

    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function stockAccountRecordUpdate(req: Request, res: Response) {
  try {
    const result = await stockAccountRecordServices.updateStockAccountRecord(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function stockAccountRecordDelete(req: Request, res: Response) {
  try {
    const result = await stockAccountRecordServices.removeStockAccountRecord(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}
