import { Router } from "express";
import authenticateToken from "@/utils/authMiddleware";
import * as outerWebApiControllers from "@/controllers/outerWebApi/stockControllers";



const router = Router();



router.get("/api/outerWebApi/stockInfo/:keyword", authenticateToken, outerWebApiControllers.getAllStockList);
router.get("/api/outerWebApi/stockInfo/:code", authenticateToken, outerWebApiControllers.getEachStockList);
router.post("/api/outerWebApi/stockInfo/rangeValue", authenticateToken, outerWebApiControllers.getStockPriceByDateRange);



export default router;
