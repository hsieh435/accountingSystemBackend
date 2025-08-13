import pool from "@/db";
import { Request, Response } from "express";
import { success, error } from "@/utils/response";
import { keysToCamel } from "@/utils/tools";



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
    const searchingFunctionGroup = await pool.query(`SELECT * FROM public.function_group ORDER BY sort ASC`);

    const searchingFunction = await pool.query(
      `SELECT * FROM public.function ORDER BY function_group_id ASC, sort ASC`,
    );

    const functionGroupList: IFunctionGroupList[] = searchingFunctionGroup.rows.map((group) => {
      const functions = searchingFunction.rows
        .filter((func) => func.function_group_id === group.function_group_id)
        .map((func) => ({
          functionGroupId: func.function_group_id,
          functionId: func.function_id,
          functionName: func.function_name,
          url: "/mainView/" + func.url,
          functionIcon: "i-lucide-" + func.function_icon,
          sort: func.sort,
        }));
      return {
        functionGroupId: group.function_group_id,
        functionGroupName: group.function_group_name,
        functionGroupIcon: "i-lucide-" + group.function_group_icon,
        sort: group.sort,
        functionList: functions,
      };
    });

    // console.log("functionGroupList:", functionGroupList);
    res.json(success({ message: "查詢成功", req, res, data: keysToCamel(functionGroupList) }));
  } catch (err) {
    res.json(error({ req, res }));
  }
}
