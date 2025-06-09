// Difficulty Rating Correction Script
// Fixes skills that were incorrectly parsed as F difficulty when they should be G, H, I, or J

import fs from 'fs';

// Skill correction mappings based on FIG Code of Points 2025-2028
const skillCorrections = {
  // TRIPLE SALTOS - Generally G-H difficulty
  "Triple salto bwd. tucked.": { difficulty: "G", value: 0.7 },
  "Triple salto bwd. piked.": { difficulty: "G", value: 0.7 },
  "Triple salto fwd. tucked.": { difficulty: "H", value: 0.8 },
  "Triple salto fwd. piked.": { difficulty: "H", value: 0.8 },
  
  // QUADRUPLE SALTOS - I-J difficulty (extremely rare)
  "Quadruple salto bwd. tucked.": { difficulty: "I", value: 0.9 },
  "Quadruple salto fwd. tucked.": { difficulty: "J", value: 1.0 },
  
  // COMPLEX DOUBLE SALTOS WITH MULTIPLE TWISTS - G-H difficulty
  "Double salto bwd. str. with 3/1 t.": { difficulty: "G", value: 0.7 },
  "Double salto bwd. str. with 7/2 t.": { difficulty: "H", value: 0.8 },
  "Double salto bwd. tucked with 7/2 t.": { difficulty: "G", value: 0.7 },
  "Double salto bwd. tucked with 5/2 t.": { difficulty: "G", value: 0.7 },
  "Double salto bwd. tucked with 3/1 t.": { difficulty: "G", value: 0.7 },
  
  // FORWARD DOUBLE SALTOS WITH COMPLEX TWISTS - G-H difficulty  
  "Double salto fwd. tucked with 3/2 turn.": { difficulty: "G", value: 0.7 },
  "Double salto fwd. piked or straight with 3/2 turn.": { difficulty: "G", value: 0.7 },
  "Double salto fwd. tucked with 1/1 turn.": { difficulty: "G", value: 0.7 },
  
  // COMPLEX COMBINATION SKILLS - G-H difficulty
  "Double salto tucked bwd. tucked with 7/2 t.": { difficulty: "G", value: 0.7 },
  "Double salto str. bwd. str w 5/2 t.": { difficulty: "G", value: 0.7 },
  
  // HIGH-LEVEL POMMEL HORSE SKILLS
  "Double scissor fwd. with travel sideways through": { difficulty: "G", value: 0.7 },
  "Double Scissor fwd. with travel sideways through": { difficulty: "G", value: 0.7 },
  
  // HIGH-LEVEL RINGS SKILLS  
  "Double salto fwd. piked or straight to hang.": { difficulty: "G", value: 0.7 },
  "Double salto backwards with half turn to upper": { difficulty: "G", value: 0.7 },
  "Double salto fwd. pike to upper arm hang.": { difficulty: "G", value: 0.7 },
  "Double salto fwd. pike to up. arm hang.": { difficulty: "G", value: 0.7 },
  
  // VAULT - High D-scores for complex vaults
  "Yang Hak Seon": { difficulty: "5.6", value: 5.6 }, // Already correct but ensure consistency
  
  // PARALLEL BARS - Complex dismounts
  "Double salto fwd. str. or with ½ turn.": { difficulty: "G", value: 0.7 },
  "Double salto fwd. t. or p. with 2/1 or 5/2 t.": { difficulty: "H", value: 0.8 },
  "Double salto bwd. str. with 3/1 t.": { difficulty: "H", value: 0.8 },
  "Double salto bwd. str. with 2/1 t.": { difficulty: "G", value: 0.7 },
  
  // HIGH BAR - Super high-level dismounts
  "Double salto bwd. str over the bar.": { difficulty: "G", value: 0.7 },
  "Double salto bwd. str. w. 1/1 t. over the bar.": { difficulty: "G", value: 0.7 },
  "Double salto bwd str. w. 3/2 or 2/1 turn over": { difficulty: "H", value: 0.8 },
  "Double salto bwd. t. with 2/1 t. over the bar": { difficulty: "G", value: 0.7 },
  "Double salto bwd. t. over the bar.": { difficulty: "G", value: 0.7 }
};

