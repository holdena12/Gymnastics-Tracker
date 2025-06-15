// MAG Code of Points 2025-2028 Skills Database
// This database is a comprehensive list of skills from the official FIG Code of Points.
// It is organized by event and includes skill names, official descriptions, and difficulty values.
// Source: FlippedDecisions.com summary of the 2025-2028 MAG Code of Points

// Import the comprehensive skills database
import { skills as comprehensiveSkills } from './skills_pdf_final.js';

// Define difficulty value mappings
const DIFFICULTY_VALUES = {
  'A': 0.1, 'B': 0.2, 'C': 0.3, 'D': 0.4, 'E': 0.5,
  'F': 0.6, 'G': 0.7, 'H': 0.8, 'I': 0.9, 'J': 1.0
};

// Create and export the comprehensive skills database
export const skillsDatabase = comprehensiveSkills;

// Log database statistics
console.log('✅ Comprehensive Skills Database loaded successfully');
console.log('📊 Events available:', Object.keys(skillsDatabase));
Object.keys(skillsDatabase).forEach(event => {
  console.log(`📋 ${event}: ${skillsDatabase[event].length} skills`);
});
console.log('🎯 Total skills:', Object.values(skillsDatabase).reduce((sum, skills) => sum + skills.length, 0));

// Export difficulty values for use in other modules
export { DIFFICULTY_VALUES };