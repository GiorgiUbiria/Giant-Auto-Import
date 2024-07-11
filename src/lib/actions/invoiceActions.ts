import "server-only";
import { fs } from "fs";

export async function getInvoicePdfAsBytes(name: string) {
  return fs.readFile(name);
}
