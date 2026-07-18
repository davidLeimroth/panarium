import { type CrumbArtInput, crumbArt } from '../../lib/crumb';

export function CrumbSvg({ input, label }: { input: CrumbArtInput; label: string }) {
  return (
    <svg
      viewBox="0 0 240 200"
      role="img"
      aria-label={label}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG generated from our own pure function
      dangerouslySetInnerHTML={{ __html: crumbArt(input) }}
    />
  );
}
