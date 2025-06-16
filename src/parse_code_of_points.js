#!/usr/bin/env node

/**
 * FIG Code of Points 2025-2028 Parser
 * This script properly parses the official FIG Code of Points into a comprehensive database
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, 'skills_pdf_clean.json');
const OUTPUT_FILE = path.join(__dirname, 'skills_pdf_final.js');
const BACKUP_FILE = path.join(__dirname, `skills_pdf_final_backup_${Date.now()}.js`);

// Difficulty value mapping
const DIFFICULTY_VALUES = {
  'A': 0.1, 'B': 0.2, 'C': 0.3, 'D': 0.4, 'E': 0.5,
  'F': 0.6, 'G': 0.7, 'H': 0.8, 'I': 0.9, 'J': 1.0
};

// Special skill mappings for high-difficulty skills
const HIGH_DIFFICULTY_SKILLS = {
  // Triple saltos
  'triple.*salto.*tucked': { difficulty: 'I', value: 0.9 },
  'triple.*salto.*piked': { difficulty: 'J', value: 1.0 },
  'triple.*salto.*straight': { difficulty: 'J', value: 1.0 },
  
  // Double saltos with multiple twists
  'double.*salto.*tucked.*3/1': { difficulty: 'G', value: 0.7 },
  'double.*salto.*piked.*3/1': { difficulty: 'H', value: 0.8 },
  'double.*salto.*straight.*3/1': { difficulty: 'I', value: 0.9 },
  'double.*salto.*str\..*3/1': { difficulty: 'I', value: 0.9 },
  'double.*salto.*tucked.*5/2': { difficulty: 'F', value: 0.6 },
  'double.*salto.*straight.*5/2': { difficulty: 'H', value: 0.8 },
  'double.*salto.*str\..*5/2': { difficulty: 'H', value: 0.8 },
  'double.*salto.*straight.*7/2': { difficulty: 'J', value: 1.0 },
  'double.*salto.*str\..*7/2': { difficulty: 'J', value: 1.0 },
  'double.*arabian.*piked': { difficulty: 'H', value: 0.8 },
  
  // Named skills
  'shirai.*triple': { difficulty: 'J', value: 1.0 },
  'shirai.*double': { difficulty: 'I', value: 0.9 },
  'dragulescu': { difficulty: 'H', value: 0.8 },
  'kasamatsu': { difficulty: 'G', value: 0.7 },
  'tsukahara.*double': { difficulty: 'H', value: 0.8 },
  'yurchenko.*triple': { difficulty: 'J', value: 1.0 },
  'yurchenko.*double.*straight': { difficulty: 'I', value: 0.9 },
  'yurchenko.*double.*piked': { difficulty: 'H', value: 0.8 },
  'yurchenko.*double.*tucked': { difficulty: 'G', value: 0.7 }
};

function cleanSkillName(text) {
  if (!text) return null;
  return text
    .replace(/^\d+\.\s*/, '') // Remove leading numbers
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Normalize spaces
    .replace(/\s*\([A-J]\)$/, '') // Remove trailing difficulty indicator like (F)
    .trim();
}

function determineSkillDifficulty(skillText, columnDifficulty = null) {
  if (!skillText) return null;

  // Most reliable: explicit difficulty letter in parentheses, e.g., "Salto fwd tucked (F)"
  const explicitMatch = skillText.match(/\(([A-J])\)/i);
  if (explicitMatch) {
    const difficulty = explicitMatch[1].toUpperCase();
    return {
      difficulty,
      value: DIFFICULTY_VALUES[difficulty]
    };
  }

  // Next reliable: trailing difficulty letter
  const trailingMatch = skillText.match(/([FGHIJ])\s*(?:[)\.\*]*)$/i);
  if (trailingMatch) {
    const difficulty = trailingMatch[1].toUpperCase();
    return {
      difficulty,
      value: DIFFICULTY_VALUES[difficulty]
    };
  }
  
  // Special case for Arabian as requested
  if (/arabian.*jump.*bwd.*double.*salto.*fwd.*piked/i.test(skillText)) {
    return { difficulty: 'E', value: 0.5 };
  }

  // Fallback to high-difficulty keyword map
  for (const [pattern, info] of Object.entries(HIGH_DIFFICULTY_SKILLS)) {
    if (new RegExp(pattern, 'i').test(skillText)) {
      return info;
    }
  }

  // Finally, use the column's difficulty if no other indicator was found
  if (columnDifficulty) {
      return {
          difficulty: columnDifficulty.difficulty,
          value: columnDifficulty.value
      }
  }

  return null;
}

