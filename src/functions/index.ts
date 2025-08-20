export const generateRandomNumbers = (length: number = 6): string => {
  const array: Uint8Array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte % 10).join("");
};
