# Delta for Persistence

## ADDED Requirements

### Requirement: Storage Entity Schema Definition

The system MUST define a persistent data schema extending `JobAnalysisResult`.
The schema MUST be strictly validated using Zod.

#### Scenario: Extending the Base Analysis
- GIVEN a completed `JobAnalysisResult` and its original `jobDescription`
- WHEN saving the analysis to the history
- THEN the system MUST append a unique identifier (`id`)
- AND the system MUST append a creation timestamp (`createdAt`)
- AND the system MUST store the original `jobDescription` used for the analysis.

### Requirement: Repository Interface Contract

The system MUST define an abstract `AnalysisRepository` interface to decouple the UI from the storage mechanism.

#### Scenario: Local-First Implementation
- GIVEN the `AnalysisRepository` interface
- WHEN the application interacts with historical data
- THEN it MUST use `save`, `getAll`, `getById`, and `delete` methods.
- AND the concrete implementation `LocalAnalysisRepository` MUST use browser `localStorage` to satisfy these methods.

### Requirement: Save Analysis

The system MUST allow users to save a job analysis result to the repository.

#### Scenario: Successful Save
- GIVEN a valid analysis result and input description
- WHEN the `save` method is invoked
- THEN the repository MUST generate a unique ID
- AND save the record to `localStorage`
- AND return the newly created storage entity.

### Requirement: Retrieve All Analyses

The system MUST allow users to list all previously saved analyses.

#### Scenario: Fetching History
- GIVEN multiple saved analyses in `localStorage`
- WHEN the `getAll` method is invoked
- THEN the repository MUST return an array of all storage entities, preferably sorted by `createdAt` descending.

### Requirement: Retrieve Analysis by ID

The system MUST allow retrieving a specific analysis by its unique identifier.

#### Scenario: Fetching a Specific Record
- GIVEN an existing ID
- WHEN the `getById` method is invoked
- THEN the repository MUST return the matching storage entity
- AND return `null` if the ID is not found.

### Requirement: Delete Analysis

The system MUST allow users to delete a saved analysis from history.

#### Scenario: Deleting a Record
- GIVEN an existing ID
- WHEN the `delete` method is invoked
- THEN the repository MUST remove the matching record from `localStorage`.

## Zod Schemas & Interfaces

```typescript
import { z } from "zod";
import { JOB_ANALYSIS_RESULT_SCHEMA, JobAnalysisResult } from "@/schemas/job-analysis";

// Storage Entity Schema
export const SAVED_JOB_ANALYSIS_SCHEMA = JOB_ANALYSIS_RESULT_SCHEMA.extend({
  id: z.string().uuid({ error: "ID must be a valid UUID." }),
  createdAt: z.string().datetime({ error: "createdAt must be a valid ISO datetime." }),
  jobDescription: z.string().min(1, { error: "Job description is required." }),
}).strict();

export type SavedJobAnalysis = z.infer<typeof SAVED_JOB_ANALYSIS_SCHEMA>;

// Repository Interface
export interface AnalysisRepository {
  save(jobDescription: string, result: JobAnalysisResult): Promise<SavedJobAnalysis>;
  getAll(): Promise<SavedJobAnalysis[]>;
  getById(id: string): Promise<SavedJobAnalysis | null>;
  delete(id: string): Promise<void>;
}
```