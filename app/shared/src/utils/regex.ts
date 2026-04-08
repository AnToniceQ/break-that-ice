export function createEscapedRegex(pattern: string) {
  return new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
}
