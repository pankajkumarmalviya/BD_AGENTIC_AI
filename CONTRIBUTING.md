# Contributing to Bridge CLI Skill

Thank you for your interest in contributing! This document provides guidelines for contributing to the Bridge CLI Skill project.

## How to Contribute

### Reporting Issues

- Use the [GitHub Issues](https://github.com/YOUR-USERNAME/bridge-cli-skill/issues) page
- Search existing issues before creating a new one
- Include as much detail as possible:
  - AI assistant and version
  - Operating system
  - Steps to reproduce
  - Expected vs actual behavior
  - Error messages or logs

### Suggesting Features

- Open an issue with the "enhancement" label
- Describe the feature and its use case
- Explain how it would benefit users

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes**
4. **Test your changes** with multiple AI assistants if possible
5. **Commit with clear messages**: Follow conventional commits (feat:, fix:, docs:, etc.)
6. **Push to your fork**: `git push origin feature/your-feature-name`
7. **Open a Pull Request** with a clear description

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR-USERNAME/bridge-cli-skill.git
   cd bridge-cli-skill
   ```

2. Install dependencies (if any):
   ```bash
   npm install
   ```

3. Test locally:
   ```bash
   node cli/install.js --list
   ```

## Project Structure

```
bridge-cli-skill/
├── skills/
│   └── bridge-scan/
│       ├── SKILL.md      # Main AI skill prompt
│       └── README.md     # User documentation
├── cli/
│   └── install.js        # Universal installer
├── install.sh            # macOS/Linux installer
├── install.ps1           # Windows installer
├── README.md             # Main project docs
├── INSTALL.md            # Installation guide
└── package.json
```

## Coding Guidelines

### For SKILL.md

- Keep prompts clear and specific
- Use step-by-step instructions
- Include error handling guidance
- Test with multiple AI assistants
- Add examples where helpful

### For Installer (cli/install.js)

- Follow Node.js best practices
- Handle errors gracefully
- Provide clear console output
- Test on multiple platforms (macOS, Linux, Windows)
- Add new AI assistants to the PROVIDERS array

### For Documentation

- Use clear, concise language
- Include code examples
- Keep installation instructions up to date
- Add screenshots where helpful

## Adding Support for New AI Assistants

To add a new AI assistant:

1. Add entry to `PROVIDERS` array in `cli/install.js`:
   ```javascript
   {
     id: 'new-assistant',
     label: 'New Assistant',
     detect: 'dir:$HOME/.new-assistant',
     mech: 'skill',
     profile: 'new-assistant-profile' // or null
   }
   ```

2. Implement installation logic if needed
3. Update README.md and INSTALL.md
4. Test installation and uninstallation
5. Submit PR with test results

## Testing

Before submitting a PR:

1. **Test installation** on your system
2. **Test the /bridge-scan command** in at least one AI assistant
3. **Test uninstallation**
4. **Verify documentation** is accurate

## Questions?

- Open an issue for questions
- Tag with "question" label
- We're here to help!

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Focus on what's best for the project

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
