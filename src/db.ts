import { Pool, types } from "pg";



// 將 PostgreSQL 的數字類型轉換為 JavaScript 的數字類型
types.setTypeParser(1700, val => {
  // console.log("val:", val);
  // console.log("val:", parseFloat(val));
  return val === null ? null : parseFloat(val);
});


types.setTypeParser(1114, val => val);



const pool = new Pool({
  user: "postgres",
  host: "127.0.0.1",
  database: "accountingSystem",
  password: "0000",
  port: 5432,
  max: 100,
  min: 0,
});



// console.log("Pool:", pool);
export default pool;
