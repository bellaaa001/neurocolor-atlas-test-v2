// Scientific stimulus definitions with CIELCh and CIELAB values
const SCIENTIFIC_STIMULI = {
    // Target fixed values
    LIGHTNESS: 60,      // L* = 60
    LOW_CHROMA: 25,     // C* = 25
    HIGH_CHROMA: 45,    // C* = 45
    
    // Hue angles in degrees
    HUE_ANGLES: [30, 90, 150, 210, 270, 330],
    
    // Stimulus definitions: CIELCh → CIELAB
    conditions: [
        // Low chroma conditions (C* = 25)
        {
            id: 'SC01',
            name: 'Low-Chroma Red',
            L: 60,
            C: 25,
            h: 30,
            category: 'low-chroma'
        },
        {
            id: 'SC02',
            name: 'Low-Chroma Yellow',
            L: 60,
            C: 25,
            h: 90,
            category: 'low-chroma'
        },
        {
            id: 'SC03',
            name: 'Low-Chroma Green',
            L: 60,
            C: 25,
            h: 150,
            category: 'low-chroma'
        },
        {
            id: 'SC04',
            name: 'Low-Chroma Cyan',
            L: 60,
            C: 25,
            h: 210,
            category: 'low-chroma'
        },
        {
            id: 'SC05',
            name: 'Low-Chroma Blue',
            L: 60,
            C: 25,
            h: 270,
            category: 'low-chroma'
        },
        {
            id: 'SC06',
            name: 'Low-Chroma Magenta',
            L: 60,
            C: 25,
            h: 330,
            category: 'low-chroma'
        },
        
        // High chroma conditions (C* = 45)
        {
            id: 'SC07',
            name: 'High-Chroma Red',
            L: 60,
            C: 45,
            h: 30,
            category: 'high-chroma'
        },
        {
            id: 'SC08',
            name: 'High-Chroma Yellow',
            L: 60,
            C: 45,
            h: 90,
            category: 'high-chroma'
        },
        {
            id: 'SC09',
            name: 'High-Chroma Green',
            L: 60,
            C: 45,
            h: 150,
            category: 'high-chroma'
        },
        {
            id: 'SC10',
            name: 'High-Chroma Cyan',
            L: 60,
            C: 45,
            h: 210,
            category: 'high-chroma'
        },
        {
            id: 'SC11',
            name: 'High-Chroma Blue',
            L: 60,
            C: 45,
            h: 270,
            category: 'high-chroma'
        },
        {
            id: 'SC12',
            name: 'High-Chroma Magenta',
            L: 60,
            C: 45,
            h: 330,
            category: 'high-chroma'
        },
        
        // Neutral grey
        {
            id: 'SC13',
            name: 'Neutral Grey',
            L: 60,
            C: 0,
            h: 0,
            category: 'neutral'
        }
    ],
    
    // Get stimulus by ID
    getStimulusById(id) {
        return this.conditions.find(s => s.id === id);
    },
    
    // Convert CIELCh to CIELAB
    lchToLab(L, C, h) {
        const hRad = (h * Math.PI) / 180;
        const a = C * Math.cos(hRad);
        const b = C * Math.sin(hRad);
        return { L, a, b };
    },
    
    // Convert CIELAB to XYZ (D65, 2° observer)
    labToXyz(L, a, b) {
        const fy = (L + 16) / 116;
        const fx = a / 500 + fy;
        const fz = fy - b / 200;
        
        const xr = fx * fx * fx > 0.008856 ? fx * fx * fx : (fx - 16 / 116) / 7.787;
        const yr = L > 8 ? fy * fy * fy : L / 903.3;
        const zr = fz * fz * fz > 0.008856 ? fz * fz * fz : (fz - 16 / 116) / 7.787;
        
        // D65 illuminant
        const x = xr * 0.95047;
        const y = yr * 1.0;
        const z = zr * 1.08883;
        
        return { x, y, z };
    },
    
    // Convert XYZ to linear RGB
    xyzToLinearRgb(x, y, z) {
        const r = (x * 3.2406 + y * -1.5372 + z * -0.4986);
        const g = (x * -0.9689 + y * 1.8758 + z * 0.0415);
        const b = (x * 0.0557 + y * -0.204 + z * 1.057);
        return { r, g, b };
    },
    
    // Apply gamma correction (sRGB)
    applyGamma(value) {
        if (value <= 0.0031308) {
            return 12.92 * value;
        }
        return 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
    },
    
    // Convert linear RGB to sRGB (0-255)
    linearToSrgb(r, g, b) {
        return {
            r: Math.max(0, Math.min(255, Math.round(this.applyGamma(r) * 255))),
            g: Math.max(0, Math.min(255, Math.round(this.applyGamma(g) * 255))),
            b: Math.max(0, Math.min(255, Math.round(this.applyGamma(b) * 255)))
        };
    },
    
    // Check if linear RGB is in sRGB display gamut (all channels 0-1 before clipping)
    isInGamut(r, g, b) {
        return r >= 0 && r <= 1 && g >= 0 && g <= 1 && b >= 0 && b <= 1;
    },
    
    // Convert RGB to HEX
    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = Math.round(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('').toUpperCase();
    },
    
    // Full conversion: CIELCh → sRGB with gamut check
    convertToRgb(stimulus) {
        const lab = this.lchToLab(stimulus.L, stimulus.C, stimulus.h);
        const xyz = this.labToXyz(lab.L, lab.a, lab.b);
        const linearRgb = this.xyzToLinearRgb(xyz.x, xyz.y, xyz.z);
        const srgb = this.linearToSrgb(linearRgb.r, linearRgb.g, linearRgb.b);
        const hex = this.rgbToHex(srgb.r, srgb.g, srgb.b);
        const inGamut = this.isInGamut(linearRgb.r, linearRgb.g, linearRgb.b);
        
        return {
            rgb: srgb,
            hex: hex,
            gamutStatus: inGamut ? 'in-gamut' : 'out-of-gamut',
            cielab: lab,
            cielch: { L: stimulus.L, C: stimulus.C, h: stimulus.h }
        };
    },
    
    // Enrich stimulus with RGB conversion
    enrichStimulus(stimulus) {
        const converted = this.convertToRgb(stimulus);
        return {
            ...stimulus,
            ...converted,
            cssColor: `rgb(${converted.rgb.r}, ${converted.rgb.g}, ${converted.rgb.b})`
        };
    },
    
    // Get all enriched stimuli
    getAllEnriched() {
        return this.conditions.map(s => this.enrichStimulus(s));
    }
};

