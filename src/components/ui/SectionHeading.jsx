import IntroLine from './IntroLine';

/**
 * Section title block. `title` can contain a <span className="text-highlight"> for the gold words.
 */
export default function SectionHeading({ eyebrow, title, description, action, id }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <IntroLine>{eyebrow}</IntroLine>}
        <h2 id={id} className="mt-4 text-3xl sm:text-4xl">
          {title}
        </h2>
        {description && <p className="mt-3 max-w-xl">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
