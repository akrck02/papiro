#!/bin/sh
# Publish again every wiki made with papiro-deploy, so all of them use the
# latest papiro. It runs the docs workflow of each repository of the owner
# whose workflows use papiro-deploy (they need a workflow_dispatch trigger).
#
#   bin/republish-docs.sh             # the owner of this repository
#   bin/republish-docs.sh akrck02
#   DRY_RUN=1 bin/republish-docs.sh   # only lists them
#
# Needs gh, logged in with permission to run workflows in those repositories.
set -e

owner=${1:-$(gh repo view --json owner -q .owner.login)}

gh repo list "$owner" -L 400 --no-archived --json name -q '.[].name' | while read -r repo; do
	[ "$repo" = "papiro" ] && continue
	gh api "repos/$owner/$repo/contents/.github/workflows" -q '.[].path' 2>/dev/null | while read -r path; do
		if gh api "repos/$owner/$repo/contents/$path" -q .content | base64 -d | grep -q "papiro-deploy"; then
			workflow=$(basename "$path")
			if [ -n "$DRY_RUN" ]; then
				echo "would publish again: $repo ($workflow)"
			elif gh workflow run "$workflow" -R "$owner/$repo" 2>/dev/null; then
				echo "published again: $repo ($workflow)"
			else
				echo "could not run $repo ($workflow): does it have a workflow_dispatch trigger?"
			fi
		fi
	done
done
