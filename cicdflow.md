# APIM OpenAPI CI/CD Architecture & Workflow

## Overview
This document outlines the recommended GitOps strategy for managing Open API (Swagger) specifications and deploying them to APIM across three environments: **Dev**, **Staging**, and **Prod**.

---

## Key Principles & Best Practices

1. **Centralized Governance with Project-Level Ownership**:
   - Single Git repository managed by the APIM Team.
   - Granular permissions enforced via `CODEOWNERS` so project teams manage their own API specs and environment configurations.

2. **Single Source of Truth (No Spec Duplication)**:
   - Instead of copying OpenAPI spec files into `Dev`, `Staging`, and `Prod` folders, each API maintains **one canonical OpenAPI file** (`openapi.yaml`).
   - Environment differences (backend target URLs, rate limits, APIM policy overrides) are defined in separate environment configuration overlay files (`config/dev.json`, `config/staging.json`, `config/prod.json`).

3. **Automated CI Validation**:
   - Every Pull Request (PR) triggers automated linting, schema validation, and breaking change detection before code can be merged to `main`.

4. **Tag & Environment-Based CD Promotion**:
   - Deployments are triggered via automated CI/CD pipelines (e.g., GitHub Actions), promoting the validated commit SHA or Release Tag across environments.
   - **Dev**: Deployed automatically upon merge to `main`.
   - **Staging**: Deployed automatically after Dev deployment succeeds (or via workflow trigger).
   - **Prod**: Requires explicit human approval via GitHub Environment Protection Rules before deployment.

---

## Recommended Directory Structure

```text
.
├── .github/
│   ├── CODEOWNERS                      # Restricts approvals per project/API folder
│   └── workflows/
│       ├── api-ci.yml                  # PR validation (linting & breaking change check)
│       └── api-cd.yml                  # Deployment pipeline (Dev -> Staging -> Prod)
└── apis/
    ├── order-service/                  # Example Project / API
    │   ├── openapi.yaml                # Single Source of Truth OpenAPI spec
    │   └── config/
    │       ├── dev.json                # Dev backend target URL & settings
    │       ├── staging.json            # Staging backend target URL & settings
    │       └── prod.json               # Prod backend target URL & settings
    └── user-service/
        ├── openapi.yaml
        └── config/
            ├── dev.json
            ├── staging.json
            └── prod.json
```

---

## Step-by-Step CI/CD Process

### 1. Developer Authoring & PR (CI)
* Developer adds or updates `apis/<project-name>/openapi.yaml` or environment configuration files in a feature branch.
* Opens a Pull Request targeting `main`.
* **Automated CI Checks**:
  * **OpenAPI Linting**: Validates syntax and style rules using Spectral (`.spectral.yaml`).
  * **Schema Verification**: Ensures valid OpenAPI 3.0 / Swagger schema.
  * **Breaking Change Detection**: Uses `oasdiff` to compare the PR spec against the active Production baseline tag (`env/prod/<service>`). If any `ERR`-level breaking change is detected (e.g. deleted required fields, type changes, removed endpoints), CI fails automatically.

### 2. Merge & Dev Deployment (CD)
* Once PR is approved by `CODEOWNERS` and CI passes, it is merged into `main`.
* The CD pipeline automatically triggers for the **Dev** environment:
  1. Combines `openapi.yaml` + `config/dev.json`.
  2. Publishes/deploys the API to the **Dev APIM** instance.
  3. Runs automated API integration tests against Dev.

### 3. Promotion to Staging
* Following successful Dev testing, the pipeline deploys to **Staging**:
  1. Combines `openapi.yaml` + `config/staging.json`.
  2. Publishes/deploys the API to the **Staging APIM** instance.
  3. Runs end-to-end integration and security tests.

### 4. Promotion to Production (Gated Approval)
* Deployment to **Prod** is guarded by GitHub Environment Approvals:
  1. Pipeline pauses at the `production` environment step.
  2. Designated approvers (APIM Team / Tech Lead) receive a notification to review the deployment.
  3. Upon manual approval, the pipeline combines `openapi.yaml` + `config/prod.json` and deploys to **Prod APIM**.

---

## Comparison: Previous Approach vs. Refined Strategy

| Aspect | Previous Folder-Copy Proposal | Refined GitOps Strategy |
| :--- | :--- | :--- |
| **Spec File Location** | Duplicated across `Base`, `Dev`, `Staging`, `Prod` | Single `openapi.yaml` per API |
| **Environment Settings** | Embedded in duplicated spec files | Separate `config/<env>.json` files |
| **Promotion Action** | Running scripts to copy files between folders | Automated GitHub Actions promotion |
| **Production Gate** | Manual copy script + approval | GitHub Environment Approval gate |
| **Validation** | Basic verification | Spectral linting + Breaking change checks |
