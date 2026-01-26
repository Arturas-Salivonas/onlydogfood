# v5.0 Implementation Status

## ✅ COMPLETED

### 1. Core Configuration (config.ts)
- ✅ Updated SCORING_WEIGHTS to 52/33/15
- ✅ Updated INGREDIENT_SCORING maximums
- ✅ Updated VALUE_SCORING to 10/5
- ✅ Changed algorithm version to 5.0.0
- ✅ Added all new v5.0 constants:
  - PROTEIN_RANGES (formula-specific)
  - MEAT_THRESHOLDS
  - ASH_THRESHOLDS
  - TOP_5_MEAT_DENSITY
  - CARB_SOURCES
  - POTATO_FORMS / PEA_FORMS
  - ORGAN_MEATS
  - WHOLE_PREY_INDICATORS
  - GENERIC_PROTEINS

### 2. Ingredient Database (ingredient-scoring.json)
- ✅ Complete 7-tier meat quality system:
  - Tier 1: RAW_WHOLE_PROTEINS (+6 points) - "raw whole herring", etc.
  - Tier 1: FRESH_ORGAN_MEATS (+6 points) - "fresh chicken giblets", etc.
  - Tier 2: RAW_SINGLE_PROTEINS (+5 points) - "raw chicken", etc.
  - Tier 2: FRESH_MEATS_PREMIUM (+5 points) - "fresh chicken", etc.
  - Tier 2: DEHYDRATED_MEATS_PREMIUM (+5 points) - "dehydrated chicken", etc.
  - Tier 3: FRESHLY_PREPARED_MEATS (+4 points) - "freshly prepared chicken", etc.
  - Tier 4: DRIED_MEATS_STANDARD (+3 points) - "dried chicken", etc.
  - Tier 5: NAMED_MEAT_MEALS (+2 points) - "chicken meal", etc.
  - Tier 7: UNNAMED_PROTEINS (-5 points) - "meat meal", "poultry meal"
- ✅ All categories properly structured with descriptions
- ✅ Backup created (ingredient-scoring.json.v4-backup)

