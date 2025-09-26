import pool from "@/db";
import { Request, Response } from "express";
import { success, error } from "@/utils/response";
import * as stockAccountServices from "@/services/stockAccount/stockAccountListServices";
import { keysToCamel } from "@/utils/tools";



export async function stockAccountList(req: Request, res: Response) {
  try {
    const result = await stockAccountServices.searchingStockAccountList(req.body);
    res.json(result.success
      ? success({ data: result.data, message: "查詢成功", req, res })
      : error({ message: "發生錯誤", req, res })
    );
  } catch {
    res.json(error({ message: "發生錯誤", req, res }));
  }
}

export async function searchingStockAccountById(req: Request, res: Response) {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM public.stock_account_list WHERE account_id = '${req.params.stockAccountId}' AND user_id='${req.body.userId}'`
    );
    res.json(rows.length === 1
      ? success({ data: keysToCamel(rows[0]), req, res })
      : error({ message: "證券帳戶不存在", req, res })
    );
  } catch {
    res.json(error({ req, res }));
  }
}

export async function stockAccountCreate(req: Request, res: Response) {
  try {
    const result = await stockAccountServices.insertStockAccountData(req.body);
    res.json(result.success
      ? success({ data: result, message: "建立成功", req, res })
      : error({ message: "資料錯誤", req, res })
    );
  } catch {
    res.json(error({ req, res }));
  }
}

export async function stockAccountUpdate(req: Request, res: Response) {
  try {
    const updated = await stockAccountServices.updateStockAccountData(req.body);
    res.json(updated
      ? success({ message: "修改成功", req, res })
      : error({ message: "修改失敗", req, res })
    );
  } catch {
    res.status(500).json(error({ req, res }));
  }
}

async function toggleStockAccountStatus(req: Request, res: Response, enable: boolean) {
  req.body.accountId = req.params.stockAccountId;
  try {
    const fn = enable
      ? stockAccountServices.enableStockAccountStatus
      : stockAccountServices.disableStockAccountStatus;
    const result = await fn(req.body);
    res.json(result
      ? success({ message: enable ? "啟用成功" : "已停用", req, res })
      : error({ req, res })
    );
  } catch {
    res.json(error({ req, res }));
  }
}

export async function enableStockAccount(req: Request, res: Response) {
  await toggleStockAccountStatus(req, res, true);
}

export async function disableStockAccount(req: Request, res: Response) {
  await toggleStockAccountStatus(req, res, false);
}

export async function stockAccountDelete(req: Request, res: Response) {
  req.body.accountId = req.params.stockAccountId;
  try {
    const result = await stockAccountServices.removeStockAccountData(req.body);
    res.json(result.success
      ? success({ message: result.message, req, res })
      : error({ message: result.message, req, res })
    );
  } catch {
    res.json(error({ req, res }));
  }
};
