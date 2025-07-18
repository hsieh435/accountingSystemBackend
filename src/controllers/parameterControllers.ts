import pool from "@/db";
import { Request, Response } from "express";
import { success, error } from "@/utils/response";
import { keysToCamel } from "@/utils/caseConverter";



export async function getSchemasList(req: Request, res: Response) {
  const searchingSchemasResult =
    await pool.query("SELECT * FROM creditcard_schema_list ORDER BY sort");
  // console.log("searchingSchemasResult:", searchingSchemasResult.rows);
  if (searchingSchemasResult.rows.length > 0) {
    return res.json(success({ data: searchingSchemasResult.rows.map(keysToCamel), req, res }));
  } else if (searchingSchemasResult.rows.length === 0) {
    return res.status(404).json(error({ message: "查無資料", req, res }));
  }
}



export async function getSchemaById(req: Request, res: Response) {
  const searchingSchemaResult =
    await pool.query(`SELECT * FROM creditcard_schema_list WHERE schema_code = "${req.params.schemasCode}"`);
  if (searchingSchemaResult.rows.length === 1) {
    return res.json(success({ data: keysToCamel(searchingSchemaResult.rows[0]), req, res }));
  } else {
    return res.status(404).json(error({ message: "查無資料", req, res }));
  }
}



export async function createSchema(req: Request, res: Response) {
  const { schemaCode, schemaName, sort } = req.body;
  const result =
    await pool.query(`INSERT INTO creditcard_schema_list (schema_code, schema_name, sort) VALUES ("${schemaCode}", "${schemaName}", ${sort});`);
  if (result.rows.length === 1) {
    return res.json(success({ data: keysToCamel(result.rows[0]), req, res }));
  } else if (result.rows.length === 0) {
    return res.status(400).json(error({ message: "新增失敗", req, res }));
  }
}



export async function updateSchema(req: Request, res: Response) {
  const { schemaCode, schemaName, sort } = req.body;
  const result =
    await pool.query(`UPDATE creditcard_schema_list SET schema_name = "${schemaName}", sort = ${sort} WHERE schema_code = "${schemaCode}";`);
  if (result.rowCount === 1) {
    return res.json(success({ data: keysToCamel(result.rows[0]), req, res }));
  } else {
    return res.status(400).json(error({ message: "更新失敗", req, res }));
  }
}



export async function deleteSchema(req: Request, res: Response) {
  const result =
    await pool.query(`DELETE FROM creditcard_schema_list WHERE schema_code = "${req.body.schemaCode}";`);
  if (result.rowCount === 1) {
    return res.json(success({ data: { message: "刪除成功" }, req, res }));
  } else {
    return res.status(400).json(error({ message: "刪除失敗", req, res }));
  }
}