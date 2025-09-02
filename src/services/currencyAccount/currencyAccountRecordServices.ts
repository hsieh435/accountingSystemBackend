import pool from "@/db";
import { keysToCamel, getCurrentTimestamp, getCurrentYMD } from "@/utils/tools";




export interface IcurrencyAccountRecordList {
  tradeId: string;
  accountId: string;
  userId: string;
  tradeDatetime: string;
  accountUser: string;
  accountType: string;
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


export async function searchingCurrencyAccountRecordList(data: IFinanceRecordSearchingParams) {
  // console.log("data:", data);

  try {
    const searchingResult =
      await pool.query(`SELECT currency_account_trade.*,
        currency_list.currency_name,
        currency_account_list.account_name,
        trade_category.trade_name,
        transaction_category.transaction_name
        FROM currency_account_trade
        LEFT JOIN currency_list ON currency_account_trade.currency = currency_list.currency_code
        LEFT JOIN currency_account_list ON currency_account_trade.account_id = currency_account_list.account_id
        LEFT JOIN trade_category ON currency_account_trade.trade_category = trade_category.trade_code
        LEFT JOIN transaction_category ON currency_account_trade.transaction_type = transaction_category.transaction_code
        WHERE currency_account_trade.currency LIKE '%${data.currencyId}%'
        AND currency_account_trade.account_id LIKE '%${data.accountId}%'
        AND currency_account_trade.user_id = '${data.userId}'
        AND trade_datetime BETWEEN '${data.startingDate}' AND '${data.endDate}' ORDER BY trade_datetime`);
    // console.log("searchingResult:", searchingResult);
    return { success: true, data: keysToCamel(searchingResult.rows) };
  } catch (err) {
    return { success: false, data: [] };
  }
}



export async function insertCurrencyAccountRecord(data: IcurrencyAccountRecordList) {

  const insertResult =
    await pool.query(`INSERT INTO public.currency_account_trade(trade_id, account_id, trade_datetime, user_id, trade_category, transaction_type, trade_amount, currency, trade_description, trade_note) VALUES ('${getCurrentTimestamp()}', '${data.accountId}', '${data.tradeDatetime}', '${data.userId}', '${data.tradeCategory}', '${data.transactionType}', ${data.tradeAmount}, '${data.currency}', '${data.tradeDescription}', '${data.tradeNote}')`);
  // console.log("insertResult:", insertResult);
  if (insertResult.rowCount === 1) {
    return { success: true, userData: keysToCamel(insertResult.rows[0]) };
  } else {
    return { success: false, userData: [] };
  }
};



export async function updateCurrencyAccountRecord(data: IcurrencyAccountRecordList) {
  // console.log("data:", data);
  const updateResult =
    await pool.query(`UPDATE public.currency_account_trade SET trade_datetime='${data.tradeDatetime}', trade_category='${data.tradeCategory}', transaction_type='${data.transactionType}', trade_amount=${data.tradeAmount}, currency='${data.currency}', trade_description='${data.tradeDescription}', trade_note='${data.tradeNote}' WHERE trade_id = '${data.tradeId}' AND account_id = '${data.accountId}' AND user_id = '${data.userId}'`);
  // console.log("updateResult:", updateResult);
  if (updateResult.rowCount === 1) {
    return true;
  } else {
    return false;
  }
};



export async function removeCurrencyAccountRecord(data: IcurrencyAccountRecordList) {

  const deleteResult =
    await pool.query(`DELETE FROM public.currency_account_trade WHERE trade_id = '${data.tradeId}' AND account_id = '${data.accountId}' AND user_id = '${data.userId}'`);
  // console.log("deleteResult:", deleteResult);
  if (deleteResult.rowCount === 1) {
    return { success: true, message: "刪除成功" };
  } else {
    return { success: false, message: "刪除失敗" };
  }
};
