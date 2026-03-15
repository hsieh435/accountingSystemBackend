import pool from "@/db";
import { setTimezone } from "@/utils/tools";
import { executeSQLsyntax } from "@/services/servicesTools";

export interface IFinanceRecordSearchingParams {
  accountId: string;
  currencyId: string;
  tradeCategory: string;
  startingDate: string;
  endDate: string;
  userId: string;
}

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
  recordId: string,
  recordTradeDatetime: string,
): Promise<any> {
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

      } else  if (nextTradeId !== null && prevTradeId !== null) {
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
  recordTableName: string,
  flowColumn: string,
  flowId: string,
  // tradeDatetime: string,
  // dataTransactionType: string,
  // oriTransactionType: string,
  // dataTradeAmount: number,
  // oriTradeAmount: number,
) {
  // console.log("mainExecuteQuery:", mainExecuteQuery);
  // console.log("mainExecuteParams:", mainExecuteParams);
  const flowListTable = sanitizeIdentifier(flowListTableName);
  const recordTable = sanitizeIdentifier(recordTableName);
  const column = sanitizeIdentifier(flowColumn);



  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 執行主要的新增或更新操作
    const mainExecuteResult = await executeSQLsyntax({
      query: mainExecuteQuery,
      params: mainExecuteParams,
      isReturnArray,
      successMessage,
      errorMessage,
      client,
    });
    if (mainExecuteResult.success === false) {
      await client.query("ROLLBACK");
      return { success: false, message: errorMessage, returnCode: -1 };
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



    // 更新後續紀錄的 remaining_amount
    const recordUpdateResult = await executeSQLsyntax({
      query: `
        WITH balance_calc AS (
          SELECT rT.trade_id, rT.${column}, rT.trade_datetime, rT.trade_amount, rT.transaction_type, aT.starting_amount,
          aT.starting_amount + SUM(CASE
            WHEN rT.transaction_type = 'income' THEN rT.trade_amount ELSE -rT.trade_amount END
              ) OVER (PARTITION BY rT.${column}
              ORDER BY rT.trade_datetime ASC ROWS UNBOUNDED PRECEDING
              ) AS new_balance
            FROM ${recordTable} rT
          JOIN ${flowListTable} aT ON rT.${column} = aT.${column}
          WHERE rT.${column} = $1
          )
        UPDATE ${recordTable} SET remaining_amount = bc.new_balance
        FROM balance_calc bc
        WHERE ${recordTable}.trade_id = bc.trade_id AND ${recordTable}.${column} = $1`,
      params: [flowId],
      isReturnArray: true,
      successMessage: "更新成功",
      errorMessage: "更新失敗",
      client,
    });
    // const recordUpdateResult = await executeSQLsyntax({
    //   query: `
    //     UPDATE ${recordTable} SET remaining_amount = remaining_amount + $1
    //     WHERE trade_datetime > $2 AND ${column} = $3`,
    //   params: [amountDifference, tradeDatetime, flowId],
    //   isReturnArray: true,
    //   successMessage: "更新成功",
    //   errorMessage: "更新失敗",
    //   client,
    // });



    // 更新 present_amount，pass client，加上 await 確保同步執行
    const flowUpdateResult = await executeSQLsyntax({
      query: `
        UPDATE ${flowListTable} SET present_amount = (SELECT frt.remaining_amount FROM ${recordTable} AS frt
        WHERE frt.trade_datetime = (SELECT MAX(trade_datetime) FROM ${recordTable} WHERE ${column} = $1) AND frt.${column} = $1)
        WHERE ${column} = $1`,
      params: [flowId],
      isReturnArray: true,
      successMessage: "更新成功",
      errorMessage: "更新失敗",
      client,
    });

    console.log("recordUpdateResult:", recordUpdateResult);
    console.log("flowUpdateResult:", flowUpdateResult);
    // pass client，加上 await 確保同步執行
    if (!flowUpdateResult.success || !recordUpdateResult.success) {
      await client.query("ROLLBACK");
      return { success: false, message: "更新餘額失敗", returnCode: -1 };
    }
    await client.query("COMMIT");
    // console.log("更新餘額成功");
    return { success: true, message: "更新餘額成功", returnCode: 0 };
  } catch (err) {
    await client.query("ROLLBACK");
    return { success: false, message: err instanceof Error ? err.message : String(err), returnCode: -1 };
  } finally {
    client.release();
  }
  // console.log("更新餘額成功");
}

// export async function updateFlowRecordRemainingAmount(
//   recordTable: string,
//   column: string,
//   amountDifference: number,
//   tradeDatetime: string,
//   flowId: string,
// ) {

//   return executeSQLsyntax({
//     query:
//       `UPDATE ${recordTable} SET remaining_amount = remaining_amount + $1 WHERE trade_datetime > $2 AND ${column} = $3`,
//     params: [amountDifference, tradeDatetime, flowId],
//     isReturnArray: false,
//     successMessage: "更新成功",
//     errorMessage: "更新失敗",
//   });
// }

// export async function updateFlowDataRemainingAmount(
//   flowListTable: string,
//   recordTable: string,
//   flowColumn: string,
//   flowId: string,
// ) {
//   // console.log("flowListTable:", flowListTable);
//   // console.log("recordTable:", recordTable);
//   // console.log("flowColumn:", flowColumn);
//   // console.log("flowId:", flowId);

//   return executeSQLsyntax({
//     query: `
//       UPDATE ${flowListTable} SET present_amount = (SELECT frt.remaining_amount FROM ${recordTable} AS frt
//       WHERE frt.trade_datetime = (SELECT MAX(trade_datetime) FROM ${recordTable}) AND frt.${flowColumn} = '${flowId}')
//       WHERE ${flowColumn} = '${flowId}'`,
//     isReturnArray: false,
//     successMessage: "更新成功",
//     errorMessage: "更新失敗",
//   });
// }
