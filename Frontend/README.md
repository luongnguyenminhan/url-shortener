# MediTrack System

A medical tracking system built with React, TypeScript, and Vite.

## Features

-   User authentication and authorization
-   Patient management
-   Medicine management
-   User management

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
    extends: [
        // Remove ...tseslint.configs.recommended and replace with this
        ...tseslint.configs.recommendedTypeChecked,
        // Alternatively, use this for stricter rules
        ...tseslint.configs.strictTypeChecked,
        // Optionally, add this for stylistic rules
        ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
        // other options...
        parserOptions: {
            project: ["./tsconfig.node.json", "./tsconfig.app.json"],
            tsconfigRootDir: import.meta.dirname,
        },
    },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config({
    plugins: {
        // Add the react-x and react-dom plugins
        "react-x": reactX,
        "react-dom": reactDom,
    },
    rules: {
        // other rules...
        // Enable its recommended typescript rules
        ...reactX.configs["recommended-typescript"].rules,
        ...reactDom.configs.recommended.rules,
    },
});
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Building for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

### GitHub Pages

This project is configured to deploy automatically to GitHub Pages using GitHub Actions.

When you push changes to the `main` branch, the application will be built and deployed to GitHub Pages automatically.

#### Manual Deployment

To build the application for GitHub Pages deployment manually:

```bash
npm run deploy
```

### Docker Deployment

You can also deploy this application using Docker:

```bash
# Build the Docker image
docker build -t meditrack-system .

# Run the Docker container
docker run -d -p 80:80 meditrack-system
```

Or using Docker Compose:

```bash
docker-compose up -d
```
