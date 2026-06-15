#!/bin/bash
# Fetch SVG path data from Simple Icons CDN for all 26 tech stack icons
# Outputs a TypeScript map: tech name -> SVG path data

declare -A ICONS
ICONS=(
  ["Python"]="python"
  ["JavaScript"]="javascript"
  ["TypeScript"]="typescript"
  ["Java"]="java"
  ["C"]="c"
  ["React"]="react"
  ["Vite"]="vite"
  ["Tailwind CSS"]="tailwindcss"
  ["HTML5"]="html5"
  ["FastAPI"]="fastapi"
  ["Flask"]="flask"
  ["JWT"]="jsonwebtokens"
  ["PostgreSQL"]="postgresql"
  ["MySQL"]="mysql"
  ["Redis"]="redis"
  ["scikit-learn"]="scikitlearn"
  ["Pandas"]="pandas"
  ["NumPy"]="numpy"
  ["Streamlit"]="streamlit"
  ["GitLab"]="gitlab"
  ["GitLab CI"]="gitlab"
  ["Docker"]="docker"
  ["Postman"]="postman"
  ["ESLint"]="eslint"
  ["Notion"]="notion"
  ["Markdown"]="markdown"
)

echo "// Auto-generated from Simple Icons CDN"
echo "// Maps tech display names to their SVG path data"
echo ""
echo "const ICON_PATHS: Record<string, string> = {"

for name in "${!ICONS[@]}"; do
  slug="${ICONS[$name]}"
  svg=$(curl -s "https://cdn.simpleicons.org/${slug}" 2>/dev/null)
  path=$(echo "$svg" | sed -n 's/.*<path d="\([^"]*\)".*/\1/p')
  echo "  \"${name}\": \"${path}\","
done

echo "};"
echo ""
echo "export default ICON_PATHS;"
