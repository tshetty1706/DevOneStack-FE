// Mock data — all dashboard data lives here until backend is wired
// Replace these with real API calls in useSpaces.js / useStats.js

export const MOCK_USER = {
  name: 'Your Name',
  email: 'you@email.com',
  initials: 'YD',
};

export const MOCK_STATS = {
  spaces: 4,
  snippets: 0,
  resources: 0,
  prompts: 0,
};

export const MOCK_SPACES = [
  {
    id: 'react',
    name: 'React',
    icon: 'react',
    meta: '14 notes · 9 snippets · 6 links',
    tags: ['hooks', 'router'],
  },
  {
    id: 'docker',
    name: 'Docker',
    icon: 'docker',
    meta: '6 notes · 4 snippets · 3 repos',
    tags: ['compose'],
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    icon: 'nodejs',
    meta: '8 notes · 5 snippets · 2 links',
    tags: ['express', 'api'],
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    icon: 'mongodb',
    meta: '3 notes · 2 snippets · 1 link',
    tags: ['mongoose'],
  },
];
