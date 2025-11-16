import { Request, Response } from "express";
import * as currencyAccountRecordServices from "@/services/currencyAccount/currencyAccountRecordServices";
import { handleControllersResponse } from "@/controllers/controllersTools";


export async function currencyAccountRecordList(req: Request, res: Response) {
  try {
    const result = await currencyAccountRecordServices.searchingCurrencyAccountRecordList(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function searchingCurrencyAccountRecordById(req: Request, res: Response) {
  try {
    const result = await currencyAccountRecordServices.getCurrencyAccountRecordById(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function currencyAccountRecordCreate(req: Request, res: Response) {
  try {
    const result = await currencyAccountRecordServices.insertCurrencyAccountRecord(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function currencyAccountRecordUpdate(req: Request, res: Response) {
  try {
    const result = await currencyAccountRecordServices.updateCurrencyAccountRecord(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function currencyAccountRecordDelete(req: Request, res: Response) {
  try {
    const result = await currencyAccountRecordServices.removeCurrencyAccountRecord(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}