function parseEventSkills(eventData) {
  const skills = [];
  let currentElementGroup = null;
  const seen = new Set();
  let lastSkillObj = null; // track last pushed skill

  const splitLines = (text) => text
    .split(/\n+/)
    .map(l => l.trim())
    .filter(Boolean);

  for (const row of eventData) {
    // Detect element group headers (e.g., "EG I: ...") in any column
    for (const [, text] of Object.entries(row)) {
      if (text && /^EG\s/i.test(text.trim())) {
        currentElementGroup = text.trim();
        // Push header so we preserve structure (UI may use it)
        skills.push({
          name: currentElementGroup,
          realName: currentElementGroup,
          difficulty: 'A',
          value: 0.1,
          isHeader: true
        });
        break;
      }
    }

    // Parse skills in difficulty columns
    for (const [columnKey, cellText] of Object.entries(row)) {
      if (!cellText || cellText.trim() === '') continue;

      // Match difficulty column header pattern like "B = 0,2" or "H = 0,8"
      const colMatch = columnKey.match(/([A-J])\s*=\s*0,(\d+)/i);
      if (!colMatch) {
        continue; // Not a difficulty column
      }

      const difficulty = colMatch[1].toUpperCase();
      const value = DIFFICULTY_VALUES[difficulty] || parseFloat(`0.${colMatch[2]}`);

      // Split cell into individual skill lines
      const lines = splitLines(cellText);
      for (const rawLine of lines) {
        const originalText = rawLine.trim();
        if (!originalText) continue;
        
        // Skip lines that are just numbers or too short to be meaningful
        if (/^\d+\.?$/.test(originalText) || originalText.length < 4) {
          continue;
        }

        // Determine difficulty, prioritizing explicit text over column
        const diffInfo = determineSkillDifficulty(originalText, { difficulty, value });
        if (!diffInfo) continue; // Cannot determine difficulty, skip

        const finalDifficulty = diffInfo.difficulty;
        const finalValue = diffInfo.value;

        // Clean the name AFTER difficulty extraction
        const cleaned = cleanSkillName(originalText);
        if (!cleaned) continue;

        // Avoid duplicates (same name & difficulty)
        const key = `${cleaned}__${finalDifficulty}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const skillObj = {
          name: cleaned,
          realName: cleaned,
          difficulty: finalDifficulty,
          value: finalValue,
          isHeader: false,
          elementGroup: currentElementGroup
        };
        skills.push(skillObj);
        lastSkillObj = skillObj;
      }
    }
  }

  return skills;
}

// ==========================
// Vault parser (numeric D-scores)
// ==========================
function parseVaultSkills(eventData) {
  const skills = [];
  let currentElementGroup = null;
  const seen = new Set();
  let pendingName = null; // remember last description that awaits numeric value

  const addSkill = (name, value) => {
    if (!name || isNaN(value)) return;
    const key = `${name}__${value}`;
    if (seen.has(key)) return;
    seen.add(key);
    skills.push({
      name: name.trim(),
      realName: name.trim(),
      difficulty: value.toFixed(1),
      value: parseFloat(value.toFixed(1)),
      isHeader: false,
      elementGroup: currentElementGroup
    });
  };

  const processLine = (line) => {
    if (!line) return;
    line = line.trim();
    if (!line) return;

    const numericOnly = /^\d+\.\d+$/.test(line);
    if (numericOnly) {
      const value = parseFloat(line);
      if (pendingName) {
        addSkill(pendingName, value);
        pendingName = null;
      }
      return;
    }

    // Line with description possibly ending in numeric value
    const match = line.match(/(\d+\.\d+)$/);
    if (match) {
      const value = parseFloat(match[1]);
      const namePart = line.replace(/(\d+\.\d+)$/, '').trim().replace(/\.$/, '');
      if (namePart.length < 4) return;
      addSkill(namePart, value);
      pendingName = null;
    } else {
      // No numeric yet, store as pending description
      const cleaned = line.replace(/^[0-9]+\.\s*/, '').trim();
      if (cleaned.length >= 4) {
        pendingName = cleaned;
      }
    }
  };

  for (const row of eventData) {
    // Detect element group headers
    for (const [key, cellText] of Object.entries(row)) {
      const candidate = key || cellText;
      if (candidate && /^EG\s/i.test(candidate.trim())) {
        currentElementGroup = candidate.trim();
        // Prevent consecutive duplicate headers
        if (!skills.length || skills[skills.length - 1].name !== currentElementGroup) {
          skills.push({
            name: currentElementGroup,
            realName: currentElementGroup,
            difficulty: 'HEADER',
            value: 0,
            isHeader: true
          });
        }
        break;
      }
    }

    // Consider both keys and values for lines, because vault table puts data in keys sometimes
    for (const [key, cell] of Object.entries(row)) {
      const texts = [];
      if (typeof key === 'string' && key.trim()) texts.push(key);
      if (typeof cell === 'string' && cell.trim()) texts.push(cell);

      for (const text of texts) {
        const lines = text.split(/\n+/);
        for (const l of lines) {
          processLine(l);
        }
      }
    }
  }

  return skills;
}

async function parseCodeOfPoints() {
  try {
    console.log('📖 Starting Code of Points parsing...');
    
    // Backup existing file
    if (fs.existsSync(OUTPUT_FILE)) {
      const existingContent = fs.readFileSync(OUTPUT_FILE, 'utf8');
      fs.writeFileSync(BACKUP_FILE, existingContent);
      console.log(`📝 Backup created: ${BACKUP_FILE}`);
    }
    
    // Read the input JSON
    const rawData = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
    
    // Parse each event
    const parsedSkills = {};
    let totalSkills = 0;
    
    for (const [eventName, eventData] of Object.entries(rawData)) {
      console.log(`\n📋 Parsing ${eventName}...`);
      const eventSkills = eventName === 'Vault' ? parseVaultSkills(eventData) : parseEventSkills(eventData);
      parsedSkills[eventName] = eventSkills;
      totalSkills += eventSkills.length;
      console.log(`   ✅ Parsed ${eventSkills.length} skills`);
    }
    
    // Generate the output file
    const output = `// FIG Code of Points 2025-2028 Skills Database
// This database contains ALL skills from the official FIG Code of Points
// Generated: ${new Date().toISOString()}

export const skills = ${JSON.stringify(parsedSkills, null, 2)};

// Log database statistics
console.log('✅ Comprehensive Skills Database loaded successfully');
console.log('📊 Events available:', Object.keys(skills));
Object.keys(skills).forEach(event => {
  console.log(\`📋 \${event}: \${skills[event].length} skills\`);
});
console.log('🎯 Total skills:', Object.values(skills).reduce((sum, skills) => sum + skills.length, 0));`;
    
    fs.writeFileSync(OUTPUT_FILE, output);
    
    // Print statistics
    console.log('\n📊 Database Statistics:');
    console.log(`Total skills: ${totalSkills}`);
    console.log(`Events: ${Object.keys(parsedSkills).length}`);
    
    // Show difficulty distribution
    const difficultyCount = {};
    for (const eventSkills of Object.values(parsedSkills)) {
      for (const skill of eventSkills) {
        if (!skill.isHeader) {
          difficultyCount[skill.difficulty] = (difficultyCount[skill.difficulty] || 0) + 1;
        }
      }
    }
    
    console.log('\n🏆 Difficulty distribution:');
    for (const difficulty of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']) {
      const count = difficultyCount[difficulty] || 0;
      if (count > 0) {
        console.log(`   ${difficulty}: ${count} skills`);
      }
    }
    
    console.log('\n✅ Parsing complete!');
    
  } catch (error) {
    console.error('❌ Error during parsing:', error);
    process.exit(1);
  }
}

// Run the parser
parseCodeOfPoints(); 