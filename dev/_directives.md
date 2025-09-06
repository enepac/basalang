# 📘 Basalang Dev Directives

This file indexes all decision-making rules and foolproof execution protocols.

## Core References
- [System_Directives.pdf](../docs/System_Directives.pdf)
- [Directives - Autologging Scribe](../docs/Directives_-_Autologging_Scribe.pdf)
- [Directives - Roles, Protocol, and Foolproof Execution](../docs/Directives_-_Roles_Protocol_and_Foolproof_Execution.pdf)

## Active Rules
- All changes must be tracked in /dev
- Journaling is required per session (`dev/journal/YYYY-MM-DD.md`)
- `_reflection.md` must summarize AI-human context sync after every feature phase

---

## 🧭 Terminal Instruction Template (with Absolute Path)

**Purpose:**  
All shell commands issued during Basalang development must be **atomic**, **precise**, and **reproducible**. This template ensures every terminal instruction:

- Specifies the exact working directory
- Uses absolute paths only
- Issues only one command per step
- Conforms to Remote-SSH + Devcontainer constraints
- Respects the Roles & Foolproof Execution directive

Use this template when documenting or issuing **any build, install, file creation, or execution step**.

---

### 🧱 Step: <WBS_ID> — <Concise Title>

#### 📂 Directory to Run In:
```bash
/<absolute/path/to/target>

Always specify the full absolute path. Never assume the working directory.

Always follow through with: Commit → Tag → Push → Journal → Reflect


Here is the full directive you just logged, rendered in Markdown:

---

## ✅ Basalang Directive: Phase-Based Git Branch Isolation

**Title:** *Phase Isolation via Feature Branching*

**Purpose:**
To enforce total **codebase stability**, **context clarity**, and **rollback safety**, each engineering phase of the Basalang project must begin on a **dedicated Git feature branch** named after the phase (e.g., `phase/2`, `phase/3`, etc.).

---

### 📐 Rules of Execution

1. **Before starting any phase**, a new branch must be created:

   ```bash
   git checkout -b phase/<n>
   ```

2. All commits, tags, and logs for that phase occur **only within that branch**.

3. No code from the current phase should touch prior branches (e.g., no new commits on `phase/1` once `phase/2` begins).

4. Branch names must follow this pattern:

   ```
   phase/<number>
   ```

5. Merge into main or other branches is **strictly disallowed** until the phase is complete, reviewed, and snapshotted.

---

### ✅ Benefits

* 🔒 **Total phase isolation** — no cross-phase contamination
* 🧯 **Rollback safety** — revert the entire phase by switching branches
* 🧠 **Context clarity** — logs, commits, and journal entries stay scoped
* 📜 **Audit trail ready** — each branch is a changelog

---

### 🧱 Protocol Enforcement Checklist (at phase start)

| Task                            | Command                     |
| ------------------------------- | --------------------------- |
| Create new branch               | `git checkout -b phase/<n>` |
| Confirm current branch          | `git branch`                |
| Snapshot environment            | `bash dev/snapshot.sh`      |
| Log snapshot in journal         | `journal_YYYY-MM-DD.md`     |
| Begin first subtask (e.g. T01A) | ✔️                          |

---


