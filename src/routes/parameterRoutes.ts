import { Router } from "express";
import authenticateToken from "@/utils/authMiddleware";
import * as parameterControllers from "@/controllers/parameterControllers";


const router = Router();



router.get("/api/parameters/schemasList", authenticateToken, parameterControllers.getSchemasList);
router.get("/api/parameters/schemas/:schemasCode", authenticateToken, parameterControllers.getSchemaById);
router.post("/api/parameters/schemas/create", authenticateToken, parameterControllers.createSchema);
router.put("/api/parameters/schemas/update", authenticateToken, parameterControllers.updateSchema);
router.delete("/api/parameters/schemas/:schemasCode", authenticateToken, parameterControllers.deleteSchema);



export default router;