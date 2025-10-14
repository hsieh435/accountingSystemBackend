import { Request, Response } from "express";
import { success, error } from "@/utils/response";
import * as storedValueCardListServices from "@/services/storedValueCard/storedValueCardListServices";



export async function storedValueCardDataList(req: Request, res: Response) {
  try {
    const result = await storedValueCardListServices.searchingStoredValueCardList(req.body);
    res.json(result.success
      ? success({ data: result.data, message: "查詢成功", req, res })
      : error({ message: "發生錯誤", req, res })
    );
  } catch {
    res.json(error({ message: "發生錯誤", req, res }));
  }
}

export async function searchingStoredValueCardById(req: Request, res: Response) {

  try {
    const result = await storedValueCardListServices.getStoredValueCardData(req.params.storedValueCardId, req.body.userId);

    res.json(result.success
      ? success({ data: result.data, req, res })
      : error({ message: "現金流不存在", req, res })
    );
  } catch {
    res.json(error({ req, res }));
  }
}

export async function storedValueCardCreate(req: Request, res: Response) {
  try {
    const result = await storedValueCardListServices.insertStoredValueCardData(req.body);
    res.json(result.success
      ? success({ data: result, message: "建立成功", req, res })
      : error({ message: "資料錯誤", req, res })
    );
  } catch {
    res.json(error({ req, res }));
  }
}

export async function storedValueCardUpdate(req: Request, res: Response) {
  try {
    const updated = await storedValueCardListServices.updateStoredValueCardData(req.body);
    res.json(updated
      ? success({ message: "修改成功", req, res })
      : error({ message: "修改失敗", req, res })
    );
  } catch {
    res.status(500).json(error({ req, res }));
  }
}

async function toggleStoredValueCardStatus(req: Request, res: Response, enable: boolean) {
  req.body.storedValueCardId = req.params.storedValueCardId;
  try {
    const fn = enable
      ? storedValueCardListServices.enableStoredValueCardStatus
      : storedValueCardListServices.disableStoredValueCardStatus;
    const result = await fn(req.body);
    res.json(result
      ? success({ message: enable ? "啟用成功" : "已停用", req, res })
      : error({ req, res })
    );
  } catch {
    res.json(error({ req, res }));
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
    res.json(result.success
      ? success({ message: result.message, req, res })
      : error({ message: result.message, req, res })
    );
  } catch {
    res.json(error({ req, res }));
  }
}
