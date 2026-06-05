// UI Controls module
const UI_CONTROLS = {
    renderSetup() {
        return `
            <div class="setup-page">
                <h2>Researcher and Participant Setup</h2>
                <div class="form-group">
                    <label for="researcherName">Researcher Name:</label>
                    <input type="text" id="researcherName" placeholder="Enter researcher name">
                </div>
                <div class="form-group">
                    <label for="participantId">Participant ID:</label>
                    <input type="text" id="participantId" placeholder="Enter participant ID">
                </div>
                <div class="form-group">
                    <label for="versionSelect">Test Version:</label>
                    <select id="versionSelect">
                        <option value="">Select version...</option>
                        <option value="v1">Version 1</option>
                        <option value="v2">Version 2</option>
                    </select>
                </div>
                <div class="button-container">
                    <button class="btn-success" onclick="UI_CONTROLS.submitSetup()">Continue</button>
                </div>
            </div>
        `;
    },

    setupEventListeners() {
        // Setup page event listeners
    },

    submitSetup() {
        const participantId = document.getElementById('participantId').value;
        const version = document.getElementById('versionSelect').value;

        if (!participantId || !version) {
            alert('Please fill in all fields.');
            return;
        }

        STATE.participantId = participantId;
        STATE.version = version;
        STORAGE.autoSave();
        NAVIGATION.nextPage();
    },

    renderConsent() {
        return `
            <div class="consent-page">
                <h2>Informed Consent</h2>
                <div class="consent-content">
                    <p>This is a research study exploring colour perception and memory.</p>
                    <p>Your participation is voluntary and you can withdraw at any time.</p>
                    <p>All data is stored locally in your browser and will not be uploaded anywhere.</p>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="consentCheckbox"> I consent to participate
                        </label>
                    </div>
                </div>
                <div class="button-container">
                    <button class="btn-success" id="consentBtn" onclick="NAVIGATION.nextPage()" disabled>Agree & Continue</button>
                    <button class="btn-danger" onclick="NAVIGATION.goToPage(0)">Go Back</button>
                </div>
            </div>
        `;
    },

    renderTaskPlaceholder(title, description) {
        return `
            <div class="task-placeholder">
                <h2>${title}</h2>
                <p>${description}</p>
                <div class="button-container">
                    <button class="btn-success" onclick="NAVIGATION.nextPage()">Continue</button>
                    <button class="btn-warning" onclick="NAVIGATION.skipToNextPage()">Skip</button>
                </div>
            </div>
        `;
    },

    renderSummary() {
        const eventCount = STATE.dataLog.length;
        return `
            <div class="summary-page">
                <h2>Session Summary</h2>
                <div class="summary-info">
                    <p><strong>Session ID:</strong> ${STATE.sessionId}</p>
                    <p><strong>Participant ID:</strong> ${STATE.participantId}</p>
                    <p><strong>Test Version:</strong> ${STATE.version}</p>
                    <p><strong>Events Logged:</strong> ${eventCount}</p>
                </div>
                <div class="alert alert-info">
                    <p>Thank you for completing the study.</p>
                </div>
                <div class="button-container">
                    <button class="btn-success" onclick="DATA_EXPORT.exportToCSV()">Download Data (CSV)</button>
                    <button class="btn-warning" onclick="location.reload()">Start New Session</button>
                </div>
            </div>
        `;
    }
};

// Handle consent checkbox
document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver(() => {
        const consentCheckbox = document.getElementById('consentCheckbox');
        const consentBtn = document.getElementById('consentBtn');
        if (consentCheckbox && consentBtn) {
            consentCheckbox.addEventListener('change', () => {
                consentBtn.disabled = !consentCheckbox.checked;
            });
        }
    });
    observer.observe(document.getElementById('mainContent'), { childList: true, subtree: true });
});
