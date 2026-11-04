/**
 * UI Controller for Graph Visualizer
 * Manages timeline playback, live queue/stack rendering,
 * pseudocode line highlighting, graph metrics, and user shortcuts.
 */

class UIController {
  constructor(graph, graphCanvas) {
    this.graph = graph;
    this.canvas = graphCanvas;

    // Algorithm & Traversal state
    this.currentAlgorithm = 'bfs'; // 'bfs' | 'dfs'
    this.timeline = [];
    this.currentStepIndex = 0;
    this.isPlaying = false;
    this.playInterval = null;
    this.speed = 1; // 1x default

    // DOM Elements
    this.dom = {
      // Top bar
      algoSelect: document.getElementById('algo-select'),
      startNodeSelect: document.getElementById('start-node-select'),
      directedToggle: document.getElementById('directed-toggle'),
      presetsSelect: document.getElementById('presets-select'),
      soundBtn: document.getElementById('sound-btn'),
      helpBtn: document.getElementById('help-btn'),
      exportImgBtn: document.getElementById('export-img-btn'),
      shareBtn: document.getElementById('share-btn'),

      // Left Toolbar
      toolSelect: document.getElementById('tool-select'),
      toolNode: document.getElementById('tool-node'),
      toolEdge: document.getElementById('tool-edge'),
      toolErase: document.getElementById('tool-erase'),
      toolClear: document.getElementById('tool-clear'),
      toolFit: document.getElementById('tool-fit'),
      toolUndo: document.getElementById('tool-undo'),
      toolRedo: document.getElementById('tool-redo'),

      // Bottom Playback
      btnPlayPause: document.getElementById('play-pause-btn'),
      btnStepBack: document.getElementById('step-back-btn'),
      btnStepForward: document.getElementById('step-forward-btn'),
      btnReset: document.getElementById('reset-btn'),
      timelineScrubber: document.getElementById('timeline-scrubber'),
      stepCounter: document.getElementById('step-counter'),
      speedBtns: document.querySelectorAll('.speed-btn'),

      // Right Panel
      dataStructureTitle: document.getElementById('ds-title'),
      dataStructureContainer: document.getElementById('ds-container'),
      pseudocodeContainer: document.getElementById('pseudocode-lines'),
      stepDescription: document.getElementById('step-description'),
      traversalPath: document.getElementById('traversal-path'),
      panelToggle: document.getElementById('panel-toggle'),
      inspectorPanel: document.getElementById('inspector-panel'),
      restorePanelBtn: document.getElementById('restore-panel-btn'),

      // Metrics
      metricNodes: document.getElementById('metric-nodes'),
      metricEdges: document.getElementById('metric-edges'),
      metricDensity: document.getElementById('metric-density'),
      metricComponents: document.getElementById('metric-components'),

      // Modals
      helpModal: document.getElementById('help-modal'),
      closeHelpBtn: document.getElementById('close-help-btn'),
      shareModal: document.getElementById('share-modal'),
      closeShareBtn: document.getElementById('close-share-btn'),
      graphJsonArea: document.getElementById('graph-json-area'),
      importJsonBtn: document.getElementById('import-json-btn'),
      copyJsonBtn: document.getElementById('copy-json-btn')
    };

    this.init();
  }

  init() {
    this.renderPseudocode();
    this.updateStartNodeOptions();
    this.updateMetrics();
    this.rebuildTimeline();

    this.bindEvents();
    this.bindShortcuts();
  }

  rebuildTimeline() {
    this.pause();
    const startId = parseInt(this.dom.startNodeSelect.value) || this.canvas.startNodeId;
    if (!this.graph.getNode(startId)) {
      const allNodes = this.graph.getAllNodes();
      if (allNodes.length > 0) {
        this.canvas.setStartNode(allNodes[0].id);
        this.dom.startNodeSelect.value = allNodes[0].id;
      }
    }

    const effectiveStartId = this.canvas.startNodeId;

    if (this.currentAlgorithm === 'bfs') {
      this.timeline = AlgorithmEngine.generateBFSTimeline(this.graph, effectiveStartId);
    } else {
      this.timeline = AlgorithmEngine.generateDFSTimeline(this.graph, effectiveStartId);
    }

    this.dom.timelineScrubber.max = Math.max(0, this.timeline.length - 1);
    this.goToStep(0);
  }

