/**
 * 替换字符串中的 %key% 变量
 * @example formatText("Hello %name%", { name: "Touka" }) => "Hello Touka"
 */
export function formatText(
  template: string | undefined,
  params: Record<string, string | number>,
): string {
  if (!template) return '';
  return template.replace(/%(\w+)%/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match;
  });
}

/**
 * 从数组中随机抽取一个元素
 */
export function getRandomItem<T>(arr: T[] | undefined): T | string {
  if (!arr || arr.length === 0) return '';
  return arr[Math.floor(Math.random() * arr.length)];
}
