/**
 * Graph Data Structure
 * Supports directed and undirected graphs, adjacency operations,
 * node/edge CRUD, persistence, and graph metrics.
 */
class Graph {
  constructor() {
    this.nodes = new Map(); // id -> { id, x, y, label, radius }
    this.edges = []; // Array of { id, from, to, directed }
    this.nextId = 1;
    this.isDirected = false;
    this.undoStack = [];
    this.redoStack = [];
    this.onModified = null;
  }

  saveSnapshot() {
    const snap = JSON.stringify(this.serialize());
    this.undoStack.push(snap);
    if (this.undoStack.length > 30) this.undoStack.shift();
    this.redoStack = [];
    if (this.onModified) this.onModified();
  }

  undo() {
    if (this.undoStack.length === 0) return false;
    const current = JSON.stringify(this.serialize());
    this.redoStack.push(current);
    const prev = JSON.parse(this.undoStack.pop());
    this.deserialize(prev, false);
    if (this.onModified) this.onModified();
    return true;
  }

  redo() {
    if (this.redoStack.length === 0) return false;
    const current = JSON.stringify(this.serialize());
    this.undoStack.push(current);
    const next = JSON.parse(this.redoStack.pop());
    this.deserialize(next, false);
    if (this.onModified) this.onModified();
    return true;
  }

