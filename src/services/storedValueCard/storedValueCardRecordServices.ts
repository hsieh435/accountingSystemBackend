import pool from "@/db";
import { executeSQLsyntax } from "@/services/servicesTools";
import { getCurrentTimestamp } from "@/utils/tools";
import { tradeDateTimeDetect, updateRelatedData } from "@/services/recordServiceTools";

export interface IFinanceRecordSearchingParams {
  accountId: string;
  currencyId: string;
  tradeCategory: string;
  startingDate: string;
  endDate: string;
  userId: string;
}

export interface IStoredValueCardRecordList {
  tradeId: string;
  storedValueCardId: string;
  userId: string;
  accountType: string;
  tradeDatetime: string;
  transactionType: string;
  tradeCategory: string;
  tradeAmount: number;
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

export interface IStoredValueCardRecordData {
  updateData: IStoredValueCardRecordList;
  oriData: IOriData;
  userId: string;
}

export async function searchingStoredValueCardRecordList(data: IFinanceRecordSearchingParams) {
  const query = `
    SELECT stored_value_card_trade.*,
      currency_list.currency_name,
      stored_value_card_list.stored_value_card_name,
      stored_value_card_list.enable,
      trade_category.trade_name,
      transaction_category.transaction_name
    FROM stored_value_card_trade
    LEFT JOIN currency_list ON stored_value_card_trade.currency = currency_list.currency_code
    LEFT JOIN stored_value_card_list ON stored_value_card_trade.stored_value_card_id = stored_value_card_list.stored_value_card_id
    LEFT JOIN trade_category ON stored_value_card_trade.trade_category = trade_category.trade_code
    LEFT JOIN transaction_category ON stored_value_card_trade.transaction_type = transaction_category.transaction_code
    WHERE stored_value_card_trade.user_id = '${data.userId}'
    AND stored_value_card_trade.stored_value_card_id LIKE '%${data.accountId}%'
    AND stored_value_card_trade.currency LIKE '%${data.currencyId}%'
    AND trade_datetime BETWEEN '${data.startingDate}' AND '${data.endDate}' ORDER BY trade_datetime`;

  return executeSQLsyntax({ query: query, successMessage: "查詢成功", errorMessage: "查詢失敗" });
}

export async function searchingStoredValueCardRecordById(data: {
  storedValueCardId: string;
  tradeId: string;
  userId: string;
}) {
  const query = `
    SELECT * FROM public.stored_value_card_trade
    WHERE stored_value_card_id = '${data.storedValueCardId}' AND trade_id = '${data.tradeId}' AND user_id = '${data.userId}'`;

  return executeSQLsyntax({ query: query, isReturnArray: false, successMessage: "查詢成功", errorMessage: "查詢失敗" });
}

export async function insertStoredValueCardRecord(data: IStoredValueCardRecordData) {
  data.updateData.tradeId = `SVC-${data.updateData.currency}-${getCurrentTimestamp()}`;

  const dateDetectResult = await tradeDateTimeDetect(
    "stored_value_card_list",
    "stored_value_card_trade",
    "stored_value_card_id",
    data.updateData.storedValueCardId,
    data.updateData.tradeId,
    data.updateData.tradeDatetime,
    "insert",
  );

  // console.log("dateDetectResult:", dateDetectResult);
  if (!dateDetectResult.success) {
    return { success: true, message: dateDetectResult.message, returnCode: -1 };
  } else if (dateDetectResult.success) {
    if (data.updateData.transactionType === "income") {
      data.updateData.remainingAmount = dateDetectResult.returnAmount + data.updateData.tradeAmount;
    } else if (data.updateData.transactionType === "expense") {
      data.updateData.remainingAmount = dateDetectResult.returnAmount - data.updateData.tradeAmount;
    }
  }



  // const insertResult = await executeSQLsyntax({
  //   query: `
  //     INSERT INTO public.stored_value_card_trade(trade_id, stored_value_card_id, user_id, trade_datetime, trade_category, transaction_type, trade_amount, remaining_amount, currency, trade_description, trade_note)
  //     VALUES ('${data.updateData.tradeId}', '${data.updateData.storedValueCardId}', '${data.userId}', '${data.updateData.tradeDatetime}', '${data.updateData.tradeCategory}', '${data.updateData.transactionType}', ${data.updateData.tradeAmount}, ${data.updateData.remainingAmount}, '${data.updateData.currency}', '${data.updateData.tradeDescription}', '${data.updateData.tradeNote}')
  //   `,
  //   isReturnArray: false,
  //   successMessage: "新增成功",
  //   errorMessage: "新增失敗",
  // });
  // if (insertResult.success === false) {
  //   return { success: true, message: insertResult.message, returnCode: -1 };
  // }



  const updateRelatedDataResult = await updateRelatedData(
    `INSERT INTO public.stored_value_card_trade(trade_id, stored_value_card_id, user_id, trade_datetime, trade_category, transaction_type, trade_amount, remaining_amount, currency, trade_description, trade_note)
    VALUES ('${data.updateData.tradeId}', '${data.updateData.storedValueCardId}', '${data.userId}', '${data.updateData.tradeDatetime}', '${data.updateData.tradeCategory}', '${data.updateData.transactionType}', ${data.updateData.tradeAmount}, ${data.updateData.remainingAmount}, '${data.updateData.currency}', '${data.updateData.tradeDescription}', '${data.updateData.tradeNote}')`,
    [],
    false,
    "新增成功",
    "新增失敗",
    "stored_value_card_list",
    "stored_value_card_trade",
    "stored_value_card_id",
    data.updateData.storedValueCardId,
    data.updateData.tradeDatetime,
    data.updateData.transactionType,
    data.oriData.oriTransactionType,
    data.updateData.tradeAmount,
    data.oriData.oriTradeAmount,
  );
  if (updateRelatedDataResult.success === true) {
    return { success: true, message: "新增成功" };
  } else if (updateRelatedDataResult.success === false) {
    return { success: true, message: "新增失敗", returnCode: -1 };
  }
}

export async function updateStoredValueCardRecordData(data: IStoredValueCardRecordData) {

  const dateDetectResult = await tradeDateTimeDetect(
    "stored_value_card_list",
    "stored_value_card_trade",
    "stored_value_card_id",
    data.updateData.storedValueCardId,
    data.updateData.tradeId,
    data.updateData.tradeDatetime,
    "update",
  );

  // console.log("dateDetectResult:", dateDetectResult);
  if (!dateDetectResult.success) {
    return { success: false, message: dateDetectResult.message };
  } else if (dateDetectResult.success) {
    if (data.updateData.transactionType === "income") {
      data.updateData.remainingAmount = dateDetectResult.returnAmount + data.updateData.tradeAmount;
    } else if (data.updateData.transactionType === "expense") {
      data.updateData.remainingAmount = dateDetectResult.returnAmount - data.updateData.tradeAmount;
    }
  }

  const updateRelatedDataResult = await updateRelatedData(
    `UPDATE public.stored_value_card_trade SET trade_datetime = $1, trade_category = $2, transaction_type = $3, trade_amount = $4, remaining_amount = $5, trade_description = $6, trade_note = $7
    WHERE trade_id = $8 AND stored_value_card_id = $9 AND user_id = $10`,
    [
      data.updateData.tradeDatetime,
      data.updateData.tradeCategory,
      data.updateData.transactionType,
      data.updateData.tradeAmount,
      data.updateData.remainingAmount,
      data.updateData.tradeDescription,
      data.updateData.tradeNote,
      data.updateData.tradeId,
      data.updateData.storedValueCardId,
      data.userId,
    ],
    false,
    "更新成功",
    "更新失敗",
    "stored_value_card_list",
    "stored_value_card_trade",
    "stored_value_card_id",
    data.updateData.storedValueCardId,
    data.updateData.tradeDatetime,
    data.updateData.transactionType,
    data.oriData.oriTransactionType,
    data.updateData.tradeAmount,
    data.oriData.oriTradeAmount,
  );

  if (updateRelatedDataResult.success === true) {
    return { success: true, message: "新增成功" };
  } else if (updateRelatedDataResult.success === false) {
    return { success: true, message: "新增失敗", returnCode: -1 };
  }
}

export async function removeStoredValueCardRecordById(data: IStoredValueCardRecordList) {
  // const query = `
  //   DELETE FROM public.stored_value_card_trade
  //   WHERE stored_value_card_id = '${data.storedValueCardId}' AND trade_id = '${data.tradeId}' AND user_id = '${data.userId}'`;

  // return executeSQLsyntax({ query: query, isReturnArray: false, successMessage: "刪除成功", errorMessage: "刪除失敗" });

  const record = await searchingStoredValueCardRecordList({
    accountId: data.storedValueCardId,
    currencyId: data.currency,
    tradeCategory: "",
    startingDate: "1970-01-01 00:00:00",
    endDate: "2100-12-31 23:59:59",
    userId: data.userId,
  });

  const updateRelatedDataResult = await updateRelatedData(
    `DELETE FROM public.stored_value_card_trade WHERE stored_value_card_id = $1 AND trade_id = $2 AND user_id = $3`,
    [data.storedValueCardId, data.tradeId, data.userId],
    false,
    "刪除成功",
    "刪除失敗",
    "stored_value_card_list",
    "stored_value_card_trade",
    "stored_value_card_id",
    record.data.storedValueCardId,
    record.data.tradeDatetime,
    record.data.transactionType,
    record.data.oriTransactionType,
    0,
    record.data.tradeAmount,
  );

  if (updateRelatedDataResult.success === true) {
    return { success: true, message: "新增成功" };
  } else if (updateRelatedDataResult.success === false) {
    return { success: true, message: "新增失敗", returnCode: -1 };
  }
}
