import { Router } from "express";
import authenticateToken from "@/utils/authMiddleware";
import * as creditCardControllers from "@/controllers/creditCard/creditCardListControllers";
import * as creditCardParamsControllers from "@/controllers/creditCard/creditCardParamsControllers";
import * as creditCardRecordControllers from "@/controllers/creditCard/creditCardRecordControllers";

const router = Router();



router.post("/api/creditCard/list", authenticateToken, creditCardControllers.creditCardDataList);
router.get("/api/creditCardData/:creditCardId", authenticateToken, creditCardControllers.searchingCreditCardById);
router.post("/api/creditCard/create", authenticateToken, creditCardControllers.creditCardCreate);
router.put("/api/creditCard/update", authenticateToken, creditCardControllers.creditCardUpdate);
router.get("/api/creditCard/enable/:creditCardId", authenticateToken, creditCardControllers.enableCreditCard);
router.get("/api/creditCard/disable/:creditCardId", authenticateToken, creditCardControllers.disableCreditCard);
router.get("/api/creditCard/delete/:creditCardId", authenticateToken, creditCardControllers.creditCardDelete);



router.post("/api/creditCard/limit", authenticateToken, creditCardParamsControllers.creditCardLimitation);
router.post("/api/creditCard/limitUpdate", authenticateToken, creditCardParamsControllers.creditCardLimitationUpdate);
router.put("/api/creditCard/monthExpenditure", authenticateToken, creditCardParamsControllers.creditCardExpenditure);



router.post("/api/creditCardRecord/list", authenticateToken, creditCardRecordControllers.creditCardRecordList);
router.post("/api/creditCardRecordById", authenticateToken, creditCardRecordControllers.searchingCreditCardRecordById);
router.post("/api/creditCardRecord/create", authenticateToken, creditCardRecordControllers.creditCardRecordCreate);
router.post("/api/creditCardRecord/update", authenticateToken, creditCardRecordControllers.creditCardRecordUpdate);
router.post("/api/creditCardRecord/delete", authenticateToken, creditCardRecordControllers.creditCardRecordDelete);

export default router;
