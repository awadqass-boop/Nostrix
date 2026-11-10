#!/bin/sh
# Builds the public folder that Cloudflare Pages serves.
# Cloudflare Pages settings: build command `sh _build/cf-pages.sh`, output directory `_site`.
# Everything in the repo is copied except private or host-specific files:
#   _build/        build scripts and source data (must not be public)
#   functions/, server/   API code that runs on Cloudflare (never served as files)
#   CNAME          only used by GitHub Pages
#   privacy.html, review.html   old redirect stubs, replaced by the _redirects file
set -eu

OUT=_site
rm -rf "$OUT"
mkdir "$OUT"

find . -type f \
  ! -path './.git/*' \
  ! -path "./$OUT/*" \
  ! -path './_build/*' \
  ! -path './functions/*' \
  ! -path './server/*' \
  ! -path './privacy.html' \
  ! -path './review.html' \
  ! -name 'CNAME' \
  ! -name '.gitignore' \
  ! -name '.gitkeep' \
  ! -name '.DS_Store' |
while IFS= read -r f; do
  mkdir -p "$OUT/$(dirname "$f")"
  cp "$f" "$OUT/$f"
done

echo "Built $OUT with $(find "$OUT" -type f | wc -l | tr -d ' ') files"
