import pool from "@/db";
import { executeSQLsyntax } from "@/services/servicesTools";

// 收支類型 interface
export interface ITradeCategory {
  tradeCode: string;
  tradeName: string;
  isCashflowAble: boolean;
  isStoredvaluecardAble: boolean;
  isCreditcardAble: boolean;
  isCuaccountAble: boolean;
  isStaccountAble: boolean;
  sort: number;
}

export async function getAllTradeCategory() {
  return executeSQLsyntax({
    query: `SELECT * FROM trade_category ORDER BY sort, trade_code`,
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}

export async function getTradeCategoryByCode(code: string) {
  return executeSQLsyntax({
    query: `SELECT * FROM trade_category WHERE trade_code = '${code}'`,
    isReturnArray: false,
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}

export async function createTradeCategory(data: ITradeCategory) {

  return executeSQLsyntax({
    query: `
      INSERT INTO trade_category (trade_code, trade_name, is_cashflow_able, is_storedvaluecard_able, is_creditcard_able, is_cuaccount_able, is_staccount_able, sort)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    params: [
      data.tradeCode,
      data.tradeName,
      data.isCashflowAble,
      data.isStoredvaluecardAble,
      data.isCreditcardAble,
      data.isCuaccountAble,
      data.isStaccountAble,
      data.sort,
    ],
    isReturnArray: false,
    successMessage: "新增成功",
    errorMessage: "新增失敗",
  });
}

export async function updateTradeCategory(data: ITradeCategory) {

  return executeSQLsyntax({
    query: `
      UPDATE trade_category SET trade_name = $1, is_cashflow_able = $2, is_storedvaluecard_able = $3, is_creditcard_able = $4, is_cuaccount_able = $5, is_staccount_able = $6, sort = $7
      WHERE trade_code = $8`,
    params: [
      data.tradeName,
      data.isCashflowAble,
      data.isStoredvaluecardAble,
      data.isCreditcardAble,
      data.isCuaccountAble,
      data.isStaccountAble,
      data.sort,
      data.tradeCode,
    ],
    isReturnArray: false,
    successMessage: "更新成功",
    errorMessage: "更新失敗",
  });
}

export async function removeTradeCategory(code: string) {
  const client = await pool.connect();
  await client.query("BEGIN");

  const deleteResult = await executeSQLsyntax({
    query: `DELETE FROM public.trade_category WHERE trade_code = '${code}'`,
    successMessage: "刪除成功",
    errorMessage: "刪除失敗",
    client,
  });

  const updateResult = await executeSQLsyntax({
    query: `
      UPDATE table_a SET cashflow_trade = 'else' WHERE trade_category = '${code}';
      UPDATE table_b SET stored_value_card_trade = 'else' WHERE trade_category = '${code}';
      UPDATE table_c SET creditcard_trade = 'else' WHERE trade_category = '${code}';
      UPDATE table_d SET currency_account_trade = 'else' WHERE trade_category = '${code}';
      UPDATE table_e SET stock_account_trade = 'else' WHERE trade_category = '${code}';
    `,
    successMessage: "刪除成功",
    errorMessage: "刪除失敗",
    client,
  });

  if (!deleteResult.success || !updateResult.success) {
    await client.query("ROLLBACK");
    return { success: false, message: "刪除失敗", returnCode: -1 };
  } else {
    await client.query("COMMIT");
    return { success: true, message: "刪除成功", returnCode: 0 };
  }
}
