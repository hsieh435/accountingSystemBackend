import { getCurrentTimestamp, getTimeStampWithZone } from "@/utils/tools";
import { executeSQLsyntax } from "@/services/servicesTools";
import { type IFinanceRecordSearchingParams, tradeDateTimeDetect, updateRelatedData } from "@/services/recordServiceTools";

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
  createdDatetime: string;
  editedDatetime: string;
}



export async function searchingStoredValueCardRecordList(data: IFinanceRecordSearchingParams) {

  return executeSQLsyntax({
    query: `
      SELECT stored_value_card_trade.*,
      (
      SELECT to_jsonb(stored_value_card_list.*) FROM stored_value_card_list
      WHERE stored_value_card_list.stored_value_card_id = stored_value_card_trade.stored_value_card_id AND stored_value_card_list.user_id = stored_value_card_trade.user_id
      ) AS stored_value_card_data,

      (
        SELECT to_jsonb(currency_list.*) FROM currency_list WHERE currency_list.currency_code = stored_value_card_trade.currency
      ) AS currency_data,

      (
      SELECT to_jsonb(trade_category.*) FROM trade_category WHERE trade_category.trade_code = stored_value_card_trade.trade_category
      ) AS trade_category_data,

      (
      SELECT to_jsonb(transaction_category.*) FROM transaction_category WHERE transaction_category.transaction_code = stored_value_card_trade.transaction_type
      ) AS transaction_category_data

    FROM stored_value_card_trade

    WHERE stored_value_card_trade.user_id = '${data.userId}'
      AND stored_value_card_trade.stored_value_card_id LIKE '%${data.accountId}%'
      AND stored_value_card_trade.currency LIKE '%${data.currencyId}%'
      AND trade_datetime BETWEEN '${data.startingDate}' AND '${data.endDate}'
    ORDER BY trade_datetime`,
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}

export async function searchingStoredValueCardRecordById(data: {
  storedValueCardId: string;
  tradeId: string;
  userId: string;
}) {
  return executeSQLsyntax({
    query: `
      SELECT * FROM public.stored_value_card_trade
      WHERE stored_value_card_id = '${data.storedValueCardId}' AND trade_id = '${data.tradeId}' AND user_id = '${data.userId}'`,
    isReturnArray: false,
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}

export async function insertStoredValueCardRecord(data: IStoredValueCardRecordList) {
  data.tradeId = `SVC-${data.currency}-${getCurrentTimestamp()}`;
  data.createdDatetime = `${getTimeStampWithZone()}`;
  data.editedDatetime = `${getTimeStampWithZone()}`;

  const dateDetectResult = await tradeDateTimeDetect(
    "stored_value_card_trade",
    "stored_value_card_id",
    data.storedValueCardId,
    data.tradeId,
    data.tradeDatetime,
  );

  // console.log("dateDetectResult:", dateDetectResult);
  if (!dateDetectResult.success) {
    return { success: true, message: dateDetectResult.message, returnCode: -1 };
  }



  const insertResult = await updateRelatedData(
    `INSERT INTO public.stored_value_card_trade(trade_id, stored_value_card_id, user_id, trade_datetime, trade_category, transaction_type, trade_amount, remaining_amount, currency, trade_description, trade_note, created_datetime, edited_datetime)
    VALUES ('${data.tradeId}', '${data.storedValueCardId}', '${data.userId}', '${data.tradeDatetime}', '${data.tradeCategory}', '${data.transactionType}', ${data.tradeAmount}, ${0}, '${data.currency}', '${data.tradeDescription}', '${data.tradeNote}', '${data.createdDatetime}', '${data.editedDatetime}')`,
    [],
    false,
    "新增成功",
    "新增失敗",
    "stored_value_card_list",
    "stored_value_card_id",
    data.storedValueCardId,
    "stored_value_card_trade",
    "trade_amount",
  );
  if (insertResult.success === true) {
    return { success: true, message: "新增成功" };
  } else if (insertResult.success === false) {
    return insertResult;
  }
}

export async function updateStoredValueCardRecordData(data: IStoredValueCardRecordList) {
  data.editedDatetime = `${getTimeStampWithZone()}`;

  const dateDetectResult = await tradeDateTimeDetect(
    "stored_value_card_trade",
    "stored_value_card_id",
    data.storedValueCardId,
    data.tradeId,
    data.tradeDatetime,
  );

  // console.log("dateDetectResult:", dateDetectResult);
  if (!dateDetectResult.success) {
    return { success: false, message: dateDetectResult.message };
  }

  const updateResult = await updateRelatedData(
    `UPDATE public.stored_value_card_trade SET trade_datetime = $1, trade_category = $2, transaction_type = $3, trade_amount = $4, trade_description = $5, trade_note = $6, edited_datetime = $7
    WHERE trade_id = $8 AND stored_value_card_id = $9 AND user_id = $10`,
    [
      data.tradeDatetime,
      data.tradeCategory,
      data.transactionType,
      data.tradeAmount,
      data.tradeDescription,
      data.tradeNote,
      data.editedDatetime,
      data.tradeId,
      data.storedValueCardId,
      data.userId,
    ],
    false,
    "更新成功",
    "更新失敗",
    "stored_value_card_list",
    "stored_value_card_id",
    data.storedValueCardId,
    "stored_value_card_trade",
    "trade_amount",
  );
  if (updateResult.success === true) {
    return { success: true, message: "更新成功" };
  } else if (updateResult.success === false) {
    return updateResult;
  }
}

export async function removeStoredValueCardRecordById(data: IStoredValueCardRecordList) {

  const deleteResult = await updateRelatedData(
    `DELETE FROM public.stored_value_card_trade WHERE stored_value_card_id = $1 AND trade_id = $2 AND user_id = $3`,
    [data.storedValueCardId, data.tradeId, data.userId],
    false,
    "刪除成功",
    "刪除失敗",
    "stored_value_card_list",
    "stored_value_card_id",
    data.storedValueCardId,
    "stored_value_card_trade",
    "trade_amount",
  );

  if (deleteResult.success === true) {
    return { success: true, message: "刪除成功" };
  } else if (deleteResult.success === false) {
    return deleteResult;
  }
}
