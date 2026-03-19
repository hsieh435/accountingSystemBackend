import pool from "@/db";
import { Request, Response } from "express";
import { handleControllersResponse } from "@/controllers/controllersTools";

// 功能群組列表 interface
export interface IFunctionGroupList {
  functionGroupId: string;
  functionGroupName: string;
  functionGroupIcon: string;
  sort: number;
  functionList: {
    functionGroupId: string;
    functionId: string;
    functionName: string;
    url: string;
    functionIcon: string;
    sort: number;
  }[];
}

export async function functionListSearching(req: Request, res: Response) {

  try {
    const searchingFunctionGroup = await pool.query(`
      SELECT fGroup.*,
        COALESCE(json_agg(
          json_build_object(
            'function_group_id', fList.function_group_id,
            'function_id', fList.function_id,
            'function_name', fList.function_name,
		        'url', '/mainView/' || fList.url,
            'function_icon', fList.function_icon,
            'sort', fList.sort
          ) ORDER BY fList.sort
        ) FILTER (WHERE fList.function_group_id IS NOT NULL), '[]'::json) AS function_list
      FROM function AS fList
      LEFT JOIN function_group AS fGroup ON fList.function_group_id = fGroup.function_group_id
      GROUP BY fGroup.function_group_id, fGroup.function_group_name, fGroup.function_group_icon, fGroup.sort, fList.function_group_id
      ORDER BY fGroup.sort`);

    await handleControllersResponse(res, req, { success: true, data: searchingFunctionGroup.rows, message: "查詢成功", });
  } catch (err) {
    await handleControllersResponse(res, req, err);
  }

  // try {
  //   const searchingFunctionGroup = await pool.query("SELECT * FROM public.function_group ORDER BY sort ASC");

  //   const searchingFunction =
  //     await pool.query("SELECT * FROM public.function ORDER BY function_group_id ASC, sort ASC");

  //   const functionGroupList: IFunctionGroupList[] = searchingFunctionGroup.rows.map((group) => {
  //     const functions = searchingFunction.rows
  //       .filter((func) => func.function_group_id === group.function_group_id)
  //       .map((func) => ({
  //         functionGroupId: func.function_group_id,
  //         functionId: func.function_id,
  //         functionName: func.function_name,
  //         url: "/mainView/" + func.url,
  //         functionIcon: "i-lucide-" + func.function_icon,
  //         sort: func.sort,
  //       }));
  //     return {
  //       functionGroupId: group.function_group_id,
  //       functionGroupName: group.function_group_name,
  //       functionGroupIcon: "i-lucide-" + group.function_group_icon,
  //       sort: group.sort,
  //       functionList: functions,
  //     };
  //   });
  //   await handleControllersResponse(res, req, { success: true, data: functionGroupList, message: "查詢成功" });
  // } catch (err) {
  //   await handleControllersResponse(res, req, err);
  // }
}
