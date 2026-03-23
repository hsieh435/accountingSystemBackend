import { Request, Response } from "express";
import * as stockAccountServices from "@/services/stockAccount/stockAccountListServices";
import { handleControllersResponse } from "@/controllers/controllersTools";


export async function stockAccountList(req: Request, res: Response) {
  try {
    const result = await stockAccountServices.searchingStockAccountList(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function searchingStockAccountById(req: Request, res: Response) {
  try {
    const result = await stockAccountServices.getStockAccountById({
      accountId: req.params.stockAccountId,
      userId: req.body.userId,
    });
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function stockAccountCreate(req: Request, res: Response) {
  try {
    const result = await stockAccountServices.insertStockAccountData(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function stockAccountUpdate(req: Request, res: Response) {
  try {
    const result = await stockAccountServices.updateStockAccountData(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

async function toggleStockAccountStatus(req: Request, res: Response, enable: boolean) {
  req.body.accountId = req.params.stockAccountId;
  try {
    const fn = enable ? stockAccountServices.enableStockAccountStatus : stockAccountServices.disableStockAccountStatus;
    const result = await fn(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function enableStockAccount(req: Request, res: Response) {
  await toggleStockAccountStatus(req, res, true);
}

export async function disableStockAccount(req: Request, res: Response) {
  await toggleStockAccountStatus(req, res, false);
}

export async function stockAccountDelete(req: Request, res: Response) {
  try {
    const result = await stockAccountServices.removeStockAccountData(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}
