import { getCurrentYear, getCurrentMonth, getDaysInMonth } from "@/utils/tools";
import { executeSQLsyntax } from "@/services/servicesTools";

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

export interface ICreditCardLimitation {
  creditcardId: string;
  userId: string;
  yearMonth: string;
  creditPerMonth: number;
}



export async function getCreditCardLimitation(data: { creditcardId: string; userId: string; yearMonth: string }) {
  // console.log("data:", data);
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
    params: params,
    isReturnArray: true,
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}


export async function insertCreditCardLimitation(data: ICreditCardLimitation) {
  // console.log("data:", data);

  return executeSQLsyntax({
    query:
      `INSERT INTO public.creditcard_limit(creditcard_id, limit_year_month, user_id, credit_per_month)
      VALUES ($1, $2, $3, $4)`,
    params: [data.creditcardId, data.yearMonth, data.userId, data.creditPerMonth],
    isReturnArray: true,
    successMessage: "新增成功",
    errorMessage: "新增失敗",
  });
}


export async function updateCreditCardLimitation(data: ICreditCardLimitation) {
  // console.log("data:", data);

  return executeSQLsyntax({
    query:
      `UPDATE public.creditcard_limit SET credit_per_month=$4
      WHERE creditcard_id = $1 AND user_id = $2 AND limit_year_month = $3`,
    params: [data.creditcardId, data.userId, data.yearMonth, data.creditPerMonth],
    isReturnArray: true,
    successMessage: "更新成功",
    errorMessage: "更新失敗",
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
