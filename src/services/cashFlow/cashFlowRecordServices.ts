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
    await pool.query(`INSERT INTO cashflow_trade(trade_id, cashflow_id, user_id, trade_datetime, transaction_type, trade_category, trade_amount, currency, trade_description, trade_note) VALUES ('${getCurrentTimestamp()}', '${data.cashflowId}', '${data.userId}', '${data.tradeDatetime}', '${data.transactionType}', '${data.tradeCategory}', ${data.tradeAmount}, '${data.currency}', '${data.tradeDescription}', '${data.tradeNote}')`);
  // console.log("insertResult:", insertResult);
  if (insertResult.rowCount === 1) {
    return { success: true, userData: keysToCamel(insertResult.rows[0]) };
  } else {
    return { success: false, userData: [] };
  }
}
