// Indian Chromatic Memory Task - Cultural colour associations
const INDIAN_MEMORY_TASK = {
    // Pilot cultural colours with CIELAB targets
    culturalColours: [
        { name: 'Kumkum red', L: 45, a: 65, b: 50, description: 'Auspicious red powder' },
        { name: 'Haldi yellow', L: 85, a: -15, b: 85, description: 'Turmeric golden yellow' },
        { name: 'Kesari saffron', L: 65, a: 35, b: 70, description: 'Saffron orange-red' },
        { name: 'Marigold orange', L: 75, a: 40, b: 65, description: 'Festival flower orange' },
        { name: 'Mehendi green-brown', L: 40, a: -25, b: 30, description: 'Henna paste colour' },
        { name: 'Indigo neel', L: 25, a: 15, b: -45, description: 'Deep indigo blue' },
        { name: 'Peacock blue-green', L: 45, a: -20, b: -35, description: 'Teal-blue-green' },
        { name: 'Chandan beige', L: 70, a: 10, b: 25, description: 'Sandalwood pale beige' },
        { name: 'Terracotta brown', L: 50, a: 30, b: 35, description: 'Clay pottery brown' },
        { name: 'Jasmine white', L: 95, a: -2, b: 5, description: 'Flower-white pale' }
    ],
    
    memoryCategories: [
        'Family/person',
        'Friend/community',
        'Home',
        'Village/town',
        'Temple/religious place',
        'Hospital/clinic',
        'School/workplace',
        'Festival',
        'Marriage/family ceremony',
        'Religious ritual',
        'Childhood event',
        'Clothing/textile',
        'Jewellery/decoration',
        'Household object',
        'Art/media',
        'Food/spice/kitchen',
        'Cosmetics/body decoration',
        'Medicine/health',
        'Flowers/plants',
        'Animals/birds',
        'Water/pond/river/sea',
        'Sky/night',
        'Land/soil',
        'Summer',
        'Monsoon/rain',
        'Winter',
        'Morning/evening/night',
        'No memory',
        'Not sure',
        'Other'
    ],
    
    // State
    itemIndex: 0,
    responses: [],
    currentStep: 1, // 1-4 for the four questions
    startTime: null,
    currentResponse: {},
    
    // Convert CIELAB to RGB for display
    convertToRgb(L, a, b) {
        // Using same conversion as scientific task
        const fy = (L + 16) / 116;
        const fx = a / 500 + fy;
        const fz = fy - b / 200;
        
        const xr = fx * fx * fx > 0.008856 ? fx * fx * fx : (fx - 16 / 116) / 7.787;
        const yr = L > 8 ? fy * fy * fy : L / 903.3;
        const zr = fz * fz * fz > 0.008856 ? fz * fz * fz : (fz - 16 / 116) / 7.787;
        
        const x = xr * 0.95047;
        const y = yr * 1.0;
        const z = zr * 1.08883;
        
        const r = x * 3.2406 + y * -1.5372 + z * -0.4986;
        const g = x * -0.9689 + y * 1.8758 + z * 0.0415;
        const b_lin = x * 0.0557 + y * -0.204 + z * 1.057;
        
        const applyGamma = (val) => val <= 0.0031308 ? 12.92 * val : 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
        
        const rSrgb = Math.round(Math.max(0, Math.min(255, applyGamma(r) * 255)));
        const gSrgb = Math.round(Math.max(0, Math.min(255, applyGamma(g) * 255)));
        const bSrgb = Math.round(Math.max(0, Math.min(255, applyGamma(b_lin) * 255)));
        
        const hex = '#' + [rSrgb, gSrgb, bSrgb].map(x => x.toString(16).padStart(2, '0').toUpperCase()).join('');
        
        return { r: rSrgb, g: gSrgb, b: bSrgb, hex: hex };
    },
    
    // Initialize
    init() {
        this.itemIndex = 0;
        this.responses = [];
        this.currentStep = 1;
        this.currentResponse = {};
        
        STATE.logEvent(CONFIG.EVENT_TYPES.RESPONSE, {
            task_name: CONFIG.TASKS.MEMORY,
            event: 'task_initialized',
            total_colours: this.culturalColours.length
        });
        
        STORAGE.autoSave();
        this.showNextColour();
    },
    
    // Show next colour
    showNextColour() {
        if (this.itemIndex >= this.culturalColours.length) {
            this.completeTask();
            return;
        }
        
        this.currentStep = 1;
        this.currentResponse = {
            colourNumber: this.itemIndex + 1,
            colour: this.culturalColours[this.itemIndex].name
        };
        
        this.startTime = new Date();
        this.showQuestion1();
    },
    
    // Question 1: Is this colour familiar?
    showQuestion1() {
        const colour = this.culturalColours[this.itemIndex];
        const rgb = this.convertToRgb(colour.L, colour.a, colour.b);
        
        const html = `
            <div class="scientific-page" style="background-color: ${rgb.hex};">
                <div style="background-color: rgba(255, 255, 255, 0.95); padding: 32px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
                    <h2>Indian Chromatic Memory</h2>
                    
                    <div class="trial-progress">
                        <div class="progress-item">
                            <div class="progress-item-label">Colour</div>
                            <div class="progress-item-value">${this.itemIndex + 1} / ${this.culturalColours.length}</div>
                        </div>
                        <div class="progress-item">
                            <div class="progress-item-label">Question</div>
                            <div class="progress-item-value">1 / 4</div>
                        </div>
                    </div>
                    
                    <div style="margin: 30px 0; padding: 40px; background-color: ${rgb.hex}; border-radius: 8px; border: 2px solid #333;">
                    </div>
                    
                    <p style="text-align: center; font-size: 14px; color: #666;">
                        <strong>${colour.name}</strong><br>${colour.description}
                    </p>
                    
                    <h3 style="margin-top: 30px;">1. Is this colour familiar to you?</h3>
                    
                    <div class="rating-group">
                        <div class="rating-option">
                            <input type="radio" id="familiar_yes" name="familiar" value="yes" onchange="INDIAN_MEMORY_TASK.currentResponse.familiar = this.value">
                            <label for="familiar_yes">Yes</label>
                        </div>
                        <div class="rating-option">
                            <input type="radio" id="familiar_no" name="familiar" value="no" onchange="INDIAN_MEMORY_TASK.currentResponse.familiar = this.value">
                            <label for="familiar_no">No</label>
                        </div>
                        <div class="rating-option">
                            <input type="radio" id="familiar_notsure" name="familiar" value="not_sure" onchange="INDIAN_MEMORY_TASK.currentResponse.familiar = this.value">
                            <label for="familiar_notsure">Not sure</label>
                        </div>
                    </div>
                    
                    <div class="button-container">
                        <button class="btn-success" onclick="INDIAN_MEMORY_TASK.nextQuestion()">Continue</button>
                        <button class="btn-warning" onclick="INDIAN_MEMORY_TASK.skipColour()">Skip Colour</button>
                        <button class="btn-secondary" onclick="NAVIGATION.pause()">Pause</button>
                        <button class="btn-danger" onclick="INDIAN_MEMORY_TASK.skipTask()">Skip Task</button>
                        <button class="btn-danger" onclick="NAVIGATION.stopTest()">Stop Test</button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('mainContent').innerHTML = html;
        this.currentStep = 1;
    },
    
    // Question 2: Does it remind you of anything?
    showQuestion2() {
        const colour = this.culturalColours[this.itemIndex];
        const rgb = this.convertToRgb(colour.L, colour.a, colour.b);
        
        const html = `
            <div class="scientific-page" style="background-color: ${rgb.hex};">
                <div style="background-color: rgba(255, 255, 255, 0.95); padding: 32px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
                    <h2>Indian Chromatic Memory</h2>
                    
                    <div class="trial-progress">
                        <div class="progress-item">
                            <div class="progress-item-label">Colour</div>
                            <div class="progress-item-value">${this.itemIndex + 1} / ${this.culturalColours.length}</div>
                        </div>
                        <div class="progress-item">
                            <div class="progress-item-label">Question</div>
                            <div class="progress-item-value">2 / 4</div>
                        </div>
                    </div>
                    
                    <h3>2. Does this colour remind you of anything?</h3>
                    
                    <div class="rating-group">
                        <div class="rating-option">
                            <input type="radio" id="reminds_yes" name="reminds" value="yes" onchange="INDIAN_MEMORY_TASK.currentResponse.reminds = this.value; document.getElementById('categoryContainer').style.display = this.value === 'yes' ? 'block' : 'none';">
                            <label for="reminds_yes">Yes</label>
                        </div>
                        <div class="rating-option">
                            <input type="radio" id="reminds_no" name="reminds" value="no" onchange="INDIAN_MEMORY_TASK.currentResponse.reminds = this.value; document.getElementById('categoryContainer').style.display = 'none';">
                            <label for="reminds_no">No</label>
                        </div>
                        <div class="rating-option">
                            <input type="radio" id="reminds_notsure" name="reminds" value="not_sure" onchange="INDIAN_MEMORY_TASK.currentResponse.reminds = this.value; document.getElementById('categoryContainer').style.display = 'none';">
                            <label for="reminds_notsure">Not sure</label>
                        </div>
                    </div>
                    
                    <div id="categoryContainer" style="display: none; margin-top: 20px;">
                        <p style="font-weight: bold;">What does it remind you of?</p>
                        <select id="memoryCategory" onchange="INDIAN_MEMORY_TASK.currentResponse.memoryCategory = this.value" style="width: 100%; padding: 10px; font-size: 16px;">
                            <option value="">-- Select category --</option>
                            ${this.memoryCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                        </select>
                        <div id="otherContainer" style="display: none; margin-top: 12px;">
                            <textarea id="otherMemory" placeholder="Please describe..." style="width: 100%; padding: 10px; font-size: 16px; min-height: 60px;" onchange="INDIAN_MEMORY_TASK.currentResponse.otherMemory = this.value"></textarea>
                        </div>
                    </div>
                    
                    <div class="button-container">
                        <button class="btn-success" onclick="INDIAN_MEMORY_TASK.nextQuestion()">Continue</button>
                        <button class="btn-warning" onclick="INDIAN_MEMORY_TASK.skipColour()">Skip Colour</button>
                        <button class="btn-secondary" onclick="NAVIGATION.pause()">Pause</button>
                        <button class="btn-danger" onclick="INDIAN_MEMORY_TASK.skipTask()">Skip Task</button>
                        <button class="btn-danger" onclick="NAVIGATION.stopTest()">Stop Test</button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('mainContent').innerHTML = html;
        
        // Setup category selection
        document.getElementById('memoryCategory').addEventListener('change', function() {
            document.getElementById('otherContainer').style.display = this.value === 'Other' ? 'block' : 'none';
        });
        
        this.currentStep = 2;
    },
    
    // Question 3: How does this colour feel?
    showQuestion3() {
        const colour = this.culturalColours[this.itemIndex];
        const rgb = this.convertToRgb(colour.L, colour.a, colour.b);
        
        const html = `
            <div class="scientific-page" style="background-color: ${rgb.hex};">
                <div style="background-color: rgba(255, 255, 255, 0.95); padding: 32px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
                    <h2>Indian Chromatic Memory</h2>
                    
                    <div class="trial-progress">
                        <div class="progress-item">
                            <div class="progress-item-label">Colour</div>
                            <div class="progress-item-value">${this.itemIndex + 1} / ${this.culturalColours.length}</div>
                        </div>
                        <div class="progress-item">
                            <div class="progress-item-label">Question</div>
                            <div class="progress-item-value">3 / 4</div>
                        </div>
                    </div>
                    
                    <h3>3. How does this colour make you feel?</h3>
                    
                    <div class="rating-group">
                        <div class="rating-option">
                            <input type="radio" id="feel_pleasant" name="feel" value="pleasant" onchange="INDIAN_MEMORY_TASK.currentResponse.feel = this.value">
                            <label for="feel_pleasant">Pleasant</label>
                        </div>
                        <div class="rating-option">
                            <input type="radio" id="feel_neutral" name="feel" value="neutral" onchange="INDIAN_MEMORY_TASK.currentResponse.feel = this.value">
                            <label for="feel_neutral">Neutral</label>
                        </div>
                        <div class="rating-option">
                            <input type="radio" id="feel_unpleasant" name="feel" value="unpleasant" onchange="INDIAN_MEMORY_TASK.currentResponse.feel = this.value">
                            <label for="feel_unpleasant">Unpleasant</label>
                        </div>
                    </div>
                    
                    <div class="button-container">
                        <button class="btn-success" onclick="INDIAN_MEMORY_TASK.submitColour()">Complete Colour</button>
                        <button class="btn-warning" onclick="INDIAN_MEMORY_TASK.skipColour()">Skip Colour</button>
                        <button class="btn-secondary" onclick="NAVIGATION.pause()">Pause</button>
                        <button class="btn-danger" onclick="INDIAN_MEMORY_TASK.skipTask()">Skip Task</button>
                        <button class="btn-danger" onclick="NAVIGATION.stopTest()">Stop Test</button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('mainContent').innerHTML = html;
        this.currentStep = 3;
    },
    
    // Navigate questions
    nextQuestion() {
        if (this.currentStep === 1) {
            if (!this.currentResponse.familiar) {
                alert('Please answer the question.');
                return;
            }
            this.showQuestion2();
        } else if (this.currentStep === 2) {
            if (!this.currentResponse.reminds) {
                alert('Please answer the question.');
                return;
            }
            this.showQuestion3();
        }
    },
    
    // Submit colour response
    submitColour() {
        if (!this.currentResponse.feel) {
            alert('Please answer all questions.');
            return;
        }
        
        const responseTime = new Date() - this.startTime;
        const colour = this.culturalColours[this.itemIndex];
        const rgb = this.convertToRgb(colour.L, colour.a, colour.b);
        
        const response = {
            ...this.currentResponse,
            responseTimeMs: responseTime,
            colourRgb: rgb,
            colourHex: rgb.hex,
            colourCielab: { L: colour.L, a: colour.a, b: colour.b },
            status: 'completed'
        };
        
        this.responses.push(response);
        
        STATE.logEvent(CONFIG.EVENT_TYPES.RESPONSE, {
            task_name: CONFIG.TASKS.MEMORY,
            colour_number: response.colourNumber,
            colour: response.colour,
            familiar: response.familiar,
            reminds: response.reminds,
            memory_category: response.memoryCategory || '',
            feel: response.feel,
            response_time_ms: responseTime
        });
        
        STORAGE.autoSave();
        this.itemIndex++;
        this.showNextColour();
    },
    
    // Skip colour
    skipColour() {
        const response = {
            colourNumber: this.itemIndex + 1,
            colour: this.culturalColours[this.itemIndex].name,
            status: 'skipped'
        };
        
        this.responses.push(response);
        
        STATE.logEvent(CONFIG.EVENT_TYPES.SKIP, {
            task_name: CONFIG.TASKS.MEMORY,
            colour_number: response.colourNumber,
            colour: response.colour,
            skip_reason: 'participant_choice'
        });
        
        STORAGE.autoSave();
        this.itemIndex++;
        this.showNextColour();
    },
    
    // Skip entire task
    skipTask() {
        const reason = prompt('Skip reason:\n' + CONFIG.SKIP_REASONS.map((r, i) => (i + 1) + '. ' + r).join('\n'));
        if (reason !== null) {
            const reasonIndex = parseInt(reason) - 1;
            if (reasonIndex >= 0 && reasonIndex < CONFIG.SKIP_REASONS.length) {
                STATE.logSkip(CONFIG.TASKS.MEMORY, CONFIG.SKIP_REASONS[reasonIndex]);
                STORAGE.autoSave();
                NAVIGATION.nextPage();
            }
        }
    },
    
    // Complete task
    completeTask() {
        STATE.pageState.indianMemoryResponses = this.responses;
        
        STATE.logEvent(CONFIG.EVENT_TYPES.RESPONSE, {
            task_name: CONFIG.TASKS.MEMORY,
            event: 'task_completed',
            colours_completed: this.responses.filter(r => r.status === 'completed').length,
            colours_skipped: this.responses.filter(r => r.status === 'skipped').length
        });
        
        STORAGE.autoSave();
        NAVIGATION.nextPage();
    }
};
