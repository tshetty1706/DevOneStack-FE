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
  RiStickyNoteLine,
} from 'react-icons/ri';

/**
 * All supported sidebar modules in DevOneStack
 */
export const ALL_MODULES = [
  {
    id: 'overview',
    label: 'Overview',
    icon: RiHome4Line,
    description: 'Summary of your space, quick stats, and recent activity',
    isFixed: true,
  },
  {
    id: 'explorer',
    label: 'Explorer',
    icon: RiCompass3Line,
    description: 'Files and folders navigator with README viewer',
    isFixed: true,
  },
  {
    id: 'notes',
    label: 'Notes',
    icon: RiStickyNoteLine,
    description: 'Markdown-based notes, ideas, and workspace docs',
  },
  {
    id: 'learnings',
    label: 'Learnings',
    icon: RiLightbulbLine,
    description: 'Key takeaways, bug fixes, and knowledge items',
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
    description: 'Documentation, guides, and external resources',
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
    description: 'AI prompts, templates, and engineering queries',
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
    description: 'Start fresh with foundational essentials: Overview, Explorer, Notes, Learnings, Snippets, and Docs.',
    icon: RiDraftLine,
    modules: ['overview', 'explorer', 'notes', 'learnings', 'snippets', 'docs'],
  },
  {
    id: 'learning-roadmap',
    name: 'Learning Roadmap',
    badge: 'Study & Upskill',
    description: 'Structured path for mastering technologies with Learnings, Docs, Notes, and Repos.',
    icon: RiBookOpenLine,
    modules: ['overview', 'explorer', 'learnings', 'docs', 'notes', 'repos'],
  },
  {
    id: 'interview-prep',
    name: 'Interview Prep',
    badge: 'Coding & Concepts',
    description: 'Prepare for technical interviews with algorithms, Snippets, Learnings, Docs, and Notes.',
    icon: RiTerminalBoxLine,
    modules: ['overview', 'explorer', 'learnings', 'snippets', 'docs', 'notes'],
  },
  {
    id: 'project-docs',
    name: 'Project Docs',
    badge: 'Architecture & Repos',
    description: 'Comprehensive documentation hub with Docs, Repos, Snippets, and Notes.',
    icon: RiFileTextLine,
    modules: ['overview', 'explorer', 'docs', 'repos', 'snippets', 'notes'],
  },
  {
    id: 'prompt-library',
    name: 'Prompt Library',
    badge: 'AI & Workflows',
    description: 'Store, organize, and categorize AI system prompts and workflows with Tags and Notes.',
    icon: RiRobot2Line,
    modules: ['overview', 'explorer', 'prompts', 'tags', 'notes'],
  },
  {
    id: 'backend-development',
    name: 'Backend Development',
    badge: 'APIs & Architecture',
    description: 'Full backend toolkit covering Learnings, Snippets, Docs, Notes, and Prompts.',
    icon: RiServerLine,
    modules: ['overview', 'explorer', 'learnings', 'snippets', 'docs', 'notes', 'prompts'],
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
