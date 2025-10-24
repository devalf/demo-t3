# Build Analysis Tools

Scripts for analyzing production bundle sizes and performance.

## Files

- **analyze-bundle.js** - Analyzes build output and generates summary reports

## Usage

### Analyze Current Build

```bash
yarn analyze:client
```

This will:
1. Build `client-mx` in production mode
2. Generate timestamped reports in `dist/analysis/bundle/`
3. Display CLI summary with key metrics
4. Open interactive HTML report in browser

### View Reports

List all reports:
```bash
ls -lht dist/analysis/bundle/
```

Open specific report:
```bash
open dist/analysis/bundle/bundle-report-2025-10-24T07-48-59.html
```

## Output Files

All reports are saved to `dist/analysis/bundle/` with timestamps:

- `bundle-report-YYYY-MM-DDTHH-MM-SS.html` - Interactive treemap visualization
- `bundle-stats-YYYY-MM-DDTHH-MM-SS.json` - Raw webpack stats (large file)
- `summary-YYYY-MM-DDTHH-MM-SS.json` - Compact summary with key metrics
