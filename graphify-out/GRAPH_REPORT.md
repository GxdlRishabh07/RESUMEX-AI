# Graph Report - AI-Resume-Optimizer-2026-08-02-a40fc  (2026-08-02)

## Corpus Check
- 18 files · ~8,240 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 35 nodes · 44 edges · 3 communities detected
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]

## God Nodes (most connected - your core abstractions)
1. `getGeminiClient()` - 4 edges
2. `analyzeAtsScoreWithGemini()` - 4 edges
3. `optimizeResumeWithGemini()` - 4 edges
4. `testGeminiConnection()` - 3 edges
5. `buildAtsAnalysisPrompt()` - 3 edges
6. `buildAtsOptimizationPrompt()` - 3 edges
7. `handleOptimize()` - 2 edges
8. `handleKeyDown()` - 2 edges
9. `ResultCard()` - 2 edges
10. `Footer()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `analyzeAtsScoreWithGemini()` --calls--> `buildAtsAnalysisPrompt()`  [INFERRED]
  src/services/geminiService.ts → src/services/promptBuilder.ts
- `optimizeResumeWithGemini()` --calls--> `buildAtsOptimizationPrompt()`  [INFERRED]
  src/services/geminiService.ts → src/services/promptBuilder.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.22
Nodes (4): Footer(), HeroSection(), handleKeyDown(), handleOptimize()

### Community 1 - "Community 1"
Cohesion: 0.5
Nodes (6): analyzeAtsScoreWithGemini(), getGeminiClient(), optimizeResumeWithGemini(), testGeminiConnection(), buildAtsAnalysisPrompt(), buildAtsOptimizationPrompt()

### Community 2 - "Community 2"
Cohesion: 0.25
Nodes (1): ResultCard()

## Knowledge Gaps
- **Thin community `Community 2`** (8 nodes): `getScoreBadge()`, `ResultCard()`, `ErrorAlert.tsx`, `InitialScoreCard.tsx`, `JobDescriptionInput.tsx`, `ResultCard.tsx`, `samples.ts`, `types.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ResultCard()` connect `Community 2` to `Community 0`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._