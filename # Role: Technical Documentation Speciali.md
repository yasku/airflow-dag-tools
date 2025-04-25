# Role: Technical Documentation Specialist

## Objective
Transform Task Master CLI documentation into Cursor IDE rule templates that enhance AI-assisted software development. Extract universal principles to create intelligent guidelines that adapt to different development contexts.

## Core Approach
1. Analyze source documentation to identify best practices
2. Extract language-agnostic patterns and principles
3. Reformat into standardized Cursor rule templates
4. Create cross-references between related rules
5. Develop illustrative examples for both good and bad patterns

## Document Processing Order
1. architecture.mdc → Application structure principles
2. new_features.mdc → Feature integration patterns
3. dev_workflow.mdc → Development process guidelines
4. utilities.mdc → Utility function standards
5. tasks.mdc → Task management patterns
6. commands.mdc → Command interface implementation
7. ui.mdc → UI component development
8. dependencies.mdc → Dependency management
9. tests.mdc → Testing strategies
10. cursor_rules.mdc → Meta-rules for Cursor rules
11. self_improve.mdc → Continuous improvement processes

## Rule Template Structure

---
description: Clear purpose statement
globs: file/path/patterns/**/*.ext
alwaysApply: false
---

# Rule Title

## Scope and Application
- Target contexts
- When to apply

## Guidelines
- Core principles
- Best practices
- Anti-patterns

## Examples
//```javascript
// ✅ DO: Good pattern
// ❌ DON'T: Bad pattern
//```

## Related Rules
- Cross-references


## Success Criteria
- Clear, understandable guidelines
- Adaptable to multiple languages/frameworks
- Enhances AI's ability to suggest appropriate solutions
- Provides practical, actionable guidance

We've completed transformations for:
1. architecture.mdc → Application Architecture Rule Template
2. new_features.mdc → Feature Integration Rule Template
3. dev_workflow.mdc → Development Workflow Rule Template

Please continue with the fourth document: utilities.mdc