
import pool from "@/db";
import { keysToCamel, getCurrentTimestamp, getTimeStampWithZone } from "@/utils/tools";



export interface IBalanceData {
  tradeId: string;
  accountId: string;
  userId: string;
  transactionType: string;
  tradeCode: string;
  tradeAmount: number;
  accountBalance: number;
  eventDatetimes: string;
}



export async function insertBalance(data: IBalanceData) {

  const insertResult =
    await pool.query(`INSERT INTO public.account_balance(trade_id, account_id, user_id, transaction_type, trade_code, trade_amount, account_balance, event_datetimes) VALUES ('${data.tradeId}', '${data.accountId}', '${data.userId}', '${data.transactionType}', '${data.tradeCode}', ${data.tradeAmount}, ${data.accountBalance}, '${data.eventDatetimes}')`);
  // console.log("insertResult:", insertResult);
  if (insertResult.rowCount === 1) {
    return true;
  } else {
    return false;
  }
};



export async function updateBalance(data: IBalanceData) {

  const updateResult =
    await pool.query(`UPDATE public.account_balance SET transaction_type='${data.transactionType}', trade_code='${data.tradeCode}', trade_amount=${data.tradeAmount}, account_balance=${data.accountBalance}, event_datetimes='${getTimeStampWithZone()}' WHERE trade_id = '${data.tradeId}' AND account_id = '${data.accountId}' AND user_id = '${data.userId}'`);
  // console.log("insertResult:", insertResult);
  if (updateResult.rowCount === 1) {
    return true;
  } else {
    return false;
  }
};



export async function deleteBalance(data: IBalanceData) {
  // 
}
