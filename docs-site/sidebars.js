// @ts-check

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.

 @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  docs: [
    'intro',
    {
      type: 'category',
      label: 'User Guide',
      items: [
        'user-guide/getting-started',
        'user-guide/basic-features',
        'user-guide/data-picker',
        'user-guide/ui-builder',
        'user-guide/faq',
        'user-guide/best-practices',
      ],
    },
    {
      type: 'category',
      label: 'Developer Guide',
      items: [
        'developer-guide/architecture',
        'developer-guide/setup',
        'developer-guide/api-documentation',
        'developer-guide/contributing',
        'developer-guide/deployment',
        'developer-guide/troubleshooting',
      ],
    },
  ],
};

export default sidebars;
