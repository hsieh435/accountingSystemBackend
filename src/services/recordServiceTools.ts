import pool from "@/db";
import { setTimezone } from "@/utils/tools";

export interface IOriData {
  oriTradeDatetime: string;
  oriTradeAmount: number;
  oriRemainingAmount: number;
  oriTransactionType: string;
}

function sanitizeIdentifier(name: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
    throw new Error(`Invalid identifier: ${name}`);
  }
  return name;
}

export async function latestTradeDateTimeDetect(
  tableName: string,
  flowColumn: string,
  flowId: string,
  recordTradeDatetime: string,
): Promise<any> {
  const table = sanitizeIdentifier(tableName);
  const column = sanitizeIdentifier(flowColumn);

  try {
    const result = await pool.query(
      `SELECT MAX(trade_datetime) AS latestTradeDatetime FROM ${table} WHERE ${column} = '${flowId}'`,
    );
    const latestTradeDatetime = setTimezone(result.rows[0].latesttradedatetime || null);
    const dataTradeDatetime = setTimezone(recordTradeDatetime);
    // console.log("latestTradeDatetime:", latestTradeDatetime);
    // console.log("dataTradeDatetime:", dataTradeDatetime);

    if (latestTradeDatetime > dataTradeDatetime) {
      // console.log("table:", table);
      // console.log("recordTradeDatetime:", recordTradeDatetime);
      // console.log("column:", column);
      // console.log("flowId:", flowId);

      try {
        const result = await pool.query(
          `SELECT * FROM ${table} WHERE trade_datetime = '${recordTradeDatetime}' AND ${column} = '${flowId}'`,
        );
        if (result.rows.length === 1) {
          return { success: false, message: "收支時間點重複" };
        } else if ((result.rows = [])) {
          return { success: true, message: "" };
        }
      } catch (error) {
        return { success: false, error };
      }
    } else if (latestTradeDatetime === dataTradeDatetime) {
      return { success: false, message: "收支時間點重複" };
    } else if (!latestTradeDatetime || latestTradeDatetime < dataTradeDatetime) {
      return { success: true, message: "" };
    }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : String(err) };
  }
}

export async function updateRemainingAmount(
  flowListTableName: string,
  recordTableName: string,
  flowColumn: string,
  flowId: string,
  tradeDatetime: string,
  dataTransactionType: string,
  oriTransactionType: string,
  dataTradeAmount: number,
  oriTradeAmount: number,
) {
  const flowListTable = sanitizeIdentifier(flowListTableName);
  const recordTable = sanitizeIdentifier(recordTableName);
  const column = sanitizeIdentifier(flowColumn);

  const amountDifference = (() => {
    switch (true) {
      case dataTransactionType === oriTransactionType:
        return dataTradeAmount - oriTradeAmount;
      case dataTransactionType === "income" && oriTransactionType === "expense":
        return dataTradeAmount + oriTradeAmount;
      case dataTransactionType === "expense" && oriTransactionType === "income":
        return -dataTradeAmount - oriTradeAmount;
      default:
        return 0;
    }
  })();

  try {
    const result = await pool.query(`UPDATE ${recordTable}
      SET remaining_amount = remaining_amount + $1
      WHERE trade_datetime > $2 AND ${column} = $3`,
      [amountDifference, tradeDatetime, flowId],
    );

    // 加上 await 確保同步執行
    const flowUpdateResult = await updateFlowDataRemainingAmount(flowListTable, recordTable, flowColumn, flowId);

    if (!flowUpdateResult.success) {
      return { success: false, error: "更新餘額失敗" };
    }

    return { success: true, rowCount: result.rowCount };
  } catch (error) {
    console.error("Error updating remaining amount:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function updateFlowDataRemainingAmount(
  flowListTable: string,
  recordTable: string,
  flowColumn: string,
  flowId: string,
) {
  console.log("flowListTable:", flowListTable);
  console.log("recordTable:", recordTable);
  console.log("flowColumn:", flowColumn);
  console.log("flowId:", flowId);

  try {
    const result = await pool.query(`
      UPDATE ${flowListTable} SET present_amount = (
        SELECT frt.remaining_amount FROM ${recordTable} AS frt
        WHERE frt.trade_datetime = (SELECT MAX(trade_datetime) FROM ${recordTable})
        AND frt.${flowColumn} = '${flowId}')
      WHERE ${flowColumn} = '${flowId}'
    `);
    console.log("result:", result);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
