import { Request, Response } from "express";
import { success, error } from "@/utils/response";
import * as currencyAccountServices from "@/services/currencyAccount/currencyAccountListServices";

// Helper function for consistent response handling
const handleServiceResponse = (
  res: Response,
  result: any,
  req: Request,
  successMessage: string = "操作成功",
  errorMessage: string = "操作失敗",
) => {
  if (result?.success) {
    return res.json(
      success({
        data: result.data || result,
        message: successMessage,
        req,
        res,
      }),
    );
  }
  return res.json(
    error({
      message: result?.message || errorMessage,
      req,
      res,
    }),
  );
};

// Helper function for status change operations
const handleStatusChange = async (req: Request, res: Response, serviceFunction: Function, successMessage: string) => {
  try {
    req.body.accountId = req.params.accountId;
    const result = await serviceFunction(req.body);

    const response = result ? success({ message: successMessage, req, res }) : error({ req, res });

    res.json(response);
  } catch (err) {
    res.json(error({ req, res }));
  }
};

export async function currencyAccountList(req: Request, res: Response) {
  try {
    const result = await currencyAccountServices.searchingCurrencyAccountList(req.body);
    handleServiceResponse(res, result, req, "查詢成功", "發生錯誤");
  } catch (err) {
    res.json(error({ message: "發生錯誤", req, res }));
  }
}

export async function searchingCurrencyAccountById(req: Request, res: Response) {
  try {
    const result = await currencyAccountServices.getCurrencyAccountById(req.params.accountId, req.body.userId);

    if (result.success) {
      res.json(success({ data: result.data, req, res }));
    } else {
      res.json(error({ message: "存款帳戶不存在", req, res }));
    }
  } catch (err) {
    res.json(error({ req, res }));
  }
}

export async function currencyAccountCreate(req: Request, res: Response) {
  try {
    const result = await currencyAccountServices.insertCurrencyAccountData(req.body);
    handleServiceResponse(res, result, req, "建立成功", "資料錯誤");
  } catch (err) {
    res.json(error({ req, res }));
  }
}

export async function currencyAccountUpdate(req: Request, res: Response) {
  try {
    const result = await currencyAccountServices.updateCurrencyAccountData(req.body);
    const response = result ? success({ message: "修改成功", req, res }) : error({ message: "修改失敗", req, res });

    res.status(result ? 200 : 500).json(response);
  } catch (err) {
    res.status(500).json(error({ req, res }));
  }
}

export async function enableCurrencyAccount(req: Request, res: Response) {
  await handleStatusChange(req, res, currencyAccountServices.enableCurrencyAccountStatus, "啟用成功");
}

export async function disableCurrencyAccount(req: Request, res: Response) {
  await handleStatusChange(req, res, currencyAccountServices.disableCurrencyAccountStatus, "已停用");
}

export async function currencyAccountDelete(req: Request, res: Response) {
  try {
    req.body.accountId = req.params.accountId;
    const result = await currencyAccountServices.removeCurrencyAccountData(req.body);
    handleServiceResponse(res, result, req, result?.message || "刪除成功", result?.message || "刪除失敗");
  } catch (err) {
    res.json(error({ req, res }));
  }
}
