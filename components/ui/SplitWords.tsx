/*
 * A heading's words, each in a mask of its own, so they can rise one after
 * another (lib/motion.tsx: the `title` reveal, and the hero's `word` intro).
 * The spaces stay plain text between the masks, so the heading still reads as
 * one sentence to assistive technology and wraps where it did. A language
 * written without spaces is one "word": it rises whole.
 */
/** The longest last two words (with their space) kept on one line. */
const KEEP_MAX = 14;

export function SplitWords({ text, intro, introStart = 0 }: { text: string; intro?: number; introStart?: number }) {
  let n = introStart;
  const word = (part: string, i: number) => (
    <span key={i} className="sw">
      {intro === undefined ? (
        <span className="sw-in" data-word="">
          {part}
        </span>
      ) : (
        <span className="sw-in" data-intro={intro} data-intro-kind="word" data-intro-sub={n++}>
          {part}
        </span>
      )}
    </span>
  );
  const parts = text.split(/(\s+)/).filter((part) => part !== '');
  const render = (part: string, i: number) => (/^\s+$/.test(part) ? part : word(part, i));
  // The last two words keep together, so a line never ends a heading with one word alone ("ĐỔI / MỚI", "VIỆT /
  // NAM"): text-wrap: balance does not reach into the words' masks (UX/UI audit 2026-11-15, UI-13).
  // Only two short words: two long ones together ("meaningful experience.") would not fit a 320px line.
  const words = parts.filter((part) => !/^\s+$/.test(part)).length;
  const tail = parts.length - 3;
  if (words < 3 || parts.slice(tail).join('').length > KEEP_MAX) return <>{parts.map(render)}</>;
  return (
    <>
      {parts.slice(0, tail).map(render)}
      <span className="sw-keep">{parts.slice(tail).map((part, j) => render(part, tail + j))}</span>
    </>
  );
}
