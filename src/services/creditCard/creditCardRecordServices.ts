import pool from "@/db";
import { getCurrentTimestamp } from "@/utils/tools";
import { executeSQLsyntax } from "@/services/servicesTools";
import { tradeDateTimeDetect } from "@/services/recordServiceTools";


export interface IFinanceRecordSearchingParams {
  accountId: string;
  currencyId: string;
  tradeCategory: string;
  startingDate: string;
  endDate: string;
  userId: string;
}

export interface ICreditCardRecordList {
  tradeId: string;
  userId: string;
  creditCardId: string;
  tradeDatetime: string;
  accountType: string;
  tradeCategory: string;
  tradeAmount: number;
  currency: string;
  remainingAmount: number;
  billMonth: string;
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

export interface ICreditCardTradeData {
  updateData: ICreditCardRecordList;
  oriData: IOriData;
  userId: string;
}

export async function searchingCreditCardRecordList(data: IFinanceRecordSearchingParams) {
  const query = `
    SELECT creditcard_trade.*,
      (
      SELECT to_jsonb(creditcard_list.*) FROM creditcard_list
      WHERE creditcard_list.creditcard_id = creditcard_trade.credit_card_id AND creditcard_list.user_id = creditcard_trade.user_id
      ) AS creditcard_data,

      (
      SELECT to_jsonb(currency_list.*) FROM currency_list WHERE currency_list.currency_code = creditcard_trade.currency
      ) AS currency_data,

      (
      SELECT to_jsonb(trade_category.*) FROM trade_category WHERE trade_category.trade_code = creditcard_trade.trade_category
      ) AS trade_category_data

    FROM creditcard_trade
    WHERE creditcard_trade.credit_card_id LIKE '%${data.accountId}%'
      AND creditcard_trade.currency LIKE '%${data.currencyId}%'
      AND creditcard_trade.user_id = '${data.userId}'
      AND creditcard_trade.trade_datetime BETWEEN '${data.startingDate}' AND '${data.endDate}'
    ORDER BY trade_datetime`;

  return executeSQLsyntax({ query: query, successMessage: "查詢成功", errorMessage: "查詢失敗" });
}

export async function getCreditCardRecordById(tradeId: string, creditCardId: string, userId: string) {
  const query = `
    SELECT * FROM creditcard_trade
    WHERE trade_id = '${tradeId}' AND credit_card_id = '${creditCardId}' AND user_id = '${userId}'
  `;

  return executeSQLsyntax({ query: query, isReturnArray: false, successMessage: "查詢成功", errorMessage: "查詢失敗" });
}

export async function insertCreditCardRecordData(data: ICreditCardTradeData) {
  data.updateData.tradeId = `CC-${data.updateData.currency}-${getCurrentTimestamp()}`;
  data.updateData.createdDatetime = `${getCurrentTimestamp()}`;
  data.updateData.editedDatetime = `${getCurrentTimestamp()}`;

  const dateDetectResult = await tradeDateTimeDetect(
    "creditcard_list",
    "creditcard_trade",
    "credit_card_id",
    data.updateData.creditCardId,
    data.updateData.tradeId,
    data.updateData.tradeDatetime,
    "insert",
  );
  console.log("dateDetectResult:", dateDetectResult);
  if (!dateDetectResult.success) {
    return { success: true, message: dateDetectResult.message, returnCode: -1 };
  }


  const client = await pool.connect();
  await client.query("BEGIN");

  const insertResult = await executeSQLsyntax({
    query:
      `INSERT INTO public.creditcard_trade(trade_id, credit_card_id, user_id, trade_datetime, trade_category, transaction_type, trade_amount, remaining_amount, currency, trade_description, trade_note, created_datetime, edited_datetime)
      VALUES ('${data.updateData.tradeId}', '${data.updateData.creditCardId}', '${data.updateData.userId}', '${data.updateData.tradeDatetime}', '${data.updateData.tradeCategory}', ${data.updateData.tradeAmount}, ${data.updateData.remainingAmount}, '${data.updateData.currency}', '${data.updateData.billMonth}', '${data.updateData.tradeDescription}', '${data.updateData.tradeNote}', '${data.updateData.createdDatetime}', '${data.updateData.editedDatetime}')`,
    successMessage: "",
    errorMessage: "新增失敗"
  });
  if (!insertResult.success) {
    await client.query("ROLLBACK");
    return { success: true, message: insertResult.message, returnCode: -1 };
  }

  await client.query("COMMIT");
  return { success: true, message: "新增成功", returnCode: 0 };

  // try {

    // const insertResult = await pool.query(`
    //   INSERT INTO public.creditcard_trade(trade_id, credit_card_id, user_id, trade_datetime, trade_category, transaction_type, trade_amount, remaining_amount, currency, trade_description, trade_note)
    //   VALUES ('${data.updateData.tradeId}', '${data.updateData.creditCardId}', '${data.updateData.userId}', '${data.updateData.tradeDatetime}', '${data.updateData.tradeCategory}', ${data.updateData.tradeAmount}, ${data.updateData.remainingAmount}, '${data.updateData.currency}', '${data.updateData.billMonth}', '${data.updateData.tradeDescription}', '${data.updateData.tradeNote}')
    // `);
    // console.log("insertResult:", insertResult);

    // if (insertResult.rowCount === 1) {
    //   return { success: true, userData: insertResult.rows[0] };
    // } else {
    //   return { success: false, userData: [] };
    // }
  // } catch (err) {
  //   return { success: false, message: err instanceof Error ? err.message : String(err) };
  // }

  // await client.query("ROLLBACK");
  // await client.query("COMMIT");
}

export async function updateCreditCardData(data: ICreditCardTradeData) {
  // console.log("data:", data);
  data.updateData.editedDatetime = `${getCurrentTimestamp()}`;

  const dateDetectResult = await tradeDateTimeDetect(
    "creditcard_list",
    "creditcard_trade",
    "credit_card_id",
    data.updateData.creditCardId,
    data.updateData.tradeId,
    data.updateData.tradeDatetime,
    "insert",
  );
  console.log("dateDetectResult:", dateDetectResult);
  if (!dateDetectResult.success) {
    return { success: true, message: dateDetectResult.message, returnCode: -1 };
  }



  const client = await pool.connect();
  await client.query("BEGIN");

  const updateResult = await executeSQLsyntax({
    query:
      `UPDATE public.creditcard_trade SET trade_datetime = '${data.updateData.tradeDatetime}', trade_category = '${data.updateData.tradeCategory}', trade_amount = ${data.updateData.tradeAmount}, currency = '${data.updateData.currency}', bill_month = '${data.updateData.billMonth}', trade_description = '${data.updateData.tradeDescription}', trade_note = '${data.updateData.tradeNote}', edited_datetime = '${data.updateData.editedDatetime}'
      WHERE trade_id = '${data.updateData.tradeId}' AND credit_card_id = '${data.updateData.creditCardId}' AND user_id = '${data.updateData.userId}'`,
    successMessage: "",
    errorMessage: "更新失敗"
  });
  if (!updateResult.success) {
    await client.query("ROLLBACK");
    return { success: true, message: updateResult.message, returnCode: -1 };
  }

  await client.query("COMMIT");
  return { success: true, message: "更新成功", returnCode: 0 };



  // const updateResult = await pool.query(`
  //   UPDATE public.creditcard_trade SET trade_datetime = '${data.updateData.tradeDatetime}', trade_category = '${data.updateData.tradeCategory}', trade_amount = ${data.updateData.tradeAmount}, currency = '${data.updateData.currency}', bill_month = '${data.updateData.billMonth}', trade_description = '${data.updateData.tradeDescription}', trade_note = '${data.updateData.tradeNote}'
  //   WHERE trade_id = '${data.updateData.tradeId}' AND credit_card_id = '${data.updateData.creditCardId}' AND user_id = '${data.updateData.userId}'
  // `);
  // return updateResult.rowCount === 1;
}

export async function removeCreditCardRecordData(data: { tradeId: string; creditCardId: string; userId: string }) {
  const record = await getCreditCardRecordById(data.tradeId, data.creditCardId, data.userId);


  const client = await pool.connect();
  await client.query("BEGIN");

  const deleteResult = await executeSQLsyntax({
    query:
      `DELETE FROM public.creditcard_trade
      WHERE trade_id = '${data.tradeId}' AND credit_card_id = '${data.creditCardId}' AND user_id = '${data.userId}'`,
    successMessage: "",
    errorMessage: "刪除失敗"
  });

  if (!deleteResult.success) {
    await client.query("ROLLBACK");
    return { success: true, message: "刪除失敗", returnCode: -1 };
  }

  await client.query("COMMIT");
  return { success: true, message: "刪除成功", returnCode: 0 };



  // const deleteResult = await pool.query(
  //   `DELETE FROM public.creditcard_trade
  //   WHERE trade_id = '${data.tradeId}' AND credit_card_id = '${data.creditCardId}' AND user_id = '${data.userId}'`,
  // );
  // // console.log("deleteResult:", deleteResult);
  // if (deleteResult.rowCount === 1) {
  //   return { success: true, message: "刪除成功" };
  // } else {
  //   return { success: false, message: "刪除失敗" };
  // }
}
