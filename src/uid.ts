let counter = 0
/** Cheap unique id (no crypto dependency so it works in every test environment). */
export function uid(): string {
  counter = (counter + 1) % 1_000_000
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}-${counter.toString(36)}`
}
