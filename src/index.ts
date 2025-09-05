import express from "express";
import cors from "cors";
import { createServer, IncomingMessage, ServerResponse } from "http";
import dotenv from "dotenv";
dotenv.config();



import cashFlowRoutes from "@/routes/cashFlowRoutes"
import creditCardRoutes from "@/routes/creditCardRoutes"
import currencyAccountRoutes from "@/routes/currencyAccountRoutes";
import functionListRoutes from "@/routes/functionListRoutes";
import generalRoutes from "@/routes/generalRoutes";
import outerWebApiRoutes from "@/routes/outerWebApiRoutes";
import parameterRoutes from "@/routes/parameterRoutes";
import stockAccountRoutes from "@/routes/stockAccountRoutes";
import userDataRoutes from "@/routes/userDataRoutes";
import storedValueCardRoutes from "@/routes/storedValueCardRoutes";



const app = express();
const port = 3600;



// app.use(cors());
app.use(cors({
  origin: "http://localhost:3000", // 僅允許這個網域發請求（例如你的前端）
  credentials: true,               // 若有傳送 cookie 或授權資訊
}));



app.use(express.json());
app.use("/accounting_system_backend", cashFlowRoutes);
app.use("/accounting_system_backend", creditCardRoutes);
app.use("/accounting_system_backend", currencyAccountRoutes);
app.use("/accounting_system_backend", functionListRoutes);
app.use("/accounting_system_backend", generalRoutes);
app.use("/accounting_system_backend", outerWebApiRoutes);
app.use("/accounting_system_backend", parameterRoutes);
app.use("/accounting_system_backend", stockAccountRoutes);
app.use("/accounting_system_backend", userDataRoutes);
app.use("/accounting_system_backend", storedValueCardRoutes);

app.listen(port, () => {
  console.log(`${port} port`);
});
