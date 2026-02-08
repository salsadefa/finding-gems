---
description: Rules and guidelines that ALL agents must follow when working on this project
---

# 🚨 CRITICAL RULES FOR ALL AGENTS

## Rule #0: KNOW YOUR ROLE

There are **3 distinct agent roles** in this project:

| Role | Scope | Responsibilities |
|------|-------|------------------|
| **Backend (BE)** | `/backend/*` | API development, database, controllers, services, migrations |
| **Frontend (FE)** | `/app/*`, `/components/*` | UI/UX, React components, API integration, styling |
| **QA Testing** | `/tests/*`, test reports | Unit tests, integration tests, E2E tests, test reports |

### ⛔ DO NOT cross scope boundaries:
- BE agent: Do NOT fix frontend code or write/run tests
- FE agent: Do NOT modify backend code or write tests
- QA agent: Do NOT write feature code, only tests

---

## Rule #1: NEVER PUSH UNTIL QA APPROVES

**Before any `git push`, the following MUST happen:**

1. **BE/FE agent completes their code changes**
2. **Delegate to QA agent** to run all tests
3. **QA agent runs and reports:**
   - Unit tests: `npm test`
   - Integration tests (if applicable)
   - Build verification: `npm run build`
4. **Only push when QA reports ALL PASS**

### Delegation Format:
```
## 📋 QA Test Request

**Changes Made:**
- [list of changes]

**Files Modified:**
- [list of files]

**Testing Required:**
- [ ] Unit tests pass
- [ ] Build passes
- [ ] Integration tests pass (if applicable)
- [ ] No TypeScript errors

**Notes:**
[any special testing instructions]
```

---

## Rule #2: Handoff Documentation

When completing a task, create handoff documentation:

### BE → FE Handoff (API changes):
- Document new/changed endpoints
- Include request/response examples
- Update API documentation

### BE/FE → QA Handoff (for testing):
- List all changes made
- Specify which tests need to run
- Provide test data if needed

---

## Rule #3: Stay In Your Lane

Before making any change, ask:
1. Is this in my scope (BE/FE/QA)?
2. If not, who should handle this?
3. Create handoff brief for the appropriate agent

---

## Current Agent Identification

When starting a session, agents should identify themselves:

```
## Agent Identity
- **Role:** [Backend/Frontend/QA]
- **Scope:** [relevant directories]
- **Current Task:** [task description]
```

---

## Rule #4: Research Before Fix

**WAJIB: Sebelum fix problem apapun, riset best practices dulu!**

### Process:
1. **Identify the problem** (dari error logs, test results, dll)
2. **Research best practices** menggunakan MCP tools
3. **Implement solution** berdasarkan best practices
4. **Test & verify** solusi bekerja

---

## Rule #5: NO BRIEF DOC SPAM

**JANGAN buat dokumen brief baru!** Sampaikan brief langsung via prompt.

### ❌ DON'T:
- Buat file `FE-FIX-BRIEF.md`, `QA-TEST-BRIEF.md`, dll
- Spam dokumen untuk setiap task kecil

### ✅ DO:
- Sampaikan brief langsung di prompt/chat
- Buat dokumen HANYA jika task besar dan kompleks yang perlu referensi ulang

---

## Rule #6: UPDATE PROGRESS SETELAH TASK COMPLETE

**Setiap task yang GENUINE COMPLETE, langsung:**

1. **Update status** di progress tracking
2. **Kasih next to-do** berdasarkan:
   - Best practices
   - Backlog yang belum selesai
   - Dependencies yang perlu di-unblock

### Progress Format:
```
## ✅ COMPLETED
- [Task ID]: [Brief description] - DONE by [Role]

## 🔄 IN PROGRESS  
- [Task ID]: [Status] - [Blocker if any]

## ⏳ BACKLOG
- [Task ID]: [Description] - Waiting for [dependency]
```

---

## 📋 Role-Specific Guidelines

### 🔧 Backend/DevOps Role

**Scope:** `/backend/*` - API, controllers, services, migrations, DevOps

**WAJIB gunakan MCP tools:**

| MCP Tool | Purpose | Example |
|----------|---------|---------|
| **Context7** | External docs & best practices | `mcp_context7_query-docs({ libraryId: "/goldbergyoni/nodebestpractices", query: "..." })` |
| **Supabase** | Check DB schema, RLS, indexes | `mcp_supabase-mcp-server_get_advisors({ project_id: "...", type: "performance" })` |

**Workflow:**
```
1. Research: mcp_context7_resolve-library-id → mcp_context7_query-docs
2. Check DB: mcp_supabase-mcp-server_list_tables
3. Check RLS: mcp_supabase-mcp-server_get_advisors (type: "security")
4. Check Indexes: mcp_supabase-mcp-server_get_advisors (type: "performance")
5. Apply migration: mcp_supabase-mcp-server_apply_migration
```

**Jika MCP tidak bisa diakses:** STOP dan bilang "MCP [nama] tidak bisa diakses"

---

### 🎨 Frontend Role

**Scope:** `/app/*`, `/components/*` - UI/UX, React components

**WAJIB gunakan MCP tools:**

| MCP Tool | Purpose | Example |
|----------|---------|---------|
| **Context7** | External docs & best practices | `mcp_context7_query-docs({ libraryId: "/vercel/next.js", query: "..." })` |
| **Next.js DevTools** | Runtime diagnostics | `mcp_next-devtools_nextjs_index()` |

**Workflow:**
```
1. Research: mcp_context7_resolve-library-id → mcp_context7_query-docs
2. Check errors: mcp_next-devtools_nextjs_index → mcp_next-devtools_nextjs_call
3. Test UI: mcp_next-devtools_browser_eval (headless)
```

**Jika MCP tidak bisa diakses:** STOP dan bilang "MCP [nama] tidak bisa diakses"

---

### 🧪 QA/Testing Role

**Scope:** `/tests/*` - Unit tests, E2E tests, test reports

**WAJIB gunakan MCP tools:**

| MCP Tool | Purpose | Example |
|----------|---------|---------|
| **Context7** | Best practices untuk testing | `mcp_context7_query-docs({ libraryId: "...", query: "testing best practices" })` |
| **Playwright MCP** | E2E UI testing (**WAJIB HEADLESS**) | `mcp_next-devtools_browser_eval({ action: "start", headless: true })` |
| **Supabase** | Check data integrity, RLS | `mcp_supabase-mcp-server_execute_sql({ project_id: "...", query: "SELECT..." })` |

**⚠️ PENTING:** 
- **Playwright WAJIB headless** (no browser window): `headless: true`
- Gunakan `mcp_supabase-mcp-server_get_advisors` untuk security checks
- Gunakan `mcp_context7_query-docs` untuk best practices

**Workflow:**
```
1. Setup: mcp_next-devtools_browser_eval({ action: "start", headless: true })
2. Navigate: mcp_next-devtools_browser_eval({ action: "navigate", url: "..." })
3. Test: Run test cases dengan actions (click, type, fill_form)
4. Screenshot: mcp_next-devtools_browser_eval({ action: "screenshot" })
5. Close: mcp_next-devtools_browser_eval({ action: "close" })
```

**Jika MCP tidak bisa diakses:** STOP dan bilang "MCP [nama] tidak bisa diakses"

---

## Summary

**The mantra: Complete your work → Hand off to QA → Wait for approval → Then push**
