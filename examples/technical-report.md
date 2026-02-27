---
title: "Technical Report: MPDF Format Analysis"
author: MPDF Team
lang: en
tags:
  - technical
  - format
  - analysis
description: A comprehensive analysis of the MPDF document format and its capabilities.
---

# Technical Report: MPDF Format Analysis

## Executive Summary

This report analyzes the MPDF document format, its internal structure, and its advantages over legacy document formats for AI processing pipelines.

---

## 1. Format Structure

The `.mpdf` format uses a standard ZIP container with the following internal layout:

| Component | Path | Purpose | Required |
|-----------|------|---------|----------|
| Markdown source | `content.md` | Document content | Yes |
| Manifest | `manifest.json` | Metadata + AI block | Yes |
| Screen styles | `style/theme.css` | Visual rendering | No |
| Print styles | `style/print.css` | Print/PDF output | No |
| Fonts | `fonts/*.woff2` | Typography | No |
| Images | `assets/*` | Embedded media | No |
| Integrity | `signature.sha256` | Content hash | No |

### 1.1 The Manifest

The manifest contains pre-computed metadata that enables AI systems to triage documents without extracting the full content.

#### Key Manifest Fields

The `ai` block provides:

- **word_count**: Total words excluding code blocks
- **heading_count**: Number of heading elements
- **table_count**: Number of tables
- **code_block_count**: Number of fenced code blocks
- **image_count**: Number of embedded images
- **language_detected**: BCP 47 language code

## 2. Implementation Examples

### 2.1 Python Integration

```python
from mpdf_reader import extract_markdown, read_mpdf

# Simple extraction for LLM consumption
content = extract_markdown("report.mpdf")

# Full extraction with metadata
content, manifest = read_mpdf("report.mpdf")
print(f"Words: {manifest['ai']['word_count']}")
print(f"Language: {manifest['ai']['language_detected']}")
```

### 2.2 TypeScript Integration

```typescript
import { extractMarkdown, getManifest } from '@mpdf/reader';

const markdown = await extractMarkdown('report.mpdf');
const manifest = await getManifest('report.mpdf');

if (manifest.ai.word_count > 10000) {
  console.log('Large document — using chunked processing');
}
```

### 2.3 Shell Usage

```bash
# Compile a document
mpdf compile report.md -o report.mpdf --author "MPDF Team"

# Validate structure
mpdf validate report.mpdf

# View metadata
mpdf info report.mpdf

# Direct extraction (it's just a ZIP!)
unzip -p report.mpdf content.md | head -20
```

## 3. Performance Comparison

| Metric | PDF (pymupdf) | PDF (marker) | MPDF |
|--------|--------------|-------------|------|
| Extraction time (10-page doc) | ~2.5s | ~8.0s | ~0.01s |
| Text fidelity | ~85% | ~92% | 100% |
| Table preservation | ~60% | ~75% | 100% |
| Code block detection | ~70% | ~80% | 100% |
| Dependencies required | pymupdf (C ext) | torch, marker | zipfile (stdlib) |
| GPU required | No | Yes | No |

## 4. Current Status

### Completed Tasks

- [x] Format specification v0.1
- [x] Core type definitions and schemas
- [x] CLI compiler (md → mpdf)
- [x] TypeScript reader library
- [x] Python reader library (stdlib only)

### Pending Tasks

- [ ] Web viewer (React SPA)
- [ ] Desktop viewer (Tauri)
- [ ] VS Code extension
- [ ] LangChain integration
- [ ] GitHub Action

## 5. Architecture Diagram

The compilation pipeline follows a linear flow:

1. **Parse** — Extract frontmatter and tokenize Markdown
2. **Resolve** — Embed images as assets
3. **Analyze** — Compute AI metadata from tokens
4. **Theme** — Load CSS and fonts
5. **Package** — Assemble ZIP container

---

## Conclusion

MPDF represents a paradigm shift in document formats. By treating structured text as the primary representation and visual rendering as a secondary concern, it eliminates the most expensive step in AI document processing.

> The best document parser is no parser at all.

![Test Diagram](images/test-diagram.png)
