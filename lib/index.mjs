import { readFile } from "fs/promises";

const main = async () => {
  let outputString = "";
  const append = (value) => {
    outputString += `${value}\n`;
  };

  if (process.argv.length < 3) {
    console.error(`${process.argv.slice(0, 2).join("")} [specification-file]`);
    process.exit(-1);
  }

  const spec = JSON.parse(await readFile(process.argv[2]));
  append("// This file is generated, do not manually edit this file");
  append("");
  for (const [name, schema] of Object.entries(spec.definitions)) {
    append(`export interface ${name} {`);
    for (const [pname, pvalue] of Object.entries(schema.properties)) {
      const nullable = pvalue["x-nullable"];
      let type;
      if (pvalue.type == "string") {
        type = "string";
      } else if (pvalue.type == "integer") {
        type = "number";
      } else if (pvalue.type == "boolean") {
        type = "boolean";
      } else if (pvalue.type == "array" && pvalue.items.type == "integer") {
        type = "number[]";
      } else if (pvalue.type == "array" && pvalue.items.type == "string") {
        type = "string[]";
      } else if (pvalue.type == "array" && pvalue.items["$ref"]) {
        const name = pvalue.items["$ref"].replace("#/definitions/", "");
        type = `${name}[]`;
      } else {
        type = `unknown`;
      }

      if (nullable) {
        append(`  ${pname}: ${type} | null;`);
      } else {
        append(`  ${pname}: ${type}`);
      }
    }
    append(`}`);
    append(``);
  }

  console.log(outputString);
};

main().catch((err) => {
  console.log(err);
  process.exit(-1);
});
