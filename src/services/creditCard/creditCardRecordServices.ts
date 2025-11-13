import pool from "@/db";
import { keysToCamel, getCurrentTimestamp, setTimezone } from "@/utils/tools";
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

export interface IOriData {
  oriTradeDatetime: string;
  oriTradeAmount: number;
  oriRemainingAmount: number;
  oriTransactionType: string;
}

export interface ICreditCardTradeData {
  updateData: ICreditCardRecordList;
  oriData: IOriData;
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

export async function getCreditCardRecordById(tradeId: string, creditCardId: string, userId: string) {

  try {
    const result = await pool.query(
      `SELECT * FROM creditcard_trade
      WHERE trade_id = '${tradeId}' AND credit_card_id = '${creditCardId}' AND user_id = '${userId}'`
    );
    if (result.rowCount === 1) {
      return { success: true, data: keysToCamel(result.rows[0]) };
    }
    return { success: false, data: null };
  } catch {
    return { success: false, data: null };
  }
}

export async function insertCreditCardData(data: ICreditCardTradeData) {


  const latestTradeDateTimes =
    await getLatestTradeRecordDateTime("creditcard_trade", "credit_card_id", data.updateData.creditCardId);
  const tradeDatetimeWithTimezone = setTimezone(data.updateData.tradeDatetime);
  console.log("latestTradeDateTimes:", latestTradeDateTimes);
  console.log("tradeDatetimeWithTimezone:", tradeDatetimeWithTimezone);

  if (latestTradeDateTimes > tradeDatetimeWithTimezone) {
    console.log(100);
  } else if (latestTradeDateTimes === tradeDatetimeWithTimezone) {
    console.log(200);
  } else if (!latestTradeDateTimes || latestTradeDateTimes < tradeDatetimeWithTimezone) {
    console.log(300);
  }


  const insertResult = await pool.query(
    `INSERT INTO public.creditcard_trade(trade_id, credit_card_id, user_id, trade_datetime, trade_category, transaction_type, trade_amount, remaining_amount, currency, trade_description, trade_note) VALUES ('CC-${data.updateData.currency}-${getCurrentTimestamp()}', '${data.updateData.creditCardId}', '${data.updateData.tradeDatetime}', '${data.updateData.userId}', '${data.updateData.tradeCategory}', ${data.updateData.tradeAmount}, ${data.updateData.remainingAmount}, '${data.updateData.currency}', '${data.updateData.billMonth}', '${data.updateData.tradeDescription}', '${data.updateData.tradeNote}')`,
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
    await pool.query(`UPDATE public.creditcard_trade SET trade_datetime='${data.updateData.tradeDatetime}', trade_category='${data.updateData.tradeCategory}', trade_amount=${data.updateData.tradeAmount}, currency='${data.updateData.currency}', bill_month='${data.updateData.billMonth}', trade_description='${data.updateData.tradeDescription}', trade_note='${data.updateData.tradeNote}'
    WHERE trade_id = '${data.updateData.tradeId}' AND credit_card_id = '${data.updateData.creditCardId}' AND user_id = '${data.updateData.userId}'`);
  // console.log("updateResult:", updateResult);
  if (updateResult.rowCount === 1) {
    return true;
  } else {
    return false;
  }
}

export async function removeCreditCardRecordData(data: { tradeId: string; creditCardId: string; userId: string }) {
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
