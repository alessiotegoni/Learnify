export const sumArray = <T>(array: T[], cb: (item: T) => number) =>
  array.reduce((acc, item) => acc + cb(item), 0);
