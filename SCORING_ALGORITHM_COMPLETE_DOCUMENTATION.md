# COMPLETE DOG FOOD SCORING ALGORITHM DOCUMENTATION
## Single Source of Truth - Algorithm v2.1.0
**Last Updated:** January 6, 2026
**Document Purpose:** Comprehensive documentation of all scoring calculations, point values, deductions, and logic

---

## TABLE OF CONTENTS
1. [Overview](#overview)
2. [Total Score Breakdown](#total-score-breakdown)
3. [Component 1: Ingredient Quality (45 points max)](#ingredient-quality)
4. [Component 2: Nutritional Value (33 points max)](#nutritional-value)
5. [Component 3: Value for Money (22 points max)](#value-for-money)
6. [Red Flag Override System](#red-flag-override-system)
7. [Confidence Score (0-100)](#confidence-score)
8. [Star Rating System](#star-rating-system)
9. [Enhanced Ingredient-Level Scoring](#enhanced-ingredient-scoring)
10. [Complete Calculation Examples](#calculation-examples)

---

## OVERVIEW

### Scoring Philosophy
The OnlyDogFood.com algorithm evaluates dog food products across three main dimensions:
1. **Ingredient Quality** (45% weight) - What's in the food
2. **Nutritional Value** (33% weight) - How nutritionally balanced it is
3. **Value for Money** (22% weight) - Price vs quality ratio

**Total Possible Score:** 100 points
**Algorithm Version:** 2.1.0
**Key Features:**
- Anti-gaming mechanisms to prevent score manipulation
- Red flag override system that caps ratings for harmful ingredients
- Granular ingredient-level analysis (30+ categories)
- Category-anchored price comparisons
- Transparency through confidence scoring

---

## TOTAL SCORE BREAKDOWN

```
MAXIMUM SCORE: 100 points

┌─────────────────────────────────────────┐
│ INGREDIENT QUALITY: 45 points (45%)    │
├─────────────────────────────────────────┤
│ NUTRITIONAL VALUE: 33 points (33%)     │
├─────────────────────────────────────────┤
│ VALUE FOR MONEY: 22 points (22%)       │
└─────────────────────────────────────────┘

Final Grade Ranges:
• 80-100 points → ⭐⭐⭐⭐⭐ Excellent
• 60-79 points  → ⭐⭐⭐⭐ Good
• 40-59 points  → ⭐⭐⭐ Fair
• 0-39 points   → ⭐⭐ Poor
```

---

## INGREDIENT QUALITY (45 points max) {#ingredient-quality}

### Subsection A: Effective Meat Content (15 points max)

**Purpose:** Reward high-quality animal protein content

#### Scoring Rules:
```
Meat Content ≥50%:     15 points (100%)
Meat Content 30-49%:   Proportionally scaled (60-99%)
Meat Content <30%:     Up to 7.5 points max (50%)

Formula for 30-49%:
points = (meatPercent / 50) × 15

Formula for <30%:
points = (meatPercent / 30) × 15 × 0.5
```

#### Anti-Gaming Rule: Fresh Meat Penalty
**Why:** Fresh meat contains 60-75% water, artificially inflating meat percentage

```
IF meat_content ≥ 50% AND majority sources are FRESH:
  Apply -10% penalty to meat points

Fresh Meat Sources (trigger penalty):
  - fresh chicken, fresh beef, fresh lamb, fresh turkey
  - fresh duck, fresh salmon, fresh fish
  - deboned chicken, deboned beef, deboned lamb
  - chicken breast, beef meat, lamb meat

Dehydrated/Meal Sources (no penalty):
  - chicken meal, beef meal, lamb meal
  - turkey meal, duck meal, salmon meal
  - dehydrated chicken, dehydrated beef
  - dried chicken, dried beef
```

**Example:**
```
Product A: 55% meat content, majority fresh chicken
  Base points: 15
  Fresh penalty: -1.5 (10%)
  Final: 13.5 points

Product B: 55% meat content, majority chicken meal
  Base points: 15
  No penalty
  Final: 15 points
```

---

### Subsection B: Low-Value Fillers & Carbohydrates (10 points max)

**Purpose:** Penalize use of low-quality filler ingredients

**Starting Points:** 10 points

#### High-Risk Fillers (Penalty: -2 points each)
```
Ingredients checked:
  - corn gluten meal
  - wheat gluten
  - soy protein isolate
  - by-product (any form)
  - generic by-product
  - poultry by-product
  - meat by-product

Formula:
penalty = count_of_high_risk_fillers × 2
points = 10 - penalty
```

#### Low-Value Carbohydrates (Penalty: -1 point each)
```
Ingredients checked:
  - white rice
  - maize
  - tapioca
  - corn
  - wheat

Formula:
penalty = count_of_low_value_carbs × 1
points = points_after_filler_penalty - penalty
```

**Minimum Score:** 0 (cannot go negative)

**Example:**
```
Product with: corn gluten meal, wheat, white rice, tapioca

Step 1: Start with 10 points
Step 2: High-risk fillers = 1 (corn gluten meal)
        Penalty = 1 × 2 = -2 points → 8 points
Step 3: Low-value carbs = 3 (wheat, white rice, tapioca)
        Penalty = 3 × 1 = -3 points → 5 points
Final: 5/10 points
```

---

### Subsection C: Artificial Additives & Preservatives (10 points max)

**Purpose:** Penalize harmful artificial ingredients

**Starting Points:** 10 points

#### Red Flag Additives (Immediate Zero - Automatic 0 points)
```
Checked ingredients:
  - ethoxyquin (banned in human food)
  - propylene glycol

IF FOUND: 0 points for this subsection
```

#### Artificial Colors (Immediate Zero - Automatic 0 points)
```
Checked ingredients:
  - artificial color/colour
  - red 40
  - yellow 5, yellow 6
  - blue 2
  - caramel color

IF FOUND: 0 points for this subsection
```

#### Artificial Preservatives (Tiered Penalty System)
```
Preservatives checked:
  - BHA (butylated hydroxyanisole)
  - BHT (butylated hydroxytoluene)
  - TBHQ (tertiary butylhydroquinone)
  - propyl gallate

Penalty Structure:
  ≥3 preservatives: Automatic 0 points (hard zero)
  First preservative: -3 points
  Each additional: -2 points

Formula:
IF count ≥ 3: points = 0
ELSE: penalty = 3 + (count - 1) × 2
      points = 10 - penalty
```

#### Controversial but Legal Additives (Penalty: -3 points each)
```
Ingredients checked:
  - carrageenan
  - guar gum
  - xanthan gum
  - sodium selenite
  - menadione

Formula:
penalty = count × 3
points = points_after_preservatives - penalty
Minimum: 0 points
```

**Example Calculations:**
```
Example 1: Contains BHA only
  Start: 10 points
  First preservative penalty: -3
  Final: 7 points

Example 2: Contains BHA + BHT
  Start: 10 points
  First (BHA): -3 points → 7
  Second (BHT): -2 points → 5
  Final: 5 points

Example 3: Contains BHA, BHT, TBHQ
  Start: 10 points
  Count ≥ 3: Hard zero
  Final: 0 points

Example 4: Contains carrageenan + guar gum
  Start: 10 points (no preservatives)
  Controversial additives: 2 × 3 = -6
  Final: 4 points
```

---

### Subsection D: Named Animal Sources (5 points max)

**Purpose:** Reward transparency in meat sourcing

#### Named Meat Sources (Good Quality)
```
Examples:
  - chicken, beef, lamb, turkey, duck
  - salmon, fish (specific species)
  - venison, bison, pork
```

#### Unnamed/Generic Sources (Poor Quality)
```
Examples:
  - "poultry" (which bird?)
  - "meat" (which animal?)
  - "animal" (very generic)
  - "meat meal" (unspecified)
  - "poultry meal" (unspecified)
```

#### Scoring Logic:
```
IF only named sources present:
  Points = 5 (100% transparency)

IF mix of named + unnamed sources:
  Points = 2.5 (50% transparency)

IF only generic/unnamed sources:
  Points = 0 (no transparency)
```

**Examples:**
```
Product A: chicken, beef, salmon
  Result: 5 points (all named)

Product B: chicken, "poultry meal", lamb
  Result: 2.5 points (mixed)

Product C: "meat meal", "poultry", "animal protein"
  Result: 0 points (all generic)
```

---

### Subsection E: Processing Quality (5 points max)

**Purpose:** Penalize heavily processed ingredients

**Starting Points:** 5 points

#### Processed Ingredients Checked:
```
- meat meal (unspecified)
- bone meal
- meat and bone meal
- animal digest
- animal fat
- poultry fat
- rendered (any form)
- animal derivatives

Penalty: -2 points per ingredient
Maximum penalty: -5 points (subsection goes to zero)

Formula:
penalty = min(5, count × 2)
points = 5 - penalty
```

**Example:**
```
Product with: animal digest, rendered chicken, animal fat

Count = 3 processed ingredients
Penalty = 3 × 2 = 6, but capped at 5
Final: 0/5 points
```

---

### Subsection F: Enhanced Ingredient-Level Bonus/Penalty (±10 points cap)

**Purpose:** Granular ingredient analysis across 30+ categories

This is an enhancement layer that provides detailed point adjustments based on specific ingredient presence. The raw total can exceed ±10, but is capped when applied.

#### Positive Categories (Examples):

**Premium Proteins (+2 points each)**
```
Ingredients:
  - fresh chicken, fresh beef, fresh lamb
  - fresh salmon, fresh venison, fresh bison
  - deboned chicken, deboned beef
  - chicken breast, beef muscle meat
```

**Organ Meats (+2 points each)**
```
Ingredients:
  - chicken liver, beef liver, lamb liver
  - chicken heart, beef heart
  - chicken kidney, beef kidney
  - beef tripe, lamb tripe, green tripe
  - beef spleen, beef lung
```

**Omega Fatty Acids (+2 points each)**
```
Ingredients:
  - salmon oil, fish oil, cod liver oil
  - flaxseed oil, hemp seed oil
  - DHA, EPA, algal oil
```

**Joint Support (+2 points each)**
```
Ingredients:
  - glucosamine, chondroitin
  - green lipped mussel
  - MSM, collagen
```

**Probiotics & Prebiotics (+2 points each)**
```
Ingredients:
  - lactobacillus, bifidobacterium
  - chicory root, inulin
  - fructooligosaccharides (FOS)
  - mannanoligosaccharides (MOS)
```

**Superfoods & Antioxidants (+1 point each)**
```
Ingredients:
  - blueberries, cranberries, blackberries
  - turmeric, spirulina, kelp
  - kale, spinach, broccoli
```

**Good Proteins (+1 point each)**
```
Ingredients:
  - chicken meal, beef meal, lamb meal
  - dehydrated chicken, dried beef
  - fish meal, salmon meal
```

#### Negative Categories (Examples):

**Artificial Colors (-5 points each)**
```
Ingredients:
  - artificial color/colour
  - red 40, yellow 5, yellow 6
  - blue 2, caramel color
```

**Red Flag Preservatives (-5 points each)**
```
Ingredients:
  - ethoxyquin
  - BHA, BHT, TBHQ
  - propylene glycol
```

**Sugar & Sweeteners (-3 points each)**
```
Ingredients:
  - sugar, cane sugar
  - corn syrup, glucose syrup
  - molasses, dextrose
```

**High-Risk Fillers (-3 points each)**
```
Ingredients:
  - corn gluten meal
  - wheat gluten
  - soy protein isolate
  - by-products
```

**Controversial Additives (-2 points each)**
```
Ingredients:
  - carrageenan, guar gum
  - xanthan gum
  - sodium selenite
```

**Unnamed Proteins (-2 points each)**
```
Ingredients:
  - generic "meat"
  - "poultry" (unspecified)
  - "animal protein"
```

**Low-Value Carbs (-1 point each)**
```
Ingredients:
  - white rice, corn, maize
  - wheat, tapioca
```

**Cellulose Fillers (-1 point each)**
```
Ingredients:
  - beet pulp, cellulose
  - wood pulp, sawdust
```

#### Application Logic:
```
1. Scan all ingredients
2. Match against 30+ categories
3. Accumulate points (can match multiple categories)
4. Calculate raw total (can exceed ±10)
5. Cap at ±10 for application
6. Add to ingredient score (respecting 45-point maximum)

Example:
  Raw bonus calculated: +18 points
  Capped for application: +10 points
  Current ingredient score: 38/45
  After bonus: min(45, 38 + 10) = 45/45
```

**Detailed Example:**
```
Product ingredients: fresh chicken, chicken liver, salmon oil,
glucosamine, blueberries, sweet potato, chicory root

Matches found:
  PREMIUM_PROTEINS (fresh chicken): +2
  ORGAN_MEATS (chicken liver): +2
  OMEGA_FATTY_ACIDS (salmon oil): +2
  JOINT_SUPPORT (glucosamine): +2
  SUPERFOODS_ANTIOXIDANTS (blueberries): +1
  PREMIUM_VEGETABLES (sweet potato): +1
  PROBIOTICS_PREBIOTICS (chicory root): +2

Raw Total: +12 points
Applied (capped): +10 points
```

---

### INGREDIENT QUALITY TOTAL CALCULATION

```
Final Ingredient Score = min(45, Sum of all subsections)

Components:
  A) Effective Meat Content: 0-15 points
  B) Low-Value Fillers: 0-10 points
  C) Artificial Additives: 0-10 points
  D) Named Animal Sources: 0-5 points
  E) Processing Quality: 0-5 points
  F) Ingredient Bonus/Penalty: ±10 points (capped)

Maximum possible: 45 points
Minimum possible: 0 points
```

---

## NUTRITIONAL VALUE (33 points max) {#nutritional-value}

### Subsection A: Protein Quantity & Integrity (15 points max)

**Purpose:** Evaluate protein content and quality

#### Optimal Protein Ranges:
```
OPTIMAL: 22-32% → Full 15 points
BELOW OPTIMAL: 18-22% → Scaled proportionally
LOW: <18% → Max 50% of points (7.5 points max)
ABOVE OPTIMAL: 32-35% → Gradual decline
VERY HIGH: ≥35% → Capped at 90% (13.5 points)
```

#### Detailed Scoring Formula:

**Case 1: Optimal Range (22-32%)**
```
IF protein_percent >= 22 AND protein_percent <= 32:
  points = 15
```

**Case 2: Above Optimal (32-35%)**
```
IF protein_percent > 32 AND protein_percent < 35:
  ratio = 1 - ((protein - 32) / (35 - 32)) × 0.1
  points = 15 × ratio

Example: 33% protein
  ratio = 1 - ((33 - 32) / 3) × 0.1 = 1 - 0.033 = 0.967
  points = 15 × 0.967 = 14.5
```

**Case 3: Very High (≥35%)**
```
IF protein_percent >= 35:
  points = 15 × 0.9 = 13.5
```

**Case 4: Below Optimal (18-22%)**
```
IF protein_percent >= 18 AND protein_percent < 22:
  ratio = (protein - 18) / (22 - 18)
  points = 15 × ratio

Example: 20% protein
  ratio = (20 - 18) / 4 = 0.5
  points = 15 × 0.5 = 7.5
```

**Case 5: Low (<18%)**
```
IF protein_percent < 18:
  ratio = protein_percent / 18
  points = 15 × ratio × 0.5

Example: 15% protein
  ratio = 15 / 18 = 0.833
  points = 15 × 0.833 × 0.5 = 6.25
```

#### Protein Integrity Modifier (Anti-Gaming)

**Purpose:** Detect plant-based protein inflation

**Trigger:** Protein ≥25%

**Plant Protein Sources Checked:**
```
- pea protein
- soy protein
- lentil protein
- chickpea protein
- legume protein
- potato protein
- wheat protein
- corn gluten
```

**Logic:**
```
IF protein_percent >= 25:
  has_plant_protein = check for plant sources
  has_animal_protein = check for meat sources
  meat_content = meat_content_percent

  IF has_plant_protein AND NOT has_animal_protein:
    Apply -20% penalty

  ELSE IF has_plant_protein AND has_animal_protein:
    IF meat_content < 40%:
      Apply -20% penalty (likely plant-boosted)
```

**Example:**
```
Product: 28% protein, contains pea protein, meat content 35%

Base points: 15 (within optimal range)
Meat content < 40% + plant protein present
Penalty: 15 × 0.2 = 3 points
Final: 15 - 3 = 12 points
```

---

### Subsection B: Fat Content (8 points max)

**Purpose:** Reward optimal fat levels for energy and health

#### Optimal Fat Range: 10-15%

```
IF fat_percent >= 10 AND fat_percent <= 15:
  points = 8 (full points)

ELSE IF fat_percent > 20:
  points = 8 - 2 = 6 (obesity risk penalty)

ELSE:
  // Within ±5% of optimal range
  distance = min(
    abs(fat_percent - 10),
    abs(fat_percent - 15)
  )

  IF distance <= 5:
    points = 8 × (1 - distance / 10)
  ELSE:
    points = 0
```

**Examples:**
```
12% fat: 8 points (optimal)
22% fat: 6 points (high fat penalty)
17% fat: 8 × (1 - 2/10) = 6.4 points
8% fat: 8 × (1 - 2/10) = 6.4 points
5% fat: 8 × (1 - 5/10) = 4 points
3% fat: 0 points (too far from optimal)
```

---

### Subsection C: Carbohydrate Load (7 points max + bonus)

**Purpose:** Reward low-carb formulations with quality carb sources

#### Carbohydrate Calculation:
```
IF carbs_percent is provided:
  carbs = carbs_percent
ELSE:
  carbs = 100 - protein - fat - moisture - ash - fiber
```

#### Base Scoring:

```
IF carbs < 30:
  points = 7 (full points)

ELSE IF carbs >= 30 AND carbs <= 40:
  ratio = (40 - carbs) / 10
  points = 7 × ratio

ELSE IF carbs > 40:
  points = 0
```

**Examples:**
```
25% carbs: 7 points
35% carbs: 7 × ((40-35)/10) = 7 × 0.5 = 3.5 points
45% carbs: 0 points
```

#### Vegetable Carbs Bonus (+1 point)

**Eligible vegetables:**
```
sweet potato, sweet potatoes, peas, carrots, pumpkin,
spinach, broccoli, kale, potato, potatoes,
butternut squash, zucchini
```

**Grains that disqualify:**
```
rice, wheat, corn, barley, oats
```

**Logic:**
```
IF has_vegetables AND carb_points > 0:
  bonus = +1 point
  total = carb_points + 1

Note: Vegetables present BUT grains also present = no bonus
```

**Example:**
```
Product: 28% carbs, contains sweet potato, no grains

Base points: 7 (carbs < 30)
Vegetable bonus: +1
Final: 8 points (bonus can exceed subsection max)
```

---

### Subsection D: Fiber & Functional Micronutrients (5 points max)

**Purpose:** Reward appropriate fiber and beneficial additives

**Updated from 3 to 5 points in v2.1**

#### Part 1: Fiber Content (2 points max)

**Optimal Fiber Range: 2-5%**

```
IF fiber_percent >= 2 AND fiber_percent <= 5:
  points = 2

ELSE:
  distance = min(
    abs(fiber_percent - 2),
    abs(fiber_percent - 5)
  )

  IF distance <= 2:
    points = 2 × (1 - distance / 4)
  ELSE:
    points = 0
```

**Examples:**
```
3% fiber: 2 points (optimal)
6% fiber: 2 × (1 - 1/4) = 1.5 points
7% fiber: 2 × (1 - 2/4) = 1 point
8% fiber: 0 points (too far from optimal)
1% fiber: 2 × (1 - 1/4) = 1.5 points
```

#### Part 2: Functional Micronutrients (3 points max)

**Scoring:** +1 point per category found, maximum 3 categories

**Category 1: Omega-3 / Fish Oils**
```
Ingredients:
  - omega-3, omega 3, fish oil, salmon oil
  - flaxseed oil, DHA, EPA, cod liver oil
```

**Category 2: Joint Support**
```
Ingredients:
  - glucosamine, chondroitin
  - green lipped mussel, MSM
```

**Category 3: Digestive Support OR Amino Acids**
```
Digestive:
  - probiotics, prebiotics
  - lactobacillus, bifidobacterium
  - chicory root, inulin

Amino Acids:
  - taurine, l-carnitine
  - l-lysine, methionine
```

**Logic:**
```
functional_points = 0

IF has_omega_fatty_acids:
  functional_points += 1

IF has_joint_support:
  functional_points += 1

IF has_digestive_support OR has_amino_acids:
  functional_points += 1

functional_points = min(3, functional_points)
```

**Example:**
```
Product contains: salmon oil, glucosamine, chicory root

Category 1 (Omega): +1
Category 2 (Joint): +1
Category 3 (Digestive): +1
Total functional: 3 points

Combined with fiber (e.g., 3%): 2 points
Subsection total: 5/5 points
```

---

### NUTRITIONAL VALUE TOTAL CALCULATION

```
Final Nutrition Score = Sum of all subsections

Components:
  A) Protein Quantity & Integrity: 0-15 points
  B) Fat Content: 0-8 points
  C) Carbohydrate Load: 0-7 points (+1 bonus possible)
  D) Fiber & Micronutrients: 0-5 points

Maximum possible: 33 points (can be 34 with veg bonus)
Minimum possible: 0 points
```

---

## VALUE FOR MONEY (22 points max) {#value-for-money}

### Subsection A: Price Competitiveness (15 points max)

**Purpose:** Category-anchored price comparison

**Critical:** Prices are compared ONLY within the same food category:
- Dry kibble vs dry kibble
- Wet food vs wet food
- Raw vs raw
- etc.

**Food Categories:**
```
- dry (kibble)
- wet (canned)
- cold-pressed
- fresh (refrigerated)
- raw (frozen)
- snack (treats)
```

#### Price Ratio Calculation:
```
price_ratio = product_price_per_kg / category_average_price_per_kg
```

#### Scoring Tiers:

```
IF price_ratio < 0.7:
  // <70% of category average (budget-friendly)
  points = 15

ELSE IF price_ratio < 0.9:
  // 70-90% of average (good value)
  points = 12

ELSE IF price_ratio <= 1.1:
  // 90-110% of average (fair/average)
  points = 9

ELSE IF price_ratio <= 1.3:
  // 110-130% of average (premium pricing)
  points = 6

ELSE:
  // >130% of average (very expensive)
  points = 3
```

**Examples (Dry Food Category, Average = £5.00/kg):**
```
Product A: £3.00/kg
  ratio = 3/5 = 0.6 → 15 points

Product B: £4.50/kg
  ratio = 4.5/5 = 0.9 → 12 points

Product C: £5.20/kg
  ratio = 5.2/5 = 1.04 → 9 points

Product D: £6.00/kg
  ratio = 6/5 = 1.2 → 6 points

Product E: £7.50/kg
  ratio = 7.5/5 = 1.5 → 3 points
```

---

### Subsection B: Ingredient-Adjusted Value (7 points max)

**Purpose:** Evaluate if price matches quality

**Requires:** Ingredient quality score (0-45)

```
quality_ratio = ingredient_score / 45
price_ratio = product_price / category_average
```

#### Scoring Logic:

**Case 1: Good Price + High Quality (7 points)**
```
IF price_ratio < 1.0 AND quality_ratio >= 0.7:
  points = 7
  // Great value: cheap AND good quality
```

**Case 2: Premium Price + Premium Quality (6 points)**
```
IF price_ratio > 1.2 AND quality_ratio >= 0.8:
  points = 6
  // Premium justified: expensive but excellent quality
```

**Case 3: Fair Price + Decent Quality (5 points)**
```
IF price_ratio >= 0.9 AND price_ratio <= 1.1 AND quality_ratio >= 0.6:
  points = 5
  // Average price, average quality
```

**Case 4: Junk Food Penalty (2 points)**
```
IF price_ratio < 0.8 AND quality_ratio < 0.5:
  points = 2
  // Red flag: cheap AND poor quality
  junk_food_penalty = -3
```

**Case 5: Neutral (4 points)**
```
ELSE:
  points = 4
  // Other combinations
```

**Examples:**
```
Example 1: £3/kg (60% of avg), ingredient score 35/45 (78%)
  price_ratio = 0.6, quality_ratio = 0.78
  Result: 7 points (good price + high quality)

Example 2: £7/kg (140% of avg), ingredient score 38/45 (84%)
  price_ratio = 1.4, quality_ratio = 0.84
  Result: 6 points (premium price + premium quality)

Example 3: £5/kg (100% of avg), ingredient score 28/45 (62%)
  price_ratio = 1.0, quality_ratio = 0.62
  Result: 5 points (fair price + decent quality)

Example 4: £3/kg (60% of avg), ingredient score 18/45 (40%)
  price_ratio = 0.6, quality_ratio = 0.40
  Result: 2 points (junk food - cheap + poor)

Example 5: £6/kg (120% of avg), ingredient score 25/45 (56%)
  price_ratio = 1.2, quality_ratio = 0.56
  Result: 4 points (expensive but not premium quality)
```

---

### VALUE TOTAL CALCULATION

```
Final Value Score = Sum of both subsections

Components:
  A) Price Competitiveness: 0-15 points
  B) Ingredient-Adjusted Value: 0-7 points

Maximum possible: 22 points
Minimum possible: 0 points
```

**If price data unavailable:**
```
Default value score: 11 points (50% - neutral)
```

---

## RED FLAG OVERRIDE SYSTEM {#red-flag-override-system}

**Purpose:** Cap final rating for products with harmful ingredients, regardless of score

### Rule 1: Ethoxyquin Present
```
IF ingredients contain "ethoxyquin":
  Maximum star rating: ⭐⭐⭐ (3 stars, "Fair")
  Reason: "Contains ethoxyquin (banned preservative in human food)"
```

### Rule 2: Unnamed Animal Digest as Primary Protein
```
IF "animal digest" OR "meat digest" in first 5 ingredients:
  Maximum star rating: ⭐⭐⭐ (3 stars, "Fair")
  Reason: "Unnamed animal digest as primary ingredient"
```

### Rule 3: Artificial Coloring + Sweeteners Combination
```
Artificial Colors:
  - artificial color/colour
  - red 40, yellow 5, yellow 6, blue 2
  - caramel color

Sweeteners:
  - corn syrup, cane sugar
  - sucrose, fructose, dextrose

IF has_artificial_color AND has_sweetener:
  Maximum star rating: ⭐⭐⭐ (3 stars, "Fair")
  Reason: "Contains artificial coloring and added sweeteners"
```

### Application Example:
```
Product Score: 85/100 (would normally be ⭐⭐⭐⭐⭐)
BUT contains ethoxyquin

Result:
  Calculated Score: 85/100
  Star Rating: ⭐⭐⭐ (CAPPED)
  Warning: "Red Flag Override: Contains ethoxyquin (banned...)"
```

---

## CONFIDENCE SCORE (0-100) {#confidence-score}

**Purpose:** Non-scoring transparency indicator showing data reliability

**Not part of the 100-point quality score**

### Component Breakdown:

#### 1. Full Ingredient Disclosure (30 points)
```
Check for percentage values in ingredient list (e.g., "chicken (30%)")

IF ≥3 percentages found:
  points = 30 (full disclosure)

ELSE IF ≥1 percentage found:
  points = 15 (partial disclosure)

ELSE:
  points = 0 (no disclosure)
```

#### 2. Clear Nutritional Values (25 points)
```
Check for presence of:
  - protein_percent
  - fat_percent
  - fiber_percent
  - moisture_percent
  - ash_percent

Formula:
  count = number of values present
  points = (count / 5) × 25

Examples:
  All 5 present: 25 points
  3 present: 15 points
  1 present: 5 points
```

#### 3. Named Sourcing (20 points)
```
IF all meat sources are named (no generic terms):
  points = 20

ELSE IF mix of named + unnamed:
  points = 10

ELSE:
  points = 0
```

#### 4. Carbohydrates Provided (15 points)
```
IF carbs_percent explicitly provided:
  points = 15

ELSE IF can be calculated reliably (has protein, fat, moisture):
  points = 7.5

ELSE:
  points = 0
```

#### 5. Manufacturing Information (10 points)
```
Check for:
  - brand.country_of_origin
  - brand.website_url

IF both present:
  points = 10

ELSE IF one present:
  points = 5

ELSE:
  points = 0
```

### Confidence Level:
```
Total Score ≥80: "High" confidence
Total Score 50-79: "Medium" confidence
Total Score <50: "Low" confidence
```

**Example:**
```
Product has:
  ✓ 5 ingredient percentages → 30 points
  ✓ All 5 nutritional values → 25 points
  ✓ All named sourcing → 20 points
  ✓ Carbs provided → 15 points
  ✓ Country + website → 10 points

Total: 100/100 - "High" confidence
```

---

## STAR RATING SYSTEM {#star-rating-system}

### Base Star Assignment (Before Override):

```
Score 80-100: ⭐⭐⭐⭐⭐ (5 stars) - "Excellent"
Score 60-79:  ⭐⭐⭐⭐ (4 stars) - "Good"
Score 40-59:  ⭐⭐⭐ (3 stars) - "Fair"
Score 0-39:   ⭐⭐ (2 stars) - "Poor"
```

### After Red Flag Override:

```
IF red flag detected AND calculated stars > 3:
  final_stars = 3 (cap at Fair)
  display_warning = true

ELSE:
  final_stars = calculated_stars
```

### Visual Display:
```
Product scores 85/100 (no red flags):
  ⭐⭐⭐⭐⭐ Excellent

Product scores 85/100 (with ethoxyquin):
  ⭐⭐⭐ Fair ⚠️
  Warning: Red flag override applied
```

---

## ENHANCED INGREDIENT SCORING {#enhanced-ingredient-scoring}

### Database Structure

**File:** `scoring/ingredient-scoring.json`
**Categories:** 30+
**Version:** 1.0.0
**Last Updated:** 2026-01-06

### Scoring Philosophy:
1. Each ingredient can match multiple categories
2. Points accumulate across all matches
3. Raw total can exceed caps
4. Applied bonus/penalty is capped at ±10 points
5. Final ingredient score cannot exceed 45 points

### Complete Category List:

#### Positive Contributors:

| Category | Points | Example Ingredients |
|----------|--------|-------------------|
| PREMIUM_PROTEINS | +2 | fresh chicken, deboned beef, fresh salmon |
| ORGAN_MEATS | +2 | liver, heart, kidney, tripe |
| OMEGA_FATTY_ACIDS | +2 | salmon oil, fish oil, DHA, EPA |
| JOINT_SUPPORT | +2 | glucosamine, chondroitin, green lipped mussel |
| PROBIOTICS_PREBIOTICS | +2 | lactobacillus, chicory root, FOS, MOS |
| SUPERFOODS_ANTIOXIDANTS | +1 | blueberries, turmeric, spirulina, kelp |
| PREMIUM_VEGETABLES | +1 | sweet potato, pumpkin, spinach, kale |
| GOOD_PROTEINS | +1 | chicken meal, dehydrated meats, fish meal |
| BENEFICIAL_HERBS | +1 | rosemary, parsley, chamomile, peppermint |
| FRUITS | +1 | apples, bananas, pears, papaya |
| SEAWEED_KELP | +1 | kelp, seaweed, algae, spirulina |
| ESSENTIAL_VITAMINS | +1 | vitamin E, vitamin A, B vitamins |
| ESSENTIAL_MINERALS | +1 | zinc, iron, copper, selenium (organic forms) |
| EGG_PRODUCTS | +1 | whole eggs, egg powder, dried egg |
| QUALITY_CARBS | +0.5 | oats, brown rice, quinoa, barley |

#### Negative Contributors:

| Category | Points | Example Ingredients |
|----------|--------|-------------------|
| ARTIFICIAL_COLORS | -5 | red 40, yellow 5, caramel color |
| RED_FLAG_PRESERVATIVES | -5 | ethoxyquin, BHA, BHT, TBHQ |
| SUGAR_SWEETENERS | -3 | sugar, corn syrup, molasses |
| HIGH_RISK_FILLERS | -3 | corn gluten meal, wheat gluten, by-products |
| CONTROVERSIAL_ADDITIVES | -2 | carrageenan, guar gum, xanthan gum |
| UNNAMED_PROTEINS | -2 | generic "meat", "poultry", "animal protein" |
| ARTIFICIAL_PRESERVATIVES | -2 | potassium sorbate, sodium benzoate |
| LOW_VALUE_CARBS | -1 | white rice, corn, wheat, maize |
| CELLULOSE_FILLERS | -1 | beet pulp, cellulose, wood pulp |
| PLANT_PROTEINS | -1 | pea protein, soy protein (when excessive) |

### Calculation Process:

```
Step 1: Parse ingredient text
  input: "fresh chicken, chicken liver, salmon oil, glucosamine,
          blueberries, sweet potato, pea protein, corn"

Step 2: Match against database
  PREMIUM_PROTEINS: fresh chicken → +2
  ORGAN_MEATS: chicken liver → +2
  OMEGA_FATTY_ACIDS: salmon oil → +2
  JOINT_SUPPORT: glucosamine → +2
  SUPERFOODS_ANTIOXIDANTS: blueberries → +1
  PREMIUM_VEGETABLES: sweet potato → +1
  PLANT_PROTEINS: pea protein → -1
  LOW_VALUE_CARBS: corn → -1

Step 3: Calculate raw total
  Positive: +2 +2 +2 +2 +1 +1 = +10
  Negative: -1 -1 = -2
  Raw Total: +8

Step 4: Apply cap
  Raw: +8 (within ±10 limit)
  Applied: +8 (no capping needed)

Step 5: Add to ingredient score
  Base ingredient score (A+B+C+D+E): 35/45
  After bonus: 35 + 8 = 43/45
  (respecting 45-point maximum)
```

### Storage in Database:

```json
{
  "ingredientBonusRaw": 8,
  "ingredientLevelBonus": 8,
  "ingredientBreakdown": {
    "PREMIUM_PROTEINS": 2,
    "ORGAN_MEATS": 2,
    "OMEGA_FATTY_ACIDS": 2,
    "JOINT_SUPPORT": 2,
    "SUPERFOODS_ANTIOXIDANTS": 1,
    "PREMIUM_VEGETABLES": 1,
    "PLANT_PROTEINS": -1,
    "LOW_VALUE_CARBS": -1
  }
}
```

---

## COMPLETE CALCULATION EXAMPLES {#calculation-examples}

### Example 1: Premium High-Quality Product

**Product Details:**
- Name: "Premium Wild Salmon & Sweet Potato"
- Ingredients: "Fresh salmon (40%), dehydrated salmon (20%), sweet potato, salmon oil, glucosamine, blueberries, chicory root"
- Meat Content: 60%
- Protein: 28%
- Fat: 14%
- Fiber: 3%
- Moisture: 10%
- Ash: 8%
- Carbs: 37% (calculated)
- Price: £6.00/kg (Category avg: £5.00/kg)

**INGREDIENT QUALITY (45 points max):**

*A) Effective Meat Content (15 points):*
```
Meat: 60% (within 50-65% optimal)
Fresh salmon is majority source
Fresh penalty: -10%
Points: 15 × 0.9 = 13.5 points
```

*B) Low-Value Fillers (10 points):*
```
No high-risk fillers: 0 deductions
No low-value carbs: 0 deductions
Points: 10 points
```

*C) Artificial Additives (10 points):*
```
No red flags: ✓
No artificial colors: ✓
No preservatives: ✓
No controversial additives: ✓
Points: 10 points
```

*D) Named Animal Sources (5 points):*
```
All sources named (salmon)
Points: 5 points
```

*E) Processing Quality (5 points):*
```
No processed ingredients
Points: 5 points
```

*F) Ingredient Bonus (±10 cap):*
```
Matches:
  PREMIUM_PROTEINS (fresh salmon): +2
  GOOD_PROTEINS (dehydrated salmon): +1
  PREMIUM_VEGETABLES (sweet potato): +1
  OMEGA_FATTY_ACIDS (salmon oil): +2
  JOINT_SUPPORT (glucosamine): +2
  SUPERFOODS_ANTIOXIDANTS (blueberries): +1
  PROBIOTICS_PREBIOTICS (chicory root): +2

Raw total: +11
Capped: +10
Points: +10
```

**Ingredient Total: 13.5 + 10 + 10 + 5 + 5 = 43.5**
**After bonus: min(45, 43.5 + 10) = 45/45**

---

**NUTRITIONAL VALUE (33 points max):**

*A) Protein Quality (15 points):*
```
28% protein (within 22-32% optimal)
No plant protein boosting
Points: 15 points
```

*B) Fat Content (8 points):*
```
14% fat (within 10-15% optimal)
Points: 8 points
```

*C) Carbohydrate Load (7 + bonus):*
```
37% carbs (30-40% range)
Ratio: (40 - 37) / 10 = 0.3
Base: 7 × 0.3 = 2.1 points

Has vegetables (sweet potato): +1 bonus
Points: 2.1 + 1 = 3.1 points
```

*D) Fiber & Micronutrients (5 points):*
```
Fiber (3%): 2 points (optimal)
Omega-3 (salmon oil): +1
Joint support (glucosamine): +1
Digestive (chicory root): +1
Functional: 3 points
Points: 2 + 3 = 5 points
```

