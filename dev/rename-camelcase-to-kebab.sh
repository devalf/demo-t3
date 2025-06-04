#!/bin/bash
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to convert camelCase to kebab-case
camel_to_kebab() {
    echo "$1" | sed 's/\([a-z0-9]\)\([A-Z]\)/\1-\2/g' | tr '[:upper:]' '[:lower:]'
}

# Function to escape special regex characters for sed
escape_for_sed() {
    echo "$1" | sed -e 's/[.[\*^$()+?{}|\\]/\\&/g'
}

echo -e "${BLUE}=== CamelCase to Kebab-Case Renamer for NX Monorepo ===${NC}"
echo ""

# Check if we're in the right directory
if [ ! -d "./apps" ] && [ ! -d "./libs" ]; then
    echo -e "${RED}Error: ./apps or ./libs folders not found. Please run this script from the root of your NX monorepo.${NC}"
    exit 1
fi

# Find camelCase files only in apps and libs folders
echo -e "${YELLOW}Step 1: Finding camelCase files...${NC}"
# Find camelCase files (match at least one lowercase followed by uppercase in the basename)
camelcase_files=()
while IFS= read -r f; do
    camelcase_files+=("$f")
done < <(find ./apps ./libs -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | awk -F/ '{f=$(NF); if(f ~ /[a-z][A-Z]/) print $0}')

