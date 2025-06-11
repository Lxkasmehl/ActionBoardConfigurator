// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'WebAppConfigurator',
  tagline:
    'A modern enterprise data visualization and UI builder platform for SAP SuccessFactors',
  favicon:
    'https://www.pentoslabs.com/wp-content/uploads/2020/03/pentos_labs_favicon.jpg',

  // Set the production url of your site here
  url: 'https://lxkasmehl.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/WebAppConfigurator/',
  trailingSlash: true,

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'Lxkasmehl', // Usually your GitHub org/user name.
  projectName: 'WebAppConfigurator', // Usually your repo name.
  deploymentBranch: 'gh-pages',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/pentos/webappconfigurator/tree/main/',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/pentos/webappconfigurator/tree/main/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'WebAppConfigurator',
        logo: {
          alt: 'WebAppConfigurator Logo',
          src: 'https://www.pentoslabs.com/wp-content/uploads/2020/03/pentos_labs_favicon.jpg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docs',
            position: 'left',
            label: 'Documentation',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Introduction',
                to: '/docs/intro',
              },
              {
                label: 'Data Picker',
                to: '/docs/features/data-picker',
              },
              {
                label: 'UI Builder',
                to: '/docs/features/ui-builder',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/Lxkasmehl/WebAppConfigurator',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Pentos AG. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
