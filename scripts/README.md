# Chain Guard Scripts

Utility scripts for development, testing, and deployment.

## Available Scripts

### setup.sh
Sets up the development environment.

```bash
./scripts/setup.sh
```

What it does:
- Checks Node.js version
- Installs dependencies
- Builds packages
- Runs initial tests

### test.sh
Runs the complete test suite.

```bash
./scripts/test.sh
```

Includes:
- Unit tests
- Integration tests
- Coverage reports

### deploy.sh
Deploys packages to production.

```bash
./scripts/deploy.sh
```

Requirements:
- Must be on main branch
- No uncommitted changes
- All tests must pass

### clean.sh
Cleans build artifacts and dependencies.

```bash
./scripts/clean.sh
```

Removes:
- node_modules
- dist directories
- build artifacts
- coverage reports

## Usage

Make scripts executable:
```bash
chmod +x scripts/*.sh
```

Run a script:
```bash
./scripts/setup.sh
```

## CI/CD Integration

These scripts are used in GitHub Actions workflows:
- `.github/workflows/ci.yml` - Uses test.sh
- `.github/workflows/deploy.yml` - Uses deploy.sh

## Troubleshooting

### Permission denied
```bash
chmod +x scripts/*.sh
```

### Node version error
Install Node.js 18 or higher:
```bash
nvm install 18
nvm use 18
```

### Build failures
Clean and rebuild:
```bash
./scripts/clean.sh
./scripts/setup.sh
```
