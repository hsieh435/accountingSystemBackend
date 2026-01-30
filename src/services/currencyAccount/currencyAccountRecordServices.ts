import { getCurrentTimestamp } from "@/utils/tools";
import { executeSQLsyntax } from "@/services/servicesTools";
import * as currencyAccountListServices from "@/services/currencyAccount/currencyAccountListServices";
import { tradeDateTimeDetect, updateRelatedData } from "@/services/recordServiceTools";

export interface IFinanceRecordSearchingParams {
  accountId: string;
  currencyId: string;
  tradeCategory: string;
  startingDate: string;
  endDate: string;
  userId: string;
}

export interface ICurrencyAccountRecordList {
  tradeId: string;
  accountId: string;
  userId: string;
  tradeDatetime: string;
  accountUser: string;
  accountType: string;
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

export interface ICurrencyAccountRecordData {
  updateData: ICurrencyAccountRecordList;
  oriData: IOriData;
  userId: string;
}



export async function searchingCurrencyAccountRecordList(data: IFinanceRecordSearchingParams) {
  const query = `
    SELECT currency_account_trade.*,
      currency_list.currency_name,
      currency_account_list.account_name,
      currency_account_list.enable,
      trade_category.trade_name,
      transaction_category.transaction_name
    FROM currency_account_trade
    LEFT JOIN currency_list ON currency_account_trade.currency = currency_list.currency_code
    LEFT JOIN currency_account_list ON currency_account_trade.account_id = currency_account_list.account_id
    LEFT JOIN trade_category ON currency_account_trade.trade_category = trade_category.trade_code
    LEFT JOIN transaction_category ON currency_account_trade.transaction_type = transaction_category.transaction_code
    WHERE currency_account_trade.currency LIKE $1
      AND currency_account_trade.account_id LIKE $2
      AND currency_account_trade.user_id = $3
      AND trade_datetime BETWEEN $4 AND $5
    ORDER BY trade_datetime
  `;

  return executeSQLsyntax({
    query: query,
    params: [`%${data.currencyId}%`, `%${data.accountId}%`, data.userId, data.startingDate, data.endDate],
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}



export async function getCurrencyAccountRecordById(data: { tradeId: string; accountId: string; userId: string }) {
  return executeSQLsyntax({
    query: "SELECT * FROM currency_account_trade WHERE trade_id = $1 AND account_id = $2 AND user_id = $3",
    params: [data.tradeId, data.accountId, data.userId],
    isReturnArray: false,
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}



export async function insertCurrencyAccountRecord(data: ICurrencyAccountRecordData) {
  // console.log("data:", data);
  data.updateData.tradeId = `CA-${data.updateData.currency}-${getCurrentTimestamp()}`;
  const dateDetectResult = await tradeDateTimeDetect(
    "currency_account_list",
    "currency_account_trade",
    "account_id",
    data.updateData.accountId,
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



  const insertResult = await updateRelatedData(
    `INSERT INTO public.currency_account_trade(trade_id, account_id, trade_datetime, user_id, trade_category, transaction_type, trade_amount, remaining_amount, currency, trade_description, trade_note)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      data.updateData.tradeId,
      data.updateData.accountId,
      data.updateData.tradeDatetime,
      data.userId,
      data.updateData.tradeCategory,
      data.updateData.transactionType,
      data.updateData.tradeAmount,
      data.updateData.remainingAmount,
      data.updateData.currency,
      data.updateData.tradeDescription,
      data.updateData.tradeNote,
    ],
    false,
    "",
    "新增失敗",
    "currency_account_list",
    "currency_account_trade",
    "account_id",
    data.updateData.accountId,
    data.updateData.tradeDatetime,
    data.updateData.transactionType,
    data.oriData.oriTransactionType,
    data.updateData.tradeAmount,
    data.oriData.oriTradeAmount,
  );
  if (insertResult.success === true) {
    return { success: true, message: "新增成功" };
  } else if (insertResult.success === false) {
    return { success: true, message: "新增失敗", returnCode: -1 };
  }
}




export async function updateCurrencyAccountRecord(data: ICurrencyAccountRecordData) {

  const dateDetectResult = await tradeDateTimeDetect(
    "currency_account_list",
    "currency_account_trade",
    "account_id",
    data.updateData.accountId,
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



  const updateResult = await updateRelatedData(
    `UPDATE public.currency_account_trade SET trade_datetime = $1, trade_category = $2, transaction_type = $3, trade_amount = $4, currency = $5, trade_description = $6, trade_note = $7
    WHERE trade_id = $8 AND account_id = $9 AND user_id = $10`,
    [
      data.updateData.tradeDatetime,
      data.updateData.tradeCategory,
      data.updateData.transactionType,
      data.updateData.tradeAmount,
      data.updateData.currency,
      data.updateData.tradeDescription,
      data.updateData.tradeNote,
      data.updateData.tradeId,
      data.updateData.accountId,
      data.userId,
    ],
    false,
    "更新成功",
    "更新失敗",
    "currency_account_list",
    "currency_account_trade",
    "account_id",
    data.updateData.accountId,
    data.updateData.tradeDatetime,
    data.updateData.transactionType,
    data.oriData.oriTransactionType,
    data.updateData.tradeAmount,
    data.oriData.oriTradeAmount,
  );
  if (updateResult.success === true) {
    return { success: true, message: "更新成功" };
  } else if (updateResult.success === false) {
    return { success: true, message: "更新失敗", returnCode: -1 };
  }
}



export async function removeCurrencyAccountRecord(data: ICurrencyAccountRecordList) {
  const record = await getCurrencyAccountRecordById({ accountId: data.accountId, tradeId: data.tradeId, userId: data.userId});

  const deleteResult = await updateRelatedData(
    `DELETE FROM public.currency_account_trade WHERE trade_id = $1 AND account_id = $2 AND user_id = $3`,
    [data.tradeId, data.accountId, data.userId],
    false,
    "刪除成功",
    "刪除失敗",
    "currency_account_list",
    "currency_account_trade",
    "account_id",
    record.data.accountId,
    record.data.tradeDatetime,
    record.data.transactionType,
    record.data.transactionType,
    0,
    record.data.tradeAmount,
  );

  if (deleteResult.success === true) {
    return { success: true, message: "刪除成功" };
  } else if (deleteResult.success === false) {
    return { success: true, message: "刪除失敗", returnCode: -1 };
  }
}
