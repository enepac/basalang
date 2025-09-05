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


