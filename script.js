// My Starboard Extension - Main JavaScript
class TabNow {
    constructor() {
        this.notepadEditor = document.getElementById('notepadEditor');
        this.themeToggle = document.getElementById('themeToggle');
        
        // Notepad formatting buttons
        this.boldBtn = document.getElementById('boldBtn');
        this.italicBtn = document.getElementById('italicBtn');
        this.underlineBtn = document.getElementById('underlineBtn');
        this.bulletListBtn = document.getElementById('bulletListBtn');
        this.numberedListBtn = document.getElementById('numberedListBtn');
        this.checklistBtn = document.getElementById('checklistBtn');
        this.autocompleteDropdown = document.getElementById('autocompleteDropdown');
        
        // Autocomplete state
        this.autocompleteVisible = false;
        this.autocompleteIndex = 0;
        this.autocompleteItems = [];
        this.currentWord = '';
        this.currentWordStart = null;
        
        // Link detection regex - matches URLs and trims trailing punctuation
        this.urlRegex = /(?:https?:\/\/|www\.)[^\s<>]+/gi;
        this.trailingPunctuation = /[.,;:!?'")\]]+$/;
        
        // To-do elements
        this.addTodoBtn = document.getElementById('addTodoBtn');
        this.clearTodosBtn = document.getElementById('clearTodosBtn');
        this.todoInput = document.getElementById('todoInput');
        this.todoTagInput = document.getElementById('todoTagInput');
        this.todoInputContainer = document.getElementById('todoInputContainer');
        this.saveTodoBtn = document.getElementById('saveTodoBtn');
        this.cancelTodoBtn = document.getElementById('cancelTodoBtn');
        this.todoList = document.getElementById('todoList');
        
        // Reminder elements
        this.addReminderBtn = document.getElementById('addReminderBtn');
        this.reminderInputContainer = document.getElementById('reminderInputContainer');
        this.reminderText = document.getElementById('reminderText');
        this.reminderDate = document.getElementById('reminderDate');
        this.reminderTime = document.getElementById('reminderTime');
        this.allDayToggle = document.getElementById('allDayToggle');
        this.repeatOption = document.getElementById('repeatOption');
        this.saveReminderBtn = document.getElementById('saveReminderBtn');
        this.cancelReminderBtn = document.getElementById('cancelReminderBtn');
        this.remindersList = document.getElementById('remindersList');

        
        // Weather elements
        this.weatherContent = document.getElementById('weatherContent');
        this.refreshWeatherBtn = document.getElementById('refreshWeatherBtn');
        this.locationBtn = document.getElementById('locationBtn');
        
        // Clock elements
        this.clockSettingsBtn = document.getElementById('clockSettingsBtn');
        this.localTime = document.getElementById('localTime');
        this.additionalLocations = document.getElementById('additionalLocations');
        this.addLocationBtn = document.getElementById('addLocationBtn');
        
        this.todos = [];
        this.reminders = [];
        this.editingReminderId = null; // Track which reminder is being edited
        this.editingTodoId = null; // Track which todo is being edited

        this.selectedTagColor = '#7a9471'; // Default tag color
        this.draggedElement = null; // Track dragged todo item
        this.weatherData = null;
        this.weatherCacheTime = null; // Track when weather was last cached
        this.weatherCacheDuration = 10 * 60 * 1000; // Cache for 10 minutes (real weather updates more frequently)
        this.temperatureUnit = 'F'; // Default to Fahrenheit
        this.currentLocation = null;
        this.additionalClockLocations = []; // User's additional time zones (max 2 additional)
        
        // Sync & Data elements
        this.syncIndicator = document.getElementById('syncIndicator');
        this.dataMenuBtn = document.getElementById('dataMenuBtn');
        this.dataDropdown = document.getElementById('dataDropdown');
        this.exportDataBtn = document.getElementById('exportDataBtn');
        this.importDataBtn = document.getElementById('importDataBtn');
        this.importFileInput = document.getElementById('importFileInput');
        this.forceSyncBtn = document.getElementById('forceSyncBtn');
        this.pullFromCloudBtn = document.getElementById('pullFromCloudBtn');
        this.syncInfo = document.getElementById('syncInfo');

        this.init();
    }
    
    init() {
        this.setupTitle();
        this.setupTheme();
        this.setupNotepad();
        this.setupTodoList();
        this.setupReminders();
        this.setupWeather();
        this.setupClock();
        this.setupDataMenu();
        this.loadSavedData();
        
        // Cleanup old reminders on startup
        this.cleanupOldReminders();
        
        // Initialize Chrome sync after data is loaded
        this.initChromeSync();
    }
    
    setupTitle() {
        // Check if we're in Firefox and add star emoji if needed
        const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
        if (isFirefox && !document.title.includes('⭐')) {
            document.title = '⭐ ' + document.title;
        }
    }
    
    // Theme Management
    setupTheme() {
        // Set initial theme based on time of day
        const hour = new Date().getHours();
        const isDarkTime = hour < 6 || hour >= 18;
        
        const savedTheme = localStorage.getItem('tabNowTheme');
        const theme = savedTheme || (isDarkTime ? 'dark' : 'light');
        
        this.setTheme(theme);
        
        this.themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
        });
    }
    
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const themeIcon = this.themeToggle.querySelector('.theme-icon');
        themeIcon.src = theme === 'dark' ? 'icons/light-512.png' : 'icons/dark-512.png';
        localStorage.setItem('tabNowTheme', theme);
        this.saveDataImmediately();
    }
    
    // Notepad Functionality - Simple editor with bold, italic, underline, and autocomplete
    setupNotepad() {
        // Common autocomplete suggestions
        this.autocompleteSuggestions = [
            // Common words
            'the', 'that', 'this', 'there', 'these', 'those', 'through', 'therefore',
            'because', 'before', 'between', 'being', 'become', 'becoming',
            'about', 'above', 'after', 'again', 'against', 'already', 'always',
            'important', 'information', 'interesting', 'implementation',
            'would', 'could', 'should', 'which', 'where', 'when', 'while', 'with', 'without',
            'meeting', 'message', 'morning', 'moment',
            'remember', 'reminder', 'review', 'request', 'response', 'result',
            'project', 'problem', 'process', 'progress', 'probably',
            'something', 'someone', 'sometimes', 'schedule', 'suggestion',
            'however', 'having', 'happened',
            'different', 'document', 'deadline', 'discussion',
            'understand', 'unfortunately', 'update', 'urgent',
            'available', 'actually', 'appreciate', 'attention',
            'complete', 'completed', 'conference', 'confirm', 'consider',
            'example', 'experience', 'excellent',
            'following', 'forward', 'feedback',
            'necessary', 'nevertheless',
            'opportunity', 'organization',
            'please', 'possible', 'presentation',
            'question', 'quickly',
            // Days and time
            'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
            'January', 'February', 'March', 'April', 'May', 'June', 
            'July', 'August', 'September', 'October', 'November', 'December',
            'tomorrow', 'yesterday', 'today', 'tonight',
        ];
        
        // Formatting buttons
        this.boldBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleFormat('bold');
        });
        
        this.italicBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleFormat('italic');
        });
        
        this.underlineBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleFormat('underline');
        });
        
        // List buttons
        this.bulletListBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleList('insertUnorderedList');
        });
        
        this.numberedListBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleList('insertOrderedList');
        });
        
        this.checklistBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.insertChecklist();
        });
        
        // Editor input event - save, check autocomplete, and detect links
        this.notepadEditor.addEventListener('input', (e) => {
            this.saveNotepadContent();
            this.checkAutocomplete();
            
            // Auto-detect links on space or enter
            if (e.inputType === 'insertText' && (e.data === ' ' || e.data === '\n')) {
                this.autoDetectLinks();
            }
        });
        
        // Also detect links on paste
        this.notepadEditor.addEventListener('paste', () => {
            setTimeout(() => {
                this.autoDetectLinks();
                this.saveNotepadContent();
            }, 0);
        });
        
        // Update button states on selection change
        this.notepadEditor.addEventListener('mouseup', () => {
            this.updateFormatButtonStates();
        });
        
        this.notepadEditor.addEventListener('keyup', (e) => {
            // Don't update on autocomplete navigation keys
            if (!['ArrowDown', 'ArrowUp', 'Enter', 'Escape', 'Tab'].includes(e.key)) {
                this.updateFormatButtonStates();
            }
        });
        
        // Keyboard shortcuts and autocomplete navigation
        this.notepadEditor.addEventListener('keydown', (e) => {
            // Handle autocomplete navigation
            if (this.autocompleteVisible) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.navigateAutocomplete(1);
                    return;
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.navigateAutocomplete(-1);
                    return;
                } else if (e.key === 'Enter' || e.key === 'Tab') {
                    if (this.autocompleteItems.length > 0) {
                        e.preventDefault();
                        this.selectAutocompleteItem(this.autocompleteIndex);
                        return;
                    }
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    this.hideAutocomplete();
                    return;
                }
            }
            
            // Keyboard shortcuts for formatting
            if (e.ctrlKey || e.metaKey) {
                switch(e.key.toLowerCase()) {
                    case 'b':
                        e.preventDefault();
                        this.toggleFormat('bold');
                        break;
                    case 'i':
                        e.preventDefault();
                        this.toggleFormat('italic');
                        break;
                    case 'u':
                        e.preventDefault();
                        this.toggleFormat('underline');
                        break;
                }
            }
        });
        
        // Hide autocomplete when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.notepadEditor.contains(e.target) && !this.autocompleteDropdown.contains(e.target)) {
                this.hideAutocomplete();
            }
        });
        
        // Prevent mousedown from stealing focus from the editor
        this.autocompleteDropdown.addEventListener('mousedown', (e) => {
            e.preventDefault();
        });
        
        // Handle autocomplete item clicks
        this.autocompleteDropdown.addEventListener('click', (e) => {
            const item = e.target.closest('.autocomplete-item');
            if (item) {
                const index = parseInt(item.dataset.index);
                this.selectAutocompleteItem(index);
            }
        });
        
        // Handle checklist checkbox clicks and link clicks
        this.notepadEditor.addEventListener('click', (e) => {
            // Handle checklist checkbox
            if (e.target.classList.contains('checklist-checkbox')) {
                e.preventDefault();
                const item = e.target.closest('.checklist-item');
                if (item) {
                    item.classList.toggle('checked');
                    this.saveNotepadContent();
                }
                return;
            }
            
            // Handle link clicks - open in new tab
            if (e.target.tagName === 'A') {
                e.preventDefault();
                window.open(e.target.href, '_blank', 'noopener,noreferrer');
            }
        });
    }
    
    toggleFormat(command) {
        document.execCommand(command, false, null);
        this.notepadEditor.focus();
        this.updateFormatButtonStates();
    }
    
    updateFormatButtonStates() {
        // Check if formatting is active
        try {
            this.boldBtn.classList.toggle('active', document.queryCommandState('bold'));
            this.italicBtn.classList.toggle('active', document.queryCommandState('italic'));
            this.underlineBtn.classList.toggle('active', document.queryCommandState('underline'));
            this.bulletListBtn.classList.toggle('active', document.queryCommandState('insertUnorderedList'));
            this.numberedListBtn.classList.toggle('active', document.queryCommandState('insertOrderedList'));
            
            // Check if we're in a checklist
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                let element = range.startContainer;
                if (element.nodeType === Node.TEXT_NODE) element = element.parentElement;
                const isInChecklist = element.closest('.checklist-item') !== null;
                this.checklistBtn.classList.toggle('active', isInChecklist);
            }
        } catch (e) {
            // Commands might not be supported
        }
    }
    
    // List functionality
    toggleList(command) {
        document.execCommand(command, false, null);
        this.notepadEditor.focus();
        this.updateFormatButtonStates();
        this.saveNotepadContent();
    }
    
    insertChecklist() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        // Check if we're already in a checklist - if so, remove it
        const range = selection.getRangeAt(0);
        let element = range.startContainer;
        if (element.nodeType === Node.TEXT_NODE) element = element.parentElement;
        const existingChecklist = element.closest('.checklist-item');
        
        if (existingChecklist) {
            // Convert checklist item back to normal text
            const text = existingChecklist.querySelector('.checklist-text')?.textContent || existingChecklist.textContent;
            const textNode = document.createTextNode(text);
            existingChecklist.parentNode.replaceChild(textNode, existingChecklist);
        } else {
            // Get selected text or current line
            const selectedText = selection.toString() || '';
            
            // Create checklist item
            const checklistItem = document.createElement('div');
            checklistItem.className = 'checklist-item';
            checklistItem.innerHTML = `<span class="checklist-checkbox" contenteditable="false"></span><span class="checklist-text">${this.escapeHtml(selectedText) || '<br>'}</span>`;
            
            // Replace selection or insert at cursor
            if (!range.collapsed) {
                range.deleteContents();
            }
            range.insertNode(checklistItem);
            
            // Add line break after for easier continued typing
            const br = document.createElement('br');
            checklistItem.parentNode.insertBefore(br, checklistItem.nextSibling);
            
            // Move cursor into the checklist text
            const textSpan = checklistItem.querySelector('.checklist-text');
            const newRange = document.createRange();
            newRange.selectNodeContents(textSpan);
            newRange.collapse(false);
            selection.removeAllRanges();
            selection.addRange(newRange);
        }
        
        this.notepadEditor.focus();
        this.updateFormatButtonStates();
        this.saveNotepadContent();
    }
    
    // Handle checklist checkbox clicks
    handleChecklistClick(e) {
        if (e.target.classList.contains('checklist-checkbox')) {
            e.preventDefault();
            const checkbox = e.target;
            const item = checkbox.closest('.checklist-item');
            if (item) {
                item.classList.toggle('checked');
                this.saveNotepadContent();
            }
        }
    }
    
    // Auto-detect and format links
    autoDetectLinks() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        // Save cursor position
        const savedRange = selection.getRangeAt(0).cloneRange();
        
        // Get all text nodes in the editor
        const walker = document.createTreeWalker(
            this.notepadEditor,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            // Skip text nodes that are already inside links
            if (!node.parentElement.closest('a')) {
                textNodes.push(node);
            }
        }
        
        // Process each text node for URLs
        textNodes.forEach(textNode => {
            const text = textNode.textContent;
            const matches = [...text.matchAll(this.urlRegex)];
            
            if (matches.length === 0) return;
            
            // Process matches in reverse order to preserve indices
            const fragment = document.createDocumentFragment();
            let lastIndex = 0;
            
            matches.forEach(match => {
                let url = match[0];
                const startIndex = match.index;
                
                // Trim trailing punctuation that's likely not part of the URL
                const trailingMatch = url.match(this.trailingPunctuation);
                const trailingPunct = trailingMatch ? trailingMatch[0] : '';
                url = url.replace(this.trailingPunctuation, '');
                
                // Add text before the URL
                if (startIndex > lastIndex) {
                    fragment.appendChild(document.createTextNode(text.substring(lastIndex, startIndex)));
                }
                
                // Create the link
                const link = document.createElement('a');
                link.href = url.startsWith('www.') ? 'https://' + url : url;
                link.textContent = url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                fragment.appendChild(link);
                
                // Add back any trailing punctuation as plain text
                if (trailingPunct) {
                    fragment.appendChild(document.createTextNode(trailingPunct));
                }
                
                lastIndex = startIndex + url.length + trailingPunct.length;
            });
            
            // Add remaining text after the last URL
            if (lastIndex < text.length) {
                fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
            }
            
            // Replace the text node with the fragment
            textNode.parentNode.replaceChild(fragment, textNode);
        });
        
        // Restore cursor position (approximately)
        try {
            selection.removeAllRanges();
            selection.addRange(savedRange);
        } catch (e) {
            // Cursor restoration failed, focus at end
            this.notepadEditor.focus();
        }
    }
    
    // Autocomplete functionality
    checkAutocomplete() {
        const selection = window.getSelection();
        if (!selection.rangeCount) {
            this.hideAutocomplete();
            return;
        }
        
        const range = selection.getRangeAt(0);
        if (!range.collapsed) {
            this.hideAutocomplete();
            return;
        }
        
        // Get the current word being typed
        const currentWord = this.getCurrentWord();
        
        if (!currentWord || currentWord.length < 2) {
            this.hideAutocomplete();
            return;
        }
        
        // Find matching suggestions
        const matches = this.autocompleteSuggestions.filter(suggestion => 
            suggestion.toLowerCase().startsWith(currentWord.toLowerCase()) && 
            suggestion.toLowerCase() !== currentWord.toLowerCase()
        ).slice(0, 6); // Limit to 6 suggestions
        
        if (matches.length === 0) {
            this.hideAutocomplete();
            return;
        }
        
        this.showAutocomplete(matches);
    }
    
    getCurrentWord() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return '';
        
        const range = selection.getRangeAt(0);
        const textNode = range.startContainer;
        
        if (textNode.nodeType !== Node.TEXT_NODE) return '';
        
        const text = textNode.textContent;
        const cursorPos = range.startOffset;
        
        // Find word start
        let wordStart = cursorPos;
        while (wordStart > 0 && /\w/.test(text[wordStart - 1])) {
            wordStart--;
        }
        
        this.currentWordStart = wordStart;
        this.currentWord = text.substring(wordStart, cursorPos);
        
        return this.currentWord;
    }
    
    showAutocomplete(items) {
        this.autocompleteItems = items;
        this.autocompleteIndex = 0;
        
        // Build dropdown HTML
        const html = items.map((item, index) => {
            const matchedPart = item.substring(0, this.currentWord.length);
            const remainingPart = item.substring(this.currentWord.length);
            return `<div class="autocomplete-item ${index === 0 ? 'selected' : ''}" data-index="${index}">
                <span class="matched">${this.escapeHtml(matchedPart)}</span><span class="completion">${this.escapeHtml(remainingPart)}</span>
            </div>`;
        }).join('');
        
        this.autocompleteDropdown.innerHTML = html;
        
        // Position the dropdown near the cursor
        this.positionAutocomplete();
        
        this.autocompleteDropdown.style.display = 'block';
        this.autocompleteVisible = true;
    }
    
    hideAutocomplete() {
        this.autocompleteDropdown.style.display = 'none';
        this.autocompleteVisible = false;
        this.autocompleteItems = [];
        this.autocompleteIndex = 0;
    }
    
    positionAutocomplete() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const editorRect = this.notepadEditor.getBoundingClientRect();
        
        // Position below the cursor, relative to the editor container
        const container = this.notepadEditor.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        this.autocompleteDropdown.style.left = `${rect.left - containerRect.left}px`;
        this.autocompleteDropdown.style.top = `${rect.bottom - containerRect.top + 4}px`;
    }
    
    navigateAutocomplete(direction) {
        const items = this.autocompleteDropdown.querySelectorAll('.autocomplete-item');
        if (items.length === 0) return;
        
        // Remove selection from current item
        items[this.autocompleteIndex]?.classList.remove('selected');
        
        // Update index
        this.autocompleteIndex += direction;
        if (this.autocompleteIndex < 0) this.autocompleteIndex = items.length - 1;
        if (this.autocompleteIndex >= items.length) this.autocompleteIndex = 0;
        
        // Add selection to new item
        items[this.autocompleteIndex]?.classList.add('selected');
        
        // Scroll into view if needed
        items[this.autocompleteIndex]?.scrollIntoView({ block: 'nearest' });
    }
    
    selectAutocompleteItem(index) {
        const item = this.autocompleteItems[index];
        if (!item) return;
        
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        const textNode = range.startContainer;
        
        if (textNode.nodeType !== Node.TEXT_NODE) return;
        
        const text = textNode.textContent;
        const cursorPos = range.startOffset;
        
        // Replace the current word with the selected suggestion
        const beforeWord = text.substring(0, this.currentWordStart);
        const afterWord = text.substring(cursorPos);
        const newText = beforeWord + item + afterWord;
        
        textNode.textContent = newText;
        
        // Move cursor to end of inserted word
        const newCursorPos = this.currentWordStart + item.length;
        range.setStart(textNode, newCursorPos);
        range.setEnd(textNode, newCursorPos);
        selection.removeAllRanges();
        selection.addRange(range);
        
        this.hideAutocomplete();
        this.saveNotepadContent();
    }
    
    saveNotepadContent() {
        localStorage.setItem('tabNowNotes', this.notepadEditor.innerHTML);
        this.saveDataImmediately();
    }

    
    // To-Do List Functionality
    setupTodoList() {
        this.addTodoBtn.addEventListener('click', () => {
            this.showTodoInput();
        });
        
        this.clearTodosBtn.addEventListener('click', () => {
            this.clearAllTodos();
        });
        
        this.saveTodoBtn.addEventListener('click', () => {
            this.saveTodo();
        });
        
        this.cancelTodoBtn.addEventListener('click', () => {
            this.hideTodoInput();
        });
        
        this.todoInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.saveTodo();
            } else if (e.key === 'Escape') {
                this.hideTodoInput();
            }
        });

        // Cache tag color options for reuse
        this.tagColorOptions = document.querySelectorAll('.tag-color-option');
        this.tagColorOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.selectTagColor(option);
            });
        });

        // Set default selected color
        const defaultColorOption = document.querySelector('.tag-color-option[data-color="#7a9471"]');
        if (defaultColorOption) {
            defaultColorOption.classList.add('selected');
        }

        // Event delegation for edit and delete buttons
        this.todoList.addEventListener('click', (e) => {
            const target = e.target;
            const todoId = target.getAttribute('data-id');
            
            if (todoId) {
                if (target.classList.contains('todo-edit')) {
                    this.editTodo(parseInt(todoId));
                } else if (target.classList.contains('todo-delete')) {
                    this.deleteTodo(parseInt(todoId));
                } else if (target.classList.contains('todo-checkbox')) {
                    this.toggleTodo(parseInt(todoId));
                }
            }
        });
    }

    selectTagColor(option) {
        // Remove selected class from all options
        this.tagColorOptions.forEach(opt => opt.classList.remove('selected'));
        // Add selected class to clicked option
        option.classList.add('selected');
        // Update selected color
        this.selectedTagColor = option.getAttribute('data-color');
        // Save preference
        localStorage.setItem('tabNowSelectedTagColor', this.selectedTagColor);
        this.saveDataImmediately();
    }
    
    showTodoInput() {
        this.todoInputContainer.style.display = 'flex';
        this.todoInput.focus();
        this.updateTodoFormUI();
    }
    
    hideTodoInput() {
        this.todoInputContainer.style.display = 'none';
        this.todoInput.value = '';
        this.todoTagInput.value = '';
        this.editingTodoId = null;
        this.updateTodoFormUI();
    }

    updateTodoFormUI() {
        const saveBtn = this.saveTodoBtn;
        
        if (this.editingTodoId) {
            saveBtn.textContent = 'Update';
            saveBtn.title = 'Update todo';
        } else {
            saveBtn.textContent = 'Save';
            saveBtn.title = 'Save todo';
        }
    }

    editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;
        
        this.editingTodoId = id;
        this.todoInput.value = todo.text;
        this.todoTagInput.value = todo.tag || '';
        
        // Set the selected color for the tag
        if (todo.tagColor) {
            this.selectedTagColor = todo.tagColor;
            // Update UI to show selected color
            this.tagColorOptions.forEach(opt => opt.classList.remove('selected'));
            const selectedOption = document.querySelector(`[data-color="${todo.tagColor}"]`);
            if (selectedOption) {
                selectedOption.classList.add('selected');
            }
        }
        
        this.showTodoInput();
    }
    
    saveTodo() {
        const text = this.todoInput.value.trim();
        const tag = this.todoTagInput.value.trim();
        
        if (text) {
            if (this.editingTodoId) {
                // Update existing todo
                const todoIndex = this.todos.findIndex(t => t.id === this.editingTodoId);
                if (todoIndex !== -1) {
                    this.todos[todoIndex] = {
                        ...this.todos[todoIndex],
                        text: text,
                        tag: tag || null,
                        tagColor: tag ? this.selectedTagColor : null,
                        updatedAt: new Date().toISOString()
                    };
                }
            } else {
                // Create new todo
                const todo = {
                    id: Date.now(),
                    text: text,
                    tag: tag || null,
                    tagColor: tag ? this.selectedTagColor : null,
                    completed: false,
                    createdAt: new Date().toISOString()
                };
                
                this.todos.unshift(todo);
            }
            
            this.renderTodos();
            this.saveTodos();
            this.hideTodoInput();
        }
    }
    
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.renderTodos();
            this.saveTodos();
        }
    }
    
    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.renderTodos();
        this.saveTodos();
    }
    
    clearAllTodos() {
        if (this.todos.length === 0) {
            return; // Nothing to clear
        }
        
        // Show confirmation dialog
        if (confirm('Are you sure you want to clear all to-do items? This action cannot be undone.')) {
            this.todos = [];
            this.renderTodos();
            this.saveTodos();
        }
    }
    
    renderTodos() {
        this.todoList.innerHTML = '';
        
        // Show hint text when no todos exist
        if (this.todos.length === 0) {
            const emptyHint = document.createElement('div');
            emptyHint.className = 'todo-empty-hint';
            emptyHint.textContent = 'Ready when you are!';
            this.todoList.appendChild(emptyHint);
            return;
        }
        
        this.todos.forEach((todo, index) => {
            const todoItem = document.createElement('li');
            todoItem.className = 'todo-item';
            todoItem.draggable = true;
            todoItem.setAttribute('data-id', todo.id);
            todoItem.setAttribute('data-index', index);
            
            const tagHtml = todo.tag && todo.tagColor ? 
                `<span class="todo-tag" style="background-color: ${todo.tagColor};">${this.escapeHtml(todo.tag)}</span>` : '';
            
            todoItem.innerHTML = `
                <div class="todo-drag-handle" title="Drag to reorder">⋮⋮</div>
                <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" data-id="${todo.id}"></div>
                <div class="todo-content">
                    ${tagHtml}
                    <span class="todo-text ${todo.completed ? 'completed' : ''}">${this.escapeHtml(todo.text)}</span>
                </div>
                <div class="todo-actions-bar">
                    <button class="todo-edit" data-id="${todo.id}" title="Edit todo">✏️</button>
                    <button class="todo-delete" data-id="${todo.id}" title="Delete todo">×</button>
                </div>
            `;
            
            // Add drag event listeners
            todoItem.addEventListener('dragstart', (e) => this.handleDragStart(e));
            todoItem.addEventListener('dragover', (e) => this.handleDragOver(e));
            todoItem.addEventListener('drop', (e) => this.handleDrop(e));
            todoItem.addEventListener('dragenter', (e) => this.handleDragEnter(e));
            todoItem.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            todoItem.addEventListener('dragend', (e) => this.handleDragEnd(e));
            
            // Prevent dragging when clicking on interactive elements
            const checkbox = todoItem.querySelector('.todo-checkbox');
            const editBtn = todoItem.querySelector('.todo-edit');
            const deleteBtn = todoItem.querySelector('.todo-delete');
            
            [checkbox, editBtn, deleteBtn].forEach(el => {
                el.addEventListener('mousedown', (e) => {
                    todoItem.draggable = false;
                });
                el.addEventListener('mouseup', (e) => {
                    todoItem.draggable = true;
                });
            });
            
            this.todoList.appendChild(todoItem);
        });
    }
    
    saveTodos() {
        localStorage.setItem('tabNowTodos', JSON.stringify(this.todos));
        this.saveDataImmediately();
    }

    // Drag and Drop handlers for todo reordering
    handleDragStart(e) {
        this.draggedElement = e.target;
        e.target.classList.add('dragging');
        e.target.style.opacity = '0.5';
        
        // Set drag data
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const afterElement = this.getDragAfterElement(this.todoList, e.clientY);
        const dragging = document.querySelector('.dragging');
        
        if (afterElement == null) {
            this.todoList.appendChild(dragging);
        } else {
            this.todoList.insertBefore(dragging, afterElement);
        }
    }

    handleDragEnter(e) {
        e.preventDefault();
        if (e.target.classList.contains('todo-item') && e.target !== this.draggedElement) {
            e.target.classList.add('drag-over');
        }
    }

    handleDragLeave(e) {
        if (e.target.classList.contains('todo-item')) {
            e.target.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        if (e.target.classList.contains('todo-item')) {
            e.target.classList.remove('drag-over');
        }
        
        // Get the new order from the DOM
        const todoItems = Array.from(this.todoList.children);
        const newOrder = [];
        
        todoItems.forEach(item => {
            const todoId = parseInt(item.getAttribute('data-id'));
            const todo = this.todos.find(t => t.id === todoId);
            if (todo) {
                newOrder.push(todo);
            }
        });
        
        // Update the todos array with new order
        this.todos = newOrder;
        this.saveTodos();
        this.renderTodos();
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        e.target.style.opacity = '';
        
        // Remove all drag-over classes
        document.querySelectorAll('.todo-item').forEach(item => {
            item.classList.remove('drag-over');
        });
        
        this.draggedElement = null;
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.todo-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Reminders Functionality
        setupReminders() {
        this.addReminderBtn.addEventListener('click', () => {
            this.showReminderInput();
        });
        
        this.saveReminderBtn.addEventListener('click', () => {
            this.saveReminder();
        });
        
        this.cancelReminderBtn.addEventListener('click', () => {
            this.hideReminderInput();
        });
        


        this.allDayToggle.addEventListener('change', () => {
            this.reminderTime.disabled = this.allDayToggle.checked;
            if (this.allDayToggle.checked) {
                this.reminderTime.value = '';
            }
        });

        this.reminderText.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.saveReminder();
            }
        });

        // Set default date to today
        this.setDefaultReminderDate();

        // Event delegation for edit and delete buttons
        this.remindersList.addEventListener('click', (e) => {
            const target = e.target;
            const reminderId = target.getAttribute('data-reminder-id');
            
            if (reminderId) {
                if (target.classList.contains('reminder-edit')) {
                    this.editReminder(parseInt(reminderId));
                } else if (target.classList.contains('reminder-delete')) {
                    this.deleteReminder(parseInt(reminderId));
                }
            }
        });
    }

    setDefaultReminderDate() {
        const today = new Date();
        const dateString = today.toISOString().split('T')[0];
        this.reminderDate.value = dateString;
    }

    showReminderInput() {
        this.reminderInputContainer.style.display = 'flex';
        this.reminderText.focus();
        if (!this.editingReminderId) {
            this.setDefaultReminderDate();
        }
        this.updateReminderFormUI();
    }

    hideReminderInput() {
        this.reminderInputContainer.style.display = 'none';
        this.reminderText.value = '';
        this.reminderTime.value = '';
        this.allDayToggle.checked = false;
        this.repeatOption.value = 'none';
        this.reminderTime.disabled = false;
        this.editingReminderId = null;
        this.updateReminderFormUI();
    }

    editReminder(id) {
        const reminder = this.reminders.find(r => r.id === id);
        if (!reminder) return;
        
        this.editingReminderId = id;
        this.reminderText.value = reminder.text;
        this.reminderDate.value = reminder.date;
        this.reminderTime.value = reminder.time || '';
        this.allDayToggle.checked = reminder.isAllDay;
        this.repeatOption.value = reminder.repeat || 'none';
        this.reminderTime.disabled = reminder.isAllDay;
        
        this.showReminderInput();
    }

    updateReminderFormUI() {
        const saveBtn = this.saveReminderBtn;
        const cancelBtn = this.cancelReminderBtn;
        
        if (this.editingReminderId) {
            saveBtn.textContent = 'Update';
            saveBtn.title = 'Update reminder';
        } else {
            saveBtn.textContent = 'Save';
            saveBtn.title = 'Save reminder';
        }
    }

    saveReminder() {
        const text = this.reminderText.value.trim();
        const date = this.reminderDate.value;
        const time = this.allDayToggle.checked ? null : this.reminderTime.value;
        const repeat = this.repeatOption.value;
        
        if (text && date) {
            if (this.editingReminderId) {
                // Update existing reminder
                const reminderIndex = this.reminders.findIndex(r => r.id === this.editingReminderId);
                if (reminderIndex !== -1) {
                    this.reminders[reminderIndex] = {
                        ...this.reminders[reminderIndex],
                        text: text,
                        date: date,
                        time: time,
                        isAllDay: this.allDayToggle.checked,
                        repeat: repeat,
                        updated: new Date().toISOString()
                    };
                }
            } else {
                // Add new reminder
                const reminder = {
                    id: Date.now(),
                    text: text,
                    date: date,
                    time: time,
                    isAllDay: this.allDayToggle.checked,
                    repeat: repeat,
                    created: new Date().toISOString()
                };
                
                this.reminders.push(reminder);
            }
            
            this.saveReminders();
            this.renderReminders();
            this.hideReminderInput();
        }
    }

    deleteReminder(id) {
        this.reminders = this.reminders.filter(reminder => reminder.id !== id);
        this.saveReminders();
        this.renderReminders();
    }

    generateRecurringReminders() {
        const today = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 3); // Generate 3 months ahead
        
        const recurringInstances = [];
        
        this.reminders.forEach(reminder => {
            if (reminder.repeat && reminder.repeat !== 'none') {
                const baseDate = new Date(reminder.date);
                let currentDate = new Date(baseDate);
                
                // Generate instances up to 3 months ahead
                while (currentDate <= endDate) {
                    const dateStr = currentDate.toISOString().split('T')[0];
                    
                    // Create instance for this occurrence
                    recurringInstances.push({
                        ...reminder,
                        date: dateStr,
                        isRecurring: true,
                        originalId: reminder.id,
                        instanceId: `${reminder.id}-${dateStr}`
                    });
                    
                    // Calculate next occurrence
                    switch (reminder.repeat) {
                        case 'daily':
                            currentDate.setDate(currentDate.getDate() + 1);
                            break;
                        case 'weekly':
                            currentDate.setDate(currentDate.getDate() + 7);
                            break;
                        case 'monthly':
                            currentDate.setMonth(currentDate.getMonth() + 1);
                            break;
                        case 'yearly':
                            currentDate.setFullYear(currentDate.getFullYear() + 1);
                            break;
                    }
                }
            }
        });
        
        return recurringInstances;
    }

    renderReminders() {
        // Clean up expired reminders first
        this.cleanupOldReminders();
        
        const now = new Date();
        // Format date in local timezone
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0];
        const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight
        
        // Get non-repeating reminders and recurring instances
        const nonRepeatingReminders = this.reminders.filter(r => !r.repeat || r.repeat === 'none');
        const recurringInstances = this.generateRecurringReminders();
        
        // Combine all reminders
        const allReminders = [...nonRepeatingReminders, ...recurringInstances];
        
        // Filter out historical reminders (past reminders)
        const currentReminders = allReminders.filter(reminder => {
            const reminderDate = reminder.date;
            
            // Future dates are always current
            if (reminderDate > today) return true;
            
            // Today's reminders
            if (reminderDate === today) {
                // All-day reminders stay visible all day
                if (reminder.isAllDay) return true;
                
                // Timed reminders stay visible if time hasn't passed (with 1 minute buffer)
                if (reminder.time) {
                    const [hours, minutes] = reminder.time.split(':').map(Number);
                    const reminderTime = hours * 60 + minutes;
                    // Give a 1-minute buffer to account for timing differences
                    return reminderTime > (currentTime - 1);
                }
                
                return true; // No time specified, keep visible
            }
            
            return false; // Past dates are historical
        });
        
        // Sort reminders by date and time
        const sortedReminders = currentReminders.sort((a, b) => {
            const dateA = new Date(a.date + (a.time ? `T${a.time}` : 'T00:00'));
            const dateB = new Date(b.date + (b.time ? `T${b.time}` : 'T00:00'));
            return dateA - dateB;
        });
        
        // Separate today's and upcoming reminders
        const todayReminders = sortedReminders.filter(reminder => reminder.date === today);
        const upcomingReminders = sortedReminders.filter(reminder => reminder.date > today);
        
        let html = '';
        
        // Show today's reminders first
        if (todayReminders.length > 0) {
            html += '<div class="reminders-section-title">Today</div>';
            todayReminders.forEach(reminder => {
                html += this.renderReminderItem(reminder, true, false);
            });
        }
        
        // Show upcoming reminders if no today's reminders or to fill space
        if (upcomingReminders.length > 0 && (todayReminders.length < 3 || todayReminders.length === 0)) {
            if (todayReminders.length > 0) {
                html += '<div class="reminders-section-title">Upcoming</div>';
            }
            const reminderesToShow = upcomingReminders.slice(0, Math.max(1, 5 - todayReminders.length));
            reminderesToShow.forEach(reminder => {
                html += this.renderReminderItem(reminder, false, false);
            });
        }
        
        if (html === '') {
            html = '<div class="no-reminders">No reminders scheduled</div>';
        }
        
        this.remindersList.innerHTML = html;
    }

    renderReminderItem(reminder, isToday) {
        const date = new Date(reminder.date);
        const dateStr = this.formatReminderDate(date, isToday);
        const timeStr = reminder.isAllDay ? 'All day' : this.formatTime(reminder.time);
        const repeatStr = this.formatRepeatText(reminder.repeat);
        
        // Use original ID for recurring reminders, regular ID for others
        const reminderId = reminder.isRecurring ? reminder.originalId : reminder.id;
        
        return `
            <div class="reminder-item ${isToday ? 'today' : ''} ${reminder.isRecurring ? 'recurring' : ''}" data-reminder-id="${reminderId}">
                <div class="reminder-actions-bar">
                    <button class="reminder-edit" data-reminder-id="${reminderId}" title="Edit reminder">✏️</button>
                    <button class="reminder-delete" data-reminder-id="${reminderId}" title="Delete reminder">×</button>
                </div>
                <div class="reminder-text">${this.escapeHtml(reminder.text)}</div>
                <div class="reminder-datetime-display">
                    <span class="reminder-date-badge">${dateStr}</span>
                    ${!reminder.isAllDay ? `<span class="reminder-time-badge">${timeStr}</span>` : '<span class="reminder-time-badge">All day</span>'}
                    ${repeatStr ? `<span class="reminder-repeat-badge">${repeatStr}</span>` : ''}
                </div>
            </div>
        `;
    }

    formatReminderDate(date, isToday) {
        if (isToday) {
            return 'Today';
        }
        
        // Get today's date in YYYY-MM-DD format
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0];
        
        // Get reminder date in YYYY-MM-DD format
        const reminderDateStr = new Date(date).toISOString().split('T')[0];
        
        // Calculate the difference in days using the date strings
        const todayParts = today.split('-').map(Number);
        const reminderParts = reminderDateStr.split('-').map(Number);
        
        const todayDate = new Date(todayParts[0], todayParts[1] - 1, todayParts[2]);
        const reminderDate = new Date(reminderParts[0], reminderParts[1] - 1, reminderParts[2]);
        
        const diffTime = reminderDate.getTime() - todayDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return 'Tomorrow';
        }
        
        if (diffDays <= 7) {
            return reminderDate.toLocaleDateString('en-US', { weekday: 'long' });
        }
        
        return reminderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    formatTime(timeString) {
        if (!timeString) return '';
        
        const [hours, minutes] = timeString.split(':');
        const hour12 = parseInt(hours) % 12 || 12;
        const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
        return `${hour12}:${minutes} ${ampm}`;
    }

    formatRepeatText(repeat) {
        if (!repeat || repeat === 'none') return '';
        
        switch (repeat) {
            case 'daily': return '🔄';
            case 'weekly': return '📅';
            case 'monthly': return '🗓️';
            case 'yearly': return '📆';
            default: return '';
        }
    }

    saveReminders() {
        localStorage.setItem('tabNowReminders', JSON.stringify(this.reminders));
        this.saveDataImmediately();
    }



    cleanupOldReminders() {
        const now = new Date();
        // Format date in local timezone
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0];
        const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight
        
        const originalCount = this.reminders.length;
        
        this.reminders = this.reminders.filter(reminder => {
            // Keep recurring reminders - they regenerate automatically
            if (reminder.repeat && reminder.repeat !== 'none') return true;
            
            const reminderDate = reminder.date;
            
            // Remove past dates
            if (reminderDate < today) return false;
            
            // For today, check if time has passed
            if (reminderDate === today && !reminder.isAllDay && reminder.time) {
                const [hours, minutes] = reminder.time.split(':').map(Number);
                const reminderTime = hours * 60 + minutes;
                // Remove if the reminder time has passed
                return reminderTime > currentTime;
            }
            
            // For today's all-day reminders or future reminders, keep them
            return reminderDate >= today;
        });
        
        // Save if we removed any reminders
        if (this.reminders.length < originalCount) {
            this.saveReminders();
            console.log(`Cleaned up ${originalCount - this.reminders.length} expired reminders`);
        }
    }

    // Weather cache management
    saveWeatherCache() {
        const cacheData = {
            weatherData: this.weatherData,
            cacheTime: this.weatherCacheTime,
            location: this.currentLocation
        };
        localStorage.setItem('tabNowWeatherCache', JSON.stringify(cacheData));
    }

    loadWeatherCache() {
        try {
            const cachedData = localStorage.getItem('tabNowWeatherCache');
            if (cachedData) {
                const cache = JSON.parse(cachedData);
                
                // Check if cache is still valid (10 minutes for real data, 30 minutes for fallback)
                const now = new Date().getTime();
                const cacheAge = now - cache.cacheTime;
                const maxAge = cache.weatherData?.isRealData ? this.weatherCacheDuration : (30 * 60 * 1000);
                
                if (cacheAge < maxAge) {
                    this.weatherData = cache.weatherData;
                    this.weatherCacheTime = cache.cacheTime;
                }
            }
        } catch (error) {
            // Failed to load weather cache
        }
    }
    
    // Weather Functionality
    setupWeather() {
        this.refreshWeatherBtn.addEventListener('click', () => {
            this.loadWeather(true); // Force refresh when button is clicked
        });
        
        this.locationBtn.addEventListener('click', () => {
            this.changeLocation();
        });
        
        // Load saved preferences
        try {
            const savedUnit = localStorage.getItem('tabNowTempUnit');
            if (savedUnit) {
                this.temperatureUnit = savedUnit;
            }
            
            const savedLocation = localStorage.getItem('tabNowLocation');
            if (savedLocation) {
                this.currentLocation = JSON.parse(savedLocation);
            }
        } catch (error) {
            // Error loading weather preferences
        }
        
        // Load cached weather data
        this.loadWeatherCache();
        
        // Load weather with a short delay to ensure DOM is ready
        setTimeout(() => {
            this.loadWeather();
        }, 100);
    }
    
    async loadWeather(forceRefresh = false) {
        try {
            // Check if we have valid cached weather data
            if (!forceRefresh && this.weatherData && this.weatherCacheTime) {
                const now = new Date().getTime();
                const cacheAge = now - this.weatherCacheTime;
                
                if (cacheAge < this.weatherCacheDuration) {
                    // Use cached data
                    this.renderWeather(this.weatherData);
                    return;
                }
            }
            
            this.weatherContent.innerHTML = '<div class="weather-loading">Loading...</div>';
            
            let latitude, longitude, locationName;
            
            if (this.currentLocation) {
                // Use saved location
                latitude = this.currentLocation.lat;
                longitude = this.currentLocation.lon;
                locationName = this.currentLocation.name;
            } else {
                // Try to get user's current location, fallback to default if it fails
                try {
                    const position = await this.getCurrentPosition();
                    latitude = position.coords.latitude;
                    longitude = position.coords.longitude;
                    
                    try {
                        const actualLocation = await this.reverseGeocode(latitude, longitude);
                        locationName = `Current Location (${actualLocation})`;
                    } catch (geoError) {
                        locationName = 'Current Location';
                    }
                } catch (locationError) {
                    latitude = 40.7128;
                    longitude = -74.0060;
                    locationName = 'Default Location';
                }
            }
            
            // Generate mock weather data (this should always work)
            const weatherData = await this.fetchWeatherData(latitude, longitude, locationName);
            
            // Cache the weather data
            this.weatherData = weatherData;
            this.weatherCacheTime = new Date().getTime();
            
            // Save cache to localStorage
            this.saveWeatherCache();
            
            this.renderWeather(weatherData);
            
        } catch (error) {
            this.renderFallbackWeather();
        }
    }
    
    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                resolve, 
                reject, 
                {
                    timeout: 5000, // Reduced timeout for faster fallback
                    enableHighAccuracy: false,
                    maximumAge: 300000 // 5 minutes cache
                }
            );
        });
    }
    
    async fetchWeatherData(lat, lon, locationName) {
        try {
            const realWeatherData = await this.fetchRealWeatherData(lat, lon);
            if (realWeatherData) {
                return {
                    ...realWeatherData,
                    location: locationName || realWeatherData.location
                };
            }
        } catch (error) {
            // API failed, using fallback
        }
        
        return this.generateLocationBasedWeather(lat, lon, locationName);
    }

    async fetchRealWeatherData(lat, lon) {
        try {
            // Using wttr.in API - a free weather API that doesn't require API key
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased to 10 seconds
            
            const response = await fetch(`https://wttr.in/${lat},${lon}?format=j1`, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`Weather API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data && data.current_condition && data.current_condition[0] && data.weather && data.weather[0]) {
                const current = data.current_condition[0];
                const today = data.weather[0];
                
                return {
                    currentTempF: parseInt(current.temp_F),
                    currentTempC: parseInt(current.temp_C),
                    highTempF: parseInt(today.maxtempF),
                    highTempC: parseInt(today.maxtempC),
                    lowTempF: parseInt(today.mintempF),
                    lowTempC: parseInt(today.mintempC),
                    temperatureF: parseInt(current.temp_F),
                    temperatureC: parseInt(current.temp_C),
                    description: current.weatherDesc?.[0]?.value || 'Clear',
                    humidity: parseInt(current.humidity) || 50,
                    windSpeedMph: parseInt(current.windspeedMiles) || 0,
                    windSpeedKmh: parseInt(current.windspeedKmph) || 0,
                    location: data.nearest_area?.[0]?.areaName?.[0]?.value || 'Your Location',
                    isRealData: true
                };
            }
        } catch (error) {
            return null;
        }
        
        return null;
    }

    generateLocationBasedWeather(lat, lon, locationName) {
        // Generate more realistic weather based on location and season
        const now = new Date();
        const month = now.getMonth(); // 0-11
        const isWinter = month === 11 || month === 0 || month === 1;
        const isSummer = month >= 5 && month <= 7;
        const hour = now.getHours();
        
        // Base temperature on latitude (rough approximation)
        let baseTempF;
        if (Math.abs(lat) > 60) { // Far north/south
            baseTempF = isWinter ? 20 : (isSummer ? 65 : 45);
        } else if (Math.abs(lat) > 40) { // Temperate zones
            baseTempF = isWinter ? 35 : (isSummer ? 75 : 60);
        } else if (Math.abs(lat) > 23) { // Subtropical
            baseTempF = isWinter ? 55 : (isSummer ? 85 : 70);
        } else { // Tropical
            baseTempF = isWinter ? 75 : (isSummer ? 88 : 82);
        }
        
        // Add some daily variation (±5°F from base)
        const locationSeed = Math.abs(lat * 1000 + lon * 1000) % 10; // Consistent seed based on location
        const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
        const dailyVariation = Math.sin((dayOfYear + locationSeed) / 365 * 2 * Math.PI) * 5;
        
        const currentTempF = Math.round(baseTempF + dailyVariation);
        
        // Make high/low temperatures deterministic too (no more Math.random())
        const tempRangeSeed = (locationSeed + dayOfYear) % 8; // Consistent daily temperature range
        const highTempF = currentTempF + Math.round(3 + tempRangeSeed);
        const lowTempF = currentTempF - Math.round(3 + (tempRangeSeed / 2));
        
        // Determine weather conditions based on location and season
        const conditions = ['Clear', 'Partly cloudy', 'Cloudy', 'Overcast'];
        if (Math.abs(lat) > 50 || isWinter) {
            conditions.push('Light snow', 'Snow');
        }
        if (!isWinter && Math.abs(lat) < 50) {
            conditions.push('Light rain', 'Scattered showers');
        }
        
        return {
            currentTempF: currentTempF,
            currentTempC: Math.round((currentTempF - 32) * 5/9),
            highTempF: highTempF,
            highTempC: Math.round((highTempF - 32) * 5/9),
            lowTempF: lowTempF,
            lowTempC: Math.round((lowTempF - 32) * 5/9),
            temperatureF: currentTempF,
            temperatureC: Math.round((currentTempF - 32) * 5/9),
            description: conditions[Math.floor((locationSeed + dayOfYear) % conditions.length)],
            humidity: Math.round(40 + (locationSeed * 4) % 40),
            windSpeedMph: Math.round(2 + (locationSeed * 2) % 10),
            windSpeedKmh: Math.round((2 + (locationSeed * 2) % 10) * 1.609),
            location: locationName || 'Your Location',
            isRealData: false
        };
    }

    async reverseGeocode(lat, lon) {
        try {
            // Use Nominatim (OpenStreetMap) free reverse geocoding API with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
            
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`, {
                headers: {
                    'User-Agent': 'TabNow-Extension/1.0'
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data && data.address) {
                const address = data.address;
                let locationName = '';
                
                // Build location name from available address components
                if (address.city) {
                    locationName = address.city;
                } else if (address.town) {
                    locationName = address.town;
                } else if (address.village) {
                    locationName = address.village;
                } else if (address.county) {
                    locationName = address.county;
                }
                
                // Add state/province if available
                if (address.state && locationName) {
                    locationName += `, ${address.state}`;
                } else if (address.province && locationName) {
                    locationName += `, ${address.province}`;
                }
                
                // Add country code for non-US locations
                if (address.country_code && address.country_code.toLowerCase() !== 'us' && locationName) {
                    locationName += `, ${address.country_code.toUpperCase()}`;
                }
                
                return locationName || 'Unknown Location';
            } else {
                throw new Error('No address data found');
            }
        } catch (error) {
            throw error;
        }
    }

    
    renderWeather(data) {
        this.weatherData = data; // Store for unit conversion
        
        const currentTemp = this.temperatureUnit === 'F' ? data.currentTempF : data.currentTempC;
        const highTemp = this.temperatureUnit === 'F' ? data.highTempF : data.highTempC;
        const lowTemp = this.temperatureUnit === 'F' ? data.lowTempF : data.lowTempC;
        const windSpeed = this.temperatureUnit === 'F' ? data.windSpeedMph : data.windSpeedKmh;
        const windUnit = this.temperatureUnit === 'F' ? 'mph' : 'km/h';
        
        this.weatherContent.innerHTML = `
            <div class="weather-info">
                <div class="weather-main-content">
                    <div class="weather-icon">${this.getWeatherIcon(data.description)}</div>
                    <div class="weather-temp-section">
                        <div class="weather-temp-current">${currentTemp}°${this.temperatureUnit}</div>
                        <div class="weather-temp-range">H: ${highTemp}° L: ${lowTemp}°</div>
                    </div>
                    <div class="weather-description">${data.description}</div>
                    <div class="weather-location" title="Click to change location">${data.location}</div>
                    <div class="weather-details">
                        <div class="weather-detail">
                            <span>💧</span>
                            <span>${data.humidity}%</span>
                        </div>
                        <div class="weather-detail">
                            <span>💨</span>
                            <span>${windSpeed}${windUnit}</span>
                        </div>
                        <div class="weather-detail">
                            <button class="temp-toggle-btn ${this.temperatureUnit === 'F' ? 'active' : ''}" title="Toggle °F/°C">°${this.temperatureUnit}</button>
                        </div>
                    </div>
                </div>
                ${this.getWeatherStatusInfo()}
            </div>
        `;
        
        // Add event listeners after HTML is rendered
        const weatherLocation = this.weatherContent.querySelector('.weather-location');
        const tempToggleBtn = this.weatherContent.querySelector('.temp-toggle-btn');
        
        if (weatherLocation) {
            weatherLocation.addEventListener('click', () => {
                this.changeLocation();
            });
        }
        
        if (tempToggleBtn) {
            tempToggleBtn.addEventListener('click', () => {
                this.toggleTemperatureUnit();
            });
        }
    }

    getCacheAge() {
        if (!this.weatherCacheTime) return '';
        
        const now = new Date().getTime();
        const ageMs = now - this.weatherCacheTime;
        const ageMinutes = Math.floor(ageMs / (1000 * 60));
        
        if (ageMinutes < 1) {
            return 'just now';
        } else if (ageMinutes === 1) {
            return '1 min ago';
        } else if (ageMinutes < 10) {
            return `${ageMinutes} mins ago`;
        } else {
            return 'over 10 mins ago';
        }
    }

    getWeatherIcon(description) {
        const desc = description.toLowerCase();
        
        if (desc.includes('clear') || desc.includes('sunny')) {
            return '☀️';
        } else if (desc.includes('partly') || desc.includes('partial')) {
            return '⛅';
        } else if (desc.includes('cloudy') || desc.includes('overcast')) {
            return '☁️';
        } else if (desc.includes('rain') || desc.includes('drizzle')) {
            return '🌧️';
        } else if (desc.includes('storm') || desc.includes('thunder')) {
            return '⛈️';
        } else if (desc.includes('snow') || desc.includes('blizzard')) {
            return '❄️';
        } else if (desc.includes('fog') || desc.includes('mist')) {
            return '🌫️';
        } else if (desc.includes('wind')) {
            return '💨';
        } else {
            return '🌤️'; // Default pleasant weather
        }
    }

    getWeatherStatusInfo() {
        if (!this.weatherData) return '';
        
        let statusText = '';
        
        if (this.weatherData.isRealData) {
            statusText = `<div class="weather-status-info">Live weather • Updated ${this.getCacheAge()}</div>`;
        } else {
            statusText = `<div class="weather-status-info">Estimated weather • Updated ${this.getCacheAge()}</div>`;
        }
        
        return statusText;
    }

    renderFallbackWeather() {
        // Provide a basic weather display when all APIs fail
        const fallbackData = {
            currentTempF: 72,
            currentTempC: 22,
            highTempF: 78,
            highTempC: 26,
            lowTempF: 65,
            lowTempC: 18,
            description: 'Pleasant',
            humidity: 55,
            windSpeedMph: 5,
            windSpeedKmh: 8,
            location: 'Your Location'
        };

        this.weatherData = fallbackData;
        this.weatherCacheTime = new Date().getTime();
        this.saveWeatherCache();

        const currentTemp = this.temperatureUnit === 'F' ? fallbackData.currentTempF : fallbackData.currentTempC;
        const highTemp = this.temperatureUnit === 'F' ? fallbackData.highTempF : fallbackData.highTempC;
        const lowTemp = this.temperatureUnit === 'F' ? fallbackData.lowTempF : fallbackData.lowTempC;
        const windSpeed = this.temperatureUnit === 'F' ? fallbackData.windSpeedMph : fallbackData.windSpeedKmh;
        const windUnit = this.temperatureUnit === 'F' ? 'mph' : 'km/h';

        this.weatherContent.innerHTML = `
            <div class="weather-info">
                <div class="weather-main-content">
                    <div class="weather-icon">${this.getWeatherIcon(fallbackData.description)}</div>
                    <div class="weather-temp-section">
                        <div class="weather-temp-current">${currentTemp}°${this.temperatureUnit}</div>
                        <div class="weather-temp-range">H: ${highTemp}° L: ${lowTemp}°</div>
                    </div>
                    <div class="weather-description">${fallbackData.description}</div>
                    <div class="weather-location" title="Click to change location">${fallbackData.location}</div>
                    <div class="weather-details">
                        <div class="weather-detail">
                            <span>💧</span>
                            <span>${fallbackData.humidity}%</span>
                        </div>
                        <div class="weather-detail">
                            <span>💨</span>
                            <span>${windSpeed}${windUnit}</span>
                        </div>
                        <div class="weather-detail">
                            <button class="temp-toggle-btn ${this.temperatureUnit === 'F' ? 'active' : ''}" title="Toggle °F/°C">°${this.temperatureUnit}</button>
                        </div>
                    </div>
                </div>
                <div class="weather-status-info">Default weather data</div>
            </div>
        `;
        
        // Add event listeners after HTML is rendered
        const weatherLocation = this.weatherContent.querySelector('.weather-location');
        const tempToggleBtn = this.weatherContent.querySelector('.temp-toggle-btn');
        
        if (weatherLocation) {
            weatherLocation.addEventListener('click', () => {
                this.changeLocation();
            });
        }
        
        if (tempToggleBtn) {
            tempToggleBtn.addEventListener('click', () => {
                this.toggleTemperatureUnit();
            });
        }
    }
    
    changeLocation() {
        const newLocation = prompt('Enter a location (e.g., "New York, NY" or "London, UK"):');
        
        if (newLocation && newLocation.trim()) {
            // In a real implementation, you'd geocode this location
            // For demo, we'll create a mock location object
            this.currentLocation = {
                name: newLocation.trim(),
                lat: Math.random() * 180 - 90, // Random lat for demo
                lon: Math.random() * 360 - 180 // Random lon for demo
            };
            
            // Clear weather cache since location changed
            this.weatherData = null;
            this.weatherCacheTime = null;
            localStorage.removeItem('tabNowWeatherCache');
            
            // Save location preference
            localStorage.setItem('tabNowLocation', JSON.stringify(this.currentLocation));
            this.saveDataImmediately();
            
            // Reload weather for new location
            this.loadWeather(true);
        }
    }
    
    toggleTemperatureUnit() {
        this.temperatureUnit = this.temperatureUnit === 'F' ? 'C' : 'F';
        
        // Save preference
        localStorage.setItem('tabNowTempUnit', this.temperatureUnit);
        this.saveDataImmediately();
        
        // Re-render with new unit if we have weather data
        if (this.weatherData) {
            this.renderWeather(this.weatherData);
        }
    }
    
    // Clock Functionality
    setupClock() {
        this.clockSettingsBtn.addEventListener('click', () => {
            this.openClockSettings();
        });
        
        // Add location button
        this.addLocationBtn.addEventListener('click', () => {
            this.addNewTimeZone();
        });
        
        // Load saved additional locations
        this.loadAdditionalLocations();
        
        // Render additional locations
        this.renderAdditionalLocations();
        
        // Start clock updates
        this.updateClocks();
        this.clockInterval = setInterval(() => {
            this.updateClocks();
        }, 1000);
    }
    
    updateClocks() {
        const now = new Date();
        
        // Local time (current location)
        const localTime = now.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        this.localTime.textContent = localTime;
        
        // Update additional locations
        this.additionalClockLocations.forEach((location, index) => {
            const timeElement = document.getElementById(`additionalTime_${index}`);
            if (timeElement && location.timezone) {
                try {
                    const time = now.toLocaleTimeString('en-US', { 
                        timeZone: location.timezone,
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                    });
                    timeElement.textContent = time;
                } catch (error) {
                    timeElement.textContent = '--:--';
                }
            }
        });
    }

    loadAdditionalLocations() {
        const saved = localStorage.getItem('tabNowAdditionalClockLocations');
        if (saved) {
            try {
                this.additionalClockLocations = JSON.parse(saved);
                // Ensure max 2 additional locations
                if (this.additionalClockLocations.length > 2) {
                    this.additionalClockLocations = this.additionalClockLocations.slice(0, 2);
                }
            } catch (e) {
                this.additionalClockLocations = [];
            }
        } else {
            // Default additional locations
            this.additionalClockLocations = [
                { name: 'New York', timezone: 'America/New_York' },
                { name: 'Tokyo', timezone: 'Asia/Tokyo' }
            ];
        }
    }

    renderAdditionalLocations() {
        this.additionalLocations.innerHTML = '';
        
        this.additionalClockLocations.forEach((location, index) => {
            const clockItem = document.createElement('div');
            clockItem.className = 'clock-item additional-location swipeable';
            clockItem.innerHTML = `
                <div class="clock-item-content" data-index="${index}">
                    <div class="clock-location clickable" data-index="${index}" title="Click to edit location">
                        ${this.escapeHtml(location.name)}
                        <span class="edit-indicator">📝</span>
                    </div>
                    <div class="clock-time" id="additionalTime_${index}">--:--</div>
                </div>
                <div class="delete-action">
                    <button class="remove-location-btn" data-index="${index}" title="Remove this time zone">Delete</button>
                </div>
            `;
            this.additionalLocations.appendChild(clockItem);
        });

        // Add event listeners for the newly created elements
        this.setupAdditionalLocationListeners();
        
        // Update add button visibility
        this.updateAddButtonVisibility();
    }

    setupAdditionalLocationListeners() {
        // Location name click handlers
        this.additionalLocations.querySelectorAll('.clock-location.clickable').forEach(location => {
            location.addEventListener('click', () => {
                this.editLocationName(parseInt(location.dataset.index));
            });
        });

        // Remove button handlers
        this.additionalLocations.querySelectorAll('.remove-location-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.removeTimeZone(parseInt(btn.dataset.index));
            });
        });

        // Setup swipe-to-delete for each clock item
        this.additionalLocations.querySelectorAll('.swipeable').forEach(item => {
            this.setupSwipeToDelete(item);
        });
    }

    setupSwipeToDelete(element) {
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let isDragging = false;
        let threshold = 50; // Minimum swipe distance to trigger delete reveal
        let maxSwipe = 100; // Maximum swipe distance

        const content = element.querySelector('.clock-item-content');
        const deleteAction = element.querySelector('.delete-action');

        // Mouse events
        element.addEventListener('mousedown', handleStart);
        element.addEventListener('mousemove', handleMove);
        element.addEventListener('mouseup', handleEnd);
        element.addEventListener('mouseleave', handleEnd);

        // Touch events
        element.addEventListener('touchstart', handleStart, { passive: false });
        element.addEventListener('touchmove', handleMove, { passive: false });
        element.addEventListener('touchend', handleEnd);

        function handleStart(e) {
            // Don't start swipe if clicking on interactive elements
            if (e.target.closest('.clock-location.clickable') || e.target.closest('.remove-location-btn')) {
                return;
            }

            isDragging = true;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            startX = clientX;
            startY = clientY;
            currentX = 0;

            element.style.transition = 'none';
            content.style.transition = 'none';
        }

        function handleMove(e) {
            if (!isDragging) return;

            e.preventDefault();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            
            const deltaX = clientX - startX;
            const deltaY = clientY - startY;

            // Only allow horizontal swipe if it's more horizontal than vertical
            if (Math.abs(deltaY) > Math.abs(deltaX)) {
                return;
            }

            // Only allow left swipe (negative deltaX)
            if (deltaX > 0) {
                currentX = 0;
            } else {
                currentX = Math.max(deltaX, -maxSwipe);
            }

            content.style.transform = `translateX(${currentX}px)`;
            
            // Show delete button when swiped enough
            if (Math.abs(currentX) >= threshold) {
                deleteAction.style.opacity = '1';
                deleteAction.style.visibility = 'visible';
            } else {
                deleteAction.style.opacity = '0';
                deleteAction.style.visibility = 'hidden';
            }
        }

        function handleEnd(e) {
            if (!isDragging) return;
            isDragging = false;

            element.style.transition = 'all 0.3s ease';
            content.style.transition = 'transform 0.3s ease';

            // If swiped enough, keep delete button visible
            if (Math.abs(currentX) >= threshold) {
                content.style.transform = `translateX(-${maxSwipe}px)`;
                deleteAction.style.opacity = '1';
                deleteAction.style.visibility = 'visible';
                element.classList.add('delete-revealed');
            } else {
                // Snap back to original position
                content.style.transform = 'translateX(0)';
                deleteAction.style.opacity = '0';
                deleteAction.style.visibility = 'hidden';
                element.classList.remove('delete-revealed');
            }
        }

        // Click outside to close delete reveal
        document.addEventListener('click', (e) => {
            if (!element.contains(e.target) && element.classList.contains('delete-revealed')) {
                content.style.transform = 'translateX(0)';
                deleteAction.style.opacity = '0';
                deleteAction.style.visibility = 'hidden';
                element.classList.remove('delete-revealed');
            }
        });
    }

    updateAddButtonVisibility() {
        if (this.additionalClockLocations.length >= 3) {
            this.addLocationBtn.style.display = 'none';
        } else {
            this.addLocationBtn.style.display = 'block';
        }
    }

    addNewTimeZone() {
        if (this.additionalClockLocations.length >= 3) {
            alert('Maximum of 4 time zones allowed (including current location)');
            return;
        }

        const locationName = prompt('Enter location name (e.g., "London", "Paris"):');
        if (!locationName || !locationName.trim()) return;

        const timezone = prompt('Enter timezone (e.g., "Europe/London", "Europe/Paris"):\n\nCommon timezones:\n• Europe/London\n• Europe/Paris\n• America/Los_Angeles\n• America/Chicago\n• Asia/Shanghai\n• Australia/Sydney');
        if (!timezone || !timezone.trim()) return;

        // Test if timezone is valid
        try {
            new Date().toLocaleTimeString('en-US', { timeZone: timezone.trim() });
        } catch (error) {
            alert('Invalid timezone. Please use a valid timezone like "Europe/London" or "America/New_York"');
            return;
        }

        this.additionalClockLocations.push({
            name: locationName.trim(),
            timezone: timezone.trim()
        });

        this.saveAdditionalLocations();
        this.renderAdditionalLocations();
    }

    editLocationName(index) {
        const location = this.additionalClockLocations[index];
        if (!location) return;

        const newName = prompt(`Edit location name:`, location.name);
        if (newName && newName.trim() && newName.trim() !== location.name) {
            this.additionalClockLocations[index].name = newName.trim();
            this.saveAdditionalLocations();
            this.renderAdditionalLocations();
        }
    }

    removeTimeZone(index) {
        if (confirm('Remove this time zone?')) {
            this.additionalClockLocations.splice(index, 1);
            this.saveAdditionalLocations();
            this.renderAdditionalLocations();
        }
    }

    saveAdditionalLocations() {
        localStorage.setItem('tabNowAdditionalClockLocations', JSON.stringify(this.additionalClockLocations));
        this.saveDataImmediately();
    }
    
    openClockSettings() {
        alert('Click the location names to edit them, or use the + button to add more time zones (max 3 total).');
    }

    // Data Persistence
    loadSavedData() {
        // Load notepad content
        const savedNotes = localStorage.getItem('tabNowNotes');
        if (savedNotes) {
            this.notepadEditor.innerHTML = savedNotes;
        }
        
        // Load saved tag color preference
        const savedTagColor = localStorage.getItem('tabNowSelectedTagColor');
        if (savedTagColor && this.tagColorOptions) {
            this.selectedTagColor = savedTagColor;
            this.tagColorOptions.forEach(opt => opt.classList.remove('selected'));
            const selectedOption = document.querySelector(`[data-color="${savedTagColor}"]`);
            if (selectedOption) {
                selectedOption.classList.add('selected');
            }
        }
        
        // Load weather preferences
        const savedTempUnit = localStorage.getItem('tabNowTempUnit');
        if (savedTempUnit) {
            this.temperatureUnit = savedTempUnit;
        }
        
        const savedLocation = localStorage.getItem('tabNowLocation');
        if (savedLocation) {
            try {
                this.currentLocation = JSON.parse(savedLocation);
            } catch (e) {
                // Failed to parse saved location
            }
        }
        
        // Load saved clock location names
        // Load saved current location name
        const savedLocalName = localStorage.getItem('tabNowLocalLocationName');
        if (savedLocalName) {
            const localElement = document.querySelector('[data-timezone="local"]');
            if (localElement) localElement.textContent = savedLocalName;
        }
        
        // Load todos
        const savedTodos = localStorage.getItem('tabNowTodos');
        if (savedTodos) {
            try {
                this.todos = JSON.parse(savedTodos);
            } catch (e) {
                // Failed to parse saved todos
                this.todos = [];
            }
        }
        this.renderTodos(); // Always render todos (shows empty state hint when no todos)
        
        // Load reminders
        const savedReminders = localStorage.getItem('tabNowReminders');
        if (savedReminders) {
            try {
                this.reminders = JSON.parse(savedReminders);
            } catch (e) {
                // Failed to parse saved reminders
                this.reminders = [];
            }
        }
        this.renderReminders(); // Always render reminders (shows "no reminders" message when empty)
        
        // Load additional clock locations
        const savedClockLocations = localStorage.getItem('tabNowAdditionalClockLocations');
        if (savedClockLocations) {
            try {
                this.additionalClockLocations = JSON.parse(savedClockLocations);
                this.renderAdditionalLocations();
            } catch (e) {
                // Failed to parse
            }
        }
        
        console.log('Data loaded:', {
            notesLength: savedNotes?.length || 0,
            todosCount: this.todos.length,
            remindersCount: this.reminders.length
        });
    }
    
    // Data Menu Setup
    setupDataMenu() {
        // Toggle dropdown
        if (this.dataMenuBtn) {
            this.dataMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.dataDropdown.classList.toggle('show');
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (this.dataDropdown && !this.dataMenuBtn?.contains(e.target)) {
                this.dataDropdown.classList.remove('show');
            }
        });
        
        // Export data
        if (this.exportDataBtn) {
            this.exportDataBtn.addEventListener('click', () => {
                this.exportData();
                this.dataDropdown.classList.remove('show');
            });
        }
        
        // Import data
        if (this.importDataBtn) {
            this.importDataBtn.addEventListener('click', () => {
                this.importFileInput.click();
                this.dataDropdown.classList.remove('show');
            });
        }
        
        if (this.importFileInput) {
            this.importFileInput.addEventListener('change', (e) => {
                this.importData(e.target.files[0]);
                e.target.value = ''; // Reset for future imports
            });
        }
        
        // Force sync (push)
        if (this.forceSyncBtn) {
            this.forceSyncBtn.addEventListener('click', () => {
                this.forceSync();
                this.dataDropdown.classList.remove('show');
            });
        }
        
        // Pull from cloud
        if (this.pullFromCloudBtn) {
            this.pullFromCloudBtn.addEventListener('click', () => {
                this.pullFromCloud();
                this.dataDropdown.classList.remove('show');
            });
        }
    }
    
    // Export all data as JSON file
    exportData() {
        const data = {
            version: '0.3.0',
            exportDate: new Date().toISOString(),
            notes: localStorage.getItem('tabNowNotes') || '',
            todos: JSON.parse(localStorage.getItem('tabNowTodos') || '[]'),
            reminders: JSON.parse(localStorage.getItem('tabNowReminders') || '[]'),
            preferences: {
                theme: localStorage.getItem('tabNowTheme'),
                selectedTagColor: localStorage.getItem('tabNowSelectedTagColor'),
                tempUnit: localStorage.getItem('tabNowTempUnit'),
                location: localStorage.getItem('tabNowLocation'),
                localLocationName: localStorage.getItem('tabNowLocalLocationName'),
                additionalClockLocations: localStorage.getItem('tabNowAdditionalClockLocations')
            }
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `my-starboard-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Data exported successfully!');
    }
    
    // Import data from JSON file
    importData(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Validate it's a valid backup
                if (!data.version || !data.exportDate) {
                    throw new Error('Invalid backup file format');
                }
                
                // Confirm with user
                if (!confirm(`Import backup from ${new Date(data.exportDate).toLocaleDateString()}?\n\nThis will replace all your current data.`)) {
                    return;
                }
                
                // Restore data
                if (data.notes !== undefined) {
                    localStorage.setItem('tabNowNotes', data.notes);
                    this.notepadEditor.innerHTML = data.notes;
                }
                
                if (data.todos) {
                    localStorage.setItem('tabNowTodos', JSON.stringify(data.todos));
                    this.todos = data.todos;
                    this.renderTodos();
                }
                
                if (data.reminders) {
                    localStorage.setItem('tabNowReminders', JSON.stringify(data.reminders));
                    this.reminders = data.reminders;
                    this.renderReminders();
                }
                
                if (data.preferences) {
                    if (data.preferences.theme) {
                        localStorage.setItem('tabNowTheme', data.preferences.theme);
                        this.setTheme(data.preferences.theme);
                    }
                    if (data.preferences.selectedTagColor) {
                        localStorage.setItem('tabNowSelectedTagColor', data.preferences.selectedTagColor);
                        this.selectedTagColor = data.preferences.selectedTagColor;
                    }
                    if (data.preferences.tempUnit) {
                        localStorage.setItem('tabNowTempUnit', data.preferences.tempUnit);
                        this.temperatureUnit = data.preferences.tempUnit;
                    }
                    if (data.preferences.location) {
                        localStorage.setItem('tabNowLocation', data.preferences.location);
                    }
                    if (data.preferences.localLocationName) {
                        localStorage.setItem('tabNowLocalLocationName', data.preferences.localLocationName);
                    }
                    if (data.preferences.additionalClockLocations) {
                        localStorage.setItem('tabNowAdditionalClockLocations', data.preferences.additionalClockLocations);
                        try {
                            this.additionalClockLocations = JSON.parse(data.preferences.additionalClockLocations);
                            this.renderAdditionalLocations();
                        } catch (e) {}
                    }
                }
                
                // Sync to Chrome storage
                this.saveDataImmediately();
                
                this.showNotification('Data imported successfully!');
            } catch (error) {
                console.error('Import error:', error);
                alert('Failed to import data. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }
    
    // Force sync to Chrome storage (Push)
    forceSync() {
        this.updateSyncStatus('syncing');

        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            const keysToSync = [
                'tabNowNotes', 'tabNowTodos', 'tabNowReminders', 'tabNowTheme',
                'tabNowSelectedTagColor', 'tabNowTempUnit', 'tabNowLocation',
                'tabNowWeatherCache', 'tabNowLocalLocationName', 'tabNowAdditionalClockLocations'
            ];

            const tabNowData = {};
            keysToSync.forEach(key => {
                const value = localStorage.getItem(key);
                if (value) tabNowData[key] = value;
            });
            
            console.log('Pushing to cloud:', Object.keys(tabNowData), tabNowData);

            chrome.storage.sync.set({ tabNowData }, () => {
                if (chrome.runtime.lastError) {
                    console.error('Sync error:', chrome.runtime.lastError);
                    this.updateSyncStatus('error');
                    this.showNotification('Sync failed: ' + chrome.runtime.lastError.message);
                } else {
                    this.updateSyncStatus('synced');
                    this.updateSyncInfo('Sync: Connected ✓');
                    this.showNotification('✅ Data pushed to Chrome cloud!');
                }
            });
        } else {
            this.updateSyncStatus('error');
            this.showNotification('Chrome sync not available');
        }
    }
    
    // Pull data from Chrome cloud storage
    pullFromCloud() {
        if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.sync) {
            this.showNotification('Chrome sync not available');
            return;
        }
        
        this.updateSyncStatus('syncing');
        
        chrome.storage.sync.get(['tabNowData'], (result) => {
            if (chrome.runtime.lastError) {
                console.error('Pull error:', chrome.runtime.lastError);
                this.updateSyncStatus('error');
                this.updateSyncInfo('Sync: Pull failed');
                this.showNotification('Pull failed: ' + chrome.runtime.lastError.message);
                return;
            }
            
            console.log('Cloud data received:', result.tabNowData);
            
            if (result.tabNowData && Object.keys(result.tabNowData).length > 0) {
                // Confirm before overwriting
                const cloudNotes = result.tabNowData.tabNowNotes || '';
                const cloudTodos = result.tabNowData.tabNowTodos || '[]';
                let todoCount = 0;
                try {
                    todoCount = JSON.parse(cloudTodos).length;
                } catch (e) {
                    console.error('Failed to parse cloud todos:', e);
                }
                const cloudReminders = result.tabNowData.tabNowReminders || '[]';
                let reminderCount = 0;
                try {
                    reminderCount = JSON.parse(cloudReminders).length;
                } catch (e) {}
                
                if (!confirm(`Pull data from cloud?\n\nCloud has:\n- ${cloudNotes.length} chars of notes\n- ${todoCount} todos\n- ${reminderCount} reminders\n\nThis will replace your current data.`)) {
                    this.updateSyncStatus('synced');
                    this.updateSyncInfo('Sync: Connected ✓');
                    return;
                }
                
                // Restore all data from cloud
                console.log('Restoring keys:', Object.keys(result.tabNowData));
                Object.keys(result.tabNowData).forEach(key => {
                    console.log(`Setting ${key}:`, result.tabNowData[key]?.substring?.(0, 100) || result.tabNowData[key]);
                    localStorage.setItem(key, result.tabNowData[key]);
                });
                
                this.loadSavedData();
                this.updateSyncStatus('synced');
                this.updateSyncInfo('Sync: Connected ✓');
                this.showNotification('✅ Data pulled from cloud!');
            } else {
                console.log('No cloud data found or empty:', result);
                this.updateSyncStatus('synced');
                this.updateSyncInfo('Sync: No cloud data');
                this.showNotification('No data found in cloud storage');
            }
        });
    }
    
    // Initialize Chrome sync
    initChromeSync() {
        if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.sync) {
            console.log('Chrome sync not available');
            this.updateSyncInfo('Sync: Not available');
            return;
        }

        // Check sync status and load data
        chrome.storage.sync.get(['tabNowData'], (result) => {
            if (chrome.runtime.lastError) {
                console.error('Chrome sync load error:', chrome.runtime.lastError);
                this.updateSyncStatus('error');
                this.updateSyncInfo('Sync: Error - ' + chrome.runtime.lastError.message);
                return;
            }

            if (result.tabNowData && Object.keys(result.tabNowData).length > 0) {
                // Check if cloud data exists
                const cloudNotes = result.tabNowData.tabNowNotes || '';
                const localNotes = localStorage.getItem('tabNowNotes') || '';

                // Auto-restore only if local is completely empty
                if (cloudNotes && !localNotes) {
                    console.log('Restoring data from Chrome sync...');
                    Object.keys(result.tabNowData).forEach(key => {
                        localStorage.setItem(key, result.tabNowData[key]);
                    });
                    this.loadSavedData();
                    this.showNotification('Data restored from Chrome sync!');
                }

                this.updateSyncStatus('synced');
                this.updateSyncInfo('Sync: Connected ✓');
            } else {
                this.updateSyncInfo('Sync: No cloud data');
            }
        });

        // Listen for changes from other devices (real-time sync)
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName === 'sync' && changes.tabNowData) {
                console.log('Received sync update from another device');
                this.showNotification('📥 New data available! Click "Pull from Cloud" to update.');
                this.updateSyncInfo('Sync: Update available!');
            }
        });
    }
    
    // Update sync info text
    updateSyncInfo(text) {
        if (this.syncInfo) {
            this.syncInfo.textContent = text;
        }
    }
    
    // Update sync status indicator
    updateSyncStatus(status) {
        if (!this.syncIndicator) return;
        
        this.syncIndicator.classList.remove('syncing', 'synced', 'error');
        
        switch (status) {
            case 'syncing':
                this.syncIndicator.classList.add('syncing');
                this.syncIndicator.title = 'Syncing...';
                break;
            case 'synced':
                this.syncIndicator.classList.add('synced');
                this.syncIndicator.title = 'Synced with Chrome';
                break;
            case 'error':
                this.syncIndicator.classList.add('error');
                this.syncIndicator.title = 'Sync error - click Settings to retry';
                break;
            default:
                this.syncIndicator.title = 'Sync status';
        }
    }
    
    // Show a brief notification
    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'sync-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--secondary-bg);
            color: var(--text-color);
            padding: 12px 24px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            font-size: 14px;
            animation: slideUp 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Immediate save function for important data changes
    saveDataImmediately() {
        // Debounce sync to avoid too many writes
        if (this.syncDebounceTimer) {
            clearTimeout(this.syncDebounceTimer);
        }
        
        this.syncDebounceTimer = setTimeout(() => {
            // Save to Chrome storage if available
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
                this.updateSyncStatus('syncing');
                
                const tabNowData = {};
                const keysToSync = [
                    'tabNowNotes',
                    'tabNowTodos', 
                    'tabNowReminders',
                    'tabNowTheme',
                    'tabNowSelectedTagColor',
                    'tabNowTempUnit',
                    'tabNowLocation',
                    'tabNowWeatherCache',
                    'tabNowLocalLocationName',
                    'tabNowAdditionalClockLocations'
                ];
                
                keysToSync.forEach(key => {
                    const value = localStorage.getItem(key);
                    if (value) {
                        tabNowData[key] = value;
                    }
                });
                
                chrome.storage.sync.set({ tabNowData }, () => {
                    if (chrome.runtime.lastError) {
                        console.error('Sync error:', chrome.runtime.lastError);
                        this.updateSyncStatus('error');
                    } else {
                        this.updateSyncStatus('synced');
                    }
                });
            }
        }, 1000); // Wait 1 second after last change before syncing
    }

    // Utility Functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the extension when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tabNowInstance = new TabNow();
});

// Save data before page unload
window.addEventListener('beforeunload', () => {
    if (window.tabNowInstance) {
        window.tabNowInstance.saveDataImmediately();
    }
}); 