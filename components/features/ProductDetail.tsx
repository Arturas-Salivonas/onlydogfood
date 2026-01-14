import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { FoodCard } from '@/components/ui/FoodCard';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils/format';
import { ExternalLink, AlertTriangle, CheckCircle, ChevronDown, ChevronRight, Shield, Info } from 'lucide-react';
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

  return (
    <>
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b border-gray-200">
        <Container className="py-3">
          <div className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && <ChevronRight size={14} className="text-gray-400" />}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-gray-900 font-medium">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="text-gray-600 hover:text-gray-900 transition-colors">
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </Container>
      </div>

      <div className="bg-white">
        <Container className="py-8">
          {/* Product Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

            {/* Safe First Choice Badge */}
            <div className="mb-4">
              {isSafe ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg border border-green-300">
                  <CheckCircle size={20} />
                  <span className="font-semibold">Safe First Choice</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-lg border border-orange-300">
                  <AlertTriangle size={20} />
                  <span className="font-semibold">Not a Safe First Choice</span>
                </div>
              )}
            </div>

            {/* Subtitle */}
            {/* <p className="text-gray-600">
              {isSafe
                ? 'This food meets our standards for first-time owners.'
                : 'This food does not meet our standards for first-time owners.'}
            </p> */}
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Image and Quick Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Product Image */}
              <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden border-2 border-gray-200">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-contain p-6"
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
                className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg py-4 px-6 rounded-lg transition-colors"
              >
                Buy on Amazon
                <ExternalLink size={20} />
              </a>
            </div>

            {/* Right Column - Score and Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Score Card */}
              <div className={`rounded-lg p-6 border-2 ${isSafe ? 'bg-green-50 border-green-300' : 'bg-orange-50 border-orange-300'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-sm font-semibold mb-1 uppercase tracking-wide" style={{ color: isSafe ? '#16a34a' : '#ea580c' }}>
                      Quality Score
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-gray-900">{Math.round(product.overall_score || 0)}</span>
                      <span className="text-2xl text-gray-500">/100</span>
                    </div>
                    {product.star_rating && (
                      <div className="mt-2 text-2xl">
                        {'⭐'.repeat(product.star_rating)}
                      </div>
                    )}
                  </div>

                  {/* Confidence Badge */}
                  {product.confidence_level && (
                    <div className="text-right">
                      <div className="text-xs text-gray-600 mb-1">Confidence</div>
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        product.confidence_level === 'High' ? 'bg-blue-100 text-blue-700' :
                        product.confidence_level === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {product.confidence_level}
                      </div>
                    </div>
                  )}
                </div>

                {/* Red Flag Warning */}
                {product.red_flag_override && (
                  <div className="mt-4 p-4 bg-white rounded-lg border-2 border-orange-300">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">Rating capped at {product.red_flag_override.maxRating} stars</div>
                        <div className="text-sm text-gray-700">{product.red_flag_override.reason}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Score Breakdown */}
                {scoreBreakdown.length > 0 && (
                  <div className="mt-6">
                    <details className="group">
                      <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-2">
                        <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
                        Complete technical breakdown
                      </summary>
                      <div className="mt-3 space-y-1 pl-6">
                        {scoreBreakdown.map((item, idx) => (
                          <div key={idx} className={`flex items-center justify-between text-sm ${
                            item.type === 'section' ? 'mt-3 pt-3 border-t border-gray-200 font-semibold' : ''
                          }`}>
                            <span className={`${
                              item.type === 'section' ? 'text-gray-900 font-semibold' :
                              item.type === 'positive' ? 'text-gray-700' :
                              item.type === 'negative' ? 'text-gray-700' :
                              'text-gray-600'
                            }`}>{item.label}</span>
                            <span className={`font-semibold ${
                              item.type === 'section' ? 'text-gray-900' :
                              item.type === 'positive' ? 'text-green-600' :
                              item.type === 'negative' ? 'text-red-600' :
                              'text-gray-600'
                            }`}>
                              {item.points > 0 && item.type !== 'section' ? '+' : ''}{item.points}
                            </span>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
              </div>

              {/* Top Problems Section - Prominent for poor scoring foods */}
              {scoreAnalysis.topProblems.length > 0 && (
                <div className="bg-red-50 rounded-lg border-2 border-red-200 p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Main concerns with this food</h2>
                      <p className="text-sm text-gray-600 mt-1">These are the biggest issues affecting the quality score</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {scoreAnalysis.topProblems.map((problem, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-4 border border-red-200">
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                            problem.severity === 'high' ? 'bg-red-600' :
                            problem.severity === 'medium' ? 'bg-orange-500' :
                            'bg-yellow-500'
                          }`}>
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 mb-1">{problem.title}</div>
                            <div className="text-sm text-gray-700">{problem.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths & Weaknesses Section */}
              {(scoreAnalysis.strengths.length > 0 || scoreAnalysis.weaknesses.length > 0) && (
                <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">What affects this score</h2>

                  {/* Strengths */}
                  {scoreAnalysis.strengths.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold text-gray-900">What this food does well</h3>
                      </div>
                      <div className="space-y-2">
                        {scoreAnalysis.strengths.map((strength, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                            <div className="flex-shrink-0 px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">
                              +{strength.points}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 text-sm">{strength.label}</div>
                              <div className="text-xs text-gray-600 mt-0.5">{strength.description}</div>
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
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        <h3 className="font-semibold text-gray-900">What brings the score down</h3>
                      </div>
                      <div className="space-y-2">
                        {scoreAnalysis.weaknesses.map((weakness, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                            <div className="flex-shrink-0 px-2 py-1 bg-orange-600 text-white text-xs font-bold rounded">
                              {weakness.points}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 text-sm">{weakness.label}</div>
                              <div className="text-xs text-gray-600 mt-0.5">{weakness.description}</div>
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
                <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Why this isn't a good first choice</h2>
                  <ul className="space-y-2">
                    {product.overall_score && product.overall_score < 50 && (
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400 mt-1">•</span>
                        <span className="text-gray-700">Quality score falls below our minimum standard for first-time owners</span>
                      </li>
                    )}
                    {ingredientFlags.map((flag, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-gray-400 mt-1">•</span>
                        <span className="text-gray-700">{flag.title}: {flag.items.join(', ')}</span>
                      </li>
                    ))}
                    {product.red_flag_override && (
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400 mt-1">•</span>
                        <span className="text-gray-700">{product.red_flag_override.reason}</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* When This Might Still Be Used */}
              {!isSafe && (
                <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">When this might still be used</h2>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span className="text-gray-700">Short-term feeding when budget is extremely limited</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span className="text-gray-700">If your dog has already been eating it without issues</span>
                    </li>
                  </ul>
                </div>
              )}

              {/* Ingredients Section */}
              <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Ingredients</h2>

                {ingredientFlags.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {ingredientFlags.map((flag, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <div className="font-semibold text-orange-900">{flag.title}</div>
                          <div className="text-orange-700 mt-1">{flag.items.join(', ')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {product.ingredients_raw ? (
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {product.ingredients_raw}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No ingredient information available</p>
                )}
              </div>

              {/* Nutritional Analysis */}
              <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Analysis</h2>
                <div className="grid grid-cols-2 gap-4">
                  {product.protein_percent !== null && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Crude protein</div>
                      <div className="text-2xl font-bold text-gray-900">{product.protein_percent}%</div>
                    </div>
                  )}
                  {product.fat_percent !== null && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Crude fat</div>
                      <div className="text-2xl font-bold text-gray-900">{product.fat_percent}%</div>
                    </div>
                  )}
                  {product.fiber_percent !== null && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Crude fiber</div>
                      <div className="text-2xl font-bold text-gray-900">{product.fiber_percent}%</div>
                    </div>
                  )}
                  {product.carbs_percent !== null && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Estimated carbs</div>
                      <div className="text-2xl font-bold text-gray-900">{product.carbs_percent}%</div>
                    </div>
                  )}
                  {product.ash_percent !== null && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Crude ash</div>
                      <div className="text-2xl font-bold text-gray-900">{product.ash_percent}%</div>
                    </div>
                  )}
                  {product.meat_content_percent !== null && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Claimed meat content</div>
                      <div className="text-2xl font-bold text-gray-900">{product.meat_content_percent}%</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing Info */}
              {(product.price_gbp || product.price_per_kg_gbp) && (
                <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Feeding guidelines</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {product.price_per_kg_gbp && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Per day (based on 12kg, basic)</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatPrice(product.price_per_kg_gbp * 0.15)}
                        </div>
                      </div>
                    )}
                    {product.package_size_g && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Package size</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {(product.package_size_g / 1000).toFixed(1)}kg
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Algorithm Transparency */}
              <div className="bg-blue-50 rounded-lg border-2 border-blue-200 p-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold text-gray-900 mb-2">Our scoring algorithm (v2.1.0)</div>
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">
                      We score dog food based on ingredient quality (45pts), nutrition (33pts), and value for money (22pts).
                      Penalties apply for poor processing, additives, and misleading protein claims. Red flags may cap ratings.
                    </p>
                    <Link href="/how-we-rate-dog-food" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Better first choices</h2>
                <p className="text-gray-600">Consider these higher-rated alternatives instead</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.filter(p => isSafeFirstChoice(p)).slice(0, 4).map((relatedProduct) => (
                  <FoodCard key={relatedProduct.id} product={relatedProduct} showComparison={false} />
                ))}
              </div>
            </div>
          )}

          {/* You Might Also Like Section */}
          {isSafe && relatedProducts.length > 0 && (
            <div className="mt-12">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">You might also like</h2>
                <p className="text-gray-600">Similar products in this category</p>
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
