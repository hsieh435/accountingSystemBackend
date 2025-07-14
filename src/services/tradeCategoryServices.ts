import pool from "./../db";



export const getAllTradeCategory = async () => {
  const result = await pool.query("SELECT * FROM trade_category ORDER BY sort");
  return result.rows;
};



export const getTradeByCode = async (code: string) => {
  const result = await pool.query("SELECT * FROM trade_category WHERE category_code = $1", [code]);
  return result.rows[0];
};



export const createTrade = async (code: string, name: string, sort: number) => {
  const result = await pool.query(
    "INSERT INTO trades (trade_code, trade_name, sort) VALUES ($1, $2, $3) RETURNING *",
    [code, name, sort]
  );
  return result.rows[0];
};



export const updateTrade = async (code: string, name: string, sort: number) => {
  const result = await pool.query(
    "UPDATE trades SET trade_name = $1, sort = $2 WHERE trade_code = $3 RETURNING *",
    [name, sort, code]
  );
  return result.rows[0];
};

export const deleteTrade = async (code: string) => {
  const result = await pool.query(
    "DELETE FROM trades WHERE trade_code = $1 RETURNING *",
    [code]
  );
  return result.rows[0];
};