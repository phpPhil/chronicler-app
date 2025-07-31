# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Chronicler** is a dual-layered project that combines a simple coding challenge with an advanced development workflow system:

### Surface Layer: Distance Calculation Challenge
- **Core Task**: Reconcile two lists of location IDs by calculating Manhattan distance
- **Tech Stack**: React + TypeScript frontend, Node.js + TypeScript backend  
- **Input**: Text file with two columns of integers
- **Output**: Total distance between sorted and paired lists
- **Originally**: 2-3 hour coding challenge

### Deep Layer: Advanced Development Workflow System  
- **True Purpose**: Systematic AI-assisted development with extensive tooling
- **27 Workflow Commands**: Comprehensive `cr-*` command system
- **Memory System**: AI collaboration and state tracking
- **Quality Framework**: Test-first development, persona-driven design

## Current Implementation Status

⚠️ **IMPORTANT**: The actual distance calculation challenge is **NOT YET IMPLEMENTED**

### What Exists
- ✅ Basic React 19 frontend skeleton (`frontend/`)
- ✅ Minimal Node.js backend skeleton (`backend/`)
- ✅ Complete workflow system (27 commands in `.claude/commands/`)
- ✅ Extensive documentation (60+ files in `.enaiblelabs/`)
- ✅ npm workspace configuration

### What's Missing (Core Challenge)
- ❌ Distance calculation algorithm in backend
- ❌ File upload functionality in frontend
- ❌ API endpoints for list processing
- ❌ UI components for results display
- ❌ Frontend-backend integration

## Development Approach

**Use the Chronicler workflow system for systematic, quality-driven implementation** (expected completion: <1 hour)

```bash
# Systematic workflow implementation
cr-check-state              # Check current project state
cr-init 5                   # Initialize with core distance calculation features
cr-build-feature 01         # Build distance calculation backend service
cr-build-feature 02         # Build file upload frontend component
cr-validate-implementation  # Verify complete solution
```

### Why Use the Workflow System
- **Quality assurance**: Built-in testing, validation, and accessibility checks
- **Systematic approach**: Step-by-step guidance with proper error handling
- **Documentation**: Automatic generation of comprehensive implementation docs
- **Persona validation**: Ensures solution works for SeniorChroniclerElf
- **Faster development**: Automated scaffolding and validation reduces manual work

## Essential Workflow Commands (27 Total)

### Project Management
```bash
cr-help                     # Comprehensive help system
cr-init [count]             # Initialize project with features
cr-check-state              # Check current project state
cr-check-plan-status        # Plan validation and status
```

### Feature Development
```bash
cr-analyze-feature [name]   # Research feature requirements BEFORE building
cr-build-feature [NN]        # Build feature by number (e.g., 01)
cr-implement-feature [name] # Execute systematic feature development
cr-validate-implementation [name] # Run comprehensive validation
```

### Quality & Analysis
```bash
cr-analyze-recursive [target] # Deep recursive analysis
cr-review-feature [name]    # Comprehensive feature review
cr-review-and-fix [target]  # Combined review and fixing
cr-design-review [target]   # Design review processes
```

### Bug Management
```bash
cr-fix-bug [bug-id]         # Single bug fix with context
cr-fix-all-bugs             # Batch bug fixing workflow
cr-fix-recursive [issue-id] # Recursive issue resolution
```

## Core Challenge Implementation Guide

If implementing the distance calculation challenge directly:

### Backend Implementation Required
1. **Service Layer**: `backend/src/services/`
   - `DistanceEngineService`: Core algorithm (sort lists, pair by position, calculate Manhattan distance)
   - `ListParserService`: Parse and validate uploaded file content

2. **API Endpoint**: `POST /api/distance/calculate`
   - Accept file content as text
   - Return total distance and pair-by-pair breakdown

3. **Algorithm Steps**:
   ```typescript
   // 1. Parse two columns from input text
   // 2. Sort both lists independently  
   // 3. Pair by position after sorting
   // 4. Calculate Manhattan distance: |a - b|
   // 5. Sum all distances for total
   ```

### Frontend Implementation Required
1. **File Upload Component**: Handle text file selection and upload
2. **Results Display Component**: Show total distance and pair breakdown
3. **Error Handling**: Graceful file validation and error states
4. **API Integration**: Connect to backend endpoint

## Workflow System Architecture

