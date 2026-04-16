export interface CheckItem {
  id: string;
  label: string;
  isCodeRed?: boolean;
}

export interface CheckCategory {
  name: string;
  language?: string;
  items: CheckItem[];
}

export const categories: CheckCategory[] = [
  {
    name: "Naming",
    items: [
      { id: "n1", label: "Variables: camelCase (pluginSlug, not plugin_slug)" },
      { id: "n2", label: "Types/Classes/Components: PascalCase (SnapshotManager)" },
      { id: "n3", label: 'JSON/API keys: PascalCase ("PluginSlug", not "pluginSlug")' },
      { id: "n4", label: "Abbreviations: First-letter-only (Id, Url, Api, Http, Json)" },
      { id: "n5", label: "Booleans: is/has/can/should/was prefix, no negative words", isCodeRed: true },
    ],
  },
  {
    name: "Structure",
    items: [
      { id: "s1", label: "Zero nested if — use early return pattern", isCodeRed: true },
      { id: "s2", label: "Function body ≤15 lines (error handling lines exempt)", isCodeRed: true },
      { id: "s3", label: "Function params ≤3 (use options object for 4+)" },
      { id: "s4", label: "No boolean flag params — split into two named methods", isCodeRed: true },
      { id: "s5", label: "No any/interface{}/object/unknown returns — use generics or typed Result wrappers" },
      { id: "s6", label: "File size ≤300 lines" },
      { id: "s7", label: "Blank line before return/throw when preceded by statements" },
    ],
  },
  {
    name: "Go-Specific",
    language: "go",
    items: [
      { id: "g1", label: "File names: PascalCase, no underscores, named after primary struct" },
      { id: "g2", label: "Enums: byte type, Invalid zero value, iota" },
      { id: "g3", label: "Returns: single Result[T], never (T, error)", isCodeRed: true },
      { id: "g4", label: "Errors: apperror.Wrap(), never fmt.Errorf()", isCodeRed: true },
      { id: "g5", label: "No any/interface{} in business logic" },
      { id: "g6", label: "No type assertions — use concrete structs or typecast.CastOrFail[T]()" },
      { id: "g7", label: "No explicit json: tags (only ,omitempty or -)" },
      { id: "g8", label: "Getters: Field() not GetField(); max 1 defer per function" },
    ],
  },
  {
    name: "PHP-Specific",
    language: "php",
    items: [
      { id: "p1", label: "No \\Throwable — use `use` import" },
      { id: "p2", label: "Enum comparison via isEqual(), not ===", isCodeRed: true },
      { id: "p3", label: "Blank line before if when preceded by statements" },
      { id: "p4", label: "Log keys: camelCase; DB keys: PascalCase" },
    ],
  },
  {
    name: "TypeScript-Specific",
    language: "typescript",
    items: [
      { id: "t1", label: "No any — use explicit types", isCodeRed: true },
      { id: "t2", label: "Enum: PascalCase + Type suffix (StatusType)" },
      { id: "t3", label: "No magic strings — use enum constants", isCodeRed: true },
      { id: "t4", label: "isDefined() / isDefinedAndValid() — no raw null checks" },
      { id: "t5", label: "Promise.all for independent async calls — sequential await is auto-rejection", isCodeRed: true },
    ],
  },
  {
    name: "Error Handling",
    items: [
      { id: "e1", label: "HasError()/hasError() before .Value()/.value()", isCodeRed: true },
      { id: "e2", label: "No silent error swallowing — log, return, or propagate" },
      { id: "e3", label: "Struct error fields: *AppError (Go), Throwable (PHP)" },
      { id: "e4", label: "No _ = riskyOperation() — handle every error" },
    ],
  },
  {
    name: "Database",
    items: [
      { id: "d1", label: "Table names: PascalCase (UserProfiles)" },
      { id: "d2", label: "Column names: PascalCase (PluginSlug, CreatedAt)" },
      { id: "d3", label: "Index names: Idx prefix + PascalCase (IdxTransactions_CreatedAt)" },
    ],
  },
  {
    name: "Mutation & Immutability",
    items: [
      { id: "m1", label: "Variables assigned once — no reassignment after init" },
      { id: "m2", label: "No post-construction mutation — pass all values to constructor" },
      { id: "m3", label: "Concurrent mutation uses mutex locks" },
    ],
  },
  {
    name: "Null Pointer Safety",
    items: [
      { id: "np1", label: "Check err/error before accessing value — always" },
      { id: "np2", label: "Never chain method calls on unchecked returns" },
      { id: "np3", label: "Nil-check pointer before dereference" },
      { id: "np4", label: "Check nil AND len() before slice/array index access" },
    ],
  },
  {
    name: "Lazy Evaluation",
    items: [
      { id: "l1", label: "Lazy fields: non-exported field + public getter — never direct access" },
      { id: "l2", label: "If dependency is lazy, dependent field MUST also be lazy" },
      { id: "l3", label: "Concurrent lazy access → mutex lock wrapper" },
    ],
  },
  {
    name: "Regex",
    items: [
      { id: "r1", label: "Regex is last resort — prefer strings.Contains(), HasPrefix(), Split()" },
      { id: "r2", label: "Go: compile at package level var re = regexp.MustCompile(...)" },
      { id: "r3", label: "Never use regex in loops without reviewer approval" },
    ],
  },
  {
    name: "Nesting & Newlines",
    items: [
      { id: "nn1", label: "Zero nested if — extract to function, inverse logic, or named booleans", isCodeRed: true },
      { id: "nn2", label: "No blank line after opening brace; no double blank lines" },
      { id: "nn3", label: 'Use constants.NewLineUnix ("\\n") — not raw "\\r\\n"' },
    ],
  },
  {
    name: "Boolean Complexity",
    items: [
      { id: "bc1", label: "Max 2 operands per boolean expression — decompose 3+ into named variables" },
      { id: "bc2", label: "Never mix && and || in one expression — split into named booleans" },
      { id: "bc3", label: "Never mix negative and positive checks — use early return for negatives" },
    ],
  },
  {
    name: "Variable Naming",
    items: [
      { id: "vn1", label: "Singular for single items, plural for collections (user vs users)" },
      { id: "vn2", label: "Loop variable = singular of collection (for user of users)" },
      { id: "vn3", label: "Maps use Map suffix or By[Key] pattern (usersById, configMap)" },
    ],
  },
  {
    name: "SOLID Principles",
    items: [
      { id: "so1", label: "Single Responsibility — one reason to change per class/module/function" },
      { id: "so2", label: "Interface Segregation — no client forced to depend on unused methods" },
      { id: "so3", label: "Dependency Inversion — depend on abstractions, not concretions" },
    ],
  },
  {
    name: "Struct & File Limits",
    items: [
      { id: "sf1", label: "Struct/class ≤10 fields — split into composed sub-structs if exceeded" },
      { id: "sf2", label: "No else after return/throw/break/continue", isCodeRed: true },
    ],
  },
  {
    name: "Defer (Go)",
    language: "go",
    items: [
      { id: "df1", label: "Max one defer per function" },
      { id: "df2", label: "Multiple defers needed → extract into separate single-defer functions" },
    ],
  },
  {
    name: "C#-Specific",
    language: "csharp",
    items: [
      { id: "cs1", label: "Interfaces prefixed with I (IUserRepository)" },
      { id: "cs2", label: "Private fields use _camelCase (_logger, _connectionString)" },
      { id: "cs3", label: "No .Result or .GetAwaiter().GetResult() — async all the way" },
      { id: "cs4", label: "Independent async calls use Task.WhenAll(), not sequential await" },
      { id: "cs5", label: "Pattern matching over type casts (if (obj is User user))" },
      { id: "cs6", label: "Records for immutable DTOs (record UserDto(string Name, string Email))" },
    ],
  },
  {
    name: "🔴 Caching (CODE RED)",
    items: [
      { id: "ca1", label: "Never cache errors as success — catch blocks must cache.delete(), not cache.set()", isCodeRed: true },
      { id: "ca2", label: "Every cache.set() has explicit TTL — unbounded caches are prohibited", isCodeRed: true },
      { id: "ca3", label: "Create/update/delete mutations immediately invalidate related cache entries", isCodeRed: true },
      { id: "ca4", label: "Cache keys use deterministic, stable inputs — no Date.now() or random values", isCodeRed: true },
      { id: "ca5", label: "Cache entries are typed — no any or untyped objects in cache values", isCodeRed: true },
      { id: "ca6", label: "React Query: explicit staleTime set (not default 0) + invalidateQueries after mutations", isCodeRed: true },
    ],
  },
];
