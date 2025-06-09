#!/usr/bin/env node

/**
 * Smart PDF Reparser for FIG Code of Points
 * 
 * This parser correctly handles the column-to-difficulty mapping by:
 * 1. Reading the clean JSON structure 
 * 2. Properly mapping skills to their difficulty columns
 * 3. Handling specific difficulty indicators (F, G, H, I, J) for high-value skills
 * 4. Parsing event names and skill descriptions accurately
 */

import fs from 'fs';

const CLEAN_JSON_FILE = '../skills_pdf_clean.json';
const OUTPUT_FILE = './skills_pdf_smart_parsed.js';
const BACKUP_FILE = `./skills_pdf_final_backup_reparse_${Date.now()}.js`;

// Difficulty mapping
const DIFFICULTY_MAP = {
  'A = 0,1': { difficulty: 'A', value: 0.1 },
  'B = 0,2': { difficulty: 'B', value: 0.2 },
  'C = 0,3': { difficulty: 'C', value: 0.3 },
  'D = 0,4': { difficulty: 'D', value: 0.4 },
  'E = 0,5': { difficulty: 'E', value: 0.5 },
  'F = 0,6 G = 0,7 H = 0,8\nI = 0.9, J = 1.0': null // Handle specially
};

function parseHighDifficultySkill(skillText) {
  if (!skillText || skillText.trim() === '') return null;
  // Split by lines and filter out empty lines
  const lines = skillText.split('\n').map(l => l.trim()).filter(Boolean);
  // Try to find a line with a single difficulty letter
  let difficulty = 'F';
  let value = 0.6;
  for (const line of lines) {
    if (/^G$/.test(line)) { difficulty = 'G'; value = 0.7; }
    else if (/^H$/.test(line)) { difficulty = 'H'; value = 0.8; }
    else if (/^I$/.test(line)) { difficulty = 'I'; value = 0.9; }
    else if (/^J$/.test(line)) { difficulty = 'J'; value = 1.0; }
  }
  // Try to extract the skill name (all lines except pure difficulty letters)
  const nameLines = lines.filter(l => !/^[FGHIJ]$/.test(l));
  const skillName = nameLines.join(' ').replace(/\s+/g, ' ').trim();
  if (!skillName) return { difficulty, value };
  return { difficulty, value, skillName };
}

function cleanSkillName(rawText) {
  if (!rawText) return null;
  // Remove leading numbers, but do NOT skip short or numeric entries
  let cleaned = rawText
    .replace(/^\d+\.\s*/, '')
    .replace(/\n+[GHIJ]$/, '')
    .replace(/\n+/g, ' ')
    .trim();
  // Do NOT skip short or numeric entries anymore
  return cleaned;
}

