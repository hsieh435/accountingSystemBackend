// snake_case 轉 camelCase
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// 物件的 key 轉成 camelCase
export function keysToCamel<T extends object>(obj: T): any {
  if (Array.isArray(obj)) {
    return obj.map((v) => keysToCamel(v));
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
export function getCurrentYMD(dateInput: string | number = ""): string  {
  const date = dateInput ? new Date(dateInput) : new Date();

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const dayofMonth = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${dayofMonth}`;
}

// 取得當下或日期時間字串年分，type 為 number
export function getCurrentYear(dateString: string | number | Date = "") {
  return dateString === "" ? new Date().getFullYear() : new Date(dateString).getFullYear();
}

// 取得當下或日期時間字串月分，type 為 number
export function getCurrentMonth(dateString: string | number | Date = "") {
  return dateString === "" ? new Date().getMonth() + 1 : new Date(dateString).getMonth() + 1;
}

// 取得當下或日期時間字串日，type 為 number
export function getCurrentDate(dateString: string | number | Date = "") {
  return dateString === "" ? new Date().getDate() : new Date(dateString).getDate();
}

// 取得特定月份的天数
export function getDaysInMonth(year: number | string = "", month: number | string = ""): number {
  // console.log("year-month:", year, month);
  // console.log("day:", new Date(year, month, 0));
  // console.log("day:", new Date(year, month, 0).getDate());
  return new Date(year === "" ? getCurrentYear() : Number(year), month === "" ? getCurrentMonth() : Number(month), 0).getDate();
}

// 取得時間戳，type 為 number
export function getCurrentTimestamp(dateTimes: string | number | Date = "") {
  return dateTimes === "" ? new Date().getTime() : new Date(dateTimes).getTime();
}



// 西元年日期格式 yyyy / mm / dd hh:mm:ss 或 yyyy / mm / dd
export function yearMonthDayTimeFormat(dateString: Date | string | number, hasTime: boolean = true): string {
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
  return dateString ? new Date(dateString).toISOString() : new Date().toISOString();
}

// 取得當前時間戳，並轉換為 UTC 字串
export function getTimeStampWithZone() {
  return setTimezone(yearMonthDayTimeFormat(getCurrentTimestamp()));
}
