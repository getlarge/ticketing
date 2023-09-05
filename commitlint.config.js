const { execSync } = require('child_process');

const projects = execSync('yarn nx show projects --json', { encoding: 'utf-8' });

/*
 * Type-Enums and their documentation as reusable const.
 */
const typeEnumDescription = {
  feat: {
    description: 'Adding new functionality',
    title: 'Feature',
    emoji: '🐣',
  },
  a11y: {
    description: 'An accessibility improvement or fix',
    title: 'Accessibility Fixes',
    emoji: '♿',
  },
  docs: {
    description: 'Documentation only changes',
    title: 'Documentation',
    emoji: '📜',
  },
  format: {
    description:
      'Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)',
    title: 'Formatting',
    emoji: '💎',
  },
  styles: {
    description: 'Changes that do affect the visual appearance of the code (css, scss, svg, icons, fonts, images)',
    title: 'Styling',
    emoji: '💅',
  },
  refactor: {
    description: 'A code change that neither fixes a bug nor adds a feature',
    title: 'Code Refactoring',
    emoji: '♻',
  },
  perf: {
    description: 'A code change that improves performance',
    title: 'Performance Improvements',
    emoji: '🚀',
  },
  deprecate: {
    description: 'A code change that deprecates APIs or is related to their deprecation',
    title: 'Code Deprecations',
    emoji: '🕸',
  },
  test: {
    description: 'Adding missing tests or correcting existing tests',
    title: 'Tests',
    emoji: '🛂',
  },
  build: {
    description: 'Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)',
    title: 'Builds',
    emoji: '📦',
  },
  ci: {
    description:
      'Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)',
    title: 'Continuous Integrations',
    emoji: '🏭',
  },
  chore: {
    description: "Other changes that don't modify src or test files",
    title: 'Chores',
    emoji: '⚙',
  },
  revert: {
    description: 'Reverts a previous commit',
    title: 'Reverts',
    emoji: '🗑',
  },
  fix: {
    description: 'A code change that fixes an error or bug',
    title: 'Fix',
    emoji: '💉',
  },
};

const Configuration = {
  /*
   * Resolve and load @commitlint/config-conventional from node_modules.
   * Referenced packages must be installed
   */
  extends: ['@commitlint/config-conventional'],
  /*
   * Override rules from @commitlint/config-conventional
   */
  rules: {
    /*
     * Customized types matching CU folders
     */
    'type-enum': [2, 'always', Object.keys(typeEnumDescription)],
    /*
     * Scope enums derived from projects registered in `workspace.json`
     */
    'scope-enum': [2, 'always', Object.keys(JSON.parse(projects))]
  },
  /*
   * Prompt config for commit message support
   */
  prompt: {
    questions: {
      type: {
        description: "Select the type of change that you're committing",
        enum: typeEnumDescription,
      },
      scope: {
        description:
          'What is the scope of this change based on workspace.json projects or choose empty if no scope is used (e.g. user-common-data, empty)',
      },
      subject: {
        description: 'Write a short, imperative tense description of the change',
      },
      body: {
        description: 'Provide a longer description of the change',
      },
      isBreaking: {
        description: 'Are there any breaking changes?',
      },
      breakingBody: {
        description: 'A BREAKING CHANGE commit requires a body. Please enter a longer description of the commit itself',
      },
      breaking: {
        description: 'Describe the breaking changes',
      },
      isIssueAffected: {
        description: 'Does this change affect any open issues?',
      },
      issuesBody: {
        description:
          'If issues are closed, the commit requires a body. Please enter a longer description of the commit itself',
      },
      issues: {
        description: "Add issue references (for issues e.g. 'fix #123'.)",
      },
    },
  },
};

module.exports = Configuration;
