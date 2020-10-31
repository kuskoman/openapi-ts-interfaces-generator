import { stat, readFile } from "fs/promises";
import { panic, warn } from "./utils.mjs";

const parseSpec = async (location) => {
  await stat(location).catch((e) => {
    panic(
      `Error when reading openapi file from path '${location}':\n${e}\n` +
        "Check if file exists and/or this process has access to its content."
    );
  });

  try {
    const file = await readFile(location, "utf-8");
    return JSON.parse(file);
  } catch (e) {}
};

const getFileLocation = () => {
  if (process.argv.length < 3) {
    const defaultValue = "openapi.json";
    warn(
      `OpenAPI specification file is not provided. Using ${defaultValue} instead`
    );
    return defaultValue;
  }

  return process.argv[2];
};

const convertType = (pvalue) => {
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
};

const createInterfaces = (openapiSpec) => {
  let outputString = "";
  const append = (value) => {
    outputString += `${value}\n`;
  };

  append("// This file is generated, do not manually edit this file");
  append("");
  for (const [name, schema] of Object.entries(openapiSpec.definitions)) {
    append(`export interface ${name} {`);
    for (const [pname, pvalue] of Object.entries(schema.properties)) {
      const nullable = pvalue["x-nullable"];
      const type = convertType(pvalue);

      if (nullable) {
        append(`  ${pname}: ${type} | null;`);
      } else {
        append(`  ${pname}: ${type}`);
      }
    }
    append(`}`);
    append(``);
  }

  return outputString;
};

export const generate = async () => {
  const location = getFileLocation();
  const openapiSpec = await parseSpec(location);

  return createInterfaces(openapiSpec);
};
