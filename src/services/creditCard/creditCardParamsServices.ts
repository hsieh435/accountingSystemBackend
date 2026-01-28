import pool from "@/db";
import { executeSQLsyntax } from "@/services/servicesTools";
import { searchingCreditCardList } from "@/services/creditCard/creditCardListServices";
import { getCurrentYear, getCurrentMonth, getDaysInMonth } from "@/utils/tools";

export interface ICreditCardData {
  creditcardId: string;
  userId: string;
  accountType: string;
  creditcardName: string;
  creditcardBankCode: string;
  creditcardBankName: string;
  creditcardSchema: string;
  currency: string;
  currencyName?: string;
  creditPerMonth: number;
  expirationDate: string;
  alertValue: number;
  expenditureCurrentMonth: number;
  openAlert: boolean;
  enable: boolean;
  createdDate: string;
  note: string;
}

export async function getCreditCardLimitation(data: { creditcardId: string; userId: string; yearMonth: string }) {
  console.log("data:", data);
  const startingDate = data.yearMonth ? `${data.yearMonth}-01` : "";
  const endDate = data.yearMonth ? `${data.yearMonth}-28` : "";

  const params: any[] = [`%${data.creditcardId}%`, data.userId];
  if (data.yearMonth) {
    params.push(startingDate, endDate);
  }

  return executeSQLsyntax({
    query: `SELECT creditcard_limit.*, creditcard_list.creditcard_name
      FROM public.creditcard_limit
      LEFT JOIN creditcard_list ON creditcard_limit.creditcard_id = creditcard_list.creditcard_id
      WHERE creditcard_limit.creditcard_id LIKE $1 AND creditcard_limit.user_id = $2
      ${data.yearMonth ? "AND creditcard_limit.limit_year_month BETWEEN $3 AND $4" : ""}
      ORDER BY limit_year_month`,
    params,
    isReturnArray: true,
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}

export async function calculateCreditCardExpenditure(params: {
  creditcardId: string;
  userId: string;
  tradeDatetime: string;
}) {
  const startingDate = `${getCurrentYear(params.tradeDatetime)}-${getCurrentMonth(params.tradeDatetime)}-01T00:00:00.001Z`;
  const endDate = `${getCurrentYear(params.tradeDatetime)}-${getCurrentMonth(params.tradeDatetime)}-${getDaysInMonth(getCurrentYear(params.tradeDatetime), getCurrentMonth(params.tradeDatetime))}T23:59:59.999Z`;
  // console.log("startingDate:", startingDate);
  // console.log("endDate:", endDate);

  return executeSQLsyntax({
    query: `SELECT COALESCE(SUM(trade_amount), 0) AS trade_total FROM creditcard_trade
    WHERE credit_card_id = $1 AND user_id = $2 AND trade_datetime BETWEEN $3 AND $4`,
    params: [params.creditcardId, params.userId, startingDate, endDate],
    isReturnArray: false,
    successMessage: "",
    errorMessage: "失敗",
  });
}
