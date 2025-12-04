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
    query: "SELECT * FROM trade_category ORDER BY sort",
    successMessage: "查詢成功",
    errorMessage: "查詢失敗"
  });
}

export async function getTradeCategoryByCode(code: string) {
  return executeSQLsyntax({
    query: `SELECT * FROM trade_category WHERE trade_code = '${code}'`,
    isReturnArray: false,
    successMessage: "查詢成功",
    errorMessage: "查詢失敗"
  });
}

export async function createTradeCategory(data: ITradeCategory) {

  return executeSQLsyntax({
    query:
      `INSERT INTO trade_category (trade_code, trade_name, is_cashflow_able, is_storedvaluecard_able, is_creditcard_able, is_cuaccount_able, is_staccount_able, sort) VALUES ('${data.tradeCode}', '${data.tradeName}', ${data.isCashflowAble}, ${data.isStoredvaluecardAble}, ${data.isCreditcardAble}, ${data.isCuaccountAble}, ${data.isStaccountAble}, ${data.sort});`,
    isReturnArray: false,
    successMessage: "新增成功",
    errorMessage: "新增失敗"
  });
}

export async function updateTradeCategory(data: ITradeCategory) {

  return executeSQLsyntax({
    query:
      `UPDATE trade_category SET trade_name = '${data.tradeName}', is_cashflow_able = ${data.isCashflowAble}, is_storedvaluecard_able = ${data.isStoredvaluecardAble}, is_creditcard_able = ${data.isCreditcardAble}, is_cuaccount_able = ${data.isCuaccountAble}, is_staccount_able = ${data.isStaccountAble}, sort = ${data.sort}
      WHERE trade_code = '${data.tradeCode}';`,
    isReturnArray: false,
    successMessage: "更新成功",
    errorMessage: "更新失敗"
  });
}

export async function removeTradeCategory(code: string) {
  return executeSQLsyntax({
    query: `DELETE FROM public.trade_category WHERE trade_code = '${code}'`,
    successMessage: "刪除成功",
    errorMessage: "刪除失敗"
  });
}
