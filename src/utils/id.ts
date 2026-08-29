let nextId = 1;

export function createId(prefix = "shape"): string {
  const cryptoId = globalThis.crypto?.randomUUID?.();
  if (cryptoId) return `${prefix}-${cryptoId}`;
  nextId += 1;
  return `${prefix}-${nextId}`;
}
