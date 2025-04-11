---
description: Guidelines for implementing task management operations
alwaysApply: false
---

# Task Management Guidelines

## Task Structure Standards

- **Core Task Properties**:
  - ✅ DO: Include all required properties in each task object
  - ✅ DO: Provide default values for optional properties
  - ❌ DON'T: Add extra properties that aren't in the standard schema

 
  // ✅ DO: Follow this structure for task objects

    id: nextId,
    title: "Task title",
    description: "Brief task description",
    status: "pending", // "pending", "in-progress", "done", etc.
    dependencies: [], // Array of task IDs
    priority: "medium", // "high", "medium", "low"
    details: "Detailed implementation instructions",
    testStrategy: "Verification approach",
    subtasks: [] // Array of subtask objects



- **Subtask Structure**:
  - ✅ DO: Use consistent properties across subtasks
  - ✅ DO: Maintain simple numeric IDs within parent tasks
  - ❌ DON'T: Duplicate parent task properties in subtasks


## Task Creation and Parsing

- **ID Management**:
  - ✅ DO: Assign unique sequential IDs to tasks
  - ✅ DO: Calculate the next ID based on existing tasks
  - ❌ DON'T: Hardcode or reuse IDs


- **PRD Parsing**:
  - ✅ DO: Extract tasks from PRD documents using AI
  - ✅ DO: Provide clear prompts to guide AI task generation
  - ✅ DO: Validate and clean up AI-generated tasks


## Task Updates and Modifications

- **Status Management**:
  - ✅ DO: Provide functions for updating task status
  - ✅ DO: Handle both individual tasks and subtasks
  - ✅ DO: Consider subtask status when updating parent tasks


- **Task Expansion**:
  - ✅ DO: Use AI to generate detailed subtasks
  - ✅ DO: Consider complexity analysis for subtask counts
  - ✅ DO: Ensure proper IDs for newly created subtasks


## Task File Generation

- **File Formatting**:
  - ✅ DO: Use consistent formatting for task files
  - ✅ DO: Include all task properties in text files
  - ✅ DO: Format dependencies with status indicators


- **Subtask Inclusion**:
  - ✅ DO: Include subtasks in parent task files
  - ✅ DO: Use consistent indentation for subtask sections
  - ✅ DO: Display subtask dependencies with proper formatting


## Task Listing and Display

- **Filtering and Organization**:
  - ✅ DO: Allow filtering tasks by status
  - ✅ DO: Handle subtask display in lists
  - ✅ DO: Use consistent table formats


- **Progress Tracking**:
  - ✅ DO: Calculate and display completion statistics
  - ✅ DO: Track both task and subtask completion
  - ✅ DO: Use visual progress indicators


## Complexity Analysis

- **Scoring System**:
  - ✅ DO: Use AI to analyze task complexity
  - ✅ DO: Include complexity scores (1-10)
  - ✅ DO: Generate specific expansion recommendations


- **Analysis-Based Workflow**:
  - ✅ DO: Use complexity reports to guide task expansion
  - ✅ DO: Prioritize complex tasks for more detailed breakdown
  - ✅ DO: Use expansion prompts from complexity analysis


## Next Task Selection

- **Eligibility Criteria**:
  - ✅ DO: Consider dependencies when finding next tasks
  - ✅ DO: Prioritize by task priority and dependency count
  - ✅ DO: Skip completed tasks
