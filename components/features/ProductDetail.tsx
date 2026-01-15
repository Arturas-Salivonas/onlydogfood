import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { FoodCard } from '@/components/ui/FoodCard';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils/format';
import { ExternalLink, AlertTriangle, ChevronDown, ChevronRight, Shield, Info } from 'lucide-react';
import { ProtectionIcon } from '@/components/ui/ProtectionIcon';
import { getScoreGrade } from '@/scoring/calculator';
import { HIGH_RISK_FILLERS, LOW_VALUE_CARBS, RED_FLAG_ADDITIVES, ARTIFICIAL_COLORS, ARTIFICIAL_PRESERVATIVES } from '@/scoring/config';

interface ProductDetailProps {
  product: Product;
  relatedProducts: Product[];
}

// Helper function to determine if product is safe first choice
function isSafeFirstChoice(product: Product): boolean {
  const score = product.overall_score || 0;
  const hasRedFlags = product.red_flag_override !== null && product.red_flag_override !== undefined;

  // Safe First Choice: score >= 60 AND no red flag overrides
  return score >= 60 && !hasRedFlags;
}

// Helper function to get score breakdown details
function getScoreBreakdown(product: Product) {
  const breakdown = product.scoring_breakdown;
  if (!breakdown) {
    return [];
  }

  const details = breakdown.details || {};
  const items = [];

  // INGREDIENT QUALITY SECTION (45 points max)
  items.push({ type: 'section', label: 'Ingredient Quality (45 points)', points: Math.round(breakdown.ingredientScore || 0) });

  // Effective meat content (15 points max)
  if (details.effectiveMeatContent !== undefined) {
    items.push({ type: 'positive', label: '  Effective meat content', points: Math.round(details.effectiveMeatContent) });
  }
  if (details.freshMeatPenalty && details.freshMeatPenalty < 0) {
    items.push({ type: 'negative', label: '    Fresh meat water penalty', points: Math.round(details.freshMeatPenalty) });
  }

  // Low-value fillers (10 points max)
  if (details.lowValueFillers !== undefined) {
    items.push({ type: details.lowValueFillers >= 10 ? 'positive' : 'neutral', label: '  Low-value fillers', points: Math.round(details.lowValueFillers) });
  }
  if (details.highRiskFillerPenalty && details.highRiskFillerPenalty < 0) {
    items.push({ type: 'negative', label: '    High-risk filler penalty', points: Math.round(details.highRiskFillerPenalty) });
  }
  if (details.lowValueCarbPenalty && details.lowValueCarbPenalty < 0) {
    items.push({ type: 'negative', label: '    Low-value carb penalty', points: Math.round(details.lowValueCarbPenalty) });
  }

  // Artificial additives (10 points max)
  if (details.noArtificialAdditives !== undefined) {
    items.push({ type: details.noArtificialAdditives >= 10 ? 'positive' : 'neutral', label: '  No artificial additives', points: Math.round(details.noArtificialAdditives) });
  }
  if (details.artificialAdditivePenalty && details.artificialAdditivePenalty < 0) {
    items.push({ type: 'negative', label: '    Artificial additive penalty', points: Math.round(details.artificialAdditivePenalty) });
  }
  if (details.redFlagAdditive && details.redFlagAdditive < 0) {
    items.push({ type: 'negative', label: '    Red flag additive', points: Math.round(details.redFlagAdditive) });
  }

  // Named meat sources (5 points max)
  if (details.namedMeatSources !== undefined) {
    items.push({ type: details.namedMeatSources > 0 ? 'positive' : 'neutral', label: '  Named meat sources', points: Math.round(details.namedMeatSources) });
  }

  // Processing quality (5 points max)
  if (details.processingQuality !== undefined) {
    items.push({ type: details.processingQuality >= 5 ? 'positive' : 'neutral', label: '  Processing quality', points: Math.round(details.processingQuality) });
  }
  if (details.processingPenalty && details.processingPenalty < 0) {
    items.push({ type: 'negative', label: '    Processing penalty', points: Math.round(details.processingPenalty) });
  }

  // NUTRITIONAL VALUE SECTION (33 points max)
  items.push({ type: 'section', label: 'Nutritional Value (33 points)', points: Math.round(breakdown.nutritionScore || 0) });

  // Protein quality (15 points max)
  if (details.proteinQuality !== undefined) {
    items.push({ type: details.proteinQuality > 0 ? 'positive' : 'neutral', label: '  Protein quality', points: Math.round(details.proteinQuality) });
  }
  if (details.proteinIntegrityPenalty && details.proteinIntegrityPenalty < 0) {
    items.push({ type: 'negative', label: '    Protein integrity penalty', points: Math.round(details.proteinIntegrityPenalty) });
  }

  // Moderate fat (8 points max)
  if (details.moderateFat !== undefined) {
    items.push({ type: details.moderateFat > 0 ? 'positive' : 'neutral', label: '  Moderate fat content', points: Math.round(details.moderateFat) });
  }

  // Low carbs (7 points max)
  if (details.lowCarbs !== undefined) {
    items.push({ type: details.lowCarbs > 0 ? 'positive' : 'neutral', label: '  Low carbohydrate content', points: Math.round(details.lowCarbs) });
  }

  // Fiber and micronutrients (3 points max)
  if (details.fiberScore !== undefined) {
    items.push({ type: details.fiberScore > 0 ? 'positive' : 'neutral', label: '  Fiber content', points: Math.round(details.fiberScore) });
  }
  if (details.micronutrientScore !== undefined) {
    items.push({ type: details.micronutrientScore > 0 ? 'positive' : 'neutral', label: '  Functional micronutrients', points: Math.round(details.micronutrientScore) });
  }

  // VALUE FOR MONEY SECTION (22 points max)
  items.push({ type: 'section', label: 'Value for Money (22 points)', points: Math.round(breakdown.valueScore || 0) });

  if (details.valueRating !== undefined) {
    items.push({ type: details.valueRating > 0 ? 'positive' : 'neutral', label: '  Price competitiveness', points: Math.round(details.valueRating) });
  }
  if (details.ingredientValueScore !== undefined) {
    items.push({ type: details.ingredientValueScore > 0 ? 'positive' : 'neutral', label: '  Ingredient value', points: Math.round(details.ingredientValueScore) });
  }

  return items;
}

