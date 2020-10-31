export const panic = (msg) => {
  console.error("\x1b[31m%s\x1b[0m", msg);
  process.exit(1);
};

export const warn = (msg) => {
  console.warn("\x1b[33m%s\x1b[0m", msg);
};

export const informAbotTextRedirecting = () => {
  const isWindows = process.platform === "win32";
  if (isWindows) {
    warn(
      `Seems like you are using Windows operating system.
Errors connected with file encoding may be caused by using stream redirrecting
(">" on operation output), which is usually NOT using utf-8 encoding on this platform.`
    );
  }
};
