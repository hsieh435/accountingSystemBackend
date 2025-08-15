import pool from "@/db";
import { keysToCamel, getCurrentTimestamp, getCurrentYMD } from "@/utils/tools";



export interface ICashFlowRecordList {
  tradeId: string;
  cashflowId: string;
  userId: string;
  tradeDatetime: string;
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



export async function searchingCashFlowRecordList(data: IFinanceRecordSearchingParams) {
  try {
    const searchingResult =
      await pool.query(`SELECT cashflow_trade.*, currency_list.currency_name FROM cashflow_trade
        LEFT JOIN currency_list ON cashflow_trade.currency = currency_list.currency_code
        WHERE user_id = '${data.userId}' AND cashflow_id  LIKE '%${data.accountId}%' AND currency LIKE '%${data.currencyId}%' AND  trade_datetime BETWEEN '${data.startingDate}' AND '${data.endDate}' ORDER BY trade_datetime`);
    // console.log("searchingResult:", searchingResult.rows);
    return { success: true, data: keysToCamel(searchingResult.rows) };
  } catch (err) {
    return { success: false, data: [] };
  }
}



export async function insertCashFlowRecordData(data: ICashFlowRecordList) {
  const insertResult =
    await pool.query(`INSERT INTO public.cashflow_trade(trade_id, cashflow_id, user_id, trade_datetime, trade_category, transaction_type, trade_amount, currency, trade_description, trade_note) VALUES ('${getCurrentTimestamp()}', '${data.cashflowId}', '${data.userId}', '${data.tradeDatetime}', '${data.tradeCategory}', '${data.transactionType}', ${data.tradeAmount}, '${data.currency}', '${data.tradeDescription}', '${data.tradeNote}')`);
  // console.log("insertResult:", insertResult);
  if (insertResult.rowCount === 1) {
    return { success: true, userData: keysToCamel(insertResult.rows[0]) };
  } else {
    return { success: false, userData: [] };
  }
}



export async function updateCashFlowRecordData(data: ICashFlowRecordList) {
  const updateResult =
    await pool.query(`UPDATE public.cashflow_trade SET trade_datetime='${data.tradeDatetime}', trade_category='${data.tradeCategory}', transaction_type='${data.transactionType}', trade_amount=${data.tradeAmount}, trade_description='${data.tradeDescription}', trade_note='${data.tradeNote}' WHERE trade_id='${data.tradeId}' AND cashflow_id='${data.cashflowId}' AND user_id='${data.userId}'`);
  // console.log("insertResult:", insertResult);
  if (updateResult.rowCount === 1) {
    return { success: true, userData: keysToCamel(updateResult.rows[0]) };
  } else {
    return { success: false, userData: [] };
  }
}



export async function deleteCashFlowRecordData(data: ICashFlowRecordList) {
  const deleteResult =
    await pool.query(`DELETE FROM public.cashflow_trade WHERE trade_id='${data.tradeId}' AND cashflow_id='${data.cashflowId}' AND user_id='${data.userId}'`);
  // console.log("insertResult:", insertResult);
  if (deleteResult.rowCount === 1) {
    return { success: true, message: "刪除成功" };
  } else {
    return { success: false, message: "刪除失敗" };
  }
};
