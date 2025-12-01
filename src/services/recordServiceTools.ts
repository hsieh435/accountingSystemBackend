import pool from "@/db";
import { executeSQLsyntax } from "@/services/servicesTools";
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

export async function tradeDateTimeDetect(
  flowListTableName: string,
  tradeTableName: string,
  flowColumn: string,
  flowId: string,
  recordTradeDatetime: string,
): Promise<any> {
  const flowListTable = sanitizeIdentifier(flowListTableName);
  const tradeTable = sanitizeIdentifier(tradeTableName);
  const column = sanitizeIdentifier(flowColumn);

  try {
    const result = await pool.query(`
      SELECT EXISTS (
      SELECT 1 FROM ${tradeTable} WHERE ${column} = '${flowId}' AND trade_datetime = '${recordTradeDatetime}') AS hasExistsData,
      (SELECT trade_id FROM ${tradeTable} WHERE ${column} = '${flowId}' AND trade_datetime < '${recordTradeDatetime}'
      ORDER BY trade_datetime DESC LIMIT 1) AS prevTradeId,
      (SELECT remaining_amount FROM ${tradeTable} WHERE ${column} = '${flowId}' AND trade_datetime < '${recordTradeDatetime}'
      ORDER BY trade_datetime DESC LIMIT 1) AS prevRemainingAmount,
      (SELECT trade_datetime FROM ${tradeTable} WHERE ${column} = '${flowId}' AND trade_datetime < '${recordTradeDatetime}'
      ORDER BY trade_datetime DESC LIMIT 1) AS prevTradeDatetime,
      (SELECT trade_id FROM ${tradeTable} WHERE ${column} = '${flowId}' AND trade_datetime > '${recordTradeDatetime}'
      ORDER BY trade_datetime ASC LIMIT 1) AS nextTradeId,
      (SELECT remaining_amount FROM ${tradeTable} WHERE ${column} = '${flowId}' AND trade_datetime > '${recordTradeDatetime}'
      ORDER BY trade_datetime ASC LIMIT 1) AS nextRemainingAmount,
      (SELECT trade_datetime FROM ${tradeTable} WHERE ${column} = '${flowId}' AND trade_datetime > '${recordTradeDatetime}'
      ORDER BY trade_datetime ASC LIMIT 1) AS nextTradeDatetime
    `);

    const hasExistsData = result.rows[0].hasexistsdata;
    const prevTradeId = result.rows[0].prevtradeid || null;
    const prevRemainingAmount = result.rows[0].prevremainingamount || null;
    const prevTradeDatetime = setTimezone(result.rows[0].prevtradedatetime) || null;
    const nextTradeId = result.rows[0].nexttradeid || null;
    const nextRemainingAmount = result.rows[0].nextremainingamount || null;
    const nextTradeDatetime = setTimezone(result.rows[0].nexttradedatetime) || null;
    const dataTradeDatetime = setTimezone(recordTradeDatetime);
    // console.log("result:", result.rows);
    // console.log("prevTradeId:", prevTradeId);
    // console.log("prevTradeDatetime:", prevTradeDatetime);
    // console.log("nextTradeId:", nextTradeId);
    // console.log("nextTradeDatetime:", nextTradeDatetime);

    const flowOriginal =
      await pool.query(`SELECT * FROM ${flowListTable} WHERE ${column} = '${flowId}'`);
    // console.log("flowOriginal:", flowOriginal.rows);
    const startingAmount = flowOriginal.rows[0].starting_amount;

    if (hasExistsData === true) {
      return { success: false, message: "收支時間點重複" };
    } else {

      if (nextTradeId === null && prevTradeId !== null) {
        // 新增到最後一筆紀錄，，回傳上一筆交易剩餘金額
        return { success: true, message: "", returnAmount: prevRemainingAmount };
      } else if (prevTradeId === null && nextTradeId === null) {
        // 新增到最初紀錄，回傳金流初始金額
        return { success: true, message: "", returnAmount: startingAmount };
      } else if (nextTradeId !== null && prevTradeId === null) {
        // 新增金流第一筆紀錄，回傳金流初始金額
        return { success: true, message: "", returnAmount: startingAmount };
      } else if (nextTradeId !== null && prevTradeId !== null) {
        // 新增到中間紀錄，回傳上一筆交易剩餘金額
        return { success: true, message: "", returnAmount: prevRemainingAmount };
      }

      return { success: false, message: "查詢失敗"};
    }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : String(err) };
  }
}

export async function updateRelatedData(
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

  // 更新後續紀錄的 remaining_amount
  // const recordUpdateResult = await updateFlowRecordRemainingAmount(recordTable, column, amountDifference, tradeDatetime, flowId);

  // // 加上 await 確保同步執行
  // const flowUpdateResult = await updateFlowDataRemainingAmount(flowListTable, recordTable, flowColumn, flowId);

  // if (!flowUpdateResult.success || !recordUpdateResult.success) {
  //   return { success: false, error: "更新餘額失敗" };
  // }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const recordUpdateResult = await updateFlowRecordRemainingAmount(
      recordTable,
      column,
      amountDifference,
      tradeDatetime,
      flowId,
    );
    // pass client
    const flowUpdateResult = await updateFlowDataRemainingAmount(flowListTable, recordTable, flowColumn, flowId);
    // pass client
    if (!flowUpdateResult.success || !recordUpdateResult.success) {
      await client.query("ROLLBACK");
      return { success: false, error: "更新餘額失敗" };
    }
    await client.query("COMMIT");
    // console.log("更新餘額成功");
  } catch (err) {
    await client.query("ROLLBACK");
    return { success: false, error: err };
  } finally {
    client.release();
  }
  // console.log("更新餘額成功");
}

export async function updateFlowRecordRemainingAmount(
  recordTable: string,
  column: string,
  amountDifference: number,
  tradeDatetime: string,
  flowId: string,
) {
  //
  try {
    const result = await pool.query(
      `UPDATE ${recordTable}
      SET remaining_amount = remaining_amount + $1
      WHERE trade_datetime > $2 AND ${column} = $3`,
      [amountDifference, tradeDatetime, flowId],
    );
    // console.log("updateFlowRecordRemainingAmount:", result);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function updateFlowDataRemainingAmount(
  flowListTable: string,
  recordTable: string,
  flowColumn: string,
  flowId: string,
) {
  // console.log("flowListTable:", flowListTable);
  // console.log("recordTable:", recordTable);
  // console.log("flowColumn:", flowColumn);
  // console.log("flowId:", flowId);

  try {
    const result = await pool.query(`
      UPDATE ${flowListTable} SET present_amount = (
        SELECT frt.remaining_amount FROM ${recordTable} AS frt
        WHERE frt.trade_datetime = (SELECT MAX(trade_datetime) FROM ${recordTable})
        AND frt.${flowColumn} = '${flowId}')
      WHERE ${flowColumn} = '${flowId}'
    `);
    console.log("updateFlowDataRemainingAmount:", result);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
