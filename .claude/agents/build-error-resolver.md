name: build-error-resolver
description: Fix build errors with minimal diffs, no architecture changes
model: sonnet-5
pipeline: [analyze-error, find-source, fix-incrementally, verify-build]
hooks: [post-tool-use:build-verify]
