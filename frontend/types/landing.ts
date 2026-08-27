export interface TopicItem {
  title: string;
  slug: string;
}

export interface CategoryData {
  name: string;
  slug: string;
  topics: TopicItem[];
}

export interface LevelData {
  duration: string;
  projects: string;
  focus: string;
  categories: CategoryData[];
  topicCount: number;
}

export interface LevelConfig {
  number: string;
  label: string;
  duration: string;
  projects: string;
  badgeTone: string;
  ctaTone: string;
  bgGradient: string;
}

export interface FeatureItem {
  icon: string;
  title: string;
  desc: string;
  from: string;
  to: string;
  accent: string;
  glow: string;
}

export interface FaqItem {
  q: string;
  a: string;
  category?: string;
}

export interface StepItem {
  step: string;
  title: string;
  desc: string;
  statusText: string;
  badgeColor: string;
}
