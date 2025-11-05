import pool from "@/db";
import { keysToCamel, getCurrentTimestamp } from "@/utils/tools";
import * as currencyAccountListServices from "@/services/currencyAccount/currencyAccountListServices";
import { getLatestTradeRecordDateTime } from "@/services/serviceTools";

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


export interface ICreditCardRecordData {
  updateData: ICreditCardRecordList;
  oriData: any;
}

// Helper function for consistent error handling
const handleDbError = (error: any, defaultData: any = []) => {
  console.error("Database error:", error);
  return { success: false, data: defaultData };
};

// Helper function for operations that return success/failure
const executeOperation = async (query: string, params: any[], successData?: any) => {
  try {
    const result = await pool.query(query, params);
    if (result.rowCount === 1) {
      return successData
        ? { success: true, userData: keysToCamel(successData) }
        : { success: true, userData: keysToCamel(result.rows[0]) };
    }
    return { success: false, userData: [] };
  } catch (error) {
    console.error("Operation error:", error);
    return { success: false, userData: [] };
  }
};

export async function searchingCurrencyAccountRecordList(data: IFinanceRecordSearchingParams) {
  try {
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

    const params = [`%${data.currencyId}%`, `%${data.accountId}%`, data.userId, data.startingDate, data.endDate];

    const result = await pool.query(query, params);
    return { success: true, data: keysToCamel(result.rows) };
  } catch (error) {
    return handleDbError(error);
  }
}

export async function getCurrencyAccountRecordById(data: { tradeId: string; accountId: string; userId: string }) {
  try {
    const query = "SELECT * FROM currency_account_trade WHERE trade_id = $1 AND account_id = $2 AND user_id = $3";
    const result = await pool.query(query, [data.tradeId, data.accountId, data.userId]);

    if (result.rows.length === 0) {
      return { success: false, data: null };
    }

    return { success: true, data: keysToCamel(result.rows[0]) };
  } catch (error) {
    return handleDbError(error, null);
  }
}

export async function insertCurrencyAccountRecord(data: ICreditCardRecordData) {
  const insertQuery = `INSERT INTO public.currency_account_trade(trade_id, account_id, trade_datetime, user_id, trade_category, transaction_type, trade_amount, remaining_amount, currency, trade_description, trade_note) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `;

  const insertParams = [
    `CA-${data.updateData.currency}-${getCurrentTimestamp()}`,
    data.updateData.accountId,
    data.updateData.tradeDatetime,
    data.updateData.userId,
    data.updateData.tradeCategory,
    data.updateData.transactionType,
    data.updateData.tradeAmount,
    data.updateData.remainingAmount,
    data.updateData.currency,
    data.updateData.tradeDescription,
    data.updateData.tradeNote,
  ];
  const insertResult = await pool.query(insertQuery, insertParams);

  // return executeOperation(insertQuery, insertParams);

  if (insertResult.rowCount === 1) {
    const accountTarget = await currencyAccountListServices.getCurrencyAccountById(data.updateData.accountId, data.updateData.userId);
    accountTarget.data.presentAmount = data.updateData.remainingAmount;
    await currencyAccountListServices.updateCurrencyAccountData(accountTarget.data);

    return {
      success: insertResult,
      userData: insertResult ? keysToCamel(insertResult.rows[0]) : [],
    };
  }
  return { success: false, userData: [] };
}

export async function updateCurrencyAccountRecord(data: ICreditCardRecordData) {
  try {
    const query = `
      UPDATE public.currency_account_trade
      SET trade_datetime=$1, trade_category=$2, transaction_type=$3, trade_amount=$4, currency=$5, trade_description=$6, trade_note=$7
      WHERE trade_id=$8 AND account_id=$9 AND user_id=$10
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
      data.updateData.userId,
    ];

    const result = await pool.query(query, params);
    return result.rowCount === 1;
  } catch (error) {
    console.error("Update error:", error);
    return false;
  }
}

export async function removeCurrencyAccountRecord(data: ICreditCardRecordData) {
  try {
    const query = "DELETE FROM public.currency_account_trade WHERE trade_id=$1 AND account_id=$2 AND user_id=$3";
    const result = await pool.query(query, [data.updateData.tradeId, data.updateData.accountId, data.updateData.userId]);

    return result.rowCount === 1 ? { success: true, message: "刪除成功" } : { success: false, message: "刪除失敗" };
  } catch (error) {
    console.error("Delete error:", error);
    return { success: false, message: "刪除失敗" };
  }
}
