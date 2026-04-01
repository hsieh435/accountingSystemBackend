import pool from "@/db";
import { executeSQLsyntax } from "@/services/servicesTools";
import { IStockAccountRecordList } from "@/services/stockAccount/stockAccountRecordServices";
import type { PoolClient } from "pg";

export async function getStockStorageList(data: { stockAccountId: string; userId: string }) {
  // UPDATE stock_storage_list
  // SET storage_quantity = totals.net_quantity
  // FROM (
  //   SELECT stock_no, stock_name,
  //     SUM(
  //       CASE
  //         WHEN trade_category = 'stockBuy'  THEN quantity
  //         WHEN trade_category = 'stockDividend'  THEN quantity
  //         WHEN trade_category = 'stockSell' THEN -quantity
  //         ELSE 0
  //       END
  //     ) AS net_quantity
  //   FROM stock_account_trade
  //   WHERE account_id = '202508292251' AND user_id = 'mike'
  //   GROUP BY stock_no, stock_name
  // ) totals
  // WHERE stock_storage_list.stock_no = totals.stock_no;

  return executeSQLsyntax({
    query: `
      SELECT * FROM public.stock_storage_list
      WHERE stock_storage_list.stock_account_id LIKE '%${data.stockAccountId}%'
        AND stock_storage_list.user_id = '${data.userId}'`,
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}

export async function searchingStorageProfitList(stockAccountId: string, userId: string) {
  return executeSQLsyntax({
    query: `
      SELECT * FROM public.stock_storage_list
      WHERE stock_storage_list.stock_account_id LIKE '%${stockAccountId}%' AND stock_storage_list.user_id = '${userId}'`,
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}

export async function searchingStockSProfitDetail(data: { stockAccountId: string; userId: string; stockNo: string }) {
  return executeSQLsyntax({
    query: `
      SELECT * FROM public.stock_account_trade
      WHERE account_id LIKE '%${data.stockAccountId}%' AND user_id = '${data.userId}' AND stock_no = '${data.stockNo}'
      ORDER BY trade_datetime`,
    successMessage: "查詢成功",
    errorMessage: "查詢失敗",
  });
}

export async function updateStockStorageQuantity(data: IStockAccountRecordList, client?: PoolClient) {
  const queryClient = client ?? (await pool.connect());
  const shouldManageTransaction = !client;

  try {
    if (shouldManageTransaction) {
      await queryClient.query("BEGIN");
    }

    const searchingResult = await executeSQLsyntax({
      query: `SELECT 1 FROM public.stock_storage_list WHERE stock_account_id = $1 AND user_id = $2 AND stock_no = $3`,
      params: [data.accountId, data.userId, data.stockNo],
      successMessage: "查詢成功",
      errorMessage: "查詢失敗",
      client: queryClient,
    });
    // console.log("searchingResult:", searchingResult);

    if (!searchingResult.success) {
      if (shouldManageTransaction) {
        await queryClient.query("ROLLBACK");
      }
      return { success: true, message: searchingResult.message, returnCode: -1 };
    }


    const updateStoragelistResult = await executeSQLsyntax({
      query: `
        INSERT INTO public.stock_storage_list(stock_account_id, user_id, stock_no, stock_name, storage_quantity)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (stock_account_id, stock_no)
        DO UPDATE SET
          storage_quantity = (
            SELECT SUM(
              CASE
                WHEN stock_transaction = 'IN' THEN quantity
                WHEN stock_transaction = 'OUT' THEN -quantity
                ELSE 0
              END
            )
            FROM stock_account_trade sat
            WHERE sat.account_id = $1 AND sat.user_id = $2 AND sat.stock_no = stock_storage_list.stock_no
          )`,
      params: [data.accountId, data.userId, data.stockNo, data.stockName, data.quantity],
      successMessage: "增加成功",
      errorMessage: "增加失敗",
      client: queryClient,
    });
    // console.log("updateStoragelistResult:", updateStoragelistResult);

    if (!updateStoragelistResult.success) {
      if (shouldManageTransaction) {
        await queryClient.query("ROLLBACK");
      }
      return { success: true, message: updateStoragelistResult.message, returnCode: -1 };
    }

    if (shouldManageTransaction) {
      await queryClient.query("COMMIT");
    }
    return { success: true, message: "操作成功", returnCode: 0 };
  } catch (err) {
    if (shouldManageTransaction) {
      await queryClient.query("ROLLBACK");
    }
    return { success: false, message: err instanceof Error ? err.message : String(err), returnCode: -1 };
  } finally {
    if (shouldManageTransaction) {
      queryClient.release();
    }
  }
}
