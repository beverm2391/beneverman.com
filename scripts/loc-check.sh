#!/bin/bash

# Keep executable source files small enough for humans and agents to hold in one
# mental model. Prose content, including Markdown and MDX publications, is
# deliberately exempt. PROMPT.md is injected context rather than publication
# content, so it warns at 250 physical lines and blocks at 300.

set -u

WARN_THRESHOLD=${LOC_WARN_THRESHOLD:-400}
BLOCK_THRESHOLD=${LOC_BLOCK_THRESHOLD:-450}
PROMPT_WARN_THRESHOLD=250
PROMPT_BLOCK_THRESHOLD=300

mode="staged"
[[ "${1:-}" == "--all" ]] && mode="all"

warned=()
blocked=()
invalid_overrides=()
checked=0

should_check() {
  local file="$1"
  [[ "$file" == docs/* ]] && return 1
  [[ "$file" == *.mdx ]] && return 1
  [[ "$file" == *.md && "$(basename "$file")" != "PROMPT.md" ]] && return 1
  [[ "$file" == *node_modules/* || "$file" == *.generated.* || "$file" == *.d.ts ]] && return 1
  [[ "$(basename "$file")" == "PROMPT.md" ]] && return 0
  case "${file##*.}" in
    ts|tsx|js|jsx|py|go|rs|swift|sh|glsl) return 0 ;;
    *) return 1 ;;
  esac
}

check_file() {
  local file="$1"
  [[ -f "$file" ]] || return

  local lines warn block override limit reason
  lines=$(wc -l < "$file" | tr -d ' ')
  warn=$WARN_THRESHOLD
  block=$BLOCK_THRESHOLD

  if [[ "$(basename "$file")" == "PROMPT.md" ]]; then
    warn=$PROMPT_WARN_THRESHOLD
    block=$PROMPT_BLOCK_THRESHOLD
  fi

  override=$(head -10 "$file" | grep -E 'loc-check:[[:space:]]*limit[[:space:]]+[0-9]+' | head -1 || true)
  if [[ -n "$override" ]]; then
    limit=$(echo "$override" | grep -oE 'limit[[:space:]]+[0-9]+' | grep -oE '[0-9]+')
    reason=$(echo "$override" | sed -n 's/.*|[[:space:]]*reason:[[:space:]]*//p' | sed 's/[[:space:]]*-->//;s/[[:space:]]*$//')
    if [[ -z "$reason" ]]; then
      invalid_overrides+=("$file requests $limit lines without a reason")
    else
      block=$limit
      local override_warn
      override_warn=$(echo "$override" | grep -oE 'warn:[[:space:]]*[0-9]+' | grep -oE '[0-9]+' || true)
      if [[ -n "$override_warn" ]]; then
        warn=$override_warn
      elif [[ "$(basename "$file")" == "PROMPT.md" ]]; then
        warn=$((block * 83 / 100))
      else
        warn=$((block * 55 / 100))
      fi
      echo "LOC override: $file ($lines/$block) — $reason"
    fi
  fi

  if (( lines >= block )); then
    blocked+=("$file ($lines lines, limit $block)")
  elif (( lines >= warn )); then
    warned+=("$file ($lines lines, warn at $warn)")
  fi
}

files=()
if [[ "$mode" == "all" ]]; then
  while IFS= read -r file; do files+=("$file"); done < <(git ls-files)
else
  while IFS= read -r file; do files+=("$file"); done < <(git diff --cached --name-only --diff-filter=ACM)
fi

for file in "${files[@]}"; do
  if should_check "$file"; then
    checked=$((checked + 1))
    check_file "$file"
  fi
done

if (( ${#warned[@]} > 0 )); then
  echo ""
  echo "LOC warnings:"
  printf '  - %s\n' "${warned[@]}"
fi

if (( ${#invalid_overrides[@]} > 0 )); then
  echo ""
  echo "Invalid LOC overrides:"
  printf '  - %s\n' "${invalid_overrides[@]}"
fi

if (( ${#blocked[@]} > 0 )); then
  echo ""
  echo "LOC check blocked:"
  printf '  - %s\n' "${blocked[@]}"
  echo "Split by domain, or add a justified first-10-lines override after review."
fi

echo "LOC check: $checked files (warn $WARN_THRESHOLD, block $BLOCK_THRESHOLD)"

if (( ${#invalid_overrides[@]} > 0 || ${#blocked[@]} > 0 )); then
  exit 1
fi
