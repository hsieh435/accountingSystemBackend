import { Router } from "express";
import authenticateToken from "@/utils/authMiddleware";
import * as parameterControllers from "@/controllers/parameterControllers";


const router = Router();



// credit card Schema
router.get("/api/parameters/schemasList", authenticateToken, parameterControllers.getSchemasList);
router.get("/api/parameters/schemas/:schemasCode", authenticateToken, parameterControllers.getSchemaById);
router.post("/api/parameters/schemas/create", authenticateToken, parameterControllers.createSchema);
router.put("/api/parameters/schemas/update", authenticateToken, parameterControllers.updateSchema);
router.delete("/api/parameters/schemas/:schemasCode", authenticateToken, parameterControllers.deleteSchema);



// currency
router.get("/api/parameters/currencyList", authenticateToken, parameterControllers.getCurrencyList);
router.get("/api/parameters/currency/:currencyCode", authenticateToken, parameterControllers.getEachCurrency);
router.post("/api/parameters/currency/create", authenticateToken, parameterControllers.createCurrency);
router.put("/api/parameters/currency/update", authenticateToken, parameterControllers.updateCurrency);
router.delete("/api/parameters/currency/:currencyCode", authenticateToken, parameterControllers.deleteCurrency);




export default router;
