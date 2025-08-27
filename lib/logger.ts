export function debug(...args: unknown[]) {
  if (process.env.VERBOSE) {
    console.log(...args);
  }
}
