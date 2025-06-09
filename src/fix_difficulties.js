// Difficulty Rating Correction Script - ES Module Version
// Fixes skills that were incorrectly parsed as F difficulty when they should be G, H, I, or J

import fs from 'fs';

// Skill correction mappings based on FIG Code of Points 2025-2028
const skillCorrections = {
  // TRIPLE SALTOS - Generally G-H difficulty
  "Triple salto bwd. tucked.": { difficulty: "G", value: 0.7 },
  "Triple salto bwd. piked.": { difficulty: "G", value: 0.7 },
  "Triple salto fwd. tucked.": { difficulty: "H", value: 0.8 },
  "Triple salto fwd. piked.": { difficulty: "H", value: 0.8 },
  
  // COMPLEX DOUBLE SALTOS WITH MULTIPLE TWISTS - G-H difficulty
  "Double salto bwd. str. with 3/1 t.": { difficulty: "G", value: 0.7 },
  "Double salto bwd. str. with 7/2 t.": { difficulty: "H", value: 0.8 },
  "Double salto bwd. tucked with 7/2 t.": { difficulty: "G", value: 0.7 },
  "Double salto bwd. tucked with 5/2 t.": { difficulty: "G", value: 0.7 },
  "Double salto bwd. tucked with 3/1 t.": { difficulty: "G", value: 0.7 },
  "Double salto str. bwd. str w 5/2 t.": { difficulty: "G", value: 0.7 },
  "Double salto bwd. str. with 2/1 t.": { difficulty: "G", value: 0.7 },
  
  // FORWARD DOUBLE SALTOS WITH COMPLEX TWISTS - G-H difficulty  
  "Double salto fwd. tucked with 3/2 turn.": { difficulty: "G", value: 0.7 },
  "Double salto fwd. piked or straight with 3/2 turn.": { difficulty: "G", value: 0.7 },
  "Double salto fwd. tucked with 1/1 turn.": { difficulty: "G", value: 0.7 },
  
  // NAMED SKILLS (Gymnast names) - Often G+ difficulty
  "(Ri Jong Song)": { difficulty: "G", value: 0.7 },
  "(Liukin)": { difficulty: "G", value: 0.7 },
  "(Nagornyy)": { difficulty: "G", value: 0.7 },
  "(Minami)": { difficulty: "G", value: 0.7 },
  "(Kolyvanov)": { difficulty: "G", value: 0.7 },
  "(Shirai 3)": { difficulty: "G", value: 0.7 },
  "(Jarman)": { difficulty: "H", value: 0.8 },
  
  // HIGH BAR - Super high-level dismounts
  "Double salto bwd. str over the bar.": { difficulty: "G", value: 0.7 },
  "Double salto bwd. str. w. 1/1 t. over the bar.": { difficulty: "G", value: 0.7 },
  "Double salto bwd str. w. 3/2 or 2/1 turn over": { difficulty: "H", value: 0.8 },
  "Double salto bwd. t. with 2/1 t. over the bar": { difficulty: "G", value: 0.7 },
  "Double salto bwd. t. over the bar.": { difficulty: "G", value: 0.7 }
};

function correctSkillDifficulties() {
  console.log('🔧 Starting difficulty correction process...');
  
  try {
    // Read the current skills file
    const fileContent = fs.readFileSync('skills_pdf_final.js', 'utf8');
    
    // Extract JSON content more carefully 
    // The file format is: export default { ... };
    let jsonContent = fileContent.replace('export default ', '');
    if (jsonContent.endsWith(';')) {
      jsonContent = jsonContent.slice(0, -1);
    }
    
    const skillsData = JSON.parse(jsonContent);
    
    let totalCorrections = 0;
    let correctionsByEvent = {};
    
    // Process each event
    Object.keys(skillsData).forEach(eventName => {
      console.log(`\n📋 Processing ${eventName}...`);
      let eventCorrections = 0;
      
      skillsData[eventName].forEach(skill => {
        const oldDifficulty = skill.difficulty;
        
        // Check exact name matches
        if (skillCorrections[skill.name]) {
          const correction = skillCorrections[skill.name];
          skill.difficulty = correction.difficulty;
          skill.value = correction.value;
          console.log(`  ✅ ${skill.name}: ${oldDifficulty} → ${skill.difficulty}`);
          eventCorrections++;
          totalCorrections++;
        }
        // Check pattern matches for skills still at F difficulty
        else if (skill.difficulty === 'F') {
          let corrected = false;
          
          // Triple saltos pattern
          if (/triple.*salto.*tucked/i.test(skill.name)) {
            skill.difficulty = "G";
            skill.value = 0.7;
            corrected = true;
          }
          else if (/triple.*salto.*piked/i.test(skill.name)) {
            skill.difficulty = "G"; 
            skill.value = 0.7;
            corrected = true;
          }
          else if (/triple.*salto.*straight/i.test(skill.name)) {
            skill.difficulty = "H";
            skill.value = 0.8;
            corrected = true;
          }
          // Double saltos with complex twists
          else if (/double.*salto.*3\/1.*t\./i.test(skill.name)) {
            skill.difficulty = "G";
            skill.value = 0.7;
            corrected = true;
          }
          else if (/double.*salto.*7\/2.*t\./i.test(skill.name)) {
            skill.difficulty = "H";
            skill.value = 0.8;
            corrected = true;
          }
          // Named skills in parentheses
          else if (/\(.*\)$/.test(skill.name) && skill.name.length > 5) {
            skill.difficulty = "G";
            skill.value = 0.7;
            corrected = true;
          }
          
          if (corrected) {
            console.log(`  ✅ ${skill.name}: ${oldDifficulty} → ${skill.difficulty} (pattern match)`);
            eventCorrections++;
            totalCorrections++;
          }
        }
      });
      
      correctionsByEvent[eventName] = eventCorrections;
      console.log(`  📊 ${eventCorrections} corrections made in ${eventName}`);
    });
    
    // Write the corrected data back
    const correctedData = `export default ${JSON.stringify(skillsData, null, 2)};`;
    fs.writeFileSync('skills_pdf_final.js', correctedData);
    
    // Create backup
    const backupName = `skills_pdf_final_backup_${Date.now()}.js`;
    fs.writeFileSync(backupName, fileContent);
    
    console.log('\n🎉 === CORRECTION SUMMARY ===');
    console.log(`✅ Total corrections made: ${totalCorrections}`);
    Object.entries(correctionsByEvent).forEach(([event, count]) => {
      if (count > 0) console.log(`  📈 ${event}: ${count} corrections`);
    });
    
    console.log('\n🎯 Difficulty corrections complete!');
    console.log(`📁 Backup created: ${backupName}`);
    console.log('🔄 Clear browser cache and restart your app to see the updated difficulty values');
    
    return { totalCorrections, correctionsByEvent, status: 'complete' };
    
  } catch (error) {
    console.error('❌ Error during correction process:', error.message);
    return { error: error.message, status: 'failed' };
  }
}

// Run the correction
correctSkillDifficulties(); 