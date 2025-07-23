import pool from "@/db";
import { keysToCamel } from "@/utils/tools";



export async function getAllTradeCategory() {
  const result = await pool.query("SELECT * FROM trade_category ORDER BY sort");
  return keysToCamel(result.rows);
};



export async function getTradeCategoryByCode(code: string) {
  const result = await pool.query(`SELECT * FROM trade_category WHERE category_code = '${code}'`);
  return keysToCamel(result.rows[0]);
};



export async function createTradeCategory(code: string, name: string, isCashflowAble: boolean, isCashcardAble: boolean, isCreditcardAble: boolean, isCuaccountAble: boolean, isStaccountAble: boolean, sort: number) {
  const result =
    await pool.query(`INSERT INTO trade_category (category_code, category_name, is_cashflow_able, is_cashcard_able, is_creditcard_able, is_cuaccount_able, is_staccount_able, sort) VALUES ('${code}', '${name}', ${isCashflowAble}, ${isCashcardAble}, ${isCreditcardAble}, ${isCuaccountAble}, ${isStaccountAble}, ${sort});`);
  return keysToCamel(result.rows[0]);
};



export async function updateTradeCategory(code: string, name: string, isCashflowAble: boolean, isCashcardAble: boolean, isCreditcardAble: boolean, isCuaccountAble: boolean, isStaccountAble: boolean, sort: number) {
  const result =
    await pool.query(`UPDATE trade_category SET category_name = '${name}', is_cashflow_able = ${isCashflowAble}, is_cashcard_able = ${isCashcardAble}, is_creditcard_able = ${isCreditcardAble}, is_cuaccount_able = ${isCuaccountAble}, is_staccount_able = ${isStaccountAble}, sort = ${sort} WHERE category_code = '${code}';`);
  return keysToCamel(result.rows[0]);
};



export async function removeTradeCategory(code: string) {
  const result = await pool.query(`DELETE FROM public.trade_category WHERE category_code = '${code}'`);
  return keysToCamel(result.rows[0]);
};
