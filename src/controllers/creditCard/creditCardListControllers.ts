import { Request, Response } from "express";
import * as creditCardServices from "@/services/creditCard/creditCardListServices";
import { handleControllersResponse } from "@/controllers/controllersTools";


// Helper function for status change operations
const handleStatusChange = async (req: Request, res: Response, serviceFunction: Function, successMessage: string) => {
  req.body.creditcardId = req.params.creditCardId;
  try {
    const result = await serviceFunction(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
};

export async function creditCardDataList(req: Request, res: Response) {
  try {
    const result = await creditCardServices.searchingCreditCardList(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function searchingCreditCardById(req: Request, res: Response) {
  try {
    const result = await creditCardServices.getCreditCardById(req.params.creditCardId, req.body.userId);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function creditCardCreate(req: Request, res: Response) {
  try {
    const result = await creditCardServices.insertCreditCardData(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function enableCreditCard(req: Request, res: Response) {
  await handleStatusChange(req, res, creditCardServices.enableCreditCardStatus, "啟用成功");
}

export async function disableCreditCard(req: Request, res: Response) {
  await handleStatusChange(req, res, creditCardServices.disableCreditCardStatus, "已停用");
}

export async function creditCardUpdate(req: Request, res: Response) {
  try {
    const result = await creditCardServices.updateCreditCardData(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function creditCardDelete(req: Request, res: Response) {
  // req.body.creditcardId = req.params.creditCardId;
  try {
    const result = await creditCardServices.removeCreditCardData(req.body);
    // console.log("result:", result);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    console.log("err:", err);
    await handleControllersResponse(res, req, err);
  }
}