  generateLabel() {
    const existingLabels = new Set(Array.from(this.nodes.values()).map(n => n.label));
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < letters.length; i++) {
      if (!existingLabels.has(letters[i])) return letters[i];
    }
    let suffix = 1;
    while (true) {
      for (let i = 0; i < letters.length; i++) {
        const candidate = `${letters[i]}${suffix}`;
        if (!existingLabels.has(candidate)) return candidate;
      }
      suffix++;
    }
  }

  addNode(x, y, customLabel = null, record = true) {
    if (record) this.saveSnapshot();
    const id = this.nextId++;
    const label = customLabel || this.generateLabel();
    const node = {
      id,
      x: Math.round(x),
      y: Math.round(y),
      label,
      radius: 24
    };
    this.nodes.set(id, node);
    if (window.soundEngine) window.soundEngine.nodeAdd();
    if (this.onModified) this.onModified();
    return node;
  }

  removeNode(id, record = true) {
    if (record) this.saveSnapshot();
    const node = this.nodes.get(id);
    if (!node) return false;

    // Remove connected edges
    this.edges = this.edges.filter(e => e.from !== id && e.to !== id);
    this.nodes.delete(id);

    if (window.soundEngine) window.soundEngine.delete();
    if (this.onModified) this.onModified();
    return true;
  }

  updateNodePosition(id, x, y) {
    const node = this.nodes.get(id);
    if (node) {
      node.x = Math.round(x);
      node.y = Math.round(y);
    }
  }

  addEdge(fromId, toId, record = true) {
    if (fromId === toId) return null; // No self loops for clean visual traversal
    if (!this.nodes.has(fromId) || !this.nodes.has(toId)) return null;

    // Check if edge already exists
    const exists = this.edges.some(e => {
      if (this.isDirected) {
        return e.from === fromId && e.to === toId;
      } else {
        return (e.from === fromId && e.to === toId) || (e.from === toId && e.to === fromId);
      }
    });

    if (exists) return null;

    if (record) this.saveSnapshot();
    const edge = {
      id: `e_${fromId}_${toId}_${Date.now()}`,
      from: fromId,
      to: toId,
      directed: this.isDirected
    };
    this.edges.push(edge);
    if (window.soundEngine) window.soundEngine.edgeAdd();
    if (this.onModified) this.onModified();
    return edge;
  }

  removeEdge(edgeId, record = true) {
    if (record) this.saveSnapshot();
    const prevLen = this.edges.length;
    this.edges = this.edges.filter(e => e.id !== edgeId);
    if (this.edges.length !== prevLen) {
      if (window.soundEngine) window.soundEngine.delete();
      if (this.onModified) this.onModified();
      return true;
    }
    return false;
  }

  setDirected(directed) {
    if (this.isDirected === directed) return;
    this.saveSnapshot();
    this.isDirected = directed;
    this.edges.forEach(e => e.directed = directed);
    if (this.onModified) this.onModified();
  }

  getNode(id) {
    return this.nodes.get(id) || null;
  }

  getNodeByLabel(label) {
    for (const node of this.nodes.values()) {
      if (node.label === label) return node;
    }
    return null;
  }

  getAllNodes() {
    return Array.from(this.nodes.values());
  }

  getNeighbors(nodeId) {
    const neighbors = [];
    for (const edge of this.edges) {
      if (edge.from === nodeId) {
        neighbors.push({ nodeId: edge.to, edgeId: edge.id });
      } else if (!this.isDirected && edge.to === nodeId) {
        neighbors.push({ nodeId: edge.from, edgeId: edge.id });
      }
    }

    // Sort neighbors alphabetically by their label for consistent deterministic traversal
    neighbors.sort((a, b) => {
      const nodeA = this.getNode(a.nodeId);
      const nodeB = this.getNode(b.nodeId);
      if (!nodeA || !nodeB) return 0;
      return nodeA.label.localeCompare(nodeB.label);
    });

    return neighbors;
  }

  findNodeAt(x, y, radiusTolerance = 5) {
    for (const node of this.nodes.values()) {
      const dx = node.x - x;
      const dy = node.y - y;
      if (Math.sqrt(dx * dx + dy * dy) <= node.radius + radiusTolerance) {
        return node;
      }
    }
    return null;
  }

  findEdgeAt(x, y, tolerance = 8) {
    for (const edge of this.edges) {
      const n1 = this.getNode(edge.from);
      const n2 = this.getNode(edge.to);
      if (!n1 || !n2) continue;

      const dist = this.pointToSegmentDistance(x, y, n1.x, n1.y, n2.x, n2.y);
      if (dist <= tolerance) {
        return edge;
      }
    }
    return null;
  }

  pointToSegmentDistance(px, py, x1, y1, x2, y2) {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    const projX = x1 + t * (x2 - x1);
    const projY = y1 + t * (y2 - y1);
    return Math.hypot(px - projX, py - projY);
  }

  clear(record = true) {
    if (this.nodes.size === 0 && this.edges.length === 0) return;
    if (record) this.saveSnapshot();
    this.nodes.clear();
    this.edges = [];
    this.nextId = 1;
    if (window.soundEngine) window.soundEngine.delete();
    if (this.onModified) this.onModified();
  }

  getMetrics() {
    const v = this.nodes.size;
    const e = this.edges.length;
    let maxEdges = 0;
    if (v > 1) {
      maxEdges = this.isDirected ? v * (v - 1) : (v * (v - 1)) / 2;
    }
    const density = maxEdges > 0 ? (e / maxEdges).toFixed(2) : '0.00';

    // Connected components (undirected view)
    let components = 0;
    const visited = new Set();
    for (const [id] of this.nodes) {
      if (!visited.has(id)) {
        components++;
        const q = [id];
        visited.add(id);
        while (q.length > 0) {
          const curr = q.shift();
          // Undirected reachability
          for (const edge of this.edges) {
            let nbr = null;
            if (edge.from === curr) nbr = edge.to;
            else if (edge.to === curr) nbr = edge.from;
            if (nbr !== null && !visited.has(nbr)) {
              visited.add(nbr);
              q.push(nbr);
            }
          }
        }
      }
    }

    return {
      nodeCount: v,
      edgeCount: e,
      density,
      components,
      isDirected: this.isDirected
    };
  }

  serialize() {
    return {
      isDirected: this.isDirected,
      nextId: this.nextId,
      nodes: Array.from(this.nodes.values()),
      edges: this.edges
    };
  }

  deserialize(data, record = true) {
    if (record) this.saveSnapshot();
    this.isDirected = !!data.isDirected;
    this.nextId = data.nextId || 1;
    this.nodes.clear();
    this.edges = [];

    if (Array.isArray(data.nodes)) {
      data.nodes.forEach(n => {
        this.nodes.set(n.id, { ...n, radius: 24 });
        if (n.id >= this.nextId) this.nextId = n.id + 1;
      });
    }

    if (Array.isArray(data.edges)) {
      this.edges = data.edges.map(e => ({
        ...e,
        directed: this.isDirected
      }));
    }

    if (this.onModified) this.onModified();
  }
}

window.Graph = Graph;

