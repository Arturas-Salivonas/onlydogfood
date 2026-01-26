// Test trailing period removal

function cleanIngredient(rawText) {
  return rawText
    .replace(/\(\d+(?:\.\d+)?\s*%\)/g, '')
    .replace(/\d+(?:\.\d+)?\s*%/g, '')
    .replace(/\(min(?:imum)?\s+\d+(?:\.\d+)?\s*%\)/gi, '')
    .replace(/\(\d+(?:\.\d+)?\s*(?:mg|g|mcg|iu|cfu)(?:\/kg)?\)/gi, '')
    .replace(/\.$/, '')
    .trim();
}

const tests = [
  "Yucca Extract (0.01%)",
  "Yucca Extract (0.01%).",
  "Chicken.",
  "Minerals and Yeast.",
  "Yucca Extract .",
];

console.log('Testing Trailing Period Removal:\n');
tests.forEach(test => {
  const cleaned = cleanIngredient(test);
  console.log(`Input:  "${test}"`);
  console.log(`Output: "${cleaned}"`);
  console.log(`Periods removed: ${test.includes('.') && !cleaned.includes('.')? 'YES' : 'NO'}\n`);
});
