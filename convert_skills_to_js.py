#!/usr/bin/env python3
"""
Convert comprehensive skills JSON database to JavaScript format
This ensures ALL skills are embedded directly in the code with no import dependencies
"""

import json
import re

def get_difficulty_value(difficulty):
    """Convert difficulty letter to proper numeric value"""
    difficulty_map = {
        'A': 0.1,
        'B': 0.2,
        'C': 0.3,
        'D': 0.4,
        'E': 0.5,
        'F': 0.6,
        'G': 0.7,
        'H': 0.8,
        'I': 0.9,
        'J': 1.0
    }
    return difficulty_map.get(difficulty.upper(), 0.0)

def convert_json_to_js():
    print("🔄 Converting comprehensive skills database to JavaScript...")
    
    # Read the main skills database
    try:
        with open('src/skills_pdf_final.json', 'r', encoding='utf-8') as f:
            skills_data = json.load(f)
        print(f"✅ Loaded main skills database")
    except Exception as e:
        print(f"❌ Error loading main skills database: {e}")
        return False
    
    # Fix difficulty values for all events
    for event_name, skills in skills_data.items():
        if event_name == 'Vault':
            continue  # Vault uses different scoring system
        
        for skill in skills:
            if 'difficulty' in skill:
                # Ensure the value matches the difficulty rating
                correct_value = get_difficulty_value(skill['difficulty'])
                if correct_value > 0:
                    skill['value'] = correct_value
    
    # Read vault skills database
    vault_skills = []
    try:
        with open('src/skills_pdf_clean.json', 'r', encoding='utf-8') as f:
            vault_data = json.load(f)
        
        # Parse vault data
        if 'Vault' in vault_data and vault_data['Vault']:
            for item in vault_data['Vault']:
                for key, value in item.items():
                    if 'EG' in key or key == '' or not value:
                        continue
                    
                    if isinstance(value, str) and value.strip():
                        lines = value.split('\n')
                        skill_line = lines[0]
                        value_line = lines[-1]
                        
                        skill_match = re.match(r'^(\d+)\.\s*(.+)$', skill_line)
                        if skill_match:
                            element = int(skill_match.group(1))
                            description = skill_match.group(2)
                            
                            value_match = re.match(r'^(\d+(?:\.\d+)?)$', value_line)
                            if value_match:
                                vault_skills.append({
                                    "element": element,
                                    "description": description,
                                    "difficulty": value_match.group(1),
                                    "value": float(value_match.group(1))
                                })
        
        # Add vault skills to main database
        skills_data['Vault'] = vault_skills
        print(f"✅ Added {len(vault_skills)} vault skills")
        
    except Exception as e:
        print(f"⚠️ Warning: Could not load vault skills: {e}")
    
    # Convert to JavaScript format
    js_content = '''// MAG Code of Points 2025-2028 Comprehensive Skills Database
// Complete skills database embedded directly in JavaScript to ensure 100% reliability
// This contains ALL skills from the official FIG Code of Points 2025-2028
// Generated automatically from JSON database

// Difficulty value mapping
const difficultyValues = {
  'A': 0.1, 'B': 0.2, 'C': 0.3, 'D': 0.4, 'E': 0.5,
  'F': 0.6, 'G': 0.7, 'H': 0.8, 'I': 0.9, 'J': 1.0
};

// Raw skills data from FIG Code of Points
const rawSkillsData = '''
    
    # Convert the JSON to a JavaScript object string
    js_content += json.dumps(skills_data, indent=2, ensure_ascii=False)
    
    js_content += ''';

// Convert to application format and ensure correct values
function convertToAppFormat(rawData) {
  const converted = {};
  
  for (const [eventName, skills] of Object.entries(rawData)) {
    converted[eventName] = skills.map(skill => {
      let skillValue = skill.value;
      
      // For non-vault events, ensure value matches difficulty rating
      if (eventName !== 'Vault' && skill.difficulty && difficultyValues[skill.difficulty]) {
        skillValue = difficultyValues[skill.difficulty];
      }
      
      return {
        name: skill.description,
        realName: skill.description,
        difficulty: skill.difficulty,
        value: skillValue,
        element: skill.element || null,
        isHeader: false
      };
    });
  }
  
  return converted;
}

// Create the comprehensive skills database
const skillsDatabase = convertToAppFormat(rawSkillsData);

// Log the database statistics
console.log('🏆 Comprehensive Skills Database Loaded:');
Object.entries(skillsDatabase).forEach(([event, skills]) => {
  console.log(`  ${event}: ${skills.length} skills`);
  
  // Show difficulty distribution
  const diffCounts = {};
  skills.forEach(skill => {
    diffCounts[skill.difficulty] = (diffCounts[skill.difficulty] || 0) + 1;
  });
  console.log(`    Difficulties: ${Object.entries(diffCounts).map(([d, c]) => `${d}(${c})`).join(', ')}`);
});

const totalSkills = Object.values(skillsDatabase).reduce((sum, skills) => sum + skills.length, 0);
console.log(`📊 Total: ${totalSkills} skills across all events`);

// Verify high-difficulty skills have correct values
console.log('🔍 Verifying high-difficulty skills (F+):');
Object.entries(skillsDatabase).forEach(([event, skills]) => {
  const highDiffSkills = skills.filter(s => ['F', 'G', 'H', 'I', 'J'].includes(s.difficulty));
  if (highDiffSkills.length > 0) {
    console.log(`  ${event}: ${highDiffSkills.length} high-difficulty skills`);
    highDiffSkills.slice(0, 3).forEach(skill => {
      console.log(`    ${skill.difficulty} (${skill.value}): ${skill.name.substring(0, 50)}...`);
    });
  }
});

// Export the skills database
export { skillsDatabase };

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
}'''
    
    # Write the JavaScript file
    try:
        with open('src/skills-comprehensive.js', 'w', encoding='utf-8') as f:
            f.write(js_content)
        
        print(f"✅ Generated comprehensive skills database at src/skills-comprehensive.js")
        
        # Count skills per event and difficulty distribution
        total_skills = 0
        high_diff_count = 0
        for event, skills in skills_data.items():
            skill_count = len(skills)
            total_skills += skill_count
            
            # Count high difficulty skills (F+)
            if event != 'Vault':
                high_skills = [s for s in skills if s.get('difficulty', '') in ['F', 'G', 'H', 'I', 'J']]
                high_diff_count += len(high_skills)
                print(f"  {event}: {skill_count} skills ({len(high_skills)} are F+ difficulty)")
            else:
                print(f"  {event}: {skill_count} skills (vault scoring)")
        
        print(f"📊 Total: {total_skills} skills embedded in JavaScript")
        print(f"🎯 High difficulty (F+): {high_diff_count} skills with correct values")
        return True
        
    except Exception as e:
        print(f"❌ Error writing JavaScript file: {e}")
        return False

if __name__ == "__main__":
    convert_json_to_js() 