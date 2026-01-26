import { Request, Response } from "express";
import * as cashFlowServices from "@/services/cashFlow/cashFlowListServices";
import { handleControllersResponse } from "@/controllers/controllersTools";

export async function cashFlowList(req: Request, res: Response) {
  try {
    const result = await cashFlowServices.searchingCashFlowList(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function searchingCashFlowById(req: Request, res: Response) {
  try {
    const result = await cashFlowServices.getCashFlowById(req.params.cashflowId, req.body.userId);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function cashFlowCreate(req: Request, res: Response) {
  try {
    const result = await cashFlowServices.insertCashflowData(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function cashFlowUpdate(req: Request, res: Response) {
  try {
    const result = await cashFlowServices.updateCashflowData(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function enableCashFlow(req: Request, res: Response) {
  await toggleCashFlowStatus(req, res, "enable");
}

export async function disableCashFlow(req: Request, res: Response) {
  await toggleCashFlowStatus(req, res, "disable");
}

export async function cashFlowDelete(req: Request, res: Response) {
  try {
    const result = await cashFlowServices.removeCashflowData({
      ...req.body,
      cashflowId: req.params.cashflowId,
    });

    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

// Helper function for enable/disable operations
async function toggleCashFlowStatus(req: Request, res: Response, action: "enable" | "disable") {
  try {
    const serviceMethod =
      action === "enable" ? cashFlowServices.enableCashFlowStatus : cashFlowServices.disableCashFlowStatus;

    const result = await serviceMethod({
      ...req.body,
      cashflowId: req.params.cashflowId,
    });

    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}
