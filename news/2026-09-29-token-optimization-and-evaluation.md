---
title: Token Optimization Is Not Prompt Shortening
description: Token optimization isn't about shorter prompts, it's about reducing unnecessary context while preserving quality. Learn practical patterns for optimizing LLM workflows, from retrieval strategies to workflow evaluation.
keywords: ["token optimization", "llm", "ai agents", "prompt engineering", "cost optimization", "context management", "evaluation", "workflow optimization", "ai coding", "rag", "retrieval"]
hide_table_of_contents: false
spotlight_image: img/2026-09-29/token-optimization-and-evaluation.png
authors: [vikas-thimmiaha]
date: 2026-09-29
---

Token optimization is often treated as a matter of shortening prompts or responses, but the larger challenge is deciding which context is actually worth sending to the model. This article looks at where tokens are consumed in agentic workflows, how context bloat and repeated tool use increase cost, and which practical strategies can make those workflows more efficient. It also shows why optimization cannot be judged by token savings alone, the final response and the workflow behind it both needs to be evaluated. The goal is not simply to use fewer tokens, but to reduce waste while preserving quality.

<!-- truncate -->
## Introduction

Token optimization sounds like a problem of reduction: shorter prompts, shorter answers, smaller
bills.

But reducing tokens is not the same as optimizing them. A short prompt can remove necessary context,
while a long prompt can bury the model in irrelevant information. The real challenge is deciding
which tokens are worth paying for.

