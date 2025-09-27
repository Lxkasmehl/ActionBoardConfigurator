export const generateReadme = () => {
  return `# Exported Website

This is a React application exported from WebAppConfigurator.

## Environment Configuration

Before running the application, you need to set up your environment variables:

1. Create a \`.env\` file in the root directory
2. Add the following variables:
   \`\`\`
   VITE_API_USER=your_api_user
   VITE_API_PASSWORD=your_api_password
   \`\`\`
3. Replace \`your_api_user\` and \`your_api_password\` with your actual SuccessFactors API credentials

> **Important**: The \`.env\` file contains sensitive information and should never be committed to version control. Make sure to add it to your \`.gitignore\` file.

## Development Setup

1. Copy \`.env.example\` to \`.env\` (if available)
2. Fill in your API credentials in \`.env\`
3. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
4. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`
5. Open http://localhost:3000 in your browser

## Production Deployment

1. Create a \`.env\` file with your production API credentials
2. Build the application:
   \`\`\`bash
   npm run build
   \`\`\`
3. Preview the production build:
   \`\`\`bash
   npm run preview
   \`\`\`
4. Deploy the contents of the \`dist\` directory to your web server

## API Proxy Configuration

The application uses a proxy to forward API requests to SuccessFactors. The proxy configuration is set up in \`vite.config.js\`. Make sure your production environment is configured to handle these proxy requests appropriately.

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
