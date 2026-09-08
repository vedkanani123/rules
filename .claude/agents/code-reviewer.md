name: code-reviewer
description: Code quality, patterns, security, maintainability review
model: sonnet-5
pipeline: [security-first, quality-checklist, agent-feedback]
hooks: [post-tool-use:format, lint, build-verify]
