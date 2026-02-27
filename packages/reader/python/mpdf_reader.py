"""
mpdf_reader — MPDF Reader Library
Zero external dependencies. Python stdlib only.
pip install mpdf-reader
"""
import zipfile
import json
import hashlib
from pathlib import Path
from typing import Tuple, Dict, List, Optional


def extract_markdown(path: str | Path) -> str:
    """Extract raw markdown content from an .mpdf file.

    This is the primary function for AI ingestion.
    Returns the content.md as a UTF-8 string, ready for
    chunking, embedding, or direct LLM consumption.
    """
    with zipfile.ZipFile(path, 'r') as z:
        return z.read('content.md').decode('utf-8')


def read_mpdf(path: str | Path) -> Tuple[str, Dict]:
    """Read an .mpdf file and return (markdown, manifest).

    Returns:
        tuple: (content_md: str, manifest: dict)
    """
    with zipfile.ZipFile(path, 'r') as z:
        content = z.read('content.md').decode('utf-8')
        manifest = json.loads(z.read('manifest.json').decode('utf-8'))
        return content, manifest


def get_manifest(path: str | Path) -> Dict:
    """Read only the manifest (metadata) without extracting content.

    Useful for document triage — check word count, language,
    table count, etc. without reading the full document.
    """
    with zipfile.ZipFile(path, 'r') as z:
        return json.loads(z.read('manifest.json').decode('utf-8'))


def validate(path: str | Path) -> bool:
    """Validate an .mpdf file structure and integrity."""
    try:
        with zipfile.ZipFile(path, 'r') as z:
            names = z.namelist()
            assert 'content.md' in names, "Missing content.md"
            assert 'manifest.json' in names, "Missing manifest.json"
            manifest = json.loads(z.read('manifest.json').decode('utf-8'))
            assert 'mpdf_version' in manifest, "Missing mpdf_version"

            # Verify content hash if available
            if 'ai' in manifest and 'content_hash' in manifest['ai']:
                content = z.read('content.md')
                expected = manifest['ai']['content_hash'].replace('sha256:', '')
                actual = hashlib.sha256(content).hexdigest()
                assert actual == expected, "Content hash mismatch"

            return True
    except Exception:
        return False


def list_assets(path: str | Path) -> List[str]:
    """List all asset files in the .mpdf container."""
    with zipfile.ZipFile(path, 'r') as z:
        return [n for n in z.namelist() if n.startswith('assets/')]


if __name__ == '__main__':
    import sys
    if len(sys.argv) < 2:
        print("Usage: python mpdf_reader.py <file.mpdf>")
        sys.exit(1)

    path = sys.argv[1]
    if validate(path):
        print(f"Valid .mpdf file: {path}")
        manifest = get_manifest(path)
        print(f"  Title: {manifest.get('title', '(untitled)')}")
        print(f"  Author: {manifest.get('author', '(unknown)')}")
        if 'ai' in manifest:
            ai = manifest['ai']
            print(f"  Words: {ai.get('word_count', '?')}")
            print(f"  Language: {ai.get('language_detected', '?')}")
    else:
        print(f"Invalid .mpdf file: {path}")
        sys.exit(1)
