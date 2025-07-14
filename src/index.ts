import express from "express";
import cors from "cors";
import pool from "./db";
import { createServer, IncomingMessage, ServerResponse } from "http";



import tradeCategoryRoutes  from "./routes/tradeCategoryRoutes";



// app.use(cors());
const app = express();
const port = 3600;



app.use(cors({
  origin: "http://localhost:3000", // 僅允許這個網域發請求（例如你的前端）
  credentials: true,               // 若有傳送 cookie 或授權資訊
}));



// app.get("", async (req, res) => {
//   console.log(100);
// });



// app.use(express.json());
app.use("/tradeCategory", tradeCategoryRoutes);



// app.get("/test", async (req, res) => {
//   console.log(100);
//   try {
//     const result = await pool.query("SELECT NOW()");
//     res.json(result.rows[0]);
//     console.log("result:", result);
//   } catch (err) {
//     console.error("DB Error:", err);
//     res.status(500).send("Database error");
//   }
// });



// const server = createServer((request: IncomingMessage, response: ServerResponse) => {
//   response.on("error", (err) => {
//     console.error(err);
//   });
//   response.writeHead(200, { "Content-Type": "text/plain" });
//   response.end("Hello world!");
// });


// server.listen(port);
console.log(`server is running on http://localhost:${port}`);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
