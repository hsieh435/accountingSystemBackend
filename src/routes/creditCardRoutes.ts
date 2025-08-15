import { Router } from "express";
import authenticateToken from "@/utils/authMiddleware";
import * as creditCardControllers from "@/controllers/creditCard/creditCardListControllers";

const router = Router();

router.post("/api/creditCard/list", authenticateToken, creditCardControllers.creditCardDataList);
router.get("/api/creditCardData/:creditCardId", authenticateToken, creditCardControllers.searchingCreditCardById);
router.post("/api/creditCard/create", authenticateToken, creditCardControllers.creditCardCreate);
router.put("/api/creditCard/update", authenticateToken, creditCardControllers.creditCardUpdate);
router.get("/api/creditCard/enable/:creditCardId", authenticateToken, creditCardControllers.enableCreditCard);
router.get("/api/creditCard/disable/:creditCardId", authenticateToken, creditCardControllers.disableCreditCard);
router.get("/api/creditCard/delete/:creditCardId", authenticateToken, creditCardControllers.creditCardDelete);

export default router;
