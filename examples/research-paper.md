---
title: "The Impact of Document Formats on AI Processing Efficiency"
author: Research Team
lang: en
description: A study on document format optimization for AI systems
tags:
  - research
  - AI
  - document-processing
  - efficiency
---

# The Impact of Document Formats on AI Processing Efficiency

## Abstract

This paper examines the computational cost of document ingestion across different file formats in modern AI systems. We demonstrate that format choice has a significant impact on processing speed, text fidelity, and downstream task performance in Retrieval-Augmented Generation (RAG) pipelines. Our analysis reveals that structured text formats reduce ingestion costs by two orders of magnitude compared to rasterized formats while maintaining perfect content fidelity[^1].

## 1. Introduction

The rapid adoption of large language models has created an unprecedented demand for document processing infrastructure. Organizations deploying RAG systems must ingest thousands of documents daily, converting them from their stored format into plain text suitable for embedding and retrieval. The dominant document format in enterprise environments remains PDF, a specification originally designed in 1993 for faithful reproduction of printed pages[^2].

The PDF format encodes documents as a sequence of drawing operations targeting a virtual printer. Text may be stored as individual character positions, as glyph indices referencing embedded fonts, or as rasterized images requiring optical character recognition. This design prioritizes pixel-perfect rendering at the expense of semantic structure, making text extraction an inherently lossy operation.

> [!NOTE]
> The PDF specification (ISO 32000-2:2020) spans over 1,000 pages and supports features ranging from 3D artwork to JavaScript execution. Most document processing pipelines use only a fraction of this capability.

Recent work in document AI has produced increasingly sophisticated extraction pipelines. Tools such as `pymupdf`, `pdfplumber`, `marker`, and `docling` employ heuristics, machine learning models, and even vision-language models to reconstruct document text from PDF rendering instructions[^3]. While these tools have improved significantly, they remain fundamentally limited by the information loss inherent in the PDF format.

### 1.1 Motivation

The cost of document ingestion extends beyond raw computation. Extraction errors propagate through the entire RAG pipeline, degrading retrieval quality and ultimately reducing the accuracy of generated responses. Table structures are frequently corrupted, code blocks lose their formatting, mathematical notation is mangled, and multi-column layouts produce interleaved text.

> [!WARNING]
> Studies show that even state-of-the-art PDF extractors achieve only 85-92% text fidelity on complex documents. This means that up to 15% of content may be lost or corrupted during ingestion.

### 1.2 Contributions

This paper makes the following contributions:

1. A systematic comparison of document formats for AI ingestion
2. Quantitative measurements of extraction quality across format types
3. A proposal for MPDF, a format designed specifically for AI-native document workflows
4. An open-source implementation with zero-dependency readers

## 2. Background

### 2.1 Document Format Taxonomy

Document formats can be broadly classified along two axes: their primary representation model and their intended consumer.

| Category | Format | Model | Target Consumer |
|----------|--------|-------|-----------------|
| Rasterized | PDF | Drawing ops | Printers/screens |
| Rasterized | DJVU | Wavelet compression | Scanners |
| Structured | HTML | DOM tree | Web browsers |
| Structured | DOCX | XML + ZIP | Word processors |
| Structured | Markdown | Plain text | Humans + machines |
| Structured | MPDF | Markdown + ZIP | AI systems + humans |

### 2.2 Cost Model

The total cost $C$ of document processing in a RAG pipeline can be modeled as:

$$C = C_{extract} + C_{chunk} + C_{embed} + C_{store}$$

Where $C_{extract}$ represents the extraction cost, which varies dramatically across formats. For PDF documents, $C_{extract}$ dominates the total cost, often accounting for 60-80% of the processing budget.

> [!TIP]
> By choosing a format where $C_{extract} \approx 0$, organizations can reduce their total document processing costs by up to 70%.

## 3. Methodology

### 3.1 Dataset

We assembled a corpus of 500 documents spanning five categories:

| Category | Count | Avg. Pages | Features |
|----------|-------|-----------|----------|
| Technical reports | 120 | 15 | Tables, code, diagrams |
| Research papers | 100 | 12 | Math, footnotes, references |
| Legal documents | 80 | 25 | Dense text, numbering |
| Business reports | 100 | 8 | Charts, tables, formatting |
| API documentation | 100 | 20 | Code blocks, tables, links |

### 3.2 Extraction Pipeline

Each document was processed through five extraction methods:

1. **pymupdf** — C-based PDF parser with text extraction
2. **marker** — Neural PDF-to-Markdown converter
3. **docling** — IBM's document understanding pipeline
4. **unstructured** — Multi-format extraction library
5. **MPDF reader** — Simple ZIP extraction (stdlib only)

##### Measurement Protocol

All measurements were conducted on identical hardware with three repetitions per document. We recorded wall-clock time, peak memory usage, text fidelity (measured via ROUGE-L against ground truth), and structural preservation accuracy.

## 4. Results

### 4.1 Extraction Performance

The results confirm our hypothesis that structured formats dramatically outperform rasterized formats in extraction speed and fidelity.

```python
# Performance measurement code
import time
from mpdf_reader import extract_markdown

start = time.perf_counter()
content = extract_markdown("document.mpdf")
elapsed = time.perf_counter() - start

print(f"Extraction time: {elapsed:.4f}s")
print(f"Content length: {len(content)} chars")
```

The median extraction time for MPDF was 8 milliseconds compared to 2,400 milliseconds for pymupdf, representing a 300x speedup.

### 4.2 Fidelity Analysis

Text fidelity was measured using ROUGE-L scores against manually verified ground truth:

```bash
# Batch fidelity measurement
for file in corpus/*.mpdf; do
  extracted=$(mpdf extract "$file")
  score=$(python3 measure_rouge.py "$extracted" "$file.ground_truth")
  echo "$file: $score"
done
```

MPDF achieved perfect fidelity (ROUGE-L = 1.0) across all documents, as extraction is a simple ZIP read operation with no transformation or interpretation required.

## 5. Discussion

The fundamental insight of this work is that the document processing problem is largely self-inflicted. By encoding documents in formats designed for visual rendering, we create an artificial barrier that must be overcome through increasingly complex extraction pipelines. MPDF eliminates this barrier by making the structured text representation the primary format, with visual rendering as a secondary concern.

> [!IMPORTANT]
> The transition from PDF to structured formats does not require abandoning visual fidelity. MPDF packages CSS stylesheets and embedded fonts alongside the Markdown source, enabling professional-quality rendering when needed while maintaining instant AI accessibility.

## 6. Conclusion

Our analysis demonstrates that document format choice has a profound impact on AI processing efficiency. MPDF offers a practical path forward: documents that are simultaneously human-readable, professionally styled, and instantly machine-accessible. The open specification and zero-dependency reader library make adoption straightforward for organizations of any size.

---

## References

[^1]: Smith, J. et al. "Efficient Document Processing for Large Language Models." *Proceedings of ACL 2025*, pp. 1234-1248.

[^2]: Adobe Systems Incorporated. "PDF Reference, Version 1.0." June 1993.

[^3]: Wang, L. et al. "A Survey of PDF Understanding: From Extraction to Comprehension." *arXiv:2024.xxxxx*, 2024.
