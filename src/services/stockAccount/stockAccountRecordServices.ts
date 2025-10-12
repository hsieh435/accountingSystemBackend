import pool from "@/db";
import { getStockAccountById, updateStockAccountData } from "@/services/stockAccount/stockAccountListServices";
import { keysToCamel, getCurrentTimestamp } from "@/utils/tools";

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

export interface IFinanceRecordSearchingParams {
  accountId: string;
  currencyId: string;
  tradeCategory: string;
  startingDate: string;
  endDate: string;
  userId: string;
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

export async function insertStockAccountRecord(data: IStockAccountRecordList) {
  const insertResult = await pool.query(
    `INSERT INTO public.stock_account_trade(trade_id, account_id, user_id, trade_datetime, trade_category, transaction_type, stock_no, stock_name, price_per_share, quantity, stock_total_price, handling_fee, transaction_tax, trade_total_price, remaining_amount, currency, trade_description, trade_note) VALUES ('ST-${data.currency}-${getCurrentTimestamp()}', ${data.accountId}, '${data.userId}', '${data.tradeDatetime}', '${data.tradeCategory}', '${data.transactionType}', '${data.stockNo}', '${data.stockName}', ${data.pricePerShare}, ${data.quantity}, ${data.stockTotalPrice}, ${data.handlingFee}, ${data.transactionTax}, ${data.tradeTotalPrice}, ${data.remainingAmount}, '${data.currency}', '${data.tradeDescription}', '${data.tradeNote}')`,
  );

  const accountTarget = await getStockAccountById({ accountId: data.accountId, userId: data.userId });
  accountTarget.data.presentAmount = data.remainingAmount;
  const updateResult = await updateStockAccountData(accountTarget.data);

  return insertResult.rowCount === 1 && updateResult
    ? { success: true, userData: keysToCamel(insertResult.rows[0]) }
    : { success: false, userData: [] };
}

export async function updateStockAccountRecord(data: IStockAccountRecordList) {
  const result = await pool.query(
    `UPDATE public.stock_account_trade SET trade_datetime='${data.tradeDatetime}', stock_no='${data.stockNo}', stock_name='${data.stockName}', price_per_share=${data.pricePerShare}, quantity=${data.quantity}, stock_total_price=${data.stockTotalPrice}, handling_fee=${data.handlingFee}, transaction_tax=${data.transactionTax}, trade_total_price = ${data.tradeTotalPrice}, trade_description = '${data.tradeDescription}', trade_note='${data.tradeNote}'
    WHERE trade_id = '${data.tradeId}' AND account_id = '${data.accountId}' AND user_id = '${data.userId}'`,
  );
  return result.rowCount === 1;
}

export async function removeStockAccountRecord(data: IStockAccountRecordList) {
  const result = await pool.query(
    `DELETE FROM public.stock_account_trade WHERE trade_id = '${data.tradeId}' AND account_id = '${data.accountId}' AND user_id = '${data.userId}'`,
  );
  return result.rowCount === 1 ? { success: true, message: "刪除成功" } : { success: false, message: "刪除失敗" };
}
