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

echo "Checking HTML document structure..."
grep -Fqi '<!doctype html>' index.html || fail "index.html is missing its doctype"
grep -Fq '<html lang="en">' index.html || fail "index.html is missing its language"
grep -Fq '<title>' index.html || fail "index.html is missing a title"
grep -Fq 'href="styles.css"' index.html || fail "index.html does not reference styles.css"
grep -Eq 'src="script\.js(\?[^"]*)?"' index.html || fail "index.html does not reference script.js"
grep -Fq 'id="project-panel"' index.html || fail "index.html is missing project details"
if grep -Eq 'project-gallery|data-gallery' index.html; then
  fail "index.html still contains the project image gallery"
fi

echo "Checking retained project asset directories..."
while IFS= read -r project; do
  [[ -d "assets/projects/$project" ]] || fail "missing project asset directory: assets/projects/$project"
  [[ -s "assets/projects/$project/README.md" ]] || fail "missing project asset README: assets/projects/$project/README.md"
done < <(grep -o 'data-project="[^"]*"' index.html | cut -d'"' -f2 | sort -u)

echo "Checking JavaScript syntax..."
if command -v node >/dev/null 2>&1; then
  node --check script.js
else
  echo "Node.js is not installed; skipping local syntax check (CI provisions Node.js)."
fi

echo "All site tests passed."
