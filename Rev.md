# Reversal Alert Implementation Plan

## Overview

Add a "possible reversal" visual alert whenever the daily midpoint price deviates by ≥ 10% from the 50-day moving average (MA50). The deviation is calculated as:

```
deviation (%) = |midpoint − MA50| / MA50 × 100
```

If `deviation >= 10`, the bar is flagged as a potential reversal.

---

## Files to modify

### 1. `js/constants.js`

Add a new constant for the reversal threshold:

```js
const REVERSAL_THRESHOLD = 0.10; // 10 % deviation from MA50
```

---

### 2. `js/render-chart.js`

All changes are inside the `renderChart(rows)` function.

#### Step A — Detect reversal bars

After `ma50Data` is computed (and before the color arrays), build a boolean array:

```js
const isReversal = midData.map((mid, idx) => {
  const ma = ma50Data[idx];
  if (!ma || ma === 0) return false;
  return Math.abs(mid - ma) / ma >= REVERSAL_THRESHOLD;
});
```

#### Step B — Update bar colors

Extend the existing `barColors` / `borderColors` logic to give reversal bars a distinct color (suggested: magenta / `#c678dd`) while keeping the min/max alert colors with higher priority:

```js
const barColors = rows.map((r, i) => {
  if (r.min < MIN_ALERT)   return 'rgba(248,81,73,.65)';
  if (r.max > MAX_ALERT)   return 'rgba(210,153,34,.65)';
  if (isReversal[i])       return 'rgba(198,120,221,.65)'; // reversal
  return 'rgba(56,139,253,.65)';
});

const borderColors = rows.map((r, i) => {
  if (r.min < MIN_ALERT)   return '#f85149';
  if (r.max > MAX_ALERT)   return '#d29922';
  if (isReversal[i])       return '#c678dd'; // reversal
  return '#388bfd';
});
```

#### Step C — Add reversal line to the `refLines` plugin

Inside the `afterDraw` loop, draw a small triangle or marker above each reversal bar:

```js
// After drawing MIN_ALERT / MAX_ALERT reference lines:
midData.forEach((mid, idx) => {
  if (!isReversal[idx]) return;
  const xPos = chart.scales.x.getPixelForValue(idx);
  const yPos = chart.scales.y.getPixelForValue(maxData[idx]);
  ctx.save();
  ctx.fillStyle = '#c678dd';
  ctx.font = "bold 12px 'IBM Plex Mono'";
  ctx.textAlign = 'center';
  ctx.fillText('▲', xPos, yPos - 8); // marker above the bar
  ctx.restore();
});
```

#### Step D — Extend the tooltip

Inside `callbacks.label`, append an alert line when `isReversal[idx]` is true:

```js
if (isReversal[idx]) {
  const dev = (((midData[idx] - ma50Data[idx]) / ma50Data[idx]) * 100).toFixed(1);
  const dir = midData[idx] > ma50Data[idx] ? 'por encima' : 'por debajo';
  alerts.push(`⚠ posible reversión: ${dev}% ${dir} de MA50`);
}
```

---

### 3. `index.html` — Chart legend

Add a new legend item for the reversal alert inside `.chart-legend`:

```html
<span>
  <span class="legend-bar" style="background:#c678dd"></span>
  Posible reversión (±10% MA50)
</span>
```

---

## Summary of changes

| File | Change |
|---|---|
| `constants.js` | Add `REVERSAL_THRESHOLD = 0.10` |
| `render-chart.js` | Compute `isReversal[]`; update bar/border colors; draw `▲` markers in `refLines` plugin; extend tooltip alerts |
| `index.html` | Add magenta legend entry for reversals |

No new files are required. No changes to CSS, storage, or metrics logic.
