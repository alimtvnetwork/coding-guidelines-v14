# Quality, Offline, and Accessibility

**Version:** 1.0.0

---

## Offline guarantees (hard requirements)

The `dist.zip` artifact must satisfy ALL of these. The package script enforces
each one and fails the build if any check fails.

| # | Requirement | Verification |
|---|-------------|--------------|
| 1 | No `http://` or `https://` URL anywhere in `dist/` (HTML, JS, CSS) | `grep -rE 'https?://' dist/ \| grep -v UFL-1.0.txt` returns empty |
| 2 | No `<link rel="preconnect">` or `<link rel="dns-prefetch">` | grep `index.html` |
| 3 | All `<script>` and `<link>` tags use relative paths starting with `./` | grep `index.html` |
| 4 | All `@font-face src:` declarations use `./fonts/...` | grep `dist/assets/*.css` |
| 5 | Opening `dist/index.html` from `file://` shows the title slide within 1s | manual test (or Playwright run with `file://` URL) |
| 6 | Total `dist/` size ≤ 5 MB | `du -sh dist/` |
| 7 | Total `dist.zip` size ≤ 3 MB | `ls -lh dist.zip` |

## Browser support

Target the trainer's likely browsers. Drop legacy support for smaller bundle.

| Browser | Min version | Tested? |
|---------|-------------|---------|
| Chrome / Edge | 110 | required |
| Firefox | 110 | required |
| Safari | 16.4 | required |
| IE / old Edge | — | NOT supported (refuse with a friendly message) |

Set Vite `build.target = 'es2022'` and skip legacy polyfills.

## Accessibility (a11y)

| Rule | How |
|------|-----|
| Keyboard navigation works without a mouse | Arrow keys, Space, F, G, Esc, Home, End |
| Focus ring visible on all interactive controls | `:focus-visible` outline 2px primary |
| Sufficient contrast (WCAG AA) | All text meets 4.5:1 against its background |
| Reduced motion respected | `@media (prefers-reduced-motion: reduce)` zeros out all animation |
| Screen reader announces slide changes | `aria-live="polite"` region announces "Slide X of Y: <title>" |
| Code blocks are real `<pre><code>`, not divs | Shiki output preserves semantic HTML |
| All icons have `aria-label` or `aria-hidden="true"` | enforced via lint |

## Performance budget

| Metric | Budget |
|--------|--------|
| Time to first slide visible (file://) | < 800ms |
| Slide-to-slide transition (cold) | < 100ms |
| Memory footprint after viewing all 13 slides | < 200 MB |
| Initial JS payload (gzipped equivalent) | < 250 KB (no gzip on file://, but a sensible upper bound) |

## Testing strategy

**Unit:** Each slide component renders without throwing (`@testing-library/react`).

**Visual regression:** Playwright opens `dist/index.html` from `file://`,
navigates to each slide, takes a screenshot, diffs against
`tests/__snapshots__/`. Failure on >0.5% pixel diff.

**Offline contract:** A bash script in CI:

```bash
cd slides-app && bun run build && bun run package
# Verify the offline contract
! grep -rE 'https?://' dist/ --include='*.html' --include='*.js' --include='*.css'
[ "$(du -sb dist | cut -f1)" -lt 5242880 ]
[ "$(stat -c%s dist.zip)" -lt 3145728 ]
```

**Manual smoke test:** Before each release, the author unzips `dist.zip` on a
fresh machine WITH NETWORK DISABLED and confirms all 13 slides render with full
typography and animations.

## Documentation deliverables

When implementation lands, these files become required:

- `slides-app/README.md` — setup, build, package, troubleshoot
- `slides-app/CHANGELOG.md` — semver per the main repo's release cadence
- `dist/README.txt` — end-user usage (see
  [06-build-and-zip-pipeline.md](./06-build-and-zip-pipeline.md))

## Cross-references

- Build pipeline (where the offline checks run): [06-build-and-zip-pipeline.md](./06-build-and-zip-pipeline.md)
- Architecture (Vite `base: './'` + bundled fonts): [01-architecture.md](./01-architecture.md)