**Nutrition Total: 15 + 8 + 3.1 + 5 = 31.1/33**

---

**VALUE FOR MONEY (22 points max):**

*A) Price Competitiveness (15 points):*
```
Price ratio: £6.00 / £5.00 = 1.2
110-130% range
Points: 6 points
```

*B) Ingredient-Adjusted Value (7 points):*
```
Price ratio: 1.2 (>1.2 threshold not met)
Quality ratio: 45/45 = 1.0 (100%)

Does not match any premium case
Case 5 (Neutral): 4 points
Points: 4 points
```

**Value Total: 6 + 4 = 10/22**

---

**OVERALL RESULTS:**
```
Ingredient Score: 45/45 (100%)
Nutrition Score: 31.1/33 (94%)
Value Score: 10/22 (45%)

Total Score: 45 + 31.1 + 10 = 86.1/100

Star Rating: ⭐⭐⭐⭐⭐ Excellent
Confidence Score: 85/100 (High)
Red Flag Override: None
```

---

### Example 2: Budget Product with Red Flags

**Product Details:**
- Name: "Bargain Beef Bites"
- Ingredients: "Meat meal, corn, wheat, corn gluten meal, animal fat, artificial color (red 40), BHA (preservative), salt, vitamins"
- Meat Content: 25%
- Protein: 18%
- Fat: 12%
- Fiber: 3%
- Carbs: 48%
- Price: £2.50/kg (Category avg: £5.00/kg)

