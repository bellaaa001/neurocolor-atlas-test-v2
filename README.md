# NeuroColor Atlas Test – Research Version 2

A dementia-friendly, modular static GitHub Pages application for neurodevelopmental colour perception and face recognition research. Implements Stages 1-3 with complete scientific stimulus control, facial expression associations, cultural colour memory, and secure client-side data management.

## Features

✅ **Scientific Stimulus Design**
- 13 unique CIELCh/CIELAB colour conditions with scientifically defined target values
- D65, 2° observer CIELAB-to-sRGB conversion in JavaScript
- Full Version: 16 trials (all 13 conditions + 3 repeats)
- Short Version: 8 balanced trials for fatigue/early dementia
- Randomized trial sequencing with no consecutive duplicates

✅ **Passive Colour Exposure Protocol**
- Full-screen neutral baseline (3s) → colour stimulus (4s) → rating → washout (6s)
- Fullscreen mode with hidden UI during passive exposure
- Automatic timing and precise timestamp logging
- Mandatory 30-second break after trial 8 (Full Version)

✅ **Emotion Rating System**
- Valence (Unpleasant / Neutral / Pleasant)
- Arousal (Calm / Neutral / Active)
- Emotion family (11 categories + Other)
- Intensity (0-3 scale)

✅ **Face-to-Colour Association**
- 6 facial emotions (Happiness, Sadness, Anger, Fear, Disgust, Neutral)
- SVG schematic faces (no emojis)
- 12-colour selection grid (large, dementia-friendly)
- Skip item, skip task, pause/resume controls

✅ **Colour-to-Face Association**
- Large colour display areas (full-screen background)
- Grayscale schematic faces with clear emotion labels
- Response timing and selection logging

✅ **Indian Chromatic Memory Task**
- 10 pilot cultural colours (Kumkum red, Haldi yellow, Kesari, Marigold, Mehendi, Indigo, Peacock, Chandan, Terracotta, Jasmine)
- CIELAB targets with provisional RGB/HEX display
- 4 questions per colour:
  1. Familiarity (Yes/No/Not sure)
  2. Memory association with category selection
  3. Emotional valence (Pleasant/Neutral/Unpleasant)
  4. Free-text memory description when "Other" selected
- 30 predefined memory categories

✅ **Dementia-Friendly Design**
- High contrast (black on white, white on black)
- Large fonts (18px base, 32px headings, 24px buttons)
- Large buttons with yellow focus outline (4px)
- Simple, clear navigation
- Clear skip, pause, resume, and stop controls on all optional tasks

✅ **Secure Data Management**
- All data stays in browser (no server, no external APIs, no GitHub upload)
- Central dataLog array with all events timestamped
- Automatic localStorage saving after every response/skip/pause/resume
- Session recovery on page reload with researcher confirmation
- CSV export: `ParticipantID_behavioural_YYYY-MM-DD.csv`
- Backup before clearing, safe session wipe

✅ **Complete Event Logging**
- participant_id, test_version, trial/item numbers
- Stimulus ID, CIELAB, CIELCh, RGB, HEX, gamut status
- Baseline/passive/rating/washout timestamps
- Response data (valence, arousal, emotion, intensity)
- Skip reason, pause/resume, stop reason
- Response time (ms)
- AFT reference data

✅ **Modular Architecture**
- Small, focused JavaScript modules (max ~350 lines each)
- No frameworks, libraries, or build tools
- Vanilla JavaScript ES6 only
- Pure HTML5 and CSS3

## File Structure

```
neurocolor-atlas-test-v2/
├── index.html                      # Main entry point
├── README.md                       # This file
├── css/
│   ├── styles.css                  # Base dementia-friendly styles
│   ├── scientific-task.css         # Scientific task styling
│   └── association-tasks.css       # Face/colour association styling
└── js/
    ├── config.js                   # Constants and configuration
    ├── state.js                    # Global state management
    ├── storage.js                  # localStorage and session recovery
    ├── data-export.js              # CSV export and data summary
    ├── aft-module.js               # AFT reference/sync
    ├── ui-controls.js              # UI components and pages
    ├── scientific-stimuli.js        # CIELCh/CIELAB definitions and RGB conversion
    ├── scientific-task.js           # Scientific colour task controller
    ├── face-to-colour.js           # Face-to-colour association
    ├── colour-to-face.js           # Colour-to-face association
    ├── indian-memory.js            # Indian chromatic memory
    └── navigation.js               # Page routing and task initialization
```

## Pages (Complete Flow)

1. **Researcher and Participant Setup** – Participant code, version selection (Full/Short/Demo)
2. **Consent Confirmation** – Mandatory 3-checkbox consent
3. **AFT Reference & Synchronization** – Separate AFT module with start times
4. **Practice Trial** – Placeholder for practice task
5. **Scientific Colour Task** – Full or Short version, 16 or 8 trials, passive exposure + rating
6. **Face-to-Colour Association** – 6 emotions, 12-colour grid
7. **Colour-to-Face Association** – 6 colours (6 items), grayscale faces
8. **Indian Chromatic Memory Task** – 10 cultural colours, 4 questions each
9. **Final Summary & CSV Download** – Statistics, download, session clear

## Controls on All Tasks