// Pattern-based corrections for skills that follow naming patterns
const patternCorrections = [
  // Triple saltos
  {
    pattern: /triple.*salto.*tucked/i,
    difficulty: "G",
    value: 0.7,
    description: "Triple saltos (tucked) - G difficulty"
  },
  {
    pattern: /triple.*salto.*piked/i, 
    difficulty: "G",
    value: 0.7,
    description: "Triple saltos (piked) - G difficulty"
  },
  {
    pattern: /triple.*salto.*straight/i,
    difficulty: "H", 
    value: 0.8,
    description: "Triple saltos (straight) - H difficulty"
  },
  
  // Quadruple saltos (extremely rare)
  {
    pattern: /quadruple.*salto/i,
    difficulty: "I",
    value: 0.9, 
    description: "Quadruple saltos - I difficulty"
  },
  
  // Double saltos with 3+ full turns
  {
    pattern: /double.*salto.*3\/1.*t\./i,
    difficulty: "G",
    value: 0.7,
    description: "Double saltos with 3/1 turn - G difficulty"
  },
  {
    pattern: /double.*salto.*7\/2.*t\./i,
    difficulty: "H", 
    value: 0.8,
    description: "Double saltos with 7/2 turn - H difficulty"
  },
  
  // Skills named after gymnasts (often high difficulty)
  {
    pattern: /\(.*\)$/ ,
    minCurrentDifficulty: "F",
    difficulty: "G",
    value: 0.7,
    description: "Named skills (gymnast names) - upgrade F to G"
  }
];

function correctSkillDifficulties() {
  console.log('Starting difficulty correction process...');
  
  // Read the current skills file
  const skillsData = JSON.parse(fs.readFileSync('skills_pdf_final.js').toString().replace('export default ', '').slice(0, -1));
  
  let totalCorrections = 0;
  let correctionsByEvent = {};
  
  // Process each event
  Object.keys(skillsData).forEach(eventName => {
    console.log(`\nProcessing ${eventName}...`);
    let eventCorrections = 0;
    
    skillsData[eventName].forEach(skill => {
      let corrected = false;
      let oldDifficulty = skill.difficulty;
      let oldValue = skill.value;
      
      // Check exact name matches first
      if (skillCorrections[skill.name]) {
        const correction = skillCorrections[skill.name];
        skill.difficulty = correction.difficulty;
        skill.value = correction.value;
        corrected = true;
        console.log(`  ✓ ${skill.name}: ${oldDifficulty} → ${skill.difficulty}`);
      }
      
      // Check pattern matches for skills still at F difficulty
      if (!corrected && skill.difficulty === 'F') {
        for (const patternCorrection of patternCorrections) {
          if (patternCorrection.pattern.test(skill.name)) {
            // Additional check for minimum difficulty if specified
            if (patternCorrection.minCurrentDifficulty && 
                skill.difficulty !== patternCorrection.minCurrentDifficulty) {
              continue;
            }
            
            skill.difficulty = patternCorrection.difficulty;
            skill.value = patternCorrection.value;
            corrected = true;
            console.log(`  ✓ ${skill.name}: ${oldDifficulty} → ${skill.difficulty} (${patternCorrection.description})`);
            break;
          }
        }
      }
      
      if (corrected) {
        eventCorrections++;
        totalCorrections++;
      }
    });
    
    correctionsByEvent[eventName] = eventCorrections;
    console.log(`  ${eventCorrections} corrections made in ${eventName}`);
  });
  
  // Write the corrected data back
  const correctedData = `export default ${JSON.stringify(skillsData, null, 2)};`;
  fs.writeFileSync('skills_pdf_final.js', correctedData);
  
  // Create backup
  fs.writeFileSync(`skills_pdf_final_backup_${Date.now()}.js`, fs.readFileSync('skills_pdf_final.js'));
  
  console.log('\n=== CORRECTION SUMMARY ===');
  console.log(`Total corrections made: ${totalCorrections}`);
  Object.entries(correctionsByEvent).forEach(([event, count]) => {
    console.log(`  ${event}: ${count} corrections`);
  });
  
  console.log('\n✅ Difficulty corrections complete!');
  console.log('📁 Backup created with timestamp');
  console.log('🔄 Restart your app to see the updated difficulty values');
  
  return {
    totalCorrections,
    correctionsByEvent,
    status: 'complete'
  };
}

// Run the correction if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  correctSkillDifficulties();
}

export { correctSkillDifficulties, skillCorrections, patternCorrections }; 