**INGREDIENT QUALITY:**

*A) Effective Meat Content (15 points):*
```
Meat: 25% (<30% low range)
Points: (25/30) × 15 × 0.5 = 6.25 points
```

*B) Low-Value Fillers (10 points):*
```
High-risk: corn gluten meal (-2)
Low-value carbs: corn, wheat (-2)
Points: 10 - 2 - 2 = 6 points
```

*C) Artificial Additives (10 points):*
```
Artificial color (red 40): AUTOMATIC ZERO
Points: 0 points
```

*D) Named Animal Sources (5 points):*
```
Only generic "meat meal"
Points: 0 points
```

*E) Processing Quality (5 points):*
```
Processed: meat meal, animal fat (2 items)
Penalty: 2 × 2 = -4
Points: 5 - 4 = 1 point
```

*F) Ingredient Bonus (±10 cap):*
```
Matches:
  ARTIFICIAL_COLORS (red 40): -5
  RED_FLAG_PRESERVATIVES (BHA): -5
  HIGH_RISK_FILLERS (corn gluten meal): -3
  UNNAMED_PROTEINS (meat meal): -2
  LOW_VALUE_CARBS (corn, wheat): -2

Raw total: -17
Capped: -10
Points: -10
```

**Ingredient Total: 6.25 + 6 + 0 + 0 + 1 = 13.25**
**After penalty: max(0, 13.25 - 10) = 3.25/45**

