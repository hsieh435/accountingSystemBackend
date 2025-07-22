import pool from "@/db";
import { keysToCamel, getCurrentYMD } from "@/utils/tools";



export async function loginTesting(data: { userId: string; password: string }) {

  const searchingUserResult =
    await pool.query(`SELECT * FROM user_data WHERE user_id = '${data.userId}' AND user_password = '${data.password}'`);
  // console.log("searchingUserResult:", searchingUserResult);
  if (searchingUserResult.rows.length === 1) {
    return { success: true, userData: keysToCamel(searchingUserResult.rows[0]) };
  } else {
    return { success: false, userData: [] };
  }
};



export async function createUser(data: { userAccount: string; userName: string; userPassword: string }) {
  // console.log("data:", data);
  const createUserResult =
    await pool.query(`INSERT INTO user_data (user_id, user_name, user_password, created_date) VALUES ('${data.userAccount}', '${data.userName}', '${data.userPassword}', '${getCurrentYMD()}')`);
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
