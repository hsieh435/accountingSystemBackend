import { Request, Response } from "express";
import * as storedValueCardRecordServices from "@/services/storedValueCard/storedValueCardRecordServices";
import { handleControllersResponse } from "@/controllers/controllersTools";

export async function storedValueCardRecordList(req: Request, res: Response) {
  try {
    const result = await storedValueCardRecordServices.searchingStoredValueCardRecordList(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function searchingStoredValueCardRecordById(req: Request, res: Response) {
  try {
    const result = await storedValueCardRecordServices.searchingStoredValueCardRecordById(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function storedValueCardRecordCreate(req: Request, res: Response) {
  try {
    const result = await storedValueCardRecordServices.insertStoredValueCardRecord(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function storedValueCardRecordUpdate(req: Request, res: Response) {
  try {
    const result = await storedValueCardRecordServices.updateStoredValueCardRecordData(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function deleteStoredValueCardRecord(req: Request, res: Response) {
  try {
    const result = await storedValueCardRecordServices.removeStoredValueCardRecordById(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}