---

**NUTRITIONAL VALUE:**

*A) Protein Quality (15 points):*
```
18% protein (threshold, scaled)
Points: 15 × ((18-18)/(22-18)) = 0 points
```

*B) Fat Content (8 points):*
```
12% fat (within 10-15% optimal)
Points: 8 points
```

*C) Carbohydrate Load (7 + bonus):*
```
48% carbs (>40%)
Points: 0 points
No vegetable bonus (only grains)
```

*D) Fiber & Micronutrients (5 points):*
```
Fiber (3%): 2 points
No functional ingredients
Points: 2 points
```

**Nutrition Total: 0 + 8 + 0 + 2 = 10/33**

---

**VALUE FOR MONEY:**

*A) Price Competitiveness (15 points):*
```
Price ratio: £2.50 / £5.00 = 0.5
<70% of average
Points: 15 points
```

*B) Ingredient-Adjusted Value (7 points):*
```
Price ratio: 0.5 (<0.8)
Quality ratio: 3.25/45 = 0.07 (<0.5)

Junk food penalty case
Points: 2 points
```

**Value Total: 15 + 2 = 17/22**

---

**OVERALL RESULTS:**
```
Ingredient Score: 3.25/45 (7%)
Nutrition Score: 10/33 (30%)
Value Score: 17/22 (77%)

Total Score: 3.25 + 10 + 17 = 30.25/100

Calculated Rating: ⭐⭐ Poor

RED FLAG OVERRIDE:
  Contains red 40 (artificial color)
  Contains BHA (preservative)
  Maximum Rating: ⭐⭐⭐ (3 stars)

Final Rating: ⭐⭐⭐ Fair ⚠️
Warning: "Contains artificial coloring and harmful preservatives"

Confidence Score: 45/100 (Low)
```

---

### Example 3: Mid-Range Product

**Product Details:**
- Name: "Healthy Choice Chicken & Rice"
- Ingredients: "Chicken meal (30%), brown rice, chicken fat, peas, flaxseed, vitamins and minerals"
- Meat Content: 35%
- Protein: 24%
- Fat: 16%
- Fiber: 3%
- Carbs: 35%
- Price: £4.80/kg (Category avg: £5.00/kg)

**INGREDIENT QUALITY:**

*A) Effective Meat Content (15 points):*
```
Meat: 35% (30-49% range)
Scaled: (35/50) × 15 = 10.5 points
Dehydrated (meal): no penalty
Points: 10.5 points
```

*B) Low-Value Fillers (10 points):*
```
No high-risk fillers
No low-value carbs (brown rice is neutral)
Points: 10 points
```

*C) Artificial Additives (10 points):*
```
No harmful additives
Points: 10 points
```

*D) Named Animal Sources (5 points):*
```
All sources named (chicken)
Points: 5 points
```

*E) Processing Quality (5 points):*
```
Chicken meal: -2
Chicken fat: -2
Points: 5 - 4 = 1 point
```

*F) Ingredient Bonus (±10 cap):*
```
Matches:
  GOOD_PROTEINS (chicken meal): +1
  QUALITY_CARBS (brown rice): +0.5
  PREMIUM_VEGETABLES (peas): +1
  OMEGA_FATTY_ACIDS (flaxseed): +2

Raw total: +4.5
Points: +4.5
```

**Ingredient Total: 10.5 + 10 + 10 + 5 + 1 = 36.5**
**After bonus: 36.5 + 4.5 = 41/45**

---

**NUTRITIONAL VALUE:**

*A) Protein Quality (15 points):*
```
24% protein (within 22-32% optimal)
No plant boosting issues
Points: 15 points
```

*B) Fat Content (8 points):*
```
16% fat (slightly above 15% optimal)
Distance: 16 - 15 = 1
Within ±5% range
Points: 8 × (1 - 1/10) = 7.2 points
```

*C) Carbohydrate Load (7 + bonus):*
```
35% carbs (30-40% range)
Ratio: (40 - 35) / 10 = 0.5
Base: 7 × 0.5 = 3.5 points

Has vegetables (peas): +1 bonus
Points: 3.5 + 1 = 4.5 points
```

*D) Fiber & Micronutrients (5 points):*
```
Fiber (3%): 2 points
Omega-3 (flaxseed): +1
No other functional ingredients: 0
Functional: 1 point
Points: 2 + 1 = 3 points
```

**Nutrition Total: 15 + 7.2 + 4.5 + 3 = 29.7/33**

---

**VALUE FOR MONEY:**

*A) Price Competitiveness (15 points):*
```
Price ratio: £4.80 / £5.00 = 0.96
90-110% range (fair/average)
Points: 9 points
```

*B) Ingredient-Adjusted Value (7 points):*
```
Price ratio: 0.96 (within 0.9-1.1)
Quality ratio: 41/45 = 0.91 (>0.6)

Fair price + decent quality case
Points: 5 points
```

**Value Total: 9 + 5 = 14/22**

---

**OVERALL RESULTS:**
```
Ingredient Score: 41/45 (91%)
Nutrition Score: 29.7/33 (90%)
Value Score: 14/22 (64%)

Total Score: 41 + 29.7 + 14 = 84.7/100

Star Rating: ⭐⭐⭐⭐⭐ Excellent
Confidence Score: 70/100 (Medium)
Red Flag Override: None
```

---

## ALGORITHM METADATA

**Version:** 2.1.0
**Last Updated:** January 6, 2026
**Implementation Files:**
- `scoring/calculator.ts` - Main calculation logic
- `scoring/config.ts` - Configuration constants
- `scoring/ingredient-matcher.ts` - Enhanced ingredient analysis
- `scoring/ingredient-scoring.json` - Ingredient database (30+ categories)

**Key Anti-Gaming Features:**
1. Fresh meat penalty (water weight inflation)
2. Protein integrity check (plant-protein boosting)
3. Category-anchored pricing (fair comparisons)
4. Red flag override system (safety cap)
5. Processing quality penalties
6. Tiered additive penalties

**Scoring Weights:**
- Ingredient Quality: 45% (most important)
- Nutritional Value: 33% (second)
- Value for Money: 22% (third)

**Total Categories Evaluated:** 50+
**Ingredient Database Size:** 2,416 unique ingredients
**Products Analyzed:** 1,767+

---

## COMPLETE INGREDIENT DATABASE REFERENCE

### Overview
The algorithm evaluates **2,416 unique ingredients** across **30 categories** from the database located at `data/unique-ingredients.txt`.

The ingredient scoring system (`scoring/ingredient-scoring.json`) categorizes ingredients into positive contributors (beneficial), neutral ingredients, and negative contributors (harmful or low-quality).

---

### POSITIVE CONTRIBUTORS

#### 🥩 PREMIUM_PROTEINS (+2 points each)
**Description:** High-quality, named, whole meat sources - highly digestible

**Ingredients (43 total):**
```
fresh chicken, fresh beef, fresh lamb, fresh turkey, fresh duck,
fresh salmon, fresh trout, fresh venison, fresh bison, fresh rabbit,
fresh kangaroo, fresh wild boar, fresh ostrich, fresh goat, fresh pork,
fresh reindeer, fresh quail, fresh pheasant, fresh goose, fresh guinea fowl,
deboned chicken, deboned beef, deboned lamb, deboned turkey,
deboned salmon, deboned white fish, chicken breast, chicken meat,
beef muscle meat, lamb meat, turkey meat, duck meat,
freshly prepared chicken, freshly prepared beef, freshly prepared lamb,
freshly prepared turkey, freshly prepared salmon, freshly prepared duck,
freshly prepared venison, freshly prepared wild boar, freshly prepared rabbit,
freshly prepared kangaroo, freshly prepared goat
```

