name: browser-agent
description: Browser agent for /browse with anti-bot ML classifier + stealth profiles
model: sonnet-4.6
pipeline: [sidecar-start, navigate, capture-evidence, stealth-mode]
hooks: [keyword-detector:browser-trigger, pre-tool-use:security-check]
