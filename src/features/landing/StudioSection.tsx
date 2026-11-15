import type { Dictionary } from '@/i18n/dictionaries/types';
import { StudioArcade } from './studio/StudioArcade';
import { StudioContent } from './studio/StudioContent';
import { StudioStory } from './studio/StudioStory';

export function StudioSection({
  copy,
}: {
  copy: Dictionary['landing']['studio'];
}) {
  return (
    <StudioStory>
      <StudioArcade />
      <StudioContent copy={copy} />
    </StudioStory>
  );
}
