import { Request, Response } from "express";
import * as creditCardParamsServices from "@/services/creditCard/creditCardParamsServices";
import { handleControllersResponse } from "@/controllers/controllersTools";



export async function creditCardLimitation(req: Request, res: Response) {
  try {
    const result = await creditCardParamsServices.getCreditCardLimitation(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function creditCardLimitationUpdate(req: Request, res: Response) {
  try {
    const result = await creditCardParamsServices.updateCreditCardLimitation(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function creditCardExpenditure(req: Request, res: Response) {
  try {
    const result = await creditCardParamsServices.calculateCreditCardExpenditure(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}
