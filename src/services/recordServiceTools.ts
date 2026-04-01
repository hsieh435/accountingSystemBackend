import pool from "@/db";
import { executeSQLsyntax } from "@/services/servicesTools";
import type { PoolClient } from "pg";

export interface IFinanceRecordParams {
  accountId: string;
  currencyId: string;
  tradeCategory: string;
  startingDate: string;
  endDate: string;
  userId: string;
}

interface IUpdateRelatedDataOptions {
  client?: PoolClient;
  afterUpdate?: (client: PoolClient) => Promise<{ success: boolean; message?: string; returnCode?: number }>;
}

function sanitizeIdentifier(name: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
    throw new Error(`Invalid identifier: ${name}`);
  }
  return name;
}

export async function tradeDateTimeDetect(
  tradeTableName: string,
  flowColumn: string,
  flowId: string,
  recordId: string,
  recordTradeDatetime: string,
): Promise<{ success: boolean; data?: any; message?: string; returnCode?: number }> {
  const tradeTable = sanitizeIdentifier(tradeTableName);
  const column = sanitizeIdentifier(flowColumn);

  try {
    const tradeDatetimeSearchingResult = await executeSQLsyntax({
      query: `
        SELECT EXISTS (
        SELECT 1 FROM ${tradeTable} WHERE ${column} = $1 AND trade_datetime = $2) AS hasExistsData,
        (SELECT trade_id FROM ${tradeTable} WHERE ${column} = $1 AND trade_datetime = $2
        ORDER BY trade_datetime DESC LIMIT 1) AS currentTradeId,
        (SELECT trade_datetime FROM ${tradeTable} WHERE ${column} = $1 AND trade_datetime = $2
        ORDER BY trade_datetime DESC LIMIT 1) AS currentTradeDatetime,
        (SELECT trade_id FROM ${tradeTable} WHERE ${column} = $1 AND trade_datetime < $2
        ORDER BY trade_datetime DESC LIMIT 1) AS prevTradeId,
        (SELECT trade_id FROM ${tradeTable} WHERE ${column} = $1 AND trade_datetime > $2
        ORDER BY trade_datetime ASC LIMIT 1) AS nextTradeId
      `,
      params: [flowId, recordTradeDatetime],
      isReturnArray: false,
    });

    const hasExistsData = tradeDatetimeSearchingResult.data.hasexistsdata;
    const currentTradeId = tradeDatetimeSearchingResult.data.currenttradeid || null;
    const prevTradeId = tradeDatetimeSearchingResult.data.prevtradeid || null;
    const nextTradeId = tradeDatetimeSearchingResult.data.nexttradeid || null;
    // console.log("tradeDatetimeSearchingResult:", tradeDatetimeSearchingResult);
    // console.log("hasExistsData:", hasExistsData);
    // console.log("currentTradeId:", currentTradeId);
    // console.log("prevTradeId:", prevTradeId);
    // console.log("nextTradeId:", nextTradeId);

    if (hasExistsData === true && recordId !== currentTradeId) {
      return { success: false, message: "收支時間點重複", returnCode: 0 };
    } else {
      if (prevTradeId === null) {
        // 新增到最初紀錄或金流第一筆紀錄
        return { success: true, message: "", returnCode: 0 };
      } else if (nextTradeId === null && prevTradeId !== null) {
        // 新增到最後一筆紀錄
        return { success: true, message: "", returnCode: 0 };
      } else if (nextTradeId !== null && prevTradeId !== null) {
        // 新增到中間紀錄
        return { success: true, message: "", returnCode: 0 };
      } else {
        return { success: false, message: "查詢失敗", returnCode: -1 };
      }
    }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : String(err), returnCode: -1 };
  }
}