---

#### 🍖 GOOD_PROTEINS (+1 point each)
**Description:** Quality concentrated protein sources - dehydrated/meal forms

**Ingredients (40 total):**
```
chicken meal, beef meal, lamb meal, turkey meal, duck meal,
salmon meal, fish meal, herring meal, anchovy meal, mackerel meal,
trout meal, venison meal, dehydrated chicken, dehydrated beef,
dehydrated lamb, dehydrated turkey, dehydrated duck, dehydrated salmon,
dehydrated fish, dehydrated herring, dehydrated pork, dried chicken,
dried beef, dried lamb, dried turkey, dried duck, dried salmon,
dried fish, dried herring, dried rabbit, dried insect protein,
chicken protein, beef protein, lamb protein, turkey protein,
duck protein, salmon protein, fish protein, insect protein,
black soldier fly larvae, insects
```

---

#### 🫀 ORGAN_MEATS (+2 points each)
**Description:** Nutrient-dense organ meats - excellent vitamin/mineral sources

**Ingredients (35 total):**
```
chicken liver, beef liver, lamb liver, turkey liver, duck liver, pork liver,
chicken heart, beef heart, lamb heart, turkey heart, duck heart,
chicken kidney, beef kidney, lamb kidney, beef spleen, lamb spleen,
chicken gizzard, turkey gizzard, duck gizzard, beef lung, lamb lung,
chicken lung, beef tripe, lamb tripe, green tripe, liver, heart, kidney,
spleen, lung, tripe, offal, organ meat
```

---

#### 🐟 OMEGA_FATTY_ACIDS (+2 points each)
**Description:** Essential fatty acids for coat, brain, and joint health

**Ingredients (28 total):**
```
salmon oil, fish oil, cod liver oil, herring oil, anchovy oil,
krill oil, pollock oil, flaxseed oil, flax seed oil, linseed oil,
hemp seed oil, hemp oil, algal oil, dha, dha dried algae, epa,
omega 3 oil, omega-3 extract, cold pressed salmon oil,
cold pressed fish oil, norwegian salmon oil, scottish salmon oil,
atlantic salmon oil, wild salmon oil, algae omega 3 powder, algae oil
```

---

#### 🦴 JOINT_SUPPORT (+2 points each)
**Description:** Glucosamine, chondroitin, and natural joint support

**Ingredients (21 total):**
```
glucosamine, glucosamine hcl, glucosamine hydrochloride,
glucosamine sulfate, d-glucosamine hydrochloride, glucosamine- hci,
glucosamine-hcl, chondroitin, chondroitin sulfate,
chondroitin sulfate and collagen, green lipped mussel,
green-lipped mussel, new zealand green lipped mussel,
green lipped mussel extract, green lipped mussel powder,
dried green lipped mussels, mussel meat extract from perna canaliculus,
msm, methylsulfonylmethane, methyl sulphonyl methane, collagen,
collagen hydrolysate, cartilage, cartilage hydrolysate,
chicken cartilage, beef cartilage
```

---

#### 🦠 PROBIOTICS_PREBIOTICS (+2 points each)
**Description:** Digestive health support - gut microbiome

**Ingredients (22 total):**
```
probiotic, lactobacillus, lactobacillus acidophilus,
lactobacillus helveticus, bifidobacterium, enterococcus faecium,
e faecium, bacillus velezensis, prebiotic, chicory root,
chicory root extract, chicory inulin, inulin, inulin from chicory,
fructooligosaccharides, fructo-oligosaccharides, fos,
mannanoligosaccharides, mannan-oligosaccharides, mos,
fermented whey, yeast cell walls, dried yeast extract,
beta glucans, beta-glucans
```

---

#### 🫐 SUPERFOODS_ANTIOXIDANTS (+1 point each)
**Description:** Nutrient-dense superfoods with antioxidant properties

**Ingredients (32 total):**
```
blueberries, blueberry, cranberries, cranberry, blackberries, blackberry,
raspberries, raspberry, strawberries, strawberry, bilberries, bilberry,
acai, acai berry, goji berries, goji berry, aronia, aronia berries,
pomegranate, pomegranate extract, acerola, acerola cherry,
kale, spinach, broccoli, chard, watercress, spirulina,
turmeric, curcumin, green tea, green tea extract,
ashwagandha, ginger, cinnamon, rosemary extract
```

---

#### 🥕 PREMIUM_VEGETABLES (+1 point each)
**Description:** Nutrient-rich vegetables - fiber, vitamins, minerals

**Ingredients (27 total):**
```
sweet potato, sweet potatoes, butternut squash, pumpkin,
kale, spinach, broccoli, asparagus, brussels sprouts,
carrots, carrot, parsnips, parsnip, beets, beetroot,
peas, green pea, garden pea, chickpeas, chickpea,
lentil, red lentil, green lentil, zucchini, courgette,
cucumber, celery
```

---

#### 🌿 BENEFICIAL_HERBS (+1 point each)
**Description:** Medicinal herbs with health benefits

**Ingredients (30 total):**
```
milk thistle, dandelion, dandelion root, nettle, nettle leaves,
stinging nettle, chamomile, peppermint, spearmint, parsley, basil,
oregano, thyme, rosemary, ginger, turmeric, cinnamon, yucca,
yucca schidigera, yucca extract, aloe vera, aloe vera without aloin,
echinacea, ginseng, ashwagandha, fennel, fenugreek, aniseed
```

---

#### 🌊 SEAWEED_KELP (+1 point each)
**Description:** Marine vegetables - iodine and mineral rich

**Ingredients (13 total):**
```
kelp, seaweed, sea kelp, kelp powder, ascophyllum nodosum,
dried kelp, scottish kelp, irish kelp, marine algae, sea algae,
algae, spirulina, chlorella
```

---

#### 🥚 EGGS (+1 point each)
**Description:** Complete protein source with essential nutrients

**Ingredients (11 total):**
```
whole egg, whole eggs, fresh whole egg, dried whole egg,
dehydrated whole egg, egg, eggs, free range egg, organic egg,
egg powder, egg yolk
```

---

#### 🧬 AMINO_ACIDS (+1 point each)
**Description:** Essential amino acids for health

**Ingredients (11 total):**
```
taurine, l-carnitine, l carnitine, carnitine, lysine, lysine hcl,
methionine, dl-methionine, threonine, tryptophan, l-tryptophan,
glutamine, amino acid
```

---

#### 🍎 FRUITS (+1 point each)
**Description:** Natural fruit sources - vitamins and fiber

**Ingredients (15 total):**
```
apple, apples, pear, pears, banana, bananas, mango, papaya,
pineapple, orange, citrus, grapefruit, mandarin, tomato, tomatoes
```

---

#### 🛢️ BENEFICIAL_OILS (+1 point each)
**Description:** Healthy fat sources

**Ingredients (12 total):**
```
coconut oil, olive oil, extra virgin olive oil, sunflower oil,
cold pressed sunflower oil, rapeseed oil, canola oil, flaxseed,
flax seed, linseed, chia seeds, hemp seeds, pumpkin seeds
```

---

### NEUTRAL INGREDIENTS (0 points)

#### 🌾 QUALITY_GRAINS (0 points)
**Description:** Whole grains - better carb sources with fiber

**Ingredients (14 total):**
```
oats, oatmeal, whole oats, steel-cut oats, brown rice,
whole brown rice, wholegrain brown rice, barley, whole barley,
pearled barley, quinoa, buckwheat, amaranth, millet,
whole grain oats, whole grain wheat, wholegrain wheat, spelt
```

---

#### 🥔 NEUTRAL_CARBS (0 points)
**Description:** Acceptable carbohydrate sources - no penalty

**Ingredients (10 total):**
```
potato, potatoes, white potato, pea, pea protein, pea flour,
pea starch, chickpea flour, lentil flour, tapioca starch,
cassava, rice, rice flour
```

---

#### 🦴 BONES_CALCIUM (0 points)
**Description:** Natural calcium and mineral sources

**Ingredients (10 total):**
```
bone, chicken bone, beef bone, lamb bone, ground bone,
finely minced bone, calcium carbonate, dicalcium phosphate,
eggshell, eggshells, crushed eggshells, oyster shell,
calcified seaweed
```

---

#### 🍞 YEAST (0 points)
**Description:** Nutritional yeast and fermentation products

**Ingredients (7 total):**
```
brewers yeast, brewer yeast, nutritional yeast, yeast extract,
dried yeast, yeast, saccharomyces cerevisiae
```

---

#### 🛡️ NATURAL_PRESERVATIVES (0 points)
**Description:** Natural, safe preservatives

**Ingredients (6 total):**
```
tocopherols, mixed tocopherols, vitamin e, rosemary extract,
rosemary oil, rosemary oil extract, ascorbic acid, vitamin c
```

---

### NEGATIVE CONTRIBUTORS

#### ⚠️ ARTIFICIAL_COLORS (-5 points each)
**Description:** Artificial coloring agents - NO benefit, potential harm

**Ingredients (9 total):**
```
artificial color, artificial colour, red 40, yellow 5, yellow 6,
blue 2, caramel color, caramel colour, coloured with ferrous oxide,
coloured with iron oxide
```

**Impact:** Immediate 0 points for Artificial Additives subsection (10 points lost)

---

#### 🚫 RED_FLAG_PRESERVATIVES (-5 points each)
**Description:** Controversial preservatives linked to health concerns

**Ingredients (8 total):**
```
ethoxyquin, propylene glycol, bha, bht, tbhq, propyl gallate,
sodium benzoate, potassium sorbate
```

**Impact:**
- Ethoxyquin: Caps star rating at ⭐⭐⭐ regardless of score
- Multiple preservatives trigger tiered penalties

---

#### 🍬 SUGAR_SWEETENERS (-3 points each)
**Description:** Added sugars - no nutritional benefit for dogs

**Ingredients (12 total):**
```
sugar, cane sugar, beet molasses, cane molasses, glucose syrup,
corn syrup, wheat glucose syrup, dextrose, fructose, sucrose,
honey, manuka honey, syrup
```

---

#### 📦 HIGH_RISK_FILLERS (-3 points each)
**Description:** Low-quality fillers used to boost protein artificially

**Ingredients (11 total):**
```
corn gluten meal, corn gluten, maize gluten meal, maize gluten,
wheat gluten, wheat gluten meal, soy protein isolate,
soya protein isolate, by product, by-product, meat by-product,
poultry by-product, animal by-product, meat & meat by product
```

**Impact:** Also triggers -2 penalty in Filler subsection

---

#### ⚠️ CONTROVERSIAL_ADDITIVES (-2 points each)
**Description:** Legal but controversial - digestive issues in some dogs

**Ingredients (6 total):**
```
carrageenan, guar gum, xanthan gum, cassia gum,
sodium selenite, menadione
```

**Impact:** Also triggers -3 penalty in Additives subsection

---

#### 🥩 UNNAMED_PROTEINS (-2 points each)
**Description:** Generic, unspecified meat sources - low quality

**Ingredients (11 total):**
```
meat, meat meal, meat and bone meal, poultry, poultry meal,
poultry protein, animal protein, animal fat, animal meal,
meat & animal derivative, meat and animal derivative,
fish, fish meal, white fish, game, game meat
```

**Impact:** Also triggers 0 points in Named Meat Sources subsection

---

#### 🩸 BLOOD_MEAL_PLASMA (-2 points each)
**Description:** Blood products - controversial protein sources

**Ingredients (6 total):**
```
blood meal, plasma powder, plasma protein, dried plasma,
hemoglobin powder, haemoglobin powder
```

---

#### 🧪 DIGEST (-1 point each)
**Description:** Hydrolyzed proteins - palatability but processing concerns

**Ingredients (9 total):**
```
digest, animal digest, chicken digest, poultry digest,
beef digest, lamb digest, turkey digest, hydrolysate,
protein hydrolysate, liver hydrolysate, hydrolyzed animal protein,
hydrolysed animal protein
```

---

