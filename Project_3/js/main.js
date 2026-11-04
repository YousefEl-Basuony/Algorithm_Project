/**
 * Application Orchestrator for Heap Sort Visualizer
 * Manages timeline, playback engine, UI synchronization, audio cues, and user interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // DOM ELEMENTS
    // -------------------------------------------------------------
    const treeSvg = document.getElementById('treeSvg');
    const arrayContainer = document.getElementById('arrayContainer');
    const floatingTooltip = document.getElementById('floatingTooltip');

    // Controls
    const presetSelect = document.getElementById('presetSelect');
    const heapModeSelect = document.getElementById('heapModeSelect');
    const btnRandomize = document.getElementById('btnRandomize');
    const btnPlay = document.getElementById('btnPlay');
    const playIcon = document.getElementById('playIcon');
    const playText = document.getElementById('playText');
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    const btnFirst = document.getElementById('btnFirst');
    const btnLast = document.getElementById('btnLast');
    const btnReset = document.getElementById('btnReset');
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    const timelineScrubber = document.getElementById('timelineScrubber');
    const stepCounter = document.getElementById('stepCounter');

    // Header buttons
    const btnSoundToggle = document.getElementById('btnSoundToggle');
    const soundIcon = document.getElementById('soundIcon');
    const soundText = document.getElementById('soundText');
    const btnThemeToggle = document.getElementById('btnThemeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const btnHelpModal = document.getElementById('btnHelpModal');
    const helpModal = document.getElementById('helpModal');
    const btnCloseHelp = document.getElementById('btnCloseHelp');

    // Custom Array Modal
    const customInputModal = document.getElementById('customInputModal');
    const btnCloseCustom = document.getElementById('btnCloseCustom');
    const btnCancelCustom = document.getElementById('btnCancelCustom');
    const btnApplyCustom = document.getElementById('btnApplyCustom');
    const customNumbersInput = document.getElementById('customNumbersInput');
    const customInputError = document.getElementById('customInputError');

    // Narration & HUD
    const narrativeIcon = document.getElementById('narrativeIcon');
    const narrativeTitle = document.getElementById('narrativeTitle');
    const narrativeDesc = document.getElementById('narrativeDesc');
    const narrativeDescAr = document.getElementById('narrativeDescAr');
    const legendTargetTag = document.getElementById('legendTargetTag');
    const pseudocodePhaseBadge = document.getElementById('pseudocodePhaseBadge');
    const pseudocodeLines = document.querySelectorAll('.code-line');

    // Formulas
    const formulaLeft = document.getElementById('formulaLeft');
    const formulaRight = document.getElementById('formulaRight');
    const formulaParent = document.getElementById('formulaParent');
    const formulaLeaf = document.getElementById('formulaLeaf');

    // Stats
    const statComparisons = document.getElementById('statComparisons');
    const statSwaps = document.getElementById('statSwaps');

    // -------------------------------------------------------------
    // ENGINE & RENDERERS INITIALIZATION
    // -------------------------------------------------------------
    const engine = new HeapSortEngine();
    const treeRenderer = new TreeRenderer(treeSvg, floatingTooltip);
    const arrayRenderer = new ArrayRenderer(arrayContainer);

    let currentArray = [];
    let currentTrace = [];
    let currentStepIdx = 0;
    let isPlaying = false;
    let playTimer = null;
    let speed = 1.0;
    let currentMode = 'max';

    // -------------------------------------------------------------
    // DATA PRESET GENERATORS
    // -------------------------------------------------------------
    function generatePreset(type) {
        switch (type) {
            case 'random7':
                return [42, 18, 85, 63, 27, 91, 36];
            case 'random15':
                return [73, 29, 85, 41, 62, 18, 94, 33, 56, 88, 12, 47, 69, 25, 91];
            case 'random31':
                return generateRandomArray(31);
            case 'nearlySorted': {
                const arr = [12, 18, 25, 33, 40, 48, 55, 62, 70, 78, 85, 92, 98];
                // Introduce 2 slight inversions
                [arr[2], arr[6]] = [arr[6], arr[2]];
                [arr[8], arr[11]] = [arr[11], arr[8]];
                return arr;
            }
            case 'reverse': {
                return [95, 88, 82, 76, 70, 63, 57, 49, 42, 35, 27, 20, 14, 8, 3];
            }
            case 'fewUnique': {
                const pool = [15, 35, 65, 85];
                const res = [];
                for (let i = 0; i < 15; i++) {
                    res.push(pool[Math.floor(Math.random() * pool.length)]);
                }
                return res;
            }
            default:
                return generateRandomArray(15);
        }
    }

    function generateRandomArray(size) {
        const set = new Set();
        while (set.size < size) {
            set.add(Math.floor(Math.random() * 88) + 10);
        }
        return Array.from(set);
    }

    // -------------------------------------------------------------
    // INITIALIZATION & TRACE LOADING
    // -------------------------------------------------------------
    function loadDataset(arr) {
        pause();
        currentArray = [...arr];
        currentMode = heapModeSelect.value;
        legendTargetTag.textContent = currentMode === 'max' ? 'max : Candidate' : 'min : Candidate';

        currentTrace = engine.generateTrace(currentArray, currentMode);
        timelineScrubber.max = currentTrace.length - 1;
        timelineScrubber.value = 0;
        currentStepIdx = 0;
        applyStep(0, false);
    }

    // -------------------------------------------------------------
    // APPLY STEP
    // -------------------------------------------------------------
    function applyStep(idx, triggerAudio = true) {
        if (!currentTrace || currentTrace.length === 0) return;
        idx = Math.max(0, Math.min(currentTrace.length - 1, idx));
        currentStepIdx = idx;

        const step = currentTrace[idx];
        const n = step.array.length;

        // Render Tree and Array views
        treeRenderer.render(step);
        arrayRenderer.render(step);

        // Update Timeline Scrubber
        timelineScrubber.value = idx;
        stepCounter.textContent = `Step ${idx + 1} / ${currentTrace.length}`;

        // Update Narration
        updateNarration(step);

        // Update Formula HUD
        updateFormulaHud(step, n);

        // Update Pseudocode Highlight
        updatePseudocode(step);

        // Update Stats
        statComparisons.textContent = step.comparisons;
        statSwaps.textContent = step.swaps;

        // Sound Effects
        if (triggerAudio && window.soundEngine) {
            playAudioForStep(step);
        }
    }

    function updateNarration(step) {
        narrativeTitle.textContent = step.title;
        narrativeDesc.textContent = step.description;
        narrativeDescAr.textContent = step.descriptionAr;

        let icon = '📌';
        switch (step.action) {
            case 'INIT': icon = '🚀'; break;
            case 'HEAPIFY_START': icon = '🔍'; break;
            case 'COMPARE_LEFT':
            case 'COMPARE_RIGHT': icon = '⚖️'; break;
            case 'SWAP_HEAPIFY': icon = '🔄'; break;
            case 'HEAP_BUILT': icon = '🏔️'; break;
            case 'EXTRACT_ROOT': icon = '⭐'; break;
            case 'SWAP_ROOT_END': icon = '📦'; break;
            case 'LOCK_SORTED': icon = '🔒'; break;
            case 'ALL_SORTED': icon = '🎉'; break;
            case 'NO_SWAP': icon = '✅'; break;
        }
        narrativeIcon.textContent = icon;
    }

    function updateFormulaHud(step, n) {
        const activeI = step.i !== null ? step.i : 0;
        const leftVal = 2 * activeI + 1;
        const rightVal = 2 * activeI + 2;
        const parentVal = activeI > 0 ? Math.floor((activeI - 1) / 2) : 0;
        const isLeaf = activeI >= Math.floor(n / 2);

        formulaLeft.textContent = `2(${activeI}) + 1 = ${leftVal < n ? leftVal : 'None'}`;
        formulaRight.textContent = `2(${activeI}) + 2 = ${rightVal < n ? rightVal : 'None'}`;
        formulaParent.textContent = activeI > 0 ? `⌊(${activeI} - 1)/2⌋ = ${parentVal}` : 'None (Root)';
        formulaLeaf.textContent = `i=${activeI} ${isLeaf ? '≥' : '<'} ⌊${n}/2⌋ (${isLeaf ? 'Is Leaf' : 'Internal Node'})`;
    }

    function updatePseudocode(step) {
        const container = document.getElementById('pseudocodeContainer');
        pseudocodeLines.forEach(line => {
            const lineNum = parseInt(line.dataset.line, 10);
            if (lineNum === step.codeLine) {
                line.classList.add('active');
                if (container) {
                    const topPos = line.offsetTop - container.offsetTop;
                    container.scrollTop = Math.max(0, topPos - 30);
                }
            } else {
                line.classList.remove('active');
            }
        });

        if (step.phase === 'BUILD_HEAP') {
            pseudocodePhaseBadge.textContent = 'Phase 1: Build Heap';
            pseudocodePhaseBadge.style.color = 'var(--color-i)';
        } else if (step.phase === 'SORTING') {
            pseudocodePhaseBadge.textContent = 'Phase 2: Extract & Sort';
            pseudocodePhaseBadge.style.color = 'var(--color-sorted)';
        } else if (step.phase === 'DONE') {
            pseudocodePhaseBadge.textContent = 'Completed 🎉';
            pseudocodePhaseBadge.style.color = '#10b981';
        }
    }

    function playAudioForStep(step) {
        const minVal = Math.min(...step.array);
        const maxVal = Math.max(...step.array);

        if (step.action === 'COMPARE_LEFT' || step.action === 'COMPARE_RIGHT') {
            if (step.comparing) {
                const v1 = step.array[step.comparing[0]];
                const v2 = step.array[step.comparing[1]];
                window.soundEngine.playCompare(v1, v2, minVal, maxVal);
            }
        } else if (step.action === 'SWAP_HEAPIFY' || step.action === 'SWAP_ROOT_END') {
            if (step.swapping) {
                const v1 = step.array[step.swapping[0]];
                const v2 = step.array[step.swapping[1]];
                window.soundEngine.playSwap(v1, v2, minVal, maxVal);
            }
        } else if (step.action === 'LOCK_SORTED') {
            window.soundEngine.playSortedLock();
        } else if (step.action === 'ALL_SORTED') {
            window.soundEngine.playVictory();
        }
    }

    // -------------------------------------------------------------
    // PLAYBACK CONTROLS
    // -------------------------------------------------------------
    function play() {
        if (isPlaying) return;
        if (currentStepIdx >= currentTrace.length - 1) {
            currentStepIdx = 0;
            applyStep(0, false);
        }
        isPlaying = true;
        playIcon.textContent = '⏸';
        playText.textContent = 'Pause';
        btnPlay.classList.add('is-playing');

        scheduleNextFrame();
    }

    function pause() {
        if (!isPlaying) return;
        isPlaying = false;
        playIcon.textContent = '▶';
        playText.textContent = 'Play';
        btnPlay.classList.remove('is-playing');
        if (playTimer) clearTimeout(playTimer);
    }

    function togglePlay() {
        if (isPlaying) pause();
        else play();
    }

    function scheduleNextFrame() {
        if (!isPlaying) return;
        const baseDelay = 750 / speed;
        playTimer = setTimeout(() => {
            if (!isPlaying) return;
            if (currentStepIdx < currentTrace.length - 1) {
                applyStep(currentStepIdx + 1, true);
                scheduleNextFrame();
            } else {
                pause();
            }
        }, baseDelay);
    }

    function stepForward() {
        pause();
        if (currentStepIdx < currentTrace.length - 1) {
            applyStep(currentStepIdx + 1, true);
        }
    }

    function stepBackward() {
        pause();
        if (currentStepIdx > 0) {
            applyStep(currentStepIdx - 1, false);
        }
    }

    function jumpToFirst() {
        pause();
        applyStep(0, false);
    }

    function jumpToLast() {
        pause();
        applyStep(currentTrace.length - 1, false);
    }

    function reset() {
        pause();
        applyStep(0, false);
    }

    // -------------------------------------------------------------
    // INTERACTIVE NODE / CELL CLICK
    // -------------------------------------------------------------
    function handleElementSelect(index, val) {
        updateFormulaHud({ i: index }, currentArray.length);
        narrativeTitle.textContent = `Inspecting Node [${index}] = ${val}`;
        narrativeDesc.textContent = `Left child: ${2*index + 1 < currentArray.length ? 2*index + 1 : 'None'}, Right child: ${2*index + 2 < currentArray.length ? 2*index + 2 : 'None'}, Parent: ${index > 0 ? Math.floor((index - 1) / 2) : 'Root'}`;
        narrativeDescAr.textContent = `فحص العقدة [${index}] = ${val}. الابن الأيسر: ${2*index + 1 < currentArray.length ? 2*index + 1 : 'لا يوجد'}، الابن الأيمن: ${2*index + 2 < currentArray.length ? 2*index + 2 : 'لا يوجد'}، الأب: ${index > 0 ? Math.floor((index - 1)/2) : 'الجذر'}`;
    }

    treeRenderer.onNodeClick = handleElementSelect;
    arrayRenderer.onCellClick = handleElementSelect;

    // -------------------------------------------------------------
    // EVENT LISTENERS
    // -------------------------------------------------------------
    btnPlay.addEventListener('click', togglePlay);
    btnNext.addEventListener('click', stepForward);
    btnPrev.addEventListener('click', stepBackward);
    btnFirst.addEventListener('click', jumpToFirst);
    btnLast.addEventListener('click', jumpToLast);
    btnReset.addEventListener('click', reset);

    presetSelect.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
            customInputModal.classList.add('open');
            customNumbersInput.focus();
        } else {
            loadDataset(generatePreset(e.target.value));
        }
    });

    heapModeSelect.addEventListener('change', () => {
        loadDataset(currentArray);
    });

    btnRandomize.addEventListener('click', () => {
        const val = presetSelect.value === 'custom' ? 'random15' : presetSelect.value;
        loadDataset(generatePreset(val));
    });

    speedSlider.addEventListener('input', (e) => {
        speed = parseFloat(e.target.value);
        speedValue.textContent = `${speed.toFixed(2)}x`;
    });

    timelineScrubber.addEventListener('input', (e) => {
        pause();
        applyStep(parseInt(e.target.value, 10), false);
    });

    // Sound toggle
    function updateSoundUi() {
        if (window.soundEngine.muted) {
            soundIcon.textContent = '🔇';
            soundText.textContent = 'Muted';
        } else {
            soundIcon.textContent = '🔊';
            soundText.textContent = 'Sound ON';
        }
    }
    updateSoundUi();

    btnSoundToggle.addEventListener('click', () => {
        window.soundEngine.toggleMute();
        updateSoundUi();
    });

    // Theme toggle
    btnThemeToggle.addEventListener('click', () => {
        const html = document.documentElement;
        const isDark = html.getAttribute('data-theme') === 'dark';
        html.setAttribute('data-theme', isDark ? 'light' : 'dark');
        themeIcon.textContent = isDark ? '☀️' : '🌙';
        if (currentTrace.length > 0) applyStep(currentStepIdx, false);
    });

    // Help Modal
    btnHelpModal.addEventListener('click', () => helpModal.classList.add('open'));
    btnCloseHelp.addEventListener('click', () => helpModal.classList.remove('open'));
    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) helpModal.classList.remove('open');
    });

    // Custom Input Modal Handlers
    function closeCustomModal() {
        customInputModal.classList.remove('open');
        customInputError.style.display = 'none';
        if (presetSelect.value === 'custom') {
            presetSelect.value = 'random15';
        }
    }

    btnCloseCustom.addEventListener('click', closeCustomModal);
    btnCancelCustom.addEventListener('click', closeCustomModal);

    btnApplyCustom.addEventListener('click', () => {
        const raw = customNumbersInput.value.trim();
        const parts = raw.split(/[\s,]+/).filter(Boolean).map(Number);

        if (parts.length < 3 || parts.length > 31) {
            customInputError.textContent = 'Please enter between 3 and 31 numbers.';
            customInputError.style.display = 'block';
            return;
        }

        if (parts.some(isNaN)) {
            customInputError.textContent = 'All inputs must be valid integers.';
            customInputError.style.display = 'block';
            return;
        }

        customInputModal.classList.remove('open');
        customInputError.style.display = 'none';
        loadDataset(parts);
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
        // Ignore if typing in input
        if (e.target.tagName === 'INPUT' && e.target.type === 'text') return;

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                togglePlay();
                break;
            case 'ArrowRight':
            case 'KeyL':
                e.preventDefault();
                stepForward();
                break;
            case 'ArrowLeft':
            case 'KeyJ':
                e.preventDefault();
                stepBackward();
                break;
            case 'Home':
                e.preventDefault();
                jumpToFirst();
                break;
            case 'End':
                e.preventDefault();
                jumpToLast();
                break;
            case 'KeyR':
                e.preventDefault();
                reset();
                break;
            case 'KeyM':
                e.preventDefault();
                window.soundEngine.toggleMute();
                updateSoundUi();
                break;
            case 'KeyT':
                e.preventDefault();
                btnThemeToggle.click();
                break;
            case 'KeyS':
                e.preventDefault();
                btnRandomize.click();
                break;
            case 'Slash':
                if (e.shiftKey) { // '?' key
                    e.preventDefault();
                    helpModal.classList.toggle('open');
                }
                break;
            case 'Escape':
                helpModal.classList.remove('open');
                closeCustomModal();
                break;
        }
    });

    // -------------------------------------------------------------
    // INITIAL LOAD & URL PARAMS / HASH
    // -------------------------------------------------------------
    let targetStep = null;
    if (window.location.hash) {
        const hashMatch = window.location.hash.match(/step=(\d+)/);
        if (hashMatch) targetStep = parseInt(hashMatch[1], 10);
        if (window.location.hash.includes('theme=light')) {
            document.documentElement.setAttribute('data-theme', 'light');
            themeIcon.textContent = '☀️';
        }
    }
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('step')) {
        targetStep = parseInt(urlParams.get('step'), 10);
    }
    if (urlParams.get('theme') === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        themeIcon.textContent = '☀️';
    }

    const initialPreset = urlParams.get('preset') || 'random15';
    presetSelect.value = initialPreset in { random7:1, random15:1, random31:1, nearlySorted:1, reverse:1, fewUnique:1 } ? initialPreset : 'random15';
    
    loadDataset(generatePreset(presetSelect.value));

    if (targetStep !== null && !isNaN(targetStep)) {
        applyStep(targetStep, false);
    }
});
