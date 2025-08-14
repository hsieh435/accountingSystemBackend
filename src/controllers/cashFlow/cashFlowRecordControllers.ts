import pool from "@/db";
import { Request, Response } from "express";
import { success, error } from "@/utils/response";
import * as cashFlowRecordServices from "@/services/cashFlow/cashFlowRecordServices";
import { keysToCamel } from "@/utils/tools";
