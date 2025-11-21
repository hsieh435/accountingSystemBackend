import { Request, Response } from "express";
import { handleControllersResponse } from "@/controllers/controllersTools";
const jwt = require("jsonwebtoken");

export async function jwtVerify(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return handleControllersResponse(res, req, { success: false, message: "Invalid token" }, 401);
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET as string;

    jwt.verify(token, secret, (err: Error | null, decoded: object | undefined) => {
      // decoded 是指 成功解碼（驗證）後的 JWT 內容
      // iat：token 建立的時間（UNIX timestamp）
      // exp：token過期時間（UNIX timestamp）
      // console.log("decoded:", decoded);

      if (err) {
        handleControllersResponse(res, req, { success: false, data: decoded, message: "Invalid token" }, 403);
      }
      handleControllersResponse(res, req, { success: true, data: decoded, message: "驗證成功" });
    });
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}
