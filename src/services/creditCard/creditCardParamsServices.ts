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
  limitYearMonth: string;
  creditPerMonth: number;
}

export async function getCreditCardLimitation(data: { creditcardId: string; userId: string; yearMonth: string }) {
  const params: any[] = [`%${data.creditcardId}%`, data.userId];

  let dateWhereCondition = "";

  if (data.yearMonth) {
    const [yearStr, monthStr] = data.yearMonth.split("-");
    const lastDay = getDaysInMonth(Number(yearStr), Number(monthStr));
    const startingDate = `${data.yearMonth}-01`;
    const endDate = `${data.yearMonth}-${String(lastDay).padStart(2, "0")} 23:59:59`;
    params.push(startingDate, endDate);
    dateWhereCondition = "AND creditcard_limit.limit_year_month BETWEEN $3 AND $4";
  }

  return executeSQLsyntax({
    query: `
      SELECT creditcard_limit.*, creditcard_list.creditcard_name, COALESCE(SUM(cT.trade_amount), 0) as total_spent
      FROM public.creditcard_limit
      LEFT JOIN creditcard_list ON creditcard_limit.creditcard_id = creditcard_list.creditcard_id
      LEFT JOIN creditcard_trade cT ON creditcard_limit.creditcard_id = cT.credit_card_id AND creditcard_limit.user_id = cT.user_id
        AND cT.trade_datetime >= creditcard_limit.limit_year_month
        AND cT.trade_datetime < creditcard_limit.limit_year_month + INTERVAL '1 month'
      WHERE creditcard_limit.creditcard_id LIKE $1
        AND creditcard_limit.user_id = $2
        ${dateWhereCondition}
      GROUP BY creditcard_limit.creditcard_id, creditcard_limit.limit_year_month, creditcard_limit.user_id, creditcard_limit.limit_credit, creditcard_list.creditcard_name
      ORDER BY limit_year_month, creditcard_id`,
    params: params,
    isReturnArray: true,
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}

export async function insertCreditCardLimitation({
  creditcardId,
  userId,
  startDate,
  expirationDate,
  creditPerMonth,
}: {
  creditcardId: string;
  userId: string;
  startDate: string;
  expirationDate: string;
  creditPerMonth: number;
}) {
  console.log("data:", creditcardId, userId, startDate, expirationDate, creditPerMonth);
  const startYear = getCurrentYear(startDate);
  const startMonth = getCurrentMonth(startDate);
  const finalYear = getCurrentYear(expirationDate);
  const finalMonth = getCurrentMonth(expirationDate);

  for (let i = startYear; i <= finalYear; i++) {
    for (let j = i === startYear ? startMonth : 1; j <= (i === finalYear ? finalMonth : 12); j++) {
      const limitYearMonth = `${i}-${String(j).padStart(2, "0")}-01 00:00:00`;
      const insertResult = await executeSQLsyntax({
        query: `
          INSERT INTO public.creditcard_limit(creditcard_id, limit_year_month, user_id, limit_credit)
          VALUES ($1, $2, $3, $4)`,
        params: [creditcardId, limitYearMonth, userId, creditPerMonth],
      });
      console.log("insertResult:", insertResult);

      if (insertResult.success === false) {
        return insertResult;
      }
    }
  }
  return { success: true, message: "新增成功", data: [] };
}

export async function updateCreditCardLimitation(data: ICreditCardLimitation) {
  return executeSQLsyntax({
    query: `
      UPDATE public.creditcard_limit SET limit_credit = $4
      WHERE creditcard_id = $1 AND user_id = $2 AND limit_year_month = $3`,
    params: [data.creditcardId, data.userId, data.limitYearMonth, data.creditPerMonth],
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
    query: `
      SELECT COALESCE(SUM(trade_amount), 0) AS trade_total FROM creditcard_trade
      WHERE credit_card_id = $1 AND user_id = $2 AND trade_datetime BETWEEN $3 AND $4`,
    params: [params.creditcardId, params.userId, startingDate, endDate],
    isReturnArray: false,
    successMessage: "",
    errorMessage: "失敗",
  });
}
