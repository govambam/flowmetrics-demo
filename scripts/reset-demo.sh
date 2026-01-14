#!/bin/bash

set -e

echo "🧹 Resetting demo environment..."
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

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

# Switch to main if we're on demo-bugs
if [ "$CURRENT_BRANCH" = "demo-bugs" ]; then
    echo "Switching from demo-bugs to main..."
    git checkout main
fi

# Close any open PRs for demo-bugs branch using gh CLI
if command -v gh &> /dev/null; then
    echo "Checking for open PRs on demo-bugs branch..."

    # Get PR number if exists
    PR_NUMBER=$(gh pr list --head demo-bugs --json number --jq '.[0].number' 2>/dev/null || true)

    if [ -n "$PR_NUMBER" ] && [ "$PR_NUMBER" != "null" ]; then
        echo "Closing PR #$PR_NUMBER..."
        gh pr close "$PR_NUMBER" --comment "Closing for demo reset" 2>/dev/null || echo -e "${YELLOW}Note: Could not close PR${NC}"
        echo -e "${GREEN}✓ PR #$PR_NUMBER closed${NC}"
    else
        echo "No open PRs found for demo-bugs branch"
    fi
else
    echo -e "${YELLOW}Note: GitHub CLI (gh) not installed. Skipping PR cleanup.${NC}"
fi

# Delete local demo-bugs branch if it exists
if git show-ref --verify --quiet refs/heads/demo-bugs; then
    echo "Deleting local demo-bugs branch..."
    git branch -D demo-bugs
    echo -e "${GREEN}✓ Local branch deleted${NC}"
else
    echo "No local demo-bugs branch found"
fi

# Delete remote demo-bugs branch if it exists
echo "Checking for remote demo-bugs branch..."
if git ls-remote --heads origin demo-bugs 2>/dev/null | grep -q demo-bugs; then
    echo "Deleting remote demo-bugs branch..."
    git push origin --delete demo-bugs 2>/dev/null || echo -e "${YELLOW}Note: Could not delete remote branch${NC}"
    echo -e "${GREEN}✓ Remote branch deleted${NC}"
else
    echo "No remote demo-bugs branch found"
fi

# Print success message
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Demo reset complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo "The demo environment has been cleaned up:"
echo "  • Local demo-bugs branch deleted"
echo "  • Remote demo-bugs branch deleted"
echo "  • Any open PRs closed"
echo ""
echo "To start a fresh demo:"
echo -e "  ${YELLOW}npm run create-demo${NC}"
echo ""
