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

The system MUST define an abstract `AnalysisRepository` interface to decouple the UI from the storage mechanism. The interface MUST include an `update` method for partial field mutation.

#### Scenario: Local-First Implementation
- GIVEN the `AnalysisRepository` interface
- WHEN the application interacts with historical data
- THEN it MUST use `save`, `getAll`, `getById`, `delete`, and `update` methods.
- AND concrete implementations MUST satisfy all methods.

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

### Requirement: HttpAnalysisRepository (REQ-HIST-006)

`HttpAnalysisRepository` MUST implement `AnalysisRepository` by calling `/api/analyses` endpoints with credentials. All methods MUST handle HTTP errors and return domain types matching the interface contract.

#### Scenario: getAll fetches all analyses
- GIVEN an authenticated user
- WHEN `getAll()` is called
- THEN it MUST GET `/api/analyses` with credentials and return `SavedJobAnalysis[]`

#### Scenario: update sends PATCH
- GIVEN an authenticated user and an analysis ID
- WHEN `update(id, { displayName, notes })` is called
- THEN it MUST PATCH `/api/analyses/:id` and return updated `SavedJobAnalysis`

#### Scenario: HTTP error propagation
- GIVEN an HTTP call returns 401, 404, or 5xx
- WHEN the repository method receives the error
- THEN it MUST throw a typed error the UI can surface

### Requirement: Repository injection by auth status (REQ-HIST-007)

`useAnalysisRepository` MUST select `HttpAnalysisRepository` when authenticated and `LocalAnalysisRepository` when anonymous.

#### Scenario: Authenticated user
- GIVEN auth state is "authenticated"
- WHEN the hook resolves the repository
- THEN it MUST return `HttpAnalysisRepository`

#### Scenario: Anonymous user
- GIVEN auth state is "unauthenticated"
- WHEN the hook resolves the repository
- THEN it MUST return `LocalAnalysisRepository`

### Requirement: HTTP-backed mutations (REQ-HIST-008)

Frontend delete and update operations MUST use HTTP when the user is authenticated.

#### Scenario: Delete via HTTP
- GIVEN an authenticated user
- WHEN a delete action is triggered
- THEN the repository MUST call DELETE `/api/analyses/:id` (not localStorage)

#### Scenario: Update via HTTP
- GIVEN an authenticated user
- WHEN an update action is triggered
- THEN the repository MUST call PATCH `/api/analyses/:id` (not localStorage)

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
  update(id: string, patch: Partial<Pick<SavedJobAnalysis, 'displayName' | 'notes'>>): Promise<SavedJobAnalysis | null>;
  delete(id: string): Promise<void>;
}
```