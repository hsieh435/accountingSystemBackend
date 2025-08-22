import { Router } from "express";
import authenticateToken from "@/utils/authMiddleware";
import * as outerWebApiStockControllers from "@/controllers/outerWebApi/stockControllers";
import * as outerWebApiCurrencyExRateControllers from "@/controllers/outerWebApi/currencyExRateControllers";

const router = Router();

router.get("/api/outerWebApi/stockInfo/:keyword", authenticateToken, outerWebApiStockControllers.getAllStockList);
router.get("/api/outerWebApi/stockInfo/:code", authenticateToken, outerWebApiStockControllers.getEachStockList);
router.post(
  "/api/outerWebApi/stockInfo/rangeValue",
  authenticateToken,
  outerWebApiStockControllers.getStockPriceHistoryRecord,
);

router.get(
  "/api/outerWebApi/currencyExRateInfo/latest/:currencyCode",
  authenticateToken,
  outerWebApiCurrencyExRateControllers.getLatestCurrencyExchangeRate,
);
router.post(
  "/api/outerWebApi/currencyExRateInfo/history",
  authenticateToken,
  outerWebApiCurrencyExRateControllers.getCurrencyExRateHistory,
);

export default router;