### 3. Helper Functions (calculator.ts)
- ✅ Added v5.0 imports
- ✅ detectFormulaType() - detects weight management/active/puppy/senior
- ✅ calculateTop5MeatDensity() - Phase 1 Critical (+10 bonus for 100% meat)
- ✅ calculateCarbPositionPenalty() - Phase 1 Critical (-8 for carbs in #1-2)
- ✅ calculateMeatThresholdPenalty() - Phase 1 Critical (<20% = fail)
- ✅ calculateAshPenalty() - Phase 1 Critical (>8% ash = -5)
- ✅ detectPotatoPeaManipulation() - Phase 1 Critical (detects forms)
- ✅ calculateWholePreyOrganBonus() - whole prey +3, organs +2
- ✅ Enhanced calculateProteinDiversity() - 0-8 scale (was 0-5)

## 🚧 IN PROGRESS / TODO

### 4. Integrate v5.0 Features into calculateIngredientScore()
**STATUS**: Function exists but needs integration of new features

**Required Changes**:
```typescript
// After existing setup (line ~770):
const ingredientTokens = tokenizeIngredients(ingredientsText);

// ADD v5.0 calculations:
const top5MeatDensity = calculateTop5MeatDensity(ingredientTokens);
const carbPositionPenalty = calculateCarbPositionPenalty(ingredientTokens);
const meatThreshold = calculateMeatThresholdPenalty(meatPercent);
const ashPenalty = calculateAshPenalty(product.ash_percent || null);
const potatoPeaManipulation = detectPotatoPeaManipulation(ingredientTokens);
const wholePreyOrganBonus = calculateWholePreyOrganBonus(ingredientTokens);

// Update protein diversity to use new scale (already done in function):
const proteinDiversity = calculateProteinDiversity(ingredientsText, ingredientsList);
// proteinDiversity.points now returns 0-8 instead of 0-5

// Apply all v5.0 bonuses/penalties to score:
score += top5MeatDensity.bonus;
score += meatThreshold.bonus;
score -= meatThreshold.penalty;
score -= carbPositionPenalty.penalty;
score += ashPenalty.bonus;
score -= ashPenalty.penalty;
score -= potatoPeaManipulation.penalty;
score += wholePreyOrganBonus.bonus;

// Store in details for transparency:
details.top5MeatDensity = top5MeatDensity.meatCount;
details.top5MeatBonus = top5MeatDensity.bonus;
details.carbPositionPenalty = -carbPositionPenalty.penalty;
details.carbsInTop5 = carbPositionPenalty.carbsInTop5;
details.meatThreshold = meatThreshold.threshold;
details.meatThresholdAdjustment = meatThreshold.bonus - meatThreshold.penalty;
details.ashContent = product.ash_percent;
details.ashPenalty = ashPenalty.penalty - ashPenalty.bonus;
details.potatoPeaManipulation = potatoPeaManipulation.details;
details.wholePreyOrganBonus = wholePreyOrganBonus.bonus;
details.hasWholePrey = wholePreyOrganBonus.hasWholePrey;
details.hasOrganMeats = wholePreyOrganBonus.hasOrganMeats;

// Apply hard cap if meat < 20%:
if (meatThreshold.capScore !== null && score > meatThreshold.capScore) {
  score = meatThreshold.capScore;
  details.meatThresholdCapApplied = true;
}

// Final bounds check (now 0-52 instead of 0-45):
score = Math.max(0, Math.min(SCORING_WEIGHTS.INGREDIENT_QUALITY, score));
```

**Location**: Line ~1090 (before final return statement)

### 5. Update calculateNutritionScore() for Formula-Specific Protein Ranges
**STATUS**: Function exists but needs formula detection

**Required Changes**:
```typescript
// At start of function (after DM calculation):
const formulaType = detectFormulaType(product);
const proteinRange = PROTEIN_RANGES[formulaType];

// Replace OPTIMAL_RANGES.PROTEIN with proteinRange:
// OLD: if (proteinDM >= OPTIMAL_RANGES.PROTEIN.min && proteinDM <= OPTIMAL_RANGES.PROTEIN.max)
// NEW: if (proteinDM >= proteinRange.min && proteinDM <= proteinRange.max)

// Also add formula type to details:
details.formulaType = formulaType;
details.proteinRange = proteinRange;

// Fix overflow bug - add hard caps:
proteinPoints = Math.min(proteinPoints, NUTRITION_SCORING.PROTEIN_QUALITY); // 15 max
fatPoints = Math.min(fatPoints, NUTRITION_SCORING.MODERATE_FAT); // 8 max
carbPoints = Math.min(carbPoints, NUTRITION_SCORING.LOW_CARBS); // 7 max
microPoints = Math.min(microPoints, NUTRITION_SCORING.FIBER_AND_MICRO); // 3 max

const totalScore = proteinPoints + fatPoints + carbPoints + microPoints;
const cappedScore = Math.min(totalScore, SCORING_WEIGHTS.NUTRITIONAL_VALUE); // 33 max
```

**Location**: Lines ~1132-1300

### 6. Update calculateValueScore() to Use New Maximums
**STATUS**: Function structure correct, just needs max value updates

**Required Changes**:
```typescript
// Update max calculations to use new VALUE_SCORING:
// OLD: const maxPriceScore = 15;
// NEW: const maxPriceScore = VALUE_SCORING.PRICE_PER_FEED; // 10

// OLD: const maxQualityValue = 7;
// NEW: const maxQualityValue = VALUE_SCORING.INGREDIENT_VALUE; // 5

// Total max = 10 + 5 = 15 (matches SCORING_WEIGHTS.VALUE_FOR_MONEY)
```

**Location**: Lines ~1404-1500

### 7. Create v5.0 Test Script
**STATUS**: Need to create

```typescript
// File: scripts/test-v5-features.ts
import { calculateOverallScore } from '../scoring/calculator';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testProduct(slug: string, expectedFeatures: any) {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!data) {
    console.log(`❌ Product not found: ${slug}`);
    return;
  }

  const result = calculateOverallScore(data);
  const details = result.breakdown.details as any;

  console.log(`\n=== ${data.name} ===`);
  console.log(`Overall Score: ${Math.round(result.overallScore)}/100`);
  console.log(`Ingredient Quality: ${Math.round(result.ingredientScore)}/52`);
  console.log(`Nutritional Value: ${Math.round(result.nutritionScore)}/33`);
  console.log(`Value for Money: ${Math.round(result.valueScore)}/15`);
  console.log(`\nv5.0 Features:`);
  console.log(`  Top 5 Meat Density: ${details.top5MeatDensity}/5 (${details.top5MeatBonus} points)`);
  console.log(`  Protein Diversity: ${details.proteinDiversity}/8`);
  console.log(`  Carb Position Penalty: ${details.carbPositionPenalty || 0}`);
  console.log(`  Meat Threshold: ${details.meatThreshold} (${details.meatThresholdAdjustment})`);
  console.log(`  Ash Penalty: ${details.ashPenalty || 0}`);
  console.log(`  Whole Prey: ${details.hasWholePrey ? 'YES' : 'NO'}`);
  console.log(`  Organ Meats: ${details.hasOrganMeats ? 'YES' : 'NO'}`);
}

async function main() {
  console.log('🔬 v5.0 ALGORITHM TEST\n');

  await testProduct('orijen-fit-trim', {
    expectedTop5Meat: 5,
    expectedProteinDiversity: 7,
    expectedWholePrey: true,
  });

  await testProduct('ci-mighty-meaty', {
    expectedTop5Meat: 3,
    expectedCarbPenalty: true,
  });

  console.log('\n✅ Test complete');
}

main().catch(console.error);
```

## 📋 IMPLEMENTATION CHECKLIST

- [x] Update scoring weights (52/33/15)
- [x] Update algorithm version to 5.0.0
- [x] Add all v5.0 constants to config.ts
- [x] Create 7-tier meat quality ingredient-scoring.json
- [x] Add all v5.0 helper functions
- [x] Enhance protein diversity to 0-8 scale
- [ ] **Integrate v5.0 features into calculateIngredientScore()**
- [ ] **Update calculateNutritionScore() with formula detection**
- [ ] **Fix nutrition score overflow bug**
- [ ] **Update calculateValueScore() maximums**
- [ ] Create test script
- [ ] Run tests on Orijen and Ci
- [ ] Verify score changes match projections
- [ ] Run full build
- [ ] Database recalculation

## 🎯 EXPECTED RESULTS

After full implementation:

| Product | v4.0 Score | v5.0 Projected | Change |
|---------|------------|----------------|--------|
| **Orijen Fit & Trim** | 85/100 | 94-96/100 | +9-11 ✓ |
| **Ci Mighty Meaty** | 89/100 | 79-81/100 | -8 to -10 ✓ |

**Key Improvements**:
- Raw/fresh meats score higher than prepared (6/5 vs 4 points)
- Dehydrated meats now score 5 points (was 2)
- 100% meat in top 5 = +10 bonus (Orijen gets this)
- Carbs in top 5 = -3 to -8 penalty (Ci loses 8 points)
- Enhanced protein diversity rewards 9 sources (Orijen)
- Whole prey + organ meats = +5 bonus (Orijen)
- Ash content >8% = -5 penalty
- Formula-specific protein ranges (40% optimal for weight management)

## 🚀 NEXT STEPS

1. Continue implementation in calculator.ts
2. Test with sample products
3. Build and validate
4. Run recalculate-scores when ready
