// Correct Triple Salto Difficulties
// Triple tucked = I (0.9), Triple piked = J (1.0)

import fs from 'fs';

function correctTripleSaltos() {
  console.log('🔧 Correcting triple salto difficulties to I and J...');
  
  try {
    // Read the skills file
    let fileContent = fs.readFileSync('skills_pdf_final.js', 'utf8');
    
    // Create backup first
    const backupName = `skills_pdf_final_backup_${Date.now()}.js`;
    fs.writeFileSync(backupName, fileContent);
    console.log(`📁 Backup created: ${backupName}`);
    
    let corrections = 0;
    
    // Triple salto corrections - I and J difficulty
    const tripleSaltoFixes = [
      // Triple tucked = I difficulty (0.9)
      { 
        from: '"Triple salto bwd. tucked.",\n      "realName": "Triple salto bwd. tucked.",\n      "difficulty": "G",\n      "value": 0.7', 
        to: '"Triple salto bwd. tucked.",\n      "realName": "Triple salto bwd. tucked.",\n      "difficulty": "I",\n      "value": 0.9' 
      },
      
      // Triple piked = J difficulty (1.0)
      { 
        from: '"Triple salto bwd. piked.",\n      "realName": "Triple salto bwd. piked.",\n      "difficulty": "G",\n      "value": 0.7', 
        to: '"Triple salto bwd. piked.",\n      "realName": "Triple salto bwd. piked.",\n      "difficulty": "J",\n      "value": 1.0' 
      },
      
      // Triple "p." (piked abbreviated) = J difficulty (1.0)
      { 
        from: '"Triple salto bwd. p.",\n      "realName": "Triple salto bwd. p.",\n      "difficulty": "G",\n      "value": 0.7', 
        to: '"Triple salto bwd. p.",\n      "realName": "Triple salto bwd. p.",\n      "difficulty": "J",\n      "value": 1.0' 
      },
      
      // Triple with turn tucked = I difficulty (0.9)
      { 
        from: '"Triple salto bwd. t. with 1/1 t.",\n      "realName": "Triple salto bwd. t. with 1/1 t.",\n      "difficulty": "G",\n      "value": 0.7', 
        to: '"Triple salto bwd. t. with 1/1 t.",\n      "realName": "Triple salto bwd. t. with 1/1 t.",\n      "difficulty": "I",\n      "value": 0.9' 
      },
      
      // Triple over the bar tucked = I difficulty (0.9)
      { 
        from: '"Triple salto bwd. t. or over the bar.",\n      "realName": "Triple salto bwd. t. or over the bar.",\n      "difficulty": "G",\n      "value": 0.7', 
        to: '"Triple salto bwd. t. or over the bar.",\n      "realName": "Triple salto bwd. t. or over the bar.",\n      "difficulty": "I",\n      "value": 0.9' 
      }
    ];
    
    // Apply all fixes
    tripleSaltoFixes.forEach((fix, index) => {
      if (fileContent.includes(fix.from)) {
        fileContent = fileContent.replace(fix.from, fix.to);
        corrections++;
        const newDifficulty = fix.to.includes('"I"') ? 'I (0.9)' : 'J (1.0)';
        console.log(`✅ Fixed triple salto ${index + 1} to ${newDifficulty}`);
      }
    });
    
    // Write the corrected file back
    fs.writeFileSync('skills_pdf_final.js', fileContent);
    
    console.log('\n🎉 === TRIPLE SALTO CORRECTION SUMMARY ===');
    console.log(`✅ Total corrections made: ${corrections}`);
    console.log('📊 Triple tucked skills: I difficulty (0.9)');
    console.log('📊 Triple piked skills: J difficulty (1.0)');
    console.log('\n🎯 Triple salto difficulties corrected!');
    console.log('🔄 Clear browser cache and restart your app to see the updated difficulty values');
    
    return { totalCorrections: corrections, status: 'complete' };
    
  } catch (error) {
    console.error('❌ Error during correction process:', error.message);
    return { error: error.message, status: 'failed' };
  }
}

// Run the correction
correctTripleSaltos(); 