import pool from "@/db";
import { keysToCamel, getCurrentTimestamp, getCurrentYMD } from "@/utils/tools";

export interface IStockAccountRecordList {
  tradeId: string;
  accountId: string;
  userId: string;
  tradeDatetime: string;
  accountUser: string;
  transactionType: string;
  tradeCategory: string;
  stockNo: string;
  stockName: string;
  pricePerShare: number;
  quantity: number;
  handlingFee: number;
  transactionTax: number;
  stockTotalPrice: number;
  tradeTotalPrice: number;
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



export async function searchingStockAccountRecordList(data: IFinanceRecordSearchingParams) {
  // console.log("data:", data);

  try {
    const searchingResult =
      await pool.query(`SELECT stock_account_trade.*,
        currency_list.currency_name,
        currency_account_list.account_name,
        trade_category.trade_name,
        transaction_category.transaction_name
        FROM stock_account_trade
        LEFT JOIN currency_list ON stock_account_trade.currency = currency_list.currency_code
        LEFT JOIN currency_account_list ON stock_account_trade.account_id = currency_account_list.account_id
        LEFT JOIN trade_category ON stock_account_trade.trade_category = trade_category.trade_code
        LEFT JOIN transaction_category ON stock_account_trade.transaction_type = transaction_category.transaction_code
        WHERE stock_account_trade.currency LIKE '%${data.currencyId}%'
        AND stock_account_trade.account_id LIKE '%${data.accountId}%'
        AND stock_account_trade.user_id = '${data.userId}'
        AND trade_datetime BETWEEN '${data.startingDate}' AND '${data.endDate}' ORDER BY trade_datetime`);
    // console.log("searchingResult:", searchingResult);
    return { success: true, data: keysToCamel(searchingResult.rows) };
  } catch (err) {
    return { success: false, data: [] };
  }
}

export async function insertStockAccountRecord(data: IStockAccountRecordList) {
  const insertResult = await pool.query(`INSERT INTO public.stock_account_trade(trade_id, account_id, user_id, trade_datetime, trade_category, transaction_type, stock_no, stock_name, price_per_share, quantity, stock_total_price, handling_fee, transaction_tax, trade_total_price, currency, trade_description, trade_note) VALUES ('${getCurrentTimestamp()}', ${data.accountId}, '${data.userId}', '${data.tradeDatetime}', '${data.tradeCategory}', '${data.transactionType}', '${data.stockNo}', '${data.stockName}', ${data.pricePerShare}, ${data.quantity}, ${data.stockTotalPrice}, ${data.handlingFee}, ${data.transactionTax}, ${data.tradeTotalPrice}, '${data.currency}', '${data.tradeDescription}', '${data.tradeNote}')`,
  );
  // console.log("insertResult:", insertResult);
  if (insertResult.rowCount === 1) {
    return { success: true, userData: keysToCamel(insertResult.rows[0]) };
  } else {
    return { success: false, userData: [] };
  }
}

export async function updateStockAccountRecord(data: IStockAccountRecordList) {
  // console.log("data:", data);
  const updateResult = await pool.query(
    `UPDATE public.stock_account_trade SET trade_datetime='${data.tradeDatetime}', stock_no='${data.stockNo}', stock_name='${data.stockName}', price_per_share=${data.pricePerShare}, quantity=${data.quantity}, stock_total_price=${data.stockTotalPrice}, handling_fee=${data.handlingFee}, transaction_tax=${data.transactionTax}, trade_total_price = ${data.tradeTotalPrice}, trade_description = '${data.tradeDescription}', trade_note='${data.tradeNote}' WHERE trade_id = '${data.tradeId}' AND account_id = '${data.accountId}' AND user_id = '${data.userId}'`,
  );
  // console.log("updateResult:", updateResult);
  if (updateResult.rowCount === 1) {
    return true;
  } else {
    return false;
  }
}

export async function removeStockAccountRecord(data: IStockAccountRecordList) {

  const deleteResult =
    await pool.query(`DELETE FROM public.stock_account_trade WHERE trade_id = '${data.tradeId}' AND account_id = '${data.accountId}' AND user_id = '${data.userId}'`);
    // console.log("deleteResult:", deleteResult);
  if (deleteResult.rowCount === 1) {
    return { success: true, message: "刪除成功" };
  } else {
    return { success: false, message: "刪除失敗" };
  }
}
