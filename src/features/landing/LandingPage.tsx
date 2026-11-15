import { PageContainer } from '@/components/PageContainer';
import type { Dictionary } from '@/i18n/dictionaries/types';

export function LandingPage({ copy }: { copy: Dictionary['landing'] }) {
  return (
    <PageContainer>
      <h1>{copy.heading}</h1>
      <p>{copy.description}</p>
    </PageContainer>
  );
}
