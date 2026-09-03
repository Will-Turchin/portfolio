#!/usr/bin/env bash

set -euo pipefail

fail() {
  echo "FAIL: $1" >&2
  exit 1
}

assert_file() {
  [[ -s "$1" ]] || fail "expected non-empty file: $1"
}

echo "Checking required site files..."
for file in index.html styles.css script.js; do
  assert_file "$file"
done
assert_file assets/Will_Turchin_Resume.pdf

echo "Checking HTML document structure..."
grep -Fqi '<!doctype html>' index.html || fail "index.html is missing its doctype"
grep -Fq '<html lang="en">' index.html || fail "index.html is missing its language"
grep -Fq '<title>' index.html || fail "index.html is missing a title"
grep -Fq 'href="styles.css"' index.html || fail "index.html does not reference styles.css"
grep -Eq 'src="script\.js(\?[^"]*)?"' index.html || fail "index.html does not reference script.js"
grep -Fq 'id="project-panel"' index.html || fail "index.html is missing project details"
grep -Fq 'data-project-github' index.html || fail "index.html is missing the project GitHub preview"
if grep -Eq 'project-gallery|data-gallery' index.html; then
  fail "index.html still contains the project image gallery"
fi

echo "Checking GitHub project mappings..."
grep -Fq 'https://github.com/Mines-Formula/ThePipeline' script.js || fail "Formula SAE Telemetry is missing its GitHub repository"
grep -Fq 'https://github.com/Will-Turchin/cameraPrograms' script.js || fail "RavenScope is missing its GitHub repository"
grep -Fq 'https://github.com/Will-Turchin/ImageJ' script.js || fail "RavenScope is missing its ImageJ repository"
grep -Fq 'https://github.com/Will-Turchin/MidiAI' script.js || fail "AI Classical Music Generator is missing its GitHub repository"
grep -Fq 'https://lnkd.in/p/eQDDtAJQ' script.js || fail "Botta Daily Spin is missing its LinkedIn post"
assert_file assets/projects/linkedin-post-preview.svg
grep -Fq 'assets/projects/capsure-pill-dispenser/capsure-pill-dispenser.html' script.js || fail "CapSure is missing its project site"
assert_file assets/projects/capsure-pill-dispenser/capsure-pill-dispenser.html
assert_file assets/projects/capsure-pill-dispenser/pill-dispenser-media/presentation-slide.jpg
grep -Fq 'assets/projects/repository-fallback.svg' script.js || fail "Project link thumbnail fallback is not configured"
assert_file assets/projects/repository-fallback.svg
grep -Fq 'This project is proprietary' script.js || fail "Proprietary projects are missing an unavailable-link card"
grep -Fq 'opengraph.githubassets.com' script.js || fail "GitHub preview thumbnail is not configured"

echo "Checking JavaScript syntax..."
if command -v node >/dev/null 2>&1; then
  node --check script.js
else
  echo "Node.js is not installed; skipping local syntax check (CI provisions Node.js)."
fi

echo "All site tests passed."
