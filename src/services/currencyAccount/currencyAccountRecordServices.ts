import pool from "@/db";
import { executeSQLsyntax } from "@/services/servicesTools";
import * as currencyAccountListServices from "@/services/currencyAccount/currencyAccountListServices";
import { getCurrentTimestamp } from "@/utils/tools";
import { tradeDateTimeDetect } from "@/services/recordServiceTools";

export interface IFinanceRecordSearchingParams {
  accountId: string;
  currencyId: string;
  tradeCategory: string;
  startingDate: string;
  endDate: string;
  userId: string;
}

export interface ICreditCardRecordList {
  tradeId: string;
  accountId: string;
  userId: string;
  tradeDatetime: string;
  accountUser: string;
  accountType: string;
  transactionType: string;
  tradeCategory: string;
  tradeAmount: number;
  remainingAmount: number;
  currency: string;
  tradeDescription: string;
  tradeNote: string;
}

export interface IOriData {
  oriTradeDatetime: string;
  oriTradeAmount: number;
  oriRemainingAmount: number;
  oriTransactionType: string;
}

export interface ICreditCardRecordData {
  updateData: ICreditCardRecordList;
  oriData: IOriData;
  userId: string;
}

export async function searchingCurrencyAccountRecordList(data: IFinanceRecordSearchingParams) {
  const query = `
    SELECT currency_account_trade.*,
      currency_list.currency_name,
      currency_account_list.account_name,
      trade_category.trade_name,
      transaction_category.transaction_name
    FROM currency_account_trade
    LEFT JOIN currency_list ON currency_account_trade.currency = currency_list.currency_code
    LEFT JOIN currency_account_list ON currency_account_trade.account_id = currency_account_list.account_id
    LEFT JOIN trade_category ON currency_account_trade.trade_category = trade_category.trade_code
    LEFT JOIN transaction_category ON currency_account_trade.transaction_type = transaction_category.transaction_code
    WHERE currency_account_trade.currency LIKE $1
      AND currency_account_trade.account_id LIKE $2
      AND currency_account_trade.user_id = $3
      AND trade_datetime BETWEEN $4 AND $5
    ORDER BY trade_datetime
  `;

  return executeSQLsyntax({
    query: query,
    params: [`%${data.currencyId}%`, `%${data.accountId}%`, data.userId, data.startingDate, data.endDate],
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}

export async function getCurrencyAccountRecordById(data: { tradeId: string; accountId: string; userId: string }) {
  return executeSQLsyntax({
    query: "SELECT * FROM currency_account_trade WHERE trade_id = $1 AND account_id = $2 AND user_id = $3",
    params: [data.tradeId, data.accountId, data.userId],
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}

export async function insertCurrencyAccountRecord(data: ICreditCardRecordData) {
  const dateDetectResult = await tradeDateTimeDetect(
    "currency_account_list",
    "currency_account_trade",
    "account_id",
    data.updateData.accountId,
    data.updateData.tradeDatetime,
  );
  // console.log("dateDetectResult:", dateDetectResult);
  if (!dateDetectResult.success) return { success: false, message: dateDetectResult.message };

  try {
    const insertQuery =
      `INSERT INTO public.currency_account_trade(trade_id, account_id, trade_datetime, user_id, trade_category, transaction_type, trade_amount, remaining_amount, currency, trade_description, trade_note)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;

    const insertParams = [
      `CA-${data.updateData.currency}-${getCurrentTimestamp()}`,
      data.updateData.accountId,
      data.updateData.tradeDatetime,
      data.userId,
      data.updateData.tradeCategory,
      data.updateData.transactionType,
      data.updateData.tradeAmount,
      data.updateData.remainingAmount,
      data.updateData.currency,
      data.updateData.tradeDescription,
      data.updateData.tradeNote,
    ];
    const insertResult = await pool.query(insertQuery, insertParams);

    // return executeSQLsyntax(insertQuery, insertParams);

    if (insertResult.rowCount === 1) {
      const accountTarget = await currencyAccountListServices.getCurrencyAccountById(
        data.updateData.accountId,
        data.updateData.userId,
      );
      accountTarget.data.presentAmount = data.updateData.remainingAmount;
      await currencyAccountListServices.updateCurrencyAccountData(accountTarget.data);

      return {
        success: insertResult,
        userData: insertResult ? insertResult.rows[0] : [],
      };
    }
    return { success: false, userData: [] };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : String(err) };
  }
}

export async function updateCurrencyAccountRecord(data: ICreditCardRecordData) {
  try {
    const query = `
      UPDATE public.currency_account_trade
      SET trade_datetime = $1, trade_category = $2, transaction_type = $3, trade_amount = $4, currency = $5, trade_description = $6, trade_note = $7
      WHERE trade_id = $8 AND account_id = $9 AND user_id = $10
    `;

    const params = [
      data.updateData.tradeDatetime,
      data.updateData.tradeCategory,
      data.updateData.transactionType,
      data.updateData.tradeAmount,
      data.updateData.currency,
      data.updateData.tradeDescription,
      data.updateData.tradeNote,
      data.updateData.tradeId,
      data.updateData.accountId,
      data.userId,
    ];

    const result = await pool.query(query, params);
    return result.rowCount === 1;
  } catch (error) {
    console.error("Update error:", error);
    return false;
  }
}

export async function removeCurrencyAccountRecord(data: ICreditCardRecordData) {
  return executeSQLsyntax({
    query: "DELETE FROM public.currency_account_trade WHERE trade_id=$1 AND account_id=$2 AND user_id=$3",
    params: [data.updateData.tradeId, data.updateData.accountId, data.updateData.userId],
    successMessage: "刪除成功",
    errorMessage: "刪除失敗",
  });
}
