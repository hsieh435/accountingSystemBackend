import { executeSQLsyntax } from "@/services/servicesTools";
import { getCurrentTimestamp, getTimeStampWithZone } from "@/utils/tools";
import { type IFinanceRecordSearchingParams, tradeDateTimeDetect, updateRelatedData } from "@/services/recordServiceTools";

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

export interface IOriData {
  oriTradeDatetime: string;
  oriTradeAmount: number;
  oriRemainingAmount: number;
  oriTransactionType: string;
}

export interface IStockAccountRecordData {
  updateData: IStockAccountRecordList;
  oriData: IOriData;
  userId: string;
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
    errorMessage: "查詢失敗"
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
    errorMessage: "查詢失敗"
  });
}

export async function insertStockAccountRecord(data: IStockAccountRecordData) {
  // console.log("data:", data);
  data.updateData.tradeId = `ST-${data.updateData.currency}-${getCurrentTimestamp()}`;
  data.updateData.createdDatetime = `${getTimeStampWithZone()}`;
  data.updateData.editedDatetime = `${getTimeStampWithZone()}`;

  const dateDetectResult = await tradeDateTimeDetect(
    "stock_account_list",
    "stock_account_trade",
    "account_id",
    data.updateData.accountId,
    data.updateData.tradeId,
    data.updateData.tradeDatetime,
  );
  // console.log("dateDetectResult:", dateDetectResult);
  if (!dateDetectResult.success) {
    return { success: true, message: dateDetectResult.message, returnCode: -1 };
  } else if (dateDetectResult.success) {
    if (data.updateData.transactionType === "income") {
      data.updateData.remainingAmount = dateDetectResult.returnAmount + data.updateData.tradeTotalPrice;
    } else if (data.updateData.transactionType === "expense") {
      data.updateData.remainingAmount = dateDetectResult.returnAmount - data.updateData.tradeTotalPrice;
    }
  }

  const insertResult = await updateRelatedData(
    `INSERT INTO public.stock_account_trade(trade_id, account_id, user_id, trade_datetime, trade_category, transaction_type, stock_no, stock_name, price_per_share, quantity, stock_total_price, handling_fee, transaction_tax, trade_total_price, remaining_amount, currency, trade_description, trade_note, created_datetime, edited_datetime)
    VALUES ('ST-${data.updateData.currency}-${getCurrentTimestamp()}', ${data.updateData.accountId}, '${data.userId}', '${data.updateData.tradeDatetime}', '${data.updateData.tradeCategory}', '${data.updateData.transactionType}', '${data.updateData.stockNo}', '${data.updateData.stockName}', ${data.updateData.pricePerShare}, ${data.updateData.quantity}, ${data.updateData.stockTotalPrice}, ${data.updateData.handlingFee}, ${data.updateData.transactionTax}, ${data.updateData.tradeTotalPrice}, ${data.updateData.remainingAmount}, '${data.updateData.currency}', '${data.updateData.tradeDescription}', '${data.updateData.tradeNote}', '${data.updateData.createdDatetime}', '${data.updateData.editedDatetime}')`,
    [],
    false,
    "新增成功",
    "新增失敗",
    "stock_account_list",
    "stock_account_trade",
    "account_id",
    data.updateData.accountId,
    data.updateData.tradeDatetime,
    data.updateData.transactionType,
    data.oriData.oriTransactionType,
    data.updateData.tradeTotalPrice,
    data.oriData.oriTradeAmount,
  );

  // await updateStockStorageQuantity(data);

  if (insertResult.success === true) {
    return { success: true, message: "新增成功" };
  } else if (insertResult.success === false) {
    return { success: true, message: "新增失敗", returnCode: -1 };
  }
}

export async function updateStockAccountRecord(data: IStockAccountRecordData) {
  data.updateData.editedDatetime = `${getTimeStampWithZone()}`;

  const dateDetectResult = await tradeDateTimeDetect(
    "stock_account_list",
    "stock_account_trade",
    "account_id",
    data.updateData.accountId,
    data.updateData.tradeId,
    data.updateData.tradeDatetime,
  );
  if (!dateDetectResult.success) {
    return { success: true, message: dateDetectResult.message, returnCode: -1 };
  } else if (dateDetectResult.success) {
    if (data.updateData.transactionType === "income") {
      data.updateData.remainingAmount = dateDetectResult.returnAmount + data.updateData.tradeTotalPrice;
    } else if (data.updateData.transactionType === "expense") {
      data.updateData.remainingAmount = dateDetectResult.returnAmount - data.updateData.tradeTotalPrice;
    }
  }



  const updateResult = await updateRelatedData(
    `UPDATE public.stock_account_trade SET trade_datetime = '${data.updateData.tradeDatetime}', stock_no = '${data.updateData.stockNo}', stock_name = '${data.updateData.stockName}', price_per_share = ${data.updateData.pricePerShare}, quantity = ${data.updateData.quantity}, stock_total_price = ${data.updateData.stockTotalPrice}, handling_fee = ${data.updateData.handlingFee}, transaction_tax = ${data.updateData.transactionTax}, trade_total_price = ${data.updateData.tradeTotalPrice}, trade_description = '${data.updateData.tradeDescription}', trade_note = '${data.updateData.tradeNote}', edited_datetime = '${data.updateData.editedDatetime}'
    WHERE trade_id = '${data.updateData.tradeId}' AND account_id = '${data.updateData.accountId}' AND user_id = '${data.userId}'`,
    [],
    false,
    "更新成功",
    "更新失敗",
    "stock_account_list",
    "stock_account_trade",
    "account_id",
    data.updateData.accountId,
    data.updateData.tradeDatetime,
    data.updateData.transactionType,
    data.oriData.oriTransactionType,
    data.updateData.tradeTotalPrice,
    data.oriData.oriTradeAmount,
  );

  // await updateStockStorageQuantity(data);

  if (updateResult.success === true) {
    return { success: true, message: "更新成功" };
  } else if (updateResult.success === false) {
    return { success: true, message: "更新失敗", returnCode: -1 };
  }
}

export async function removeStockAccountRecord(data: IStockAccountRecordList) {
  const record = await getStockAccountRecordById(data.tradeId, data.accountId, data.userId);

  const deleteResult = await updateRelatedData(
    `DELETE FROM public.stock_account_trade WHERE trade_id = '${data.tradeId}' AND account_id = '${data.accountId}' AND user_id = '${data.userId}'`,
    [],
    false,
    "刪除成功",
    "刪除失敗",
    "stock_account_list",
    "stock_account_trade",
    "account_id",
    record.data.accountId,
    record.data.tradeDatetime,
    record.data.transactionType,
    record.data.transactionType,
    0,
    record.data.tradeTotalPrice,
  );

  if (deleteResult.success === true) {
    return { success: true, message: "刪除成功" };
  } else if (deleteResult.success === false) {
    return { success: true, message: "刪除失敗", returnCode: -1 };
  }
}
