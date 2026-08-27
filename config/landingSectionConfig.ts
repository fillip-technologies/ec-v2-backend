export interface LandingSectionSetting {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

export const DEFAULT_LANDING_SECTIONS: Record<string, LandingSectionSetting> = {
  hero: { id: 'hero', name: 'Hero Section', enabled: true, order: 1 },
  statsCounter: { id: 'statsCounter', name: 'Hero Stats Counter', enabled: true, order: 2 },
  aboutProof: { id: 'aboutProof', name: 'Why Proof of Work Matters', enabled: true, order: 3 },
  clusters: { id: 'clusters', name: 'Academic Clusters & Tracks', enabled: true, order: 4 },
  collegeTieUp: { id: 'collegeTieUp', name: 'College Tie-Up Program', enabled: true, order: 5 },
  howItWorks: { id: 'howItWorks', name: 'How It Works Pipeline', enabled: true, order: 6 },
  workspacePreview: { id: 'workspacePreview', name: 'Student Workspace Preview', enabled: true, order: 7 },
  certificateShowcase: { id: 'certificateShowcase', name: 'Verifiable Certificate Showcase', enabled: true, order: 8 },
  partnerships: { id: 'partnerships', name: 'Partnership Colleges', enabled: true, order: 9 },
  verticals: { id: 'verticals', name: 'Our Verticals', enabled: true, order: 10 },
  statNumbers: { id: 'statNumbers', name: 'Success Statistics', enabled: true, order: 11 },
  flagshipPricing: { id: 'flagshipPricing', name: 'Featured Flagship Programs', enabled: true, order: 12 },
  whyChooseUs: { id: 'whyChooseUs', name: 'Why Choose Engineers Clinic', enabled: true, order: 13 },
  testimonials: { id: 'testimonials', name: 'Student Testimonials', enabled: true, order: 14 },
  faq: { id: 'faq', name: 'Frequently Asked Questions', enabled: true, order: 15 },
};
