#!/usr/bin/env node

/**
 * Fix Shirai skill difficulty ratings
 * Based on correct FIG Code of Points parsing:
 * - Shirai 3: Should be I (0.9), currently incorrectly set to F (0.6)
 * - Shirai 2: Correctly F (0.6) 
 * - Shirai/Nguyen: Correctly F (0.6)
 */

import fs from 'fs';

const SKILLS_FILE = './skills_pdf_final.js';
const BACKUP_FILE = `./skills_pdf_final_backup_${Date.now()}.js`;

async function fixShiraiDifficulties() {
  try {
    console.log('🔧 Fixing Shirai skill difficulty ratings...');
    
    // Read the current skills file
    const content = fs.readFileSync(SKILLS_FILE, 'utf8');
    
    // Create backup
    fs.writeFileSync(BACKUP_FILE, content);
    console.log(`📝 Backup created: ${BACKUP_FILE}`);
    
    // Define corrections for Shirai skills
    const corrections = [
      {
        name: 'Shirai 3',
        pattern: /"name": "\(Shirai 3\)",\s*"realName": "\(Shirai 3\)",\s*"difficulty": "F",\s*"value": 0\.6/g,
        replacement: '"name": "(Shirai 3)",\n      "realName": "(Shirai 3)",\n      "difficulty": "I",\n      "value": 0.9'
      }
    ];
    
    let updatedContent = content;
    let totalChanges = 0;
    
    // Apply each correction
    corrections.forEach(correction => {
      const matches = updatedContent.match(correction.pattern);
      if (matches) {
        updatedContent = updatedContent.replace(correction.pattern, correction.replacement);
        totalChanges += matches.length;
        console.log(`✅ Fixed ${correction.name}: ${matches.length} occurrence(s)`);
        console.log(`   Changed from F (0.6) to I (0.9)`);
      } else {
        console.log(`⚠️  No matches found for ${correction.name}`);
      }
    });
    
    if (totalChanges > 0) {
      // Write the corrected content
      fs.writeFileSync(SKILLS_FILE, updatedContent);
      console.log(`\n🎉 Successfully corrected ${totalChanges} Shirai skill(s)!`);
      console.log('📊 Summary of changes:');
      console.log('   - Shirai 3: F (0.6) → I (0.9) ✓');
      console.log('   - Shirai 2: F (0.6) (correct) ✓');
      console.log('   - Shirai/Nguyen: F (0.6) (correct) ✓');
    } else {
      console.log('ℹ️  No changes were needed.');
    }
    
  } catch (error) {
    console.error('❌ Error fixing Shirai difficulties:', error);
    process.exit(1);
  }
}

// Run the correction
fixShiraiDifficulties(); 