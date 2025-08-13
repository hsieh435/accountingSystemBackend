import pool from "@/db";
import { Request, Response } from "express";
import { success, error } from "@/utils/response";
import { keysToCamel } from "@/utils/tools";

// credit card Schema
export async function getSchemasList(req: Request, res: Response) {
  const searchingSchemasResult = await pool.query(`SELECT * FROM creditcard_schema_list ORDER BY sort`);
  // console.log("searchingSchemasResult:", searchingSchemasResult.rows);
  if (searchingSchemasResult.rows.length > 0) {
    return res.json(success({ data: searchingSchemasResult.rows.map(keysToCamel), req, res }));
  } else if (searchingSchemasResult.rows.length === 0) {
    return res.status(404).json(error({ message: "查無資料", req, res }));
  }
}

export async function getSchemaById(req: Request, res: Response) {
  const searchingSchemaResult = await pool.query(
    `SELECT * FROM creditcard_schema_list WHERE schema_code = '${req.params.schemasCode}'`,
  );
  if (searchingSchemaResult.rows.length === 1) {
    return res.json(success({ data: keysToCamel(searchingSchemaResult.rows[0]), req, res }));
  } else {
    return res.status(404).json(error({ message: "查無資料", req, res }));
  }
}

export async function createSchema(req: Request, res: Response) {
  const { schemaCode, schemaName, sort } = req.body;
  const result = await pool.query(
    `INSERT INTO creditcard_schema_list (schema_code, schema_name, sort) VALUES ('${schemaCode}', '${schemaName}', ${sort});`,
  );
  if (result.rows.length === 1) {
    return res.json(success({ data: keysToCamel(result.rows[0]), req, res }));
  } else if (result.rows.length === 0) {
    return res.status(400).json(error({ message: "新增失敗", req, res }));
  }
}

export async function updateSchema(req: Request, res: Response) {
  const { schemaCode, schemaName, sort } = req.body;
  const result = await pool.query(
    `UPDATE creditcard_schema_list SET schema_name = '${schemaName}', sort = ${sort} WHERE schema_code = '${schemaCode}';`,
  );
  if (result.rowCount === 1) {
    return res.json(success({ data: keysToCamel(result.rows[0]), req, res }));
  } else {
    return res.status(400).json(error({ message: "更新失敗", req, res }));
  }
}

export async function deleteSchema(req: Request, res: Response) {
  const result = await pool.query(`DELETE FROM creditcard_schema_list WHERE schema_code = '${req.body.schemaCode}';`);
  if (result.rowCount === 1) {
    return res.json(success({ data: { message: "刪除成功" }, req, res }));
  } else {
    return res.status(400).json(error({ message: "刪除失敗", req, res }));
  }
}

// currency
export async function getCurrencyList(req: Request, res: Response) {
  const searchingCurrencyResult = await pool.query(`SELECT * FROM currency_list ORDER BY sort`);
  if (searchingCurrencyResult.rows.length > 0) {
    return res.json(success({ data: searchingCurrencyResult.rows.map(keysToCamel), req, res }));
  } else if (searchingCurrencyResult.rows.length === 0) {
    return res.status(404).json(error({ message: "查無資料", req, res }));
  }
}

export async function getEachCurrency(req: Request, res: Response) {
  const searchingCurrencyResult = await pool.query(
    `SELECT * FROM currency_list WHERE currency_code = '${req.params.currencyCode}'`,
  );
  if (searchingCurrencyResult.rows.length === 1) {
    return res.json(success({ data: keysToCamel(searchingCurrencyResult.rows[0]), req, res }));
  } else {
    return res.status(404).json(error({ message: "查無資料", req, res }));
  }
}

export async function createCurrency(req: Request, res: Response) {
  // console.log("req.body:", req.body);
  const { currencyCode, currencyName, allowDelete, sort } = req.body;
  const result = await pool.query(
    `INSERT INTO currency_list (currency_code, currency_name, allow_delete, sort) VALUES ('${currencyCode}', '${currencyName}', ${allowDelete}, ${sort});`,
  );
  if (result.rowCount === 1) {
    return res.json(success({ data: keysToCamel(result.rows[0]), req, res }));
  } else {
    return res.status(400).json(error({ message: "新增失敗", req, res }));
  }
}

export async function updateCurrency(req: Request, res: Response) {
  const { currencyCode, currencyName, sort } = req.body;
  const result = await pool.query(
    `UPDATE currency_list SET currency_name = '${currencyName}', sort = ${sort} WHERE currency_code = '${currencyCode}';`,
  );
  if (result.rowCount === 1) {
    return res.json(success({ data: keysToCamel(result.rows[0]), req, res }));
  } else {
    return res.status(400).json(error({ message: "更新失敗", req, res }));
  }
}

export async function deleteCurrency(req: Request, res: Response) {
  // console.log("req.body:", req.body);

  const searchingCurrencyResult = await pool.query(
    `SELECT COUNT(*)::INTEGER AS total
      FROM (
      SELECT 1 FROM cashflow_list WHERE currency = '${req.params.currencyCode}'
      UNION ALL
      SELECT 1 FROM cashcard_list WHERE currency = '${req.params.currencyCode}'
      UNION ALL
      SELECT 1 FROM creditcard_list WHERE currency = '${req.params.currencyCode}'
      UNION ALL
      SELECT 1 FROM currency_accounts_list WHERE currency = '${req.params.currencyCode}'
      UNION ALL
      SELECT 1 FROM stock_accounts_list WHERE currency = '${req.params.currencyCode}'
      ) AS combined;
    `,
  );
  // console.log("searchingCurrencyResult:", searchingCurrencyResult.rows[0]);

  if (searchingCurrencyResult.rows[0].total > 0) {
    return res.json(error({ message: "貨幣已被使用，無法刪除", req, res }));
  } else if (searchingCurrencyResult.rows[0].total === 0) {
    const deleteResult =
      await pool.query(`DELETE FROM currency_list WHERE currency_code = '${req.params.currencyCode}';`,);

    if (deleteResult.rowCount === 1) {
      return res.json(success({ data: { message: "刪除成功" }, req, res }));
    } else {
      return res.status(400).json(error({ message: "刪除失敗", req, res }));
    }
  } else {

  }
}
