import pool from "@/db";
import { executeSQLsyntax } from "@/services/servicesTools";
import { IStockAccountRecordData } from "@/services/stockAccount/stockAccountRecordServices";

export async function getStockStorageList(data: { stockAccountId: string; userId: string }) {
  const query = `
    SELECT * FROM public.stock_storage_list
    WHERE stock_account_id LIKE '%${data.stockAccountId}%' AND user_id = '${data.userId}'`;

  return executeSQLsyntax({ query: query, successMessage: "查詢成功", errorMessage: "查詢失敗" });
}

export async function searchingStorageProfitList(stockAccountId: string, userId: string) {
  const searchingQuery = `
    SELECT
    ssl.*,
    json_agg(
      json_build_object(
        'stock_no', ssd.stock_no,
        'stock_name', ssd.stock_name,
        'trade_datetime', ssd.trade_datetime,
        'price_per_share', ssd.price_per_share,
        'quantity', ssd.quantity,
        'stock_total_price', ssd.stock_total_price,
        'handling_fee', ssd.handling_fee,
        'transaction_tax', ssd.transaction_tax,
        'trade_total_price', ssd.trade_total_price,
        'currency', ssd.currency
      )
    ) FILTER (WHERE ssd.stock_no IS NOT NULL) AS stock_storage_detail
    FROM public.stock_storage_list AS ssl
    LEFT JOIN stock_storage_detail AS ssd ON ssl.stock_account_id = ssd.account_id AND ssl.stock_no = ssd.stock_no
    WHERE ssl.stock_account_id = '${stockAccountId}' AND ssl.user_id = '${userId}'
    GROUP BY ssl.stock_account_id, ssl.user_id, ssl.stock_no`;

  return executeSQLsyntax({ query: searchingQuery, successMessage: "查詢成功", errorMessage: "查詢失敗" });
}

export async function searchingStockSProfitDetail(data: { stockAccountId: string; userId: string; stockNo: string }) {
  const query = `
    SELECT * FROM public.stock_storage_detail
    WHERE account_id LIKE '%${data.stockAccountId}%' AND user_id = '${data.userId}' AND stock_no = '${data.stockNo}'
    ORDER BY trade_datetime`;

  return executeSQLsyntax({ query: query, successMessage: "查詢成功", errorMessage: "查詢失敗" });
}

export async function updateStockStorageQuantity(data: IStockAccountRecordData) {
  const client = await pool.connect();
  await client.query("BEGIN");

  const searchingQuery = `SELECT * FROM public.stock_storage_list
  WHERE stock_account_id = $1 AND user_id = $2 AND stock_no = $3`;

  const searchingResult = await executeSQLsyntax({
    query: searchingQuery,
    params: [data.updateData.accountId, data.userId, data.updateData.stockNo],
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
  console.log("searchingResult:", searchingResult);

  if (!searchingResult.success) {
    await client.query("ROLLBACK");
    return { success: true, message: searchingResult.message, returnCode: -1 };
  } else if (searchingResult.success && searchingResult.data.length === 0) {

    const increaseQuery =
      `INSERT INTO public.stock_storage_list(stock_account_id, user_id, stock_no, stock_name, storage_quantity)
      VALUES ($1, $2, $3, $4, $5)`;
    const increaseResult = await executeSQLsyntax({
      query: increaseQuery,
      params: [
        data.updateData.accountId,
        data.userId,
        data.updateData.stockNo,
        data.updateData.stockName,
        data.updateData.quantity,
      ],
      successMessage: "增加成功",
      errorMessage: "增加失敗",
    });

    if (!increaseResult.success) {
      await client.query("ROLLBACK");
      return { success: true, message: increaseResult.message, returnCode: -1 };
    }

  } else if (searchingResult.success && searchingResult.data.length > 0) {
    const currentQuantity = Number(searchingResult.data[0].storageQuantity);


    const updateQuery =
      `UPDATE public.stock_storage_list SET storage_quantity=${currentQuantity + data.updateData.quantity}
      WHERE stock_account_id = $1 AND user_id = $2 AND stock_no = $3`;

    const updateResult = await executeSQLsyntax({
      query: updateQuery,
      params: [data.updateData.accountId, data.userId, data.updateData.stockNo],
      successMessage: "更新成功",
      errorMessage: "更新失敗",
    });

    if (!updateResult.success) {
      await client.query("ROLLBACK");
      return { success: true, message: updateResult.message, returnCode: -1 };
    }
  }


  await client.query("COMMIT");
  return { success: true, message: "操作成功", returnCode: 0 };
}