#### 🌾 LOW_VALUE_CARBS (-1 point each)
**Description:** Simple carbs with limited nutritional value

**Ingredients (13 total):**
```
white rice, cooked white rice, corn, maize, ground maize,
flaked maize, maize flour, maize meal, wheat, wheat flour,
wheat meal, ground wheat, tapioca, tapioca starch,
rice starch, corn starch, wheat starch
```

**Impact:** Also triggers -1 penalty in Filler subsection

---

#### 📄 CELLULOSE_FILLERS (-1 point each)
**Description:** Fiber fillers with minimal nutritional value

**Ingredients (11 total):**
```
cellulose, cellulose powder, cellulose fibre, beet pulp,
dried beet pulp, sugar beet pulp, pea fibre, oat fibre,
wheat bran, rice bran, soya hulls, peanut hulls
```

---

#### 🧈 RENDERED_FAT (-1 point each)
**Description:** Rendered fats - processing quality concerns

**Ingredients (6 total):**
```
animal fat, poultry fat, beef tallow, lard, rendered fat,
greaves, greaves meal
```

**Impact:** Also triggers -2 penalty in Processing Quality subsection

---

### INGREDIENT MATCHING LOGIC

#### How Ingredients Are Matched:

1. **Normalization:**
   - Text is lowercased
   - Special characters removed
   - Multiple spaces collapsed

2. **Word Boundary Matching:**
   - Uses regex: `\b{ingredient}\b`
   - Prevents false positives (e.g., "fresh" won't match "refresh")

3. **Multiple Category Matching:**
   - Single ingredient can match multiple categories
   - Example: "chicken liver" matches both PREMIUM_PROTEINS and ORGAN_MEATS
   - Points accumulate from all matches

4. **Deduplication:**
   - Each unique ingredient counted once per category
   - Prevents double-counting same ingredient

#### Example Matching Process:

```
Input: "fresh chicken, chicken liver, salmon oil, corn gluten meal"

Matches Found:
  ✓ fresh chicken → PREMIUM_PROTEINS (+2)
  ✓ chicken liver → ORGAN_MEATS (+2)
  ✓ salmon oil → OMEGA_FATTY_ACIDS (+2)
  ✗ corn gluten meal → HIGH_RISK_FILLERS (-3)

Raw Total: +2 +2 +2 -3 = +3 points
Applied: +3 points (within ±10 cap)
```

---

### COMPLETE INGREDIENT COUNT SUMMARY

**Total Unique Ingredients in Database:** 2,416

**Ingredient Categories:** 30

**Breakdown by Point Value:**

| Points | Categories | Ingredient Count (approx) |
|--------|-----------|---------------------------|
| +2 | 5 categories | ~150 ingredients |
| +1 | 9 categories | ~150 ingredients |
| 0 | 5 categories | ~50 ingredients |
| -1 | 4 categories | ~40 ingredients |
| -2 | 3 categories | ~30 ingredients |
| -3 | 2 categories | ~25 ingredients |
| -5 | 2 categories | ~15 ingredients |

**Most Common Beneficial Ingredients:**
1. Fresh meats (chicken, beef, lamb, salmon)
2. Organ meats (liver, heart, kidney)
3. Healthy oils (salmon oil, fish oil)
4. Vegetables (sweet potato, pumpkin, peas)
5. Probiotics (lactobacillus, chicory root)

**Most Common Harmful Ingredients:**
1. Corn/wheat/maize derivatives
2. Generic meat terms ("meat meal", "poultry")
3. Artificial preservatives (BHA, BHT)
4. By-products and fillers
5. Added sugars

---

### INGREDIENT QUALITY BENCHMARKS

**Excellent Quality Products (40+ ingredient points):**
- Multiple premium proteins (fresh + meal)
- Organ meats present
- Omega-3 sources
- Joint support ingredients
- No artificial additives
- All named sources

**Good Quality Products (30-39 ingredient points):**
- Named protein sources
- Some functional ingredients
- Minimal fillers
- Natural preservatives
- Few controversial additives

**Fair Quality Products (20-29 ingredient points):**
- Mix of named/unnamed sources
- Some low-value carbs
- Limited functional ingredients
- May have controversial additives

**Poor Quality Products (<20 ingredient points):**
- Generic protein sources
- High-risk fillers
- Artificial additives
- Excessive low-value carbs
- No beneficial supplements

---

### PRACTICAL USAGE

**For Product Analysis:**
1. Extract ingredient list from product
2. Normalize text (lowercase, clean)
3. Match against all 30 categories
4. Sum points from all matches
5. Apply ±10 point cap
6. Add to base ingredient score

**For Comparing Products:**
- Check `ingredientBreakdown` field in database
- Compare category-by-category
- Identify specific strengths/weaknesses
- Use for product recommendations

**For Brand Evaluation:**
- Aggregate ingredient patterns across brand products
- Identify common quality markers
- Track use of beneficial vs harmful ingredients

---

## END OF DOCUMENT

This document represents the complete, authoritative reference for the OnlyDogFood.com scoring algorithm. All point values, deductions, increases, formulas, and logic are documented here as a single source of truth.

**Database Files:**
- `scoring/calculator.ts` - Main calculation logic
- `scoring/config.ts` - Configuration constants
- `scoring/ingredient-matcher.ts` - Enhanced ingredient analysis
- `scoring/ingredient-scoring.json` - 30 categories, ~400 scored ingredients
- `data/unique-ingredients.txt` - 2,416 unique ingredients from 1,767+ products

**For Questions or Updates:** Refer to implementation files in `/scoring` directory.

---

## ALGORITHM V2.2.0 UPGRADE TODO LIST

### 🎯 OVERVIEW
Upgrade from v2.1.0 to v2.2.0 with:
- Dry Matter (DM) normalization for fair cross-format comparison
- Enhanced value-for-money via price per 1000kcal
- Position-weighted ingredient scoring (pixie dust fix)
- Split ingredient detection (anti-gaming)
- Tiered red flag caps
- More meaningful confidence scoring

**Key Principles:**
- ✅ Maintain scoring philosophy: Ingredient (45) + Nutrition (33) + Value (22) = 100
- ✅ Backward compatible: incomplete data still scores, confidence reflects uncertainty
- ✅ Deterministic and explainable
- ✅ Version: "2.2.0"

---

### 📋 PART A: DRY MATTER (DM) NORMALIZATION FOR NUTRITION

#### A1. Config Updates (`scoring/config.ts`)

**Task A1.1: Add moisture defaults by category**
```typescript
export const MOISTURE_DEFAULTS = {
  dry: 10,
  wet: 78,
  raw: 70,
  fresh: 65,
  'cold-pressed': 10,
  snack: 10,
} as const;
```

**Task A1.2: Add ash defaults by category**
```typescript
export const ASH_DEFAULTS = {
  dry: 8,
  wet: 2.5,
  raw: 3,
  fresh: 3,
  'cold-pressed': 8,
  snack: 6,
} as const;
```

**Task A1.3: Define DM-based optimal ranges**
```typescript
export const DM_OPTIMAL_RANGES = {
  PROTEIN_OPTIMAL_MIN: 24,
  PROTEIN_OPTIMAL_MAX: 38,
  PROTEIN_LOW_THRESHOLD: 20,
  PROTEIN_PLATEAU: 45,
  FAT_MIN: 12,
  FAT_MAX: 20,
  CARBS_MAX: 30,
  FIBER_MIN: 2,
  FIBER_MAX: 8,
} as const;
```

**Task A1.4: Add feature flags**
```typescript
export const FEATURE_FLAGS = {
  USE_DM_NUTRITION: true,
  USE_KCAL_VALUE: true,
  USE_POSITION_WEIGHTING: true,
  USE_SPLIT_INGREDIENT_PENALTY: true,
} as const;
```

#### A2. Calculator Updates (`scoring/calculator.ts`)

**Task A2.1: Create DM calculation helper**
```typescript
function computeDryMatterMacros(product: Product): {
  dmPercent: number;
  proteinDM: number | null;
  fatDM: number | null;
  fiberDM: number | null;
  carbsDM: number | null;
  usedDefaults: {
    moisture: boolean;
    ash: boolean;
  };
}
```
- Calculate DM% = 100 - moisture%
- Use moisture defaults if missing (from category)
- Convert all macros to DM basis: macroDM = (macro / DM) * 100
- Track which defaults were used

**Task A2.2: Update `calculateNutritionScore()` function**
- Add logic to compute DM metrics
- Create fallback logic: prefer DM scoring, fall back to as-fed if DM unavailable
- Update Protein scoring (A) to use proteinDM with new ranges
  - Optimal: 24-38% DM → 15 points
  - Above: 38-45% DM → gradual decline
  - Very high: ≥45% DM → capped at 13.5 points (90%)
  - Below: 20-24% DM → scaled
  - Low: <20% DM → max 50% points (7.5)
- Keep protein integrity modifier logic (plant protein check)

**Task A2.3: Update Fat Content scoring (B)**
- Use fatDM with optimal range 12-20% DM
- Full 8 points in optimal range
- Apply gentle decline outside range
- Keep high fat penalty logic (>20% on DM basis)

**Task A2.4: Update Carbohydrate Load scoring (C)**
- Use carbsDM for scoring
- <30% DM → 7 points
- 30-40% DM → scaled
- >40% DM → 0 points
- Keep vegetable bonus logic

**Task A2.5: Update Fiber & Micronutrients scoring (D)**
- Use fiberDM with range 2-8% DM
- Full 2 points in optimal range
- Distance-based partial credit
- Keep functional micronutrients logic unchanged (3 points max)

**Task A2.6: Add DM output to breakdown**
```typescript
dmMetrics: {
  dmPercent: number;
  proteinDM: number | null;
  fatDM: number | null;
  fiberDM: number | null;
  carbsDM: number | null;
  usedDefaults: {
    moisture: boolean;
    ash: boolean;
  };
}
```

---

### 📋 PART B: IMPROVED CARB CALCULATION

#### B1. Calculator Updates (`scoring/calculator.ts`)

**Task B1.1: Create carbs calculation helper with hierarchy**
```typescript
function computeCarbsWithDefaults(product: Product): {
  carbs: number;
  carbsProvided: boolean;
  carbsEstimated: boolean;
  ashProvided: boolean;
  ashEstimated: boolean;
}
```
- Check if carbs_percent provided → use directly
- Else compute: 100 - protein - fat - moisture - ash - fiber
- If ash missing, use category default from ASH_DEFAULTS
- Track what was provided vs estimated

**Task B1.2: Update nutrition scoring to use new carbs helper**
- Replace existing carbs calculation
- Use the structured result

**Task B1.3: Add nutrition meta to output**
```typescript
nutritionMeta: {
  carbsProvided: boolean;
  carbsEstimated: boolean;
  ashProvided: boolean;
  ashEstimated: boolean;
  moistureProvided: boolean;
  moistureEstimated: boolean;
  dmBasisUsed: boolean;
}
```

---

### 📋 PART C: METABOLIZABLE ENERGY + PRICE PER 1000 KCAL

#### C1. Calculator Updates (`scoring/calculator.ts`)

**Task C1.1: Create energy estimation helper**
```typescript
function computeAtwaterEnergy(product: Product, carbs: number): {
  kcalPer100g: number | null;
  kcalPerKg: number | null;
  usedAtwaterEstimate: boolean;
  pricePer1000kcal: number | null;
}
```
- Modified Atwater formula: kcal/100g = 3.5*protein + 8.5*fat + 3.5*carbs
- Convert to kcal/kg: * 10
- Calculate pricePer1000kcal = pricePerKg / (kcalPerKg/1000)
- Handle missing data gracefully

**Task C1.2: Update `calculateValueScore()` signature**
```typescript
function calculateValueScore(
  product: Product,
  categoryAveragePricePerKg: number,
  categoryAveragePricePer1000kcal: number | undefined,
  ingredientQuality: number
)
```

**Task C1.3: Rewrite Price Competitiveness (A) - 15 points**
- Implement dual-mode pricing:
  - Mode 1: Use pricePer1000kcal vs categoryAveragePricePer1000kcal (preferred)
  - Mode 2: Fall back to pricePerKg vs categoryAveragePricePerKg
- Keep tier points: 15/12/9/6/3
- Calculate ratio based on available metric

**Task C1.4: Rewrite Ingredient-Adjusted Value (B) - 7 points**
- Replace discrete cases with smooth function:
```typescript
qualityRatio = ingredientScore / 45  // 0-1
valueRatio = categoryAvgPrice / productPrice  // >1 = better value

normalize(valueRatio):
  if valueRatio <= 0.7: 0
  if 0.7 < valueRatio <= 1.3: (valueRatio - 0.7) / 0.6
  if valueRatio > 1.3: 1

points = clamp(0, 7, 7 * (0.55*qualityRatio + 0.45*normalize(valueRatio)))
```
- Keep junk food penalty: if qualityRatio < 0.5 AND productPrice < 0.8*avgPrice, cap at 2

**Task C1.5: Add energy output to breakdown**
```typescript
energyMetrics: {
  kcalPer100g: number | null;
  kcalPerKg: number | null;
  pricePer1000kcal: number | null;
  usedAtwaterEstimate: boolean;
}
```

---

### 📋 PART D: POSITION-WEIGHTED INGREDIENT SCORING

#### D1. Ingredient Matcher Updates (`scoring/ingredient-matcher.ts`)

**Task D1.1: Create ingredient tokenizer**
```typescript
function tokenizeIngredients(ingredientText: string): {
  token: string;
  normalizedToken: string;
  positionIndex: number;
}[]
```
- Split by commas (primary) and semicolons
- Trim whitespace
- Preserve order (0-based index)
- Return array of tokens with positions

**Task D1.2: Add position multiplier calculator**
```typescript
function getPositionMultiplier(positionIndex: number): number {
  if (positionIndex <= 4) return 1.0;    // positions 1-5
  if (positionIndex <= 9) return 0.6;    // positions 6-10
  return 0.3;                             // positions 11+
}
```

**Task D1.3: Update `analyzeIngredients()` to use tokens**
- Tokenize input first
- Match each token against database
- Apply position multiplier to each match
- For duplicate ingredient-category pairs, keep BEST (highest multiplier)
- Return enhanced matches with position info

**Task D1.4: Update match result structure**
```typescript
export interface IngredientMatch {
  ingredient: string;
  category: string;
  basePoints: number;
  positionIndex: number;
  positionMultiplier: number;
  weightedPoints: number;
  description: string;
}
```

**Task D1.5: Update `calculateIngredientBonusPoints()`**
- Use position-weighted points for total calculation
- Return both raw (unweighted) and weighted totals
```typescript
return {
  totalPointsRaw: number;          // without position weighting
  totalPointsWeighted: number;     // with position weighting
  totalPointsApplied: number;      // capped at ±10
  matches: IngredientMatch[];
  breakdown: Record<string, number>;
  breakdownWeighted: Record<string, number>;
};
```

**Task D1.6: Check feature flag**
- Only apply position weighting if FEATURE_FLAGS.USE_POSITION_WEIGHTING is true
- Otherwise use unweighted logic (backward compatible)

---

### 📋 PART E: SPLIT INGREDIENT DETECTION

#### E1. Config Updates (`scoring/config.ts`)

**Task E1.1: Define split ingredient groups**
```typescript
export const SPLIT_INGREDIENT_GROUPS = {
  LEGUMES: [
    'pea', 'peas', 'pea protein', 'pea flour', 'pea starch',
    'chickpea', 'chickpeas', 'lentil', 'lentils',
    'legume', 'legumes', 'bean', 'beans'
  ],
  CORN: [
    'corn', 'maize', 'corn gluten', 'corn gluten meal',
    'corn meal', 'corn flour', 'corn starch', 'maize flour',
    'maize meal', 'maize starch', 'maize gluten'
  ],
  RICE: [
    'rice', 'rice flour', 'rice starch', 'rice bran',
    'brown rice', 'white rice', 'rice meal'
  ],
  POTATO: [
    'potato', 'potatoes', 'potato protein', 'potato starch',
    'potato flour', 'tapioca', 'cassava', 'tapioca starch'
  ]
} as const;
```

**Task E1.2: Define split penalty thresholds**
```typescript
export const SPLIT_INGREDIENT_PENALTIES = {
  TWO_IN_TOP_10: -1.5,
  THREE_PLUS_IN_TOP_10: -3,
} as const;
```

#### E2. Ingredient Matcher Updates (`scoring/ingredient-matcher.ts`)

**Task E2.1: Create split detection function**
```typescript
function detectSplitIngredients(tokens: TokenInfo[]): {
  splitPenalty: number;
  groupsTriggered: {
    groupName: string;
    countInTop10: number;
    tokensMatched: string[];
  }[];
}
```
- Analyze first 10 tokens only
- For each split group, count matches
- Apply penalties based on count (2+ = -1.5, 3+ = -3)
- Return detailed breakdown

**Task E2.2: Integrate split penalty into bonus calculation**
- Call detectSplitIngredients in calculateIngredientBonusPoints
- Apply penalty to weighted total BEFORE capping at ±10
- Include in output breakdown

**Task E2.3: Check feature flag**
- Only apply if FEATURE_FLAGS.USE_SPLIT_INGREDIENT_PENALTY is true

---

### 📋 PART F: TIERED RED FLAG CAPS

#### F1. Config Updates (`scoring/config.ts`)

**Task F1.1: Define tiered red flag rules**
```typescript
export const RED_FLAG_TIERS = {
  TIER_1_ETHOXYQUIN: {
    maxStars: 2,
    ingredients: ['ethoxyquin'],
    description: 'Ethoxyquin present (banned in human food)'
  },
  TIER_2_ARTIFICIAL_COLORS: {
    maxStars: 3,
    ingredients: ARTIFICIAL_COLORS,
    description: 'Artificial coloring agents present'
  },
  TIER_2_COLORS_SWEETENERS: {
    maxStars: 3,
    requiresAll: true,
    ingredients: {
      colors: ARTIFICIAL_COLORS,
      sweeteners: ['corn syrup', 'cane sugar', 'sucrose', 'fructose', 'dextrose']
    },
    description: 'Contains artificial coloring and added sweeteners'
  },
  TIER_3_UNNAMED_DIGEST: {
    maxStars: 3,
    ingredientsInTop5: ['animal digest', 'meat digest'],
    description: 'Unnamed animal digest as primary ingredient'
  },
  TIER_4_CONTROVERSIAL_ADDITIVES: {
    maxStars: 4,
    threshold: 3,
    ingredients: CONTROVERSIAL_ADDITIVES,
    description: '3+ controversial additives present'
  }
} as const;
```

#### F2. Calculator Updates (`scoring/calculator.ts`)

**Task F2.1: Rewrite `checkRedFlagOverride()` with tiers**
```typescript
function checkRedFlagOverride(
  product: Product,
  ingredientText: string,
  top5Ingredients: string[]
): {
  redFlagsDetected: {
    ruleId: string;
    tier: number;
    capStars: number;
    reason: string;
    matchedTokens: string[];
  }[];
  finalStarCapApplied: number | null;
}
```
- Check all tier rules
- Collect all triggered flags
- Apply LOWEST cap (most strict)
- Return detailed breakdown

**Task F2.2: Update `getScoreGrade()` to use tiered caps**
- Accept redFlagResult parameter
- Apply finalStarCapApplied from tiered system

---

### 📋 PART G: ENHANCED CONFIDENCE SCORE

#### G1. Calculator Updates (`scoring/calculator.ts`)

**Task G1.1: Rewrite `calculateConfidenceScore()` v2.2**
```typescript
function calculateConfidenceScore(
  product: Product,
  nutritionMeta: NutritionMeta,
  energyMetrics: EnergyMetrics
): {
  score: number;
  level: 'High' | 'Medium' | 'Low';
  breakdown: {
    ingredientDisclosure: number;
    nutritionCompleteness: number;
    energyTransparency: number;
    carbsTransparency: number;
    sourcingTransparency: number;
    manufacturingInfo: number;
  };
  details: string[];
}
```

**Component breakdown:**

**1) Ingredient Disclosure (25 pts)**
- ≥3 percentages: 25
- 1-2 percentages: 12
- None: 0

