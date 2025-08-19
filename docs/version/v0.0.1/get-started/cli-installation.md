# CLI Installation

React Bits uses a jsrepo registry to host components, making it very easy for you to bring them into your projects. Here, you have two options:

## 1. One-time Installation

You can install components fast using a one-time install command. You'll get prompted to select an installation path and to install dependencies.

```bash
npx @react-bits/cli add button
```

### Interactive prompts:
- **Installation path**: Choose where to install the component
- **Dependencies**: Automatically install required packages
- **TypeScript**: Option to generate TypeScript definitions

## 2. Global Installation

Install the CLI globally for easier access:

```bash
npm install -g @react-bits/cli
```

Then use it to add components:

```bash
react-bits add button
react-bits add card
react-bits add modal
```

## 3. Initialize Project

For new projects, you can initialize with a complete setup:

```bash
npx @react-bits/cli init my-project
cd my-project
npm install
```

This will create:
- Project structure
- Configuration files
- Basic components
- Development dependencies

## 4. Browse Available Components

List all available components:

```bash
react-bits list
```

Search for specific components:

```bash
react-bits search button
react-bits search --category navigation
react-bits search --tag responsive
```

## 5. Update Components

Keep your components up to date:

```bash
react-bits update button
react-bits update --all
```

## 6. Configuration

Customize CLI behavior with a config file:

```json
{
  "installPath": "./src/components",
  "typescript": true,
  "cssFramework": "tailwind",
  "autoInstallDeps": true
}
```

## CLI Commands Reference

| Command | Description | Example |
|---------|-------------|---------|
| `add` | Install a component | `react-bits add button` |
| `list` | Show all components | `react-bits list` |
| `search` | Find components | `react-bits search modal` |
| `update` | Update components | `react-bits update --all` |
| `init` | Initialize project | `react-bits init my-app` |
| `config` | Manage settings | `react-bits config --show` |

## That's all!

The CLI makes it super easy to manage React Bits components in your projects. No more copy-pasting - just install and use!