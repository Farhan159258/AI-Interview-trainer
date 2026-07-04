// pdf-parse ships no TypeScript types and there's no reliable @types/pdf-parse
// package. This tells TypeScript to treat the module as untyped (implicit
// `any`) instead of failing the build with "Could not find a declaration file".
declare module 'pdf-parse';