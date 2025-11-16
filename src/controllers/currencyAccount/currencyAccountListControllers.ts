import { Request, Response } from "express";
import * as currencyAccountServices from "@/services/currencyAccount/currencyAccountListServices";
import { handleControllersResponse } from "@/controllers/controllersTools";



// Helper function for status change operations
const handleStatusChange = async (req: Request, res: Response, serviceFunction: Function, successMessage: string) => {
  req.body.accountId = req.params.accountId;
  try {
    const result = await serviceFunction(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
};

export async function currencyAccountList(req: Request, res: Response) {
  try {
    const result = await currencyAccountServices.searchingCurrencyAccountList(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function searchingCurrencyAccountById(req: Request, res: Response) {
  try {
    const result = await currencyAccountServices.getCurrencyAccountById(req.params.accountId, req.body.userId);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function currencyAccountCreate(req: Request, res: Response) {
  try {
    const result = await currencyAccountServices.insertCurrencyAccountData(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function currencyAccountUpdate(req: Request, res: Response) {
  try {
    const result = await currencyAccountServices.updateCurrencyAccountData(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function enableCurrencyAccount(req: Request, res: Response) {
  await handleStatusChange(req, res, currencyAccountServices.enableCurrencyAccountStatus, "啟用成功");
}

export async function disableCurrencyAccount(req: Request, res: Response) {
  await handleStatusChange(req, res, currencyAccountServices.disableCurrencyAccountStatus, "已停用");
}

export async function currencyAccountDelete(req: Request, res: Response) {
  req.body.accountId = req.params.accountId;
  try {
    const result = await currencyAccountServices.removeCurrencyAccountData(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}
