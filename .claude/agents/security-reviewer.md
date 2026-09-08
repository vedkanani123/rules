name: security-reviewer
description: Security vulnerability review using OWASP + custom security.md rules
model: sonnet-4.6
pipeline: [auth-check, xss-check, injection-check, secret-scan]
hooks: [pre-tool-use:security-check, keyword-detector:security-trigger]
