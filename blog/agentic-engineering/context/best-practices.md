# Best Practices on Claude Code Adoption from Anthropic

**Presenter:** Andrew Wilson, Solution Architect on Anthropic's Applied AI team in London, working with enterprises like SAP on Claude Code adoption and best practices.

Anthropic built Claude Code, MCP, and the skills architecture this session covers, so this is a first-party walkthrough of how the pieces fit together.

## Q&A Highlights

### Skills and MCP Differentiation

**Q:** I would like to specifically understand skills and MCP differentiation. Can they be used together, when to use what?

**A:** MCP = capability (connect to external systems: Jira, GitHub, databases). Skills = procedural knowledge (how to do something: your deploy process, review checklist). They work together — a skill can tell Claude which MCP tools to call and in what order. Use MCP to reach outside Claude; use a skill to codify a repeatable workflow.

**Sources:** [code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills) | [code.claude.com/docs/en/mcp](https://code.claude.com/docs/en/mcp)

---

### CLAUDE.md Examples

**Q:** Can anyone recommend a repo which holds nice examples of CLAUDE.md files?

**A:** Run `/init` — Claude generates a tailored CLAUDE.md for your repo. For reference patterns see [anthropics/claude-code](https://github.com/anthropics/claude-code) and [anthropics/skills](https://github.com/anthropics/skills) on GitHub. Good CLAUDE.md files are project-specific by design, so a universal gallery is less useful than the `/init` bootstrap.

**Sources:** [code.claude.com/docs/en/memory](https://code.claude.com/docs/en/memory) | [github.com/anthropics/skills](https://github.com/anthropics/skills)

---

### Context Window Optimization

**Q:** If you point to the doc in CLAUDE.md, wouldn't the agent read the referenced file anyway? How can a simple reference help in this case for saving context window?

**A:** Depends on syntax. `@path/to/file` is loaded at launch — no savings. A prose mention ("see docs/architecture.md for details") is NOT loaded — Claude only reads it via the Read tool when the task actually needs it. Describe, don't import.

**Source:** [code.claude.com/docs/en/memory](https://code.claude.com/docs/en/memory)

---

### Ensuring CLAUDE.md Adherence

**Q:** If CLAUDE.md has words describing the rules, how do I make sure it does not go wrong?

**A:** CLAUDE.md is context, not enforcement. Improve adherence: be specific ("run npm test" not "test it"), stay under ~200 lines, remove conflicting rules. For hard enforcement use settings.json permissions or hooks — those are enforced by the client, not by Claude's judgment.

**Source:** [code.claude.com/docs/en/memory](https://code.claude.com/docs/en/memory)

---

### Proactive Memory Usage

**Q:** I'm experimenting with a Memory MCP (MuninnDB) as a long-term and cross-session memory. Despite instructions in CLAUDE.md to actively use this, I still find myself having to actively prompt Claude to store or recall something. Do you have suggestions / best practices for how to make Claude more proactively use this?

**A:** Make the MCP tool's own description very explicit about when to call it — Claude weighs tool descriptions heavily. Alternatively: wrap the recall step in a skill (skill descriptions are designed to trigger proactively), use a SessionStart hook to pre-fetch memory, or try Claude Code's native auto-memory which Claude maintains proactively by design.

**Sources:** [code.claude.com/docs/en/memory](https://code.claude.com/docs/en/memory) | [code.claude.com/docs/en/hooks](https://code.claude.com/docs/en/hooks)

---

### When to Write Skills

**Q:** Regarding skills, is there any advice on when/how to spend the time writing a skill? I struggle with balancing "work on tooling" and "work on features"

**A:** Eval first, don't build speculatively. Run Claude on real tasks; write a skill only where it repeatedly fails or needs the same correction. Rule of thumb: same correction three times = skill candidate. You can also ask Claude to write the SKILL.md for you after it does something well.

**Source:** [claude.com/blog/equipping-agents-for-the-r...](https://claude.com/blog/equipping-agents-for-the-r...)

---

### Skill Triggering

**Q:** If I didn't explicitly invoke a skill, how does Claude decide when to call one? Is it based on keyword matching?

**A:** Semantic match against the skill's description field, not keyword matching. Only the name + description are in context at startup; Claude picks the relevant one the same way it picks a tool. Write descriptions that say WHEN to use the skill, not just what it does.

**Source:** [code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills)

---

### AGENTS.md Support

**Q:** Can Claude also use AGENTS.md?

**A:** Not natively. Workaround: a minimal CLAUDE.md that just says `@AGENTS.md` (imports the file) or "read AGENTS.md for project conventions" (loads on demand).

**Source:** [code.claude.com/docs/en/memory](https://code.claude.com/docs/en/memory)

---

### Skill Loading Behavior

**Q:** How will Claude load skills? Will it load all files under the directory or start with SKILL.md and load the rest on demand?

**A:** Progressive disclosure, three levels: (1) name + description only at session start, (2) full SKILL.md when the skill is invoked, (3) supporting files (reference.md, scripts/, etc.) read on demand only if SKILL.md points to them and the task needs them.

**Source:** [code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills)

---

### Skill Flexibility

**Q:** Does Claude blindly follow the skills? Or can it even enhance them?

**A:** Not blindly — skills are prompts, not code. Claude adapts the playbook to your codebase and conversation. For strict enforcement use allowed-tools or hooks. And yes, Claude can improve skills: ask it to reflect on what went wrong and rewrite the SKILL.md.

**Source:** [code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills)

---

### Subagent Communication

**Q:** How do subagents communicate with each other? Is it via a file or do they need to read multiple output files that might blow up the token usage cost?

**A:** Subagents don't talk to each other — each runs in its own isolated context and returns a single result message to the main agent, which synthesizes. The isolation is the token saver: verbose exploration stays in the subagent's window. Only the returned summaries land in your main context, so instruct subagents to return concise results.

**Source:** [code.claude.com/docs/en/sub-agents](https://code.claude.com/docs/en/sub-agents)

---

### Security Management

**Q:** How are the security aspects being managed?

**A:** Layered permissions: read-only by default, writes scoped to the launch directory, per-tool allow/deny lists, trust prompts on new MCP servers, command-injection detection, optional /sandbox isolation, and enterprise managed-settings for org-wide policy. MCP servers are user-configured — you own the trust decision.

**Sources:** [code.claude.com/docs/en/security](https://code.claude.com/docs/en/security) | [code.claude.com/docs/en/permissions](https://code.claude.com/docs/en/permissions)

---

### Skill vs Command

**Q:** What is the difference between Skill and Command?

**A:** They've been merged — same system now. `.claude/commands/foo.md` and `.claude/skills/foo/SKILL.md` both create `/foo`. Skills are the recommended format: they add a directory for supporting files, frontmatter to control who can invoke them, and automatic triggering by Claude. Old command files still work.

**Source:** [code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills)

---

### Code Review Implementation

**Q:** What would be the best way to implement Code Review for local changes (Security, Performance)?

**A:** Start with the built-in `/review` skill. For a custom checklist, create a read-only subagent (tools: Read, Grep, Glob, Bash — no Edit) with your security/perf rules in the system prompt. The docs include a full code-reviewer subagent example. Use `!git diff` injection to feed the actual diff into the prompt.

**Source:** [code.claude.com/docs/en/sub-agents](https://code.claude.com/docs/en/sub-agents)

---

### Demo Resources

**Q:** Will you also demo a very simple example on all CLAUDE.md, MCP, skill and (sub-agent)?

**A:** Most of this was covered in the live demo — see the refactor workflow walkthrough (~16:33) and the Excalidraw repo demo (~20:38) in the recording. For self-paced, [code.claude.com/docs/en/quickstart](https://code.claude.com/docs/en/quickstart) gets you a minimal working setup of all four.

**Source:** [code.claude.com/docs/en/quickstart](https://code.claude.com/docs/en/quickstart)

---

### Hyperspace MCP Registry

**Q:** Is there already a timeline when the Hyperspace MCP registry is GA?

**A:** [SAP question] This is an SAP-internal question — Hyperspace is SAP's registry, not Anthropic's. Please check with the Hyperspace team.

**Source:** N/A — SAP internal

---

### OpenSpec Integration

**Q:** What about SDD tools like OpenSpec that create specs? How do they impact the understanding of the codebase? Is it worth asking Claude to load the specs into the context?

**A:** OpenSpec specs live in the repo as markdown files organized by capability — which is exactly the format Claude reads natively. Don't `@`-import the whole spec tree; instead point CLAUDE.md at the spec directory ("specs/ contains capability requirements — read the relevant spec before modifying a feature"). Claude will pull the right file on demand. High value, low cost.

**Sources:** [github.com/Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec) | [code.claude.com/docs/en/memory](https://code.claude.com/docs/en/memory)

---

### S/4 System Integration

**Q:** Can I connect Claude Code to a whole S/4 system and all of its ABAP?

**A:** [SAP question] Claude Code works with any filesystem-accessible code and any system reachable via MCP — but the S/4/ABAP integration path (MCP server, abapGit, etc.) is an SAP decision. Best to check with the Hyperspace/SAP tooling team on what's available internally.

**Source:** N/A — SAP-specific integration

---

### MCP vs CLI

**Q:** What's your take on MCP vs. CLI? A pattern that emerged for me is writing thin script layers as facades around CLI tools and using settings.json + markdown to define what an agent/skill is allowed to use.

**A:** Valid pattern. CLI wrappers are simpler — no server, version-controlled with the skill, Claude already knows Bash. MCP wins when you need structured schemas, OAuth, or the tool shared across many projects without filesystem access. For most project-local integrations, your script-facade approach is the right call.

**Sources:** [code.claude.com/docs/en/mcp](https://code.claude.com/docs/en/mcp) | [code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills)

---

### CLI vs VS Code Extension

**Q:** Why did you not use the VS Code Claude Code extension to start the dev server, but the CLI version of Claude Code?

**A:** Either works — same Claude Code under the hood. I chose the CLI because it's my preferred interface.

**Source:** [code.claude.com/docs/en/vs-code](https://code.claude.com/docs/en/vs-code)

---

### SAP Claude Marketplace

**Q:** Is it possible to have a SAP Claude marketplace to share plugins that SAP teams can create?

**A:** [SAP question] Technically yes — Claude Code's plugin system supports private marketplaces and enterprise managed-settings can deploy plugins org-wide. Standing up and governing the SAP marketplace itself is an SAP decision.

**Source:** [code.claude.com/docs/en/plugins](https://code.claude.com/docs/en/plugins)

---

### Context Window Optimization in Skills

**Q:** When Claude creates skills, does it implicitly try to optimize the context window usage or human readability is the highest priority?

**A:** Skills are markdown — human-readable by design. Context optimization comes from the structure, not the prose: keep SKILL.md short and push detail into supporting files that are only read on demand (progressive disclosure). The two goals aren't in tension — readable markdown + layered files gives you both.

**Source:** [code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills)

---

### SAP Help MCP Server

**Q:** Do we have already a help.sap.com MCP server?

**A:** [SAP question] SAP-internal question — please check the Hyperspace MCP registry or the relevant SAP team.

**Source:** N/A — SAP internal

---

### Writing Evals for Skills

**Q:** Can you share resources of how we can write evals for Claude Code skills?

**A:** Start simple: run the skill on 5–10 real tasks and grade manually before automating anything. For deeper guidance see Anthropic's engineering post on agent evals. The skill-creator skill also includes basic eval support.

**Source:** [anthropic.com/engineering/demystifying-eva...](https://anthropic.com/engineering/demystifying-eva...)

---

### Draw.io Diagram Creation

**Q:** If you were able to create draw.io diagrams well, especially using BTP Solution Diagram Library, feel free to share how you achieved this (skills, MCP, ...)

**A:** draw.io files are XML, so Claude can write them as text — a skill with example .drawio snippets and the shape library references should work well. Worth searching first for existing community draw.io skills before building one. For the BTP shape library specifically, you'd bundle those shape definitions as a reference file in the skill.

**Source:** [code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills)