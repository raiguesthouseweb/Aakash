# Contributing to Rai Guest House Management System

Thank you for your interest in contributing to the Rai Guest House Management System! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Environment](#development-environment)
4. [Branching Strategy](#branching-strategy)
5. [Making Changes](#making-changes)
6. [Testing](#testing)
7. [Submitting Changes](#submitting-changes)
8. [Code Style Guidelines](#code-style-guidelines)
9. [Documentation](#documentation)
10. [Issue Tracking](#issue-tracking)

## Code of Conduct

Please be respectful and considerate of others when contributing to this project. We aim to foster an inclusive and welcoming community.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```
   git clone https://github.com/your-username/rai-guest-house.git
   cd rai-guest-house
   ```
3. Add the original repository as an upstream remote:
   ```
   git remote add upstream https://github.com/original-owner/rai-guest-house.git
   ```
4. Install dependencies:
   ```
   npm install
   ```
5. Start the development server:
   ```
   npm run dev
   ```

## Development Environment

- **Node.js**: v16 or higher
- **npm** or **yarn**
- **Code editor**: VSCode recommended with the following extensions:
  - ESLint
  - Prettier
  - TypeScript support

## Branching Strategy

- `main`: Production-ready code
- `develop`: Main development branch
- Feature branches: Create from `develop` with the naming convention `feature/your-feature-name`
- Bug fix branches: Create from `develop` with the naming convention `fix/issue-description`

## Making Changes

1. Create a new branch from `develop`:
   ```
   git checkout develop
   git pull upstream develop
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Commit your changes with clear, descriptive commit messages:
   ```
   git commit -m "Add feature: brief description of the feature"
   ```

4. Keep your branch updated with the upstream:
   ```
   git fetch upstream
   git rebase upstream/develop
   ```

## Testing

Before submitting your changes:

1. Make sure the application builds without errors:
   ```
   npm run build
   ```

2. Test your changes thoroughly, including:
   - Testing the user interface
   - Testing all affected API endpoints
   - Testing on different devices/screen sizes if making UI changes

## Submitting Changes

1. Push your changes to your fork:
   ```
   git push origin feature/your-feature-name
   ```

2. Create a pull request from your fork to the original repository's `develop` branch

3. In your pull request description:
   - Clearly describe the changes
   - Reference any related issues
   - Include screenshots for UI changes
   - List any breaking changes

4. Wait for maintainers to review your pull request
   - Address any feedback from code reviews
   - Make additional commits to your branch as needed

## Code Style Guidelines

This project follows specific coding conventions:

### JavaScript/TypeScript

- Use TypeScript for type safety
- Follow ES6+ syntax standards
- Use async/await for asynchronous operations
- Use arrow functions when appropriate
- Document functions with JSDoc comments

### React

- Use functional components with hooks
- Keep components focused on a single responsibility
- Use the provided UI components from Shadcn UI
- Follow the established component structure

### CSS/Styling

- Use Tailwind CSS for styling
- Follow the project's established design system
- Ensure responsive design for all screen sizes

## Documentation

- Document all API endpoints in the API.md file
- Add JSDoc comments to functions and components
- Update the README.md when making significant changes
- Document any environment variables in .env.example

## Issue Tracking

- Check the existing issues before creating a new one
- Use issue templates when available
- Be specific and include steps to reproduce when reporting bugs
- For feature requests, clearly describe the proposed functionality

Thank you for contributing to the Rai Guest House Management System!