// Trial sequence builder
const TRIAL_SEQUENCES = {
    // Full version: 16 trials (all 13 + 3 repeats)
    generateFullVersion() {
        const base = SCIENTIFIC_STIMULI.conditions.map(s => s.id);
        const repeats = ['SC07', 'SC11', 'SC13']; // High-chroma red, blue, neutral
        return [...base, ...repeats];
    },
    
    // Short version: 8 trials (predefined balanced)
    SHORT_VERSION: [
        'SC02', // Low-Chroma Yellow
        'SC04', // Low-Chroma Cyan
        'SC07', // High-Chroma Red
        'SC09', // High-Chroma Green
        'SC11', // High-Chroma Blue
        'SC13', // Neutral Grey
        'SC01', // Low-Chroma Red
        'SC12'  // High-Chroma Magenta
    ],
    
    // Randomize trials without consecutive duplicates
    randomizeTrials(trialIds) {
        let shuffled = [...trialIds].sort(() => Math.random() - 0.5);
        let iterations = 0;
        const maxIterations = 100;
        
        // Ensure no consecutive duplicates
        while (this.hasConsecutiveDuplicates(shuffled) && iterations < maxIterations) {
            shuffled = [...trialIds].sort(() => Math.random() - 0.5);
            iterations++;
        }
        
        return shuffled;
    },
    
    // Check for consecutive identical conditions
    hasConsecutiveDuplicates(trialIds) {
        for (let i = 0; i < trialIds.length - 1; i++) {
            if (trialIds[i] === trialIds[i + 1]) {
                return true;
            }
        }
        return false;
    },
    
    // Get trial sequence for version
    getSequence(version) {
        const base = version === 'full' ? this.generateFullVersion() : this.SHORT_VERSION;
        return this.randomizeTrials(base);
    }
};
