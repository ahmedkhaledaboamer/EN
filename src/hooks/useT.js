const fill = (text, vars) => (vars ? text.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`)) : text);

const t = (key, vars) => fill(key, vars);

/**
 * Interface text helper. Usage: const t = useT(); t('{n} words', { n: 20 })
 * The interface is English; Arabic appears only as translations of the learning content.
 */
export function useT() {
  return t;
}
