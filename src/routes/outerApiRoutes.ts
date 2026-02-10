import { Router } from "express";
import authenticateToken from "@/utils/authMiddleware";
import * as outerSystemLoginControllers from "@/controllers/outerApi/outerSystemLoginControllers";
import * as outerApiStockControllers from "@/controllers/outerApi/stockControllers";
import * as outerApiCurrencyExRateControllers from "@/controllers/outerApi/currencyExRateControllers";

const router = Router();

router.post("/api/outerApi/findMind/testConnection", outerSystemLoginControllers.loginFinMindSystem);
router.get("/api/outerApi/findMind/accountInfo", outerSystemLoginControllers.checkFinMindTokenUsage);



// stock
router.get("/api/outerApi/stockInfo/:keyword", authenticateToken, outerApiStockControllers.getAllStockList);
router.post("/api/outerApi/stockInfo/rangeValue", authenticateToken, outerApiStockControllers.getStockPriceHistoryRecord);
router.post("/api/outerApi/stockInfo/dividendResult", authenticateToken, outerApiStockControllers.getStockDividendResult);
router.post("/api/outerApi/stockInfo/stockPerPbr", authenticateToken, outerApiStockControllers.getStockPerPbrInfo);



// currency
router.get("/api/outerApi/currencyExRateInfo/currencyListFromOuterApi/:keyword", authenticateToken, outerApiCurrencyExRateControllers.getCurrencyListByOuterApi);
router.get("/api/outerApi/currencyExRateInfo/latest/:currencyCode", authenticateToken, outerApiCurrencyExRateControllers.getLatestCurrencyExchangeRate);
router.post("/api/outerApi/currencyExRateInfo/history", authenticateToken, outerApiCurrencyExRateControllers.getCurrencyExRateHistory);

export default router;
