# TypeScript Library CI/CD Setup for @xrepl/client

You are tasked with setting up a complete CI/CD pipeline for a TypeScript library package called `@xrepl/client`. This library will be published to both NPM and GitHub Packages.

## Project Context

- **Package Name**: `@xrepl/client`
- **Organization/Scope**: `@xrepl` (GitHub organization)
- **Package Type**: TypeScript library
- **Target Registries**: NPM public registry AND GitHub Packages
- **Version Management**: Manual semantic versioning (major.minor.patch)

## Tasks Overview

You need to create and configure the following:

1. GitHub Actions workflow for CI/CD
2. Version bump validation workflow
3. TypeScript build configuration
4. Package.json configuration for dual publishing
5. Documentation for secret setup

## Detailed Requirements

### 1. TypeScript Build Configuration

Create or update `tsconfig.json` with best practices for a library package:

- Target modern JavaScript (ES2020 or newer)
- Generate declaration files (.d.ts)
- Source maps for debugging
- Strict type checking enabled
- Output directory: `dist/`
- Include proper module resolution

Create a build script that:
- Cleans the dist directory before building
- Compiles TypeScript to JavaScript
- Generates type declarations
- Preserves source structure

### 2. Package.json Configuration

Update `package.json` with:

**Publishing Configuration**:
```json
{
  "name": "@xrepl/client",
  "version": "0.0.0",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org"
  }
}
```

**Scripts** (at minimum):
- `build`: Clean and compile TypeScript
- `test`: Run all tests
- `lint`: Run ESLint
- `typecheck`: Run TypeScript compiler in check mode
- `prepublishOnly`: Run build before publishing

### 3. GitHub Actions Workflow: Version Check

**File**: `.github/workflows/version-check.yml`

This workflow should:
- Trigger on pull requests to `main` branch
- Check out the code
- Compare `package.json` version in PR against `main` branch
- **FAIL the check** if version has not been incremented
- Provide clear error message indicating which version component should be bumped
- Validate that the version follows semantic versioning format (X.Y.Z)

**Requirements**:
- Use `actions/checkout@v4` with fetch-depth: 0 to get full history
- Compare semantic versions properly (not just string comparison)
- Account for major, minor, and patch version bumps
- Add a helpful comment or annotation explaining which versions are being compared

### 4. GitHub Actions Workflow: CI/CD Pipeline

**File**: `.github/workflows/publish.yml`

This workflow should trigger on:
- Push to `main` branch (after PR merge)

**Jobs Structure**:

#### Job 1: Quality Checks
- **Matrix Strategy**: Test against multiple Node.js versions
  - Use Node.js LTS versions: 18.x, 20.x, 22.x
  - Use `actions/setup-node@v4`
- **Steps**:
  1. Checkout code
  2. Setup Node.js
  3. Install dependencies (`npm ci`)
  4. Run linting (`npm run lint`)
  5. Run type checking (`npm run typecheck`)
  6. Run tests (`npm test`)
  7. Build the package (`npm run build`)

#### Job 2: Publish to NPM
- **Depends on**: Quality Checks job must pass
- **Runs on**: ubuntu-latest, Node.js 20.x (LTS)
- **Steps**:
  1. Checkout code
  2. Setup Node.js with registry-url: 'https://registry.npmjs.org'
  3. Install dependencies
  4. Build the package
  5. Publish to NPM using `npm publish`
  6. Use `NODE_AUTH_TOKEN` secret for authentication

#### Job 3: Publish to GitHub Packages
- **Depends on**: Quality Checks job must pass
- **Runs on**: ubuntu-latest, Node.js 20.x (LTS)
- **Steps**:
  1. Checkout code
  2. Setup Node.js with registry-url: 'https://npm.pkg.github.com'
  3. Install dependencies
  4. Build the package
  5. Update package.json to use GitHub Packages registry in publishConfig
  6. Publish to GitHub Packages using `npm publish`
  7. Use `GITHUB_TOKEN` secret for authentication

**Important Considerations**:
- Use `npm ci` instead of `npm install` for reproducible builds
- Cache npm dependencies for faster builds
- Set appropriate permissions for GITHUB_TOKEN
- Handle errors gracefully and provide clear failure messages
- Ensure dist/ directory is included in publish but not in git

