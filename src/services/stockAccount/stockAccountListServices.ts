import pool from "@/db";
import { keysToCamel, getTimeStampWithZone, getCurrentTimestamp } from "@/utils/tools";
import * as accountBalanceServices from "@/services/accountBalance/cashflowBalanceServices";

export interface IStockAccountList {
  accountId: string;
  userId: string;
  accountType: string;
  accountName: string;
  accountBankCode: string;
  accountBankName: string;
  currency: string;
  currencyName?: string;
  startingAmount: number;
  presentAmount: number;
  minimumValueAllowed: number;
  alertValue: number;
  openAlert: boolean;
  enable: boolean;
  createdDate: string;
  note: string;
}

export async function searchingStockAccountList(data: { currencyId: string; userId: string }) {
  try {
    const result = await pool.query(
      `SELECT stock_account_list.*, currency_list.currency_name FROM stock_account_list
        LEFT JOIN currency_list ON stock_account_list.currency = currency_list.currency_code
        WHERE currency LIKE '%${data.currencyId}%' AND user_id = '${data.userId}' ORDER BY created_date`,
    );
    return { success: true, data: keysToCamel(result.rows) };
  } catch {
    return { success: false, data: [] };
  }
}

export async function getStockAccountById(data: { accountId: string; userId: string }) {
  try {
    const result = await pool.query(
      `SELECT * FROM public.stock_account_list WHERE account_id = '${data.accountId}' AND user_id='${data.userId}'`,
    );
    return result.rows.length === 1
      ? { success: true, data: keysToCamel(result.rows[0]) }
      : { success: false, data: [] };
  } catch {
    return { success: false, data: [] };
  }
}

export async function insertStockAccountData(data: IStockAccountList) {
  const currentTimestamp = getCurrentTimestamp();
  const timeStampWithZone = getTimeStampWithZone();
  const insertResult = await pool.query(
    `INSERT INTO public.stock_account_list(account_id, user_id, account_type, account_name, account_bank_code, account_bank_name, currency, starting_amount, present_amount, minimum_value_allowed, alert_value, open_alert, enable, created_date, note)
     VALUES ('${data.accountId}', '${data.userId}', '${data.accountType}', '${data.accountName}', '${data.accountBankCode}', '${data.accountBankName}', '${data.currency}', ${data.startingAmount}, ${data.startingAmount}, ${data.minimumValueAllowed}, ${data.alertValue}, ${data.openAlert}, ${data.enable}, '${timeStampWithZone}', '${data.note}')`,
  );
  if (insertResult.rowCount === 1) {
    await accountBalanceServices.insertBalance({
      tradeId: `ST-${data.currency}-${currentTimestamp}`,
      accountId: `ST-${data.accountId}`,
      userId: data.userId,
      transactionType: "income",
      tradeCode: "default",
      tradeAmount: data.startingAmount,
      accountBalance: data.startingAmount,
      eventDatetimes: timeStampWithZone,
    });
    return { success: true, userData: keysToCamel(insertResult.rows[0]) };
  }
  return { success: false, userData: [] };
}

export async function updateStockAccountData(data: IStockAccountList) {
  const result = await pool.query(
    `UPDATE public.stock_account_list SET account_name='${data.accountName}', account_bank_code='${data.accountBankCode}', account_bank_name='${data.accountBankName}', currency='${data.currency}', starting_amount=${data.startingAmount}, present_amount=${data.presentAmount}, minimum_value_allowed=${data.minimumValueAllowed}, alert_value=${data.alertValue}, open_alert=${data.openAlert}, enable=${data.enable}, created_date='${data.createdDate}', note='${data.note}'
    WHERE account_id = '${data.accountId}' AND user_id = '${data.userId}'`,
  );
  return result.rowCount === 1;
}

export async function enableStockAccountStatus(data: IStockAccountList) {
  const result = await pool.query(
    `UPDATE public.stock_account_list SET enable = ${true} WHERE account_id = '${data.accountId}' AND user_id = '${data.userId}'`,
  );
  return result.rowCount === 1;
}

export async function disableStockAccountStatus(data: IStockAccountList) {
  const result = await pool.query(
    `UPDATE public.stock_account_list SET enable = ${false} WHERE account_id = '${data.accountId}' AND user_id = '${data.userId}'`,
  );
  return result.rowCount === 1;
}

export async function removeStockAccountData(data: IStockAccountList) {
  const result = await pool.query(
    `SELECT * FROM stock_account_trade WHERE account_id = '${data.accountId}' AND user_id = '${data.userId}'`,
  );
  if (result.rows.length > 0) {
    return { success: false, message: "已有收支紀錄，無法刪除" };
  }
  const deleteResult = await pool.query(
    `DELETE FROM public.stock_account_list WHERE account_id = '${data.accountId}' AND user_id = '${data.userId}'`,
  );
  return deleteResult.rowCount === 1 ? { success: true, message: "刪除成功" } : { success: false, message: "刪除失敗" };
}
