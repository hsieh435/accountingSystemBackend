import pool from "@/db";
import { getStockAccountById, updateStockAccountData } from "@/services/stockAccount/stockAccountListServices";
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
  remainingAmount: number;
  currency: string;
  tradeDescription: string;
  tradeNote: string;
}

export interface IOriData {
  oriTradeDatetime: string;
  oriTradeAmount: number;
  oriRemainingAmount: number;
  oriTransactionType: string;
}


export async function searchingStockAccountRecordList(data: IFinanceRecordSearchingParams) {
  try {
    const result = await pool.query(
      `SELECT stock_account_trade.*,
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
        AND trade_datetime BETWEEN '${data.startingDate}' AND '${data.endDate}' ORDER BY trade_datetime`,
    );
    return { success: true, data: keysToCamel(result.rows) };
  } catch {
    return { success: false, data: [] };
  }
}


export async function getStockAccountRecordById(tradeId: string, accountId: string, userId: string) {
  try {
    const result = await pool.query(
      `SELECT * FROM public.stock_account_trade
      WHERE trade_id='${tradeId}' AND account_id='${accountId}' AND user_id='${userId}'`,
    );
    return { success: true, data: keysToCamel(result.rows[0]) };
  } catch {
    return { success: false, data: [] };
  }
}

export async function insertStockAccountRecord(data: {
  insertData: IStockAccountRecordList,
  oriData: IOriData,
}) {

    if (await getLatestTradeRecordDateTime("public.stock_account_trade", "trade_datetime") < setTimezone(data.insertData.tradeDatetime)) {
      console.log(await getLatestTradeRecordDateTime("public.stock_account_trade", "trade_datetime"));
    }





  const insertResult = await pool.query(
    `INSERT INTO public.stock_account_trade(trade_id, account_id, user_id, trade_datetime, trade_category, transaction_type, stock_no, stock_name, price_per_share, quantity, stock_total_price, handling_fee, transaction_tax, trade_total_price, remaining_amount, currency, trade_description, trade_note) VALUES ('ST-${data.insertData.currency}-${getCurrentTimestamp()}', ${data.insertData.accountId}, '${data.insertData.userId}', '${data.insertData.tradeDatetime}', '${data.insertData.tradeCategory}', '${data.insertData.transactionType}', '${data.insertData.stockNo}', '${data.insertData.stockName}', ${data.insertData.pricePerShare}, ${data.insertData.quantity}, ${data.insertData.stockTotalPrice}, ${data.insertData.handlingFee}, ${data.insertData.transactionTax}, ${data.insertData.tradeTotalPrice}, ${data.insertData.remainingAmount}, '${data.insertData.currency}', '${data.insertData.tradeDescription}', '${data.insertData.tradeNote}')`,
  );

  const accountTarget = await getStockAccountById({ accountId: data.insertData.accountId, userId: data.insertData.userId });
  accountTarget.data.presentAmount = data.insertData.remainingAmount;
  const updateResult = await updateStockAccountData(accountTarget.data);

  return insertResult.rowCount === 1 && updateResult
    ? { success: true, userData: keysToCamel(insertResult.rows[0]) }
    : { success: false, userData: [] };
}

export async function updateStockAccountRecord(data: {
  updateData: IStockAccountRecordList,
  oriData: IOriData,
}) {
  const result = await pool.query(
    `UPDATE public.stock_account_trade SET trade_datetime='${data.updateData.tradeDatetime}', stock_no='${data.updateData.stockNo}', stock_name='${data.updateData.stockName}', price_per_share=${data.updateData.pricePerShare}, quantity=${data.updateData.quantity}, stock_total_price=${data.updateData.stockTotalPrice}, handling_fee=${data.updateData.handlingFee}, transaction_tax=${data.updateData.transactionTax}, trade_total_price = ${data.updateData.tradeTotalPrice}, trade_description = '${data.updateData.tradeDescription}', trade_note='${data.updateData.tradeNote}'
    WHERE trade_id = '${data.updateData.tradeId}' AND account_id = '${data.updateData.accountId}' AND user_id = '${data.updateData.userId}'`,
  );
  return result.rowCount === 1;
}

export async function removeStockAccountRecord(data: IStockAccountRecordList) {
  const result = await pool.query(
    `DELETE FROM public.stock_account_trade
    WHERE trade_id = '${data.tradeId}' AND account_id = '${data.accountId}' AND user_id = '${data.userId}'`,
  );
  return result.rowCount === 1 ? { success: true, message: "刪除成功" } : { success: false, message: "刪除失敗" };
}