Recent data shows this distinction matters. Large-scale engineering telemetry suggests that higher
AI-assisted throughput does not automatically translate into better software outcomes. One 2026
dataset covering thousands of developers reported higher throughput alongside a 242% increase in
incidents per PR and 54% increase in bugs per developer [[1]](#references). One team measuring
their AI coding tool found **45,000 tokens of context sent per query, but only 5,000 were actually
relevant** [[2]](#references). They paid for 40,000 wasted tokens every time.

The common instinct (write shorter prompts, demand briefer answers) misses the real problem. **For
context-heavy coding-agent workflows, input-side waste is often the largest optimization
opportunity.** One team found 40,000 of their 45,000 input tokens were irrelevant—a massive
inefficiency no amount of output compression could fix. But the ratio matters, which means thinking-heavy tasks
can flip to output-dominated costs, and since output tokens cost 3-10x more than input, output
optimization can be highly effective when output volumes are significant.

**The real insight: optimize the entire agent workflow rather than optimizing prompt length in
isolation.** This creates a two-part challenge: **reduce the context that does not contribute to the
task, and verify that removing it has not damaged the result.** Token efficiency without quality
measurement is just cheaper execution, real optimization requires both.

So the central question is: **How can LLM systems reduce unnecessary token usage while preserving
response quality?**

## Where Tokens Actually Go

Every LLM interaction has two parts, **input tokens** (what you send) and **output tokens** (what
the model generates). But the input is far more than just your question.

Input includes:

- Your prompt
- System instructions
- Files from your codebase
- Retrieved context and search results
- Previous conversation history
- Tool outputs, logs, and diffs
- Memory and observations

In one measured AI coding workflow, roughly **90% of the tokens processed were input tokens, 10%
output** [[2]](#references). When you ask "fix the login bug," you type 10 words, but the tool
sends 45,000 tokens of context which contains entire files, dependency trees, previous
conversations, search results.

This is why output optimization barely helps, even though output tokens cost significantly more. For
Anthropic's Sonnet 4.6, output tokens are approximately **5x more expensive** than input tokens
(€0.00223 per 1,000 input tokens vs €0.01087 per 1,000 output tokens). But the volume difference
overwhelms the price difference.

Consider a typical coding session with Claude Code (Sonnet 4.5):

- 35,000 input tokens
- 12,000 cache creation input tokens
- 180,000 cache read input tokens
- 3,500 output tokens

At Anthropic's standard rates (approximately €2.75 per million input tokens, €0.28 per million cache
read tokens, €13.75 per million output tokens):

- Input tokens: ~€0.10
- Cache creation: ~€0.03
- Cache read: ~€0.05
- Output tokens: ~€0.05

**Total: ~€0.23**, with input and cache creation representing 57% of the cost despite output tokens
being 5x more expensive per token. You're sending roughly 65x more input tokens than output tokens
(when counting cache reads at their effective cost).

**The ratio shifts based on task type.** When you ask "What is this project about?" the agent reads
many files but outputs one page, skewing heavily toward input. When you ask it to implement a
complex feature, the model may spend 80+ seconds thinking (generating invisible reasoning tokens at
output rates), which can shift the cost balance toward output. The mix depends on whether the task
is exploration-heavy (reading code) or reasoning-heavy (designing solutions).

If 40,000 of your 45,000 input tokens are irrelevant to the question, optimizing output alone is
insufficient. The real cost is the oversized context sent before generation even begins.

In the measured case above [[2]](#references), the team tried three fixes. Shorter prompts
didn't work (context was already sent). Model settings didn't work (those affect output, not input).
Output compression worked but only saved ~8% overall. **Cutting input by 94% saved 61%** because
input dominated the volume in their workflow.

## The Context Bloat Problem

Adding context feels safe. More information should help the model give better answers, right? But
even if the model ignores irrelevant context, you still pay for every token sent.

Context bloat shows up in predictable patterns:

**Whole files sent unnecessarily.** A coding agent receives an entire 500-line file when only one
10-line function is relevant to the query.

**Irrelevant retrieved chunks.** Semantic search returns 20 code snippets when only 3 actually
relate to the bug being debugged.

**Repeated instructions.** System prompts and rules get resent with every message in a conversation,
even though they haven't changed.

**Huge logs and diffs.** A PR review agent processes a 50,000-line diff when the actual question is
about a 5-line change in one file.

**Old conversation history.** Previous messages from 30 turns ago remain in context even though the
current task is completely unrelated.

**Duplicated tool outputs.** The same API response or test result appears multiple times across the
conversation.

The pattern is consistent: information gets added "because it might be useful," not because it was
chosen as useful. One team measured their typical query at 83,000 tokens baseline by sending whole
files every time. After implementing targeted retrieval, they dropped to 4,900 tokens while still
retrieving the correct code 90% of the time [[2]](#references). That's a **94% reduction** with
minimal quality loss.

Token optimization begins when you stop treating the context window like storage and start treating
it like a budget.

## Agents Make This Worse

An ordinary LLM interaction has a simple shape: you ask a question, the model generates an answer,
and the exchange ends. One request, one response.

Agents work differently. An agent is a loop: observe the current state, decide what to do next, take
an action, read the result, and repeat until the task is complete. This loop is what makes agents
powerful because they can search codebases, inspect files, call APIs, run tests, update plans, and
recover from mistakes without human intervention.

But the loop also multiplies token costs. Each iteration carries forward the original goal, previous
reasoning, tool outputs, memory, and new observations. Even when each step seems reasonable, the
cumulative context grows quickly.

**Tool results are especially dangerous.** A grep output, stack trace, API response, git diff, or
test log might be essential for one step. However, if it flows unfiltered into the next iteration,
it becomes dead weight. The agent keeps paying to reread information that no longer matters.

Consider a simplified agent loop to illustrate how context can accumulate:

- **Step 1:** Search repository for "authentication error" (sends 5K tokens of context, receives 2K
  tokens of search results showing 8 files)
- **Step 2:** Read `auth.py` file (sends 5K + 2K search results + 500 tokens of new reasoning = 7.5K
  tokens, receives 3K tokens of file content)
- **Step 3:** Run existing tests (sends 7.5K + 3K file contents + 400 tokens = 10.9K tokens,
  receives 1K tokens of test output)
- **Step 4:** Inspect error logs (sends 10.9K + 1K test output + 300 tokens = 12.2K tokens, receives
  4K tokens of logs)
- **Step 5:** Make a fix and create diff (sends 12.2K + 4K logs + 2K reasoning = 18.2K tokens)

By step 5, the agent is carrying search results from step 1 that have nothing to do with creating
the fix. The repository search results, the full file content, the test output, and the error logs
all accumulate. The context window becomes a landfill of stale observations.

Meta's 60.2 trillion tokens in one month wasn't from 60 trillion thoughtful questions. It was from
loops that never stopped accumulating context [[1]](#references). Memory systems help by
letting agents recall decisions without re-deriving them, but poorly designed memory just adds
another source of bloat: every step now includes goal + history + memory + tool results + new
observations.

The stopping problem makes this worse. An agent doesn't know when it has enough information, so it
keeps searching, keeps reading, keeps adding context until it hits a token limit or runs out of
budget.

This is why token optimization in agents isn't just about shorter prompts. It's about **loop
control**: deciding what should be remembered, what should be summarized, what should be dropped,
and when to stop.

If context bloat is the problem, then token optimization begins with controlling what enters the
loop.

## Token Optimization Patterns

Once token waste is understood as a context problem, the solution becomes clearer: don't send
everything by default. Token optimization is not one technique. It's a set of habits for deciding
what deserves to enter the context window.

### Retrieve Before You Include

Instead of sending whole files or entire histories, search for the parts most likely to help. One
team built a hybrid search layer combining semantic search (for meaning) and keyword search (for
exact names), scoring results by relevance [[2]](#references). Functions were compressed to
signatures and descriptions; full implementations only loaded when call-graph tracking showed they
were connected. This dropped context from 83,000 tokens per query to 4,900 tokens with a 94%
reduction while still retrieving correct code 90% of the time. The relevance formula was simple: 50%
semantic similarity, 30% keyword match, 20% code recency. Computation took 0.4ms with no extra model
calls. Their conclusion: "simple formula beats the complex model most of the time."

For coding agents like Claude Code, this means sharing only relevant files and sections. Navigate to
the specific service directory (e.g., `cd services/payment-service`) before starting the agent, and
use deny rules in `.claude/settings.json` to exclude unneeded folders like `node_modules`, `dist`,
and `logs`. Starting from the most specific working directory relevant to the task prevents the
agent from exploring unrelated parts of a monorepo.

### Compress Before You Pass Forward

Tool outputs (logs, stack traces, diffs, API responses) are useful once but rarely need to flow
unfiltered into the next agent step. Summarize them. Extract key fields. One developer ran four AI
agents on Gemini's free tier (1,500 requests/day) by ensuring agents never had long conversations
[[3]](#references). Each request used pre-computed intelligence files (local markdown, zero
tokens), one focused prompt, one response, then stopped. The research pipeline (RSS feeds, Hacker
News scraping, web crawling) cost zero LLM tokens. Only creative and analytical work touched the
model.

**Headroom** is an MCP-based compression tool that reduces large content (file contents, logs,
search results) before passing it to the model. Instead of sending a 10,000-line test log, Headroom
compresses it to failed test names, stack traces, and relevant error lines. This is particularly
useful in agent loops where tool outputs from earlier steps would otherwise accumulate across
iterations.

### Reduce Unnecessary Output

**Caveman** focuses on making agent responses terser while compressing what agents read. The skill
reduces output token usage (50% fewer tokens median, up to 2.4× cost reduction), while the proxy
compresses input from logs, diffs, and tool outputs (33.2% fewer input tokens). JetBrains measured
8.5% fewer output tokens across 86 real coding tasks with no detectable quality change.

### Avoid Unnecessary Work

**Ponytail** implements the YAGNI (You Aren't Gonna Need It) philosophy by forcing agents through a
checklist before writing code: Does this need to exist? Does the standard library handle it? Is
there a native feature? Is there an existing dependency? Only after exhausting those options can the
agent write code, and only the minimum that works. The optimization ladder is applied only after
understanding the problem—it never skips code comprehension. In a small repository-authored agentic
benchmark, Ponytail achieved 54% fewer lines of code, 22% fewer tokens, 20% cost reduction, and 27%
faster execution while maintaining 100% safety (security, validation, accessibility preserved).

### Leverage Cached Context

Prompt caching can reduce repeated context costs by approximately 90%. Cache reads cost about 10% of
normal input tokens, but only if the context structure remains stable. Put static content first
(project rules, base documentation, stable code) and variable content last (user queries,
timestamps, session IDs). Changes early in a cached prefix can reduce cache reuse, so stable
instructions and project context should remain as stable as practical.

Keep persistent instruction files like `CLAUDE.md` lean and stable. Anthropic explicitly recommends
targeting under 200 lines and moving task-specific material into skills or path-scoped rules. Every
unnecessary line is loaded and billed on every session. In Claude Code, use `/usage` to monitor your
cache read/write token split in real time. A low cache-read ratio may indicate instability in your
context structure.

### Remember Decisions, Not Everything

Persistent memory prevents agents from re-explaining the codebase every session, but memory itself
can bloat prompts. One context layer uses decision-grain memory [[4]](#references): it captures
the aspect ("Auth Strategy"), the choice ("JWT"), and the reasoning ("stateless for scaling"). Old
decisions are marked superseded and linked to new ones, creating an audit trail, not a snapshot. A
two-stage injection system loads lightweight summaries (~100 tokens) by default; full reasoning
(~500-1K tokens) is only injected when the agent explicitly requests more. This approach cut tokens
50-70% versus raw context dumping.

### Route Simple Work to Cheaper Steps

Lower-cost models can be appropriate for constrained, well-defined tasks, while more capable models
may reduce retries on difficult work. Measure **cost per task**, not just cost per token. Sometimes
a more capable model completes a task faster with fewer iterations, making it cheaper overall than a
lightweight model that requires multiple retry loops.

Cat Wu, Head of Product for Claude Code at Anthropic, calls this "context minimalism: tell the model
only what it needs, then let it choose the route" [[1]](#references). Anthropic's own team
deleted around half the system prompt for Claude Code because newer models no longer needed it
spelled out.

For complex tasks, use plan mode first: validate the approach with a capable model, then execute
with a cheaper one when possible. Correcting a plan costs hundreds of tokens; undoing a wrong
implementation costs thousands.

**Control thinking effort explicitly.** Extended reasoning contributes to billed output usage and
latency but may not be visible in the response. Claude Code's `/effort` command controls reasoning
intensity: use lower effort for straightforward work and increase it when the task warrants deeper
reasoning. Available levels (low, medium, high, xhigh, max, auto) and defaults depend on the
selected model.

Setting effort appropriately for each task avoids paying for deep reasoning on straightforward work
like simple lookups, classification, or minor edits.

### Monitor and Debug Context

Token optimization requires visibility into what's consuming your context window. Claude Code
provides several commands for this:

**`/context`** shows a live breakdown of your current context allocation: system prompt, MCP
schemas, Claude.md instructions, repository context, conversation history, and attached files. It
highlights what's out of the ordinary. For example, if MCP schemas are consuming 22,000 tokens, that
signals a configuration problem worth investigating.

**`/doctor`** diagnoses and validates the Claude Code installation and settings, letting Claude
address reported problems. It's useful for troubleshooting configuration issues that might affect
context behavior.

### Understanding What Consumes Context

Different Claude Code features have different context costs. Understanding these helps you make
informed choices about which features to use for which tasks:

| Feature       | Context Cost                                                                    |
| ------------- | ------------------------------------------------------------------------------- |
| **CLAUDE.md** | Full content loaded every session/request                                       |
| **Skills**    | Descriptions available initially; full skill content loaded when invoked        |
| **MCP**       | Tool names exposed initially; full schemas deferred until needed                |
| **Subagents** | Get isolated context rather than inheriting entire main conversation by default |
| **Hooks**     | Execute outside the conversation; cost no context unless they return content    |

**Practical implications:**

- **Keep CLAUDE.md lean.** Since it's loaded on every request, every line matters. Anthropic
  recommends targeting under 200 lines and moving task-specific material into skills or path-scoped
  rules.
- **Skills are efficient for occasional-use functionality.** Only the description loads until you
  need them, making them better than duplicating instructions in CLAUDE.md.
- **MCP integrations have low idle cost.** Large or frequently used MCP configurations can still
  consume meaningful context. Use `/mcp` and `/context` to inspect token cost by server and identify
  unusually expensive integrations.
- **Subagents isolate work.** When a task requires reading large files or generating substantial
  output, a subagent keeps that content out of your main conversation's context.
- **Hooks are context-free automation.** They're ideal for routine actions (formatting, linting,
  testing) that should happen consistently but don't need to occupy conversation space.

### Put Budgets Around the Loop

Without explicit bounds, agents keep accumulating context until they hit token limits. Fixes
include:

- Hard caps on summarization windows
- Aggressive tool-output trimming (strip logs down to error messages and stack traces)
- Output length ceilings (request diffs instead of full rewrites, set maximum response lengths)
- Use explicit context boundaries between unrelated tasks (use `/compact` between sub-tasks,
  `/clear` when switching topics)
- Maximum context size and iteration count per task

**Request diffs, not full rewrites.** Output tokens cost 3-10× more than input tokens, making output
optimization highly effective. When updating code, explicitly ask for "unified diff" or "only the
changed lines" rather than letting the model reprint entire files. For a 500-line file with a
10-line change, requesting a diff saves 490 output tokens. At 5× the input rate, that's equivalent
to 2,450 input tokens saved per edit.

Similarly, avoid verbose model responses. An agent that explains its reasoning, recaps the
conversation, and provides background before answering wastes output tokens on unnecessary text.
Instructions like "return only the answer" or "respond with a bullet list, no introduction" can
reduce output by 40-60% without losing essential information.

**Thinking tokens are invisible but expensive.** Modern models generate internal reasoning tokens
before producing the final response. These thinking tokens are billed at output rates but never
appear in the response text. They're pure reasoning overhead. For simple tasks like "list all GET
handlers" or "rename this variable," extended thinking is unnecessary waste. Control this with
effort levels (covered in the model selection section above) to avoid paying for deep reasoning on
shallow tasks.

For API-based offline workloads, Anthropic's Message Batches API offers discounted asynchronous
processing for non-urgent tasks like nightly CI jobs, test generation, or bulk document analysis.
Results are delivered within 24 hours instead of real-time.

But token optimization has a risk: removing tokens can also remove information the model needed.
That's why every optimization needs evaluation.

## Did Optimization Hurt the Answer?

Reducing tokens is easy. Preserving quality is the hard part. A system can always spend fewer tokens
by removing context, shortening prompts, limiting output, or compressing tool results. But if the
model loses the information it needed to answer correctly, the optimization has failed.

### Why Token Savings Are Not Enough

Token optimization sounds like a success metric: fewer tokens sent means lower bills and faster
responses. But a token count alone doesn't tell you whether the system improved or just broke in a
cheaper way.

A model can use 60% fewer tokens and still fail. It might drop the context it needed, miss critical
evidence, or answer confidently with unsupported facts. The token bill went down, but the answer
became useless.

This creates a dilemma. All optimization requires balancing trade-offs. You risk damaging quality by
removing too much context, while retaining too much keeps costs unnecessarily high. The only
reliable way to validate an optimization is to measure the shift in both costs and the quality of
the answer.

But here's the deeper issue: **measuring the answer is not enough either.**

An agent can produce a correct final response after wasting thousands of tokens on irrelevant
searches, calling the wrong tools, repeating unnecessary steps, or ignoring the best evidence. The
answer looks good, but the workflow that produced it was inefficient, brittle, or lucky.

### Response Evaluation vs Workflow Evaluation

Traditional LLM evaluation focuses on outputs: the model generates text, and the evaluator scores it
for correctness or relevance. This works for single-turn tasks like translation or classification.

Agentic systems are different. An agent observes, decides, calls tools, reads results, and repeats
this loop until it stops. The final response is not the whole computation. It's the last message in
a multi-step workflow.

This means we need two evaluation questions:

**Response evaluation:** Was the final answer correct, useful, and faithful?

**Workflow evaluation:** Was the process efficient, grounded, and well-behaved?

The distinction matters because they can disagree [[9]](#references). An agent might give a
correct answer after ten unnecessary tool calls, retrieve the right document but cite the wrong
page, or succeed once but fail under small prompt changes because its reasoning was brittle.

Consider two agents answering the same question correctly:

- **Agent A** searches once, retrieves two relevant chunks, synthesizes an answer in ~5,000 tokens.
- **Agent B** searches three times, retrieves eight chunks (only two relevant), repeatedly
  summarizes old context, eventually produces the same answer in ~18,000 tokens.

A final-answer-only evaluation scores them equally. A workflow-aware evaluation does not.

The goal is not to punish every long workflow because some tasks require exploration. The goal is to
make workflow behavior **measurable** so that unnecessary complexity, wasted tokens, and brittle
reasoning become visible.

### What to Measure

A practical evaluation starts with a baseline. Run the same task once with the original context and
once with the optimized context. Then compare the responses side by side. The optimized version
doesn't need to be identical to the baseline, but it should preserve the qualities that matter for
the task.

For response quality, a simple rubric is enough:

| Dimension        | Question                                        |
| ---------------- | ----------------------------------------------- |
| **Correctness**  | Is the answer factually or technically correct? |
| **Relevance**    | Does it answer the actual user request?         |
| **Completeness** | Did it keep the important details?              |
| **Clarity**      | Is the response understandable?                 |
| **Faithfulness** | Is the answer supported by the given context?   |

For workflow quality, track the process itself:

| Dimension             | Question                                                  |
| --------------------- | --------------------------------------------------------- |
| **Tool Usage**        | Were the right tools called? Were unnecessary tools used? |
| **Retrieval Quality** | Did it retrieve relevant context? How many chunks?        |
| **Token Efficiency**  | How many input/output tokens? Cache hit rate?             |
| **Iteration Count**   | How many steps did the agent take? Were any redundant?    |
| **Error Patterns**    | Did it retry unnecessarily? Did it call invalid tools?    |
| **Termination Logic** | Did it stop at the right time or continue unnecessarily?  |

In coding tasks, the rubric can include whether tests pass, whether the right files were changed,
and whether the model avoided unrelated edits. In retrieval-based question answering, it can include
whether the answer is supported by the retrieved context.

### Evaluation Methods

Different evaluation methods suit different needs:

**Human rubrics** are slow and expensive but most reliable for nuanced quality assessment. A human
reads the output and scores it on relevant dimensions. Avoid a single "quality" score. An answer can
be clear but wrong, complete but unsupported, or correct but unsafe. Report a vector of scores
across multiple dimensions.

**Rule-based checks** are fast, cheap, and deterministic. They check explicit criteria: required
terms, valid JSON, citations, file names. Use them for hard constraints like required citations,
JSON schema validation, or allowed file modifications.

**LLM-as-a-judge** [[5]](#references) [[6]](#references) scales evaluation of open-ended
outputs using rubrics. However, judges are not objective truth. They may prefer longer answers or
miss subtle errors. Use them structured and constrained: provide the original task, generated
answer, and reference context. Define each rubric dimension clearly. Require JSON output for easier
parsing. Ask for short explanations to force reasoning. Compare judge results with human review on a
sample.

**Task-specific metrics** often provide the strongest evaluation. For coding agents: does the code
compile? Do tests pass? Were the expected files changed? For RAG systems [[7]](#references)
[[8]](#references): how many chunks were retrieved? Were sources cited? Is the answer grounded
in the retrieved context?

### Baseline vs Optimized Comparison

The final result should not be a token count alone. It should be a trade-off: how many tokens were
saved, how much latency changed, how much cost dropped, and whether quality stayed the same.

A proper comparison should track multiple dimensions: input and output token counts, tool usage,
latency, total cost, and quality metrics (correctness, faithfulness, task success rate). This
prevents celebrating token reduction without checking whether the optimization preserved what
mattered.

For example, one team measured their typical query at 83,000 tokens baseline by sending whole files
every time. After implementing targeted retrieval, they dropped to 4,900 tokens while still
retrieving the correct code 90% of the time [[2]](#references). That's a **94% token
reduction** with minimal quality loss. A clear win.

### Interpreting the Trade-off

Numbers don't tell you if optimization succeeded. Consider these scenarios:

**Scenario A: Large savings, stable task success** — -65% input tokens, -0.1 quality, no task
success change → Removed unnecessary context without hurting answers.

**Scenario B: Savings with measurable quality loss** — -40% tokens, -0.3 correctness, -35% cost →
Quality dropped noticeably. Whether this trade-off is acceptable depends entirely on the task. For
code generation, finance, legal, security, or production operations, even small quality drops may be
unacceptable.

**Scenario C: Large savings with task-success degradation** — -80% tokens, -1.5 faithfulness, -15%
task success → System failing more often, producing less grounded answers. Not optimization, but
degradation.

**Scenario D: Averages stable but new tail failures** — -50% tokens, stable average correctness, but
3/20 tests now fail completely → Aggregate looks good, but optimization introduced a brittle failure
mode.

Saving detailed per-task results reveals which questions are more sensitive to optimization.
Multi-step reasoning questions are often more sensitive to context pruning than simple lookups
[[11]](#references) [[12]](#references). This informs strategy: stronger filtering for
simple queries, lighter filtering for complex ones.

### A Practical Evaluation Framework

A minimal evaluation framework can be structured around five components:

```text
eval-tool/
├── tests/test_cases.yaml      # Task definitions
├── runner/run_agent.py         # Execute agent
├── traces/outputs.jsonl        # Logged traces
├── evaluators/
│   ├── response_quality.py     # Response metrics
│   ├── workflow_quality.py     # Workflow metrics
│   ├── rule_based.py           # Fast checks
│   └── llm_judge.py            # LLM scoring
└── reports/summary.md          # Generated reports
```

Each test case defines the task, expected behavior, and success criteria. The runner executes the
agent and logs the full trace: tool calls, retrieved chunks, token counts, latency, errors, and
final answer. Multiple evaluators score both the response and the workflow. The report aggregates
results and compares baseline vs optimized systems.

A minimal trace should be complete enough that someone else could replay the workflow, understand
what happened, and evaluate whether each step was necessary:

```python
{
  "task": "User's question",
  "model": "claude-sonnet-4",
  "tool_calls": [...],
  "retrieved_chunks": [...],
  "input_tokens": 12000,
  "output_tokens": 900,
  "cache_read_tokens": 8000,
  "latency_ms": 18000,
  "errors": [],
  "final_answer": "..."
}
```

Without traces, you can only judge final responses. With traces, you can evaluate the workflow.

### The Essential Practice

Large-scale engineering telemetry has shown that higher AI-assisted throughput does not
automatically translate into better software outcomes [[1]](#references). A token optimization
is only successful if it reduces waste without reducing the usefulness of the answer.

Token savings are not meaningful unless the answer remains useful. If the answer becomes worse, the
system hasn't optimized tokens, it has only made the model cheaper to run.

## Checklist: Before You Send Context to the Model

A context window should be treated like a budget, not a dumping ground. Before adding more files,
logs, messages, search results, or tool outputs to an LLM request, ask whether those tokens are
actually earning their place.

**Is this context relevant?** Does this information help with the current task, or is it included
because it might be useful? If the model only needs one function, sending the entire file may be
waste. If the user asks about one document section, sending every retrieved chunk may add noise. One
team found 45,000 tokens sent per query, but only 5,000 were actually relevant. That's 40,000 wasted
tokens every time.

**Can this be retrieved instead of always included?** Some information should be pulled only when
needed rather than front-loaded into every request. Hybrid search combining semantic and keyword
matching can find relevant code without sending the whole repository. Functions compressed to
signatures and descriptions can be expanded only when call-graph tracking shows they're connected.

**Can this be summarized or compressed?** Tool outputs (logs, stack traces, diffs, API responses)
are useful once but rarely need to flow unfiltered into the next step. Extract key fields. Trim to
error messages and changed lines. Compression tools like Headroom can automatically reduce large
content before passing it to the next agent iteration.

**Is this tool output too large?** Without size limits, a single grep result, test log, or git diff
can consume thousands of tokens. Hard caps on tool outputs prevent any single piece of data from
dominating the context window.

**Has the agent already seen this?** In agent loops, context accumulates quickly. By the fourth step
of a debugging loop, the agent may be carrying search results from step one that no longer matter.
Decision-grain memory (storing the choice and reasoning, not raw conversation history) prevents
re-explaining the same facts every session.

**Can a cheaper model handle this step?** Frontier models excel at complex reasoning but are
unnecessary for boilerplate generation, formatting, or routine refactoring. Route simple work to
smaller models. Reserve expensive context windows for tasks that actually need them.

**Is the cache structure optimized?** Put static content first (project rules, stable code) and
variable content last (timestamps, session IDs, queries). One misplaced variable at the top breaks
the cache on every call, forcing full-price billing instead of ~10% cache reads.

**Are MCP servers and tools curated for this task?** MCP integrations have a context cost, though
current Claude Code reduces this through deferred tool-schema loading. Tool names are available
initially, while full schemas load on demand. Large or frequently used MCP configurations can still
consume meaningful context. Use `/mcp` to inspect token cost by server and identify unusually
expensive integrations.

**Is context visible and monitored?** Use `/context` to see what's consuming your context window. If
MCP schemas, conversation history, or repository context look unusually large, investigate before
continuing. Regular monitoring prevents silent bloat.

**How will I measure whether optimization preserved quality?** If fewer tokens made the response
cheaper but less correct, less complete, or less faithful to the available context, the system has
only reduced cost by shifting the failure somewhere else. Compare baseline and optimized responses
against a simple rubric before declaring success. Track both response quality (correctness,
relevance, completeness) and workflow efficiency (tool usage, retrieval quality, token consumption).

Before sending context to the model, ask:

- Is this directly relevant to the current task?
- Can it be retrieved only when needed?
- Can it be summarized or compressed?
- Can large tool outputs be trimmed?
- Is old conversation history still useful?
- Has this already been stored as memory?
- Can this step use a cheaper model?
- Is my cache structure optimized?
- Are MCP servers curated (only connecting what I need)?
- Have I checked `/context` to see what's consuming space?
- How will I know if quality dropped?

The best token optimization strategy is not to starve the model of information, but to stop feeding
it information it does not need.

## Conclusion

Token optimization often starts with the wrong instinct: make the model say less. Shorter responses
can help, but they don't solve the deeper problem. The larger source of waste is the context sent
before the model generates anything.

Files, retrieved chunks, tool outputs, memory, logs, and previous messages can all be useful. But
when they're included without selection, they turn the context window into a dumping ground. In
agentic systems, this problem grows even faster because every loop carries old context forward into
the next step.

The challenge has two parts: reduce unnecessary context, and verify that removing it preserved the
system's usefulness. Token efficiency without quality measurement is just cheaper execution. Real
optimization requires both.

Good token optimization means:

- Retrieving what is relevant instead of sending everything
- Compressing what is too large before passing it forward
- Remembering decisions instead of raw conversation history
- Dropping what no longer matters from the agent loop
- Leveraging cached context by keeping static content stable
- Routing simple work to cheaper models
- Putting explicit bounds around the loop

Good evaluation means:

- Measuring both response quality and workflow efficiency
- Comparing baseline vs optimized systems on the same tasks
- Tracking token savings alongside correctness, relevance, and task success
- Identifying which questions are more sensitive to optimization
- Logging full traces so workflows become measurable

The goal is not to starve the model of information. The goal is to feed it deliberately. The best
LLM systems will not be the ones that use the fewest tokens. They will be the ones that know which
tokens are worth spending.

---

## References

[[1]](#references) [Johnson, T. (2026). Burn Less, Ship More: The Case for Token Optimization. _Multiplayer Blog_. Published June 26, 2026.](https://multiplayer.app/blog/burn-less-ship-more-the-case-for-token-optimization/)

[[2]](#references) [Raj & Fos. (2026). Token Optimization in AI Coding Tools. _YouTube Technical Talk Recording from developer conference_, July 2026.](https://youtu.be/dRmWYHuIJxM?si=LtquRjhwBGaehSTB)

[[3]](#references) [ppcvote. (2026). _Running AI Agents on Gemini Free Tier: Zero-LLM Pre-processing Pipelines_. Hacker News Show HN, April 2026.](https://news.ycombinator.com/item?id=47296664)

[[4]](#references) [TonyStef. (2023). Grov: Context Layer for AI Agents with Decision-Grain Memory. _Hacker News Show HN_, February 2026.](https://hn.algolia.com/?dateRange=all&page=0&prefix=false&query=token%20optimization%20grov&sort=byPopularity&type=story)

[[5]](#references) [Zheng, L., Chiang, W. L., Sheng, Y., Zhuang, S., Wu, Z., Zhuang, Y., ... & Stoica, I. (2023). Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena. _arXiv preprint arXiv:2306.05685_.](https://arxiv.org/abs/2306.05685)

[[6]](#references) [Liu, Y., Iter, D., Xu, Y., Wang, S., Xu, R., & Zhu, C. (2023). G-Eval: NLG Evaluation using GPT-4 with Better Human Alignment. _arXiv preprint arXiv:2303.16634_.](https://arxiv.org/abs/2303.16634)

[[7]](#references) [Es, S., James, J., Espinosa-Anke, L., & Schockaert, S. (2023). RAGAS: Automated Evaluation of Retrieval Augmented Generation. _arXiv preprint arXiv:2309.15217_.](https://arxiv.org/abs/2309.15217)

[[8]](#references) [Gao, Y., Xiong, Y., Gao, X., Jia, K., Pan, J., Bi, Y., ... & Wang, H. (2023). Retrieval-Augmented Generation for Large Language Models: A Survey. _arXiv preprint arXiv:2312.10997_.](https://arxiv.org/abs/2312.10997)

[[9]](#references) [Xi, Z., Chen, W., Guo, X., He, W., Ding, Y., Hong, B., ... & Gui, T. (2023). The Rise and Potential of Large Language Model Based Agents: A Survey. _arXiv preprint arXiv:2309.07864_.](https://arxiv.org/abs/2309.07864)

[[10]](#references) [Dhuliawala, S., Komeili, M., Xu, J., Raileanu, R., Li, X., Celikyilmaz, A., & Weston, J. (2023). Chain-of-Verification Reduces Hallucination in Large Language Models. _arXiv preprint arXiv:2309.11495_.](https://arxiv.org/abs/2309.11495)

[[11]](#references) [Press, O., Smith, N. A., & Lewis, M. (2022). Measuring and Narrowing the Compositionality Gap in Language Models. _arXiv preprint arXiv:2210.03350_.](https://arxiv.org/abs/2210.03350)

[[12]](#references) [Liu, N. F., Lin, K., Hewitt, J., Paranjape, A., Bevilacqua, M., Petroni, F., & Liang, P. (2023). Lost in the Middle: How Language Models Use Long Contexts. _arXiv preprint arXiv:2307.03172_.](https://arxiv.org/abs/2307.03172)

---

## Additional Resources

### Token Optimization Tools and Libraries

- [Headroom (MCP)](https://www.headroomlabs.ai/) —
  Context compression tool that reduces large content (logs, files, search results) before passing
  to models. Available as an MCP server for Claude Code.

- [Caveman](https://github.com/JuliusBrussee/caveman) — Minimalist approach forcing agents to work
  with compressed, essential-only context. Achieves 80-94% code reduction and 47-77% cost savings.

- [Ponytail](https://github.com/dietrichgebert/ponytail) — YAGNI (You Aren't Gonna Need It)
  philosophy implementation. Forces agents through a checklist before code generation, resulting in
  3-6× faster execution.
  