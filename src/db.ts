import { Pool, types } from "pg";



// 將 PostgreSQL 的 numeric 型別轉換為 JavaScript 的 number 型別
types.setTypeParser(1700, val => {
  // console.log("val:", val);
  // console.log("val:", parseFloat(val));
  return val === null ? null : parseFloat(val);
});

// 將 PostgreSQL 的 timestamp 型別轉換為 JavaScript 的 string 型別
types.setTypeParser(1114, val => val);
types.setTypeParser(1184, val => val);



// 查詢資料型別 OID 語法
// SELECT * FROM pg_type order by typname

// 常見資料型別 OID
// numeric 1700
// varchar 1043
// text 25
// boolean 16
// date 1082
// time 1083
// timestamp without time zone 1114
// timestamp with time zone 1184
// uuid 2950



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
