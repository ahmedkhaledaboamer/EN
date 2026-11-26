/** Renders text where "___" becomes a styled blank (or `children` in its place). */
export default function GapText({ text, children }) {
  const parts = text.split('___');
  if (parts.length === 1) return text;
  return parts.map((part, i) => (
    <span key={i}>
      {part}
      {i < parts.length - 1 &&
        (children ?? (
          <span
            aria-label="blank"
            className="mx-1 inline-block w-16 translate-y-1 border-b-[3px] border-brand-yellow"
          />
        ))}
    </span>
  ));
}
