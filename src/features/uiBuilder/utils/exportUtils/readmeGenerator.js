export const generateReadme = () => {
  return `# Exported Website

This is a React application exported from WebAppConfigurator.

## How to Run

### Development
1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
2. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`
3. Open http://localhost:3000 in your browser

### Production Build
1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
2. Build the application:
   \`\`\`bash
   npm run build
   \`\`\`
3. Preview the production build:
   \`\`\`bash
   npm run preview
   \`\`\`
4. The built files will be in the \`dist\` directory
5. You can serve these files using any static file server

## Project Structure
- \`src/App.jsx\`: Main application component
- \`src/main.jsx\`: Application entry point
- \`index.html\`: HTML template
- \`vite.config.js\`: Vite configuration
- \`package.json\`: Project configuration and dependencies

## Dependencies
- React 18
- Material-UI Joy
- Vite
`;
};
