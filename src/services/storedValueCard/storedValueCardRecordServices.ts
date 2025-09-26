import pool from "@/db";
import { keysToCamel, getCurrentTimestamp } from "@/utils/tools";

export interface IStoredValueCardRecordList {
  tradeId: string;
  storedValueCardId: string;
  userId: string;
  accountType: string;
  tradeDatetime: string;
  transactionType: string;
  tradeCategory: string;
  tradeAmount: number;
  currency: string;
  tradeDescription: string;
  tradeNote: string;
}

export interface IFinanceRecordSearchingParams {
  accountId: string;
  currencyId: string;
  tradeCategory: string;
  startingDate: string;
  endDate: string;
  userId: string;
}

export async function searchingStoredValueCardRecordList(data: IFinanceRecordSearchingParams) {
  try {
    const result = await pool.query(`SELECT stored_value_card_trade.*,
      currency_list.currency_name,
      stored_value_card_list.stored_value_card_name,
      trade_category.trade_name,
      transaction_category.transaction_name
      FROM stored_value_card_trade
      LEFT JOIN currency_list ON stored_value_card_trade.currency = currency_list.currency_code
      LEFT JOIN stored_value_card_list ON stored_value_card_trade.stored_value_card_id = stored_value_card_list.stored_value_card_id
      LEFT JOIN trade_category ON stored_value_card_trade.trade_category = trade_category.trade_code
      LEFT JOIN transaction_category ON stored_value_card_trade.transaction_type = transaction_category.transaction_code
      WHERE stored_value_card_trade.user_id = '${data.userId}'
      AND stored_value_card_trade.stored_value_card_id LIKE '%${data.accountId}%'
      AND stored_value_card_trade.currency LIKE '%${data.currencyId}%'
      AND trade_datetime BETWEEN '${data.startingDate}' AND '${data.endDate}' ORDER BY trade_datetime`);
    return { success: true, data: keysToCamel(result.rows) };
  } catch {
    return { success: false, data: [] };
  }
}

export async function searchingStoredValueCardRecordById(data: { storedValueCardId: string; tradeId: string; userId: string }) {
  try {
    const result = await pool.query(
      `SELECT * FROM public.stored_value_card_trade WHERE stored_value_card_id = '${data.storedValueCardId}' AND trade_id = '${data.tradeId}' AND user_id='${data.userId}'`,
    );
    return result.rows.length === 1
      ? { success: true, data: result.rows[0] }
      : { success: false, data: [] };
  } catch {
    return { success: false, data: [] };
  }
}

export async function insertStoredValueCardRecord(data: IStoredValueCardRecordList) {
  try {
    const insertResult = await pool.query(
      `INSERT INTO public.stored_value_card_trade(trade_id, stored_value_card_id, user_id, trade_datetime, trade_category, transaction_type, trade_amount, currency, trade_description, trade_note)
       VALUES ('SVC-${data.currency}-${getCurrentTimestamp()}', '${data.storedValueCardId}', '${data.userId}', '${data.tradeDatetime}', '${data.tradeCategory}', '${data.transactionType}', ${data.tradeAmount}, '${data.currency}', '${data.tradeDescription}', '${data.tradeNote}')`,
    );
    return insertResult.rowCount === 1
      ? { success: true, userData: keysToCamel(insertResult.rows[0]) }
      : { success: false, userData: [] };
  } catch {
    return { success: false, userData: [] };
  }
}

export async function updateStoredValueCardRecordData(data: IStoredValueCardRecordList) {
  const result = await pool.query(
    `UPDATE public.stored_value_card_trade SET trade_datetime='${data.tradeDatetime}', trade_category='${data.tradeCategory}', transaction_type='${data.transactionType}', trade_amount=${data.tradeAmount}, currency='${data.currency}', trade_description='${data.tradeDescription}', trade_note='${data.tradeNote}' WHERE trade_id='${data.tradeId}' AND stored_value_card_id='${data.storedValueCardId}' AND user_id='${data.userId}'`,
  );
  return result.rowCount === 1
    ? { success: true, userData: keysToCamel(result.rows[0]) }
    : { success: false, userData: [] };
}
