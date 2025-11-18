export const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "untitled";

export function groupBy<T, K extends string | number>(
  list: T[],
  getKey: (item: T) => K
): Record<K, T[]> {
  return list.reduce((acc: any, item) => {
    const k = getKey(item);
    (acc[k] ||= []).push(item);
    return acc;
  }, {} as Record<K, T[]>);
}