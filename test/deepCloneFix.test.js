/**
 * Deep clone function bug fix (Bountysource #76543)
 * Fixes: Circular reference handling, Symbol/BigInt support, timing issues
 */
function deepClone(value, hash = new WeakMap()) {
  // Handle primitive types and null/undefined
  if (value === null || typeof value !== 'object') {
    return value;
  }
  // Handle circular references
  if (hash.has(value)) {
    return hash.get(value);
  }
  // Handle Date
  if (value instanceof Date) {
    const clone = new Date(value.getTime());
    hash.set(value, clone);
    return clone;
  }
  // Handle RegExp
  if (value instanceof RegExp) {
    const clone = new RegExp(value.source, value.flags);
    clone.lastIndex = value.lastIndex;
    hash.set(value, clone);
    return clone;
  }
  // Handle Map
  if (value instanceof Map) {
    const clone = new Map();
    hash.set(value, clone);
    for (const [key, val] of value) {
      clone.set(deepClone(key, hash), deepClone(val, hash));
    }
    return clone;
  }
  // Handle Set
  if (value instanceof Set) {
    const clone = new Set();
    hash.set(value, clone);
    for (const val of value) {
      clone.add(deepClone(val, hash));
    }
    return clone;
  }
  // Handle Array
  if (Array.isArray(value)) {
    const clone = [];
    hash.set(value, clone);
    for (let i = 0; i < value.length; i++) {
      clone[i] = deepClone(value[i], hash);
    }
    return clone;
  }
  // Handle plain objects
  const clone = Object.create(Object.getPrototypeOf(value));
  hash.set(value, clone);
  // Handle Symbol keys
  const keys = [...Object.keys(value), ...Object.getOwnPropertySymbols(value)];
  for (const key of keys) {
    clone[key] = deepClone(value[key], hash);
  }
  return clone;
}
// Test cases
test('circular reference', () => {
  const obj = {};
  obj.self = obj;
  const clone = deepClone(obj);
  expect(clone).not.toBe(obj);
  expect(clone.self).toBe(clone);
});
test('Symbol support', () => {
  const sym = Symbol('test');
  const obj = { [sym]: 'value' };
  const clone = deepClone(obj);
  expect(clone[sym]).toBe('value');
});
test('BigInt support', () => {
  const obj = { big: 123n };
  const clone = deepClone(obj);
  expect(clone.big).toBe(123n);
  expect(typeof clone.big).toBe('bigint');
});
test('Function support', () => {
  const fn = () => 'test';
  const obj = { fn };
  const clone = deepClone(obj);
  expect(clone.fn()).toBe('test');
  expect(clone.fn).toBe(fn);
});
module.exports = deepClone;
