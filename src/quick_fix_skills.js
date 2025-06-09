// Quick Fix for High Difficulty Skills
// Uses text replacement to fix specific skills that should be G, H, I, or J difficulty

import fs from 'fs';

function quickFixDifficulties() {
  console.log('🔧 Quick fixing high difficulty skills...');
  
  try {
    // Read the skills file
    let fileContent = fs.readFileSync('skills_pdf_final.js', 'utf8');
    
    // Create backup first
    const backupName = `skills_pdf_final_backup_${Date.now()}.js`;
    fs.writeFileSync(backupName, fileContent);
    console.log(`📁 Backup created: ${backupName}`);
    
    let corrections = 0;
    
    // Triple saltos - should be G difficulty (0.7)
    const tripleSkillsFixes = [
      { from: '"Triple salto bwd. tucked.",\n      "realName": "Triple salto bwd. tucked.",\n      "difficulty": "F",\n      "value": 0.6', to: '"Triple salto bwd. tucked.",\n      "realName": "Triple salto bwd. tucked.",\n      "difficulty": "G",\n      "value": 0.7' },
      { from: '"Triple salto bwd. piked.",\n      "realName": "Triple salto bwd. piked.",\n      "difficulty": "F",\n      "value": 0.6', to: '"Triple salto bwd. piked.",\n      "realName": "Triple salto bwd. piked.",\n      "difficulty": "G",\n      "value": 0.7' },
      { from: '"Triple salto bwd. p.",\n      "realName": "Triple salto bwd. p.",\n      "difficulty": "F",\n      "value": 0.6', to: '"Triple salto bwd. p.",\n      "realName": "Triple salto bwd. p.",\n      "difficulty": "G",\n      "value": 0.7' },
      { from: '"Triple salto bwd. t. or over the bar.",\n      "realName": "Triple salto bwd. t. or over the bar.",\n      "difficulty": "F",\n      "value": 0.6', to: '"Triple salto bwd. t. or over the bar.",\n      "realName": "Triple salto bwd. t. or over the bar.",\n      "difficulty": "G",\n      "value": 0.7' },
      { from: '"Triple salto bwd. t. with 1/1 t.",\n      "realName": "Triple salto bwd. t. with 1/1 t.",\n      "difficulty": "F",\n      "value": 0.6', to: '"Triple salto bwd. t. with 1/1 t.",\n      "realName": "Triple salto bwd. t. with 1/1 t.",\n      "difficulty": "G",\n      "value": 0.7' }
    ];
    
    // Complex double saltos - should be G difficulty (0.7)
    const complexDoublesFixes = [
      { from: '"Double salto bwd. str. with 3/1 t.",\n      "realName": "Double salto bwd. str. with 3/1 t.",\n      "difficulty": "F",\n      "value": 0.6', to: '"Double salto bwd. str. with 3/1 t.",\n      "realName": "Double salto bwd. str. with 3/1 t.",\n      "difficulty": "G",\n      "value": 0.7' },
      { from: '"Double salto bwd. tucked with 3/1 t.",\n      "realName": "Double salto bwd. tucked with 3/1 t.",\n      "difficulty": "F",\n      "value": 0.6', to: '"Double salto bwd. tucked with 3/1 t.",\n      "realName": "Double salto bwd. tucked with 3/1 t.",\n      "difficulty": "G",\n      "value": 0.7' },
      { from: '"Double salto bwd. tucked with 5/2 t.",\n      "realName": "Double salto bwd. tucked with 5/2 t.",\n      "difficulty": "F",\n      "value": 0.6', to: '"Double salto bwd. tucked with 5/2 t.",\n      "realName": "Double salto bwd. tucked with 5/2 t.",\n      "difficulty": "G",\n      "value": 0.7' },
      { from: '"Double salto str. bwd. str w 5/2 t.",\n      "realName": "Double salto str. bwd. str w 5/2 t.",\n      "difficulty": "F",\n      "value": 0.6', to: '"Double salto str. bwd. str w 5/2 t.",\n      "realName": "Double salto str. bwd. str w 5/2 t.",\n      "difficulty": "G",\n      "value": 0.7' }
    ];
    
    // Extra complex skills - should be H difficulty (0.8)
    const extraComplexFixes = [
      { from: '"Double salto bwd. str. with 7/2 t.",\n      "realName": "Double salto bwd. str. with 7/2 t.",\n      "difficulty": "F",\n      "value": 0.6', to: '"Double salto bwd. str. with 7/2 t.",\n      "realName": "Double salto bwd. str. with 7/2 t.",\n      "difficulty": "H",\n      "value": 0.8' },
      { from: '"Double salto bwd. tucked with 7/2 t.",\n      "realName": "Double salto bwd. tucked with 7/2 t.",\n      "difficulty": "F",\n      "value": 0.6', to: '"Double salto bwd. tucked with 7/2 t.",\n      "realName": "Double salto bwd. tucked with 7/2 t.",\n      "difficulty": "H",\n      "value": 0.8' }
    ];
    
    // Apply all fixes
    const allFixes = [...tripleSkillsFixes, ...complexDoublesFixes, ...extraComplexFixes];
    
    allFixes.forEach(fix => {
      if (fileContent.includes(fix.from)) {
        fileContent = fileContent.replace(fix.from, fix.to);
        corrections++;
        console.log(`✅ Fixed skill difficulty (${corrections})`);
      }
    });
    
    // Write the corrected file back
    fs.writeFileSync('skills_pdf_final.js', fileContent);
    
    console.log('\n🎉 === QUICK FIX SUMMARY ===');
    console.log(`✅ Total corrections made: ${corrections}`);
    console.log('\n🎯 High difficulty skills corrected!');
    console.log('🔄 Clear browser cache and restart your app to see the updated difficulty values');
    
    return { totalCorrections: corrections, status: 'complete' };
    
  } catch (error) {
    console.error('❌ Error during correction process:', error.message);
    return { error: error.message, status: 'failed' };
  }
}

// Run the correction
quickFixDifficulties(); 