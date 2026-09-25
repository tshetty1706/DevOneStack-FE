// Centralized Technology & Tool Configuration for DevOneStack
// Contains all 50 supported developer technologies and fallback thumbnails

export const DEFAULT_THUMBNAILS = {
  light: '/thumbnail/default_light.png',
  dark: '/thumbnail/default_dark.png',
};

export const TOOL_CATEGORIES = {
  ALL: 'All',
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  DATABASE: 'Database',
  DEVOPS_CLOUD: 'DevOps & Cloud',
  LANGUAGES: 'Languages',
  TOOLS_DESIGN: 'Tools & Design',
  SYSTEM_CONCEPTS: 'Architecture & System',
};

export const TOOLS = [
  // 1-20 Primary Core Tools
  {
    id: 'react',
    name: 'React',
    slug: 'react',
    iconKey: 'simple-icons:react',
    thumbnail: '/thumbnail/react.png',
    category: TOOL_CATEGORIES.FRONTEND,
    defaultDescription: 'Complete React development notes, projects and resources.',
    defaultTags: ['React', 'JavaScript', 'Frontend', 'UI'],
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    slug: 'nodejs',
    iconKey: 'simple-icons:nodedotjs',
    thumbnail: '/thumbnail/nodejs.png',
    category: TOOL_CATEGORIES.BACKEND,
    defaultDescription: 'Node.js, Express, async architecture and production-ready APIs.',
    defaultTags: ['Node.js', 'Express', 'Backend', 'JavaScript'],
  },
  {
    id: 'spring-boot',
    name: 'Spring Boot',
    slug: 'spring-boot',
    iconKey: 'simple-icons:spring',
    thumbnail: '/thumbnail/spring-boot.png',
    category: TOOL_CATEGORIES.BACKEND,
    defaultDescription: 'Backend development notes, microservices & enterprise Spring Boot implementations.',
    defaultTags: ['Java', 'Spring Boot', 'REST API', 'Microservices'],
  },
  {
    id: 'java',
    name: 'Java',
    slug: 'java',
    iconKey: 'simple-icons:java',
    thumbnail: '/thumbnail/java.png',
    category: TOOL_CATEGORIES.LANGUAGES,
    defaultDescription: 'Core Java, OOP principles, collections, concurrency, and JVM internals.',
    defaultTags: ['Java', 'OOP', 'JVM', 'Backend'],
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    slug: 'mongodb',
    iconKey: 'simple-icons:mongodb',
    thumbnail: '/thumbnail/mongodb.png',
    category: TOOL_CATEGORIES.DATABASE,
    defaultDescription: 'Database concepts, aggregation pipelines, schema modeling and query optimization.',
    defaultTags: ['MongoDB', 'Database', 'NoSQL', 'Backend'],
  },
  {
    id: 'python',
    name: 'Python',
    slug: 'python',
    iconKey: 'simple-icons:python',
    thumbnail: '/thumbnail/python.png',
    category: TOOL_CATEGORIES.LANGUAGES,
    defaultDescription: 'Python scripting, algorithms, backend services and data workflows.',
    defaultTags: ['Python', 'Automation', 'Scripting', 'Backend'],
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    slug: 'javascript',
    iconKey: 'simple-icons:javascript',
    thumbnail: '/thumbnail/javascript.png',
    category: TOOL_CATEGORIES.LANGUAGES,
    defaultDescription: 'Core JavaScript, ES6+, event loop, async patterns, and DOM mastery.',
    defaultTags: ['JavaScript', 'ES6+', 'Web', 'Frontend'],
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    slug: 'typescript',
    iconKey: 'simple-icons:typescript',
    thumbnail: '/thumbnail/typescript.png',
    category: TOOL_CATEGORIES.LANGUAGES,
    defaultDescription: 'Type safety, generics, interfaces, compiler options, and scalable typing.',
    defaultTags: ['TypeScript', 'JavaScript', 'Types', 'Frontend'],
  },
  {
    id: 'html-css',
    name: 'HTML/CSS',
    slug: 'html-css',
    iconKey: 'simple-icons:html5',
    thumbnail: '/thumbnail/html-css.png',
    category: TOOL_CATEGORIES.FRONTEND,
    defaultDescription: 'Semantic markup, modern CSS grid, flexbox, responsive design, and CSS variables.',
    defaultTags: ['HTML', 'CSS', 'Responsive', 'Frontend'],
  },
  {
    id: 'cpp',
    name: 'C++',
    slug: 'cpp',
    iconKey: 'simple-icons:cplusplus',
    thumbnail: '/thumbnail/cpp.png',
    category: TOOL_CATEGORIES.LANGUAGES,
    defaultDescription: 'Modern C++, memory management, pointers, STL containers, and low-level performance.',
    defaultTags: ['C++', 'STL', 'Systems', 'Algorithms'],
  },
  {
    id: 'system-design',
    name: 'System Design',
    slug: 'system-design',
    iconKey: 'lucide:git-network',
    thumbnail: '/thumbnail/system-design.png',
    category: TOOL_CATEGORIES.SYSTEM_CONCEPTS,
    defaultDescription: 'Distributed systems, load balancing, caching, sharding, and high-availability architecture.',
    defaultTags: ['System Design', 'Architecture', 'Distributed Systems', 'Scalability'],
  },
  {
    id: 'devops',
    name: 'DevOps',
    slug: 'devops',
    iconKey: 'lucide:infinity',
    thumbnail: '/thumbnail/devops.png',
    category: TOOL_CATEGORIES.DEVOPS_CLOUD,
    defaultDescription: 'CI/CD pipelines, container orchestration, infrastructure automation and cloud workflows.',
    defaultTags: ['DevOps', 'CI/CD', 'Cloud', 'Infrastructure'],
  },
  {
    id: 'docker',
    name: 'Docker',
    slug: 'docker',
    iconKey: 'simple-icons:docker',
    thumbnail: '/thumbnail/docker.png',
    category: TOOL_CATEGORIES.DEVOPS_CLOUD,
    defaultDescription: 'Containerization, Dockerfile optimization, multi-stage builds, and Docker Compose.',
    defaultTags: ['Docker', 'Containers', 'DevOps', 'Deployment'],
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes',
    slug: 'kubernetes',
    iconKey: 'simple-icons:kubernetes',
    thumbnail: '/thumbnail/kubernetes.png',
    category: TOOL_CATEGORIES.DEVOPS_CLOUD,
    defaultDescription: 'Pods, services, ingress, deployments, Helm charts, and cluster administration.',
    defaultTags: ['Kubernetes', 'K8s', 'Cloud Native', 'DevOps'],
  },
  {
    id: 'aws',
    name: 'AWS',
    slug: 'aws',
    iconKey: 'simple-icons:amazonwebservices',
    thumbnail: '/thumbnail/aws.png',
    category: TOOL_CATEGORIES.DEVOPS_CLOUD,
    defaultDescription: 'Amazon Web Services, EC2, S3, Lambda, IAM, API Gateway and serverless patterns.',
    defaultTags: ['AWS', 'Cloud', 'Serverless', 'Infrastructure'],
  },
  {
    id: 'postman',
    name: 'Postman',
    slug: 'postman',
    iconKey: 'simple-icons:postman',
    thumbnail: '/thumbnail/postman.png',
    category: TOOL_CATEGORIES.TOOLS_DESIGN,
    defaultDescription: 'API testing, collection runner, mock servers, automated testing and documentation.',
    defaultTags: ['Postman', 'API Testing', 'REST', 'QA'],
  },
  {
    id: 'figma',
    name: 'Figma',
    slug: 'figma',
    iconKey: 'simple-icons:figma',
    thumbnail: '/thumbnail/figma.png',
    category: TOOL_CATEGORIES.TOOLS_DESIGN,
    defaultDescription: 'UI/UX design systems, component libraries, wireframing and interactive prototypes.',
    defaultTags: ['Figma', 'UI/UX', 'Design', 'Prototyping'],
  },
  {
    id: 'git-github',
    name: 'Git/GitHub',
    slug: 'git-github',
    iconKey: 'simple-icons:github',
    thumbnail: '/thumbnail/git-github.png',
    category: TOOL_CATEGORIES.TOOLS_DESIGN,
    defaultDescription: 'Version control, Git workflows, branch strategies, rebasing, and GitHub Actions.',
    defaultTags: ['Git', 'GitHub', 'Version Control', 'Open Source'],
  },
  {
    id: 'database',
    name: 'Database',
    slug: 'database',
    iconKey: 'lucide:database',
    thumbnail: '/thumbnail/database.png',
    category: TOOL_CATEGORIES.DATABASE,
    defaultDescription: 'Database design, normalization, ACID properties, indexing strategies and query tuning.',
    defaultTags: ['Database', 'SQL', 'Data Modeling', 'Storage'],
  },
  {
    id: 'web-development',
    name: 'Web Development',
    slug: 'web-development',
    iconKey: 'simple-icons:html5',
    thumbnail: '/thumbnail/web-development.png',
    category: TOOL_CATEGORIES.FRONTEND,
    defaultDescription: 'Full-stack and frontend web development notes, practices and projects.',
    defaultTags: ['Web Dev', 'Full Stack', 'Frontend', 'Web Apps'],
  },

  // 21-50 Additional Supported Tools
  {
    id: 'nextjs',
    name: 'Next.js',
    slug: 'nextjs',
    iconKey: 'simple-icons:nextdotjs',
    thumbnail: '/thumbnail/nextjs.png',
    category: TOOL_CATEGORIES.FRONTEND,
    defaultDescription: 'Server components, App Router, SSR, SSG and fullstack Next.js applications.',
    defaultTags: ['Next.js', 'React', 'SSR', 'Full Stack'],
  },
  {
    id: 'angular',
    name: 'Angular',
    slug: 'angular',
    iconKey: 'simple-icons:angular',
    thumbnail: '/thumbnail/angular.png',
    category: TOOL_CATEGORIES.FRONTEND,
    defaultDescription: 'Angular components, RxJS signals, dependency injection, and enterprise modules.',
    defaultTags: ['Angular', 'TypeScript', 'RxJS', 'Frontend'],
  },
  {
    id: 'vuejs',
    name: 'Vue.js',
    slug: 'vuejs',
    iconKey: 'simple-icons:vue',
    thumbnail: '/thumbnail/vuejs.png',
    category: TOOL_CATEGORIES.FRONTEND,
    defaultDescription: 'Composition API, Pinia, Vue Router, reactive state and Vue 3 ecosystem.',
    defaultTags: ['Vue.js', 'Vue', 'Pinia', 'Frontend'],
  },
  {
    id: 'tailwind-css',
    name: 'Tailwind CSS',
    slug: 'tailwind-css',
    iconKey: 'simple-icons:tailwindcss',
    thumbnail: '/thumbnail/tailwind-css.png',
    category: TOOL_CATEGORIES.FRONTEND,
    defaultDescription: 'Utility-first CSS, custom design systems, responsiveness, and Tailwind plugins.',
    defaultTags: ['Tailwind CSS', 'CSS', 'UI', 'Frontend'],
  },
  {
    id: 'flutter',
    name: 'Flutter',
    slug: 'flutter',
    iconKey: 'simple-icons:flutter',
    thumbnail: '/thumbnail/flutter.png',
    category: TOOL_CATEGORIES.FRONTEND,
    defaultDescription: 'Cross-platform mobile apps with Dart, widget trees, and state management.',
    defaultTags: ['Flutter', 'Dart', 'Mobile', 'iOS & Android'],
  },
  {
    id: 'django',
    name: 'Django',
    slug: 'django',
    iconKey: 'simple-icons:django',
    thumbnail: '/thumbnail/django.png',
    category: TOOL_CATEGORIES.BACKEND,
    defaultDescription: 'Python Django framework, ORM, REST Framework, authentication and admin.',
    defaultTags: ['Django', 'Python', 'ORM', 'Backend'],
  },
  {
    id: 'expressjs',
    name: 'Express.js',
    slug: 'expressjs',
    iconKey: 'simple-icons:express',
    thumbnail: '/thumbnail/expressjs.png',
    category: TOOL_CATEGORIES.BACKEND,
    defaultDescription: 'Fast, unopinionated Node.js REST API server with middleware and routing.',
    defaultTags: ['Express.js', 'Node.js', 'REST API', 'Backend'],
  },
  {
    id: 'laravel',
    name: 'Laravel',
    slug: 'laravel',
    iconKey: 'simple-icons:laravel',
    thumbnail: '/thumbnail/laravel.png',
    category: TOOL_CATEGORIES.BACKEND,
    defaultDescription: 'PHP Laravel web artisan notes, Eloquent ORM, Blade, migrations and queues.',
    defaultTags: ['Laravel', 'PHP', 'Eloquent', 'Backend'],
  },
  {
    id: 'redux',
    name: 'Redux',
    slug: 'redux',
    iconKey: 'simple-icons:redux',
    thumbnail: '/thumbnail/redux.png',
    category: TOOL_CATEGORIES.FRONTEND,
    defaultDescription: 'Redux Toolkit (RTK), slices, thunks, listeners and global state workflows.',
    defaultTags: ['Redux', 'RTK', 'State Management', 'React'],
  },
  {
    id: 'svelte',
    name: 'Svelte',
    slug: 'svelte',
    iconKey: 'simple-icons:svelte',
    thumbnail: '/thumbnail/svelte.png',
    category: TOOL_CATEGORIES.FRONTEND,
    defaultDescription: 'Svelte 5 runes, reactive primitives, SvelteKit, and zero-virtual-DOM performance.',
    defaultTags: ['Svelte', 'SvelteKit', 'Frontend', 'Reactive'],
  },
  {
    id: 'csharp',
    name: 'C#',
    slug: 'csharp',
    iconKey: 'simple-icons:csharp',
    thumbnail: '/thumbnail/csharp.png',
    category: TOOL_CATEGORIES.LANGUAGES,
    defaultDescription: 'C# language, .NET core runtime, LINQ, async/await, and enterprise services.',
    defaultTags: ['C#', '.NET', 'Backend', 'Microsoft'],
  },
  {
    id: 'go',
    name: 'Go',
    slug: 'go',
    iconKey: 'simple-icons:go',
    thumbnail: '/thumbnail/go.png',
    category: TOOL_CATEGORIES.LANGUAGES,
    defaultDescription: 'Golang concurrency, goroutines, channels, microservices, and high-throughput systems.',
    defaultTags: ['Go', 'Golang', 'Concurrency', 'Backend'],
  },
  {
    id: 'rust',
    name: 'Rust',
    slug: 'rust',
    iconKey: 'simple-icons:rust',
    thumbnail: '/thumbnail/rust.png',
    category: TOOL_CATEGORIES.LANGUAGES,
    defaultDescription: 'Memory safety, ownership, borrow checker, traits, and systems programming.',
    defaultTags: ['Rust', 'Systems', 'Performance', 'Memory Safety'],
  },
  {
    id: 'firebase',
    name: 'Firebase',
    slug: 'firebase',
    iconKey: 'simple-icons:firebase',
    thumbnail: '/thumbnail/firebase.png',
    category: TOOL_CATEGORIES.DATABASE,
    defaultDescription: 'Firestore, Realtime DB, Firebase Auth, Cloud Functions and security rules.',
    defaultTags: ['Firebase', 'BaaS', 'NoSQL', 'Serverless'],
  },
  {
    id: 'redis',
    name: 'Redis',
    slug: 'redis',
    iconKey: 'simple-icons:redis',
    thumbnail: '/thumbnail/redis.png',
    category: TOOL_CATEGORIES.DATABASE,
    defaultDescription: 'In-memory data structures, caching layers, pub/sub, rate limiting, and persistence.',
    defaultTags: ['Redis', 'Cache', 'In-Memory', 'NoSQL'],
  },
  {
    id: 'vscode',
    name: 'VS Code',
    slug: 'vscode',
    iconKey: 'simple-icons:vscode',
    thumbnail: '/thumbnail/vscode.png',
    category: TOOL_CATEGORIES.TOOLS_DESIGN,
    defaultDescription: 'VS Code shortcuts, debugging, snippets, extension authoring and workspace setups.',
    defaultTags: ['VS Code', 'Editor', 'Developer Tools', 'Productivity'],
  },
  {
    id: 'intellij-idea',
    name: 'IntelliJ IDEA',
    slug: 'intellij-idea',
    iconKey: 'simple-icons:intellijidea',
    thumbnail: '/thumbnail/intellij-idea.png',
    category: TOOL_CATEGORIES.TOOLS_DESIGN,
    defaultDescription: 'IntelliJ shortcuts, refactoring tools, JVM debugging and profiling workflows.',
    defaultTags: ['IntelliJ', 'IDE', 'Java', 'JetBrains'],
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    slug: 'postgresql',
    iconKey: 'simple-icons:postgresql',
    thumbnail: '/thumbnail/postgresql.png',
    category: TOOL_CATEGORIES.DATABASE,
    defaultDescription: 'Relational SQL, JSONB, CTEs, window functions, indexing, and Postgres optimization.',
    defaultTags: ['PostgreSQL', 'SQL', 'Relational', 'Database'],
  },
  {
    id: 'mysql',
    name: 'MySQL',
    slug: 'mysql',
    iconKey: 'simple-icons:mysql',
    thumbnail: '/thumbnail/mysql.png',
    category: TOOL_CATEGORIES.DATABASE,
    defaultDescription: 'MySQL schemas, InnoDB storage engine, replication, indexing and transactions.',
    defaultTags: ['MySQL', 'SQL', 'Relational', 'Database'],
  },
  {
    id: 'sqlite',
    name: 'SQLite',
    slug: 'sqlite',
    iconKey: 'simple-icons:sqlite',
    thumbnail: '/thumbnail/sqlite.png',
    category: TOOL_CATEGORIES.DATABASE,
    defaultDescription: 'Lightweight embedded SQL database, transactions, WAL mode and local storage.',
    defaultTags: ['SQLite', 'Embedded', 'SQL', 'Database'],
  },
  {
    id: 'nginx',
    name: 'Nginx',
    slug: 'nginx',
    iconKey: 'simple-icons:nginx',
    thumbnail: '/thumbnail/nginx.png',
    category: TOOL_CATEGORIES.DEVOPS_CLOUD,
    defaultDescription: 'Reverse proxy, load balancing, SSL configuration, caching and virtual hosts.',
    defaultTags: ['Nginx', 'Reverse Proxy', 'Server', 'DevOps'],
  },
  {
    id: 'linux',
    name: 'Linux',
    slug: 'linux',
    iconKey: 'simple-icons:linux',
    thumbnail: '/thumbnail/linux.png',
    category: TOOL_CATEGORIES.SYSTEM_CONCEPTS,
    defaultDescription: 'Bash scripting, system administration, kernel concepts, permissions and processes.',
    defaultTags: ['Linux', 'Bash', 'SysAdmin', 'OS'],
  },
  {
    id: 'kafka',
    name: 'Kafka',
    slug: 'kafka',
    iconKey: 'simple-icons:apachekafka',
    thumbnail: '/thumbnail/kafka.png',
    category: TOOL_CATEGORIES.SYSTEM_CONCEPTS,
    defaultDescription: 'Event streaming, topic partitions, producer/consumer patterns, and Kafka streams.',
    defaultTags: ['Kafka', 'Event Streaming', 'Messaging', 'Distributed'],
  },
  {
    id: 'jenkins',
    name: 'Jenkins',
    slug: 'jenkins',
    iconKey: 'simple-icons:jenkins',
    thumbnail: '/thumbnail/jenkins.png',
    category: TOOL_CATEGORIES.DEVOPS_CLOUD,
    defaultDescription: 'Jenkins declarative pipelines, automated builds, test execution and deployments.',
    defaultTags: ['Jenkins', 'CI/CD', 'Automation', 'DevOps'],
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    slug: 'gitlab',
    iconKey: 'simple-icons:gitlab',
    thumbnail: '/thumbnail/gitlab.png',
    category: TOOL_CATEGORIES.TOOLS_DESIGN,
    defaultDescription: 'GitLab CI/CD runners, container registry, merge requests and DevOps lifecycles.',
    defaultTags: ['GitLab', 'Git', 'CI/CD', 'DevOps'],
  },
  {
    id: 'jira',
    name: 'Jira',
    slug: 'jira',
    iconKey: 'simple-icons:jira',
    thumbnail: '/thumbnail/jira.png',
    category: TOOL_CATEGORIES.TOOLS_DESIGN,
    defaultDescription: 'Agile sprints, Kanban boards, issue workflows, backlog management and epics.',
    defaultTags: ['Jira', 'Agile', 'Project Management', 'Scrum'],
  },
  {
    id: 'notion',
    name: 'Notion',
    slug: 'notion',
    iconKey: 'simple-icons:notion',
    thumbnail: '/thumbnail/notion.png',
    category: TOOL_CATEGORIES.TOOLS_DESIGN,
    defaultDescription: 'Engineering documentation, knowledge bases, database views and team workspaces.',
    defaultTags: ['Notion', 'Documentation', 'Notes', 'Productivity'],
  },
  {
    id: 'graphql',
    name: 'GraphQL',
    slug: 'graphql',
    iconKey: 'simple-icons:graphql',
    thumbnail: '/thumbnail/graphql.png',
    category: TOOL_CATEGORIES.BACKEND,
    defaultDescription: 'Schemas, queries, mutations, resolvers, subscriptions and Apollo client/server.',
    defaultTags: ['GraphQL', 'API', 'Schemas', 'Backend'],
  },
  {
    id: 'supabase',
    name: 'Supabase',
    slug: 'supabase',
    iconKey: 'simple-icons:supabase',
    thumbnail: '/thumbnail/supabase.png',
    category: TOOL_CATEGORIES.DATABASE,
    defaultDescription: 'Open-source Firebase alternative with PostgreSQL, Auth, Realtime, and Edge Functions.',
    defaultTags: ['Supabase', 'PostgreSQL', 'Auth', 'BaaS'],
  },
  {
    id: 'elasticsearch',
    name: 'Elasticsearch',
    slug: 'elasticsearch',
    iconKey: 'simple-icons:elasticsearch',
    thumbnail: '/thumbnail/elasticsearch.png',
    category: TOOL_CATEGORIES.DATABASE,
    defaultDescription: 'Full-text search, inverted indexes, analyzers, Lucene queries and ELK observability.',
    defaultTags: ['Elasticsearch', 'Search', 'ELK', 'Analytics'],
  },
];

