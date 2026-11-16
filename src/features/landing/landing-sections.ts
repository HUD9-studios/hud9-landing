export const landingSections = ['home', 'studio', 'contact'] as const;
export type LandingSection = (typeof landingSections)[number];
