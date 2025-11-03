import { Router } from "express";
import authenticateToken from "@/utils/authMiddleware";
import * as outerSystemLogin from "@/controllers/outerWebApi/outerSystemLogin";
import * as outerWebApiStockControllers from "@/controllers/outerWebApi/stockControllers";
import * as outerWebApiCurrencyExRateControllers from "@/controllers/outerWebApi/currencyExRateControllers";

const router = Router();

router.post("/api/outerWebApi/findMind/testConnection", outerSystemLogin.loginFinMindSystem);
router.get("/api/outerWebApi/findMind/accountInfo", outerSystemLogin.checkFinMindTokenUsage);



// stock
router.get("/api/outerWebApi/stockInfo/:keyword", authenticateToken, outerWebApiStockControllers.getAllStockList);
router.post(
  "/api/outerWebApi/stockInfo/rangeValue",
  authenticateToken,
  outerWebApiStockControllers.getStockPriceHistoryRecord,
);
router.post(
  "/api/outerWebApi/stockInfo/dividendResult",
  authenticateToken,
  outerWebApiStockControllers.getStockDividendResult,
);
router.post("/api/outerWebApi/stockInfo/stockPerPbr", authenticateToken, outerWebApiStockControllers.getStockPerPbrInfo);



// currency
router.get(
  "/api/outerWebApi/currencyExRateInfo/currencyListFromOuterApi/:keyword",
  authenticateToken,
  outerWebApiCurrencyExRateControllers.getCurrencyListByOuterApi
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
