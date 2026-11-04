/**
 * Main Application Bootstrap
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvasEl = document.getElementById('graph-canvas');
  const graph = new Graph();

  // Load default preset (Petersen or Binary Tree)
  if (window.PRESETS && window.PRESETS.binaryTree) {
    graph.deserialize(window.PRESETS.binaryTree.data);
  }

  const canvasRenderer = new GraphCanvas(canvasEl, graph);
  const uiController = new UIController(graph, canvasRenderer);

  // Center the initial graph
  setTimeout(() => {
    canvasRenderer.centerGraph();
  }, 100);

  // Expose to window for debugging or testing
  window.__APP__ = {
    graph,
    canvas: canvasRenderer,
    ui: uiController
  };
});

