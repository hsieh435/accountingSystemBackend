
// 把 snake_case 轉 camelCase
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// 把物件的所有 key 轉成 camelCase
export function keysToCamel<T extends object>(obj: T): any {
  if (Array.isArray(obj)) {
    return obj.map(v => keysToCamel(v));
  } else if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        toCamelCase(key),
        keysToCamel(value)
      ])
    );
  }
  return obj;
}