  goToStep(index) {
    if (this.timeline.length === 0) {
      this.currentStepIndex = 0;
      this.canvas.clearTraversal();
      this.dom.stepCounter.textContent = '0 / 0';
      this.dom.timelineScrubber.value = 0;
      this.dom.stepDescription.textContent = 'No graph nodes available. Click "Add Node" to draw on canvas or pick a preset.';
      this.dom.traversalPath.innerHTML = '<span class="empty-path">None</span>';
      this.renderDataStructure([]);
      this.highlightPseudocode(null);
      return;
    }

    const clampedIndex = Math.max(0, Math.min(index, this.timeline.length - 1));
    this.currentStepIndex = clampedIndex;
    const step = this.timeline[clampedIndex];

    // Update Canvas
    this.canvas.setTraversalStep(step);

    // Play step sound if enabled
    if (step.soundEffect && window.soundEngine) {
      if (step.soundEffect === 'visitNode') {
        const order = step.traversalOrder ? step.traversalOrder.length : 0;
        window.soundEngine.visitNode(order);
      } else if (typeof window.soundEngine[step.soundEffect] === 'function') {
        window.soundEngine[step.soundEffect]();
      }
    }

    // Update UI controls
    this.dom.timelineScrubber.value = clampedIndex;
    this.dom.stepCounter.textContent = `${clampedIndex} / ${this.timeline.length - 1}`;
    this.dom.stepDescription.textContent = step.description;

    // Update Data Structure Panel (Queue vs Stack)
    this.renderDataStructure(step.dataStructure);

    // Update Pseudocode highlight
    this.highlightPseudocode(step.codeLine);

    // Update Traversal sequence chips
    this.renderTraversalSequence(step.traversalOrder);
  }

  stepForward() {
    if (this.currentStepIndex < this.timeline.length - 1) {
      this.goToStep(this.currentStepIndex + 1);
      return true;
    } else {
      this.pause();
      return false;
    }
  }

  stepBackward() {
    if (this.currentStepIndex > 0) {
      this.goToStep(this.currentStepIndex - 1);
      return true;
    }
    return false;
  }

  play() {
    if (this.timeline.length <= 1) return;
    if (this.currentStepIndex >= this.timeline.length - 1) {
      this.goToStep(0);
    }
    this.isPlaying = true;
    this.updatePlayPauseBtn();

    const delay = Math.round(900 / this.speed);
    clearInterval(this.playInterval);
    this.playInterval = setInterval(() => {
      const hasNext = this.stepForward();
      if (!hasNext) {
        this.pause();
      }
    }, delay);
  }

