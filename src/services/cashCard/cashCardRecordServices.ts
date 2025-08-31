import pool from "@/db";
import { keysToCamel, getCurrentTimestamp, setTimezone } from "@/utils/tools";


export interface ICashCardRecordList {
  tradeId: string;
  cashcardId: string;
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

export async function searchingCashCardRecordList(data: IFinanceRecordSearchingParams) {
  try {
    const searchingResult = await pool.query(`SELECT cashcard_trade.*, currency_list.currency_name FROM cashcard_trade
        LEFT JOIN currency_list ON cashcard_trade.currency = currency_list.currency_code
        WHERE user_id = '${data.userId}' AND cashcard_id  LIKE '%${data.accountId}%' AND currency LIKE '%${data.currencyId}%' AND trade_datetime BETWEEN '${data.startingDate}' AND '${data.endDate}' ORDER BY trade_datetime`);
    // console.log("searchingResult:", searchingResult.rows);
    return { success: true, data: keysToCamel(searchingResult.rows) };
  } catch (err) {
    return { success: false, data: [] };
  }
}

export async function searchingCashCardRecordById(data: { cashcardId: string; tradeId: string; userId: string }) {
  try {
    const searchingResult = await pool.query(
      `SELECT * FROM public.cashcard_trade where cashcard_id = '${data.cashcardId}' and trade_id = '${data.tradeId}' and user_id='${data.userId}'`,
    );
    console.log("searchingResult:", searchingResult.rows[0]);
    if (searchingResult.rows.length === 1) {
      return { success: true, data: searchingResult.rows[0] };
    } else {
      return { success: false, data: [] };
    }
  } catch (err) {
    return { success: false, data: [] };
  }
}

export async function insertCashCardRecord(data: ICashCardRecordList) {
  // console.log("data:", data);
  console.log("data:", setTimezone(data.tradeDatetime));

  try {
    const insertResult = await pool.query(
      `INSERT INTO public.cashcard_trade(trade_id, cashcard_id, user_id, trade_datetime, trade_category, transaction_type, trade_amount, currency, trade_description, trade_note) VALUES ('${getCurrentTimestamp()}', '${data.cashcardId}', '${data.userId}', '${data.tradeDatetime}', '${data.tradeCategory}', '${data.transactionType}', ${data.tradeAmount}, '${data.currency}', '${data.tradeDescription}', '${data.tradeNote}')`,
    );
    // console.log("insertResult:", insertResult);

    if (insertResult.rowCount === 1) {
      return { success: true, userData: keysToCamel(insertResult.rows[0]) };
    } else {
      return { success: false, userData: [] };
    }
  } catch (err) {
    return { success: false, userData: [] };
  }
}

export async function updateCashCardRecordData(data: ICashCardRecordList) {
  const updateResult = await pool.query(
    `UPDATE public.cashcard_trade SET trade_datetime='${data.tradeDatetime}', trade_category='${data.tradeCategory}', transaction_type='${data.transactionType}', trade_amount=${data.tradeAmount}, currency='${data.currency}', trade_description='${data.tradeDescription}', trade_note='${data.tradeNote}' WHERE trade_id='${data.tradeId}' AND cashcard_id='${data.cashcardId}' AND user_id='${data.userId}'`,
  );
  // console.log("insertResult:", insertResult);
  if (updateResult.rowCount === 1) {
    return { success: true, userData: keysToCamel(updateResult.rows[0]) };
  } else {
    return { success: false, userData: [] };
  }
}

// export async function deleteCashCardRecordData(data: ICashCardRecordList) {
//   const deleteResult = await pool.query(
//     `DELETE FROM public.cashcard_trade WHERE trade_id='${data.tradeId}' AND cashcard_id='${data.cashcardId}' AND user_id='${data.userId}'`,
//   );
//   // console.log("insertResult:", insertResult);
//   if (deleteResult.rowCount === 1) {
//     return { success: true, message: "刪除成功" };
//   } else {
//     return { success: false, message: "刪除失敗" };
//   }
// }
