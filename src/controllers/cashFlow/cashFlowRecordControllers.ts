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
  // console.log("body:", req.body);
  try {
    const result = await cashFlowRecordServices.insertCashFlowRecordData(req.body);
    // console.log("result:", result);
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

export async function cashFlowDelete(req: Request, res: Response) {
  req.body.cashflowId = req.params.cashflowId;

  // try {
  //   const result = await cashFlowRecordServices.removeCashflowData(req.body);
  //   await handleControllersResponse(res, req, result);
  // } catch (err) {
  //   await handleControllersResponse(res, req, err);
  // }
}
