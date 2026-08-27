export interface PillarData {
  title: string;
  description: string;
}

export interface StatData {
  value: string;
  label: string;
}

export interface AboutConfig {
  eyebrow: string;
  title: string;
  description: string;
  pillars: PillarData[];
  stats: StatData[];
}

export const ABOUT_DATA: AboutConfig = {
  eyebrow: "About Engineers Clinic",
  title: "Building practical careers for modern learners.",
  description:
    "Engineers Clinic helps students and early professionals move from theory to execution through focused internships, guided projects, and career-ready skill tracks.",
  pillars: [
    {
      title: "Structured tracks",
      description:
        "Programs are grouped logically so learners can move quickly toward the domain that fits their career goals.",
    },
    {
      title: "Project-led learning",
      description:
        "Every path is designed around implementation, output, and confidence building rather than passive theory.",
    },
    {
      title: "Career clarity",
      description:
        "From enrollment to guidance, we focus on helping learners understand where each skill track can take them.",
    },
  ],
  stats: [
    { value: "10+", label: "Career-focused learning tracks" },
    { value: "Project-led", label: "Hands-on delivery model" },
    { value: "Student-first", label: "Built for accessible guidance" },
  ],
};
