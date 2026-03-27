import { getCurrentTimestamp, setTimezone } from "@/utils/tools";
import { executeSQLsyntax } from "@/services/servicesTools";
import { IFinanceRecordParams, tradeDateTimeDetect, updateRelatedData } from "@/services/recordServiceTools";

export interface IStockAccountRecordList {
  tradeId: string;
  accountId: string;
  userId: string;
  tradeDatetime: string;
  accountUser: string;
  transactionType: string;
  tradeCategory: string;
  stockNo: string;
  stockName: string;
  pricePerShare: number;
  quantity: number;
  handlingFee: number;
  transactionTax: number;
  stockTotalPrice: number;
  tradeTotalPrice: number;
  remainingAmount: number;
  currency: string;
  tradeDescription: string;
  tradeNote: string;
  createdDatetime: string;
  editedDatetime: string;
}

export async function searchingStockAccountRecordList(data: IFinanceRecordParams) {
  return executeSQLsyntax({
    query: `
      SELECT stock_account_trade.*,
        (
        SELECT to_jsonb(stock_account_list.*) FROM stock_account_list
        WHERE stock_account_list.account_id = stock_account_trade.account_id AND stock_account_list.user_id = stock_account_trade.user_id
        ) AS account_data,

        (
        SELECT to_jsonb(currency_list.*) FROM currency_list WHERE currency_list.currency_code = stock_account_trade.currency
        ) AS currency_data,

        (
        SELECT to_jsonb(trade_category.*) FROM trade_category WHERE trade_category.trade_code = stock_account_trade.trade_category
        ) AS trade_category_data,

        (
        SELECT to_jsonb(transaction_category.*) FROM transaction_category WHERE transaction_category.transaction_code = stock_account_trade.transaction_type
        ) AS transaction_category_data

      FROM stock_account_trade
      WHERE stock_account_trade.currency LIKE '%${data.currencyId}%'
        AND stock_account_trade.account_id LIKE '%${data.accountId}%'
        AND stock_account_trade.user_id = '${data.userId}'
        AND stock_account_trade.trade_datetime BETWEEN '${data.startingDate}' AND '${data.endDate}'
      ORDER BY stock_account_trade.trade_datetime
    `,
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}

export async function getStockAccountRecordById(tradeId: string, accountId: string, userId: string) {
  return executeSQLsyntax({
    query: `
      SELECT * FROM public.stock_account_trade
      WHERE trade_id = '${tradeId}' AND account_id = '${accountId}' AND user_id = '${userId}'
    `,
    isReturnArray: false,
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}

export async function insertStockAccountRecord(data: IStockAccountRecordList) {
  // console.log("data:", data);
  data.tradeId = `ST-${data.currency}-${getCurrentTimestamp()}`;
  data.createdDatetime = `${setTimezone()}`;
  data.editedDatetime = `${setTimezone()}`;

  const dateDetectResult = await tradeDateTimeDetect(
    "stock_account_trade",
    "account_id",
    data.accountId,
    data.tradeId,
    data.tradeDatetime,
  );
  // console.log("dateDetectResult:", dateDetectResult);
  if (!dateDetectResult.success) {
    return { success: true, message: dateDetectResult.message, returnCode: -1 };
  }

  // const client = await pool.connect();
  // await client.query("BEGIN");

  const insertResult = await updateRelatedData(
    `INSERT INTO public.stock_account_trade(trade_id, account_id, user_id, trade_datetime, trade_category, transaction_type, stock_no, stock_name, price_per_share, quantity, stock_total_price, handling_fee, transaction_tax, trade_total_price, remaining_amount, currency, trade_description, trade_note, created_datetime, edited_datetime)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)


    INSERT INTO public.stock_storage_list(stock_account_id, user_id, stock_no, stock_name, storage_quantity)
    VALUES ($2, $3, $7, $8, $10)
    ON CONFLICT (stock_account_id, stock_no)
    DO UPDATE SET
    UPDATE stock_storage_list
      SET stock_storage_list.storage_quantity = totals.net_quantity
        FROM (SELECT stock_no, stock_name,
          SUM(
            CASE
              WHEN trade_category = 'stockBuy'  THEN quantity
              WHEN trade_category = 'stockDividend'  THEN quantity
              WHEN trade_category = 'stockSell' THEN -quantity
              ELSE 0
            END
          ) AS net_quantity
        FROM stock_account_trade
      WHERE account_id = $2 AND user_id = $3
      GROUP BY stock_no, stock_name
    ) totals
    WHERE stock_storage_list.stock_no = totals.stock_no;
    `,
    [
      data.tradeId,
      data.accountId,
      data.userId,
      data.tradeDatetime,
      data.tradeCategory,
      data.transactionType,
      data.stockNo,
      data.stockName,
      data.pricePerShare,
      data.quantity,
      data.stockTotalPrice,
      data.handlingFee,
      data.transactionTax,
      data.stockTotalPrice + data.handlingFee + data.transactionTax,
      0,
      data.currency,
      data.tradeDescription,
      data.tradeNote,
      data.createdDatetime,
      data.editedDatetime,
    ],
    false,
    "新增成功",
    "新增失敗",
    "stock_account_list",
    "account_id",
    data.accountId,
    "stock_account_trade",
    "trade_total_price",
  );

  ////////////////////////////////
  ////////////////////////////////
  ////////////////////////////////
  // await updateStockStorageQuantity(data);
  ////////////////////////////////
  ////////////////////////////////
  ////////////////////////////////

  if (insertResult.success === true) {
    return { success: true, message: "新增成功" };
  } else if (insertResult.success === false) {
    return { success: true, message: "新增失敗", returnCode: -1 };
  }
}

export async function updateStockAccountRecord(data: IStockAccountRecordList) {
  data.editedDatetime = `${setTimezone()}`;

  const dateDetectResult = await tradeDateTimeDetect(
    "stock_account_trade",
    "account_id",
    data.accountId,
    data.tradeId,
    data.tradeDatetime,
  );
  if (!dateDetectResult.success) {
    return { success: true, message: dateDetectResult.message, returnCode: -1 };
  }

  const updateResult = await updateRelatedData(
    `UPDATE public.stock_account_trade SET trade_datetime = $1, stock_no = $2, stock_name = $3, price_per_share = $4, quantity = $5, stock_total_price = $6, handling_fee = $7, transaction_tax = $8, trade_total_price = $9, trade_description = $10, trade_note = $11, edited_datetime = $12
    WHERE trade_id = $13 AND account_id = $14 AND user_id = $15



    INSERT INTO public.stock_storage_list(stock_account_id, user_id, stock_no, stock_name, storage_quantity)
    VALUES ($14, $15, $2, $3, $5)
    ON CONFLICT (stock_account_id, stock_no)
    DO UPDATE SET
    UPDATE stock_storage_list
      SET stock_storage_list.storage_quantity = totals.net_quantity
        FROM (SELECT stock_no, stock_name,
          SUM(
            CASE
              WHEN trade_category = 'stockBuy'  THEN quantity
              WHEN trade_category = 'stockDividend'  THEN quantity
              WHEN trade_category = 'stockSell' THEN -quantity
              ELSE 0
            END
          ) AS net_quantity
        FROM stock_account_trade
      WHERE account_id = $14 AND user_id = $15
      GROUP BY stock_no, stock_name
    ) totals
    WHERE stock_storage_list.stock_no = totals.stock_no;



    `,
    [
      data.tradeDatetime,
      data.stockNo,
      data.stockName,
      data.pricePerShare,
      data.quantity,
      data.stockTotalPrice,
      data.handlingFee,
      data.transactionTax,
      data.stockTotalPrice + data.handlingFee + data.transactionTax,
      data.tradeDescription,
      data.tradeNote,
      data.editedDatetime,
      data.tradeId,
      data.accountId,
      data.userId,
    ],
    false,
    "更新成功",
    "更新失敗",
    "stock_account_list",
    "account_id",
    data.accountId,
    "stock_account_trade",
    "trade_total_price",
  );

  ////////////////////////////////
  ////////////////////////////////
  ////////////////////////////////
  // await updateStockStorageQuantity(data);
  ////////////////////////////////
  ////////////////////////////////
  ////////////////////////////////

  if (updateResult.success === true) {
    return { success: true, message: "更新成功" };
  } else if (updateResult.success === false) {
    return { success: false, message: "更新失敗", returnCode: -1 };
  }
}

export async function removeStockAccountRecord(data: IStockAccountRecordList) {
  return updateRelatedData(
    `DELETE FROM public.stock_account_trade WHERE trade_id = $1 AND account_id = $2 AND user_id = $3`,
    [data.tradeId, data.accountId, data.userId],
    false,
    "刪除成功",
    "刪除失敗",
    "stock_account_list",
    "account_id",
    data.accountId,
    "stock_account_trade",
    "trade_total_price",
  );
}