  pause() {
    this.isPlaying = false;
    clearInterval(this.playInterval);
    this.playInterval = null;
    this.updatePlayPauseBtn();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  updatePlayPauseBtn() {
    if (this.isPlaying) {
      this.dom.btnPlayPause.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" rx="1.5"/>
          <rect x="14" y="4" width="4" height="16" rx="1.5"/>
        </svg>
        <span>Pause</span>
      `;
      this.dom.btnPlayPause.classList.add('active');
    } else {
      this.dom.btnPlayPause.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
        <span>Play</span>
      `;
      this.dom.btnPlayPause.classList.remove('active');
    }
  }

  setSpeed(speedVal) {
    this.speed = speedVal;
    this.dom.speedBtns.forEach(btn => {
      btn.classList.toggle('active', parseFloat(btn.dataset.speed) === speedVal);
    });
    if (this.isPlaying) {
      this.play(); // reset interval with new speed
    }
  }

  renderDataStructure(elements) {
    const isQueue = this.currentAlgorithm === 'bfs';
    this.dom.dataStructureTitle.textContent = isQueue ? 'Queue (FIFO Tracker)' : 'Stack (LIFO Tracker)';

    const container = this.dom.dataStructureContainer;
    container.innerHTML = '';
    container.className = isQueue ? 'ds-queue-mode' : 'ds-stack-mode';

    if (!elements || elements.length === 0) {
      container.innerHTML = '<div class="ds-empty">Structure is currently empty</div>';
      return;
    }

    if (isQueue) {
      // Horizontal queue: Left is FRONT (dequeue), Right is REAR (enqueue)
      const wrapper = document.createElement('div');
      wrapper.className = 'queue-track';

      elements.forEach((nodeId, idx) => {
        const node = this.graph.getNode(nodeId);
        if (!node) return;

        const item = document.createElement('div');
        item.className = 'ds-item queue-item';
        if (idx === 0) item.classList.add('is-head');
        if (idx === elements.length - 1) item.classList.add('is-tail');

        item.innerHTML = `
          <span class="ds-val">${node.label}</span>
          ${idx === 0 ? '<span class="ds-tag head-tag">FRONT</span>' : ''}
          ${idx === elements.length - 1 && elements.length > 1 ? '<span class="ds-tag tail-tag">REAR</span>' : ''}
        `;
        wrapper.appendChild(item);
      });
      container.appendChild(wrapper);
    } else {
      // Vertical stack: Top is TOP (push/pop), Bottom is BASE
      const wrapper = document.createElement('div');
      wrapper.className = 'stack-track';

      // DFS stack: top is the last element
      const reversedElements = [...elements].reverse();
      reversedElements.forEach((nodeId, idx) => {
        const node = this.graph.getNode(nodeId);
        if (!node) return;

        const item = document.createElement('div');
        item.className = 'ds-item stack-item';
        if (idx === 0) item.classList.add('is-top');

        item.innerHTML = `
          <span class="ds-val">${node.label}</span>
          ${idx === 0 ? '<span class="ds-tag top-tag">TOP</span>' : ''}
        `;
        wrapper.appendChild(item);
      });
      container.appendChild(wrapper);
    }
  }

  renderPseudocode() {
    const meta = ALGORITHM_METADATA[this.currentAlgorithm];
    const container = this.dom.pseudocodeContainer;
    container.innerHTML = '';

    meta.pseudocode.forEach((line, idx) => {
      const lineNum = idx + 1;
      const row = document.createElement('div');
      row.className = 'code-row';
      row.dataset.line = lineNum;

      row.innerHTML = `
        <span class="code-num">${lineNum}</span>
        <span class="code-text">${this.escapeHTML(line)}</span>
      `;
      container.appendChild(row);
    });
  }

  highlightPseudocode(lineNum) {
    const rows = this.dom.pseudocodeContainer.querySelectorAll('.code-row');
    rows.forEach(r => {
      const num = parseInt(r.dataset.line);
      r.classList.toggle('highlighted', num === lineNum);
    });
  }

  renderTraversalSequence(order) {
    if (!order || order.length === 0) {
      this.dom.traversalPath.innerHTML = '<span class="empty-path">Awaiting start...</span>';
      return;
    }

    this.dom.traversalPath.innerHTML = order
      .map((label, idx) => `<span class="path-badge">${label}</span>`)
      .join('<span class="path-arrow">➔</span>');
  }

  updateStartNodeOptions() {
    const select = this.dom.startNodeSelect;
    const currentVal = parseInt(select.value);
    select.innerHTML = '';

    const nodes = this.graph.getAllNodes();
    if (nodes.length === 0) {
      select.innerHTML = '<option value="">No nodes</option>';
      return;
    }

    nodes.sort((a, b) => a.label.localeCompare(b.label));

    nodes.forEach(n => {
      const opt = document.createElement('option');
      opt.value = n.id;
      opt.textContent = `Node ${n.label}`;
      select.appendChild(opt);
    });

    if (this.graph.getNode(currentVal)) {
      select.value = currentVal;
    } else {
      select.value = nodes[0].id;
      this.canvas.setStartNode(nodes[0].id);
    }
  }

  updateMetrics() {
    const metrics = this.graph.getMetrics();
    this.dom.metricNodes.textContent = metrics.nodeCount;
    this.dom.metricEdges.textContent = metrics.edgeCount;
    this.dom.metricDensity.textContent = metrics.density;
    this.dom.metricComponents.textContent = metrics.components;
  }

  setTool(toolName) {
    this.canvas.setMode(toolName);
    const tools = [
      { id: 'tool-select', name: 'select' },
      { id: 'tool-node', name: 'node' },
      { id: 'tool-edge', name: 'edge' },
      { id: 'tool-erase', name: 'erase' }
    ];

    tools.forEach(t => {
      const el = document.getElementById(t.id);
      if (el) el.classList.toggle('active', t.name === toolName);
    });
  }

  bindEvents() {
    // Top bar
    this.dom.algoSelect.addEventListener('change', e => {
      this.currentAlgorithm = e.target.value;
      this.renderPseudocode();
      this.rebuildTimeline();
    });

    this.dom.startNodeSelect.addEventListener('change', e => {
      const startId = parseInt(e.target.value);
      this.canvas.setStartNode(startId);
      this.rebuildTimeline();
    });

    this.dom.directedToggle.addEventListener('change', e => {
      this.graph.setDirected(e.target.checked);
      this.updateMetrics();
      this.rebuildTimeline();
    });

    this.dom.presetsSelect.addEventListener('change', e => {
      const presetKey = e.target.value;
      if (presetKey && PRESETS[presetKey]) {
        this.graph.deserialize(PRESETS[presetKey].data);
        this.dom.directedToggle.checked = this.graph.isDirected;
        this.canvas.centerGraph();
        this.updateStartNodeOptions();
        this.updateMetrics();
        this.rebuildTimeline();
      }
      e.target.value = '';
    });

    this.dom.soundBtn.addEventListener('click', () => {
      const enabled = window.soundEngine ? window.soundEngine.toggle() : false;
      this.dom.soundBtn.classList.toggle('muted', !enabled);
      this.dom.soundBtn.title = enabled ? 'Sound: ON' : 'Sound: Muted';
    });

    // Left Toolbar tools
    this.dom.toolSelect.addEventListener('click', () => this.setTool('select'));
    this.dom.toolNode.addEventListener('click', () => this.setTool('node'));
    this.dom.toolEdge.addEventListener('click', () => this.setTool('edge'));
    this.dom.toolErase.addEventListener('click', () => this.setTool('erase'));

    this.dom.toolClear.addEventListener('click', () => {
      if (confirm('Clear entire graph canvas?')) {
        this.graph.clear();
        this.updateStartNodeOptions();
        this.updateMetrics();
        this.rebuildTimeline();
      }
    });

    this.dom.toolFit.addEventListener('click', () => this.canvas.centerGraph());

    this.dom.toolUndo.addEventListener('click', () => {
      if (this.graph.undo()) {
        this.updateStartNodeOptions();
        this.updateMetrics();
        this.rebuildTimeline();
      }
    });

    this.dom.toolRedo.addEventListener('click', () => {
      if (this.graph.redo()) {
        this.updateStartNodeOptions();
        this.updateMetrics();
        this.rebuildTimeline();
      }
    });

    // Bottom Playback
    this.dom.btnPlayPause.addEventListener('click', () => this.togglePlay());
    this.dom.btnStepBack.addEventListener('click', () => {
      this.pause();
      this.stepBackward();
    });
    this.dom.btnStepForward.addEventListener('click', () => {
      this.pause();
      this.stepForward();
    });
    this.dom.btnReset.addEventListener('click', () => {
      this.pause();
      this.goToStep(0);
    });

    this.dom.timelineScrubber.addEventListener('input', e => {
      this.pause();
      this.goToStep(parseInt(e.target.value));
    });

    this.dom.speedBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.setSpeed(parseFloat(btn.dataset.speed));
      });
    });

    // Panel collapse toggle
    this.dom.panelToggle.addEventListener('click', () => {
      this.dom.inspectorPanel.classList.add('collapsed');
      if (this.dom.restorePanelBtn) this.dom.restorePanelBtn.style.display = 'flex';
      setTimeout(() => {
        this.canvas.resize();
        this.canvas.centerGraph();
      }, 320);
    });

    if (this.dom.restorePanelBtn) {
      this.dom.restorePanelBtn.addEventListener('click', () => {
        this.dom.inspectorPanel.classList.remove('collapsed');
        this.dom.restorePanelBtn.style.display = 'none';
        setTimeout(() => {
          this.canvas.resize();
          this.canvas.centerGraph();
        }, 320);
      });
    }

    // Modals
    this.dom.helpBtn.addEventListener('click', () => {
      this.dom.helpModal.classList.add('visible');
    });
    this.dom.closeHelpBtn.addEventListener('click', () => {
      this.dom.helpModal.classList.remove('visible');
    });

    this.dom.shareBtn.addEventListener('click', () => {
      this.dom.graphJsonArea.value = JSON.stringify(this.graph.serialize(), null, 2);
      this.dom.shareModal.classList.add('visible');
    });
    this.dom.closeShareBtn.addEventListener('click', () => {
      this.dom.shareModal.classList.remove('visible');
    });

    this.dom.copyJsonBtn.addEventListener('click', () => {
      this.dom.graphJsonArea.select();
      navigator.clipboard.writeText(this.dom.graphJsonArea.value);
      alert('Graph JSON copied to clipboard!');
    });

    this.dom.importJsonBtn.addEventListener('click', () => {
      try {
        const parsed = JSON.parse(this.dom.graphJsonArea.value);
        this.graph.deserialize(parsed);
        this.dom.directedToggle.checked = this.graph.isDirected;
        this.canvas.centerGraph();
        this.updateStartNodeOptions();
        this.updateMetrics();
        this.rebuildTimeline();
        this.dom.shareModal.classList.remove('visible');
      } catch (err) {
        alert('Invalid Graph JSON structure: ' + err.message);
      }
    });

    this.dom.exportImgBtn.addEventListener('click', () => {
      const dataUrl = this.canvas.exportImage();
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `graph-${this.currentAlgorithm}-${Date.now()}.png`;
      a.click();
    });

    // Canvas mutations hook
    this.canvas.onGraphMutated = () => {
      this.updateStartNodeOptions();
      this.updateMetrics();
      this.rebuildTimeline();
    };
  }

  bindShortcuts() {
    window.addEventListener('keydown', e => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        this.togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        this.pause();
        this.stepForward();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        this.pause();
        this.stepBackward();
      } else if (e.code === 'KeyR') {
        this.pause();
        this.goToStep(0);
      } else if (e.code === 'KeyV') {
        this.setTool('select');
      } else if (e.code === 'KeyN') {
        this.setTool('node');
      } else if (e.code === 'KeyE') {
        this.setTool('edge');
      } else if (e.code === 'KeyX') {
        this.setTool('erase');
      } else if (e.code === 'KeyF') {
        this.canvas.centerGraph();
      } else if (e.code === 'KeyM') {
        this.dom.soundBtn.click();
      } else if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ') {
        e.preventDefault();
        this.dom.toolUndo.click();
      } else if ((e.ctrlKey || e.metaKey) && e.code === 'KeyY') {
        e.preventDefault();
        this.dom.toolRedo.click();
      } else if (e.code === 'Slash' || e.code === 'QuestionMark') {
        this.dom.helpModal.classList.toggle('visible');
      }
    });
  }

  escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

window.UIController = UIController;