- **Continue / Submit** – Confirm response
- **Skip Item** – Log item-level skip
- **Skip Task** – Skip entire task (logs reason)
- **Pause** – Pause session (resume on next render)
- **Resume** – Resume after pause
- **Stop Test** – End test immediately, go to summary
- **Not Sure** – Default response (e.g., neutral colour for Face-to-Colour)

## Data Export

**CSV Format:**
```
participant_id, test_version, trial_number, stimulus_id, stimulus_name,
cielab_L, cielab_a, cielab_b,
cielch_L, cielch_C, cielch_h,
rgb_r, rgb_g, rgb_b, hex_value, gamut_status,
baseline_onset_time, passive_start_time, passive_offset_time,
rating_onset_time, response_time_ms,
valence_response, arousal_response, emotion_response, emotion_other_text,
intensity_score, trial_status, skip_status, skip_reason, timestamp
```

**File naming:**
- `ParticipantID_behavioural_YYYY-MM-DD.csv`
- All times in ISO 8601 format
- No participant names, phone numbers, or identifiable details

## Colour Conversion

**Scientific Task (13 conditions):**
- Stored as CIELCh targets (L*, C*, h)
- Converted to CIELAB (L*, a*, b*)
- Converted to XYZ (D65, 2° observer)
- Converted to linear RGB
- Gamma-corrected to sRGB (0-255)
- Flagged as in-gamut or out-of-gamut

**Indian Memory Task (10 colours):**
- Stored as CIELAB targets (L*, a*, b*)
- Converted using same pipeline
- Marked as provisional until physical spectrophotometer measurement

**⚠️ Important:** All RGB/HEX values displayed in the browser are **provisional** until the monitor is calibrated and colours are measured with a spectrophotometer. CIELAB and CIELCh targets are the scientific reference.

## Session Recovery

**On page reload:**
1. Check localStorage for unfinished session
2. If found, ask researcher: "Resume unfinished session?"
3. If Yes: restore state and continue
4. If No: discard and start new
5. Backup created before clearing

## Deployment

### GitHub Pages

1. Repository already enabled for GitHub Pages
2. Visit: `https://bellaaa001.github.io/neurocolor-atlas-test-v2/`
3. Site is live immediately; no build process

### Local Development

```bash
git clone https://github.com/bellaaa001/neurocolor-atlas-test-v2.git
cd neurocolor-atlas-test-v2
python -m http.server 8000  # or: npx http-server
# Open browser: http://localhost:8000
```

## Privacy & Security

✅ **No data sent to GitHub or any server**
- All processing happens in the browser
- localStorage stores data locally only
- CSV downloaded to local disk
- No network requests except to load static files

✅ **Participant anonymity**
- Participant codes only (no names, IDs, phone)
- Session IDs are local and time-based
- No external tracking or analytics

✅ **Data at rest**
- localStorage is browser-local only
- Clear session after download with confirmation
- Backup available before clearing

## Browser Support

- Chrome (tested, recommended)
- Firefox, Edge, Safari (modern versions)
- Requires ES6 support and localStorage
- Works offline after first load (static files only)

## Calibration & Validation Notes

### Monitor Calibration Required

⚠️ **Before running studies:**
1. Calibrate display with a colourimeter or spectrophotometer
2. Measure actual RGB values of generated colours
3. Compare to CIELAB targets in CSV
4. Document any gamut limitations
5. Update README with calibration date and monitor model

### Gamut Clipping

Out-of-gamut colours are flagged in the CSV:
- `gamut_status: "out-of-gamut"` indicates RGB value required clipping
- Check HEX value; if clipped, consider target revision
- Scientific interpretation may differ from visual presentation

### Timing Accuracy

- Passive exposure timestamps: millisecond precision (performance.now())
- Break timers: ~1-second accuracy (setTimeout)
- Response times: browser-dependent (typically ±50ms)
- Recommend independent eye-tracking or HRV logging for precise alignment

## Quality Checklist (Stage 3 Complete)

✅ All pages navigate without getting stuck
✅ Every optional task has Skip button
✅ Pause and Resume tested and working
✅ Stop Test safely halts and goes to summary
✅ localStorage recovery tested and working
✅ Fullscreen mode exits safely (ESC key)
✅ CSV contains complete stimulus, response, timing data
✅ No participant identifiers in CSV
✅ Site works on GitHub Pages and Chrome
✅ All buttons large (50+ px) and dementia-friendly
✅ High contrast maintained throughout
✅ No server logs or external uploads

## Known Limitations

- HRV not calculated in browser (timestamps only for later alignment)
- Colours not absolutely calibrated until monitor measurement
- Fullscreen mode requires user gesture (click required)
- localStorage limited by browser (typically 5-10 MB)
- No multi-participant session isolation (single researcher, single PC)

## Future Enhancements (Beyond Stage 3)

- Stage 4: Eye-tracking integration
- Stage 5: Real-time HRV calculation
- Stage 6: Multi-site data synchronization (encrypted)
- Stage 7: Advanced statistical analysis
- Stage 8: Machine learning integration

## Study Design & Citation

**Lead Investigator:** University of Hyderabad
**Version:** 2.0 (Stage 3)
**Date:** 2026-06-05
**License:** Research Use Only

---

**Last Updated:** 2026-06-05
**Platform:** Static HTML/CSS/JavaScript (no server required)
**Browser:** Chrome/Chromium recommended
