import pool from "@/db";
import { Request, Response } from "express";
import { success, error } from "@/utils/response";
import * as storedValueCardListServices from "@/services/storedValueCard/storedValueCardListServices";
import { keysToCamel } from "@/utils/tools";



export async function storedValueCardDataList(req: Request, res: Response) {
  // console.log("Request body:", req.body);

  try {
    const searchingResult = await storedValueCardListServices.searchingStoredValueCardList(req.body);
    // console.log("searchingResult:", searchingResult);
    if (searchingResult.success === true) {
      res.json(success({ data: searchingResult.data, message: "查詢成功", req, res }));
    } else {
      res.json(error({ message: "發生錯誤", req, res }));
    }
  } catch (err) {
    res.json(error({ message: "發生錯誤", req, res }));
  }
}

export async function searchingStoredValueCardById(req: Request, res: Response) {
  try {
    const searchingResult = await pool.query(
      `SELECT * FROM stored_value_card_list WHERE stored_value_card_id = '${req.params.storedValueCardId}' AND user_id='${req.body.userId}'`,
    );
    // console.log("searchingResult:", searchingResult.rows);
    if (searchingResult.rows.length === 1) {
      res.json(success({ data: keysToCamel(searchingResult.rows[0]), req, res }));
    } else {
      res.json(error({ message: "現金流不存在", req, res }));
    }
  } catch (err) {
    res.json(error({ req, res }));
  }
}

export async function storedValueCardCreate(req: Request, res: Response) {
  try {
    const createResult = await storedValueCardListServices.insertStoredValueCardData(req.body);
    // console.log("createResult:", createResult);
    if (createResult.success === true) {
      res.json(success({ data: createResult, message: "建立成功", req, res }));
    } else {
      res.json(error({ message: "資料錯誤", req, res }));
    }
  } catch (err) {
    res.json(error({ req, res }));
  }
}

export async function storedValueCardUpdate(req: Request, res: Response) {
  try {
    const updateResult = await storedValueCardListServices.updateStoredValueCardData(req.body);
    if (updateResult) {
      res.json(success({ message: "修改成功", req, res }));
    } else {
      res.json(error({ message: "修改失敗", req, res }));
    }
  } catch (err) {
    res.status(500).json(error({ req, res }));
  }
}

export async function enableStoredValueCard(req: Request, res: Response) {
  req.body.storedValueCardId = req.params.storedValueCardId;

  try {
    const adjustResult = await storedValueCardListServices.enableStoredValueCardStatus(req.body);
    if (adjustResult) {
      res.json(success({ message: "啟用成功", req, res }));
    } else {
      res.json(error({ req, res }));
    }
  } catch (err) {
    res.json(error({ req, res }));
  }
}

export async function disableStoredValueCard(req: Request, res: Response) {
  req.body.storedValueCardId = req.params.storedValueCardId;

  try {
    const adjustResult = await storedValueCardListServices.disableStoredValueCardStatus(req.body);
    if (adjustResult) {
      res.json(success({ message: "已停用", req, res }));
    } else {
      res.json(error({ req, res }));
    }
  } catch (err) {
    res.json(error({ req, res }));
  }
}

export async function storedValueCardDelete(req: Request, res: Response) {
  req.body.storedValueCardId = req.params.storedValueCardId;

  try {
    const removeResult = await storedValueCardListServices.removeStoredValueCardData(req.body);
    if (removeResult.success === true) {
      res.json(success({ message: removeResult.message, req, res }));
    } else {
      res.json(error({ message: removeResult.message, req, res }));
    }
  } catch (err) {
    res.json(error({ req, res }));
  }
}