/**
 * Get tool definition by id or slug (case-insensitive)
 */
export function getToolById(idOrSlug) {
  if (!idOrSlug) return null;
  const clean = idOrSlug.toLowerCase().trim();
  return TOOLS.find(
    (t) => t.id === clean || t.slug === clean || t.name.toLowerCase() === clean
  ) || null;
}

/**
 * Find tool by matching text / keyword
 */
export function findToolByKeyword(text) {
  if (!text) return null;
  const clean = text.toLowerCase().trim();
  
  // Exact match
  const exact = TOOLS.find((t) => t.name.toLowerCase() === clean || t.slug === clean || t.id === clean);
  if (exact) return exact;

  // Contains match
  return TOOLS.find((t) => clean.includes(t.slug) || clean.includes(t.name.toLowerCase())) || null;
}

/**
 * Get theme-aware default thumbnail
 */
export function getDefaultThumbnail(theme = 'dark') {
  return theme === 'light' ? DEFAULT_THUMBNAILS.light : DEFAULT_THUMBNAILS.dark;
}

/**
 * Resolve the thumbnail path for a tool name or custom thumbnail string
 */
export function resolveThumbnail(toolOrThumb, theme = 'dark') {
  if (!toolOrThumb) {
    return getDefaultThumbnail(theme);
  }

  // If already a valid absolute or local path
  if (toolOrThumb.startsWith('/') || toolOrThumb.startsWith('http')) {
    return toolOrThumb;
  }

  // If tool name or slug
  const tool = getToolById(toolOrThumb) || findToolByKeyword(toolOrThumb);
  if (tool && tool.thumbnail) {
    return tool.thumbnail;
  }

  return getDefaultThumbnail(theme);
}
