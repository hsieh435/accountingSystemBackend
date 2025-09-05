import { Router } from "express";
import authenticateToken from "@/utils/authMiddleware";
import * as storedValueCardListControllers from "@/controllers/storedValueCard/storedValueCardListControllers";
import * as storedValueCardRecordControllers from "@/controllers/storedValueCard/storedValueCardRecordControllers";

const router = Router();

router.post("/api/storedValueCard/list", authenticateToken, storedValueCardListControllers.storedValueCardDataList);
router.get("/api/storedValueCard/:storedValueCardId", authenticateToken, storedValueCardListControllers.searchingStoredValueCardById);
router.post("/api/storedValueCard/create", authenticateToken, storedValueCardListControllers.storedValueCardCreate);
router.put("/api/storedValueCard/update", authenticateToken, storedValueCardListControllers.storedValueCardUpdate);
router.get("/api/storedValueCard/enable/:storedValueCardId", authenticateToken, storedValueCardListControllers.enableStoredValueCard);
router.get("/api/storedValueCard/disable/:storedValueCardId", authenticateToken, storedValueCardListControllers.disableStoredValueCard);
router.get("/api/storedValueCard/delete/:storedValueCardId", authenticateToken, storedValueCardListControllers.storedValueCardDelete);



router.post("/api/storedValueCardRecord/list", authenticateToken, storedValueCardRecordControllers.storedValueCardRecordList);
router.post("/api/storedValueCardRecordById", authenticateToken, storedValueCardRecordControllers.searchingStoredValueCardRecordById);
router.post("/api/storedValueCardRecord/create", authenticateToken, storedValueCardRecordControllers.storedValueCardRecordCreate);
router.post("/api/storedValueCardRecord/update", authenticateToken, storedValueCardRecordControllers.storedValueCardRecordUpdate);

export default router;
