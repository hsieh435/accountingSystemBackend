import { Request, Response } from "express";
import { success, error } from "@/utils/response";
import * as cashFlowRecordServices from "@/services/cashFlow/cashFlowRecordServices";
import { keysToCamel } from "@/utils/tools";

// Helper function for consistent response handling
const handleServiceResponse = (
  res: Response,
  result: any,
  req: Request,
  successMessage: string = "操作成功",
  errorMessage: string = "操作失敗",
) => {
  if (result.success) {
    return res.json(
      success({
        data: result.data || result,
        message: successMessage,
        req,
        res,
      }),
    );
  }
  return res.json(
    error({
      data: [],
      message: errorMessage,
      req,
      res,
    }),
  );
};

export async function cashFlowRecordList(req: Request, res: Response) {
  try {
    const result = await cashFlowRecordServices.searchingCashFlowRecordList(req.body);
    handleServiceResponse(res, result, req, "查詢成功", "發生錯誤");
  } catch (err) {
    res.json(error({ message: "發生錯誤", req, res }));
  }
}

export async function searchingCashFlowRecordById(req: Request, res: Response) {
  try {
    const result = await cashFlowRecordServices.searchingCashFlowRecordById(req.body);
    if (result.success) {
      res.json(success({ data: keysToCamel(result.data), req, res }));
    } else {
      res.json(error({ data: [], message: "支出紀錄不存在", req, res }));
    }
  } catch (err) {
    res.json(error({ data: [], message: "支出紀錄不存在", req, res }));
  }
}

export async function cashFlowRecordCreate(req: Request, res: Response) {
  try {
    const result = await cashFlowRecordServices.insertCashFlowRecordData(req.body);
    handleServiceResponse(res, result, req, "建立成功", "資料錯誤");
  } catch (err) {
    res.json(error({ req, res }));
  }
}

export async function cashFlowRecordUpdate(req: Request, res: Response) {
  try {
    const result = await cashFlowRecordServices.updateCashFlowRecordData(req.body);
    const response =
      result ? success({ message: "修改成功", req, res }) : error({ message: "修改失敗", req, res });

    res.status(result ? 200 : 500).json(response);
  } catch (err) {
    res.status(500).json(error({ req, res }));
  }
}

// export async function cashFlowDelete(req: Request, res: Response) {
//   req.body.cashflowId = req.params.cashflowId;

//   try {
//     const removeResult = await cashFlowRecordServices.removeCashflowData(req.body);
//     if (removeResult.success === true) {
//       res.json(success({ message: removeResult.message, req, res }));
//     } else {
//       res.json(error({ message: removeResult.message, req, res }));
//     }
//   } catch (err) {
//     res.json(error({ req, res }));
//   }
// }
