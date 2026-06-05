const UI_CONTROLS = {
  renderSetup() {
    return `
      <section class="task-page">
        <h2>Researcher and Participant Setup</h2>

        <div class="form-group">
          <label for="participantId">Participant Code</label>
          <input
            id="participantId"
            type="text"
            placeholder="Example: TEST_001"
            autocomplete="off"
          >
        </div>

        <div class="form-group">
          <label for="testVersion">Test Version</label>
          <select id="testVersion">
            <option value="demo">Demo Mode</option>
            <option value="short">Short Version</option>
            <option value="full">Full Version</option>
          </select>
        </div>

        <div class="button-group">
          <button id="startSessionButton" class="primary-button">
            Start Session
          </button>
        </div>
      </section>
    `;
  },

  setupEventListeners() {
    const startButton = document.getElementById("startSessionButton");

    if (!startButton) return;

    startButton.addEventListener("click", () => {
      const participantInput = document.getElementById("participantId");
      const versionInput = document.getElementById("testVersion");

      const participantId = participantInput.value.trim();

      if (!participantId) {
        alert("Please enter a participant code.");
        participantInput.focus();
        return;
      }

      STATE.participantId = participantId;
      STATE.version = versionInput.value;

      STATE.logEvent(CONFIG.EVENT_TYPES.RESPONSE, {
        task_name: "setup",
        test_version: STATE.version
      });

      NAVIGATION.nextPage();
    });
  },

  renderConsent() {
    return `
      <section class="task-page">
        <h2>Consent Confirmation</h2>

        <p>
          Confirm that the approved informed-consent process has been
          completed before continuing.
        </p>

        <label>
          <input id="consentConfirmed" type="checkbox">
          Consent pathway completed
        </label>

        <div class="button-group">
          <button onclick="UI_CONTROLS.submitConsent()" class="primary-button">
            Continue
          </button>

          <button onclick="NAVIGATION.previousPage()">
            Back
          </button>

          <button onclick="NAVIGATION.stopTest()" class="danger-button">
            Stop Test
          </button>
        </div>
      </section>
    `;
  },

  submitConsent() {
    const consent = document.getElementById("consentConfirmed");

    if (!consent || !consent.checked) {
      alert("Consent confirmation is required before continuing.");
      return;
    }

    STATE.logEvent(CONFIG.EVENT_TYPES.RESPONSE, {
      task_name: "consent",
      consent_confirmed: true
    });

    NAVIGATION.nextPage();
  },

  renderTaskPlaceholder(title, description) {
    return `
      <section class="task-page">
        <h2>${title}</h2>
        <p>${description}</p>

        <div class="button-group">
          <button onclick="NAVIGATION.nextPage()" class="primary-button">
            Continue
          </button>

          <button onclick="NAVIGATION.skipToNextPage()">
            Skip
          </button>

          <button onclick="NAVIGATION.previousPage()">
            Back
          </button>

          <button onclick="NAVIGATION.stopTest()" class="danger-button">
            Stop Test
          </button>
        </div>
      </section>
    `;
  },

  renderSummary() {
    return `
      <section class="task-page">
        <h2>Session Summary</h2>

        <p><strong>Participant:</strong> ${STATE.participantId || "Not set"}</p>
        <p><strong>Test version:</strong> ${STATE.version}</p>
        <p><strong>Recorded events:</strong> ${STATE.dataLog.length}</p>

        <div class="button-group">
          <button onclick="downloadBehaviouralCSV()" class="primary-button">
            Download Behavioural CSV
          </button>
        </div>
      </section>
    `;
  }
};
