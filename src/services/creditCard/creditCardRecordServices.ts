import pool from "@/db";
import { keysToCamel, getCurrentTimestamp, getCurrentYMD } from "@/utils/tools";

export interface ICreditCardTradeData {
  tradeId: string;
  userId: string;
  creditCardId: string;
  tradeDatetime: string;
  accountType: string;
  tradeCategory: string;
  tradeAmount: number;
  currency: string;
  remainingAmount: number;
  billMonth: string;
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

export async function searchingCreditCardRecordList(data: IFinanceRecordSearchingParams) {
  try {
    const searchingResult = await pool.query(`SELECT creditcard_trade.*,
      currency_list.currency_name,
      creditcard_list.creditcard_name,
      trade_category.trade_name
      FROM creditcard_trade LEFT JOIN currency_list ON creditcard_trade.currency = currency_list.currency_code
      LEFT JOIN creditcard_list ON creditcard_trade.credit_card_id = creditcard_list.creditcard_id
      LEFT JOIN trade_category ON creditcard_trade.trade_category = trade_category.trade_code
      WHERE creditcard_trade.credit_card_id LIKE '%${data.accountId}%'
      AND creditcard_trade.currency LIKE '%${data.currencyId}%' AND creditcard_trade.user_id = '${data.userId}'
      AND trade_datetime BETWEEN '${data.startingDate}' AND '${data.endDate}' ORDER BY trade_datetime`);
    // console.log("searchingResult:", searchingResult);
    return { success: true, data: keysToCamel(searchingResult.rows) };
  } catch (err) {
    return { success: false, data: [] };
  }
}

export async function insertCreditCardData(data: ICreditCardTradeData) {
  const insertResult = await pool.query(
    `INSERT INTO public.cashflow_trade(trade_id, cashflow_id, user_id, trade_datetime, trade_category, transaction_type, trade_amount, remaining_amount, currency, trade_description, trade_note) VALUES ('CC-${data.currency}-${getCurrentTimestamp()}', '${data.creditCardId}', '${data.tradeDatetime}', '${data.userId}', '${data.tradeCategory}', ${data.tradeAmount}, ${data.remainingAmount}, '${data.currency}', '${data.billMonth}', '${data.tradeDescription}', '${data.tradeNote}')`,
  );
  // console.log("insertResult:", insertResult);
  if (insertResult.rowCount === 1) {
    return { success: true, userData: keysToCamel(insertResult.rows[0]) };
  } else {
    return { success: false, userData: [] };
  }
}

export async function updateCreditCardData(data: ICreditCardTradeData) {
  // console.log("data:", data);
  const updateResult =
    await pool.query(`UPDATE public.creditcard_trade SET trade_datetime='${data.tradeDatetime}', trade_category='${data.tradeCategory}', trade_amount=${data.tradeAmount}, currency='${data.currency}', bill_month='${data.billMonth}', trade_description='${data.tradeDescription}', trade_note='${data.tradeNote}'
    WHERE trade_id = '${data.tradeId}' AND credit_card_id = '${data.creditCardId}' AND user_id = '${data.userId}'`);
  // console.log("updateResult:", updateResult);
  if (updateResult.rowCount === 1) {
    return true;
  } else {
    return false;
  }
}

export async function removeCreditCardData(data: { tradeId: string; creditCardId: string; userId: string }) {
  const deleteResult = await pool.query(
    `DELETE FROM public.creditcard_trade WHERE trade_id = '${data.tradeId}' AND credit_card_id = '${data.creditCardId}' AND user_id = '${data.userId}'`,
  );
  // console.log("deleteResult:", deleteResult);
  if (deleteResult.rowCount === 1) {
    return { success: true, message: "刪除成功" };
  } else {
    return { success: false, message: "刪除失敗" };
  }
}
