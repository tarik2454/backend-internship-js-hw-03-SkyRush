import crypto from "crypto";

export function generateRoll(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): number {
  const combined = `${serverSeed}:${clientSeed}:${nonce}`;
  const hash = crypto.createHmac("sha256", combined).digest("hex");
  const decimal = parseInt(hash.slice(0, 8), 16) / 0xffffffff;
  return decimal;
}