// NEW: Helper function to analyze strengths, weaknesses, and top problems
function getScoreAnalysis(product: Product) {
  const breakdown = product.scoring_breakdown;
  if (!breakdown || !breakdown.details) {
    return { strengths: [], weaknesses: [], topProblems: [] };
  }

  const details = breakdown.details;
  const strengths: Array<{ label: string; points: number; description: string }> = [];
  const weaknesses: Array<{ label: string; points: number; description: string }> = [];
  const problems: Array<{ severity: 'high' | 'medium' | 'low'; title: string; description: string }> = [];

  // STRENGTHS (positive contributions)
  if (details.effectiveMeatContent && details.effectiveMeatContent >= 12) {
    strengths.push({
      label: 'High meat content',
      points: Math.round(details.effectiveMeatContent),
      description: 'Excellent protein source from quality meat ingredients'
    });
  }

  if (details.namedMeatSources && details.namedMeatSources >= 4) {
    strengths.push({
      label: 'Named meat sources',
      points: Math.round(details.namedMeatSources),
      description: 'Uses specific, identifiable meat sources rather than generic terms'
    });
  }

  if (details.noArtificialAdditives && details.noArtificialAdditives >= 9) {
    strengths.push({
      label: 'No artificial additives',
      points: Math.round(details.noArtificialAdditives),
      description: 'Free from artificial colors, flavors, and preservatives'
    });
  }

  if (details.processingQuality && details.processingQuality >= 4) {
    strengths.push({
      label: 'Quality processing',
      points: Math.round(details.processingQuality),
      description: 'Minimal processing preserves nutritional integrity'
    });
  }

  if (details.proteinQuality && details.proteinQuality >= 12) {
    strengths.push({
      label: 'Excellent protein quality',
      points: Math.round(details.proteinQuality),
      description: 'High protein content from quality sources'
    });
  }

  if (details.lowCarbs && details.lowCarbs >= 5) {
    strengths.push({
      label: 'Low carbohydrate',
      points: Math.round(details.lowCarbs),
      description: 'Species-appropriate low-carb formulation'
    });
  }

  // WEAKNESSES (penalties)
  if (details.freshMeatPenalty && details.freshMeatPenalty < 0) {
    weaknesses.push({
      label: 'Fresh meat water content',
      points: Math.round(details.freshMeatPenalty),
      description: 'High water content in fresh meat ingredients reduces effective protein'
    });
  }

  if (details.highRiskFillerPenalty && details.highRiskFillerPenalty < 0) {
    weaknesses.push({
      label: 'High-risk fillers',
      points: Math.round(details.highRiskFillerPenalty),
      description: 'Contains low-quality filler ingredients with minimal nutritional value'
    });
  }

  if (details.lowValueCarbPenalty && details.lowValueCarbPenalty < 0) {
    weaknesses.push({
      label: 'Low-value carbohydrates',
      points: Math.round(details.lowValueCarbPenalty),
      description: 'Uses cheap carbohydrate sources as primary ingredients'
    });
  }

  if (details.artificialAdditivePenalty && details.artificialAdditivePenalty < 0) {
    weaknesses.push({
      label: 'Artificial additives',
      points: Math.round(details.artificialAdditivePenalty),
      description: 'Contains artificial colors, flavors, or preservatives'
    });
  }

  if (details.redFlagAdditive && details.redFlagAdditive < 0) {
    weaknesses.push({
      label: 'Red flag additive',
      points: Math.round(details.redFlagAdditive),
      description: 'Contains ingredients with known health concerns'
    });
  }

  if (details.proteinIntegrityPenalty && details.proteinIntegrityPenalty < 0) {
    weaknesses.push({
      label: 'Plant protein padding',
      points: Math.round(details.proteinIntegrityPenalty),
      description: 'Uses plant proteins to inflate protein numbers instead of quality meat'
    });
  }

  if (details.processingPenalty && details.processingPenalty < 0) {
    weaknesses.push({
      label: 'Over-processing',
      points: Math.round(details.processingPenalty),
      description: 'Heavy processing may reduce nutritional value'
    });
  }

  // TOP PROBLEMS (identify main issues)
  const ingredientsLower = (product.ingredients_raw || '').toLowerCase();
  const overallScore = product.overall_score || 0;

  // Problem 1: Low meat content (check scoring data, not claimed percentage)
  // effectiveMeatContent score: 0-6 = poor, 6-10 = adequate, 10-13 = good, 13-15 = excellent
  // undefined = not scored (no meat_content_percent data)
  const meatScore = details.effectiveMeatContent;
  if (meatScore !== undefined && meatScore < 10) {
    // Only flag if we have meat scoring data AND it's actually low
    const claimedMeat = product.meat_content_percent || 0;
    problems.push({
      severity: meatScore < 6 ? 'high' : 'medium',
      title: meatScore < 6 ? 'Very low meat content' : 'Low meat content',
      description: claimedMeat > 0
        ? `Only ${claimedMeat}% meat (scored ${Math.round(meatScore)}/15 points). Dogs thrive on meat-based diets. Look for foods with at least 40% quality meat.`
        : `Low meat content (scored ${Math.round(meatScore)}/15 points). Dogs thrive on meat-based diets. Look for foods with at least 40% quality meat.`
    });
  }
  // Note: If meatScore is undefined, don't flag as a problem - we simply don't have the data to score it

  // Problem 2: Grain-heavy (only flag if scoring shows low filler score)
  const fillerScore = details.lowValueFillers || 10;
  const grainKeywords = ['rice', 'wheat', 'corn', 'oat', 'barley', 'maize'];
  const firstIngredients = ingredientsLower.split(',').slice(0, 3).join(',');
  const grainsInTop3 = grainKeywords.filter(g => firstIngredients.includes(g)).length;

  // Only flag grains if filler score is low (meaning penalties were applied)
  if (fillerScore < 8 && grainsInTop3 >= 2) {
    problems.push({
      severity: 'high',
      title: 'Grain-heavy formula',
      description: 'Multiple grains in top ingredients. This is more filler than quality nutrition. Choose meat-first foods.'
    });
  } else if (fillerScore < 9 && ingredientsLower.split(',')[0] && grainKeywords.some(g => ingredientsLower.split(',')[0].includes(g))) {
    problems.push({
      severity: 'medium',
      title: 'Grain-first ingredient',
      description: 'First ingredient is a grain instead of meat. The first ingredient should be a quality protein source.'
    });
  }

  // Problem 3: Artificial additives (only if penalty applied)
  const additiveScore = details.noArtificialAdditives || 0;
  const additivePenalty = details.artificialAdditivePenalty || 0;
  const redFlagPenalty = details.redFlagAdditive || 0;

  // Only flag if there's an actual penalty (score < 10 or penalties applied)
  if (additiveScore < 10 || additivePenalty < 0 || redFlagPenalty < 0) {
    const artificialAdditives = [...RED_FLAG_ADDITIVES, ...ARTIFICIAL_COLORS, ...ARTIFICIAL_PRESERVATIVES];
    const foundAdditives = artificialAdditives.filter(a => ingredientsLower.includes(a.toLowerCase()));
    if (foundAdditives.length > 0) {
      problems.push({
        severity: redFlagPenalty < 0 ? 'high' : 'medium',
        title: 'Artificial additives present',
        description: `Contains ${foundAdditives.slice(0, 3).join(', ')}. These offer no nutritional value and may cause health issues.`
      });
    }
  }

  // Problem 4: High-risk fillers (only if penalty applied)
  const fillerPenalty = details.highRiskFillerPenalty || 0;
  if (fillerPenalty < 0) {
    const highRiskFillers = HIGH_RISK_FILLERS.filter(f => ingredientsLower.includes(f.toLowerCase()));
    if (highRiskFillers.length > 0) {
      problems.push({
        severity: 'medium',
        title: 'Low-quality fillers',
        description: `Contains ${highRiskFillers.slice(0, 3).join(', ')}. These are cheap ingredients that add bulk but little nutrition.`
      });
    }
  }

  // Problem 5: Generic meat terms
  const genericTerms = ['meat', 'poultry', 'animal'];
  const hasGenericMeat = genericTerms.some(term => {
    const regex = new RegExp(`\\b${term}\\b(?! (meal|fat))`, 'i');
    return regex.test(ingredientsLower);
  });
  if (hasGenericMeat && (!details.namedMeatSources || details.namedMeatSources < 3)) {
    problems.push({
      severity: 'medium',
      title: 'Unclear meat sources',
      description: 'Uses generic terms like "meat" or "poultry" instead of specific sources. Quality foods name their ingredients.'
    });
  }

  // Problem 6: Poor protein quality
  if (details.proteinIntegrityPenalty && details.proteinIntegrityPenalty <= -3) {
    problems.push({
      severity: 'medium',
      title: 'Plant protein padding',
      description: 'Relies on plant proteins (pea, soy) to inflate protein numbers. Meat protein is more complete for dogs.'
    });
  }

  // Sort by severity and return top 3
  const severityOrder = { high: 0, medium: 1, low: 2 };
  problems.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return {
    strengths: strengths.slice(0, 5), // Top 5 strengths
    weaknesses: weaknesses.slice(0, 5), // Top 5 weaknesses
    topProblems: problems.slice(0, 3) // Top 3 problems
  };
}

