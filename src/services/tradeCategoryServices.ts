import pool from "@/db";
import { keysToCamel } from "@/utils/tools";



// 收支類型 interface
export interface ITradeCategory {
  categoryCode: string;
  categoryName: string;
  isCashflowAble: boolean;
  isCashcardAble: boolean;
  isCreditcardAble: boolean;
  isCuaccountAble: boolean;
  isStaccountAble: boolean;
  sort: number;
}



export async function getAllTradeCategory() {
  const result = await pool.query("SELECT * FROM trade_category ORDER BY sort");
  return keysToCamel(result.rows);
};



export async function getTradeCategoryByCode(code: string) {
  const result = await pool.query(`SELECT * FROM trade_category WHERE category_code = '${code}'`);
  return keysToCamel(result.rows[0]);
};



export async function createTradeCategory(data: ITradeCategory) {
  const result =
    await pool.query(`INSERT INTO trade_category (category_code, category_name, is_cashflow_able, is_cashcard_able, is_creditcard_able, is_cuaccount_able, is_staccount_able, sort) VALUES ('${data.categoryCode}', '${data.categoryName}', ${data.isCashflowAble}, ${data.isCashcardAble}, ${data.isCreditcardAble}, ${data.isCuaccountAble}, ${data.isStaccountAble}, ${data.sort});`);
  return keysToCamel(result.rows[0]);
};



export async function updateTradeCategory(data: ITradeCategory) {
  const result =
    await pool.query(`UPDATE trade_category SET category_name = '${data.categoryName}', is_cashflow_able = ${data.isCashflowAble}, is_cashcard_able = ${data.isCashcardAble}, is_creditcard_able = ${data.isCreditcardAble}, is_cuaccount_able = ${data.isCuaccountAble}, is_staccount_able = ${data.isStaccountAble}, sort = ${data.sort} WHERE category_code = '${data.categoryCode}';`);
  return keysToCamel(result.rows[0]);
};



export async function removeTradeCategory(code: string) {
  const result = await pool.query(`DELETE FROM public.trade_category WHERE category_code = '${code}'`);
  return keysToCamel(result.rows[0]);
};
