/**
 * Test ingredient parsing with different formats
 */

// Simulate the extractDeclaredPercentage function
function extractDeclaredPercentage(text) {
  // Match patterns like (20%), 20%, (min 20%), (minimum 20%)
  const patterns = [
    /\((\d+(?:\.\d+)?)\s*%\)/,           // (20%)
    /(\d+(?:\.\d+)?)\s*%/,                // 20%
    /\(min(?:imum)?\s+(\d+(?:\.\d+)?)\s*%\)/i,  // (min 20%)
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const percentage = parseFloat(match[1]);
      if (!isNaN(percentage) && percentage >= 0 && percentage <= 100) {
        return percentage;
      }
    }
  }

  return null;
}

// Clean ingredient name (same as in parser)
function cleanIngredient(rawText) {
  return rawText
    .replace(/\(\d+(?:\.\d+)?\s*%\)/g, '')
    .replace(/\d+(?:\.\d+)?\s*%/g, '')
    .replace(/\(min(?:imum)?\s+\d+(?:\.\d+)?\s*%\)/gi, '')
    .replace(/\(\d+(?:\.\d+)?\s*(?:mg|g|mcg|iu|cfu)(?:\/kg)?\)/gi, '')
    .replace(/\.$/, '') // Remove trailing period
    .trim();
}

// Test cases from user's examples
const testCases = [
  // Different percentage formats
  "Salmon Meal 20%",
  "Fresh Salmon 14%",
  "Salmon 12%",
  "Salmon Oil 4%",
  "Rice (17%)",
  "Whole Grain Barley (17%)",
  "Whole Ground Oats (4.5%)",
  "Beet Pulp (4%)",
  "12.5% Dried Peas",
  "Linseed (2%)",
  "8% Dried Carrots",
  "Seaweed (0.2%)",
  "Yucca Extract (0.02%)",
  
  // With trailing period
  "Yucca Extract (0.02%).",
  "Chicken.",
  "Minerals and Yeast.",
  
  // No percentage
  "Maize",
  "Barley",
  "Dried Beet Pulp",
  "Dried Brewers Yeast",
  "Poultry Digest",
  "Minerals",
  "Sodium Chloride",
  "Potassium Chloride",
  "Chicory Extract 0.1%",
  "Marigold Meal",
  "Rapeseed Oil",
];

console.log('Testing Ingredient Parsing\n' + '='.repeat(80));
console.log('\nFormat Tests:');
console.log('='.repeat(80));

testCases.forEach(testCase => {
  const percentage = extractDeclaredPercentage(testCase);
  const cleanName = cleanIngredient(testCase);
  
  console.log(`\nInput:       "${testCase}"`);
  console.log(`Percentage:  ${percentage !== null ? percentage + '%' : 'null (will be estimated)'}`);
  console.log(`Clean Name:  "${cleanName}"`);
});

console.log('\n\n' + '='.repeat(80));
console.log('SUMMARY OF PERCENTAGE DETECTION');
console.log('='.repeat(80));

const formats = {
  'Percentage after name': ['Salmon Meal 20%', 'Fresh Salmon 14%', 'Chicory Extract 0.1%'],
  'Percentage in parentheses': ['Rice (17%)', 'Beet Pulp (4%)', 'Yucca Extract (0.02%)'],
  'Percentage before name': ['12.5% Dried Peas', '8% Dried Carrots'],
  'With trailing period': ['Yucca Extract (0.02%).', 'Chicken.'],
  'No percentage': ['Maize', 'Barley', 'Minerals'],
};

Object.entries(formats).forEach(([format, examples]) => {
  console.log(`\n${format}:`);
  examples.forEach(example => {
    const pct = extractDeclaredPercentage(example);
    const clean = cleanIngredient(example);
    console.log(`  ✓ "${example}" → ${pct !== null ? pct + '%' : 'ESTIMATED'} | Name: "${clean}"`);
  });
});

console.log('\n\n' + '='.repeat(80));
console.log('TESTING REGEX PATTERNS');
console.log('='.repeat(80));

const patterns = [
  { name: 'Pattern 1: (20%)', regex: /\((\d+(?:\.\d+)?)\s*%\)/ },
  { name: 'Pattern 2: 20%', regex: /(\d+(?:\.\d+)?)\s*%/ },
  { name: 'Pattern 3: (min 20%)', regex: /\(min(?:imum)?\s+(\d+(?:\.\d+)?)\s*%\)/i },
];

const testInputs = [
  'Rice (17%)',
  'Salmon Meal 20%',
  '12.5% Dried Peas',
  'Yucca Extract (0.02%).',
  'Maize',
];

testInputs.forEach(input => {
  console.log(`\nTesting: "${input}"`);
  patterns.forEach(({ name, regex }) => {
    const match = input.match(regex);
    if (match) {
      console.log(`  ✓ ${name}: Matched! Extracted: ${match[1]}%`);
    }
  });
});