// Helper to analyze ingredients
function analyzeIngredients(product: Product) {
  const ingredientsText = (product.ingredients_raw || '').toLowerCase();
  const allFillers = [...HIGH_RISK_FILLERS, ...LOW_VALUE_CARBS];
  const allAdditives = [...RED_FLAG_ADDITIVES, ...ARTIFICIAL_COLORS, ...ARTIFICIAL_PRESERVATIVES];

  const flags = [];

  // Check for fillers
  const foundFillers = allFillers.filter(f => ingredientsText.includes(f.toLowerCase()));
  if (foundFillers.length > 0) {
    flags.push({
      type: 'warning',
      title: 'Low-value fillers detected',
      items: foundFillers
    });
  }

  // Check for additives
  const foundAdditives = allAdditives.filter(a => ingredientsText.includes(a.toLowerCase()));
  if (foundAdditives.length > 0) {
    flags.push({
      type: 'warning',
      title: 'Artificial additives detected',
      items: foundAdditives
    });
  }

  return flags;
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const isSafe = isSafeFirstChoice(product);
  const scoreData = getScoreGrade(product.overall_score || 0);
  const scoreBreakdown = getScoreBreakdown(product);
  const ingredientFlags = analyzeIngredients(product);
  const scoreAnalysis = getScoreAnalysis(product);

  // Prepare breadcrumbs
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Dog Food', href: '/dog-food' },
    { label: product.name, href: '#' }
  ];

  // Extract first ingredient
  const firstIngredient = product.ingredients_raw
    ? product.ingredients_raw.split(/[,;]/)[0].trim()
    : 'Unknown';

  // Check for grain content (simple check)
  const hasHighGrainContent = product.ingredients_raw
    ? /rice|wheat|corn|grain|barley|oat/i.test(product.ingredients_raw.split(/[,;]/).slice(0, 3).join(' '))
    : false;

  return (
    <>
      {/* Hero Section with Integrated Breadcrumbs */}
      <section className="bg-[var(--color-trust-bg)] bg-helper border-b border-[var(--color-border)] pt-28 md:pt-24">
        <Container className="py-6 md:py-8">
          {/* Breadcrumbs */}
          <nav className="mb-4" aria-label="Breadcrumb">
            <div className="flex items-center gap-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && <ChevronRight size={14} className="text-[var(--color-text-secondary)]" />}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-[var(--color-text-primary)] font-bold">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="text-[var(--color-text-secondary)] hover:text-[var(--color-trust)] transition-colors">
                      {crumb.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* Product Title & Badge */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
            <div className="flex-1">
                      {product.brand?.slug ? (
                  <Link href={`/brands/${product.brand.slug}`} className="hover:text-[var(--color-trust)] transition-colors">
                    {product.brand.name}
                  </Link>
                ) : (
                  <span>{product.brand?.name}</span>
                )}

              <h1 className="text-4xl md:text-5xl font-normal text-[var(--color-text-primary)] mb-3">{product.name}</h1>

            </div>
          </div>

                     <div className="bg-[var(--color-background-card)] rounded-lg border-2 border-[var(--color-border)] p-6 shadow-[var(--shadow-small)]">

                <h5 className="text-2xl font-normal text-[var(--color-text-primary)] mb-4">At a glance</h5>

                <div className="grid md:grid-cols-4 gap-4">
                  {/* First Ingredient */}
                  <div className="flex items-start gap-3">

                    <div className="flex-1">
                      <div className="text-sm text-[var(--color-text-secondary)] mb-1">First ingredient</div>
                      <div className="text-sm  text-[var(--color-text-primary)]\">{firstIngredient}</div>
                    </div>
                  </div>

                  {/* Grain Content */}
                  <div className="flex items-start gap-3">

                    <div className="flex-1">
                      <div className="text-sm text-[var(--color-text-secondary)] mb-1">Grain content</div>
                      <div className="text-sm  text-[var(--color-text-primary)]">{hasHighGrainContent ? 'High in grains' : 'Low in grains'}</div>
                    </div>
                  </div>

                  {/* Best For */}
                  <div className="flex items-start gap-3">

                    <div className="flex-1">
                      <div className="text-sm text-[var(--color-text-secondary)] mb-1">Best for</div>
                      <div className="text-sm  text-[var(--color-text-primary)]">{product.category === 'wet' ? 'Wet food lovers' : product.category === 'snack' ? 'Treats & snacks' : 'Daily kibble feeding'}</div>
                    </div>
                  </div>

                  {/* Processing Type */}
                  <div className="flex items-start gap-3">

                    <div className="flex-1">
                      <div className="text-sm text-[var(--color-text-secondary)] mb-1">Processing</div>
                      <div className="text-sm  text-[var(--color-text-primary)]">{product.category === 'wet' ? 'Wet (canned)' : product.category === 'snack' ? 'Treats/snacks' : 'Dry (kibble)'}</div>
                    </div>
                  </div>
                </div>
              </div>
        </Container>
      </section>

      {/* Jump To Navigation - Sticky */}
      <nav className=" top-16 md:top-24 z-40 bg-[var(--color-background-card)] border-b border-[var(--color-border)] shadow-[var(--shadow-small)]">
        <Container>

          <div className="flex justify-center gap-4 overflow-x-auto py-3 scrollbar-hide">
            <a href="#score" className="px-4 py-2 text-sm font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-trust)] hover:bg-[var(--color-trust-bg)] rounded-lg transition-all whitespace-nowrap">
              Score
            </a>
            <a href="#ingredients" className="px-4 py-2 text-sm font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-trust)] hover:bg-[var(--color-trust-bg)] rounded-lg transition-all whitespace-nowrap">
              Ingredients
            </a>
            <a href="#nutrition" className="px-4 py-2 text-sm font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-trust)] hover:bg-[var(--color-trust-bg)] rounded-lg transition-all whitespace-nowrap">
              Nutrition
            </a>
            <a href="#analysis" className="px-4 py-2 text-sm font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-trust)] hover:bg-[var(--color-trust-bg)] rounded-lg transition-all whitespace-nowrap">
              Analysis
            </a>
          </div>
        </Container>
      </nav>

      {/* Main Content */}
      <div className=" bg-[var(--color-background-neutral)]">
        <Container className="py-6 md:py-8">
          {/* Main Content Grid */}
          <div className=" grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - Sticky Sidebar */}
            <div className="lg:col-span-1">
              <div className=" sticky  lg:top-28 space-y-6">
                             {/* Safe First Choice Badge */}
                <div className={`mb-4 p-4 rounded-lg border-2 ${isSafe ? 'bg-[var(--color-trust-bg)] border-[var(--color-trust)]' : 'bg-[var(--color-caution-bg)] border-[var(--color-caution)]'}` }>
                  <div className="flex items-center gap-3">

                    {isSafe ? (

                      <ProtectionIcon className="w-6 h-6" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-[var(--color-caution)]" />
                    )}
                    <div>
                      <div className="font-bold text-[var(--color-text-primary)] text-lg">
                        {isSafe ? 'Safe First Choice' : 'Not Recommended'}
                      </div>
                      <div className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                        {isSafe ? 'This food meets our quality standards for daily feeding' : 'Consider higher-rated alternatives for your dog'}
                      </div>
                    </div>
                  </div>
                </div>
              {/* Product Image */}
              <div className="product-image-helper relative aspect-square bg-[var(--color-background-neutral)]  ">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className=" object-contain p-6"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-6xl">🐕</span>
                  </div>
                )}
              </div>

              {/* Buy Button */}
              <a
                href={product.affiliate_url || 'https://amazon.co.uk'}
                target="_blank"
                rel="noopener sponsored"
                className="flex items-center justify-center gap-2 w-full bg-[#FF9900] hover:bg-[#F08800] text-[#131921] font-bold text-lg py-4 px-6 rounded-lg transition-all shadow-[var(--shadow-medium)]"
              >
                Buy on Amazon
                <ExternalLink size={20} />
              </a>
              </div>
            </div>

            {/* Right Column - Score and Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* At a Glance Card */}


              {/* Score Card */}
              <div id="score" className={`scroll-mt-32 rounded-lg p-6 border-2 ${isSafe ? 'bg-[var(--color-trust-bg)] border-[var(--color-trust)]' : 'bg-[var(--color-caution-bg)] border-[var(--color-caution)]'}`}>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-4">
                  {/* Score Circle */}
                  <div className="flex items-center gap-6">
                    <div className="relative w-32 h-32 flex-shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Background circle */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="var(--color-border)"
                          strokeWidth="8"
                        />
                        {/* Progress arc */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={isSafe ? 'var(--color-trust)' : 'var(--color-caution)'}
                          strokeWidth="8"
                          strokeDasharray={`${(product.overall_score || 0) * 2.51} 251`}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-[var(--color-text-primary)]">{Math.round(product.overall_score || 0)}</span>
                        <span className="text-xs text-[var(--color-text-secondary)]">out of 100</span>
                      </div>
                    </div>

                    <div>
                      <div className={`text-sm font-bold mb-1 uppercase tracking-wide ${isSafe ? 'text-[var(--color-trust)]' : 'text-[var(--color-caution)]'}`}>
                        Quality Score
                      </div>
                      {product.star_rating && (
                        <div className="text-2xl mb-2">
                          {'⭐'.repeat(product.star_rating)}
                        </div>
                      )}
                      <div className="text-sm text-[var(--color-text-secondary)]">
                        {scoreData.grade} quality
                      </div>
                    </div>
                  </div>

                </div>

                {/* Red Flag Warning */}
                {product.red_flag_override && (
                  <div className="mt-4 p-4 bg-[var(--color-background-card)] rounded-lg border-2 border-[var(--color-caution)]">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-[var(--color-caution)] flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-[var(--color-text-primary)] mb-1">Rating capped at {product.red_flag_override.maxRating} stars</div>
                        <div className="text-sm text-[var(--color-text-secondary)]">{product.red_flag_override.reason}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Score Breakdown */}
                {scoreBreakdown.length > 0 && (
                  <div className="mt-6">
                    <details className="group" open>
                      <summary className="cursor-pointer text-sm font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-trust)] flex items-center gap-2">
                        <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
                        Complete technical breakdown
                      </summary>
                      <div className="mt-3 space-y-1 pl-6">
                        {scoreBreakdown.map((item, idx) => (
                          <div key={idx} className={`flex items-center gap-3 text-sm ${
                            item.type === 'section' ? 'mt-3 pt-3 border-t border-[var(--color-border)] font-bold' : ''
                          }`}>
                            <span className={`font-bold min-w-[3rem] ${
                              item.type === 'section' ? 'text-[var(--color-text-primary)]' :
                              item.type === 'positive' ? 'text-[var(--color-trust)]' :
                              item.type === 'negative' ? 'text-[var(--color-caution)]' :
                              'text-[var(--color-text-secondary)]'
                            }`}>
                              {item.points > 0 && item.type !== 'section' ? '+' : ''}{item.points}
                            </span>
                            <span className={`flex-1 ${
                              item.type === 'section' ? 'text-[var(--color-text-primary)] font-bold' :
                              item.type === 'positive' ? 'text-[var(--color-text-secondary)]' :
                              item.type === 'negative' ? 'text-[var(--color-text-secondary)]' :
                              'text-[var(--color-text-secondary)]'
                            }`}>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
              </div>

              {/* Top Problems Section - Prominent for poor scoring foods */}
              {scoreAnalysis.topProblems.length > 0 && (
                <div className="bg-[var(--color-caution-bg)] rounded-lg border-2 border-[var(--color-caution)] p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="w-5 h-5 text-[var(--color-caution)] flex-shrink-0 mt-0.5" />
                    <div>
                      <h2 className="text-xl font-normal text-[var(--color-text-primary)]">Main concerns with this food</h2>
                      <p className="text-sm text-[var(--color-text-secondary)] mt-1">These are the biggest issues affecting the quality score</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {scoreAnalysis.topProblems.map((problem, idx) => (
                      <div key={idx} className="bg-[var(--color-background-card)] rounded-lg p-4 border border-[var(--color-caution)]">
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                            problem.severity === 'high' ? 'bg-[var(--color-caution)]' :
                            problem.severity === 'medium' ? 'bg-[var(--color-caution)]' :
                            'bg-[var(--color-trust)]'
                          }`}>
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-[var(--color-text-primary)] mb-1">{problem.title}</div>
                            <div className="text-sm text-[var(--color-text-secondary)]">{problem.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths & Weaknesses Section */}
              {(scoreAnalysis.strengths.length > 0 || scoreAnalysis.weaknesses.length > 0) && (
                <div id="analysis" className="scroll-mt-32 bg-[var(--color-background-card)] rounded-lg border-2 border-[var(--color-border)] p-6">
                  <h3 className="text-xl font-normal text-[var(--color-text-primary)] mb-4">What this food does well</h3>

                  {/* Strengths */}
                  {scoreAnalysis.strengths.length > 0 && (
                    <div className="mb-6">

                      <div className="space-y-2">
                        {scoreAnalysis.strengths.map((strength, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-[var(--color-trust-bg)] rounded-lg">
                            <div className="flex-shrink-0 px-2 py-1 bg-[var(--color-trust)] text-white text-xs font-bold rounded">
                              +{strength.points}
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-[var(--color-text-primary)] text-sm">{strength.label}</div>
                              <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">{strength.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Weaknesses */}
                  {scoreAnalysis.weaknesses.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-[var(--color-caution)]" />
                        <h3 className="font-bold text-[var(--color-text-primary)]">What brings the score down</h3>
                      </div>
                      <div className="space-y-2">
                        {scoreAnalysis.weaknesses.map((weakness, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-[var(--color-caution-bg)] rounded-lg">
                            <div className="flex-shrink-0 px-2 py-1 bg-[var(--color-caution)] text-white text-xs font-bold rounded">
                              {weakness.points}
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-[var(--color-text-primary)] text-sm">{weakness.label}</div>
                              <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">{weakness.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Not Safe First Choice - Why Not Section */}
              {!isSafe && (
                <div className="bg-[var(--color-background-card)] rounded-lg border-2 border-[var(--color-border)] p-6">
                  <h2 className="text-xl font-normal text-[var(--color-text-primary)] mb-4">Why this isn't a good first choice</h2>
                  <ul className="space-y-2">
                    {product.overall_score && product.overall_score < 50 && (
                      <li className="flex items-start gap-2">
                        <span className="text-[var(--color-text-secondary)] mt-1">•</span>
                        <span className="text-[var(--color-text-secondary)]">Quality score falls below our minimum standard for first-time owners</span>
                      </li>
                    )}
                    {ingredientFlags.map((flag, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[var(--color-text-secondary)] mt-1">•</span>
                        <span className="text-[var(--color-text-secondary)]">{flag.title}: {flag.items.join(', ')}</span>
                      </li>
                    ))}
                    {product.red_flag_override && (
                      <li className="flex items-start gap-2">
                        <span className="text-[var(--color-text-secondary)] mt-1">•</span>
                        <span className="text-[var(--color-text-secondary)]">{product.red_flag_override.reason}</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* When This Might Still Be Used */}
              {!isSafe && (
                <div className="bg-[var(--color-background-neutral)] rounded-lg border-2 border-[var(--color-border)] p-6">
                  <h2 className="text-xl font-normal text-[var(--color-text-primary)] mb-4">When this might still be used</h2>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--color-text-secondary)] mt-1">•</span>
                      <span className="text-[var(--color-text-secondary)]">Short-term feeding when budget is extremely limited</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--color-text-secondary)] mt-1">•</span>
                      <span className="text-[var(--color-text-secondary)]">If your dog has already been eating it without issues</span>
                    </li>
                  </ul>
                </div>
              )}



              {/* Algorithm Transparency */}
              <div className="bg-[var(--color-trust-light)] rounded-lg border-2 border-[var(--color-trust)] p-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[var(--color-trust)] flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-bold text-[var(--color-text-primary)] mb-2">Our scoring algorithm (v2.1.0)</div>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-3">
                      We score dog food based on ingredient quality (45pts), nutrition (33pts), and value for money (22pts).
                      Penalties apply for poor processing, additives, and misleading protein claims. Red flags may cap ratings.
                    </p>
                    <Link href="/how-we-rate-dog-food" className="text-sm text-[var(--color-trust)] hover:opacity-80 font-bold">
                      Learn how we rate dog food →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Better First Choices Section */}
          {!isSafe && relatedProducts.length > 0 && (
            <div className="mt-12">
              <div className="mb-6">
                <h2 className="text-2xl font-normal text-[var(--color-text-primary)] mb-2">Better first choices</h2>
                <p className="text-[var(--color-text-secondary)]">Consider these higher-rated alternatives instead</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.filter(p => isSafeFirstChoice(p)).slice(0, 4).map((relatedProduct) => (
                  <FoodCard key={relatedProduct.id} product={relatedProduct} showComparison={false} />
                ))}
              </div>
            </div>
          )}

<div className="mt-12">
                {/* Three-Column Layout: Ingredients, Nutrition, Feeding */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Ingredients Section */}
                <div id="ingredients" className="scroll-mt-32 bg-[var(--color-background-card)] rounded-lg border-2 border-[var(--color-border)] p-6">
                  <h3 className="text-xl font-normal text-[var(--color-text-primary)] mb-4">Ingredients</h3>

                {ingredientFlags.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {ingredientFlags.map((flag, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-3 bg-[var(--color-caution-bg)] border border-[var(--color-caution)] rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-[var(--color-caution)] flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <div className="font-bold text-[var(--color-text-primary)]">{flag.title}</div>
                          <div className="text-[var(--color-text-secondary)] mt-1">{flag.items.join(', ')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {product.ingredients_raw ? (
                  <>
                    {/* Top 5 Ingredients */}
                    <div className="mb-4">
                      <h6 className="text-sm font-bold text-[var(--color-text-primary)] mb-2">Top 5 ingredients (most important)</h6>
                      <div className="flex flex-wrap gap-2">
                        {product.ingredients_raw.split(/[,;]/).slice(0, 5).map((ing, i) => (
                          <span key={i} className="px-3 py-1 bg-[var(--color-trust-bg)] text-[var(--color-trust)] rounded-full text-sm font-bold border border-[var(--color-trust)]">
                            #{i+1} {ing.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Full Ingredient List - Collapsible */}
                    <details className="group">
                      <summary className="cursor-pointer text-sm font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-trust)] transition-colors mb-2">
                        View all ingredients
                      </summary>
                      <div className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed p-3 bg-[var(--color-background-neutral)] rounded-lg">
                        {product.ingredients_raw}
                      </div>
                    </details>
                  </>
                  ) : (
                    <p className="text-sm text-[var(--color-text-secondary)] italic">No ingredient information available</p>
                  )}
                </div>

                {/* Nutritional Analysis */}
                <div id="nutrition" className="scroll-mt-32 bg-[var(--color-background-card)] rounded-lg border-2 border-[var(--color-border)] p-6">
                  <h3 className="text-xl font-normal text-[var(--color-text-primary)] mb-4">Nutrition analysis</h3>
                <div className="space-y-4">
                  {product.protein_percent !== null && (
                    <div>
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-sm font-bold text-[var(--color-text-primary)]">Crude protein</span>
                        <span className="text-xl font-bold text-[var(--color-text-primary)]">{product.protein_percent}%</span>
                      </div>
                      <div className="w-full bg-[var(--color-background-neutral)] rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all ${product.protein_percent >= 25 && product.protein_percent <= 35 ? 'bg-[var(--color-trust)]' : 'bg-[var(--color-caution)]'}`}
                          style={{ width: `${Math.min(product.protein_percent * 2, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-[var(--color-text-secondary)] mt-1">
                        Optimal: 25-35% • {product.protein_percent >= 25 && product.protein_percent <= 35 ? 'Good' : product.protein_percent > 35 ? 'High' : 'Low'}
                      </div>
                    </div>
                  )}
                  {product.fat_percent !== null && (
                    <div>
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-sm font-bold text-[var(--color-text-primary)]">Crude fat</span>
                        <span className="text-xl font-bold text-[var(--color-text-primary)]">{product.fat_percent}%</span>
                      </div>
                      <div className="w-full bg-[var(--color-background-neutral)] rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all ${product.fat_percent >= 12 && product.fat_percent <= 20 ? 'bg-[var(--color-trust)]' : 'bg-[var(--color-caution)]'}`}
                          style={{ width: `${Math.min(product.fat_percent * 4, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-[var(--color-text-secondary)] mt-1">
                        Optimal: 12-20% • {product.fat_percent >= 12 && product.fat_percent <= 20 ? 'Good' : product.fat_percent > 20 ? 'High' : 'Low'}
                      </div>
                    </div>
                  )}
                  {product.fiber_percent !== null && (
                    <div>
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-sm font-bold text-[var(--color-text-primary)]">Crude fiber</span>
                        <span className="text-xl font-bold text-[var(--color-text-primary)]">{product.fiber_percent}%</span>
                      </div>
                      <div className="w-full bg-[var(--color-background-neutral)] rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all ${product.fiber_percent >= 2 && product.fiber_percent <= 8 ? 'bg-[var(--color-trust)]' : 'bg-[var(--color-caution)]'}`}
                          style={{ width: `${Math.min(product.fiber_percent * 10, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-[var(--color-text-secondary)] mt-1">
                        Optimal: 2-8% • {product.fiber_percent >= 2 && product.fiber_percent <= 8 ? 'Good' : product.fiber_percent > 8 ? 'High' : 'Low'}
                      </div>
                    </div>
                  )}
                  {product.carbs_percent !== null && (
                    <div>
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-sm font-bold text-[var(--color-text-primary)]">Estimated carbs</span>
                        <span className="text-xl font-bold text-[var(--color-text-primary)]">{product.carbs_percent}%</span>
                      </div>
                      <div className="w-full bg-[var(--color-background-neutral)] rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all ${product.carbs_percent <= 30 ? 'bg-[var(--color-trust)]' : 'bg-[var(--color-caution)]'}`}
                          style={{ width: `${Math.min(product.carbs_percent * 1.5, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-[var(--color-text-secondary)] mt-1">
                        Optimal: &lt;30% • {product.carbs_percent <= 30 ? 'Good' : 'High'}
                      </div>
                    </div>
                  )}
                  {product.ash_percent !== null && (
                    <div>
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-sm font-bold text-[var(--color-text-primary)]">Crude ash</span>
                        <span className="text-xl font-bold text-[var(--color-text-primary)]">{product.ash_percent}%</span>
                      </div>
                      <div className="text-xs text-[var(--color-text-secondary)]">
                        Mineral content indicator
                      </div>
                    </div>
                  )}
                  {product.meat_content_percent !== null && (
                    <div>
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-sm font-bold text-[var(--color-text-primary)]">Claimed meat content</span>
                        <span className="text-xl font-bold text-[var(--color-text-primary)]">{product.meat_content_percent}%</span>
                      </div>
                      <div className="w-full bg-[var(--color-background-neutral)] rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all ${product.meat_content_percent >= 30 ? 'bg-[var(--color-trust)]' : 'bg-[var(--color-caution)]'}`}
                          style={{ width: `${Math.min(product.meat_content_percent, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-[var(--color-text-secondary)] mt-1">
                        Good: &ge;30% • {product.meat_content_percent >= 30 ? 'Good' : 'Low'}
                      </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Feeding Guidelines */}
                {(product.price_gbp || product.price_per_kg_gbp) && (
                  <div className="bg-[var(--color-background-card)] rounded-lg border-2 border-[var(--color-border)] p-6">
                    <h3 className="text-xl font-normal text-[var(--color-text-primary)] mb-4">Feeding guidelines</h3>
                    <div className="space-y-4">
                      {product.price_per_kg_gbp && (
                        <div>
                          <div className="text-sm text-[var(--color-text-secondary)] mb-1">Per day (based on 12kg, basic)</div>
                          <div className="text-2xl font-bold text-[var(--color-text-primary)]">
                            {formatPrice(product.price_per_kg_gbp * 0.15)}
                          </div>
                        </div>
                      )}
                      {product.package_size_g && (
                        <div>
                          <div className="text-sm text-[var(--color-text-secondary)] mb-1">Package size</div>
                          <div className="text-2xl font-bold text-[var(--color-text-primary)]">
                            {(product.package_size_g / 1000).toFixed(1)}kg
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
</div>
          {/* You Might Also Like Section */}
          {isSafe && relatedProducts.length > 0 && (
            <div className="mt-12">
              <div className="mb-6">
                <h3 className="text-2xl font-normal text-[var(--color-text-primary)] mb-2">You might also like</h3>
                <p className="text-[var(--color-text-secondary)]">Similar products in this category</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.slice(0, 4).map((relatedProduct) => (
                  <FoodCard key={relatedProduct.id} product={relatedProduct} showComparison={false} />
                ))}
              </div>
            </div>
          )}
        </Container>
      </div>
    </>
  );
}
