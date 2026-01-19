# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Project Octopus is a script management and distribution system for Adobe InDesign. It consists of ExtendScript (JSX) files that run inside InDesign to provide various automation and utility functions for typesetting workflows.

Website: https://www.project-octopus.net

## Technology Stack

- **Language**: Adobe ExtendScript (JSX) - an ES3-based JavaScript dialect
- **Target Application**: Adobe InDesign
- **UI Framework**: ScriptUI (Adobe's dialog system)

## Key Files

- **Octopus-include.jsxinc** - Shared utility library included by all scripts via `#include`. Contains common functions for config management, file I/O, HTTP requests, logging, UI helpers, and localization.
- **Octopus-Installer.jsx** - Startup script that downloads/updates scripts from remote server, manages versioning, and installs menu items in InDesign.
- **Octopus.json** - Script registry defining metadata (version, paths, menu placement, localized titles).
- **Dashboard.jsx** - Main control panel for managing Octopus installation.

## Architecture Patterns

### Script Structure
Each script follows this pattern:
```javascript
#targetengine "unique_engine_name"  // Persistent engine for palettes
#include "./Octopus-include.jsxinc"  // or "../Octopus-include.jsxinc"
__init();  // Initialize JSON polyfill and other globals
```

### Configuration Storage
- User data stored in `Folder.userData` under `octopus/` (cross-version) and `octopus_<version>/` (version-specific)
- Script metadata stored as InDesign application labels via `app.insertLabel()` / `app.extractLabel()`
- Preferences stored as JSON files

### Localization
Scripts use `localize()` with object literals: `localize({de: "German", en: "English"})`

### UI Dialogs
- Use `Window('dialog')` for modal dialogs, `Window('palette')` for non-modal
- Common pattern: `__insert_head(w)` adds branded header with help button
- Script name stored in `w.script_name` property for help URL lookup

## ExtendScript Specifics

- No ES6+ features (no `let`, `const`, arrow functions, template literals, spread, destructuring)
- Use `var` for all variables
- Use `for` loops instead of array methods like `.forEach()`, `.map()`
- String concatenation with `+` operator
- JSON requires polyfill (provided by `__init()`)
- File paths use `File()` and `Folder()` objects with `fullName` property
- Cross-platform paths: use `/` separator, `unescape()` for URL-encoded paths
