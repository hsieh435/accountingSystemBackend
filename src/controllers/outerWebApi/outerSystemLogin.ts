import { Request, response, Response } from "express";
import { success, error } from "@/utils/response";

// https://finmind.github.io
// https://finmindtrade.com/analysis/#/account/login
// https://api.finmindtrade.com/api/v4/login


// 登入 FinMind 系統，取得 API Token
export async function loginFinMindSystem(req: Request, res: Response) {
  try {
    const loginResponse = await fetch("https://api.finmindtrade.com/api/v4/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: "hsieh435@gmail.com",
        password: "accu17325",
      }),
    });
    const jsonData = await loginResponse.json();
    // process.env.FinMind_API_TOKEN = jsonData.data.token;
    console.log("jsonData:", jsonData);
    res.json(success({ data: jsonData, message: "查詢成功", req, res }));
  } catch (err) {
    res.status(500).json(error({ message: "查詢失敗", req, res }));
  }
}
