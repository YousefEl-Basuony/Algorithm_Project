/**
 * Main Controller for Sorting Visualizer & Empirical Analytics
 * Orchestrates DOM rendering, Generator execution, Educational Tempo, and Real-time Statistics.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const barsContainer = document.getElementById('bars-container');
  const algoSelect = document.getElementById('algo-select');
  const datasetSelect = document.getElementById('dataset-select');
  const sizeSlider = document.getElementById('size-slider');
  const sizeValDisplay = document.getElementById('size-val');

  const btnStart = document.getElementById('btn-start');
  const btnPause = document.getElementById('btn-pause');
  const btnStep = document.getElementById('btn-step');
  const btnShuffle = document.getElementById('btn-shuffle');
  const btnSound = document.getElementById('btn-sound');
  const btnClearHistory = document.getElementById('btn-clear-history');

  const statComparisons = document.getElementById('stat-comparisons');
  const statSwaps = document.getElementById('stat-swaps');
  const statTime = document.getElementById('stat-time');
  const statComplexity = document.getElementById('stat-complexity');
  const statusBeacon = document.getElementById('status-beacon');
  const statusText = document.getElementById('status-text');

  const codeHudLine = document.getElementById('code-hud-line');
  const codeHudDesc = document.getElementById('code-hud-desc');

  // Analytics Elements
  const analyticsCompCount = document.getElementById('analytics-comp-count');
  const analyticsCompBar = document.getElementById('analytics-comp-bar');
  const analyticsSwapCount = document.getElementById('analytics-swap-count');
  const analyticsSwapBar = document.getElementById('analytics-swap-bar');
  const analyticsWorstCap = document.getElementById('analytics-worst-cap');

  const efficiencyIcon = document.getElementById('efficiency-icon');
  const efficiencyTitle = document.getElementById('efficiency-title');
  const efficiencyDesc = document.getElementById('efficiency-desc');
  const valTheoreticalLog = document.getElementById('val-theoretical-log');
  const valTheoreticalQuad = document.getElementById('val-theoretical-quad');
  const valEfficiencyDelta = document.getElementById('val-efficiency-delta');
  const historyList = document.getElementById('history-list');

  // State
  let array = [];
  let arraySize = parseInt(sizeSlider.value, 10) || 10;
  
  // Perfectly tuned educational pacing: 480ms per step
  // Slow enough to clearly see pointer movements, bar elevations, and read code lines!
  const EDUCATIONAL_DELAY = 480;

  let activeGenerator = null;
  let isSorting = false;
  let isPaused = false;
  let comparisons = 0;
  let swaps = 0;
  let startTime = 0;
  let accumulatedTime = 0;
  let timerInterval = null;

  // Active Pointers
  let activePivotIdx = null;
  let activeI = null;
  let activeJ = null;

  // History Runs Array
  let benchmarkHistory = [];

  // Initialize
  updateComplexityBadge();
  updateTheoreticalCaps();
  generateArray();

  // Event Listeners
  sizeSlider.addEventListener('input', (e) => {
    arraySize = parseInt(e.target.value, 10);
    sizeValDisplay.textContent = arraySize;
    updateTheoreticalCaps();
    if (!isSorting) {
      generateArray();
    }
  });

  datasetSelect.addEventListener('change', () => {
    if (!isSorting) {
      generateArray();
    }
    updateComplexityBadge();
  });

  algoSelect.addEventListener('change', () => {
    updateComplexityBadge();
  });

  btnShuffle.addEventListener('click', () => {
    resetState();
    generateArray();
    statusText.textContent = `Generated fresh array with ${arraySize} elements. Ready.`;
    codeHudLine.textContent = `// Array randomized: [${array.join(', ')}]`;
    codeHudDesc.textContent = `Ready to sort at educational pace`;
  });

  btnStart.addEventListener('click', () => {
    if (isSorting && isPaused) {
      resumeSorting();
    } else if (!isSorting) {
      startSorting();
    }
  });

  btnPause.addEventListener('click', () => {
    if (isSorting) {
      if (isPaused) {
        resumeSorting();
      } else {
        pauseSorting();
      }
    }
  });

  btnStep.addEventListener('click', async () => {
    if (!isSorting) {
      initGenerator();
      isSorting = true;
      isPaused = true;
      setControlsState(true);
      btnPause.disabled = false;
      updatePauseButton(true);
      startTimer();
    } else if (!isPaused) {
      pauseSorting();
    }
    await stepForward();
  });

  btnSound.addEventListener('click', () => {
    const isMuted = window.soundEngine.toggleMute();
    btnSound.classList.toggle('active', !isMuted);
    btnSound.title = isMuted ? 'Sound Muted (Click to enable)' : 'Sound Enabled (Click to mute)';
  });

  btnClearHistory.addEventListener('click', () => {
    benchmarkHistory = [];
    renderHistory();
  });

  // Array Generation
  function generateArray() {
    resetState();
    const distribution = datasetSelect.value;
    array = [];

    const minVal = 12;
    const maxVal = 99;

    if (distribution === 'random') {
      for (let i = 0; i < arraySize; i++) {
        array.push(Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal);
      }
    } else if (distribution === 'reversed') {
      const step = (maxVal - minVal) / (arraySize - 1 || 1);
      for (let i = 0; i < arraySize; i++) {
        array.push(Math.round(maxVal - i * step));
      }
    } else if (distribution === 'sorted') {
      const step = (maxVal - minVal) / (arraySize - 1 || 1);
      for (let i = 0; i < arraySize; i++) {
        array.push(Math.round(minVal + i * step));
      }
    } else if (distribution === 'nearlySorted') {
      const step = (maxVal - minVal) / (arraySize - 1 || 1);
      for (let i = 0; i < arraySize; i++) {
        array.push(Math.round(minVal + i * step));
      }
      const numSwaps = Math.max(1, Math.floor(arraySize * 0.15));
      for (let s = 0; s < numSwaps; s++) {
        const idx = Math.floor(Math.random() * (arraySize - 1));
        const temp = array[idx];
        array[idx] = array[idx + 1];
        array[idx + 1] = temp;
      }
    }

    renderPillars();
  }

  function renderPillars() {
    barsContainer.innerHTML = '';
    const maxVal = Math.max(...array, 100);

    for (let i = 0; i < array.length; i++) {
      const pillar = document.createElement('div');
      pillar.className = 'pillar-column';
      pillar.dataset.index = i;

      const bar = document.createElement('div');
      bar.className = 'bar-element';
      bar.dataset.value = array[i];

      const heightPercent = (array[i] / maxVal) * 80 + 12;
      bar.style.height = `${heightPercent}%`;

      const numSpan = document.createElement('span');
      numSpan.className = 'bar-number';
      numSpan.textContent = array[i];
      bar.appendChild(numSpan);

      const idxSpan = document.createElement('span');
      idxSpan.className = 'bar-index';
      idxSpan.textContent = `#${i}`;

      const pointerSpan = document.createElement('span');
      pointerSpan.className = 'pointer-badge';
      pointerSpan.id = `pointer-${i}`;

      pillar.appendChild(bar);
      pillar.appendChild(idxSpan);
      pillar.appendChild(pointerSpan);

      barsContainer.appendChild(pillar);
    }

    if (arraySize <= 12) {
      barsContainer.style.gap = '16px';
    } else if (arraySize <= 22) {
      barsContainer.style.gap = '8px';
    } else {
      barsContainer.style.gap = '4px';
    }
  }

  function updatePillar(index, value) {
    const pillar = barsContainer.children[index];
    if (!pillar) return;

    array[index] = value;
    const bar = pillar.querySelector('.bar-element');
    const numSpan = pillar.querySelector('.bar-number');

    if (bar && numSpan) {
      bar.dataset.value = value;
      numSpan.textContent = value;
      const maxVal = Math.max(...array, 100);
      const heightPercent = (value / maxVal) * 80 + 12;
      bar.style.height = `${heightPercent}%`;
    }
  }

  function swapPillars(i, j) {
    const valI = array[i];
    const valJ = array[j];
    updatePillar(i, valJ);
    updatePillar(j, valI);
  }

  // Pointer Visualizer Engine
  function updatePointers(pivot = null, i = null, j = null) {
    activePivotIdx = pivot;
    activeI = i;
    activeJ = j;

    for (let idx = 0; idx < arraySize; idx++) {
      const pointer = document.getElementById(`pointer-${idx}`);
      if (!pointer) continue;

      if (idx === pivot) {
        pointer.className = 'pointer-badge pivot-tag show';
        pointer.textContent = '👑 PIVOT';
      } else if (idx === j) {
        pointer.className = 'pointer-badge j-tag show';
        pointer.textContent = `🔎 j=${idx}`;
      } else if (idx === i) {
        pointer.className = 'pointer-badge i-tag show';
        pointer.textContent = `👆 i=${idx}`;
      } else {
        pointer.className = 'pointer-badge';
        pointer.textContent = '';
      }
    }
  }

  function clearPointers() {
    activePivotIdx = null;
    activeI = null;
    activeJ = null;
    for (let idx = 0; idx < arraySize; idx++) {
      const pointer = document.getElementById(`pointer-${idx}`);
      if (pointer) {
        pointer.className = 'pointer-badge';
        pointer.textContent = '';
      }
    }
  }

  // Sorting Control Loop
  function initGenerator() {
    const algoName = algoSelect.value;
    const algoFunc = window.Algorithms[algoName];
    if (algoFunc) {
      activeGenerator = algoFunc(array);
    }
  }

  async function startSorting() {
    window.soundEngine.init();
    resetStatsOnly();
    initGenerator();

    isSorting = true;
    isPaused = false;
    setControlsState(true);
    btnPause.disabled = false;
    updatePauseButton(false);
    statusBeacon.classList.add('busy');

    startTimer();
    runSortLoop();
  }

  function pauseSorting() {
    isPaused = true;
    updatePauseButton(true);
    stopTimer();
    statusText.textContent = 'Paused. Step forward or click Resume.';
    statusBeacon.classList.remove('busy');
  }

  function resumeSorting() {
    isPaused = false;
    updatePauseButton(false);
    startTimer();
    statusBeacon.classList.add('busy');
    runSortLoop();
  }

  async function runSortLoop() {
    while (isSorting && !isPaused && activeGenerator) {
      const result = await stepForward();
      if (result.done) break;

      // Steady human-comprehensible delay
      await new Promise(r => setTimeout(r, EDUCATIONAL_DELAY));
    }
  }

  async function stepForward() {
    if (!activeGenerator) return { done: true };

    const { value: step, done } = activeGenerator.next();

    if (done || !step) {
      await finishSorting();
      return { done: true };
    }

    handleStep(step);
    return { done: false, step };
  }

  function handleStep(step) {
    clearTemporaryStyles();

    if (step.description) {
      statusText.textContent = step.description;
      codeHudDesc.textContent = step.description;
    }

    if (step.codeLine) {
      codeHudLine.textContent = step.codeLine;
    }

    const minVal = 10;
    const maxVal = 99;

    if (step.low !== undefined && step.high !== undefined) {
      Array.from(barsContainer.children).forEach((pillar, idx) => {
        if (idx >= step.low && idx <= step.high) {
          pillar.classList.add('active-range');
        } else {
          pillar.classList.remove('active-range');
        }
      });
    }

    if (step.pivot !== undefined || step.i !== undefined || step.j !== undefined) {
      updatePointers(
        step.pivot !== undefined ? step.pivot : activePivotIdx,
        step.i !== undefined ? step.i : activeI,
        step.j !== undefined ? step.j : activeJ
      );
    }

    switch (step.type) {
      case 'compare': {
        comparisons++;
        updateAnalytics();

        const [i, j] = step.indices;
        const bar1 = getBar(i);
        const bar2 = getBar(j);

        if (bar1) bar1.classList.add('comparing');
        if (bar2) bar2.classList.add('comparing');

        const val1 = array[i] || 50;
        const val2 = array[j] || 50;
        window.soundEngine.playNote(Math.max(val1, val2), minVal, maxVal, 90);
        break;
      }

      case 'swap': {
        swaps++;
        updateAnalytics();

        const [i, j] = step.indices;
        swapPillars(i, j);

        const bar1 = getBar(i);
        const bar2 = getBar(j);
        if (bar1) bar1.classList.add('swapping');
        if (bar2) bar2.classList.add('swapping');

        window.soundEngine.playSwapNote(array[i], array[j], minVal, maxVal);
        break;
      }

      case 'overwrite': {
        swaps++;
        updateAnalytics();

        updatePillar(step.index, step.value);
        const bar = getBar(step.index);
        if (bar) bar.classList.add('swapping');

        window.soundEngine.playNote(step.value, minVal, maxVal, 70, 'triangle');
        break;
      }

      case 'pivot': {
        activePivotIdx = step.index;
        const pivotBar = getBar(step.index);
        if (pivotBar) pivotBar.classList.add('pivot');
        updatePointers(activePivotIdx, activeI, activeJ);
        window.soundEngine.playPivotChime(step.value, minVal, maxVal);
        break;
      }

      case 'clear-pivot': {
        activePivotIdx = null;
        const existingPivot = barsContainer.querySelector('.bar-element.pivot');
        if (existingPivot) existingPivot.classList.remove('pivot');
        updatePointers(null, activeI, activeJ);
        break;
      }

      case 'mark-sorted': {
        step.indices.forEach(idx => {
          const bar = getBar(idx);
          if (bar) bar.classList.add('sorted');
        });
        break;
      }

      case 'slice-merged': {
        step.indices.forEach(idx => {
          const bar = getBar(idx);
          if (bar) {
            bar.classList.add('sorted');
            setTimeout(() => {
              if (isSorting) bar.classList.remove('sorted');
            }, 400);
          }
        });
        break;
      }

      case 'finish': {
        break;
      }
    }
  }

  function getBar(index) {
    const pillar = barsContainer.children[index];
    return pillar ? pillar.querySelector('.bar-element') : null;
  }

  // Update Statistical Metrics
  function updateAnalytics() {
    statComparisons.textContent = comparisons.toLocaleString();
    statSwaps.textContent = swaps.toLocaleString();

    const worstCap = (arraySize * (arraySize - 1)) / 2;
    analyticsCompCount.textContent = `${comparisons} ops`;
    analyticsSwapCount.textContent = `${swaps} ops`;

    const compPercent = Math.min(100, (comparisons / worstCap) * 100);
    const swapPercent = Math.min(100, (swaps / worstCap) * 100);

    analyticsCompBar.style.width = `${compPercent}%`;
    analyticsSwapBar.style.width = `${swapPercent}%`;
  }

  function updateTheoreticalCaps() {
    const n = arraySize;
    const theoreticalLog = Math.round(n * Math.log2(n));
    const theoreticalQuad = (n * (n - 1)) / 2;

    valTheoreticalLog.textContent = `~${theoreticalLog} ops`;
    valTheoreticalQuad.textContent = `${theoreticalQuad} ops`;
    analyticsWorstCap.textContent = `${theoreticalQuad} ops`;
  }

  async function finishSorting() {
    isSorting = false;
    isPaused = false;
    activeGenerator = null;
    stopTimer();

    clearTemporaryStyles();
    clearPointers();
    statusBeacon.classList.remove('busy');

    const totalSeconds = ((accumulatedTime) / 1000).toFixed(2);
    statusText.textContent = `Completed! ${comparisons} comparisons & ${swaps} swaps in ${totalSeconds}s.`;
    codeHudLine.textContent = `// Done: Execution statistics compiled in Analytics panel`;
    codeHudDesc.textContent = `All elements verified`;

    setControlsState(false);
    btnPause.disabled = true;
    updatePauseButton(false);

    evaluateFinalEfficiency();
    logBenchmarkRun(totalSeconds);

    // Green Victory Ripple
    const pillars = Array.from(barsContainer.children);
    for (let i = 0; i < pillars.length; i++) {
      const bar = pillars[i].querySelector('.bar-element');
      if (bar) {
        bar.classList.add('sorted');
        bar.style.transform = 'translateY(-14px) scale(1.06)';
        setTimeout(() => {
          bar.style.transform = 'none';
        }, 300);
      }
      window.soundEngine.playNote(array[i], 10, 100, 60, 'sine');
      await new Promise(r => setTimeout(r, Math.max(30, 320 / pillars.length)));
    }

    await window.soundEngine.playVictorySweep();
  }

  function evaluateFinalEfficiency() {
    const n = arraySize;
    const theoreticalLog = Math.round(n * Math.log2(n));
    const theoreticalQuad = (n * (n - 1)) / 2;

    const deltaPercent = Math.round(((comparisons - theoreticalLog) / theoreticalLog) * 100);
    valEfficiencyDelta.textContent = deltaPercent > 0 ? `+${deltaPercent}%` : `${deltaPercent}%`;

    if (comparisons >= theoreticalQuad * 0.85) {
      efficiencyIcon.textContent = '🚨';
      efficiencyTitle.textContent = 'O(n²) Worst-Case Trap Triggered!';
      efficiencyTitle.style.color = 'var(--neon-crimson)';
      efficiencyDesc.textContent = `Partition degenerate: required ${comparisons} comparisons (near the ${theoreticalQuad} theoretical ceiling).`;
      valEfficiencyDelta.style.color = 'var(--neon-crimson)';
    } else if (comparisons <= theoreticalLog * 1.35) {
      efficiencyIcon.textContent = '⚡';
      efficiencyTitle.textContent = 'Optimal Divide & Conquer!';
      efficiencyTitle.style.color = 'var(--neon-emerald)';
      efficiencyDesc.textContent = `Flawless balance: completed in only ${comparisons} comparisons, perfectly conforming to O(n log n).`;
      valEfficiencyDelta.style.color = 'var(--neon-emerald)';
    } else {
      efficiencyIcon.textContent = '📈';
      efficiencyTitle.textContent = 'Average Case Equilibrium';
      efficiencyTitle.style.color = 'var(--neon-gold)';
      efficiencyDesc.textContent = `Balanced partition: required ${comparisons} comparisons against theoretical ~${theoreticalLog} target.`;
      valEfficiencyDelta.style.color = 'var(--neon-gold)';
    }
  }

  function logBenchmarkRun(timeSec) {
    const algoName = algoSelect.options[algoSelect.selectedIndex].text.split('(')[0].trim();
    const dataset = datasetSelect.options[datasetSelect.selectedIndex].text.split('(')[0].trim();

    const record = {
      algo: algoName,
      dataset: dataset,
      comparisons: comparisons,
      swaps: swaps,
      time: `${timeSec}s`
    };

    benchmarkHistory.unshift(record);
    if (benchmarkHistory.length > 5) benchmarkHistory.pop();
    renderHistory();
  }

  function renderHistory() {
    if (benchmarkHistory.length === 0) {
      historyList.innerHTML = `<div class="history-empty">No runs recorded yet. Click <strong>Start</strong> to generate benchmark data.</div>`;
      return;
    }

    historyList.innerHTML = '';
    benchmarkHistory.forEach(item => {
      const row = document.createElement('div');
      row.className = 'history-item';
      row.innerHTML = `
        <span class="algo-tag">${item.algo} <small style="color:var(--text-dim);">[${item.dataset}]</small></span>
        <span class="stats-tag">${item.comparisons} comps | ${item.swaps} swaps (${item.time})</span>
      `;
      historyList.appendChild(row);
    });
  }

  function clearTemporaryStyles() {
    const comparings = barsContainer.querySelectorAll('.bar-element.comparing');
    comparings.forEach(el => el.classList.remove('comparing'));

    const swappings = barsContainer.querySelectorAll('.bar-element.swapping');
    swappings.forEach(el => el.classList.remove('swapping'));

    if (activePivotIdx !== null) {
      const pivotBar = getBar(activePivotIdx);
      if (pivotBar && !pivotBar.classList.contains('pivot')) {
        pivotBar.classList.add('pivot');
      }
    }
  }

  function resetState() {
    isSorting = false;
    isPaused = false;
    activeGenerator = null;
    clearPointers();
    stopTimer();

    comparisons = 0;
    swaps = 0;
    accumulatedTime = 0;
    statComparisons.textContent = '0';
    statSwaps.textContent = '0';
    statTime.textContent = '0.00s';

    analyticsCompCount.textContent = '0 ops';
    analyticsSwapCount.textContent = '0 ops';
    analyticsCompBar.style.width = '0%';
    analyticsSwapBar.style.width = '0%';

    statusBeacon.classList.remove('busy');
    setControlsState(false);
    btnPause.disabled = true;
    updatePauseButton(false);
  }

  function resetStatsOnly() {
    comparisons = 0;
    swaps = 0;
    accumulatedTime = 0;
    statComparisons.textContent = '0';
    statSwaps.textContent = '0';
    statTime.textContent = '0.00s';

    analyticsCompCount.textContent = '0 ops';
    analyticsSwapCount.textContent = '0 ops';
    analyticsCompBar.style.width = '0%';
    analyticsSwapBar.style.width = '0%';

    Array.from(barsContainer.children).forEach(pillar => {
      pillar.classList.remove('active-range');
      const bar = pillar.querySelector('.bar-element');
      if (bar) bar.className = 'bar-element';
    });
    clearPointers();
  }

  function setControlsState(sortingActive) {
    algoSelect.disabled = sortingActive;
    datasetSelect.disabled = sortingActive;
    sizeSlider.disabled = sortingActive;
    btnStart.disabled = sortingActive;
    btnShuffle.disabled = sortingActive;
  }

  function updatePauseButton(paused) {
    const pauseLabel = document.getElementById('pause-label');
    const pauseIcon = document.getElementById('icon-pause');
    if (paused) {
      pauseLabel.textContent = 'Resume';
      pauseIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
    } else {
      pauseLabel.textContent = 'Pause';
      pauseIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
    }
  }

  function startTimer() {
    startTime = performance.now();
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      const now = performance.now();
      const totalSec = (accumulatedTime + (now - startTime)) / 1000;
      statTime.textContent = `${totalSec.toFixed(2)}s`;
    }, 40);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
      accumulatedTime += performance.now() - startTime;
    }
  }

  function updateComplexityBadge() {
    const algo = algoSelect.value;
    const dataset = datasetSelect.value;

    if (algo === 'mergeSort') {
      statComplexity.textContent = 'O(n log n)';
      statComplexity.style.color = '#38bdf8';
    } else if (algo === 'quickSort') {
      if (dataset === 'reversed' || dataset === 'sorted') {
        statComplexity.textContent = 'O(n²) [Worst Case!]';
        statComplexity.style.color = '#ff3366';
      } else {
        statComplexity.textContent = 'O(n log n) [Avg]';
        statComplexity.style.color = '#a855f7';
      }
    } else if (algo === 'quickSortRandom') {
      statComplexity.textContent = 'O(n log n) [Safe]';
      statComplexity.style.color = '#10b981';
    }
  }
});
