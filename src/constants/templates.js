import {
  RiHome4Line,
  RiLightbulbLine,
  RiCodeSSlashLine,
  RiFileTextLine,
  RiGitRepositoryLine,
  RiRobot2Line,
  RiTeamLine,
  RiPriceTag3Line,
  RiCompass3Line,
  RiBookOpenLine,
  RiTerminalBoxLine,
  RiDraftLine,
  RiServerLine,
  RiRoadMapLine,
} from 'react-icons/ri';

/**
 * All supported sidebar modules in DevOneStack
 */
export const ALL_MODULES = [
  {
    id: 'explorer',
    label: 'Explorer',
    icon: RiCompass3Line,
    description: 'File and folder navigator with README viewer',
    isFixed: true, // Explorer is permanent and cannot be disabled
  },
  {
    id: 'learnings',
    label: 'Learnings',
    icon: RiLightbulbLine,
    description: 'Curated knowledge items, takeaways, and lessons',
  },
  {
    id: 'snippets',
    label: 'Snippets',
    icon: RiCodeSSlashLine,
    description: 'Reusable code blocks and syntax solutions',
  },
  {
    id: 'docs',
    label: 'Docs',
    icon: RiFileTextLine,
    description: 'Markdown documentation, guides, and PDF resources',
  },
  {
    id: 'repos',
    label: 'Repos',
    icon: RiGitRepositoryLine,
    description: 'GitHub and external repository bookmarks',
  },
  {
    id: 'prompts',
    label: 'Prompts',
    icon: RiRobot2Line,
    description: 'AI prompts, system templates, and engineering queries',
  },
  {
    id: 'communities',
    label: 'Communities',
    icon: RiTeamLine,
    description: 'Discussion forums, Discord/Reddit channels, and groups',
  },
  {
    id: 'tags',
    label: 'Tags',
    icon: RiPriceTag3Line,
    description: 'Categorization and cross-resource indexing',
  },
];

/**
 * Predefined Space Templates
 * Note: A template is ONLY a starting configuration of enabledModules.
 * It does NOT permanently restrict what modules can be added later.
 */
export const TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank',
    badge: 'Clean Canvas',
    description: 'Start fresh with foundational essentials: Explorer, Learnings, Snippets, and Docs.',
    icon: RiDraftLine,
    modules: ['explorer', 'learnings', 'snippets', 'docs'],
  },
  {
    id: 'learning-roadmap',
    name: 'Learning Roadmap',
    badge: 'Study & Upskill',
    description: 'Structured path for mastering technologies with Learnings, Docs, and Repos.',
    icon: RiBookOpenLine,
    modules: ['explorer', 'learnings', 'docs', 'repos'],
  },
  {
    id: 'interview-prep',
    name: 'Interview Prep',
    badge: 'Coding & Concepts',
    description: 'Prepare for technical interviews with algorithms, Snippets, Learnings, and Docs.',
    icon: RiTerminalBoxLine,
    modules: ['explorer', 'learnings', 'snippets', 'docs'],
  },
  {
    id: 'project-docs',
    name: 'Project Docs',
    badge: 'Architecture & Repos',
    description: 'Comprehensive documentation hub with Docs, Repos, and code Snippets.',
    icon: RiFileTextLine,
    modules: ['explorer', 'docs', 'repos', 'snippets'],
  },
  {
    id: 'prompt-library',
    name: 'Prompt Library',
    badge: 'AI & Workflows',
    description: 'Store, organize, and categorize AI system prompts and workflows with Tags.',
    icon: RiRobot2Line,
    modules: ['explorer', 'prompts', 'tags'],
  },
  {
    id: 'backend-development',
    name: 'Backend Development',
    badge: 'APIs & Architecture',
    description: 'Full backend toolkit covering Learnings, Snippets, Docs, and Prompts.',
    icon: RiServerLine,
    modules: ['explorer', 'learnings', 'snippets', 'docs', 'prompts'],
  },
];

export function getTemplateById(id) {
  return TEMPLATES.find(t => t.id === id) || TEMPLATES[0];
}

export function getModuleById(id) {
  return ALL_MODULES.find(m => m.id === id);
}

export function getInitialModules(templateId) {
  const t = getTemplateById(templateId);
  return t ? t.modules : ['explorer', 'learnings', 'snippets', 'docs'];
}
