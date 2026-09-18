# GitHub Actions workflows (optional)

These two workflows are ready to use but are parked here because the access token used for the
first push did not have the `workflow` scope that GitHub requires to create workflow files.

- `ci.yml` — typecheck, lint, format check, unit tests, build and the Playwright suite on every push and pull request.
- `pages.yml` — publishes `apps/web/dist` (app, embed page, SDK demo) to GitHub Pages on every push to `main`.

To enable them, copy both files into `.github/workflows/` (create the folder) and push, either
from a token that has the `workflow` scope or through the GitHub web editor. For Pages, also open
**Settings → Pages** and set **Source** to "GitHub Actions".
