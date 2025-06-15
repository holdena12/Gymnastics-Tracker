// Quick test to verify the comprehensive skills database
import { skillsDatabase, getSkillsForEvent } from './skills-database.js';

console.log('🧪 Testing Comprehensive Skills Database...\n');

const events = ['Floor Exercise', 'Pommel Horse', 'Still Rings', 'Vault', 'Parallel Bars', 'High Bar'];
let totalSkills = 0;

events.forEach(event => {
    const skills = getSkillsForEvent(event);
    totalSkills += skills.length;
    
    console.log(`📋 ${event}:`);
    console.log(`   ${skills.length} skills available`);
    
    if (skills.length > 0) {
        // Show difficulty range
        const difficulties = [...new Set(skills.map(s => s.difficulty))].sort();
        console.log(`   Difficulty range: ${difficulties.join(', ')}`);
        
        // Show first few skills as examples
        console.log(`   Sample skills:`);
        skills.slice(0, 3).forEach((skill, index) => {
            console.log(`     ${index + 1}. ${skill.difficulty} (${skill.value}): ${skill.name.substring(0, 50)}${skill.name.length > 50 ? '...' : ''}`);
        });
    }
    console.log('');
});

console.log(`🎯 TOTAL: ${totalSkills} skills across all events`);

if (totalSkills > 100) {
    console.log('✅ SUCCESS: Comprehensive database loaded correctly!');
} else {
    console.log('❌ ISSUE: Only basic fallback skills loaded');
} 