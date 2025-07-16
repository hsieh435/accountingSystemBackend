import { Request, Response } from "express";
import { success, error } from "@/utils/response";
import * as tradeService from "@/services/tradeCategoryServices";



export const getAll = async (req: Request, res: Response) => {
  
  try {
    const result = await tradeService.getAllTradeCategory();
    // console.log("result:", result);
    res.json(success({ data: result, message: "查詢成功" }));
  } catch (err) {
    // console.error(err);
    res.status(500).json(error({ message: "Server error" }));
  }
};



export const getOne = async (req: Request, res: Response) => {
  try {
    const result = await tradeService.getTradeCategoryByCode(req.params.code);
    res.json(success({ data: result }));
  } catch (err) {
    res.status(500).json(error({ message: "Server error" }));
  }
};



interface IDataParams {
    categoryCode: string;
    categoryName: string;
    isCashflowAble: boolean;
    isCashcardAble: boolean;
    isCreditcardAble: boolean;
    isCuaccountAble: boolean;
    isStaccountAble: boolean;
    sort: number;
}

export const create = async (req: Request, res: Response) => {
  const dataParams = req.body as IDataParams;
  try {
    const result = await tradeService.createTradeCategory(
      dataParams.categoryCode,
      dataParams.categoryName,
      dataParams.isCashflowAble,
      dataParams.isCashcardAble,
      dataParams.isCreditcardAble,
      dataParams.isCuaccountAble,
      dataParams.isStaccountAble,
      dataParams.sort
    );
    res.status(200).json(success({ data: result }));
  } catch (err) {
    res.status(500).json(error({ message: "Server error" }));
  }
};



export async function update(req: Request, res: Response) {
  const dataParams = req.body as IDataParams;
  try {
    const result = await tradeService.updateTradeCategory(
      dataParams.categoryCode,
      dataParams.categoryName,
      dataParams.isCashflowAble,
      dataParams.isCashcardAble,
      dataParams.isCreditcardAble,
      dataParams.isCuaccountAble,
      dataParams.isStaccountAble,
      dataParams.sort
    );
    res.status(200).json(success({ data: result }));
  } catch (err) {
    res.status(500).json(error({ message: "Server error" }));
  }
};



export const remove = async (req: Request, res: Response) => {
  try {
    const result = await tradeService.deleteTradeCategory(req.params.code);
    res.json(success({ message: "刪除成功" }));
  } catch (err) {
    res.status(500).json(error({ message: "Server error" }));
  }
};