**2) Nutrition Completeness (25 pts)**
- Check protein, fat, fiber, moisture, ash
- Each present and not estimated: 5 points
- Each estimated/defaulted: 2.5 points
- Formula: (fullCredit*5 + halfCredit*2.5)

**3) Energy Transparency (15 pts)**
- Calories stated explicitly: 15
- Calories estimated via Atwater with complete macros: 7
- Missing: 0

**4) Carbs Transparency (10 pts)**
- Carbs explicitly provided: 10
- Computed with moisture+ash present: 6
- Computed with defaults: 2
- Missing: 0

**5) Sourcing Transparency (15 pts)**
- All animal proteins named: 15
- Mixed named/unnamed: 8
- All generic: 0

**6) Manufacturing Info (10 pts)**
- Country + website: 10
- One present: 5
- None: 0

**Task G1.2: Update confidence level thresholds**
- High: ≥80
- Medium: 50-79
- Low: <50

---

### 📋 PART H: INGREDIENT MATCHING ENGINE HARDENING

#### H1. Ingredient Matcher Updates (`scoring/ingredient-matcher.ts`)

**Task H1.1: Add regex escape helper**
```typescript
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
```

**Task H1.2: Improve token normalization**
```typescript
function normalizeToken(token: string): string {
  return token
    .toLowerCase()
    .replace(/\([^)]*\)/g, '') // remove parentheses content
    .replace(/[.,;!?()[\]{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
```

**Task H1.3: Update `containsIngredient()` for token-based matching**
- Accept individual token, not full text blob
- Use escaped regex with word boundaries
- Handle hyphenated ingredients gracefully
- Avoid catastrophic backtracking

**Task H1.4: Test edge cases**
- Ingredients with hyphens: "green-lipped mussel"
- Ingredients with parentheses: "chicken (30%)"
- Ingredients with special chars: "l-carnitine"
- Long ingredient lists (2000+ chars)

---

### 📋 PART I: OUTPUT STRUCTURE & BACKWARD COMPATIBILITY

#### I1. Calculator Updates (`scoring/calculator.ts`)

**Task I1.1: Update `calculateOverallScore()` output structure**
```typescript
return {
  algorithmVersion: "2.2.0",
  overallScore: number,
  ingredientScore: number,
  nutritionScore: number,
  valueScore: number,

  // Existing breakdown
  breakdown: ScoringBreakdown,

  // New v2.2 fields
  dmMetrics: DryMatterMetrics,
  nutritionMeta: NutritionMeta,
  energyMetrics: EnergyMetrics,

  ingredientAnalysis: {
    bonusRaw: number,
    bonusWeighted: number,
    bonusApplied: number,
    matches: IngredientMatch[],
    breakdown: Record<string, number>,
    breakdownWeighted: Record<string, number>,
    splitPenalty: {
      penalty: number,
      groupsTriggered: SplitGroup[]
    }
  },

  // Confidence
  confidenceScore: number,
  confidenceLevel: string,
  confidenceBreakdown: ConfidenceBreakdown,

  // Red flags
  redFlagsDetected: RedFlag[],
  finalStarCapApplied: number | null,

  // Warnings
  warnings: string[],
}
```

**Task I1.2: Add graceful fallback logic**
- If DM cannot be computed: use as-fed, add warning
- If energy cannot be computed: use price/kg, add warning
- If position weighting fails: use unweighted, add warning
- Always return a valid score, never throw

**Task I1.3: Add feature flag checks**
- Wrap each new feature in feature flag check
- Allow gradual rollout
- Document flag behavior

#### I2. TypeScript Type Updates (`types/index.ts`)

