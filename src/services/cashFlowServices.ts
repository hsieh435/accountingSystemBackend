import pool from "@/db";
import { keysToCamel, getCurrentYMD } from "@/utils/tools";


export interface ICashFlowList {
  cashflowId: string;
  userId: string;
  currency: string;
  startingAmount: number;
  presentAmount: number;
  minimumValueAllowed: number;
  alertValue: number;
  openAlert: boolean;
  createDate: string;
  note: string;
}


export async function insertCashflowData(data: ICashFlowList) {
  console.log("data:", data);

  // const dataParams: ICashFlowList = data;

  // const insertResult =
  //   await pool.query(`INSERT INTO cashflow_list(cashflow_id, user_id, currency, starting_amount, present_amount, minimum_value_allowed, alert_value, open_alert, created_date, note) VALUES ('${dataParams.cashflowId}', '${dataParams.userId}', '${dataParams.currency}', ${dataParams.startingAmount}, ${dataParams.presentAmount}, ${dataParams.minimumValueAllowed}, ${dataParams.alertValue}, ${dataParams.openAlert}, '${getCurrentYMD()}', '${dataParams.note}')`);
  //   console.log("insertResult:", insertResult);
  // if (insertResult.rows.length === 1) {
  //   return { success: true, userData: keysToCamel(insertResult.rows[0]) };
  // } else {
    return { success: false, userData: [] };
  // }
};



export async function createUser(data: { userAccount: string; userName: string; userPassword: string }) {
  // console.log("data:", data);
  const createUserResult =
    await pool.query(`INSERT INTO cashflow_list (user_id, user_name, user_password, created_date) VALUES ('${data.userAccount}', '${data.userName}', '${data.userPassword}', '${getCurrentYMD()}')`);
  // console.log("createUserResult:", createUserResult);
  if (createUserResult.rowCount === 1) {
    return true;
  } else {
    return false;
  }
};



export async function accountDataChange(data: { userId: string; userName: string; userOldPassword: string; userNewPassword: string }) {
  // console.log("data:", data);

  const userDataUpdateResult =
    await pool.query(`UPDATE user_data SET user_name='${data.userName}', user_password='${data.userNewPassword}' WHERE user_id='${data.userId}'`);
  // console.log("userDataUpdateResult:", userDataUpdateResult);
  if (userDataUpdateResult.rowCount === 1) {
    return true;
  } else {
    return false;
  }
};
