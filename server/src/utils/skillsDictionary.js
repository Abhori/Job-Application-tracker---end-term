/**
 * Comprehensive, maintained, editable technical skills dictionary.
 * Each entry includes:
 * - name: Display name
 * - category: Functional category (Languages, Frontend, Backend, Databases, Cloud/DevOps, CS Fundamentals, Tools/Practices)
 * - aliases: Array of string/regex synonyms to normalize from raw text
 * - priorityLevel: 'High' | 'Medium' | 'Foundational'
 * - learningTip: Pragmatic guidance for candidates needing to brush up
 */

export const SKILLS_DICTIONARY = [
  // Programming Languages
  {
    name: 'JavaScript',
    category: 'Programming Languages',
    aliases: ['javascript', 'js', 'es6', 'es2015', 'ecmascript'],
    priorityLevel: 'High',
    learningTip: 'Deepen understanding of closures, event loops, promises/async-await, and ES6+ features.',
  },
  {
    name: 'TypeScript',
    category: 'Programming Languages',
    aliases: ['typescript', 'ts'],
    priorityLevel: 'High',
    learningTip: 'Focus on generics, type narrowing, interfaces, utility types, and strict mode configuration.',
  },
  {
    name: 'Python',
    category: 'Programming Languages',
    aliases: ['python', 'python3', 'py'],
    priorityLevel: 'High',
    learningTip: 'Practice object-oriented design, list comprehensions, generators, and standard libraries.',
  },
  {
    name: 'Java',
    category: 'Programming Languages',
    aliases: ['java', 'core java', 'java 8', 'java 11', 'java 17', 'java 21'],
    priorityLevel: 'High',
    learningTip: 'Review multithreading, collections framework, JVM internals, and stream API.',
  },
  {
    name: 'C++',
    category: 'Programming Languages',
    aliases: ['c++', 'cpp', 'c plus plus'],
    priorityLevel: 'Medium',
    learningTip: 'Study pointer arithmetic, memory management (smart pointers), STL containers, and RAII.',
  },
  {
    name: 'C#',
    category: 'Programming Languages',
    aliases: ['c#', 'csharp', 'c sharp', '.net', 'dotnet'],
    priorityLevel: 'Medium',
    learningTip: 'Master LINQ, async/await, dependency injection in .NET Core, and Entity Framework.',
  },
  {
    name: 'Go',
    category: 'Programming Languages',
    aliases: ['golang', 'go lang', '\\bgo\\b'],
    priorityLevel: 'Medium',
    learningTip: 'Focus on goroutines, channels, interfaces, and concurrency patterns in Go.',
  },
  {
    name: 'Rust',
    category: 'Programming Languages',
    aliases: ['rust', 'rustlang'],
    priorityLevel: 'Medium',
    learningTip: 'Understand the borrow checker, ownership semantics, lifetimes, and error handling.',
  },
  {
    name: 'SQL',
    category: 'Databases',
    aliases: ['sql', 'relational database', 'rdbms', 'mysql', 'sqlite'],
    priorityLevel: 'High',
    learningTip: 'Practice complex joins, indexing, query optimization, subqueries, and ACID properties.',
  },

  // Frontend
  {
    name: 'React',
    category: 'Frontend Development',
    aliases: ['react', 'react.js', 'reactjs', 'react native'],
    priorityLevel: 'High',
    learningTip: 'Review React 18 hooks (useEffect, useMemo, useCallback), context API, and component lifecycles.',
  },
  {
    name: 'HTML',
    category: 'Frontend Development',
    aliases: ['html', 'html5', 'semantic html'],
    priorityLevel: 'Foundational',
    learningTip: 'Focus on semantic elements, accessibility (ARIA), and SEO meta tags.',
  },
  {
    name: 'CSS',
    category: 'Frontend Development',
    aliases: ['css', 'css3', 'styles', 'stylesheet'],
    priorityLevel: 'Foundational',
    learningTip: 'Review Flexbox, CSS Grid, media queries, CSS variables, and responsive design principles.',
  },
  {
    name: 'Tailwind CSS',
    category: 'Frontend Development',
    aliases: ['tailwind', 'tailwindcss'],
    priorityLevel: 'Medium',
    learningTip: 'Learn utility-first styling patterns, responsive modifiers, and custom theme configs.',
  },
  {
    name: 'Next.js',
    category: 'Frontend Development',
    aliases: ['next.js', 'nextjs', 'next js'],
    priorityLevel: 'High',
    learningTip: 'Study App Router, Server Components vs Client Components, SSR, SSG, and API routes.',
  },
  {
    name: 'Vue.js',
    category: 'Frontend Development',
    aliases: ['vue', 'vue.js', 'vuejs', 'vue3'],
    priorityLevel: 'Medium',
    learningTip: 'Learn the Composition API, Pinia state management, and Vue Router.',
  },
  {
    name: 'Angular',
    category: 'Frontend Development',
    aliases: ['angular', 'angularjs', 'angular 2+'],
    priorityLevel: 'Medium',
    learningTip: 'Study RxJS observables, Angular CLI, signals, modules, and dependency injection.',
  },
  {
    name: 'Redux',
    category: 'Frontend Development',
    aliases: ['redux', 'redux toolkit', 'rtk'],
    priorityLevel: 'Medium',
    learningTip: 'Practice centralized state slices, Redux Toolkit reducers, and async thunks.',
  },

  // Backend
  {
    name: 'Node.js',
    category: 'Backend Development',
    aliases: ['node', 'node.js', 'nodejs'],
    priorityLevel: 'High',
    learningTip: 'Understand the event loop, streams, buffers, file system access, and cluster modules.',
  },
  {
    name: 'Express',
    category: 'Backend Development',
    aliases: ['express', 'express.js', 'expressjs'],
    priorityLevel: 'High',
    learningTip: 'Focus on middleware chaining, error-handling middleware, router structuring, and security headers.',
  },
  {
    name: 'REST APIs',
    category: 'Backend Development',
    aliases: ['rest', 'rest api', 'restful', 'restful api', 'rest apis'],
    priorityLevel: 'High',
    learningTip: 'Study idempotent HTTP methods, status codes, pagination, rate limiting, and resource modeling.',
  },
  {
    name: 'GraphQL',
    category: 'Backend Development',
    aliases: ['graphql', 'apollo', 'gql'],
    priorityLevel: 'Medium',
    learningTip: 'Learn schema definition language (SDL), queries, mutations, subscriptions, and resolvers.',
  },
  {
    name: 'FastAPI',
    category: 'Backend Development',
    aliases: ['fastapi', 'fast api'],
    priorityLevel: 'Medium',
    learningTip: 'Practice Pydantic data validation, dependency injection, and asynchronous endpoint handlers.',
  },
  {
    name: 'Django',
    category: 'Backend Development',
    aliases: ['django', 'django rest framework', 'drf'],
    priorityLevel: 'Medium',
    learningTip: 'Master Django ORM, authentication middleware, migrations, and DRF serializers.',
  },
  {
    name: 'Spring Boot',
    category: 'Backend Development',
    aliases: ['spring', 'spring boot', 'spring-boot', 'spring mvc'],
    priorityLevel: 'High',
    learningTip: 'Focus on Spring annotations, Spring Security, Hibernate ORM, and REST controller creation.',
  },

  // Databases
  {
    name: 'MongoDB',
    category: 'Databases',
    aliases: ['mongodb', 'mongo', 'mongoose', 'nosql'],
    priorityLevel: 'High',
    learningTip: 'Study document modeling, indexing strategies, aggregation pipelines, and schema validation.',
  },
  {
    name: 'PostgreSQL',
    category: 'Databases',
    aliases: ['postgresql', 'postgres', 'psql'],
    priorityLevel: 'High',
    learningTip: 'Master foreign keys, transactions, indexing (B-Tree, GIN), JSONB queries, and explain plans.',
  },
  {
    name: 'Redis',
    category: 'Databases',
    aliases: ['redis', 'caching', 'in-memory cache'],
    priorityLevel: 'Medium',
    learningTip: 'Understand data structures (strings, hashes, sets), key expiration (TTL), pub/sub, and caching strategies.',
  },

  // Cloud & DevOps
  {
    name: 'Git',
    category: 'Tools & DevOps',
    aliases: ['git', 'github', 'gitlab', 'version control'],
    priorityLevel: 'Foundational',
    learningTip: 'Master interactive rebase, branch workflows, cherry-pick, merge conflict resolution, and PR etiquette.',
  },
  {
    name: 'Docker',
    category: 'Tools & DevOps',
    aliases: ['docker', 'containerization', 'containers', 'docker compose'],
    priorityLevel: 'High',
    learningTip: 'Learn multi-stage Dockerfiles, image optimization, volume mounts, and network bridges.',
  },
  {
    name: 'Kubernetes',
    category: 'Tools & DevOps',
    aliases: ['kubernetes', 'k8s'],
    priorityLevel: 'Medium',
    learningTip: 'Understand Pods, Deployments, Services, Ingress controllers, and Helm charts.',
  },
  {
    name: 'AWS',
    category: 'Cloud Services',
    aliases: ['aws', 'amazon web services', 'ec2', 's3', 'lambda'],
    priorityLevel: 'High',
    learningTip: 'Familiarize with S3, EC2, Lambda serverless functions, IAM policies, and CloudWatch logs.',
  },
  {
    name: 'CI/CD',
    category: 'Tools & DevOps',
    aliases: ['ci/cd', 'ci cd', 'continuous integration', 'github actions', 'jenkins'],
    priorityLevel: 'Medium',
    learningTip: 'Create automated workflows for linting, test execution, container builds, and deployment stages.',
  },
  {
    name: 'Linux',
    category: 'Tools & DevOps',
    aliases: ['linux', 'unix', 'bash', 'shell scripting'],
    priorityLevel: 'Medium',
    learningTip: 'Practice shell navigation, file permissions (chmod/chown), process monitoring, and grep/awk/sed.',
  },

  // CS Fundamentals & Quality
  {
    name: 'Data Structures & Algorithms',
    category: 'CS Fundamentals',
    aliases: ['dsa', 'data structures', 'algorithms', 'data structures and algorithms'],
    priorityLevel: 'High',
    learningTip: 'Practice arrays, strings, hash maps, trees, graphs, dynamic programming, and Big-O notation.',
  },
  {
    name: 'Testing',
    category: 'Software Quality',
    aliases: ['testing', 'unit testing', 'jest', 'vitest', 'mocha', 'cypress', 'playwright', 'tdd'],
    priorityLevel: 'High',
    learningTip: 'Write unit tests, integration tests, mock API calls, and maintain reasonable test coverage.',
  },
  {
    name: 'System Design',
    category: 'CS Fundamentals',
    aliases: ['system design', 'microservices', 'distributed systems', 'scalability', 'high availability'],
    priorityLevel: 'High',
    learningTip: 'Learn load balancing, database sharding, caching, message queues, and horizontal scaling tradeoffs.',
  },
  {
    name: 'Agile & Scrum',
    category: 'Tools & DevOps',
    aliases: ['agile', 'scrum', 'jira', 'sprint'],
    priorityLevel: 'Foundational',
    learningTip: 'Understand sprint cycles, standups, story sizing, backlog grooming, and retrospective meetings.',
  },
];
