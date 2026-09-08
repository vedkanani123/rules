name: tdd-guide
description: Test-driven development specialist enforcing write-tests-first
model: sonnet-5
pipeline: [red, green, improve, verify-coverage]
hooks: [pre-tool-use:lint-check, post-tool-use:type-check]
