const SCIENTIFIC_TASK = {
  trials: [], index: 0, current: null, ratingOnset: null, paused: false,
  timings() { return STATE.version === 'demo' ? CONFIG.DEMO_TIMINGS : CONFIG.RESEARCH_TIMINGS; },
  init(version) {
    STATE.version = ['full','short','demo'].includes(version) ? version : 'demo';
    const ids = STATE.version === 'full' ? TRIAL_SEQUENCES.generateFullVersion() : TRIAL_SEQUENCES.SHORT_VERSION;
    this.trials = TRIAL_SEQUENCES.randomizeTrials(ids).map((id, i) => ({ ...SCIENTIFIC_STIMULI.enrichStimulus(SCIENTIFIC_STIMULI.getStimulusById(id)), trialNumber: i+1 }));
    this.index = 0; this.paused = false;
    STATE.logEvent(CONFIG.EVENT_TYPES.RESPONSE, { task_name: CONFIG.TASKS.SCIENTIFIC, event: 'task_initialized', test_version: STATE.version, total_trials: this.trials.length });
  },
  async startFullscreen() {
    const el = document.documentElement;
    if (el.requestFullscreen) await el.requestFullscreen();
  },
  async exitFullscreenSafe() { try { if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen(); } catch(e){} },
  delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); },
  renderFullScreen(color, label='') {
    document.getElementById('mainContent').innerHTML = `<div class="fullscreen-passive" style="background:${color};"><span>${label}</span></div>`;
  },
  async runTrial() {
    if (this.index >= this.trials.length) return this.completeTask();
    if (STATE.version === 'full' && this.index === 8 && !STATE.pageState.scientificBreakDone) return this.showBreak();
    this.current = this.trials[this.index];
    const t = this.timings();
    const baselineTime = new Date().toISOString();
    this.renderFullScreen('#919191');
    await this.delay(t.baseline);
    if (this.paused) return;
    const stimOn = new Date().toISOString();
    this.renderFullScreen(this.current.hex);
    await this.delay(t.exposure);
    if (this.paused) return;
    const stimOff = new Date().toISOString();
    this.currentTimes = { baseline_onset_time: baselineTime, stimulus_onset_time: stimOn, stimulus_offset_time: stimOff };
    this.showRating();
  },
  showBreak() {
    STATE.pageState.scientificBreakDone = true;
    const t = this.timings();
    document.getElementById('mainContent').innerHTML = `<section class="break-screen"><h2>Mandatory Break</h2><p>Please rest before continuing.</p><div class="break-timer" id="breakTimer">${Math.ceil(t.break/1000)}</div><button class="btn-success" onclick="SCIENTIFIC_TASK.runTrial()">Continue Now</button></section>`;
    let rem = Math.ceil(t.break/1000);
    const int = setInterval(()=>{ rem--; const el=document.getElementById('breakTimer'); if(el) el.textContent=rem; if(rem<=0){clearInterval(int); this.runTrial();}},1000);
  },
  showRating() {
    this.ratingOnset = new Date().toISOString();
    const s = this.current;
    document.getElementById('mainContent').innerHTML = `
      <div class="rating-screen" style="background:${s.hex};">
        <div class="rating-panel">
          <h3>Trial ${this.index+1} of ${this.trials.length}</h3>
          <div class="form-group"><label>How does this colour feel?</label><select id="valence"><option value="">Select</option><option>Unpleasant</option><option>Neutral</option><option>Pleasant</option></select></div>
          <div class="form-group"><label>Calm or active?</label><select id="arousal"><option value="">Select</option><option>Calm</option><option>Neutral</option><option>Active</option></select></div>
          <div class="form-group"><label>Closest emotional family</label><select id="emotion" onchange="document.getElementById('emotionOtherWrap').style.display=this.value==='Other'?'block':'none'"><option value="">Select</option><option>Joy / Happy</option><option>Calm / Content</option><option>Excited / Interested</option><option>Love / Warmth</option><option>Sad</option><option>Angry</option><option>Fearful / Anxious</option><option>Disgusted</option><option>Surprised</option><option>Bored / Tired</option><option>No emotion</option><option>Other</option></select></div>
          <div id="emotionOtherWrap" class="form-group" style="display:none"><label>Other emotion</label><input id="emotionOther" type="text"></div>
          <div class="form-group"><label>Intensity</label><select id="intensity"><option value="">Select</option><option value="0">0 No feeling</option><option value="1">1 Mild</option><option value="2">2 Moderate</option><option value="3">3 Strong</option></select></div>
          <div class="button-container"><button class="btn-success" onclick="SCIENTIFIC_TASK.submitRating()">Submit Response</button><button class="btn-warning" onclick="SCIENTIFIC_TASK.skipTrial()">Skip Trial</button><button class="btn-secondary" onclick="SCIENTIFIC_TASK.pause()">Pause</button><button class="btn-danger" onclick="NAVIGATION.stopTest()">Stop Test</button></div>
        </div>
        <div class="stimulus-details">${s.id} | ${s.name}<br>LCh: ${s.L},${s.C},${s.h} | LAB: ${s.cielab.L.toFixed(1)},${s.cielab.a.toFixed(1)},${s.cielab.b.toFixed(1)}<br>HEX: ${s.hex} | ${s.gamutStatus}<div class="provisional-notice">Provisional until monitor calibration.</div></div>
      </div>`;
  },
  submitRating() {
    const valence=document.getElementById('valence').value, arousal=document.getElementById('arousal').value, emotion=document.getElementById('emotion').value, intensity=document.getElementById('intensity').value;
    if(!valence||!arousal||!emotion||intensity==='') { alert('Please answer all questions, or use Skip Trial.'); return; }
    this.logTrial('completed', { valence_response: valence, arousal_response: arousal, emotion_response: emotion, emotion_other_text: document.getElementById('emotionOther').value, intensity_score: intensity });
    this.nextAfterWashout();
  },
  skipTrial() { this.logTrial('skipped', { skip_status:'skipped', skip_reason:NAVIGATION.askSkipReason() }); this.nextAfterWashout(); },
  logTrial(status, extra={}) {
    const s=this.current; const now=new Date().toISOString();
    STATE.logEvent(status==='skipped'?CONFIG.EVENT_TYPES.SKIP:CONFIG.EVENT_TYPES.RESPONSE, {
      task_name: CONFIG.TASKS.SCIENTIFIC, trial_number: this.index+1, stimulus_id:s.id, stimulus_name:s.name,
      cielab_L:s.cielab.L, cielab_a:s.cielab.a, cielab_b:s.cielab.b, cielch_L:s.L, cielch_C:s.C, cielch_h:s.h,
      rgb_r:s.rgb.r, rgb_g:s.rgb.g, rgb_b:s.rgb.b, hex_value:s.hex, gamut_status:s.gamutStatus,
      ...this.currentTimes, rating_onset_time:this.ratingOnset, response_time_ms: new Date(now)-new Date(this.ratingOnset), trial_status:status, skip_status: status==='skipped'?'skipped':'not_skipped', skip_reason:'', ...extra
    });
  },
  async nextAfterWashout() { this.index++; this.renderFullScreen('#919191'); await this.delay(this.timings().washout); this.runTrial(); },
  pause() { this.paused=true; NAVIGATION.pause(); this.paused=false; this.showRating(); },
  resume() { this.paused=false; this.runTrial(); },
  async completeTask() { await this.exitFullscreenSafe(); STATE.logEvent(CONFIG.EVENT_TYPES.COMPLETE,{task_name:CONFIG.TASKS.SCIENTIFIC,total_trials:this.trials.length}); STORAGE.autoSave(); NAVIGATION.nextPage(); }
};
