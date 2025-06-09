// Import skills database
import { searchSkills, getSkillsForEvent } from './skills-database.js';

// Gymnastics Skills Tracker
class GymnasticsTracker {
  constructor() {
    this.data = this.loadData();
    this.currentEvent = null;
    this.currentRoutineId = null;
    this.currentSkillId = null;
    this.difficultyValues = {
      'A': 0.1, 'B': 0.2, 'C': 0.3, 'D': 0.4, 'E': 0.5, 
      'F': 0.6, 'G': 0.7, 'H': 0.8, 'I': 0.9
    };
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.renderAll();
    // Auto-save every 30 seconds as backup
    setInterval(() => this.saveData(), 30000);
  }

  // Data Management
  loadData() {
    try {
      const stored = localStorage.getItem('gymnastics-tracker-data');
      if (stored) {
        const data = JSON.parse(stored);
        console.log('Data loaded successfully from storage');
        return data;
      }
    } catch (error) {
      console.error('Error loading data from storage:', error);
    }
    
    // Initialize with empty data structure
    console.log('Initializing with empty data structure');
    return {
      floor: [],
      pommel: [],
      rings: [],
      vault: [],
      pbars: [],
      hbar: []
    };
  }

  saveData() {
    try {
      localStorage.setItem('gymnastics-tracker-data', JSON.stringify(this.data));
      console.log('Data saved successfully to storage');
    } catch (error) {
      console.error('Error saving data to storage:', error);
      // Optionally show user notification about save failure
      this.showNotification('Warning: Failed to save data', 'warning');
    }
  }

  // Calculate start value for a routine
  calculateStartValue(routine) {
    if (!routine.skills || routine.skills.length === 0) {
      return {
        total: 12.0,
        skillsValue: 0.0,
        baseValue: 12.0,
        skillCount: 0
      };
    }

    const skillsValue = routine.skills.reduce((sum, skill) => {
      return sum + (this.difficultyValues[skill.difficulty] || 0);
    }, 0);

    return {
      total: Math.round((12.0 + skillsValue) * 10) / 10, // Round to 1 decimal
      skillsValue: Math.round(skillsValue * 10) / 10,
      baseValue: 12.0,
      skillCount: routine.skills.length
    };
  }

  // Calculate progression progress for a skill
  calculateProgressionProgress(skill) {
    if (!skill.progressions || skill.progressions.length === 0) {
      return { total: 0, completed: 0, percentage: 0 };
    }

    const total = skill.progressions.length;
    const completed = skill.progressions.filter(prog => prog.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, percentage };
  }

  showNotification(message, type = 'info') {
    // Simple notification system (you could enhance this with a toast library)
    console.log(`${type.toUpperCase()}: ${message}`);
  }

