import pool from "@/db";
import { keysToCamel } from "@/utils/tools";

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
  const result = await pool.query("SELECT * FROM trade_category ORDER BY sort");
  return keysToCamel(result.rows);
}

export async function getTradeCategoryByCode(code: string) {
  const result = await pool.query(`SELECT * FROM trade_category WHERE trade_code = '${code}'`);
  return keysToCamel(result.rows[0]);
}

export async function createTradeCategory(data: ITradeCategory) {
  const result = await pool.query(
    `INSERT INTO trade_category (trade_code, trade_name, is_cashflow_able, is_storedvaluecard_able, is_creditcard_able, is_cuaccount_able, is_staccount_able, sort) VALUES ('${data.tradeCode}', '${data.tradeName}', ${data.isCashflowAble}, ${data.isStoredvaluecardAble}, ${data.isCreditcardAble}, ${data.isCuaccountAble}, ${data.isStaccountAble}, ${data.sort});`,
  );
  return keysToCamel(result.rows[0]);
}

export async function updateTradeCategory(data: ITradeCategory) {
  const result = await pool.query(
    `UPDATE trade_category SET trade_name = '${data.tradeName}', is_cashflow_able = ${data.isCashflowAble}, is_storedvaluecard_able = ${data.isStoredvaluecardAble}, is_creditcard_able = ${data.isCreditcardAble}, is_cuaccount_able = ${data.isCuaccountAble}, is_staccount_able = ${data.isStaccountAble}, sort = ${data.sort} WHERE trade_code = '${data.tradeCode}';`,
  );
  return keysToCamel(result.rows[0]);
}

export async function removeTradeCategory(code: string) {
  const result = await pool.query(`DELETE FROM public.trade_category WHERE trade_code = '${code}'`);
  return keysToCamel(result.rows[0]);
}