**Task I2.1: Add new interfaces**
```typescript
interface DryMatterMetrics {
  dmPercent: number;
  proteinDM: number | null;
  fatDM: number | null;
  fiberDM: number | null;
  carbsDM: number | null;
  usedDefaults: {
    moisture: boolean;
    ash: boolean;
  };
}

interface NutritionMeta {
  carbsProvided: boolean;
  carbsEstimated: boolean;
  ashProvided: boolean;
  ashEstimated: boolean;
  moistureProvided: boolean;
  moistureEstimated: boolean;
  dmBasisUsed: boolean;
}

interface EnergyMetrics {
  kcalPer100g: number | null;
  kcalPerKg: number | null;
  pricePer1000kcal: number | null;
  usedAtwaterEstimate: boolean;
}

// ... etc for all new structures
```

---

### 📋 PART J: TESTING & VALIDATION

#### J1. Create Test Harness (`scripts/test-v2.2-algorithm.ts`)

**Task J1.1: Define test products**
```typescript
const testProducts = {
  premiumDry: {
    name: "Premium Chicken & Sweet Potato",
    category: "dry",
    ingredients: "Fresh chicken (40%), chicken meal (20%), sweet potato, salmon oil, glucosamine, blueberries, chicory root, spinach, vitamins",
    protein: 28,
    fat: 16,
    fiber: 3.5,
    moisture: 10,
    ash: 7.5,
    meatContent: 60,
    price: 6.5
  },
  budgetDry: {
    name: "Bargain Beef Bites",
    ingredients: "Meat meal, corn, wheat, pea protein, peas, pea flour, corn gluten meal, animal fat, artificial color (red 40), BHA, ethoxyquin, salt, vitamins",
    category: "dry",
    protein: 18,
    fat: 12,
    fiber: 3,
    moisture: 10,
    meatContent: 25,
    price: 2.5
  },
  wetFood: {
    name: "Premium Wet Salmon",
    category: "wet",
    ingredients: "Fresh salmon (65%), salmon broth, peas, carrots, salmon oil, vitamins, minerals",
    protein: 10,
    fat: 6,
    fiber: 0.8,
    moisture: 78,
    meatContent: 65,
    price: 4.2
  }
};
```

**Task J1.2: Test DM normalization**
- Verify wet food proteinDM ≈ 45% (10 / 22 * 100)
- Verify wet food scores fairly vs dry after DM conversion
- Check dry food scores remain similar to v2.1

**Task J1.3: Test energy-based value scoring**
- Calculate kcal/kg for each product
- Verify price per 1000kcal makes wet food less "cheap"
- Compare value scores before/after

**Task J1.4: Test position weighting**
- Verify "blueberries" at position 6 gets 0.6 multiplier
- Verify "chicory root" at position 7 gets 0.6 multiplier
- Check total capped at ±10

**Task J1.5: Test split ingredient penalty**
- Verify budgetDry triggers LEGUMES penalty (pea protein + peas + pea flour in top 10)
- Check penalty = -3 (3+ ingredients)
- Verify output includes groupsTriggered details

**Task J1.6: Test tiered red flag caps**
- Verify budgetDry with ethoxyquin caps at 2 stars (Tier 1)
- Verify artificial color alone caps at 3 stars (Tier 2)
- Check multiple flags apply lowest cap

**Task J1.7: Test confidence scoring**
- Verify premiumDry gets High confidence (all data present)
- Verify wetFood gets Medium confidence (ash estimated)
- Verify missing moisture drops confidence appropriately

**Task J1.8: Generate comparison report**
```typescript
function compareScores(productV21: Score, productV22: Score) {
  console.log(`
  === ${productName} ===
  V2.1: ${productV21.overallScore}/100 (${productV21.stars} stars)
  V2.2: ${productV22.overallScore}/100 (${productV22.stars} stars)

  Ingredient: ${productV21.ingredientScore} → ${productV22.ingredientScore}
  Nutrition: ${productV21.nutritionScore} → ${productV22.nutritionScore}
  Value: ${productV21.valueScore} → ${productV22.valueScore}

  Confidence: ${productV21.confidenceScore} → ${productV22.confidenceScore}
  Red Flag Cap: ${productV22.finalStarCapApplied || 'none'}

  Key Changes:
  - DM Protein: ${productV22.dmMetrics.proteinDM}%
  - Price per 1000kcal: £${productV22.energyMetrics.pricePer1000kcal}
  - Split Penalty: ${productV22.ingredientAnalysis.splitPenalty.penalty}
  `);
}
```

#### J2. Unit Tests (if framework exists)

**Task J2.1: Test helpers individually**
- `computeDryMatterMacros()` with various inputs
- `computeCarbsWithDefaults()` with missing ash
- `computeAtwaterEnergy()` with missing macros
- `tokenizeIngredients()` with complex strings
- `getPositionMultiplier()` edge cases
- `detectSplitIngredients()` various combinations
- `checkRedFlagOverride()` all tier scenarios

**Task J2.2: Test edge cases**
- Product with no moisture data
- Product with no ash data
- Product with no carbs data
- Product with empty ingredients
- Product with malformed ingredient list
- Product with very long ingredient list (>100 items)

**Task J2.3: Regression tests**
- Verify v2.1 test cases still produce similar scores when defaults not needed
- Ensure backward compatibility with existing data

---

### 📊 IMPLEMENTATION CHECKLIST

#### Phase 1: Foundation (Config & Types)
- [ ] A1.1 - Add moisture defaults to config
- [ ] A1.2 - Add ash defaults to config
- [ ] A1.3 - Define DM optimal ranges
- [ ] A1.4 - Add feature flags
- [ ] E1.1 - Define split ingredient groups
- [ ] E1.2 - Define split penalties
- [ ] F1.1 - Define tiered red flag rules
- [ ] I2.1 - Add TypeScript interfaces for new structures

#### Phase 2: Core Helpers
- [ ] A2.1 - Create computeDryMatterMacros()
- [ ] B1.1 - Create computeCarbsWithDefaults()
- [ ] C1.1 - Create computeAtwaterEnergy()
- [ ] D1.1 - Create tokenizeIngredients()
- [ ] D1.2 - Add getPositionMultiplier()
- [ ] H1.1 - Add escapeRegExp()
- [ ] H1.2 - Improve normalizeToken()

#### Phase 3: Ingredient Matching Engine
- [ ] H1.3 - Update containsIngredient() for tokens
- [ ] D1.3 - Update analyzeIngredients() with tokenization
- [ ] D1.4 - Update IngredientMatch interface
- [ ] D1.5 - Update calculateIngredientBonusPoints()
- [ ] D1.6 - Check feature flag for position weighting
- [ ] E2.1 - Create detectSplitIngredients()
- [ ] E2.2 - Integrate split penalty into bonus
- [ ] E2.3 - Check feature flag for split penalty

#### Phase 4: Nutrition Scoring
- [ ] A2.2 - Update calculateNutritionScore() for DM
- [ ] A2.3 - Update Fat Content scoring with DM
- [ ] A2.4 - Update Carbohydrate Load with DM
- [ ] A2.5 - Update Fiber & Micronutrients with DM
- [ ] A2.6 - Add DM output to breakdown
- [ ] B1.2 - Use new carbs helper in nutrition
- [ ] B1.3 - Add nutrition meta to output

#### Phase 5: Value Scoring
- [ ] C1.2 - Update calculateValueScore() signature
- [ ] C1.3 - Rewrite Price Competitiveness with dual-mode
- [ ] C1.4 - Rewrite Ingredient-Adjusted Value with smooth function
- [ ] C1.5 - Add energy output to breakdown

#### Phase 6: Red Flags & Confidence
- [ ] F2.1 - Rewrite checkRedFlagOverride() with tiers
- [ ] F2.2 - Update getScoreGrade() for tiered caps
- [ ] G1.1 - Rewrite calculateConfidenceScore() v2.2
- [ ] G1.2 - Update confidence thresholds

#### Phase 7: Integration & Output
- [ ] I1.1 - Update calculateOverallScore() output structure
- [ ] I1.2 - Add graceful fallback logic everywhere
- [ ] I1.3 - Add feature flag checks to all new code
- [ ] Update ALGORITHM_VERSION to "2.2.0"
- [ ] Update LAST_UPDATED date

#### Phase 8: Testing & Validation
- [ ] J1.1 - Define test products
- [ ] J1.2 - Test DM normalization
- [ ] J1.3 - Test energy-based value
- [ ] J1.4 - Test position weighting
- [ ] J1.5 - Test split ingredient penalty
- [ ] J1.6 - Test tiered red flags
- [ ] J1.7 - Test confidence scoring
- [ ] J1.8 - Generate comparison report
- [ ] J2.1 - Write unit tests for helpers
- [ ] J2.2 - Test edge cases
- [ ] J2.3 - Run regression tests

#### Phase 9: Documentation
- [ ] Update algorithm documentation with v2.2 changes
- [ ] Add migration guide from v2.1 to v2.2
- [ ] Document new output fields
- [ ] Document feature flags
- [ ] Add examples for each new feature

---

### 🎯 ACCEPTANCE CRITERIA SUMMARY

**DM Normalization:**
- ✅ Wet food with 78% moisture scores fairly on protein/fat/carbs vs dry food
- ✅ Dry food scores remain similar to v2.1 when moisture ≈10%
- ✅ Missing moisture uses category defaults, confidence drops accordingly

**Carb Calculation:**
- ✅ Missing ash uses sensible defaults by category
- ✅ Carbs no longer artificially inflated
- ✅ Output shows what was provided vs estimated

**Energy & Value:**
- ✅ Very low-energy wet food no longer appears as "great value" on price/kg alone
- ✅ Price per 1000kcal comparison works within category
- ✅ Smooth ingredient-adjusted value function eliminates discrete jumps

**Position Weighting:**
- ✅ Late-list "pixie dust" ingredients contribute less
- ✅ Early premium ingredients still score strongly
- ✅ Applied bonus still capped at ±10

**Split Ingredient Detection:**
- ✅ "Pea protein + peas + pea starch" in top 10 triggers -3 penalty
- ✅ Single pea ingredient does not trigger penalty
- ✅ Penalty only applies to top 10 ingredients

**Tiered Red Flags:**
- ✅ Ethoxyquin caps at 2 stars (cannot reach 3+)
- ✅ Artificial colors cap at 3 stars
- ✅ Multiple flags apply strictest cap
- ✅ Output shows all detected flags with tiers

**Enhanced Confidence:**
- ✅ Missing moisture/ash lowers confidence
- ✅ Estimated calories vs stated calories affects score
- ✅ Confidence breakdown shows exactly what's missing
- ✅ High confidence requires ≥80 points

**Robustness:**
- ✅ No crashes on missing data
- ✅ All feature flags work
- ✅ Backward compatible with v2.1 data
- ✅ Performance acceptable on large ingredient lists

---

### 📝 NOTES FOR IMPLEMENTATION

**Assumptions to Document:**
1. Category defaults are reasonable estimates, not perfect
2. Atwater energy estimation is approximate (actual ME varies)
3. Position weighting assumes comma-separated list (not always perfect)
4. Split detection may miss creative splitting (e.g., different grain types)
5. DM scoring optimal ranges are based on general guidelines, may need tuning

**Edge Cases to Handle:**
- Empty ingredient list → skip ingredient scoring, set 0
- Single ingredient → position index 0, multiplier 1.0
- No commas in ingredient list → treat as single token
- Missing price → cannot score value, return neutral 11 points
- Missing all nutrition data → cannot score nutrition, confidence = 0

**Performance Considerations:**
- Tokenization on 1000+ character strings should be <10ms
- Regex matching per token should be <1ms per token
- Full scoring should complete in <100ms per product
- Consider caching DM metrics if scoring same product multiple times

**Rollout Strategy:**
1. Deploy with all feature flags OFF initially
2. Enable USE_DM_NUTRITION first, monitor scoring changes
3. Enable USE_POSITION_WEIGHTING, verify ingredient scores
4. Enable USE_SPLIT_INGREDIENT_PENALTY, check penalties
5. Enable USE_KCAL_VALUE, monitor value scoring
6. Once stable, set all flags to TRUE by default

---

**END OF TODO LIST**
