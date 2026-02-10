import { Request, Response } from "express";
import { handleControllersResponse } from "@/controllers/controllersTools";

// https://finmind.github.io
// https://api.finmindtrade.com/api/v4/login
// https://api.finmindtrade.com/docs#



// 登入 FinMind 系統，取得 API Token
export async function loginFinMindSystem(req: Request, res: Response) {
  // console.log("req.body:", req.body);
  try {
    const loginResponse = await fetch("https://api.finmindtrade.com/api/v4/login", {
      method: "POST",
      headers: {
        "Accept": "*/*",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(req.body),
    });
    const jsonData = await loginResponse.json();
    // console.log("loginResponse:", loginResponse);
    // console.log("FinMind 回傳資料:", jsonData);
    process.env.FinMind_API_TOKEN = jsonData.token;

    await handleControllersResponse(res, req, { success: true, data: jsonData, message: jsonData.msg });
  } catch (err) {
    await handleControllersResponse(res, req, { message: String(err) }, 500);
  }
}



// 查詢 FinMind 系統剩餘 Token 使用次數
export async function checkFinMindTokenUsage(req: Request, res: Response) {
  try {
    const infoResponse = await fetch("https://api.web.finmindtrade.com/v2/user_info", {
      method: "GET",
      headers: {
        "Accept": "*/*",
        "Authorization": `Bearer ${process.env.FinMind_API_TOKEN}`
      },
    });
    const jsonData = await infoResponse.json();
    await handleControllersResponse(res, req, { success: true, data: jsonData }, 200);
  } catch (err) {
    await handleControllersResponse(res, req, { message: String(err) }, 500);
  }
}
