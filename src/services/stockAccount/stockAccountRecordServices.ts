import pool from "@/db";
import { getCurrentTimestamp, setTimezone } from "@/utils/tools";
import { executeSQLsyntax } from "@/services/servicesTools";
import {
  type IFinanceRecordSearchingParams,
  tradeDateTimeDetect,
  updateRelatedData,
} from "@/services/recordServiceToolsCopy";

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
  createdDatetime: string;
  editedDatetime: string;
}

export async function searchingStockAccountRecordList(data: IFinanceRecordSearchingParams) {
  return executeSQLsyntax({
    query: `
      SELECT stock_account_trade.*,
        (
        SELECT to_jsonb(stock_account_list.*) FROM stock_account_list
        WHERE stock_account_list.account_id = stock_account_trade.account_id AND stock_account_list.user_id = stock_account_trade.user_id
        ) AS account_data,

        (
        SELECT to_jsonb(currency_list.*) FROM currency_list WHERE currency_list.currency_code = stock_account_trade.currency
        ) AS currency_data,

        (
        SELECT to_jsonb(trade_category.*) FROM trade_category WHERE trade_category.trade_code = stock_account_trade.trade_category
        ) AS trade_category_data,

        (
        SELECT to_jsonb(transaction_category.*) FROM transaction_category WHERE transaction_category.transaction_code = stock_account_trade.transaction_type
        ) AS transaction_category_data

      FROM stock_account_trade
      WHERE stock_account_trade.currency LIKE '%${data.currencyId}%'
        AND stock_account_trade.account_id LIKE '%${data.accountId}%'
        AND stock_account_trade.user_id = '${data.userId}'
        AND stock_account_trade.trade_datetime BETWEEN '${data.startingDate}' AND '${data.endDate}'
      ORDER BY stock_account_trade.trade_datetime
    `,
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}

export async function getStockAccountRecordById(tradeId: string, accountId: string, userId: string) {
  return executeSQLsyntax({
    query: `
      SELECT * FROM public.stock_account_trade
      WHERE trade_id = '${tradeId}' AND account_id = '${accountId}' AND user_id = '${userId}'
    `,
    isReturnArray: false,
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}

export async function insertStockAccountRecord(data: IStockAccountRecordList) {
  // console.log("data:", data);
  data.tradeId = `ST-${data.currency}-${getCurrentTimestamp()}`;
  data.createdDatetime = `${setTimezone()}`;
  data.editedDatetime = `${setTimezone()}`;

  const dateDetectResult = await tradeDateTimeDetect(
    "stock_account_trade",
    "account_id",
    data.accountId,
    data.tradeId,
    data.tradeDatetime,
  );
  // console.log("dateDetectResult:", dateDetectResult);
  if (!dateDetectResult.success) {
    return { success: true, message: dateDetectResult.message, returnCode: -1 };
  }

  // const client = await pool.connect();
  // await client.query("BEGIN");

  const insertResult = await updateRelatedData(
    `INSERT INTO public.stock_account_trade(trade_id, account_id, user_id, trade_datetime, trade_category, transaction_type, stock_no, stock_name, price_per_share, quantity, stock_total_price, handling_fee, transaction_tax, trade_total_price, remaining_amount, currency, trade_description, trade_note, created_datetime, edited_datetime)
    VALUES ('ST-${data.currency}-${getCurrentTimestamp()}', '${data.accountId}', '${data.userId}', '${data.tradeDatetime}', '${data.tradeCategory}', '${data.transactionType}', '${data.stockNo}', '${data.stockName}', ${data.pricePerShare}, ${data.quantity}, ${data.stockTotalPrice}, ${data.handlingFee}, ${data.transactionTax}, ${data.stockTotalPrice + data.handlingFee + data.transactionTax}, ${0}, '${data.currency}', '${data.tradeDescription}', '${data.tradeNote}', '${data.createdDatetime}', '${data.editedDatetime}')`,
    [],
    false,
    "新增成功",
    "新增失敗",
    "stock_account_list",
    "account_id",
    data.accountId,
    "stock_account_trade",
    "trade_total_price",
  );

  ////////////////////////////////
  ////////////////////////////////
  ////////////////////////////////
  // await updateStockStorageQuantity(data);
  ////////////////////////////////
  ////////////////////////////////
  ////////////////////////////////

  if (insertResult.success === true) {
    return { success: true, message: "新增成功" };
  } else if (insertResult.success === false) {
    return { success: true, message: "新增失敗", returnCode: -1 };
  }
}

export async function updateStockAccountRecord(data: IStockAccountRecordList) {
  data.editedDatetime = `${setTimezone()}`;

  const dateDetectResult = await tradeDateTimeDetect(
    "stock_account_trade",
    "account_id",
    data.accountId,
    data.tradeId,
    data.tradeDatetime,
  );
  if (!dateDetectResult.success) {
    return { success: true, message: dateDetectResult.message, returnCode: -1 };
  }

  const updateResult = await updateRelatedData(
    `UPDATE public.stock_account_trade SET trade_datetime = '${data.tradeDatetime}', stock_no = '${data.stockNo}', stock_name = '${data.stockName}', price_per_share = ${data.pricePerShare}, quantity = ${data.quantity}, stock_total_price = ${data.stockTotalPrice}, handling_fee = ${data.handlingFee}, transaction_tax = ${data.transactionTax}, trade_total_price = ${data.stockTotalPrice + data.handlingFee + data.transactionTax}, trade_description = '${data.tradeDescription}', trade_note = '${data.tradeNote}', edited_datetime = '${data.editedDatetime}'
    WHERE trade_id = '${data.tradeId}' AND account_id = '${data.accountId}' AND user_id = '${data.userId}'`,
    [],
    false,
    "更新成功",
    "更新失敗",
    "stock_account_list",
    "account_id",
    data.accountId,
    "stock_account_trade",
    "trade_total_price",
  );

  ////////////////////////////////
  ////////////////////////////////
  ////////////////////////////////
  // await updateStockStorageQuantity(data);
  ////////////////////////////////
  ////////////////////////////////
  ////////////////////////////////

  if (updateResult.success === true) {
    return { success: true, message: "更新成功" };
  } else if (updateResult.success === false) {
    return { success: false, message: "更新失敗", returnCode: -1 };
  }
}

export async function removeStockAccountRecord(data: IStockAccountRecordList) {
  const deleteResult = await updateRelatedData(
    `DELETE FROM public.stock_account_trade WHERE trade_id = '${data.tradeId}' AND account_id = '${data.accountId}' AND user_id = '${data.userId}'`,
    [],
    false,
    "刪除成功",
    "刪除失敗",
    "stock_account_list",
    "account_id",
    data.accountId,
    "stock_account_trade",
    "trade_total_price",
  );

  if (deleteResult.success === true) {
    return { success: true, message: "刪除成功" };
  } else if (deleteResult.success === false) {
    return { success: true, message: "刪除失敗", returnCode: -1 };
  }
}
