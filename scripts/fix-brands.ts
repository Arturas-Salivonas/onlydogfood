#!/usr/bin/env node

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getServiceSupabase } from '../lib/supabase';

async function fixInvalidTagIds() {
  const supabase = getServiceSupabase();

  // Find product_tags with invalid tag_id values
  const { data: allTags, error: fetchError } = await supabase
    .from('product_tags')
    .select('id, product_id, tag_id')
    .limit(1000);

  if (fetchError) {
    console.error('Error fetching product_tags:', fetchError);
    return;
  }

  // Filter invalid tag_ids in JavaScript
  const invalidTags = allTags?.filter(tag => {
    const tagId = tag.tag_id;
    return tagId === 'undefined' || tagId === 'null' || tagId === 'NaN' || tagId === '' || (typeof tagId === 'string' && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(tagId));
  }) || [];

  console.log(`Found ${invalidTags.length} product_tags with invalid tag_id`);

  if (invalidTags.length > 0) {
    console.log('Invalid product_tags:');
    invalidTags.slice(0, 10).forEach(tag => {
      console.log(`- ID: ${tag.id}, Product: ${tag.product_id}, tag_id: "${tag.tag_id}"`);
    });

    // Delete invalid product_tags
    const { error: deleteError } = await supabase
      .from('product_tags')
      .delete()
      .in('id', invalidTags.map(t => t.id));

    if (deleteError) {
      console.error('Error deleting invalid product_tags:', deleteError);
    } else {
      console.log(`Deleted ${invalidTags.length} invalid product_tags`);
    }
  }
}

