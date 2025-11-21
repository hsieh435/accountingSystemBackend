import pool from "@/db";
import { Request, Response } from "express";
import * as tradeService from "@/services/tradeCategory/tradeCategoryServices";
import { handleControllersResponse } from "@/controllers/controllersTools";
import { keysToCamel } from "@/utils/tools";

// credit card Schema
export async function getSchemasList(req: Request, res: Response) {

  try {
    const result = await pool.query("SELECT * FROM creditcard_schema_list ORDER BY sort");
    // console.log("result:", result);
    await handleControllersResponse(res, req, { success: true, data: result.rows });
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
  // const searchingSchemasResult = await pool.query(`SELECT * FROM creditcard_schema_list ORDER BY sort`);
  // // console.log("searchingSchemasResult:", searchingSchemasResult.rows);
  // if (searchingSchemasResult.rows.length > 0) {
  //   return res.json(success({ data: searchingSchemasResult.rows.map(keysToCamel), req, res }));
  // } else if (searchingSchemasResult.rows.length === 0) {
  //   return res.status(404).json(error({ message: "查無資料", req, res }));
  // }
}

export async function getSchemaById(req: Request, res: Response) {


  try {
    const result =
      await pool.query(`SELECT * FROM creditcard_schema_list WHERE schema_code = '${req.params.schemasCode}'`);
    // console.log("result:", result);
    await handleControllersResponse(res, req, { success: true, data: result.rows[0] });
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }

  // const searchingSchemaResult = await pool.query(
  //   `SELECT * FROM creditcard_schema_list WHERE schema_code = '${req.params.schemasCode}'`,
  // );
  // if (searchingSchemaResult.rows.length === 1) {
  //   return res.json(success({ data: keysToCamel(searchingSchemaResult.rows[0]), req, res }));
  // } else {
  //   return res.status(404).json(error({ message: "查無資料", req, res }));
  // }
}

export async function createSchema(req: Request, res: Response) {
  const { schemaCode, schemaName, sort } = req.body;
  const result = await pool.query(
    `INSERT INTO creditcard_schema_list (schema_code, schema_name, sort) VALUES ('${schemaCode}', '${schemaName}', ${sort});`,
  );
  if (result.rows.length === 1) {
    await handleControllersResponse(res, req, { success: true, data: result.rows[0] });
  } else if (result.rows.length === 0) {
    await handleControllersResponse(res, req, { success: false, data: [], message: "新增失敗" }, 400);
  }
}

export async function updateSchema(req: Request, res: Response) {
  const { schemaCode, schemaName, sort } = req.body;
  const result = await pool.query(
    `UPDATE creditcard_schema_list SET schema_name = '${schemaName}', sort = ${sort} WHERE schema_code = '${schemaCode}';`,
  );
  if (result.rowCount === 1) {
    await handleControllersResponse(res, req, { success: true, data: result.rows[0] });
  } else {
    await handleControllersResponse(res, req, { success: false, data: [], message: "更新失敗" }, 400);
  }
}

export async function deleteSchema(req: Request, res: Response) {
  const result = await pool.query(`DELETE FROM creditcard_schema_list WHERE schema_code = '${req.body.schemaCode}'`);
  if (result.rowCount === 1) {
    await handleControllersResponse(res, req, { success: true, data: result.rows[0], message: "刪除成功" });
  } else {
    await handleControllersResponse(res, req, { success: false, data: [], message: "刪除失敗" }, 400);
  }
}

// currency
export interface ICurrencyList {
  currencyCode: string;
  currencyName: string;
  currencySymbol: string;
  minimumDenomination: number;
  sort: number;
}

export async function getCurrencyList(req: Request, res: Response) {
  const result = await pool.query(`SELECT * FROM currency_list ORDER BY sort`);
  if (result.rows.length > 0) {
    await handleControllersResponse(res, req, { success: true, data: result.rows.map(keysToCamel), message: "查詢成功" });
  } else if (result.rows.length === 0) {
    await handleControllersResponse(res, req, { success: false, data: [], message: "查無資料" }, 404);
  }
}

export async function getEachCurrency(req: Request, res: Response) {
  const result = await pool.query(
    `SELECT * FROM currency_list WHERE currency_code = '${req.params.currencyCode}'`,
  );
  if (result.rows.length === 1) {
    await handleControllersResponse(res, req, { success: true, data: result.rows.map(keysToCamel), message: "查詢成功" });
  } else {
    await handleControllersResponse(res, req, { success: false, data: [], message: "查無資料" }, 404);
  }
}

export async function createCurrency(req: Request, res: Response) {
  // console.log("req.body:", req.body);
  const data: ICurrencyList = req.body;
  const result = await pool.query(
    `INSERT INTO public.currency_list(currency_code, currency_name, currency_symbol, minimum_denomination, sort) VALUES ('${data.currencyCode}', '${data.currencyName}', '${data.currencySymbol}', ${data.minimumDenomination}, ${data.sort});`,
  );
  if (result.rowCount === 1) {
    await handleControllersResponse(res, req, { success: true, data: result.rows[0], message: "新增成功" });
  } else {
    await handleControllersResponse(res, req, { success: false, data: [], message: "新增失敗" }, 400);
  }
}

export async function updateCurrency(req: Request, res: Response) {
  const { currencyCode, currencyName, sort } = req.body;
  const data: ICurrencyList = req.body;
  const result = await pool.query(
    `UPDATE public.currency_list SET currency_name='${data.currencyName}', currency_symbol='${data.currencySymbol}', minimum_denomination=${data.minimumDenomination}, sort=${data.sort} WHERE currency_code = '${data.currencyCode}';`,
  );
  if (result.rowCount === 1) {
    await handleControllersResponse(res, req, { success: true, data: result.rows[0], message: "更新成功" });
  } else {
    await handleControllersResponse(res, req, { success: false, data: [], message: "更新失敗" }, 400);
  }
}

export async function deleteCurrency(req: Request, res: Response) {
  // console.log("req.body:", req.body);
  // console.log("req.params:", req.params);

  const searchingCurrencyResult = await pool.query(
    `SELECT COUNT(*)::INTEGER AS total
      FROM (
      SELECT 1 FROM cashflow_list WHERE currency = '${req.params.currencyCode}' AND user_id = '${req.body.userId}'
      UNION ALL
      SELECT 1 FROM stored_value_card_list WHERE currency = '${req.params.currencyCode}' AND user_id = '${req.body.userId}'
      UNION ALL
      SELECT 1 FROM creditcard_list WHERE currency = '${req.params.currencyCode}' AND user_id = '${req.body.userId}'
      UNION ALL
      SELECT 1 FROM currency_account_list WHERE currency = '${req.params.currencyCode}' AND user_id = '${req.body.userId}'
      UNION ALL
      SELECT 1 FROM stock_account_list WHERE currency = '${req.params.currencyCode}' AND user_id = '${req.body.userId}'
      ) AS combined;
    `,
  );
  // console.log("searchingCurrencyResult:", searchingCurrencyResult.rows[0]);

  if (searchingCurrencyResult.rows[0].total > 0) {
    await handleControllersResponse(res, req, { success: false, message: "貨幣已被使用，無法刪除" }, 500);
    // return res.status(500).json(error({ message: "貨幣已被使用，無法刪除", req, res }));
  } else if (searchingCurrencyResult.rows[0].total === 0) {
    const deleteResult = await pool.query(
      `DELETE FROM currency_list WHERE currency_code = '${req.params.currencyCode}';`,
    );

    if (deleteResult.rowCount === 1) {
    await handleControllersResponse(res, req, { success: true, message: "刪除成功" });
    } else {
    await handleControllersResponse(res, req, { success: false, data: [], message: "刪除失敗" }, 400);
    }
  } else {
  }
}

// tradeCategory
export const getAll = async (req: Request, res: Response) => {
  try {
    const result = await tradeService.getAllTradeCategory();
    // console.log("result:", result);
    return await handleControllersResponse(res, req, result);
  } catch (err) {
    return await handleControllersResponse(res, req, err);
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const result = await tradeService.getTradeCategoryByCode(req.params.code);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
};

export const create = async (req: Request, res: Response) => {
  //
  try {
    const result = await tradeService.createTradeCategory(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
};

export async function update(req: Request, res: Response) {
  //
  try {
    const result = await tradeService.updateTradeCategory(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const result = await tradeService.removeTradeCategory(req.params.code);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
}
