import { Request, Response } from "express";
import { success, error } from "@/utils/response";
import * as cashFlowServices from "@/services/cashFlow/cashFlowListServices";

export async function cashFlowList(req: Request, res: Response) {
  try {
    const result = await cashFlowServices.searchingCashFlowList(req.body);
    res.json(
      result.success
        ? success({ data: result.data, message: "查詢成功", req, res })
        : error({ message: "發生錯誤", req, res }),
    );
  } catch (err) {
    res.json(error({ message: "發生錯誤", req, res }));
  }
}

export async function searchingCashFlowById(req: Request, res: Response) {
  try {
    const result = await cashFlowServices.getCashFlowById(req.params.cashflowId, req.body.userId);
    res.json(
      result.success
        ? success({ data: result.data, req, res })
        : error({ message: "現金流不存在", req, res }),
    );
  } catch (err) {
    res.json(error({ req, res }));
  }
}

export async function cashFlowCreate(req: Request, res: Response) {
  try {
    const result = await cashFlowServices.insertCashflowData(req.body);
    // console.log("result:", result);
    res.json(
      result.success
        ? success({ data: result.data, message: "建立成功", req, res })
        : error({ message: "資料錯誤", req, res }),
    );
  } catch (err) {
    res.json(error({ req, res }));
  }
}

export async function cashFlowUpdate(req: Request, res: Response) {
  try {
    const result = await cashFlowServices.updateCashflowData(req.body);
    res.json(result ? success({ message: "修改成功", req, res }) : error({ message: "修改失敗", req, res }));
  } catch (err) {
    res.status(500).json(error({ req, res }));
  }
}

export async function enableCashFlow(req: Request, res: Response) {
  await toggleCashFlowStatus(req, res, "enable", "啟用成功");
}

export async function disableCashFlow(req: Request, res: Response) {
  await toggleCashFlowStatus(req, res, "disable", "停用成功");
}

export async function cashFlowDelete(req: Request, res: Response) {
  try {
    const result = await cashFlowServices.removeCashflowData({
      ...req.body,
      cashflowId: req.params.cashflowId,
    });
    res.json(
      result.success ? success({ message: result.message, req, res }) : error({ message: result.message, req, res }),
    );
  } catch (err) {
    res.json(error({ req, res }));
  }
}

// Helper function for enable/disable operations
async function toggleCashFlowStatus(req: Request, res: Response, action: "enable" | "disable", successMessage: string) {
  try {
    const serviceMethod =
      action === "enable" ? cashFlowServices.enableCashFlowStatus : cashFlowServices.disableCashFlowStatus;

    const result = await serviceMethod({
      ...req.body,
      cashflowId: req.params.cashflowId,
    });

    res.json(result ? success({ message: successMessage, req, res }) : error({ req, res }));
  } catch (err) {
    res.json(error({ req, res }));
  }
}