export async function updateRelatedData(
  mainExecuteQuery: string,
  mainExecuteParams: any = [],
  isReturnArray: boolean,
  successMessage: string,
  errorMessage: string,
  flowListTableName: string,
  flowColumnName: string,
  flowId: string,
  recordTableName: string,
  recordColumnName: string,
  options?: IUpdateRelatedDataOptions,
) {
  // console.log("mainExecuteQuery:", mainExecuteQuery);
  // console.log("mainExecuteParams:", mainExecuteParams);
  const flowListTable = sanitizeIdentifier(flowListTableName);
  const flowColumn = sanitizeIdentifier(flowColumnName);
  const recordTable = sanitizeIdentifier(recordTableName);
  const recordColumn = sanitizeIdentifier(recordColumnName);

  const client = options?.client ?? (await pool.connect());
  const shouldManageTransaction = !options?.client;

  try {
    if (shouldManageTransaction) {
      await client.query("BEGIN");
    }

    // 執行主要的新增或更新操作
    const mainExecuteResult = await executeSQLsyntax({
      query: mainExecuteQuery,
      params: mainExecuteParams,
      isReturnArray,
      successMessage,
      errorMessage,
      client,
    });
    // console.log("mainExecuteResult:", mainExecuteResult);
    if (mainExecuteResult.success === false) {
      if (shouldManageTransaction) {
        await client.query("ROLLBACK");
      }
      return { success: true, message: errorMessage, returnCode: -1 };
    }

    // WITH balance_calc AS (
    //   SELECT ct.trade_id, ct.cashflow_id, ct.trade_datetime, ct.trade_amount, ct.transaction_type, cl.starting_amount,
    //   -- 從 starting_amount 開始，依序累計每筆交易
    //   cl.starting_amount +
    //   SUM(CASE
    //     WHEN ct.transaction_type = 'income' THEN ct.trade_amount ELSE -ct.trade_amount
    //     END
    // 	) OVER (
    // 	  PARTITION BY ct.cashflow_id
    // 	  ORDER BY ct.trade_datetime ASC
    // 	  ROWS UNBOUNDED PRECEDING
    // 	) AS new_balance
    //   FROM cashflow_trade ct
    //   JOIN cashflow_list cl ON ct.cashflow_id = cl.cashflow_id
    // )
    // UPDATE cashflow_trade SET remaining_amount = bc.new_balance
    // FROM balance_calc bc WHERE cashflow_trade.trade_id = bc.trade_id;

    // 合併更新 remaining_amount 與 present_amount，確保一次 SQL 執行完成
    const flowUpdateResult = await executeSQLsyntax({
      query: `
        WITH balance_calc AS (
          SELECT rT.trade_id, rT.${flowColumn}, rT.trade_datetime, rT.${recordColumn}, rT.transaction_type, aT.starting_amount,
          aT.starting_amount + SUM(CASE
            WHEN rT.transaction_type = 'income' THEN rT.${recordColumn} ELSE -rT.${recordColumn} END
              ) OVER (PARTITION BY rT.${flowColumn}
              ORDER BY rT.trade_datetime ASC ROWS UNBOUNDED PRECEDING
              ) AS new_balance
            FROM ${recordTable} rT
          JOIN ${flowListTable} aT ON rT.${flowColumn} = aT.${flowColumn}
          WHERE rT.${flowColumn} = $1
          ),
        updated_record AS (
          UPDATE ${recordTable} SET remaining_amount = bc.new_balance
          FROM balance_calc bc
          WHERE ${recordTable}.trade_id = bc.trade_id AND ${recordTable}.${flowColumn} = $1
          RETURNING ${recordTable}.remaining_amount, ${recordTable}.trade_datetime
        )
        UPDATE ${flowListTable} AS aT
        SET present_amount = COALESCE(
          (
            SELECT ur.remaining_amount
            FROM updated_record ur
            ORDER BY ur.trade_datetime DESC
            LIMIT 1
          ),
          aT.starting_amount
        )
        WHERE aT.${flowColumn} = $1`,
      params: [flowId],
      isReturnArray: true,
      successMessage: "更新餘額成功",
      errorMessage: "更新餘額失敗",
      client,
    });

    // console.log("flowUpdateResult:", flowUpdateResult);
    // pass client，加上 await 確保同步執行
    if (!flowUpdateResult.success) {
      if (shouldManageTransaction) {
        await client.query("ROLLBACK");
      }
      return { success: true, message: flowUpdateResult.message, returnCode: -1 };
    }

    if (options?.afterUpdate) {
      const afterUpdateResult = await options.afterUpdate(client);

      if (!afterUpdateResult.success || afterUpdateResult.returnCode === -1) {
        if (shouldManageTransaction) {
          await client.query("ROLLBACK");
        }
        return {
          success: true,
          message: afterUpdateResult.message || errorMessage,
          returnCode: -1,
        };
      }
    }

    if (shouldManageTransaction) {
      await client.query("COMMIT");
    }
    // console.log("更新餘額成功");
    return { success: true, message: flowUpdateResult.message, returnCode: 0 };
  } catch (err) {
    if (shouldManageTransaction) {
      await client.query("ROLLBACK");
    }
    return { success: false, message: err instanceof Error ? err.message : String(err), returnCode: -1 };
  } finally {
    if (shouldManageTransaction) {
      client.release();
    }
  }
}