### 5. .gitignore Configuration

Ensure `.gitignore` includes:
```
node_modules/
dist/
*.log
.DS_Store
coverage/
.env
.env.local
```

### 6. .npmignore Configuration

Create `.npmignore` to exclude unnecessary files from published package:
```
src/
tests/
*.test.ts
*.spec.ts
.github/
.gitignore
tsconfig.json
.eslintrc*
.prettierrc*
jest.config.*
```

### 7. Documentation: Setting Up Secrets

Create `SETUP.md` with detailed instructions:

#### Required GitHub Secrets

**For NPM Publishing**:
1. Go to https://www.npmjs.com
2. Log in to your account
3. Click on your profile → Access Tokens
4. Generate New Token → Classic Token
5. Select "Automation" type (for CI/CD)
6. Copy the token
7. Go to GitHub: Settings → Secrets and variables → Actions
8. Click "New organization secret" (for @xrepl organization)
9. Name: `NPM_TOKEN`
10. Value: Paste the NPM token
11. Save

**For GitHub Packages**:
- `GITHUB_TOKEN` is automatically available in GitHub Actions
- Ensure the token has `packages:write` permission
- No manual setup required, but verify in workflow with:
  ```yaml
  permissions:
    contents: read
    packages: write
  ```

#### Repository Configuration for GitHub Packages

1. Ensure package.json has correct repository field:
```json
{
  "repository": {
    "type": "git",
    "url": "git+https://github.com/xrepl/client.git"
  }
}
```

2. For users to install from GitHub Packages, they need `.npmrc`:
```
@xrepl:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

### 8. Testing the Setup

Include a testing checklist in SETUP.md:

- [ ] Version check workflow triggers on PRs
- [ ] Version check fails when version not bumped
- [ ] Version check passes when version is bumped
- [ ] All quality checks pass (lint, typecheck, test, build)
- [ ] Package publishes to NPM successfully
- [ ] Package publishes to GitHub Packages successfully
- [ ] Package can be installed from NPM: `npm install @xrepl/client`
- [ ] Package can be installed from GitHub Packages

## Implementation Notes

### Best Practices to Follow

1. **Semantic Versioning**: Ensure version comparison is semantic-aware
2. **Idempotency**: Publishing should be idempotent (won't fail if version already exists)
3. **Security**: Never commit tokens or secrets
4. **Build Artifacts**: dist/ should be in .gitignore but published to npm
5. **Type Safety**: Export types properly for TypeScript consumers
6. **Documentation**: Include clear error messages in workflow failures

### Error Handling

Workflows should fail fast and provide clear error messages:
- "Version not bumped. Please increment version in package.json"
- "Tests failed. Please fix failing tests before merging"
- "Type check failed. Please fix TypeScript errors"
- "Build failed. Check compilation errors"

### Validation Rules

Version check should validate:
- Version format is valid semver (X.Y.Z)
- Version is greater than main branch version
- At least one version component has been incremented
- No pre-release or build metadata (unless explicitly allowed)

## File Structure Expected

After completion, the repository should have:

```
.github/
  workflows/
    version-check.yml
    publish.yml
src/
  index.ts
  (other source files)
dist/           # Generated, in .gitignore
  index.js
  index.d.ts
  (other built files)
tests/
  (test files)
package.json
tsconfig.json
.gitignore
.npmignore
README.md
SETUP.md
LICENSE
```

## Success Criteria

The setup is complete when:

1. ✅ A PR without version bump fails the version-check workflow
2. ✅ A PR with version bump passes the version-check workflow
3. ✅ Merging to main triggers the publish workflow
4. ✅ All quality checks (lint, typecheck, test, build) must pass
5. ✅ Package successfully publishes to NPM
6. ✅ Package successfully publishes to GitHub Packages
7. ✅ Published package can be installed and used in other projects
8. ✅ Type definitions work correctly for TypeScript consumers

## Additional Considerations

- Consider adding a CHANGELOG.md and automating changelog generation
- Consider adding automated release notes on GitHub
- Consider badge integration in README.md for build status
- Consider adding code coverage reporting
- Consider adding Dependabot for dependency updates

---

**Start by creating the GitHub Actions workflows first, then update package.json and build configuration, and finally create the documentation.**