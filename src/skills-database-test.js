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