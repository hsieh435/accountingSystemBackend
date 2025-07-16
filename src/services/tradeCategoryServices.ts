import pool from "@/db";
import { keysToCamel } from "@/utils/caseConverter";



export const getAllTradeCategory = async () => {
  const result = await pool.query("SELECT * FROM trade_category ORDER BY sort");
  return keysToCamel(result.rows);
};



export const getTradeCategoryByCode = async (code: string) => {
  const result = await pool.query(`SELECT * FROM trade_category WHERE category_code = "${code}"`);
  return keysToCamel(result.rows[0]);
};



export const createTradeCategory = async (code: string, name: string, isCashflowAble: boolean, isCashcardAble: boolean, isCreditcardAble: boolean, isCuaccountAble: boolean, isStaccountAble: boolean, sort: number) => {
  const result = await pool.query(`INSERT INTO trade_category (category_code, category_name, is_cashflow_able, is_cashcard_able, is_creditcard_able, is_cuaccount_able, is_staccount_able, sort) VALUES ("${code}", "${name}", ${isCashflowAble}, ${isCashcardAble}, ${isCreditcardAble}, ${isCuaccountAble}, ${isStaccountAble}, ${sort});`);
  return keysToCamel(result.rows[0]);
};



export const updateTradeCategory = async (code: string, name: string, isCashflowAble: boolean, isCashcardAble: boolean, isCreditcardAble: boolean, isCuaccountAble: boolean, isStaccountAble: boolean, sort: number) => {
  const result = await pool.query(`UPDATE trade_category SET category_name = "${name}", is_cashflow_able = ${isCashflowAble}, is_cashcard_able = ${isCashcardAble}, is_creditcard_able = ${isCreditcardAble}, is_cuaccount_able = ${isCuaccountAble}, is_staccount_able = ${isStaccountAble}, sort = ${sort} WHERE category_code = "${code}";`);
  return keysToCamel(result.rows[0]);
};

// UPDATE trade_category	SET category_code=?, category_name=?, is_cashflow_able=?, is_cashcard_able=?, is_creditcard_able=?, is_cuaccount_able=?, is_staccount_able=?, sort=? WHERE <condition>;



export const deleteTradeCategory = async (code: string) => {
  const result = await pool.query(`DELETE FROM public.trade_category WHERE category_code = "${code}"`);
  return keysToCamel(result.rows[0]);
};
