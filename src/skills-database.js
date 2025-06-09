// MAG Code of Points 2025-2028 Skills Database
// This database is a comprehensive list of skills from the official FIG Code of Points.
// It is organized by event and includes skill names, official descriptions, and difficulty values.
// Source: FlippedDecisions.com summary of the 2025-2028 MAG Code of Points

// Import the final skills dataset generated from the FIG PDF
import rawSkills from './skills_pdf_final.js';

// The parsed PDF dataset is already in the correct shape expected by the app
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