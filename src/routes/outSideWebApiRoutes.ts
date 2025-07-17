import { Router } from "express";
import authenticateToken from "@/utils/authMiddleware";
import * as outSideWebApiControllers from "@/controllers/outSideWebApiControllers";



const router = Router();



router.get("/api/outSideWebApi/stockList", authenticateToken, outSideWebApiControllers.getAllStockList);
router.get("/api/outSideWebApi/:code", authenticateToken, outSideWebApiControllers.getEachStockList);



export default router;
