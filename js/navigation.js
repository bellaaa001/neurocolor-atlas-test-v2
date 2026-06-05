// Navigation and page management
const NAVIGATION = {
  // Initialize application
  init() {
    // Check for unfinished session on load
    if (STORAGE.hasUnfinishedSession()) {
      const confirmed = confirm('An unfinished session was found. Do you want to resume?');
      if (confirmed) {
        STORAGE.restoreSession();
      } else {
        STORAGE.clearSession();
        STATE.resetSession();
      }
    } else {
      STATE.resetSession();
    }

    this.render();
    this.updateSessionInfo();
  },

  // Render current page
  render() {
    const mainContent = document.getElementById('mainContent');
    const currentPage = STATE.getCurrentPageName();

    STATE.logEvent(CONFIG.EVENT_TYPES.PAGE_ENTER, {
      page: currentPage
    });

    let html = '';

    switch (currentPage) {
      case 'setup':
        html = UI_CONTROLS.renderSetup();
        break;
      case 'consent':
        html = UI_CONTROLS.renderConsent();
        break;
      case 'aft':
        html = AFT_MODULE.render();
        break;
      case 'practice':
        html = UI_CONTROLS.renderTaskPlaceholder(
          'Practice Trial',
          'Practice session to familiarize with task format.'
        );
        break;
      case 'scientific-color':
        html = `
          <div class="scientific-page">
            <h2>Scientific Colour Task</h2>
            <p>Please enter fullscreen mode and read the instructions carefully.</p>
            <div class="alert alert-info">
              <p>This task will present colours on the screen. You will be asked to rate how each colour makes you feel.</p>
              <p>The task includes a mandatory 30-second break after trial 8.</p>
            </div>
            <div class="button-container">
              <button class="btn-success" onclick="NAVIGATION.startScientificTask()">Enter Fullscreen & Begin</button>
              <button class="btn-warning" onclick="NAVIGATION.skipToNextPage()">Skip Task</button>
              <button class="btn-danger" onclick="NAVIGATION.stopTest()">Stop Test</button>
            </div>
          </div>
        `;
        break;
      case 'face-color':
        html = `
          <div class="scientific-page">
            <h2>Face-to-Colour Association</h2>
            <p>You will see faces expressing different emotions. Select the colour that best matches each emotion.</p>
            <div class="alert alert-info">
              <p>This task has 6 items (one for each emotion).</p>
              <p>You can skip items or the entire task if needed.</p>
            </div>
            <div class="button-container">
              <button class="btn-success" onclick="NAVIGATION.startFaceToColourTask()">Begin</button>
              <button class="btn-warning" onclick="NAVIGATION.skipToNextPage()">Skip Task</button>
              <button class="btn-danger" onclick="NAVIGATION.stopTest()">Stop Test</button>
            </div>
          </div>
        `;
        break;
      case 'color-face':
        html = `
          <div class="scientific-page">
            <h2>Colour-to-Face Association</h2>
            <p>You will see colours on the screen. Select the emotion that best matches each colour.</p>
            <div class="alert alert-info">
              <p>This task has 6 items.</p>
              <p>You can skip items or the entire task if needed.</p>
            </div>
            <div class="button-container">
              <button class="btn-success" onclick="NAVIGATION.startColourToFaceTask()">Begin</button>
              <button class="btn-warning" onclick="NAVIGATION.skipToNextPage()">Skip Task</button>
              <button class="btn-danger" onclick="NAVIGATION.stopTest()">Stop Test</button>
            </div>
          </div>
        `;
        break;
      case 'memory':
        html = `
          <div class="scientific-page">
            <h2>Indian Chromatic Memory Task</h2>
            <p>You will see colours associated with Indian culture. Answer questions about your memories and feelings.</p>
            <div class="alert alert-info">
              <p>This task has 10 colours with 4 questions each.</p>
              <p>You can skip items or the entire task if needed.</p>
            </div>
            <div class="button-container">
              <button class="btn-success" onclick="NAVIGATION.startIndianMemoryTask()">Begin</button>
              <button class="btn-warning" onclick="NAVIGATION.skipToNextPage()">Skip Task</button>
              <button class="btn-danger" onclick="NAVIGATION.stopTest()">Stop Test</button>
            </div>
          </div>
        `;
        break;
      case 'summary':
        html = UI_CONTROLS.renderSummary();
        break;
      default:
        html = '<div class="alert alert-danger">Unknown page.</div>';
    }

    mainContent.innerHTML = html;
    STORAGE.autoSave();
  },

  // Start Scientific Colour Task
  async startScientificTask() {
    SCIENTIFIC_TASK.init(STATE.version);

    try {
      await SCIENTIFIC_TASK.startFullscreen();
    } catch (error) {
      console.warn('Fullscreen unavailable:', error);
    }

    SCIENTIFIC_TASK.runTrial();
  },

  // Start Face-to-Colour Task
  startFaceToColourTask() {
    FACE_TO_COLOUR_TASK.init();
  },

  // Start Colour-to-Face Task
  startColourToFaceTask() {
    COLOUR_TO_FACE_TASK.init();
  },

  // Start Indian Memory Task
  startIndianMemoryTask() {
    INDIAN_MEMORY_TASK.init();
  },

  // Skip to next page
  skipToNextPage() {
    const currentPage = STATE.getCurrentPageName();
    STATE.logSkip(currentPage, 'participant_choice');
    STORAGE.autoSave();
    this.nextPage();
  },

  // Move to next page
  nextPage() {
    if (STATE.nextPage()) {
      this.render();
    } else {
      this.render(); // Render summary if at end
    }
  },

  // Move to previous page
  previousPage() {
    if (STATE.previousPage()) {
      STATE.logEvent(CONFIG.EVENT_TYPES.PAGE_EXIT, {
        page: STATE.getCurrentPageName()
      });
      this.render();
    } else {
      alert('Cannot go back from this page.');
    }
  },

  // Go to specific page
  goToPage(pageIndex) {
    if (STATE.goToPage(pageIndex)) {
      this.render();
    }
  },

  // Pause session
  pause() {
    STATE.isPaused = true;
    STATE.pausedAt = new Date().toISOString();

    STATE.logEvent(CONFIG.EVENT_TYPES.PAUSE, {
      page: STATE.getCurrentPageName()
    });

    STORAGE.autoSave();

    const currentPage = STATE.getCurrentPageName();
    alert(`Session paused at: ${currentPage}\n\nYou can resume when ready.`);
  },

  // Resume session
  resume() {
    if (STATE.isPaused) {
      STATE.isPaused = false;

      STATE.logEvent(CONFIG.EVENT_TYPES.RESUME, {
        page: STATE.getCurrentPageName()
      });

      STORAGE.autoSave();
      alert('Session resumed.');
      this.render();
    }
  },

  // Stop test completely
  stopTest() {
    const confirmed = confirm('Are you sure you want to stop the test?');

    if (confirmed) {
      STATE.logEvent(CONFIG.EVENT_TYPES.STOP, {
        page: STATE.getCurrentPageName(),
        reason: 'user_stop'
      });

      STORAGE.autoSave();

      alert('Test stopped. You can download your data from the summary page.');
      NAVIGATION.goToPage(8); // Go to summary page (index 8)
    }
  },

  // Update session info display
  updateSessionInfo() {
    const sessionInfo = document.getElementById('sessionInfo');
    if (sessionInfo) {
      const totalPages = CONFIG.PAGES.length;
      const currentPageNum = STATE.currentPageIndex + 1;
      const info = `Session: ${STATE.sessionId ? STATE.sessionId.substring(0, 12) + '...' : 'New'} | Participant: ${STATE.participantId || 'Not Set'} | Page: ${currentPageNum}/${totalPages}`;
      sessionInfo.textContent = info;
    }
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  NAVIGATION.init();
  // Update session info every 5 seconds
  setInterval(() => NAVIGATION.updateSessionInfo(), 5000);
});
