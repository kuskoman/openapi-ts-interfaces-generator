import { stat, readFile } from "fs/promises";
import { panic, warn, informAbotTextRedirecting } from "./utils.mjs";

const parseSpec = async (location) => {
  await stat(location).catch((e) => {
    panic(
      `Error when reading openapi file from path '${location}':\n${e}\n` +
        "Check if file exists and/or this process has access to its content."
    );
  });

  let file;
  try {
    file = await readFile(location);
  } catch (e) {
    panic(`An unexpected error occured when trying to read ${location}: ${e}`);
  }

  try {
    return JSON.parse(file);
  } catch (e) {
    informAbotTextRedirecting();
    panic(
      `An error occured when parsing file body:\n${e}\nPlease make sure that the file is utf-8 encoded.`
    );
  }
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

  return type;
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
