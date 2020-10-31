export const panic = (msg) => {
  console.error("\x1b[31m%s\x1b[0m", msg);
  process.exit(1);
};

export const warn = (msg) => {
  console.warn("\x1b[33m%s\x1b[0m", msg);
};
