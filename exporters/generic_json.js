import { exportCanonicalJson } from "./generic/json.js";

export function exportJSON(canonical, opts = {}) {
  const res = exportCanonicalJson(canonical, opts);
  return { format: "json", data: res.data };
}

export default { exportJSON };
