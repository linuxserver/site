/** Unique-per-build ids for inline SVG gradients and aria wiring. Module scope, so it survives across renders. */
let n = 0;
export const uid = (prefix = 'u') => `${prefix}${(n++).toString(36)}`;
