// Test import to isolate the issue
import { skills as rawSkills } from './skills_pdf_final.js';

console.log('Import successful!');
console.log('Skills keys:', Object.keys(rawSkills));
console.log('Floor Exercise skills count:', rawSkills['Floor Exercise']?.length || 0);

export const skillsDatabase = rawSkills;

// Helper function to get skills for a specific event
export function getSkillsForEvent(eventName) {
    return skillsDatabase[eventName] || [];
}

// Helper function to search skills within an event
export function searchSkills(eventName, query) {
    const skills = getSkillsForEvent(eventName);
    if (!query) return skills;

    const searchTerm = query.toLowerCase();
    return skills.filter(skill =>
        skill.name && skill.name.toLowerCase().includes(searchTerm) ||
        (skill.realName && skill.realName.toLowerCase().includes(searchTerm)) ||
        skill.difficulty && skill.difficulty.toLowerCase().includes(searchTerm)
    );
}

// Test script to verify the comprehensive skills database
import { skillsDatabase, getSkillsForEvent } from './skills-database.js';

console.log('=== Gymnastics Skills Database Test ===');
console.log('Testing comprehensive Code of Points implementation...\n');

// Test each event
const events = ['Floor Exercise', 'Pommel Horse', 'Still Rings', 'Vault', 'Parallel Bars', 'High Bar'];

events.forEach(event => {
    const skills = getSkillsForEvent(event);
    console.log(`${event}: ${skills.length} skills`);
    
    if (skills.length > 0) {
        // Show difficulty range
        const difficulties = [...new Set(skills.map(s => s.difficulty))].sort();
        console.log(`  - Difficulty range: ${difficulties.join(', ')}`);
        
        // Show sample skills
        console.log(`  - Sample skills:`);
        skills.slice(0, 3).forEach(skill => {
            console.log(`    ${skill.difficulty} (${skill.value}): ${skill.name.substring(0, 60)}${skill.name.length > 60 ? '...' : ''}`);
        });
        console.log('');
    }
});

console.log('=== Database Summary ===');
const totalSkills = events.reduce((total, event) => total + getSkillsForEvent(event).length, 0);
console.log(`Total skills in database: ${totalSkills}`);
console.log('Database upgrade complete! ✅'); 