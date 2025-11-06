import { Request, Response } from "express";
import { success, error } from "@/utils/response";
import * as storageProfitServices from "@/services/stockStorage/storageProfitServices";



export async function storageProfitDataList(req: Request, res: Response) {
  try {
    const result = await storageProfitServices.getStockStorageList(req.body);
    res.json(result.success
      ? success({ data: result.data, message: "查詢成功", req, res })
      : error({ message: "發生錯誤", req, res })
    );
  } catch {
    res.json(error({ message: "發生錯誤", req, res }));
  }
}



export async function storageProfitList(req: Request, res: Response) {
  // console.log("params:", req.params.stockAccountId, req.body.userId);
  try {
    const result = await storageProfitServices.searchingStorageProfitList(req.params.stockAccountId, req.body.userId);
    res.json(result.success
      ? success({ data: result.data, message: "查詢成功", req, res })
      : error({ message: "發生錯誤", req, res })
    );

  } catch {
    res.json(error({ message: "發生錯誤", req, res }));
  }
}



export async function eachStorageProfitData(req: Request, res: Response) {

  try {
    const result = await storageProfitServices.searchingStockSProfitDetail(req.body);
    res.json(result.success
      ? success({ data: result.data, message: "查詢成功", req, res })
      : error({ message: "發生錯誤", req, res })
    );

  } catch {
    res.json(error({ message: "發生錯誤", req, res }));
  }
}
