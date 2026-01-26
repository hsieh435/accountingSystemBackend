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

export interface ICashFlowRecordList {
  tradeId: string;
  cashflowId: string;
  userId: string;
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

export interface ICashFlowRecordData {
  updateData: ICashFlowRecordList;
  oriData: IOriData;
  userId: string;
}

export async function searchingCashFlowRecordList(data: IFinanceRecordSearchingParams) {
  const query = `
    SELECT cashflow_trade.*,
      currency_list.currency_name,
      cashflow_list.cashflow_name,
      cashflow_list.enable,
      trade_category.trade_name,
      transaction_category.transaction_name
    FROM cashflow_trade
    LEFT JOIN currency_list ON cashflow_trade.currency = currency_list.currency_code
    LEFT JOIN cashflow_list ON cashflow_trade.cashflow_id = cashflow_list.cashflow_id
    LEFT JOIN trade_category ON cashflow_trade.trade_category = trade_category.trade_code
    LEFT JOIN transaction_category ON cashflow_trade.transaction_type = transaction_category.transaction_code
    WHERE cashflow_trade.user_id = $1
      AND cashflow_trade.cashflow_id LIKE $2
      AND cashflow_trade.currency LIKE $3
      AND cashflow_trade.trade_category LIKE $4
      AND trade_datetime BETWEEN $5 AND $6
    ORDER BY trade_datetime
  `;
  // ${data.startingDate && data.endDate ? `AND trade_datetime BETWEEN $5 AND $6` : ""}

  const params =
    [data.userId, `%${data.accountId}%`, `%${data.currencyId}%`, `%${data.tradeCategory}%`, data.startingDate, data.endDate];

  return executeSQLsyntax({ query: query, params: params, successMessage: "查詢成功", errorMessage: "查詢失敗" });
}

export async function searchingCashFlowRecordById(data: { cashflowId: string; tradeId: string; userId: string }) {
  return executeSQLsyntax({
    query: `SELECT * FROM public.cashflow_trade WHERE cashflow_id = $1 AND trade_id = $2 AND user_id = $3`,
    params: [data.cashflowId, data.tradeId, data.userId],
    isReturnArray: false,
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}

export async function insertCashFlowRecordData(data: ICashFlowRecordData) {
  // console.log("data:", data);
  data.updateData.tradeId = `CF-${data.updateData.currency}-${getCurrentTimestamp()}`;


  const dateDetectResult = await tradeDateTimeDetect(
    "cashflow_list",
    "cashflow_trade",
    "cashflow_id",
    data.updateData.cashflowId,
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
  //   query:
  //     `INSERT INTO public.cashflow_trade(trade_id, cashflow_id, user_id, trade_datetime, trade_category, transaction_type, trade_amount, remaining_amount, currency, trade_description, trade_note)
  //     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
  //   params: [
  //     data.updateData.tradeId,
  //     data.updateData.cashflowId,
  //     data.userId,
  //     data.updateData.tradeDatetime,
  //     data.updateData.tradeCategory,
  //     data.updateData.transactionType,
  //     data.updateData.tradeAmount,
  //     data.updateData.remainingAmount,
  //     data.updateData.currency,
  //     data.updateData.tradeDescription,
  //     data.updateData.tradeNote,
  //   ],
  //   isReturnArray: false,
  //   successMessage: "新增成功",
  //   errorMessage: "新增失敗"
  // });
  // if (insertResult.success === false) {
  //   return { success: true, message: insertResult.message, returnCode: -1 };
  // }

  const updateRelatedDataResult = await updateRelatedData(
    `INSERT INTO public.cashflow_trade(trade_id, cashflow_id, user_id, trade_datetime, trade_category, transaction_type, trade_amount, remaining_amount, currency, trade_description, trade_note)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      data.updateData.tradeId,
      data.updateData.cashflowId,
      data.userId,
      data.updateData.tradeDatetime,
      data.updateData.tradeCategory,
      data.updateData.transactionType,
      data.updateData.tradeAmount,
      data.updateData.remainingAmount,
      data.updateData.currency,
      data.updateData.tradeDescription,
      data.updateData.tradeNote,
    ],
    false,
    "新增成功",
    "新增失敗",
    "cashflow_list",
    "cashflow_trade",
    "cashflow_id",
    data.updateData.cashflowId,
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

export async function updateCashFlowRecordData(data: ICashFlowRecordData) {
  // console.log("data:", data);
  const dateDetectResult = await tradeDateTimeDetect(
    "cashflow_list",
    "cashflow_trade",
    "cashflow_id",
    data.updateData.cashflowId,
    data.updateData.tradeId,
    data.updateData.tradeDatetime,
    "update",
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

  // const updateResult = await executeSQLsyntax({
  //   query:
  //     `UPDATE public.cashflow_trade SET trade_datetime = $1, trade_category = $2, transaction_type = $3, trade_amount = $4, remaining_amount = $5, trade_description = $6, trade_note = $7 WHERE trade_id = $8 AND cashflow_id = $9 AND user_id = $10`,
  //   params: [
  //     data.updateData.tradeDatetime,
  //     data.updateData.tradeCategory,
  //     data.updateData.transactionType,
  //     data.updateData.tradeAmount,
  //     data.updateData.remainingAmount,
  //     data.updateData.tradeDescription,
  //     data.updateData.tradeNote,
  //     data.updateData.tradeId,
  //     data.updateData.cashflowId,
  //     data.userId,
  //   ],
  //   isReturnArray: false,
  //   successMessage: "更新成功",
  //   errorMessage: "更新失敗"
  // });
  // if (updateResult.success === false) {
  //   return { success: true, message: updateResult.message, returnCode: -1 };
  // }

  const updateRelatedDataResult = await updateRelatedData(
    `UPDATE public.cashflow_trade SET trade_datetime = $1, trade_category = $2, transaction_type = $3, trade_amount = $4, remaining_amount = $5, trade_description = $6, trade_note = $7 WHERE trade_id = $8 AND cashflow_id = $9 AND user_id = $10`,
    [
      data.updateData.tradeDatetime,
      data.updateData.tradeCategory,
      data.updateData.transactionType,
      data.updateData.tradeAmount,
      data.updateData.remainingAmount,
      data.updateData.tradeDescription,
      data.updateData.tradeNote,
      data.updateData.tradeId,
      data.updateData.cashflowId,
      data.userId,
    ],
    false,
    "更新成功",
    "更新失敗",
    "cashflow_list",
    "cashflow_trade",
    "cashflow_id",
    data.updateData.cashflowId,
    data.updateData.tradeDatetime,
    data.updateData.transactionType,
    data.oriData.oriTransactionType,
    data.updateData.tradeAmount,
    data.oriData.oriTradeAmount,
  );
  if (updateRelatedDataResult.success === true) {
    return { success: true, message: "更新成功" };
  } else if (updateRelatedDataResult.success === false) {
    return { success: true, message: "更新失敗", returnCode: -1 };
  }
}

export async function deleteCashFlowRecordData(data: ICashFlowRecordList) {
  // console.log("data:", data);

  const record = await searchingCashFlowRecordById({ cashflowId: data.cashflowId, tradeId: data.tradeId, userId: data.userId});
  // console.log("record:", record);

  // const deleteResult = await executeSQLsyntax({
  //   query: `DELETE FROM public.cashflow_trade WHERE trade_id = $1 AND cashflow_id = $2 AND user_id = $3`,
  //   params: [data.tradeId, data.cashflowId, data.userId],
  //   isReturnArray: false,
  //   successMessage: "刪除成功",
  //   errorMessage: "刪除失敗",
  // });
  // // console.log("deleteResult:", deleteResult);
  // if (deleteResult.success === false) {
  //   return { success: true, message: deleteResult.message, returnCode: -1 };
  // }

  const updateRelatedDataResult = await updateRelatedData(
    `DELETE FROM public.cashflow_trade WHERE trade_id = $1 AND cashflow_id = $2 AND user_id = $3`,
    [data.tradeId, data.cashflowId, data.userId],
    false,
    "刪除成功",
    "刪除失敗",
    "cashflow_list",
    "cashflow_trade",
    "cashflow_id",
    record.data.cashflowId,
    record.data.tradeDatetime,
    record.data.transactionType,
    record.data.transactionType,
    0,
    record.data.tradeAmount,
  );

  if (updateRelatedDataResult.success === true) {
    return { success: true, message: "刪除成功" };
  } else if (updateRelatedDataResult.success === false) {
    return { success: true, message: "刪除失敗", returnCode: -1 };
  }
}
