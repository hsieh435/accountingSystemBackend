import express from "express";
import cors from "cors";
import pool from "@/db";
import { createServer, IncomingMessage, ServerResponse } from "http";
import dotenv from "dotenv";
dotenv.config();



import generalRoutes from "@/routes/generalRoutes";
import outSideWebApiRoutes from "@/routes/outSideWebApiRoutes";
import tradeCategoryRoutes  from "@/routes/tradeCategoryRoutes";
import userDataRoutes from "@/routes/userDataRoutes";



const app = express();
const port = 3600;



// app.use(cors());
app.use(cors({
  origin: "http://localhost:3000", // 僅允許這個網域發請求（例如你的前端）
  credentials: true,               // 若有傳送 cookie 或授權資訊
}));



app.use(express.json());
app.use("/accounting_system_backend", generalRoutes);
app.use("/accounting_system_backend", outSideWebApiRoutes);
app.use("/accounting_system_backend", tradeCategoryRoutes);
app.use("/accounting_system_backend", userDataRoutes);



// const server = createServer((request: IncomingMessage, response: ServerResponse) => {
//   response.on("error", (err) => {
//     console.error(err);
//   });
//   response.writeHead(200, { "Content-Type": "text/plain" });
//   response.end("Hello world!");
// });


// server.listen(port);
// console.log(`server is running on http://localhost:${port}`);

app.listen(port, () => {
  console.log(`OK! http://localhost:${port}`);
});