if [ ${#camelcase_files[@]} -eq 0 ]; then
    echo -e "${GREEN}No camelCase files found. Nothing to rename!${NC}"
    exit 0
fi

echo -e "${GREEN}Found camelCase files:${NC}"
for f in "${camelcase_files[@]}"; do echo "  $f"; done

# Use two indexed arrays for mapping
old_files=()
new_files=()

# Build mapping: old file -> new file
for file in "${camelcase_files[@]}"; do
    dir=$(dirname "$file")
    filename=$(basename "$file")
    # Split on dots, kebab only first part
    IFS='.' read -ra parts <<< "$filename"
    kebab_first_part=$(camel_to_kebab "${parts[0]}")
    new_filename="$kebab_first_part"
    for ((i=1; i<${#parts[@]}; i++)); do
        new_filename+=".${parts[i]}"
    done
    new_file="$dir/$new_filename"
    old_files+=("$file")
    new_files+=("$new_file")
done

echo -e "${YELLOW}Planned renames:${NC}"
for i in "${!old_files[@]}"; do
    echo -e "  ${old_files[$i]} -> ${new_files[$i]}"
done

echo ""
read -p "Proceed with these renames and update imports? (y/N): " -n 1 -r
printf '\n'
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Operation cancelled.${NC}"
    exit 0
fi

# Update imports in all files in ./apps and ./libs
all_files=$(find ./apps ./libs -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \))

for file in $all_files; do
    tmpfile="${file}.tmp_cascade"
    cp "$file" "$tmpfile"
    for i in "${!old_files[@]}"; do
        old="${old_files[$i]}"
        new="${new_files[$i]}"
        old_rel=${old#./}
        new_rel=${new#./}
        old_base=$(basename "$old" | sed 's/\.[^.]*$//')
        new_base=$(basename "$new" | sed 's/\.[^.]*$//')
        old_rel_noext="${old_rel%.*}"
        new_rel_noext="${new_rel%.*}"
        # Escape for sed
        old_rel_esc=$(escape_for_sed "$old_rel_noext")
        new_rel_esc=$(escape_for_sed "$new_rel_noext")
        old_base_esc=$(escape_for_sed "$old_base")
        new_base_esc=$(escape_for_sed "$new_base")
        # from './fooBar'
        sed -i '' "s|from \\(['\"][^'\"]*/\\)${old_base_esc}\\(['\"]\)|from \\1${new_base_esc}\\2|g" "$tmpfile"
        # from '../libs/fooBar/something'
        sed -i '' "s|from \\(['\"].*\\)${old_rel_esc}\\(['\"]\)|from \\1${new_rel_esc}\\2|g" "$tmpfile"
        # require('./fooBar')
        sed -i '' "s|require(\\(['\"][^'\"]*/\\)${old_base_esc}\\(['\"]\))|require(\\1${new_base_esc}\\2)|g" "$tmpfile"
        # dynamic import('./fooBar')
        sed -i '' "s|import(\\(['\"][^'\"]*/\\)${old_base_esc}\\(['\"]\))|import(\\1${new_base_esc}\\2)|g" "$tmpfile"
    done
    if ! cmp -s "$file" "$tmpfile"; then
        mv "$tmpfile" "$file"
        echo -e "  ${GREEN}Updated imports in: $file${NC}"
    else
        rm -f "$tmpfile"
    fi
done

echo -e "${YELLOW}Renaming files...${NC}"
for i in "${!old_files[@]}"; do
    old="${old_files[$i]}"
    new="${new_files[$i]}"
    if [ -f "$old" ]; then
        mv "$old" "$new"
        echo -e "  ${GREEN}Renamed: $old -> $new${NC}"
    else
        echo -e "  ${RED}File not found: $old${NC}"
    fi
done

echo -e "${GREEN}=== All done! ===${NC}"
echo -e "- Renamed ${#camelcase_files[@]} files from camelCase to kebab-case"
echo -e "- Updated import statements in all TypeScript/JavaScript files in ./apps and ./libs"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Test your application to ensure everything works"
echo -e "2. Run your linter/formatter if needed"
echo -e "3. Commit the changes to git"
echo -e "${BLUE}If you encounter any issues:${NC}"
echo -e "- Check git status to see all changes: ${GREEN}git status${NC}"
echo -e "- Review the changes: ${GREEN}git diff${NC}"
echo -e "- If needed, you can revert: ${GREEN}git checkout .${NC}"


        # Split filename into parts by dots
        # For listQueryParams.dto.ts -> listQueryParams, dto, ts
        IFS='.' read -ra parts <<< "$filename"

        # Convert first part (the main name) from camelCase to kebab-case
        first_part="${parts[0]}"
        kebab_first_part=$(camel_to_kebab "$first_part")

        # Reconstruct filename with kebab-case first part
        new_filename="$kebab_first_part"
        for ((i=1; i<${#parts[@]}; i++)); do
            new_filename="${new_filename}.${parts[i]}"
        done

        new_file="${dir}/${new_filename}"

        file_mappings["$file"]="$new_file"
        name_mappings["$first_part"]="$kebab_first_part"
    fi
done <<< "$camelcase_files"

# Show the planned renames
echo -e "${YELLOW}Step 2: Planned renames:${NC}"
for old_file in "${!file_mappings[@]}"; do
    echo -e "  ${old_file} -> ${file_mappings[$old_file]}"
done
echo ""

# Ask for confirmation
read -p "Do you want to proceed with the renaming? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Operation cancelled.${NC}"
    exit 0
fi

echo -e "${YELLOW}Step 3: Updating import statements...${NC}"

# Find all files that might contain imports
all_files=$(find ./apps ./libs -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) 2>/dev/null)

# Update imports in all files
while IFS= read -r file; do
    if [ -n "$file" ] && [ -f "$file" ]; then
        file_updated=false

        # Create a temporary file for modifications
        temp_file=$(mktemp)
        cp "$file" "$temp_file"

        # Update imports for each renamed file
        for old_file in "${!file_mappings[@]}"; do
            # Get the first part of the filename (before first dot)
            old_filename=$(basename "$old_file")
            IFS='.' read -ra old_parts <<< "$old_filename"
            old_name="${old_parts[0]}"

            new_filename=$(basename "${file_mappings[$old_file]}")
            IFS='.' read -ra new_parts <<< "$new_filename"
            new_name="${new_parts[0]}"

            old_path_no_ext="${old_file%.*}"
            new_path_no_ext="${file_mappings[$old_file]%.*}"

            # For files like listQueryParams.dto.ts, we need to handle the full filename without final extension
            old_name_full="${old_filename%.*}"  # listQueryParams.dto
            new_name_full="${new_filename%.*}"  # list-query-params.dto

            # Remove leading ./ for consistent path handling
            old_path_clean="${old_path_no_ext#./}"
            new_path_clean="${new_path_no_ext#./}"

            # Escape special characters for sed
            old_name_escaped=$(escape_for_sed "$old_name")
            new_name_escaped=$(escape_for_sed "$new_name")
            old_name_full_escaped=$(escape_for_sed "$old_name_full")
            new_name_full_escaped=$(escape_for_sed "$new_name_full")
            old_path_escaped=$(escape_for_sed "$old_path_clean")
            new_path_escaped=$(escape_for_sed "$new_path_clean")

            # Pattern 1: Update imports that reference the full filename (with middle parts like .dto)
            # Example: from './listQueryParams.dto' -> from './list-query-params.dto'
            if sed -i.bak "s|from \(['\"][^'\"]*\/\)${old_name_full_escaped}\(['\"].*\)|from \1${new_name_full_escaped}\2|g" "$temp_file" 2>/dev/null; then
                if ! cmp -s "$file" "$temp_file"; then
                    file_updated=true
                fi
            fi

            # Pattern 2: Update imports that reference just the main name
            # Example: from './listQueryParams' -> from './list-query-params'
            if sed -i.bak "s|from \(['\"][^'\"]*\/\)${old_name_escaped}\(['\"].*\)|from \1${new_name_escaped}\2|g" "$temp_file" 2>/dev/null; then
                if ! cmp -s "$file" "$temp_file"; then
                    file_updated=true
                fi
            fi

            # Pattern 3: Update imports with full relative paths
            # Example: from '../../apps/some-app/listQueryParams.dto'
            if sed -i.bak "s|from \(['\"].*\)${old_path_escaped}\(['\"].*\)|from \1${new_path_escaped}\2|g" "$temp_file" 2>/dev/null; then
                if ! cmp -s "$file" "$temp_file"; then
                    file_updated=true
                fi
            fi

            # Pattern 4: Update require statements (full filename)
            if sed -i.bak "s|require(\\(['\"][^'\"]*\\/\\)${old_name_full_escaped}\\(['\"].*\\))|require(\\1${new_name_full_escaped}\\2)|g" "$temp_file" 2>/dev/null; then
                if ! cmp -s "$file" "$temp_file"; then
                    file_updated=true
                fi
            fi

            # Pattern 5: Update require statements (main name only)
            if sed -i.bak "s|require(\\(['\"][^'\"]*\\/\\)${old_name_escaped}\\(['\"].*\\))|require(\\1${new_name_escaped}\\2)|g" "$temp_file" 2>/dev/null; then
                if ! cmp -s "$file" "$temp_file"; then
                    file_updated=true
                fi
            fi

            # Pattern 6: Update dynamic imports (full filename)
            if sed -i.bak "s|import(\\(['\"][^'\"]*\\/\\)${old_name_full_escaped}\\(['\"].*\\))|import(\\1${new_name_full_escaped}\\2)|g" "$temp_file" 2>/dev/null; then
                if ! cmp -s "$file" "$temp_file"; then
                    file_updated=true
                fi
            fi

            # Pattern 7: Update dynamic imports (main name only)
            if sed -i.bak "s|import(\\(['\"][^'\"]*\\/\\)${old_name_escaped}\\(['\"].*\\))|import(\\1${new_name_escaped}\\2)|g" "$temp_file" 2>/dev/null; then
                if ! cmp -s "$file" "$temp_file"; then
                    file_updated=true
                fi
            fi

            # Clean up backup files
            rm -f "${temp_file}.bak"
        done

        # If file was updated, replace original with modified version
        if [ "$file_updated" = true ]; then
            mv "$temp_file" "$file"
            echo -e "  ${GREEN}Updated imports in: $file${NC}"
        else
            rm -f "$temp_file"
        fi
    fi
done <<< "$all_files"

echo ""
echo -e "${YELLOW}Step 4: Renaming files...${NC}"

# Rename the files
for old_file in "${!file_mappings[@]}"; do
    new_file="${file_mappings[$old_file]}"

    if [ -f "$old_file" ]; then
        mv "$old_file" "$new_file"
        echo -e "  ${GREEN}Renamed: $old_file -> $new_file${NC}"
    else
        echo -e "  ${RED}Warning: File not found: $old_file${NC}"
    fi
done

echo ""
echo -e "${GREEN}=== Renaming completed! ===${NC}"
echo ""
echo -e "${BLUE}Summary:${NC}"
echo -e "- Renamed ${#file_mappings[@]} files from camelCase to kebab-case"
echo -e "- Updated import statements in all TypeScript/JavaScript files"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Test your application to ensure everything works"
echo -e "2. Run your linter/formatter if needed"
echo -e "3. Commit the changes to git"
echo ""
echo -e "${BLUE}If you encounter any issues:${NC}"
echo -e "- Check git status to see all changes: ${GREEN}git status${NC}"
echo -e "- Review the changes: ${GREEN}git diff${NC}"
echo -e "- If needed, you can revert: ${GREEN}git checkout .${NC}")

if [ -z "$camelcase_files" ]; then
    echo -e "${GREEN}No camelCase files found. Nothing to rename!${NC}"
    exit 0
fi

echo -e "${GREEN}Found camelCase files:${NC}"
echo "$camelcase_files"
echo ""

# Create a mapping of old files to new files
declare -A file_mappings
declare -A name_mappings

while IFS= read -r file; do
    if [ -n "$file" ]; then
        dir=$(dirname "$file")
        filename=$(basename "$file")
        name_without_ext="${filename%.*}"
        extension="${filename##*.}"

        kebab_name=$(camel_to_kebab "$name_without_ext")
        new_filename="${kebab_name}.${extension}"
        new_file="${dir}/${new_filename}"

        file_mappings["$file"]="$new_file"
        name_mappings["$name_without_ext"]="$kebab_name"
    fi
done <<< "$camelcase_files"

# Show the planned renames
echo -e "${YELLOW}Step 2: Planned renames:${NC}"
for old_file in "${!file_mappings[@]}"; do
    echo -e "  ${old_file} -> ${file_mappings[$old_file]}"
done
echo ""

# Ask for confirmation
read -p "Do you want to proceed with the renaming? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Operation cancelled.${NC}"
    exit 0
fi

echo -e "${YELLOW}Step 3: Updating import statements...${NC}"

# Find all files that might contain imports
all_files=$(find ./apps ./libs -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) 2>/dev/null)

# Update imports in all files
while IFS= read -r file; do
    if [ -n "$file" ] && [ -f "$file" ]; then
        file_updated=false

        # Create a temporary file for modifications
        temp_file=$(mktemp)
        cp "$file" "$temp_file"

        # Update imports for each renamed file
        for old_file in "${!file_mappings[@]}"; do
            old_name=$(basename "$old_file" | sed 's/\.[^.]*$//')
            new_name="${name_mappings[$old_name]}"
            old_path_no_ext="${old_file%.*}"
            new_path_no_ext="${file_mappings[$old_file]%.*}"

            # Remove leading ./ for consistent path handling
            old_path_clean="${old_path_no_ext#./}"
            new_path_clean="${new_path_no_ext#./}"

            # Escape special characters for sed
            old_name_escaped=$(escape_for_sed "$old_name")
            new_name_escaped=$(escape_for_sed "$new_name")
            old_path_escaped=$(escape_for_sed "$old_path_clean")
            new_path_escaped=$(escape_for_sed "$new_path_clean")

            # Pattern 1: Update imports that reference the filename directly
            # Example: from './someFile' or from '../path/someFile'
            if sed -i.bak "s|from \(['\"][^'\"]*\/\)${old_name_escaped}\(['\"].*\)|from \1${new_name_escaped}\2|g" "$temp_file" 2>/dev/null; then
                if ! cmp -s "$file" "$temp_file"; then
                    file_updated=true
                fi
            fi

            # Pattern 2: Update imports with full relative paths
            # Example: from '../../apps/some-app/someFile'
            if sed -i.bak "s|from \(['\"].*\)${old_path_escaped}\(['\"].*\)|from \1${new_path_escaped}\2|g" "$temp_file" 2>/dev/null; then
                if ! cmp -s "$file" "$temp_file"; then
                    file_updated=true
                fi
            fi

            # Pattern 3: Update require statements
            if sed -i.bak "s|require(\(['\"][^'\"]*\/\)${old_name_escaped}\(['\"].*\))|require(\1${new_name_escaped}\2)|g" "$temp_file" 2>/dev/null; then
                if ! cmp -s "$file" "$temp_file"; then
                    file_updated=true
                fi
            fi

            # Pattern 4: Update dynamic imports
            if sed -i.bak "s|import(\(['\"][^'\"]*\/\)${old_name_escaped}\(['\"].*\))|import(\1${new_name_escaped}\2)|g" "$temp_file" 2>/dev/null; then
                if ! cmp -s "$file" "$temp_file"; then
                    file_updated=true
                fi
            fi

            # Clean up backup files
            rm -f "${temp_file}.bak"
        done

        # If file was updated, replace original with modified version
        if [ "$file_updated" = true ]; then
            mv "$temp_file" "$file"
            echo -e "  ${GREEN}Updated imports in: $file${NC}"
        else
            rm -f "$temp_file"
        fi
    fi
done <<< "$all_files"

echo ""
echo -e "${YELLOW}Step 4: Renaming files...${NC}"

# Rename the files
for old_file in "${!file_mappings[@]}"; do
    new_file="${file_mappings[$old_file]}"

    if [ -f "$old_file" ]; then
        mv "$old_file" "$new_file"
        echo -e "  ${GREEN}Renamed: $old_file -> $new_file${NC}"
    else
        echo -e "  ${RED}Warning: File not found: $old_file${NC}"
    fi
done

echo ""
echo -e "${GREEN}=== Renaming completed! ===${NC}"
echo ""
echo -e "${BLUE}Summary:${NC}"
echo -e "- Renamed ${#file_mappings[@]} files from camelCase to kebab-case"
echo -e "- Updated import statements in all TypeScript/JavaScript files"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Test your application to ensure everything works"
echo -e "2. Run your linter/formatter if needed"
echo -e "3. Commit the changes to git"
echo ""
echo -e "${BLUE}If you encounter any issues:${NC}"
echo -e "- Check git status to see all changes: ${GREEN}git status${NC}"
echo -e "- Review the changes: ${GREEN}git diff${NC}"
echo -e "- If needed, you can revert: ${GREEN}git checkout .${NC}"
