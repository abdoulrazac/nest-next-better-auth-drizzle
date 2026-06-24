// apps/mobile/src/types/url-search-params.d.ts
// React Native's global `URLSearchParams` (react-native/src/types/globals.d.ts)
// declares only `append`, `toString`, and `@@iterator`. The DOM lib version
// (with `entries`, `sort`, `forEach`, ...) is not the one in scope for RN.
// The auto-generated @repo/api-client SDK (hey-api) uses `entries()`/`sort()`
// for query-key serialization. This ambient augmentation adds the standard
// URLSearchParams members so the generated code type-checks under Expo.
// At runtime, RN's URLSearchParams polyfill already implements these.

export {};

declare global {
  interface URLSearchParams {
    entries(): IterableIterator<[string, string]>;
    keys(): IterableIterator<string>;
    values(): IterableIterator<string>;
    forEach(
      callbackfn: (value: string, key: string, parent: URLSearchParams) => void,
      thisArg?: unknown
    ): void;
    get(name: string): string | null;
    getAll(name: string): string[];
    has(name: string): boolean;
    delete(name: string): void;
    set(name: string, value: string): void;
    sort(): void;
  }
}
