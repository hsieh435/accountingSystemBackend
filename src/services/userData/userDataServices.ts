import { getCurrentYMD } from "@/utils/tools";
import { executeSQLsyntax } from "@/services/servicesTools";



export async function loginTesting(data: { userId: string; password: string }) {

  return executeSQLsyntax({
    query: `SELECT * FROM user_data WHERE user_id = '${data.userId}' AND user_password = '${data.password}'`,
    isReturnArray: false,
    successMessage: "登入成功",
    errorMessage: "登入失敗"
  });
};



export async function createUser(data: { userAccount: string; userName: string; userPassword: string }) {

  return executeSQLsyntax({
    query: `
      INSERT INTO user_data (user_id, user_name, user_password, created_date)
      VALUES ('${data.userAccount}', '${data.userName}', '${data.userPassword}', '${getCurrentYMD()}')`,
    isReturnArray: false,
    successMessage: "新增成功",
    errorMessage: "新增失敗"
  });
};



export async function accountDataChange(data: { userId: string; userName: string; userOldPassword: string; userNewPassword: string }) {

  return executeSQLsyntax({
    query: `
      UPDATE user_data SET user_name = '${data.userName}', user_password = '${data.userNewPassword}'
      WHERE user_id = '${data.userId}'`,
    isReturnArray: false,
    successMessage: "更新成功",
    errorMessage: "更新失敗"
  });
};