async function fixProductBrandRelationships() {
  const supabase = getServiceSupabase();

  // Get all brands for lookup
  const { data: brands, error: brandsError } = await supabase
    .from('brands')
    .select('id, name, slug')
    .order('name');

  if (brandsError) {
    console.error('Error fetching brands:', brandsError);
    return;
  }

  console.log(`Loaded ${brands.length} brands for matching`);

  // Create brand lookup maps
  const brandByName = new Map<string, any>();
  const brandBySlug = new Map<string, any>();

  brands.forEach(brand => {
    brandByName.set(brand.name.toLowerCase(), brand);
    brandBySlug.set(brand.slug.toLowerCase(), brand);
  });

  // Get products with null brand_id
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, brand_id')
    .is('brand_id', null);

  if (productsError) {
    console.error('Error fetching products:', productsError);
    return;
  }

  console.log(`Found ${products.length} products with null brand_id`);

  let matched = 0;
  let notMatched = 0;
  const notMatchedProducts: any[] = [];

  for (const product of products) {
    const productName = product.name.toLowerCase();
    let matchedBrand = null;

    // Try to match by brand name at the start of product name
    for (const [brandName, brand] of brandByName) {
      if (productName.startsWith(brandName + ' ')) {
        matchedBrand = brand;
        break;
      }
    }

    // If not found, try some common variations
    if (!matchedBrand) {
      // Handle some special cases
      const specialMappings: { [key: string]: string } = {
        "alpha spirit": "alpha-spirit",
        "bella + duke": "bella-and-duke",
        "billy & margot": "billy-and-margot",
        "bob & lush": "bob-and-lush",
        "bounce and bella": "bounce-and-bella",
        "butcher's": "butchers",
        "concept for life": "concept-for-life",
        "country kibble": "country-kibble",
        "country pursuit": "country-pursuit",
        "dachshund superfood": "dachshund-superfood",
        "different dog": "different-dog",
        "earl's": "earls",
        "edgard & cooper": "edgard-and-cooper",
        "edmondson's": "edmondsons",
        "embark on raw": "embark-on-raw",
        "fish4dogs": "fish4dogs",
        "forthglade": "forthglade",
        "go native": "go-native",
        "green & wilds": "green-and-wilds",
        "green pantry": "green-pantry",
        "greenacres": "greenacres",
        "griffith's": "griffiths",
        "growling tums": "growling-tums",
        "grub club": "grub-club",
        "harley & marley": "harley-and-marley",
        "healthy paws": "healthy-paws",
        "heights farm": "heights-farm",
        "henley raw": "henley-raw",
        "hi life": "hilife",
        "hill's prescription diet": "hills-prescription-diet",
        "hill's science plan": "hills-science-plan",
        "hoddys": "hoddys",
        "honey's": "honeys",
        "hownd": "hownd",
        "hug pet food": "hug-pet-food",
        "innocent hound": "innocent-hound",
        "jack wolf": "jack-wolf",
        "james & ella": "james-and-ella",
        "james wellbeloved": "james-wellbeloved",
        "josera": "josera",
        "k9 connectables": "k9-connectables",
        "k9 optimum": "k9-optimum",
        "k9 prime cuts": "k9-prime-cuts",
        "lakes collection": "lakes-collection",
        "langham's": "langhams",
        "laughing dog": "laughing-dog",
        "leader": "leader",
        "lecker bites": "lecker-bites",
        "life stage": "lifestage",
        "lily's kitchen": "lilys-kitchen",
        "little bigpaw": "little-bigpaw",
        "louis & ada": "louis-and-ada",
        "lovejoys": "lovejoys",
        "luna & me": "luna-and-me",
        "mac's": "macs",
        "markus muehle": "markus-muehle",
        "marleybones": "marleybones",
        "mcadams": "mcadams",
        "mcintyres": "mcintyres",
        "mersey raw": "mersey-raw",
        "michie's of cornwall": "michies-of-cornwall",
        "millies wolfheart": "millies-wolfheart",
        "miraculous meals": "miraculous-meals",
        "munch & crunch": "munch-and-crunch",
        "my pet says": "my-pet-says",
        "naked dog": "naked-dog",
        "natural dog food company": "natural-dog-food-company",
        "natural greatness": "natural-greatness",
        "natural instinct": "natural-instinct",
        "nature's feast": "natures-feast",
        "nature's harvest": "natures-harvest",
        "nature's variety": "natures-variety",
        "nature's way": "natures-way",
        "naturea": "naturea",
        "naturediet": "naturediet",
        "natures deli": "natures-deli",
        "natures menu": "natures-menu",
        "naturo": "naturo",
        "nose2tail": "nose2tail",
        "nutribalance": "nutribalance",
        "nutriment": "nutriment",
        "nutripaw": "nutripaw",
        "nutrivet": "nutrivet",
        "nutriwolds": "nutriwolds",
        "nutro": "nutro",
        "opti life": "opti-life",
        "orijen": "orijen",
        "orlando": "orlando",
        "orygo": "orygo",
        "paleo ridge": "paleo-ridge",
        "paul o'grady's": "paul-ogradys",
        "paw-cura": "paw-cura",
        "pedigree": "pedigree",
        "perrito": "perrito",
        "pet bakery": "pet-bakery",
        "pet munchies": "pet-munchies",
        "pets at home": "pets-at-home",
        "piccolo": "piccolo",
        "pitpat": "pitpat",
        "platinum": "platinum",
        "pooch & mutt": "pooch-and-mutt",
        "pooch's": "poochs",
        "poppy's picnic": "poppys-picnic",
        "pro plan": "pro-plan",
        "prodog": "prodog",
        "pure pet food": "pure-pet-food",
        "purizon": "purizon",
        "raaw": "raaw",
        "raw & simple": "raw-and-simple",
        "rawgeous": "rawgeous",
        "rinti": "rinti",
        "rocco": "rocco",
        "rocketo": "rocketo",
        "rockster": "rockster",
        "ror": "ror",
        "rosie's farm": "rosies-farm",
        "royal canin": "royal-canin",
        "rude dog food": "rude-dog-food",
        "sainsbury's": "sainsburys",
        "salters": "salters",
        "salubrious healthy dog food": "salubrious-healthy-dog-food",
        "sausage dog sanctuary food": "sausage-dog-sanctuary-food",
        "scooch": "scooch",
        "scrumbles": "scrumbles",
        "scrumpf": "scrumpf",
        "seven pet": "seven-pet",
        "simpsons": "simpsons",
        "skinner's": "skinners",
        "skipper's": "skippers",
        "sneyd's wonderdog": "sneyds-wonderdog",
        "solimo": "solimo",
        "soopa pets": "soopa-pets",
        "southend dog training": "southend-dog-training",
        "specific": "specific",
        "step up to naturals": "step-up-to-naturals",
        "symply": "symply",
        "tails.com": "tails-com",
        "taste of the wild": "taste-of-the-wild",
        "techni-cal": "techni-cal",
        "terra canis": "terra-canis",
        "tesco": "tesco",
        "the pack": "the-pack",
        "thrive": "thrive",
        "tilly & ted": "tilly-and-ted",
        "tippy taps": "tippy-taps",
        "tribal": "tribal",
        "trophy pet foods": "trophy-pet-foods",
        "truline": "truline",
        "tuggs": "tuggs",
        "vale pet foods": "vale-pet-foods",
        "vet's kitchen": "vets-kitchen",
        "vetspec": "vetspec",
        "virbac": "virbac",
        "vitalin": "vitalin",
        "wagg": "wagg",
        "wainwright's": "wainwrights",
        "waitrose": "waitrose",
        "walker & drake": "walker-and-drake",
        "webbox": "webbox",
        "wellness": "wellness",
        "whimzees": "whimzees",
        "whistler's": "whistlers",
        "wild pet food": "wild-pet-food",
        "wildpack": "wildpack",
        "wildways": "wildways",
        "wilko": "wilko",
        "wilsons": "wilsons",
        "winalot": "winalot",
        "winner": "winner",
        "wolf of wilderness": "wolf-of-wilderness",
        "wolf tucker": "wolf-tucker",
        "wolfworthy": "wolfworthy",
        "woolf": "woolf",
        "workinghprs": "workinghprs",
        "wowdog": "wowdog",
        "wzis": "wzis",
        "yakers": "yakers",
        "yarrah": "yarrah",
        "ydolo": "ydolo",
        "years": "years",
        "yora": "yora",
        "yumwoof": "yumwoof",
        "zealandia": "zealandia",
        "zenoo": "zenoo",
        "ziwi peak": "ziwi-peak"
      };

      for (const [pattern, slug] of Object.entries(specialMappings)) {
        if (productName.includes(pattern)) {
          matchedBrand = brandBySlug.get(slug);
          if (matchedBrand) break;
        }
      }
    }

    if (matchedBrand) {
      // Update the product with the matched brand_id
      const { error: updateError } = await supabase
        .from('products')
        .update({ brand_id: matchedBrand.id })
        .eq('id', product.id);

      if (updateError) {
        console.error(`Error updating product ${product.name}:`, updateError);
      } else {
        console.log(`✓ Matched "${product.name}" to brand "${matchedBrand.name}"`);
        matched++;
      }
    } else {
      notMatched++;
      notMatchedProducts.push(product);
      console.log(`✗ Could not match: "${product.name}"`);
    }
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Products matched: ${matched}`);
  console.log(`Products not matched: ${notMatched}`);

  if (notMatchedProducts.length > 0) {
    console.log('\n=== PRODUCTS THAT COULD NOT BE MATCHED ===');
    notMatchedProducts.slice(0, 20).forEach(product => {
      console.log(`- ${product.name}`);
    });
    if (notMatchedProducts.length > 20) {
      console.log(`... and ${notMatchedProducts.length - 20} more`);
    }
  }
}

async function main() {
  await fixInvalidTagIds();
  await fixProductBrandRelationships();
}

main();