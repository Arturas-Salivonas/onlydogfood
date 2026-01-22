# Scoring Debug Panel - Implementation Guide

## What Was Added

I've added a comprehensive **Scoring Debug Panel** to every product page that shows:

### ✅ Complete Scoring Breakdown

1. **Visual Score Summary**
   - Ingredient Quality: X/45 points (with progress bar)
   - Nutritional Value: X/33 points (with progress bar)
   - Value for Money: X/22 points (with progress bar)

2. **Detailed Point Calculation by Section**
   - Every single scoring component
   - Positive points shown in green with ↗ icon
   - Negative penalties shown in red with ↘ icon
   - Clear labels explaining what each point is for

3. **Ingredient Quality (45 points) - Shows:**
   - Effective meat content (15 pts max)
   - Protein diversity NEW! (5 pts max)
     - Shows diversity level (exceptional/excellent/good/moderate/single-source)
     - Lists all protein sources found
     - Shows unique protein type count
   - Low-value fillers & carbs (10 pts max)
     - Individual penalties for each grain type
     - **GRAIN PENALTIES CLEARLY HIGHLIGHTED:**
       - "⚠️ HIGH-GI GRAIN AS #1 INGREDIENT" (-8 pts)
       - "⚠️ MULTIPLE HIGH-GI GRAINS IN TOP 5" (-7 pts)
       - Brown rice penalties (-1 to -4 pts)
   - Artificial additives (10 pts max)
   - Named meat sources (5 pts max)
   - Ingredient-level bonus/penalty

4. **Nutritional Value (33 points) - Shows:**
   - Protein quality with plant protein penalties
   - Fat content scoring
   - Carbohydrate load
   - Fiber & micronutrients

5. **Value for Money (22 points) - Shows:**
   - Price competitiveness
   - Ingredient value

6. **Red Flags Section**
   - Lists all detected red flags in red alert box
   - Shows grain warnings
   - Shows additive warnings

## Where to Find It

On every product page (e.g., `/dog-food/product-slug`), the debug panel appears:
- Below the "Our scoring algorithm" section
- In the main scoring section
- **Expanded by default** so you can immediately see all details
- Click sections to collapse/expand individual categories

## Why Products with 20%+ Rice Are Scoring 90+

**The issue:** Products haven't been recalculated with the new v3.0 algorithm yet!

### To Fix This:

```bash
# Run this to update ALL product scores with v3.0 algorithm
npm run recalculate-scores

# Or check which products are problematic first
npx tsx scripts/check-grain-heavy-scores.ts
```

## What You'll See After Recalculation

### Example: AVA Medium Breed Puppy (grain-heavy)

**BEFORE (v2.x):**
- Score: 96/100
- Brown rice penalty: 0 points
- Maize penalty: -1 point
- No diversity penalty

**AFTER (v3.0):**
- Score: ~75-80/100
- Brown rice penalty: -1 to -4 points
- Maize penalty: -2 points
- Multiple grains in top 5: **-7 points**
- Single protein source: 0 diversity points
- **Debug panel will show all these penalties clearly!**

### Example: Orijen Fit & Trim (premium multi-protein)

**BEFORE (v2.x):**
- Score: 69/100
- No diversity bonus
- Fresh meat penalty applied

**AFTER (v3.0):**
- Score: ~85-90/100
- **Protein diversity: +5 points** (6+ sources, exceptional)
- No fresh meat penalty
- Detailed breakdown showing all protein sources found

## Using the Debug Panel

### To Understand a Score:

1. **Visit any product page**
2. **Scroll to "Scoring Breakdown (Debug Mode)"**
3. **Check each section:**
   - Green numbers = points earned
   - Red numbers = penalties applied
   - See exact calculations

### What to Look For:

**High Rice/Grain Content:**
```
C) Low-Value Fillers & Carbs (10 pts)
  Base filler score: +8.0
  Low-value carb penalty (corn/maize/wheat): -4.0
  Brown rice penalty: -1.0
  ⚠️ MULTIPLE HIGH-GI GRAINS IN TOP 5: -7.0
```

**Low Protein Diversity:**
```
B) Protein Source Diversity (5 pts)
  Diversity bonus: +0.0

  Level: single-source
  Protein Types: 1
  Total Sources: 1
  Sources: chicken
```

**Premium Multi-Protein:**
```
B) Protein Source Diversity (5 pts)
  Diversity bonus: +5.0

  Level: exceptional
  Protein Types: 3
  Total Sources: 8
  Sources: chicken, turkey, salmon, herring, mackerel, sardine, eggs, beef
```

## Files Modified

1. **`components/features/ScoringDebugPanel.tsx`** (NEW)
   - Complete debug panel component
   - Expandable sections
   - Color-coded scoring
   - Red flag alerts

2. **`components/features/ProductDetail.tsx`**
   - Imported ScoringDebugPanel
   - Added after algorithm transparency section
   - Updated algorithm version to v3.0.0

3. **`scripts/check-grain-heavy-scores.ts`** (NEW)
   - Helper script to identify problematic products
   - Shows which need recalculation
   - Lists grain-heavy high scorers
   - Lists premium low scorers

## Next Steps

1. **Recalculate all scores:**
   ```bash
   npm run recalculate-scores
   ```

2. **Check a few products manually:**
   - AVA Medium Breed Puppy (should drop to ~75-80)
   - Orijen Fit & Trim (should rise to ~85-90)
   - Any product with brown rice or maize in top 3

3. **Verify the debug panel shows correct information:**
   - All penalties are shown
   - Diversity calculations are correct
   - Red flags appear properly

## Screenshot Guide

When you load a product page, you'll see:

```
┌─────────────────────────────────────────────────────┐
│ Scoring Breakdown (Debug Mode)              96/100 │
│ Algorithm v3.0.0 - Detailed point calculation      │
├─────────────────────────────────────────────────────┤
│                                                     │
│ [Ingredient Quality]  [Nutritional Value]  [Value] │
│    38.5/45               31.0/33            22/22  │
│    ████████░░ 86%        ███████░░ 94%      █████  │
│                                                     │
│ ▼ Ingredient Quality                       38.5/45 │
│   ▼ A) Effective Meat Content (15 pts)             │
│      ↗ Base meat points              +14.0         │
│      Meat %: 72.0% | Effective: 72.0%              │
│                                                     │
│   ▼ B) Protein Source Diversity (5 pts)            │
│      ↗ Diversity bonus               +0.0          │
│      Level: single-source                          │
│      Protein Types: 1 | Total Sources: 1           │
│      Sources: chicken                              │
│                                                     │
│   ▼ C) Low-Value Fillers & Carbs (10 pts)         │
│      ↗ Base filler score             +4.0          │
│      ↘ Low-value carb penalty        -4.0          │
│      ↘ Brown rice penalty            -1.0          │
│      ↘ ⚠️ MULTIPLE HIGH-GI GRAINS    -7.0         │
│         IN TOP 5                                   │
└─────────────────────────────────────────────────────┘
```

This makes it **crystal clear** exactly why each product got its score!

## Troubleshooting

**Q: Debug panel shows "No Scoring Data Available"**
A: Product hasn't been scored yet. Run `npm run recalculate-scores`

**Q: Algorithm version shows 2.x instead of 3.0.0**
A: Scores are outdated. Run recalculation script.

**Q: Grain penalties not showing up**
A: Check if product has been recalculated with v3.0 algorithm.

---

**Status:** ✅ Ready to use
**Version:** 3.0.0
**Date:** January 16, 2026