If using the systematic approach:

### MANDATORY Development Protocol
```bash
cr-check-state              # ALWAYS run before making changes
```

**Manual checks required:**
- [ ] Review `.enaiblelabs/memory/state/current-state.json`
- [ ] Check `.enaiblelabs/memory/decisions/entries.md`
- [ ] Look at `.enaiblelabs/memory/bugs/entries.md`

### Test-First Development (CRITICAL)
- Write tests BEFORE implementation code (NO EXCEPTIONS)
- Use templates from `.enaiblelabs/workflows/testing/test-templates.md`
- Test locations: `src/tests/{unit|functional|integration}/[feature-name]/`
- Achieve >90% coverage

### Persona-Driven Design
**Primary Persona**: SeniorChroniclerElf (100) - Not Tech Affin
- Must work without training
- Intuitive, non-technical interfaces required
- Empowering, not overwhelming experience

## Technical Stack

### Frontend
- **React 19** with TypeScript
- **shadcn/ui** component library (planned)
- **TailwindCSS** for styling (planned)
- **Zustand** for state management (planned)
- Currently: Basic Create React App setup

### Backend  
- **Node.js** with TypeScript
- **Express** framework (to be added)
- **Prisma** ORM (planned)
- Currently: Minimal skeleton with single console.log

### Testing Framework
- **Jest** + **React Testing Library** (available)
- **Playwright** for E2E (planned)
- **Storybook** for components (planned)
- **@axe-core/react** for accessibility (planned)

## npm Workspace Commands

### Development
```bash
npm install                 # Install all dependencies
npm run frontend:start      # Start React dev server (port 3000)  
npm run backend:dev         # Start backend with ts-node
```

### Building and Testing
```bash
npm run frontend:build      # Build production bundle
npm run frontend:test       # Run frontend tests
npm run backend:test        # Run backend tests (placeholder)
npm run backend:start       # Start production server
```

## Quality Requirements (If Using Workflow System)

### Non-negotiable Standards
- **WCAG AA** compliance required
- **<2s mobile load** time requirement
- **>90% test coverage** minimum
- **>4.5/5 persona satisfaction** target

### Core Values
1. **Scholarly Excellence** - Precision and accuracy
2. **Elegant Transparency** - Clear methodology
3. **Professional Autonomy** - User control
4. **Refined Functionality** - Sophisticated results
5. **Cross-cultural Respect** - Honor traditions
6. **Trustworthy by Default** - Ethical standards

## File Organization

### Workflow System (`.enaiblelabs/`)
```
.enaiblelabs/
├── guidelines/         # Brand guide, architecture, UX principles
├── memory/            # AI collaboration (audit, bugs, decisions, state)
├── workflows/         # Process documentation (13 subdirectories)
├── technical/         # Error handling, gotchas
├── initial/           # Project requirements, setup documents
└── PRPs/features/     # Feature specifications (empty - needs cr-init)
```

### Commands (`.claude/`)
```
.claude/
├── commands/          # 27 cr-* workflow commands
├── settings.json      # Basic Claude configuration
└── settings.local.json # Extended permissions
```

## Implementation Steps (<1 hour)

### Step-by-Step Workflow
1. **Initialize**: `cr-init 5` to create distance calculation PRPs
2. **Check State**: `cr-check-state` to verify setup
3. **Build Backend**: `cr-build-feature 01` (distance calculation service)
4. **Build Frontend**: `cr-build-feature 02` (file upload + results display)
5. **Validate**: `cr-validate-implementation` to ensure quality
6. **Test**: Run complete solution with sample data

### What the Workflow System Provides
- **Automated scaffolding**: Creates proper project structure
- **Test-first development**: Generates tests before implementation
- **Quality validation**: Ensures WCAG AA compliance and performance
- **Documentation**: Auto-generates implementation docs
- **Error handling**: Built-in validation and edge case coverage

## Critical Notes

- **Efficient Implementation**: Workflow system designed for rapid, quality development
- **Complete Solution**: Handles both coding challenge and production-quality requirements
- **Systematic Quality**: Built-in testing, accessibility, and performance validation
- **Expected Timeline**: <1 hour for complete implementation
- **Focus**: Quality and maintainability without sacrificing speed

## Next Steps

Use the Chronicler workflow system for the most efficient, highest-quality implementation of the distance calculation challenge.