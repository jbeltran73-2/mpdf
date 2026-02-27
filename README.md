# MPDF — Markdown Portable Document Format

> PDF fue diseñado para impresoras. MPDF está diseñado para inteligencias.

MPDF is an open document format that packages Markdown + CSS + fonts into a ZIP container (`.mpdf`) for human visualization and direct AI ingestion.

## Why MPDF?

Every RAG pipeline, every AI agent, every document processing system wastes compute parsing PDFs — a format from 1993 designed for printers. MPDF inverts the logic: documents born as structured text, packaged with style for human viewing, ingested by AI without parsing, OCR, or loss.

```
unzip report.mpdf → content.md → ready
```

## Quick Start

```bash
# Install
npm install -g @mpdf/compiler

# Compile Markdown to MPDF
mpdf compile document.md -o document.mpdf

# Validate an MPDF file
mpdf validate document.mpdf

# View manifest info
mpdf info document.mpdf
```

## For AI / RAG Engineers

```python
# Python — zero dependencies
from mpdf_reader import extract_markdown

md = extract_markdown("report.mpdf")
# → clean string, ready for chunking/embedding
```

```typescript
// TypeScript
import { extractMarkdown } from '@mpdf/reader';

const markdown = await extractMarkdown('report.mpdf');
```

## Format Structure

An `.mpdf` file is a ZIP containing:

```
document.mpdf (ZIP)
├── content.md          # Markdown source (always preserved)
├── manifest.json       # Metadata + AI block
├── style/
│   ├── theme.css       # Screen stylesheet
│   └── print.css       # Print stylesheet (CSS Paged Media)
├── fonts/              # Embedded fonts (woff2)
├── assets/             # Embedded images
└── signature.sha256    # Content integrity hash
```

## Packages

| Package | Description |
|---------|-------------|
| `@mpdf/core` | Types, schemas, constants, validator |
| `@mpdf/compiler` | CLI compiler: `.md` → `.mpdf` |
| `@mpdf/reader` | Extraction library (TypeScript) |
| `mpdf-reader` (PyPI) | Extraction library (Python, stdlib only) |

## License

MIT
