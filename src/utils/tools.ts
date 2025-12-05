// snake_case 轉 camelCase
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// 物件的 key 轉成 camelCase
export function keysToCamel<T extends object>(obj: T): any {
  if (Array.isArray(obj)) {
    return obj.map(v => keysToCamel(v));
  } else if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        // toCamelCase(key),
        key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
        keysToCamel(value),
      ]),
    );
  }
  return obj;
}



export function decodeJWT(token: string) {
  console.log("token:", token);
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT");
  const payload = parts[1];
  //
  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const decoded = Buffer.from(padded, "base64").toString("utf8");
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

// 取得當下時間戳，type 為 number
export function getCurrentTimestamp() {
  return new Date().getTime();
}



// 西元年日期格式 yyyy / mm / dd hh:mm:ss 或 yyyy / mm / dd
export function yearMonthDayTimeFormat(dateString: Date | string | number, hasTime: boolean = true): string {
  // const localDate = new Date();
  // 轉換為 UTC 字串
  // const utcString = localDate.toISOString();
  // console.log("UTC 時間:", utcString);


  const date = new Date(dateString);
  if (isNaN(date.getTime()) || !dateString) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return hasTime ? `${year} / ${month} / ${day} ${hours}:${minutes}:${seconds}` : `${year} / ${month} / ${day}`;
}

// 時間格式設定 Timezone
export function setTimezone(dateString: string | null = null): string {
  return dateString ? new Date(dateString).toISOString() : "";
}

// 取得當前時間戳，並轉換為 UTC 字串
export function getTimeStampWithZone() {
  return setTimezone(yearMonthDayTimeFormat(getCurrentTimestamp()));
}
