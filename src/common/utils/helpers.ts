/**
 * Type check for returned data
 *
 * @param data
 * @returns Boolean
 */
export function isData<T>(data: T | Error): data is T {
  return data instanceof Error !== true;
}