  // Event Listeners
  setupEventListeners() {
    // Add routine buttons
    document.querySelectorAll('.add-routine-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.currentEvent = e.target.dataset.event;
        this.showRoutineModal();
      });
    });

    // Modal close buttons
    document.querySelectorAll('.close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.closeModal(e.target.closest('.modal'));
      });
    });

    // Modal background clicks
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal);
        }
      });
    });

    // Form submissions
    document.getElementById('routine-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleRoutineSubmit();
    });

    document.getElementById('skill-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSkillSubmit();
    });

    document.getElementById('progression-form').addEventListener('submit', (e) => {
    e.preventDefault();
      this.handleProgressionSubmit();
    });

    // Save data when window is about to close
    window.addEventListener('beforeunload', () => {
      this.saveData();
    });

    // Save data when window loses focus
    window.addEventListener('blur', () => {
      this.saveData();
    });
  }

  // Modal Management
  showRoutineModal() {
    document.getElementById('routine-modal').style.display = 'block';
    document.getElementById('routine-name').focus();
  }

  showSkillModal(eventType, routineId) {
    this.currentEvent = eventType;
    this.currentRoutineId = routineId;
    
    // Map event types to database names
    const eventNameMap = {
      'floor': 'Floor Exercise',
      'pommel': 'Pommel Horse',
      'rings': 'Still Rings',
      'vault': 'Vault',
      'pbars': 'Parallel Bars',
      'hbar': 'High Bar'
    };
    
    const eventName = eventNameMap[eventType];
    
    // Set up search functionality
    this.setupSkillSearch(eventName);
    
    // Load initial skills list for this event
    this.renderSkillsSearchResults(eventName, '');
    
    document.getElementById('skill-modal').style.display = 'block';
    document.getElementById('skill-search').focus();
  }

  setupSkillSearch(eventName) {
    const searchInput = document.getElementById('skill-search');
    const resultsContainer = document.getElementById('skills-search-results');
    
    // Clear previous event listeners
    searchInput.replaceWith(searchInput.cloneNode(true));
    const newSearchInput = document.getElementById('skill-search');
    
    // Add search input listener
    newSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      this.renderSkillsSearchResults(eventName, query);
    });
    
    // Clear any previous results
    resultsContainer.innerHTML = '';
  }

  renderSkillsSearchResults(eventName, query) {
    const resultsContainer = document.getElementById('skills-search-results');
    const skills = searchSkills(eventName, query);
    
    if (skills.length === 0) {
      resultsContainer.innerHTML = `
        <div class="empty-results">
          ${query ? `No skills found matching "${query}"` : `No skills available for ${eventName}`}
        </div>
      `;
      return;
    }
    
    resultsContainer.innerHTML = skills.map(skill => `
      <div class="skill-item" data-skill-name="${skill.name}" data-skill-difficulty="${skill.difficulty}">
        <span class="skill-name">${skill.name}</span>
        <span class="skill-difficulty ${skill.difficulty}">${skill.difficulty}</span>
      </div>
    `).join('');
    
    // Add click listeners to skill items
    resultsContainer.querySelectorAll('.skill-item').forEach(item => {
      item.addEventListener('click', () => {
        this.selectSkillFromDatabase(
          item.dataset.skillName, 
          item.dataset.skillDifficulty
        );
      });
    });
  }

  selectSkillFromDatabase(skillName, difficulty) {
    // Populate the form with selected skill
    document.getElementById('skill-name').value = skillName;
    document.getElementById('skill-difficulty').value = difficulty;
    
    // Highlight selected item
    document.querySelectorAll('.skill-item').forEach(item => {
      item.classList.remove('selected');
    });
    
    const selectedItem = document.querySelector(`[data-skill-name="${skillName}"]`);
    if (selectedItem) {
      selectedItem.classList.add('selected');
    }
    
    // Clear search to show selection
    document.getElementById('skill-search').value = `Selected: ${skillName} (${difficulty})`;
  }

  showProgressionModal(eventType, routineId, skillId) {
    this.currentEvent = eventType;
    this.currentRoutineId = routineId;
    this.currentSkillId = skillId;
    
    // Find the skill to get its name
    const routine = this.data[eventType].find(r => r.id === routineId);
    const skill = routine?.skills.find(s => s.id === skillId);
    
    if (skill) {
      document.getElementById('target-skill-name').textContent = skill.name;
    }
    
    document.getElementById('progression-modal').style.display = 'block';
    document.getElementById('progression-name').focus();
  }

  closeModal(modal) {
    modal.style.display = 'none';
    // Reset forms
    modal.querySelectorAll('form').forEach(form => form.reset());
    
    // Reset skill search if closing skill modal
    if (modal.id === 'skill-modal') {
      document.getElementById('skill-search').value = '';
      document.getElementById('skills-search-results').innerHTML = '';
      document.querySelectorAll('.skill-item').forEach(item => {
        item.classList.remove('selected');
      });
    }
  }

  // Routine Management
  handleRoutineSubmit() {
    const name = document.getElementById('routine-name').value;
    const date = document.getElementById('routine-date').value;
    const notes = document.getElementById('routine-notes').value;

    const routine = {
      id: Date.now().toString(),
      name,
      date,
      notes,
      skills: [],
      createdAt: new Date().toISOString()
    };

    this.data[this.currentEvent].push(routine);
    this.saveData();
    this.renderRoutines(this.currentEvent);
    this.closeModal(document.getElementById('routine-modal'));
    this.showNotification('Routine created successfully', 'success');
  }

  // Skill Management
  handleSkillSubmit() {
    const name = document.getElementById('skill-name').value;
    const difficulty = document.getElementById('skill-difficulty').value;
    const targetDate = document.getElementById('skill-target-date').value;
    const notes = document.getElementById('skill-notes').value;

    const skill = {
      id: Date.now().toString(),
      name,
      difficulty,
      targetDate,
      notes,
      completed: false,
      completedAt: null,
      progressions: [],
      createdAt: new Date().toISOString()
    };

    const routine = this.data[this.currentEvent].find(r => r.id === this.currentRoutineId);
    if (routine) {
      routine.skills.push(skill);
      this.saveData();
      this.renderRoutines(this.currentEvent);
      this.closeModal(document.getElementById('skill-modal'));
      this.showNotification('Skill added successfully', 'success');
    }
  }

  // Progression Management
  handleProgressionSubmit() {
    const name = document.getElementById('progression-name').value;
    const difficulty = document.getElementById('progression-difficulty').value;
    const targetDate = document.getElementById('progression-target-date').value;
    const notes = document.getElementById('progression-notes').value;

    const progression = {
      id: Date.now().toString(),
      name,
      difficulty,
      targetDate,
      notes,
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString()
    };

    const routine = this.data[this.currentEvent].find(r => r.id === this.currentRoutineId);
    const skill = routine?.skills.find(s => s.id === this.currentSkillId);
    
    if (skill) {
      if (!skill.progressions) {
        skill.progressions = [];
      }
      skill.progressions.push(progression);
      this.saveData();
      this.renderRoutines(this.currentEvent);
      this.closeModal(document.getElementById('progression-modal'));
      this.showNotification('Progression step added successfully', 'success');
    }
  }

  toggleSkill(eventType, routineId, skillId) {
    const routine = this.data[eventType].find(r => r.id === routineId);
    if (routine) {
      const skill = routine.skills.find(s => s.id === skillId);
      if (skill) {
        skill.completed = !skill.completed;
        skill.completedAt = skill.completed ? new Date().toISOString() : null;
        this.saveData();
        this.renderRoutines(eventType);
      }
    }
  }

  toggleProgression(eventType, routineId, skillId, progressionId) {
    const routine = this.data[eventType].find(r => r.id === routineId);
    const skill = routine?.skills.find(s => s.id === skillId);
    const progression = skill?.progressions?.find(p => p.id === progressionId);
    
    if (progression) {
      progression.completed = !progression.completed;
      progression.completedAt = progression.completed ? new Date().toISOString() : null;
      this.saveData();
      this.renderRoutines(eventType);
    }
  }

  deleteSkill(eventType, routineId, skillId) {
    const routine = this.data[eventType].find(r => r.id === routineId);
    if (routine) {
      routine.skills = routine.skills.filter(s => s.id !== skillId);
      this.saveData();
      this.renderRoutines(eventType);
      this.showNotification('Skill deleted', 'info');
    }
  }

  deleteProgression(eventType, routineId, skillId, progressionId) {
    console.log('deleteProgression called with:', { eventType, routineId, skillId, progressionId });
    
    const routine = this.data[eventType].find(r => r.id === routineId);
    if (!routine) {
      console.error('Routine not found:', routineId);
      return;
    }
    
    const skill = routine.skills.find(s => s.id === skillId);
    if (!skill) {
      console.error('Skill not found:', skillId);
      return;
    }
    
    if (!skill.progressions) {
      console.error('No progressions found for skill:', skillId);
      return;
    }
    
    const initialLength = skill.progressions.length;
    skill.progressions = skill.progressions.filter(p => p.id !== progressionId);
    
    if (skill.progressions.length === initialLength) {
      console.error('Progression not found or not deleted:', progressionId);
      return;
    }
    
    console.log('Progression deleted successfully. Remaining progressions:', skill.progressions.length);
    
    this.saveData();
    this.renderRoutines(eventType);
    this.showNotification('Progression step deleted', 'info');
  }

  deleteRoutine(eventType, routineId) {
    this.data[eventType] = this.data[eventType].filter(r => r.id !== routineId);
    this.saveData();
    this.renderRoutines(eventType);
    this.showNotification('Routine deleted', 'info');
  }

  // Rendering
  renderAll() {
    Object.keys(this.data).forEach(eventType => {
      this.renderRoutines(eventType);
    });
  }

  renderRoutines(eventType) {
    const container = document.getElementById(`${eventType}-routines`);
    const routines = this.data[eventType];

    if (routines.length === 0) {
      container.innerHTML = this.renderEmptyState();
      return;
    }

    container.innerHTML = routines.map(routine => this.renderRoutine(eventType, routine)).join('');
    
    // Add event listeners for dynamic content
    this.addDynamicEventListeners(eventType);
  }

  renderEmptyState() {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">🎯</div>
        <div class="empty-state-text">No routines yet</div>
        <p>Click "Add Routine" to get started tracking your skills!</p>
      </div>
    `;
  }

  renderRoutine(eventType, routine) {
    const progress = this.calculateProgress(routine);
    const startValue = this.calculateStartValue(routine);
    const isOverdue = this.isOverdue(routine.date);
    
    return `
      <div class="routine-card fade-in">
        <div class="routine-header">
          <h3 class="routine-title">${routine.name}</h3>
          <span class="routine-date ${isOverdue ? 'overdue' : ''}">${this.formatDate(routine.date)}</span>
        </div>
        
        <div class="start-value-display">
          <div class="start-value-number">${startValue.total}</div>
          <div class="start-value-label">Start Value</div>
          <div class="start-value-breakdown">
            Base: ${startValue.baseValue} + Skills: ${startValue.skillsValue} (${startValue.skillCount} skills)
          </div>
        </div>

        <div class="routine-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress.percentage}%"></div>
          </div>
          <div class="progress-text">
            <span>${progress.completed}/${progress.total} skills completed</span>
            <span>${progress.percentage}%</span>
          </div>
        </div>

        <button class="add-skill-btn" data-event="${eventType}" data-routine="${routine.id}">
          + Add Skill
        </button>

        <ul class="skills-list">
          ${routine.skills.map(skill => this.renderSkill(eventType, routine.id, skill, routine.skills.indexOf(skill))).join('')}
        </ul>

        <div style="margin-top: 1rem; text-align: right;">
          <button class="delete-routine-btn" data-event="${eventType}" data-routine="${routine.id}" 
                  style="background: var(--danger-color); color: white; border: none; padding: 0.5rem 1rem; border-radius: var(--radius); cursor: pointer; font-size: 0.875rem;">
            Delete Routine
          </button>
        </div>
      </div>
    `;
  }

  renderSkill(eventType, routineId, skill, index) {
    const isOverdue = skill.targetDate && this.isOverdue(skill.targetDate) && !skill.completed;
    const difficultyValue = this.difficultyValues[skill.difficulty] || 0;
    const hasProgressions = skill.progressions && skill.progressions.length > 0;
    const progressionProgress = this.calculateProgressionProgress(skill);
    
    return `
      <li class="skill-item ${skill.completed ? 'skill-completed' : ''} ${hasProgressions ? 'skill-with-progressions' : ''}"
          draggable="true"
          data-event="${eventType}"
          data-routine="${routineId}"
          data-skill="${skill.id}"
          data-index="${index}">
        <div class="skill-order-number">${index + 1}</div>
        <div class="drag-handle" title="Drag to reorder">⋮⋮</div>
        <input type="checkbox" class="skill-checkbox" ${skill.completed ? 'checked' : ''} 
               data-event="${eventType}" data-routine="${routineId}" data-skill="${skill.id}">
        <div class="skill-info">
          <div class="skill-name">
            ${skill.name}
            <button class="add-progression-btn" data-event="${eventType}" data-routine="${routineId}" data-skill="${skill.id}">
              + Add Progression
            </button>
          </div>
          <div class="skill-meta">
            <span class="skill-difficulty">${skill.difficulty} (${difficultyValue})</span>
            ${skill.targetDate ? `<span class="skill-date ${isOverdue ? 'overdue' : ''}">${this.formatDate(skill.targetDate)}</span>` : ''}
            ${skill.notes ? `<span class="skill-notes">${skill.notes}</span>` : ''}
          </div>
          
          ${hasProgressions ? `
            <div class="progressions-section">
              <div class="progressions-header">
                <span class="progressions-title">Progression Steps</span>
              </div>
              <div class="progression-progress">
                <div class="progression-progress-bar">
                  <div class="progression-progress-fill" style="width: ${progressionProgress.percentage}%"></div>
                </div>
                <div class="progression-progress-text">
                  ${progressionProgress.completed}/${progressionProgress.total} steps completed
                </div>
              </div>
              <ul class="progressions-list">
                ${skill.progressions.map(progression => this.renderProgression(eventType, routineId, skill.id, progression)).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
        <button class="delete-skill-btn" data-event="${eventType}" data-routine="${routineId}" data-skill="${skill.id}"
                style="background: transparent; border: none; color: var(--danger-color); cursor: pointer; padding: 0.5rem; font-size: 1.2rem;">
          ×
        </button>
      </li>
    `;
  }

  renderProgression(eventType, routineId, skillId, progression) {
    const isOverdue = progression.targetDate && this.isOverdue(progression.targetDate) && !progression.completed;
    const difficultyValue = progression.difficulty ? this.difficultyValues[progression.difficulty] || 0 : null;
    
    console.log('Rendering progression with data:', { eventType, routineId, skillId, progressionId: progression.id });
    
    return `
      <li class="progression-item ${progression.completed ? 'progression-completed' : ''}">
        <input type="checkbox" class="progression-checkbox" ${progression.completed ? 'checked' : ''} 
               data-event="${eventType}" data-routine="${routineId}" data-skill="${skillId}" data-progression="${progression.id}">
        <div class="progression-info">
          <div class="progression-name">${progression.name}</div>
          <div class="progression-meta">
            ${progression.difficulty ? `<span class="progression-difficulty">${progression.difficulty} (${difficultyValue})</span>` : ''}
            ${progression.targetDate ? `<span class="progression-date ${isOverdue ? 'overdue' : ''}">${this.formatDate(progression.targetDate)}</span>` : ''}
            ${progression.notes ? `<span class="progression-notes">${progression.notes}</span>` : ''}
          </div>
        </div>
        <button type="button" class="delete-progression-btn" 
                data-event="${eventType}" 
                data-routine="${routineId}" 
                data-skill="${skillId}" 
                data-progression="${progression.id}"
                title="Delete this progression step">
          ×
        </button>
      </li>
    `;
  }

  // Skill reordering functionality
  reorderSkills(eventType, routineId, fromIndex, toIndex) {
    console.log('Reordering skills:', { eventType, routineId, fromIndex, toIndex });
    
    const routine = this.data[eventType].find(r => r.id === routineId);
    if (!routine || !routine.skills) {
      console.error('Routine or skills not found');
      return;
    }
    
    // Remove skill from old position and insert at new position
    const [movedSkill] = routine.skills.splice(fromIndex, 1);
    routine.skills.splice(toIndex, 0, movedSkill);
    
    console.log('Skills reordered successfully');
    this.saveData();
    this.renderRoutines(eventType);
    this.showNotification('Skills reordered successfully', 'success');
  }

  moveSkillToPosition(eventType, routineId, skillId, newPosition) {
    console.log('Moving skill to position:', { eventType, routineId, skillId, newPosition });
    
    const routine = this.data[eventType].find(r => r.id === routineId);
    if (!routine || !routine.skills) {
      console.error('Routine or skills not found');
      return;
    }
    
    // Find the current index of the skill
    const currentIndex = routine.skills.findIndex(s => s.id === skillId);
    if (currentIndex === -1) {
      console.error('Skill not found');
      return;
    }
    
    // Validate new position (1-based to 0-based index)
    const newIndex = newPosition - 1;
    if (newIndex < 0 || newIndex >= routine.skills.length) {
      this.showNotification('Invalid position. Please enter a number between 1 and ' + routine.skills.length, 'warning');
      return;
    }
    
    if (currentIndex === newIndex) {
      console.log('Skill already in that position');
      return;
    }
    
    // Reorder the skills
    this.reorderSkills(eventType, routineId, currentIndex, newIndex);
  }

  makeOrderNumberEditable(orderElement, eventType, routineId, skillId, currentPosition) {
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'skill-order-input';
    input.value = currentPosition;
    input.min = 1;
    input.max = this.data[eventType].find(r => r.id === routineId).skills.length;
    
    // Replace the order number with input
    orderElement.parentNode.replaceChild(input, orderElement);
    input.focus();
    input.select();
    
    const finishEditing = () => {
      const newPosition = parseInt(input.value);
      if (newPosition && newPosition !== currentPosition) {
        this.moveSkillToPosition(eventType, routineId, skillId, newPosition);
      } else {
        // Just re-render to restore the original order number
        this.renderRoutines(eventType);
      }
    };
    
    // Handle Enter key and blur
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        finishEditing();
      } else if (e.key === 'Escape') {
        // Cancel editing
        this.renderRoutines(eventType);
      }
    });
    
    input.addEventListener('blur', finishEditing);
  }

  setupDragAndDrop(container) {
    let draggedElement = null;
    let draggedData = null;
    
    // Handle drag start
    container.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('skill-item')) {
        draggedElement = e.target;
        draggedData = {
          eventType: e.target.dataset.event,
          routineId: e.target.dataset.routine,
          skillId: e.target.dataset.skill,
          index: parseInt(e.target.dataset.index)
        };
        
        e.target.classList.add('dragging');
        e.target.parentElement.classList.add('drag-active');
        
        console.log('Drag started:', draggedData);
        e.dataTransfer.effectAllowed = 'move';
      }
    });
    
    // Handle drag over
    container.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      
      const skillItem = e.target.closest('.skill-item');
      if (skillItem && skillItem !== draggedElement) {
        // Remove drag-over class from all items
        container.querySelectorAll('.skill-item').forEach(item => {
          item.classList.remove('drag-over');
        });
        skillItem.classList.add('drag-over');
      }
    });
    
    // Handle drag leave
    container.addEventListener('dragleave', (e) => {
      const skillItem = e.target.closest('.skill-item');
      if (skillItem) {
        skillItem.classList.remove('drag-over');
      }
    });
    
    // Handle drop
    container.addEventListener('drop', (e) => {
      e.preventDefault();
      
      const targetItem = e.target.closest('.skill-item');
      if (targetItem && targetItem !== draggedElement && draggedData) {
        const targetIndex = parseInt(targetItem.dataset.index);
        const sourceIndex = draggedData.index;
        
        console.log('Drop detected:', { sourceIndex, targetIndex });
        
        if (sourceIndex !== targetIndex) {
          this.reorderSkills(
            draggedData.eventType,
            draggedData.routineId,
            sourceIndex,
            targetIndex
          );
        }
      }
      
      // Clean up
      container.querySelectorAll('.skill-item').forEach(item => {
        item.classList.remove('drag-over', 'dragging');
      });
      container.querySelectorAll('.skills-list').forEach(list => {
        list.classList.remove('drag-active');
      });
      
      draggedElement = null;
      draggedData = null;
    });
    
    // Handle drag end
    container.addEventListener('dragend', (e) => {
      // Clean up drag styles
      container.querySelectorAll('.skill-item').forEach(item => {
        item.classList.remove('drag-over', 'dragging');
      });
      container.querySelectorAll('.skills-list').forEach(list => {
        list.classList.remove('drag-active');
      });
      
      draggedElement = null;
      draggedData = null;
    });
  }

  addDynamicEventListeners(eventType) {
    const container = document.getElementById(`${eventType}-routines`);
    
    // Remove any existing event listeners to prevent duplicates
    const newContainer = container.cloneNode(true);
    container.parentNode.replaceChild(newContainer, container);
    const cleanContainer = document.getElementById(`${eventType}-routines`);
    
    // Set up drag and drop
    this.setupDragAndDrop(cleanContainer);
    
    // Use event delegation for all dynamic content
    cleanContainer.addEventListener('click', (e) => {
      console.log('Click event detected on:', e.target.tagName, e.target.className, e.target.textContent);
      
      e.stopPropagation();
      
      // Don't prevent default for checkboxes - they need their default behavior
      if (!e.target.classList.contains('skill-checkbox') && 
          !e.target.classList.contains('progression-checkbox')) {
        e.preventDefault();
      }
      
      // Check if this is a delete progression button or contains one
      let target = e.target;
      
      // Look up the DOM tree to find the actual button if we clicked inside it
      while (target && target !== cleanContainer) {
        console.log('Checking element:', target.tagName, target.className);
        
        if (target.classList.contains('delete-progression-btn')) {
          console.log('Found delete progression button!', target.dataset);
          
          const eventType = target.dataset.event;
          const routineId = target.dataset.routine;
          const skillId = target.dataset.skill;
          const progressionId = target.dataset.progression;
          
          console.log('Deleting progression immediately:', { eventType, routineId, skillId, progressionId });
          
          try {
            this.deleteProgression(eventType, routineId, skillId, progressionId);
            console.log('Delete progression method completed');
          } catch (error) {
            console.error('Error during deleteProgression:', error);
          }
          return;
        }
        
        // Add skill button
        if (target.classList.contains('add-skill-btn')) {
          const eventType = target.dataset.event;
          const routineId = target.dataset.routine;
          this.showSkillModal(eventType, routineId);
          return;
        }
        
        // Add progression button
        if (target.classList.contains('add-progression-btn')) {
          const eventType = target.dataset.event;
          const routineId = target.dataset.routine;
          const skillId = target.dataset.skill;
          this.showProgressionModal(eventType, routineId, skillId);
          return;
        }
        
        // Order number click - make editable
        if (target.classList.contains('skill-order-number')) {
          const skillItem = target.closest('.skill-item');
          if (skillItem) {
            const eventType = skillItem.dataset.event;
            const routineId = skillItem.dataset.routine;
            const skillId = skillItem.dataset.skill;
            const currentPosition = parseInt(target.textContent);
            
            this.makeOrderNumberEditable(target, eventType, routineId, skillId, currentPosition);
          }
          return;
        }
        
        // Delete skill button
        if (target.classList.contains('delete-skill-btn')) {
          if (confirm('Are you sure you want to delete this skill and all its progressions?')) {
            const eventType = target.dataset.event;
            const routineId = target.dataset.routine;
            const skillId = target.dataset.skill;
            this.deleteSkill(eventType, routineId, skillId);
          }
          return;
        }
        
        // Delete routine button
        if (target.classList.contains('delete-routine-btn')) {
          if (confirm('Are you sure you want to delete this entire routine and all its skills?')) {
            const eventType = target.dataset.event;
            const routineId = target.dataset.routine;
            this.deleteRoutine(eventType, routineId);
          }
          return;
        }
        
        target = target.parentElement;
      }
    });
    
    // Use event delegation for checkboxes (change event)
    cleanContainer.addEventListener('change', (e) => {
      // Skill checkboxes
      if (e.target.classList.contains('skill-checkbox')) {
        const eventType = e.target.dataset.event;
        const routineId = e.target.dataset.routine;
        const skillId = e.target.dataset.skill;
        this.toggleSkill(eventType, routineId, skillId);
        return;
      }
      
      // Progression checkboxes
      if (e.target.classList.contains('progression-checkbox')) {
        const eventType = e.target.dataset.event;
        const routineId = e.target.dataset.routine;
        const skillId = e.target.dataset.skill;
        const progressionId = e.target.dataset.progression;
        this.toggleProgression(eventType, routineId, skillId, progressionId);
        return;
      }
    });
  }

  // Utility Functions
  calculateProgress(routine) {
    const total = routine.skills.length;
    const completed = routine.skills.filter(skill => skill.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, percentage };
  }

  isOverdue(dateString) {
    if (!dateString) return false;
    const targetDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return targetDate < today;
  }

  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.gymnasticsTracker = new GymnasticsTracker();
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Escape key closes modals
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal').forEach(modal => {
      if (modal.style.display === 'block') {
        modal.style.display = 'none';
      }
    });
  }
});
