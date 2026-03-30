import { getCurrentYear, getCurrentMonth, getCurrentTimestamp, setTimezone } from "@/utils/tools";
import { executeSQLsyntax } from "@/services/servicesTools";

export interface IStockAccountList {
  accountId: string;
  userId: string;
  accountType: string;
  accountName: string;
  accountBankCode: string;
  accountBankName: string;
  currency: string;
  currencyName?: string;
  startingAmount: number;
  presentAmount: number;
  minimumValueAllowed: number;
  alertValue: number;
  openAlert: boolean;
  enable: boolean;
  createdDate: string;
  note: string;
}

export async function searchingStockAccountList(data: { currencyId: string; userId: string }) {
  return executeSQLsyntax({
    query: `
      SELECT stock_account_list.*,
        (
        SELECT to_jsonb(currency_list.*) FROM currency_list
        WHERE currency_list.currency_code = stock_account_list.currency
        ) AS currency_data,

        (
        SELECT COUNT(*)::INTEGER FROM stock_account_trade
        WHERE stock_account_trade.account_id = stock_account_list.account_id
        ) AS frequency,

        COALESCE(trade_totals.expense_sum, 0) AS expense_sum_current_month,
        COALESCE(trade_totals.income_sum, 0) AS income_sum_current_month,
        COALESCE(trade_totals.income_sum - trade_totals.expense_sum, 0) AS profit_loss_sum_current_month
      FROM stock_account_list

      LEFT JOIN (
        SELECT account_id,
          SUM(CASE WHEN transaction_type = 'expense' THEN trade_total_price ELSE 0 END) AS expense_sum,
          SUM(CASE WHEN transaction_type = 'income' THEN trade_total_price ELSE 0 END) AS income_sum
        FROM stock_account_trade
      WHERE EXTRACT(YEAR FROM trade_datetime) = '${getCurrentYear()}'
        AND EXTRACT(MONTH FROM trade_datetime) = '${getCurrentMonth()}'
        GROUP BY account_id
      ) trade_totals ON stock_account_list.account_id = trade_totals.account_id

      WHERE currency LIKE '%${data.currencyId}%' AND user_id = '${data.userId}'
      ORDER BY created_date`,
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}

export async function getStockAccountById(data: { accountId: string; userId: string }) {
  return executeSQLsyntax({
    query: `
      SELECT stock_account_list.*,
        COALESCE(trade_totals.expense_sum, 0) AS expense_sum_current_month,
        COALESCE(trade_totals.income_sum, 0) AS income_sum_current_month,
        COALESCE(trade_totals.income_sum - trade_totals.expense_sum, 0) AS profit_loss_sum_current_month,
        COALESCE(storage.stock_storage_list, '[]'::json) AS stock_storage_list
      FROM stock_account_list

      LEFT JOIN (
        SELECT account_id,
          SUM(CASE WHEN transaction_type = 'expense' THEN trade_total_price ELSE 0 END) AS expense_sum,
          SUM(CASE WHEN transaction_type = 'income' THEN trade_total_price ELSE 0 END) AS income_sum
        FROM stock_account_trade
        WHERE EXTRACT(YEAR FROM trade_datetime) = '${getCurrentYear()}'
          AND EXTRACT(MONTH FROM trade_datetime) = '${getCurrentMonth()}'
        GROUP BY account_id
      ) trade_totals ON stock_account_list.account_id = trade_totals.account_id

      LEFT JOIN (
        SELECT storage_list.stock_account_id,
          storage_list.user_id,
          json_agg(
            json_build_object(
              'stock_no', storage_list.stock_no,
              'stock_name', storage_list.stock_name,
              'storage_quantity', storage_list.storage_quantity,
              'stock_trade_record', COALESCE(storage_detail.stock_trade_record, '[]'::json)
            )
            ORDER BY storage_list.stock_no
          ) AS stock_storage_list
        FROM public.stock_storage_list AS storage_list

        LEFT JOIN (
          SELECT sat.account_id,
            sat.user_id,
            sat.stock_no,
            json_agg(
              json_build_object(
                'trade_id', sat.trade_id,
                'trade_datetime', sat.trade_datetime,
                'trade_category', sat.trade_category,
                'transaction_type', sat.transaction_type,
                'stock_no', sat.stock_no,
                'stock_name', sat.stock_name,
                'price_per_share', sat.price_per_share,
                'quantity', sat.quantity,
                'stock_total_price', sat.stock_total_price,
                'handling_fee', sat.handling_fee,
                'transaction_tax', sat.transaction_tax,
                'trade_total_price', sat.trade_total_price,
                'currency', sat.currency
              )
              ORDER BY sat.trade_datetime
            ) AS stock_trade_record
          FROM public.stock_account_trade AS sat
          WHERE sat.account_id = '${data.accountId}'
            AND sat.user_id = '${data.userId}'
          GROUP BY sat.account_id, sat.user_id, sat.stock_no
        ) storage_detail
          ON storage_list.stock_account_id = storage_detail.account_id
          AND storage_list.user_id = storage_detail.user_id
          AND storage_list.stock_no = storage_detail.stock_no
        WHERE storage_list.stock_account_id = '${data.accountId}'
          AND storage_list.user_id = '${data.userId}'
        GROUP BY storage_list.stock_account_id, storage_list.user_id
      ) storage ON stock_account_list.account_id = storage.stock_account_id AND stock_account_list.user_id = storage.user_id

      WHERE stock_account_list.account_id = '${data.accountId}' AND stock_account_list.user_id = '${data.userId}'`,
    isReturnArray: false,
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}

export async function insertStockAccountData(data: IStockAccountList) {
  data.accountId = `SA-${getCurrentTimestamp()}`;
  const timeStampWithZone = setTimezone();

  return executeSQLsyntax({
    query: `
      INSERT INTO public.stock_account_list(account_id, user_id, account_type, account_name, account_bank_code, account_bank_name, currency, starting_amount, present_amount, minimum_value_allowed, alert_value, open_alert, enable, created_date, note)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
    params: [
      data.accountId,
      data.userId,
      data.accountType,
      data.accountName,
      data.accountBankCode,
      data.accountBankName,
      data.currency,
      data.startingAmount,
      data.startingAmount,
      data.minimumValueAllowed,
      data.alertValue,
      data.openAlert,
      data.enable,
      timeStampWithZone,
      data.note,
    ],
    isReturnArray: false,
    successMessage: "新增成功",
    errorMessage: "新增失敗",
  });
}

export async function updateStockAccountData(data: IStockAccountList) {
  return executeSQLsyntax({
    query: `
      UPDATE public.stock_account_list SET account_name = $1, account_bank_code = $2, account_bank_name = $3, currency = $4, starting_amount = $5, present_amount = $6, minimum_value_allowed = $7, alert_value = $8, open_alert = $9, created_date = $10, note = $11
      WHERE account_id = $12 AND user_id = $13`,
    params: [
      data.accountName,
      data.accountBankCode,
      data.accountBankName,
      data.currency,
      data.startingAmount,
      data.presentAmount,
      data.minimumValueAllowed,
      data.alertValue,
      data.openAlert,
      data.createdDate,
      data.note,
      data.accountId,
      data.userId,
    ],
    isReturnArray: false,
    successMessage: "更新成功",
    errorMessage: "更新失敗",
  });
}

export async function enableStockAccountStatus(data: IStockAccountList) {
  return executeSQLsyntax({
    query: `UPDATE public.stock_account_list SET enable = $1 WHERE account_id = $2 AND user_id = $3`,
    params: [true, data.accountId, data.userId],
    isReturnArray: false,
    successMessage: "已啟用",
    errorMessage: "啟用失敗",
  });
}

export async function disableStockAccountStatus(data: IStockAccountList) {
  return executeSQLsyntax({
    query: `UPDATE public.stock_account_list SET enable = $1 WHERE account_id = $2 AND user_id = $3`,
    params: [false, data.accountId, data.userId],
    isReturnArray: false,
    successMessage: "已停用",
    errorMessage: "停用失敗",
  });
}

export async function removeStockAccountData(data: IStockAccountList) {
  const recordDetectResult = await executeSQLsyntax({
    query: `
      SELECT 1 FROM public.stock_account_trade
      WHERE account_id = '${data.accountId}' AND user_id = '${data.userId}' AND currency = '${data.currency}'
      `,
  });

  if (recordDetectResult.success && recordDetectResult.data.length > 0) {
    return { success: true, message: "已有收支紀錄", returnCode: -1 };
  } else if (recordDetectResult.success && recordDetectResult.data.length === 0) {
    return executeSQLsyntax({
      query: `DELETE FROM stock_account_list WHERE account_id = '${data.accountId}' AND user_id = '${data.userId}'`,
      successMessage: "刪除成功",
      errorMessage: "刪除失敗",
    });
  } else {
    return { success: false, message: "刪除失敗", returnCode: -1 };
  }
}
