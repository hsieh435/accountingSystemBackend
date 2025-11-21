import { Request, Response } from "express";
import { success, error } from "@/utils/response";
import { keysToCamel } from "@/utils/tools";

// Helper function for consistent response handling
export async function handleControllersResponse(res: Response, req: Request, result: any, returnCode: number = 400) {
  if (result.success) {
    return res.status(200).json(
      success({
        data: keysToCamel(result.data) || keysToCamel(result),
        message: result.message || "操作成功",
        req,
        res,
      }),
    );
  } else {
    return res.status(returnCode).json(
      error({
        data: [],
        message: result.message || "操作失敗",
        req,
        res,
        statusCode: returnCode,
      }),
    );
  }
}
