import { Router } from "express";
import authenticateToken from "@/utils/authMiddleware";
import * as cashCardControllers from "@/controllers/cashCard/cashCardListControllers";
import * as cashCardRecordControllers from "@/controllers/cashCard/cashCardRecordControllers";

const router = Router();

router.post("/api/cashCard/list", authenticateToken, cashCardControllers.cashCardDataList);
router.get("/api/cashCardData/:cashCardId", authenticateToken, cashCardControllers.searchingCashCardById);
router.post("/api/cashCard/create", authenticateToken, cashCardControllers.cashCardCreate);
router.put("/api/cashCard/update", authenticateToken, cashCardControllers.cashCardUpdate);
router.get("/api/cashCard/enable/:cashCardId", authenticateToken, cashCardControllers.enableCashCard);
router.get("/api/cashCard/disable/:cashCardId", authenticateToken, cashCardControllers.disableCashCard);
router.get("/api/cashCard/delete/:cashCardId", authenticateToken, cashCardControllers.cashCardDelete);



router.post("/api/cashCardRecord/list", authenticateToken, cashCardRecordControllers.cashCardRecordList);
router.post("/api/cashCardRecordById", authenticateToken, cashCardRecordControllers.searchingCashCardRecordById);
router.post("/api/cashCardRecord/create", authenticateToken, cashCardRecordControllers.cashCardRecordCreate);
router.post("/api/cashCardRecord/update", authenticateToken, cashCardRecordControllers.cashCardRecordUpdate);

export default router;
