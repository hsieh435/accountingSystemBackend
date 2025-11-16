import { Request, Response } from "express";
import * as storedValueCardListServices from "@/services/storedValueCard/storedValueCardListServices";
import { handleControllersResponse } from "@/controllers/controllersTools";

export async function storedValueCardDataList(req: Request, res: Response) {
  try {
    const result = await storedValueCardListServices.searchingStoredValueCardList(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function searchingStoredValueCardById(req: Request, res: Response) {
  try {
    const result = await storedValueCardListServices.getStoredValueCardData(
      req.params.storedValueCardId,
      req.body.userId,
    );

    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function storedValueCardCreate(req: Request, res: Response) {
  try {
    const result = await storedValueCardListServices.insertStoredValueCardData(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function storedValueCardUpdate(req: Request, res: Response) {
  try {
    const result = await storedValueCardListServices.updateStoredValueCardData(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

async function toggleStoredValueCardStatus(req: Request, res: Response, enable: boolean) {
  req.body.storedValueCardId = req.params.storedValueCardId;
  try {
    const fn = enable
      ? storedValueCardListServices.enableStoredValueCardStatus
      : storedValueCardListServices.disableStoredValueCardStatus;
    const result = await fn(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function enableStoredValueCard(req: Request, res: Response) {
  await toggleStoredValueCardStatus(req, res, true);
}

export async function disableStoredValueCard(req: Request, res: Response) {
  await toggleStoredValueCardStatus(req, res, false);
}

export async function storedValueCardDelete(req: Request, res: Response) {
  req.body.storedValueCardId = req.params.storedValueCardId;
  try {
    const result = await storedValueCardListServices.removeStoredValueCardData(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}
