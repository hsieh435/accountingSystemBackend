import { Request, Response } from "express";
import * as creditCardRecordServices from "@/services/creditCard/creditCardRecordServices";
import { handleControllersResponse } from "@/controllers/controllersTools";

export async function creditCardRecordList(req: Request, res: Response) {
  // console.log("Request body:", req.body);

  try {
    const result = await creditCardRecordServices.searchingCreditCardRecordList(req.body);
    // console.log("searchingResult:", searchingResult);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function searchingCreditCardRecordById(req: Request, res: Response) {
  // console.log("req:", req.body);

  try {
    const result = await creditCardRecordServices.getCreditCardRecordById(
      req.body.tradeId,
      req.body.creditCardId,
      req.body.userId,
    );
    // console.log("searchingResult:", searchingResult.rows);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function creditCardRecordCreate(req: Request, res: Response) {
  try {
    const result = await creditCardRecordServices.insertCreditCardRecordData(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function creditCardRecordUpdate(req: Request, res: Response) {
  try {
    const result = await creditCardRecordServices.updateCreditCardData(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function creditCardRecordDelete(req: Request, res: Response) {
  try {
    const result = await creditCardRecordServices.removeCreditCardRecordData(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}
