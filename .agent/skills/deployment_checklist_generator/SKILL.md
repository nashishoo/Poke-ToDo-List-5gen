---
name: Deployment Checklist Generator
description: Generates a pre-deployment checklist and a GitHub Actions workflow for production readiness.
---

# Deployment Checklist Generator

## Pre-Deployment Checklist

### Code Quality
- [ ] All CI checks passing
- [ ] 2+ reviewer approvals
- [ ] No critical bugs
- [ ] Security scans passed
- [ ] Performance tests passed

### Dependencies
- [ ] All dependencies up-to-date
- [ ] Zero high/critical vulnerabilities
- [ ] Bundle size within budget
- [ ] 3rd party services confirmed operational

### Infrastructure
- [ ] Server capacity verified
- [ ] SSL certificates valid
- [ ] Load balancer configured
- [ ] CDN cache invalidation plan

### Documentation
- [ ] Changelog updated
- [ ] API docs updated
- [ ] Deployment notes prepared
- [ ] Rollback instructions ready

## GitHub Actions Workflow

Create a file at `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production
on:
  workflow_dispatch:

jobs:
  pre-deploy-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check branch
        run: |
          if [ "${{ github.ref }}" != "refs/heads/main" ]; then
            echo "❌ Can only deploy from main branch"
            exit 1
          fi
      - name: Verify CI passed
        uses: actions/github-script@v7
        with:
          script: |
            const checks = await github.rest.checks.listForRef({
              owner: context.repo.owner,
              repo: context.repo.repo,
              ref: context.sha,
            });
            const failed = checks.data.check_runs.filter(
              check => check.conclusion === 'failure'
            );
            if (failed.length > 0) {
              throw new Error('CI checks must pass before deployment');
            }
```
