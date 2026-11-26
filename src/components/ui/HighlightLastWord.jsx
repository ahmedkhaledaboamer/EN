/**
 * Renders a title with only its last word in gold: "Asking for <gold>Directions</gold>".
 * Single-word titles are fully highlighted.
 */
export default function HighlightLastWord({ text = '' }) {
  const trimmed = text.trim();
  const i = trimmed.lastIndexOf(' ');
  if (i === -1) return <span className="text-highlight">{trimmed}</span>;
  return (
    <>
      {trimmed.slice(0, i + 1)}
      <span className="text-highlight">{trimmed.slice(i + 1)}</span>
    </>
  );
}
