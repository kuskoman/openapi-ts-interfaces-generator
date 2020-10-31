#!/usr/bin/env node

import { generate } from "./generator.mjs";
import { readFile } from "fs/promises";
import { join } from "path";

const main = async () => {
  const text = await generate();
  if (text) {
    console.log(text);
  }
};

(async () => {
  const arg = process.argv[2];
  if (arg === "-v" || arg === "--version") {
    const packageFile = await readFile(join(__dirname, "..", "package.json"));
    const PACKAGE = JSON.parse(packageFile);
    console.log(PACKAGE.version);
    process.exit(1);
  }
})();

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
