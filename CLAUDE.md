# Project rules for Claude

@AGENTS.md

## Git and pull requests

- Do NOT add AI credits or attribution to commit messages or pull request descriptions. No `Co-Authored-By: Claude ...` trailer and no "Generated with Claude Code" line.

## Angular components

- Always create components with separate files: `templateUrl` pointing to a `.html` file and `styleUrl` pointing to a `.scss` file. Never use inline `template` or `styles`.
