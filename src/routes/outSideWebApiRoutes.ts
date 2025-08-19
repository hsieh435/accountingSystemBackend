import { Router } from "express";
import authenticateToken from "@/utils/authMiddleware";
import * as outSideWebApiControllers from "@/controllers/outSideWebApi/stockControllers";



const router = Router();



router.get("/api/outSideWebApi/stockInfo/:keyword", authenticateToken, outSideWebApiControllers.getAllStockList);
router.get("/api/outSideWebApi/stockInfo/:code", authenticateToken, outSideWebApiControllers.getEachStockList);
router.post("/api/outSideWebApi/stockInfo/rangeValue", authenticateToken, outSideWebApiControllers.getStockPriceByDateRange);



export default router;
