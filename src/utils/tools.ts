
// 把 snake_case 轉 camelCase
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// 把物件的所有 key 轉成 camelCase
export function keysToCamel<T extends object>(obj: T): any {
  if (Array.isArray(obj)) {
    return obj.map(v => keysToCamel(v));
  } else if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        toCamelCase(key),
        keysToCamel(value)
      ])
    );
  }
  return obj;
}



export function decodeJWT(token: string) {
  console.log("token:", token);
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT');
  const payload = parts[1];
  //
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
  const decoded = Buffer.from(padded, 'base64').toString('utf8');
  console.log("JWT payload:", JSON.parse(decoded));
  return JSON.parse(decoded);
}




// 取得今日日期 yyyy-mm-dd
export function getCurrentYMD() {
  const date = new Date();

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const dayofMonth = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${dayofMonth}`;
}

// 取得當下年分
export function getCurrentYear() {
  return new Date().getFullYear();
}

// 取得當下月分
export function getCurrentMonth() {
  return new Date().getMonth() + 1;
}

// 取得當下日期
export function getCurrentDate() {
  return new Date().getDate();
}
