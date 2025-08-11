import { Router } from "express";
import authenticateToken from "@/utils/authMiddleware";
import * as creditCardControllers from "@/controllers/creditCardControllers";



const router = Router();



router.post("/api/creditCard/List", authenticateToken, creditCardControllers.creditCardDataList);
router.get("/api/creditCardData/:creditCardId", authenticateToken, creditCardControllers.searchingCreditCardById);
router.post("/api/creditCard/create", authenticateToken, creditCardControllers.cashDataCreate);
router.put("/api/creditCard/update", authenticateToken, creditCardControllers.cashDataUpdate);
router.get("/api/creditCard/delete/:creditCardId", authenticateToken, creditCardControllers.cashDataDelete);



export default router;
