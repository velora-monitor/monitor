export function definedProps<T extends object>(
  value: T,
): {
  [K in keyof T]?: Exclude<T[K], undefined>;
} {
  const result: { [K in keyof T]?: Exclude<T[K], undefined> } = {};
  for (const key of Object.keys(value)) {
    if (!isOwnKey(value, key)) {
      continue;
    }
    const entry = value[key];
    if (!isDefined(entry)) {
      continue;
    }
    result[key] = entry;
  }
  return result;
}

function isOwnKey<T extends object>(value: T, key: PropertyKey): key is keyof T {
  return key in value;
}

function isDefined<T>(value: T): value is Exclude<T, undefined> {
  return value !== undefined;
}
