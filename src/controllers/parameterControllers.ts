import pool from "@/db";
import { Request, Response } from "express";
import * as tradeService from "@/services/tradeCategory/tradeCategoryServices";
import { handleControllersResponse } from "@/controllers/controllersTools";
// import { keysToCamel } from "@/utils/tools";

// credit card Schema
export async function getSchemasList(req: Request, res: Response) {
  try {
    const result = await pool.query("SELECT * FROM creditcard_schema_list ORDER BY sort");
    // console.log("result:", result);
    await handleControllersResponse(res, req, { success: true, data: result.rows });
  } catch (err) {
    await handleControllersResponse(res, req, { success: false, data: [], message: "發生錯誤" }, 404);
  }
}

export async function getSchemaById(req: Request, res: Response) {
  try {
    const result =
      await pool.query(`SELECT * FROM creditcard_schema_list WHERE schema_code = '${req.params.schemasCode}'`);
    // console.log("result:", result);
    await handleControllersResponse(res, req, { success: true, data: result.rows[0] });
  } catch (err) {
    await handleControllersResponse(res, req, { success: false, data: [], message: "發生錯誤" }, 404);
  }
}

export async function createSchema(req: Request, res: Response) {

  try {
    const result = await pool.query(
      `INSERT INTO creditcard_schema_list (schema_code, schema_name, sort)
      VALUES ('${req.body.schemaCode}', '${req.body.schemaName}', ${req.body.sort});`,
    );
    if (result.rows.length === 1) {
      await handleControllersResponse(res, req, { success: true, data: result.rows[0] });
    } else if (result.rows.length === 0) {
      await handleControllersResponse(res, req, { success: false, data: [], message: "新增失敗" }, 400);
    }
  } catch (err) {
    await handleControllersResponse(res, req, { success: false, data: [], message: "發生錯誤" }, 404);
  }
}

export async function updateSchema(req: Request, res: Response) {

  try {
    const result = await pool.query(
      `UPDATE creditcard_schema_list SET schema_name = '${req.body.schemaName}', sort = ${req.body.sort}
      WHERE schema_code = '${req.body.schemaCode}';`,
    );
    if (result.rowCount === 1) {
      await handleControllersResponse(res, req, { success: true, data: result.rows[0] });
    } else {
      await handleControllersResponse(res, req, { success: false, data: [], message: "更新失敗" }, 400);
    }
  } catch (err) {
    await handleControllersResponse(res, req, { success: false, data: [], message: "發生錯誤" }, 404);
  }
}

export async function deleteSchema(req: Request, res: Response) {
  try {
    const result = await pool.query(`DELETE FROM creditcard_schema_list WHERE schema_code = '${req.body.schemaCode}'`);
    if (result.rowCount === 1) {
      await handleControllersResponse(res, req, { success: true, data: result.rows[0], message: "刪除成功" });
    } else {
      await handleControllersResponse(res, req, { success: false, data: [], message: "刪除失敗" }, 400);
    }
  } catch (err) {
    await handleControllersResponse(res, req, { success: false, data: [], message: "發生錯誤" }, 404);
  }
}

export interface ICurrencyList {
  currencyCode: string;
  currencyName: string;
  currencySymbol: string;
  minimumDenomination: number;
  sort: number;
}

export async function getCurrencyList(req: Request, res: Response) {
  try {
    const result = await pool.query("SELECT * FROM currency_list ORDER BY sort");
    if (result.rows.length > 0) {
      await handleControllersResponse(res, req, {
        success: true,
        // data: result.rows.map(keysToCamel),
        data: result.rows,
        message: "查詢成功",
      });
    } else if (result.rows.length === 0) {
      await handleControllersResponse(res, req, { success: false, data: [], message: "查無資料" }, 404);
    }
  } catch (err) {
    await handleControllersResponse(res, req, { success: false, data: [], message: "發生錯誤" }, 404);
  }
}

export async function getEachCurrency(req: Request, res: Response) {
  try {
    const result = await pool.query(`SELECT * FROM currency_list WHERE currency_code = '${req.params.currencyCode}'`);
    if (result.rows.length === 1) {
      await handleControllersResponse(res, req, {
        success: true,
        // data: result.rows.map(keysToCamel),
        data: result.rows,
        message: "查詢成功",
      });
    } else {
      await handleControllersResponse(res, req, { success: false, data: [], message: "查無資料" }, 404);
    }
  } catch (err) {
    await handleControllersResponse(res, req, { success: false, data: [], message: "發生錯誤" }, 404);
  }
}

export async function createCurrency(req: Request, res: Response) {
  // console.log("req.body:", req.body);
  const data: ICurrencyList = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO public.currency_list(currency_code, currency_name, currency_symbol, minimum_denomination, sort) VALUES ('${data.currencyCode}', '${data.currencyName}', '${data.currencySymbol}', ${data.minimumDenomination}, ${data.sort});`,
    );
    if (result.rowCount === 1) {
      await handleControllersResponse(res, req, { success: true, data: result.rows[0], message: "新增成功" });
    } else {
      await handleControllersResponse(res, req, { success: false, data: [], message: "新增失敗" }, 400);
    }
  } catch (err) {
    await handleControllersResponse(res, req, { success: false, data: [], message: "發生錯誤" }, 404);
  }
}

export async function updateCurrency(req: Request, res: Response) {

  try {
    const result = await pool.query(`
      UPDATE public.currency_list SET currency_name = '${req.body.currencyName}', currency_symbol = '${req.body.currencySymbol}', minimum_denomination = ${req.body.minimumDenomination}, sort = ${req.body.sort}
      WHERE currency_code = '${req.body.currencyCode}';
    `);
    if (result.rowCount === 1) {
      await handleControllersResponse(res, req, { success: true, data: result.rows[0], message: "更新成功" });
    } else {
      await handleControllersResponse(res, req, { success: false, data: [], message: "更新失敗" }, 400);
    }
  } catch (err) {
    await handleControllersResponse(res, req, { success: false, data: [], message: "發生錯誤" }, 404);
  }
}

export async function deleteCurrency(req: Request, res: Response) {
  // console.log("req.body:", req.body);
  // console.log("req.params:", req.params);

  try {
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
    } else if (searchingCurrencyResult.rows[0].total === 0) {
      const deleteResult =
        await pool.query(`DELETE FROM currency_list WHERE currency_code = '${req.params.currencyCode}'`);

      if (deleteResult.rowCount === 1) {
        await handleControllersResponse(res, req, { success: true, message: "刪除成功" });
      } else {
        await handleControllersResponse(res, req, { success: false, data: [], message: "刪除失敗" }, 400);
      }
    } else {
    }
  } catch (err) {
    await handleControllersResponse(res, req, { success: false, data: [], message: "發生錯誤" }, 404);
  }
}

// tradeCategory
export async function getAll(req: Request, res: Response) {
  try {
    const result = await tradeService.getAllTradeCategory();
    // console.log("result:", result);
    return await handleControllersResponse(res, req, result);
  } catch (err) {
    return await handleControllersResponse(res, req, err);
  }
};

export async function getOne(req: Request, res: Response) {
  try {
    const result = await tradeService.getTradeCategoryByCode(req.params.code);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
};

export async function create(req: Request, res: Response) {
  try {
    const result = await tradeService.createTradeCategory(req.body);
    await handleControllersResponse(res, req, result);
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }
};

export async function update(req: Request, res: Response) {
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
