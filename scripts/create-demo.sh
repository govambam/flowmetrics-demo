#!/bin/bash

set -e

echo "🚀 Creating demo branch with intentional bugs..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in a git repo
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo -e "${RED}Error: Not in a git repository${NC}"
    exit 1
fi

# Check if gh CLI is available (required for PR creation)
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is required but not installed.${NC}"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    echo -e "${RED}Error: You have uncommitted changes. Please commit or stash them first.${NC}"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

# Ensure we're on main
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "Switching to main branch..."
    git checkout main
fi

# Pull latest changes
echo "Pulling latest changes from main..."
git pull origin main 2>/dev/null || echo -e "${YELLOW}Note: Could not pull from origin (may not exist yet)${NC}"

# Delete local demo-bugs branch if it exists
if git show-ref --verify --quiet refs/heads/demo-bugs; then
    echo "Deleting existing local demo-bugs branch..."
    git branch -D demo-bugs
fi

# Create and checkout demo-bugs branch
echo "Creating demo-bugs branch..."
git checkout -b demo-bugs

# Introduce Bug 1: Wrong array method in deleteTask
# Change: tasks.filter(task => task.id !== id)  →  tasks.find(task => task.id !== id)
echo "Introducing Bug 1: Wrong array method in deleteTask..."
sed -i '' 's/setTasks(tasks\.filter(task => task\.id !== id))/setTasks(tasks.find(task => task.id !== id))/' app/page.tsx

# Introduce Bug 2: Inverted logic in activeCount
# Change: !task.completed  →  task.completed
echo "Introducing Bug 2: Inverted logic in activeCount..."
sed -i '' 's/const activeCount = tasks\.filter(task => !task\.completed)\.length/const activeCount = tasks.filter(task => task.completed).length/' app/page.tsx

# Verify bugs were introduced
echo ""
echo "Verifying bugs were introduced..."

BUG1=$(grep -c "tasks.find(task => task.id !== id)" app/page.tsx || true)
BUG2=$(grep -c "tasks.filter(task => task.completed).length" app/page.tsx || true)

if [ "$BUG1" -eq 0 ] || [ "$BUG2" -eq 0 ]; then
    echo -e "${RED}Error: Failed to introduce all bugs. Rolling back...${NC}"
    git checkout -- app/page.tsx
    git checkout main
    git branch -D demo-bugs
    exit 1
fi

echo -e "${GREEN}✓ All 2 bugs successfully introduced${NC}"

# Stage and commit changes
echo ""
echo "Committing changes..."
git add app/page.tsx
git commit -m "feat: Add task sorting and improved filtering

- Optimized delete task function
- Improved active task counting"

# Push to origin
echo ""
echo "Pushing demo-bugs branch to origin..."
if git push -u origin demo-bugs 2>/dev/null; then
    echo -e "${GREEN}✓ Branch pushed successfully${NC}"
else
    echo -e "${RED}Error: Could not push to origin. Please set up the remote first.${NC}"
    exit 1
fi

# Create Pull Request
echo ""
echo "Creating Pull Request..."
gh pr create --base main --head demo-bugs \
  --title "feat: Add task sorting and improved filtering" \
  --body "This PR improves task management with better delete and counting logic." \
  --web

# Print success message
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Demo setup complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo "What was created:"
echo "  • Branch 'demo-bugs' pushed to GitHub"
echo "  • Pull Request created and opened in browser"
echo ""
echo "Bugs introduced:"
echo "  1. Wrong array method in deleteTask (line ~97)"
echo "     tasks.find()  (should be .filter())"
echo ""
echo "  2. Inverted logic in activeCount (line ~106)"
echo "     task.completed  (should be !task.completed)"
echo ""
echo -e "To reset the demo later: ${YELLOW}npm run reset-demo${NC}"
echo ""
