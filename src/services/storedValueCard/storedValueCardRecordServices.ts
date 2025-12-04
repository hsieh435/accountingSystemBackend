import pool from "@/db";
import { executeSQLsyntax } from "@/services/servicesTools";
import { keysToCamel, getCurrentTimestamp } from "@/utils/tools";
import { tradeDateTimeDetect } from "@/services/recordServiceTools";

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

  const dateDetectResult = await tradeDateTimeDetect(
    "stored_value_card_list",
    "stored_value_card_trade",
    "stored_value_card_id",
    data.updateData.storedValueCardId,
    data.updateData.tradeDatetime,
  );


  // console.log("dateDetectResult:", dateDetectResult);
  // if (!dateDetectResult.success) return { success: false, message: dateDetectResult.message };
  if (!dateDetectResult.success) {
    return { success: false, message: dateDetectResult.message };
  } else if (dateDetectResult.success) {
    if (data.updateData.transactionType === "income") {
      data.updateData.remainingAmount = dateDetectResult.returnAmount + data.updateData.tradeAmount;
    } else if (data.updateData.transactionType === "expense") {
      data.updateData.remainingAmount = dateDetectResult.returnAmount - data.updateData.tradeAmount;
    }
  }


  try {
    const insertResult = await pool.query(`
      INSERT INTO public.stored_value_card_trade(trade_id, stored_value_card_id, user_id, trade_datetime, trade_category, transaction_type, trade_amount, remaining_amount, currency, trade_description, trade_note)
      VALUES ('SVC-${data.updateData.currency}-${getCurrentTimestamp()}', '${data.updateData.storedValueCardId}', '${data.userId}', '${data.updateData.tradeDatetime}', '${data.updateData.tradeCategory}', '${data.updateData.transactionType}', ${data.updateData.tradeAmount}, ${data.updateData.remainingAmount}, '${data.updateData.currency}', '${data.updateData.tradeDescription}', '${data.updateData.tradeNote}')
    `);

    return insertResult.rowCount === 1
      ? { success: true, userData: keysToCamel(insertResult.rows[0]) }
      : { success: false, userData: [] };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : String(err) };
  }
}

export async function updateStoredValueCardRecordData(data: IStoredValueCardRecordData) {
  const query = `
    UPDATE public.stored_value_card_trade SET trade_datetime = '${data.updateData.tradeDatetime}', trade_category = '${data.updateData.tradeCategory}', transaction_type = '${data.updateData.transactionType}', trade_amount  ${data.updateData.tradeAmount}, currency = '${data.updateData.currency}', trade_description = '${data.updateData.tradeDescription}', trade_note = '${data.updateData.tradeNote}'
    WHERE trade_id = '${data.updateData.tradeId}' AND stored_value_card_id = '${data.updateData.storedValueCardId}' AND user_id = '${data.userId}'`;

  return executeSQLsyntax({ query: query, isReturnArray: false, successMessage: "更新成功", errorMessage: "更新失敗" });
}


export async function removeStoredValueCardRecordById(data: {
  storedValueCardId: string;
  tradeId: string;
  userId: string;
}) {
  const query = `
    DELETE FROM public.stored_value_card_trade
    WHERE stored_value_card_id = '${data.storedValueCardId}' AND trade_id = '${data.tradeId}' AND user_id = '${data.userId}'`;

  return executeSQLsyntax({ query: query, isReturnArray: false, successMessage: "刪除成功", errorMessage: "刪除失敗" });
}
