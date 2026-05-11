// Simple UID generator that creates unique sequential IDs based on a prefix
let counters: { [key: string]: number } = {};

export function uid(prefix: string = ''): string {
  if (!counters[prefix]) {
    counters[prefix] = 0;
  }
  counters[prefix]++;
  return `${prefix}${counters[prefix]}`;
}