# Contributing to Chain Guard

Thank you for your interest in contributing to Chain Guard! This document provides guidelines and instructions for contributing.

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please be respectful and professional in all interactions.

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Git

### Setup Development Environment

1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/your-username/chain-guard.git
cd chain-guard
```

3. Install dependencies:
```bash
npm install
```

4. Create a branch:
```bash
git checkout -b feature/your-feature-name
```

## Development Workflow

### Running Tests

```bash
npm test                 # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
```

### Linting and Formatting

```bash
npm run lint            # Run ESLint
npm run lint:fix        # Fix linting issues
npm run format          # Format code with Prettier
npm run format:check    # Check formatting
```

### Building

```bash
npm run build           # Build all packages
npm run build:watch     # Build in watch mode
```

### Type Checking

```bash
npm run type-check      # Run TypeScript compiler
```

## Project Structure

```
chain-guard/
├── packages/
│   ├── core/              # Core functionality
│   ├── chrome-extension/  # Browser extension
│   ├── telegram-bot/      # Telegram bot
│   └── shared/            # Shared utilities
├── docs/                  # Documentation
└── .github/               # GitHub workflows
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Provide type annotations for public APIs
- Avoid `any` type when possible

### Code Style

- Follow the existing code style
- Use meaningful variable and function names
- Write self-documenting code
- Add comments for complex logic

### Commit Messages

Follow the Conventional Commits specification:

```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build process or auxiliary tool changes

Examples:
```
feat(wallet): add multi-signature support
fix(ai): correct threat detection algorithm
docs(readme): update installation instructions
```

## Pull Request Process

1. Update documentation for any changed functionality
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Request review from maintainers

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] No merge conflicts
- [ ] CI/CD pipeline passes

## Testing Guidelines

### Unit Tests

- Write tests for all new functions
- Aim for >80% code coverage
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### Integration Tests

- Test component interactions
- Mock external dependencies
- Test error scenarios

### E2E Tests

- Test critical user flows
- Use realistic test data
- Test on multiple browsers/platforms

## Security

### Reporting Vulnerabilities

Do not open public issues for security vulnerabilities. Email security@chainguard.io instead.

### Security Best Practices

- Never commit secrets or API keys
- Validate all user inputs
- Use parameterized queries
- Follow OWASP guidelines
- Keep dependencies updated

## Documentation

### Code Documentation

- Document all public APIs
- Use JSDoc comments
- Include usage examples
- Document edge cases

### User Documentation

- Keep README.md up to date
- Update API documentation
- Add examples for new features
- Document breaking changes

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create release branch
4. Run full test suite
5. Create GitHub release
6. Publish to npm (maintainers only)

## Community

### Getting Help

- GitHub Discussions for questions
- GitHub Issues for bugs
- Discord for real-time chat

### Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md
- Release notes
- Project website

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to reach out to the maintainers or open a discussion on GitHub.

Thank you for contributing to Chain Guard!
