/**
 * Main Controller for Sorting Visualizer
 * Orchestrates DOM rendering, Generator execution, Sound, and UI interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const barsContainer = document.getElementById('bars-container');
  const algoSelect = document.getElementById('algo-select');
  const datasetSelect = document.getElementById('dataset-select');
  const sizeSlider = document.getElementById('size-slider');
  const sizeValDisplay = document.getElementById('size-val');
  const speedSlider = document.getElementById('speed-slider');
  const speedValDisplay = document.getElementById('speed-val');

  const btnStart = document.getElementById('btn-start');
  const btnPause = document.getElementById('btn-pause');
  const btnStep = document.getElementById('btn-step');
  const btnShuffle = document.getElementById('btn-shuffle');
  const btnSound = document.getElementById('btn-sound');

  const statComparisons = document.getElementById('stat-comparisons');
  const statSwaps = document.getElementById('stat-swaps');
  const statTime = document.getElementById('stat-time');
  const statComplexity = document.getElementById('stat-complexity');
  const statusBeacon = document.getElementById('status-beacon');
  const statusText = document.getElementById('status-text');

  // State
  let array = [];
  let arraySize = parseInt(sizeSlider.value, 10);
  let animationSpeed = parseInt(speedSlider.value, 10);
  let activeGenerator = null;
  let isSorting = false;
  let isPaused = false;
  let comparisons = 0;
  let swaps = 0;
  let startTime = 0;
  let accumulatedTime = 0;
  let timerInterval = null;
  let currentPivotIndex = null;

  // Initialize
  updateComplexityBadge();
  generateArray();

  // Event Listeners
  sizeSlider.addEventListener('input', (e) => {
    arraySize = parseInt(e.target.value, 10);
    sizeValDisplay.textContent = arraySize;
    if (!isSorting) {
      generateArray();
    }
  });

  speedSlider.addEventListener('input', (e) => {
    animationSpeed = parseInt(e.target.value, 10);
    updateSpeedLabel(animationSpeed);
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
    statusText.textContent = 'Generated fresh array. Ready to sort.';
  });

  btnStart.addEventListener('click', () => {
    if (isSorting && isPaused) {
      // Resume
      resumeSorting();
    } else if (!isSorting) {
      // Start fresh
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

  // Array Generation
  function generateArray() {
    resetState();
    const distribution = datasetSelect.value;
    array = [];

    const minVal = 10;
    const maxVal = 100;

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
      // Swap a few random adjacent elements
      const numSwaps = Math.max(2, Math.floor(arraySize * 0.08));
      for (let s = 0; s < numSwaps; s++) {
        const idx = Math.floor(Math.random() * (arraySize - 1));
        const temp = array[idx];
        array[idx] = array[idx + 1];
        array[idx + 1] = temp;
      }
    }

    renderBars();
  }

  function renderBars() {
    barsContainer.innerHTML = '';
    const maxVal = Math.max(...array, 100);

    for (let i = 0; i < array.length; i++) {
      const bar = document.createElement('div');
      bar.className = 'bar';
      bar.dataset.index = i;
      bar.dataset.value = array[i];

      const heightPercent = (array[i] / maxVal) * 92 + 6;
      bar.style.height = `${heightPercent}%`;

      if (arraySize <= 45) {
        const valSpan = document.createElement('span');
        valSpan.className = 'bar-val';
        valSpan.textContent = array[i];
        bar.appendChild(valSpan);
      }

      barsContainer.appendChild(bar);
    }
  }

  function updateBar(index, value) {
    const bar = barsContainer.children[index];
    if (!bar) return;

    array[index] = value;
    bar.dataset.value = value;
    const maxVal = Math.max(...array, 100);
    const heightPercent = (value / maxVal) * 92 + 6;
    bar.style.height = `${heightPercent}%`;

    const valSpan = bar.querySelector('.bar-val');
    if (valSpan) {
      valSpan.textContent = value;
    }
  }

  function swapBars(i, j) {
    const valI = array[i];
    const valJ = array[j];
    updateBar(i, valJ);
    updateBar(j, valI);
  }

  // Sorting Control
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
    statusText.textContent = 'Sorting paused. Click Resume or Step.';
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

      const delay = calculateDelay(animationSpeed);
      if (delay > 0) {
        await new Promise(r => setTimeout(r, delay));
      }
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
    }

    const minVal = 10;
    const maxVal = 100;

    switch (step.type) {
      case 'compare': {
        comparisons++;
        statComparisons.textContent = comparisons.toLocaleString();

        const [i, j] = step.indices;
        const bar1 = barsContainer.children[i];
        const bar2 = barsContainer.children[j];

        if (bar1) bar1.classList.add('comparing');
        if (bar2) bar2.classList.add('comparing');

        const val1 = array[i] || 50;
        const val2 = array[j] || 50;
        window.soundEngine.playNote(Math.max(val1, val2), minVal, maxVal, Math.min(60, calculateDelay(animationSpeed)));
        break;
      }

      case 'swap': {
        swaps++;
        statSwaps.textContent = swaps.toLocaleString();

        const [i, j] = step.indices;
        swapBars(i, j);

        const bar1 = barsContainer.children[i];
        const bar2 = barsContainer.children[j];
        if (bar1) bar1.classList.add('swapping');
        if (bar2) bar2.classList.add('swapping');

        window.soundEngine.playSwapNote(array[i], array[j], minVal, maxVal);
        break;
      }

      case 'overwrite': {
        swaps++;
        statSwaps.textContent = swaps.toLocaleString();

        updateBar(step.index, step.value);
        const bar = barsContainer.children[step.index];
        if (bar) bar.classList.add('swapping');

        window.soundEngine.playNote(step.value, minVal, maxVal, 45, 'triangle');
        break;
      }

      case 'pivot': {
        currentPivotIndex = step.index;
        const pivotBar = barsContainer.children[step.index];
        if (pivotBar) pivotBar.classList.add('pivot');
        window.soundEngine.playNote(step.value, minVal, maxVal, 50, 'sawtooth');
        break;
      }

      case 'clear-pivot': {
        currentPivotIndex = null;
        const existingPivot = barsContainer.querySelector('.bar.pivot');
        if (existingPivot) existingPivot.classList.remove('pivot');
        break;
      }

      case 'range': {
        // Optional range spotlight
        break;
      }

      case 'mark-sorted': {
        step.indices.forEach(idx => {
          const bar = barsContainer.children[idx];
          if (bar) bar.classList.add('sorted');
        });
        break;
      }

      case 'slice-merged': {
        step.indices.forEach(idx => {
          const bar = barsContainer.children[idx];
          if (bar) {
            bar.classList.add('sorted');
            setTimeout(() => {
              if (isSorting) bar.classList.remove('sorted');
            }, 350);
          }
        });
        break;
      }

      case 'finish': {
        // Will be picked up by finishSorting
        break;
      }
    }
  }

  async function finishSorting() {
    isSorting = false;
    isPaused = false;
    activeGenerator = null;
    stopTimer();

    clearTemporaryStyles();
    statusBeacon.classList.remove('busy');
    statusText.textContent = `Completed! Processed ${comparisons.toLocaleString()} comparisons and ${swaps.toLocaleString()} swaps.`;

    setControlsState(false);
    btnPause.disabled = true;
    updatePauseButton(false);

    // Green Victory Sweep Animation across all bars
    const bars = Array.from(barsContainer.children);
    for (let i = 0; i < bars.length; i++) {
      bars[i].classList.add('sorted');
      window.soundEngine.playNote(array[i], 10, 100, 40, 'sine');
      await new Promise(r => setTimeout(r, Math.max(12, 400 / bars.length)));
    }

    await window.soundEngine.playVictorySweep();
  }

  function clearTemporaryStyles() {
    const comparings = barsContainer.querySelectorAll('.bar.comparing');
    comparings.forEach(el => el.classList.remove('comparing'));

    const swappings = barsContainer.querySelectorAll('.bar.swapping');
    swappings.forEach(el => el.classList.remove('swapping'));

    // Preserve pivot if still active
    if (currentPivotIndex !== null) {
      const pivotBar = barsContainer.children[currentPivotIndex];
      if (pivotBar && !pivotBar.classList.contains('pivot')) {
        pivotBar.classList.add('pivot');
      }
    }
  }

  function resetState() {
    isSorting = false;
    isPaused = false;
    activeGenerator = null;
    currentPivotIndex = null;
    stopTimer();

    comparisons = 0;
    swaps = 0;
    accumulatedTime = 0;
    statComparisons.textContent = '0';
    statSwaps.textContent = '0';
    statTime.textContent = '0.00s';

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

    Array.from(barsContainer.children).forEach(b => {
      b.className = 'bar';
    });
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

  function calculateDelay(speedVal) {
    // Map slider 5..150 to delay: 5 -> 180ms, 150 -> 2ms
    return Math.max(2, Math.round(190 - (speedVal * 1.25)));
  }

  function updateSpeedLabel(val) {
    if (val < 35) speedValDisplay.textContent = 'Slow';
    else if (val < 90) speedValDisplay.textContent = 'Medium';
    else if (val < 135) speedValDisplay.textContent = 'Fast';
    else speedValDisplay.textContent = 'Turbo ⚡';
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
        statComplexity.style.color = '#ef4444';
      } else {
        statComplexity.textContent = 'O(n log n) [Avg]';
        statComplexity.style.color = '#c084fc';
      }
    } else if (algo === 'quickSortRandom') {
      statComplexity.textContent = 'O(n log n) [Expected]';
      statComplexity.style.color = '#10b981';
    }
  }
});
