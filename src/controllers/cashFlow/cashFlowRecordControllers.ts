import { Request, Response } from "express";
import * as cashFlowRecordServices from "@/services/cashFlow/cashFlowRecordServices";
import { handleControllersResponse } from "@/controllers/controllersTools";

export async function cashFlowRecordList(req: Request, res: Response) {
  try {
    const result = await cashFlowRecordServices.searchingCashFlowRecordList(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function searchingCashFlowRecordById(req: Request, res: Response) {
  try {
    const result = await cashFlowRecordServices.searchingCashFlowRecordById(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function cashFlowRecordCreate(req: Request, res: Response) {
  try {
    const result = await cashFlowRecordServices.insertCashFlowRecordData(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function cashFlowRecordUpdate(req: Request, res: Response) {
  try {
    const result = await cashFlowRecordServices.updateCashFlowRecordData(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function cashFlowRecordDelete(req: Request, res: Response) {
  try {
    const result = await cashFlowRecordServices.deleteCashFlowRecordData(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}
