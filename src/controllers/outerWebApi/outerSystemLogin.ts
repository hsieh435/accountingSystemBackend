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
      body: JSON.stringify({
        user_id: req.body.finMindAccount,
        password: req.body.finMindPassword,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkYXRlIjoiMjAyNS0wOS0wOCAxNjoxNjo1NiIsInVzZXJfaWQiOiJwaG9lbml4MTkiLCJpcCI6IjYxLjIxOS41MS4xNTQifQ.95Fm1sSAjEROnfixr4ZF_zOIVbFXVWWPI2NINb3-OF8",
      },
    });

    const jsonData = await loginResponse.json();
    console.log("loginResponse:", loginResponse);
    console.log("FinMind 回傳資料:", jsonData);

    if (loginResponse.ok) {
      res.json(success({ data: jsonData, message: "查詢成功", req, res }));
    } else {
      throw new Error("Login failed.");
    }
  } catch (err) {
    res.status(500).json(error({ message: String(err), req, res }));
  }
}