function parseEvent(eventName, eventData) {
  console.log(`\n📋 Parsing ${eventName}...`);
  const skills = [];
  let skillCount = 0;
  for (const row of eventData) {
    for (const [columnKey, skillText] of Object.entries(row)) {
      if (!skillText || skillText.trim() === '') continue;
      // For high-difficulty column, split by lines and extract each skill
      if (columnKey.startsWith('F = 0,6')) {
        const lines = skillText.split(/\n(?=\d+\.|triple|Triple|Double|Salto|salto|EG|\()/i).map(l => l.trim()).filter(Boolean);
        for (const line of lines) {
          if (!line) continue;
          
          // If line contains a high-value skill keyword, extract difficulty
          if (/triple|salto|shirai|arabian|tsukahara|kovacs|gaylord|piatti|hypolito|jarman|nagornyy|liukin|whittenburg|fardan|belle|andrianov|hoffmann|rumbutis|3\/1|3\/2/i.test(line)) {
            let match = line.match(/([FGHIJ])$/);
            let difficulty = 'F';
            let value = 0.6;
            let name = line.replace(/([FGHIJ])$/, '').replace(/\s+/g, ' ').trim();
            
            // Specific handling for triple salto skills
            if (/triple.*salto.*tucked/i.test(name)) {
              difficulty = 'I';
              value = 0.9;
            } else if (/triple.*salto.*piked/i.test(name)) {
              difficulty = 'J';
              value = 1.0;
            } else if (/double.*salto.*tucked.*3\/1/i.test(name) || /double.*salto.*bwd.*tucked.*3\/1/i.test(name)) {
              // Double salto backward tucked with 3/1 turn is G difficulty
              difficulty = 'G';
              value = 0.7;
            } else if (/double.*salto.*str.*3\/1/i.test(name) || /double.*salto.*straight.*3\/1/i.test(name)) {
              // Double salto backward straight with 3/1 turn is I difficulty  
              difficulty = 'I';
              value = 0.9;
            } else if (/salto.*fwd.*str.*3\/1/i.test(name) || /salto.*forward.*str.*3\/1/i.test(name)) {
              // Forward salto straight with 3/1 turn is F difficulty
              difficulty = 'F';
              value = 0.6;
            } else if (match) {
              // Use explicit difficulty from text if available
              difficulty = match[1];
              let valueMap = { F: 0.6, G: 0.7, H: 0.8, I: 0.9, J: 1.0 };
              value = valueMap[difficulty] || 0.6;
            } else if (/3\/1|3\/2|triple/i.test(line)) {
              // Default to 'I' for other triple skills without explicit difficulty 
              difficulty = 'I';
              value = 0.9;
            }
            
            // Avoid adding duplicates from this improved logic
            if (!skills.some(s => s.name === name)) {
              skills.push({
                name,
                realName: name,
                difficulty,
                value,
                isHeader: false
              });
              skillCount++;
            }
          }
        }
        continue;
      }
      // Normal columns
      const cleanName = cleanSkillName(skillText);
      if (!cleanName) continue;
      let isHeader = /^EG\s/i.test(cleanName) || /element group/i.test(cleanName);
      let difficultyInfo = DIFFICULTY_MAP[columnKey];
      if (difficultyInfo) {
        skills.push({
          name: cleanName,
          realName: cleanName,
          difficulty: difficultyInfo.difficulty,
          value: difficultyInfo.value,
          isHeader
        });
        skillCount++;
      }
    }
  }
  console.log(`   ✅ Parsed ${skillCount} skills`);
  // Remove F duplicates: if a skill name appears with non-F difficulty, drop the F entry
  const finalSkills = skills.filter(skill =>
    skill.difficulty !== 'F' || !skills.some(other => other.name === skill.name && other.difficulty !== 'F')
  );
  return finalSkills;
}

async function smartReparse() {
  try {
    console.log('🧠 Starting smart PDF reparse...');
    
    // Backup existing file
    if (fs.existsSync('./skills_pdf_final.js')) {
      const existingContent = fs.readFileSync('./skills_pdf_final.js', 'utf8');
      fs.writeFileSync(BACKUP_FILE, existingContent);
      console.log(`📝 Backup created: ${BACKUP_FILE}`);
    }
    
    // Read the clean JSON
    console.log('📖 Reading clean JSON structure...');
    const cleanData = JSON.parse(fs.readFileSync(CLEAN_JSON_FILE, 'utf8'));
    
    // Parse each event
    const parsedSkills = {};
    let totalSkills = 0;
    
    for (const [eventName, eventData] of Object.entries(cleanData)) {
      const eventSkills = parseEvent(eventName, eventData);
      parsedSkills[eventName] = eventSkills;
      totalSkills += eventSkills.length;
    }
    
    // Generate the output file
    console.log('\n📝 Generating skills database...');
    const output = `export const skills = ${JSON.stringify(parsedSkills, null, 2)};`;
    
    fs.writeFileSync(OUTPUT_FILE, output);
    
    console.log(`\n🎉 Smart reparse complete!`);
    console.log(`📊 Parsed ${totalSkills} total skills across ${Object.keys(parsedSkills).length} events`);
    console.log(`💾 Output saved to: ${OUTPUT_FILE}`);
    
    // Show breakdown by event
    console.log('\n📋 Skills by event:');
    for (const [eventName, eventSkills] of Object.entries(parsedSkills)) {
      console.log(`   ${eventName}: ${eventSkills.length} skills`);
    }
    
    // Show difficulty distribution
    const difficultyCount = {};
    for (const eventSkills of Object.values(parsedSkills)) {
      for (const skill of eventSkills) {
        difficultyCount[skill.difficulty] = (difficultyCount[skill.difficulty] || 0) + 1;
      }
    }
    
    console.log('\n🏆 Difficulty distribution:');
    for (const difficulty of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']) {
      const count = difficultyCount[difficulty] || 0;
      if (count > 0) {
        console.log(`   ${difficulty}: ${count} skills`);
      }
    }
    
    // Specifically check shirais
    console.log('\n🎯 Shirai skills check:');
    for (const [eventName, eventSkills] of Object.entries(parsedSkills)) {
      for (const skill of eventSkills) {
        if (skill.name.toLowerCase().includes('shirai')) {
          console.log(`   ${eventName}: ${skill.name} - ${skill.difficulty} (${skill.value})`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error during smart reparse:', error);
    process.exit(1);
  }
}

// Run the smart reparse
smartReparse(); 