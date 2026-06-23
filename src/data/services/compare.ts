import type { CompareGroup } from "../../lib/types";

// Side-by-side disambiguation cards for commonly-confused service groups. Each
// group's serviceIds reference real ServiceEntry ids (single-sourced names and
// doc links); every row's cells are keyed by service id. Empty until the compare
// content plan fills it. The catalog lint validates referential integrity and
// per-row cell coverage once entries exist.
export const COMPARE_GROUPS: CompareGroup[] = [];
