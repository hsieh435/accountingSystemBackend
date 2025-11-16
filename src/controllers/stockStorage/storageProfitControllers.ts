import { Request, Response } from "express";
import * as storageProfitServices from "@/services/stockStorage/storageProfitServices";
import { handleControllersResponse } from "@/controllers/controllersTools";

export async function storageProfitDataList(req: Request, res: Response) {
  try {
    const result = await storageProfitServices.getStockStorageList(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function storageProfitList(req: Request, res: Response) {
  // console.log("params:", req.params.stockAccountId, req.body.userId);
  try {
    const result = await storageProfitServices.searchingStorageProfitList(req.params.stockAccountId, req.body.userId);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function eachStorageProfitData(req: Request, res: Response) {
  try {
    const result = await storageProfitServices.searchingStockSProfitDetail(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}
