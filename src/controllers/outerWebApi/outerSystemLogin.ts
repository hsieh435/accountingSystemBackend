import { Request, Response } from "express";
import { success, error } from "@/utils/response";

// https://finmind.github.io
// https://api.finmindtrade.com/api/v4/login





// 登入 FinMind 系統，取得 API Token
export async function loginFinMindSystem(req: Request, res: Response) {
  console.log("req.body:", req.body);
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

    res.json(success({ data: jsonData, message: jsonData.msg, req, res }));
  } catch (err) {
    res.status(500).json(error({ message: String(err), req, res }));
  }
}
