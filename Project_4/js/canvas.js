/**
 * Graph Canvas Renderer and Interaction Engine
 * Handles Retina HiDPI, Zoom/Pan, Node and Edge drawing,
 * interactive edge dragging, and traversal state animations.
 */

class GraphCanvas {
  constructor(canvasElement, graph) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.graph = graph;

    // Viewport transform
    this.panX = 0;
    this.panY = 0;
    this.zoom = 1;
    this.minZoom = 0.3;
    this.maxZoom = 2.5;

    // Interaction modes: 'select', 'node', 'edge', 'erase'
    this.mode = 'select';

    // State
    this.startNodeId = 1;
    this.selectedNode = null;
    this.hoveredNode = null;
    this.hoveredEdge = null;
    this.draggingNode = null;
    this.dragOffset = { x: 0, y: 0 };
    this.edgeDraftSource = null;
    this.edgeDraftMouse = { x: 0, y: 0 };
    this.isPanning = false;
    this.panStart = { x: 0, y: 0 };
    this.isSpacePressed = false;

    // Traversal visualization state
    this.currentStep = null; // Step object from AlgorithmEngine
    this.animTime = 0;
    this.animFrameId = null;

    // Listeners & bindings
    this.onNodeSelected = null;
    this.onGraphMutated = null;

    this.initEvents();
    this.resize();
    this.startAnimationLoop();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.displayWidth = rect.width;
    this.displayHeight = rect.height;
  }

  setMode(mode) {
    this.mode = mode;
    this.edgeDraftSource = null;
    this.selectedNode = null;
    this.updateCursor();
  }

  setStartNode(nodeId) {
    this.startNodeId = nodeId;
  }

  setTraversalStep(step) {
    this.currentStep = step;
  }

  clearTraversal() {
    this.currentStep = null;
  }

  // World <-> Screen coordinates
  screenToWorld(sx, sy) {
    return {
      x: (sx - this.panX) / this.zoom,
      y: (sy - this.panY) / this.zoom
    };
  }

  worldToScreen(wx, wy) {
    return {
      x: wx * this.zoom + this.panX,
      y: wy * this.zoom + this.panY
    };
  }

  centerGraph() {
    const nodes = this.graph.getAllNodes();
    if (nodes.length === 0) {
      this.panX = 0;
      this.panY = 0;
      this.zoom = 1;
      return;
    }

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    nodes.forEach(n => {
      minX = Math.min(minX, n.x);
      maxX = Math.max(maxX, n.x);
      minY = Math.min(minY, n.y);
      maxY = Math.max(maxY, n.y);
    });

    const graphWidth = Math.max(maxX - minX, 100);
    const graphHeight = Math.max(maxY - minY, 100);
    
    // Check if inspector panel is expanded
    const inspectorEl = document.getElementById('inspector-panel');
    const isPanelOpen = inspectorEl && !inspectorEl.classList.contains('collapsed');
    const rightInset = isPanelOpen ? 420 : 60;
    const leftInset = 80;
    const topInset = 80;
    const bottomInset = 90;

    const availableW = this.displayWidth - (leftInset + rightInset);
    const availableH = this.displayHeight - (topInset + bottomInset);

    const scaleX = availableW / (graphWidth + 120);
    const scaleY = availableH / (graphHeight + 120);
    this.zoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.55), 1.25);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const targetCenterScreenX = leftInset + availableW / 2;
    const targetCenterScreenY = topInset + availableH / 2;

    this.panX = targetCenterScreenX - centerX * this.zoom;
    this.panY = targetCenterScreenY - centerY * this.zoom;
  }

  initEvents() {
    window.addEventListener('resize', () => this.resize());

    // Mouse down
    this.canvas.addEventListener('mousedown', e => {
      const rect = this.canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const world = this.screenToWorld(sx, sy);

      // Middle mouse or Spacebar down -> Pan
      if (e.button === 1 || this.isSpacePressed) {
        this.isPanning = true;
        this.panStart = { x: sx - this.panX, y: sy - this.panY };
        this.updateCursor();
        return;
      }

      if (e.button !== 0) return; // Only left click for tools

      const hitNode = this.graph.findNodeAt(world.x, world.y);
      const hitEdge = hitNode ? null : this.graph.findEdgeAt(world.x, world.y);

      switch (this.mode) {
        case 'select':
          if (hitNode) {
            this.draggingNode = hitNode;
            this.selectedNode = hitNode;
            this.dragOffset = { x: world.x - hitNode.x, y: world.y - hitNode.y };
            if (this.onNodeSelected) this.onNodeSelected(hitNode);
          } else {
            this.selectedNode = null;
            // Left click drag empty space to pan
            this.isPanning = true;
            this.panStart = { x: sx - this.panX, y: sy - this.panY };
          }
          break;

        case 'node':
          if (!hitNode) {
            const newNode = this.graph.addNode(world.x, world.y);
            if (this.graph.nodes.size === 1) {
              this.startNodeId = newNode.id;
            }
            if (this.onGraphMutated) this.onGraphMutated();
          }
          break;

        case 'edge':
          if (hitNode) {
            if (!this.edgeDraftSource) {
              this.edgeDraftSource = hitNode;
              this.edgeDraftMouse = { x: world.x, y: world.y };
            } else {
              if (this.edgeDraftSource.id !== hitNode.id) {
                this.graph.addEdge(this.edgeDraftSource.id, hitNode.id);
                if (this.onGraphMutated) this.onGraphMutated();
              }
              this.edgeDraftSource = null;
            }
          } else {
            this.edgeDraftSource = null;
          }
          break;

        case 'erase':
          if (hitNode) {
            this.graph.removeNode(hitNode.id);
            if (this.startNodeId === hitNode.id) {
              const remaining = this.graph.getAllNodes();
              this.startNodeId = remaining.length > 0 ? remaining[0].id : null;
            }
            if (this.onGraphMutated) this.onGraphMutated();
          } else if (hitEdge) {
            this.graph.removeEdge(hitEdge.id);
            if (this.onGraphMutated) this.onGraphMutated();
          }
          break;
      }
    });

    // Mouse move
    this.canvas.addEventListener('mousemove', e => {
      const rect = this.canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const world = this.screenToWorld(sx, sy);

      if (this.isPanning) {
        this.panX = sx - this.panStart.x;
        this.panY = sy - this.panStart.y;
        return;
      }

      if (this.draggingNode) {
        this.graph.updateNodePosition(
          this.draggingNode.id,
          world.x - this.dragOffset.x,
          world.y - this.dragOffset.y
        );
        return;
      }

      if (this.edgeDraftSource) {
        this.edgeDraftMouse = { x: world.x, y: world.y };
      }

      // Hover detection
      this.hoveredNode = this.graph.findNodeAt(world.x, world.y);
      this.hoveredEdge = this.hoveredNode ? null : this.graph.findEdgeAt(world.x, world.y);
      this.updateCursor();
    });

    // Mouse up
    window.addEventListener('mouseup', () => {
      if (this.isPanning) {
        this.isPanning = false;
        this.updateCursor();
      }
      if (this.draggingNode) {
        this.draggingNode = null;
      }
    });

    // Zoom on wheel
    this.canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const mouseScreenX = e.clientX - rect.left;
      const mouseScreenY = e.clientY - rect.top;

      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
      const newZoom = Math.min(Math.max(this.zoom * zoomFactor, this.minZoom), this.maxZoom);

      // Zoom towards mouse position
      this.panX = mouseScreenX - (mouseScreenX - this.panX) * (newZoom / this.zoom);
      this.panY = mouseScreenY - (mouseScreenY - this.panY) * (newZoom / this.zoom);
      this.zoom = newZoom;
    }, { passive: false });

    // Context menu (right click node to set start node)
    this.canvas.addEventListener('contextmenu', e => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const world = this.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
      const hitNode = this.graph.findNodeAt(world.x, world.y);
      if (hitNode) {
        this.startNodeId = hitNode.id;
        if (window.soundEngine) window.soundEngine.visitNode(2);
        if (this.onGraphMutated) this.onGraphMutated();
      }
    });

    // Keyboard space for panning
    window.addEventListener('keydown', e => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        this.isSpacePressed = true;
        this.updateCursor();
      }
    });
    window.addEventListener('keyup', e => {
      if (e.code === 'Space') {
        this.isSpacePressed = false;
        this.updateCursor();
      }
    });
  }

  updateCursor() {
    if (this.isPanning || this.isSpacePressed) {
      this.canvas.style.cursor = 'grab';
      return;
    }
    switch (this.mode) {
      case 'node':
        this.canvas.style.cursor = 'crosshair';
        break;
      case 'edge':
        this.canvas.style.cursor = this.hoveredNode ? 'pointer' : 'crosshair';
        break;
      case 'erase':
        this.canvas.style.cursor = (this.hoveredNode || this.hoveredEdge) ? 'not-allowed' : 'default';
        break;
      default:
        this.canvas.style.cursor = this.hoveredNode ? 'move' : 'default';
        break;
    }
  }

  startAnimationLoop() {
    const loop = (timestamp) => {
      this.animTime = timestamp * 0.001; // in seconds
      this.render();
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  render() {
    const ctx = this.ctx;
    const w = this.displayWidth;
    const h = this.displayHeight;

    // Clear background
    ctx.clearRect(0, 0, w, h);

    // Draw dot matrix grid
    this.drawDotGrid(ctx, w, h);

    // Save and apply pan/zoom viewport transform
    ctx.save();
    ctx.translate(this.panX, this.panY);
    ctx.scale(this.zoom, this.zoom);

    // Render Edges
    this.renderEdges(ctx);

    // Render In-Progress Edge Draft
    if (this.edgeDraftSource) {
      this.renderEdgeDraft(ctx);
    }

    // Render Nodes
    this.renderNodes(ctx);

    ctx.restore();
  }

  drawDotGrid(ctx, w, h) {
    const gridSize = 32 * this.zoom;
    const offsetX = this.panX % gridSize;
    const offsetY = this.panY % gridSize;

    ctx.fillStyle = '#1E293B';
    const dotRadius = Math.max(1, 1.2 * this.zoom);

    for (let x = offsetX; x < w; x += gridSize) {
      for (let y = offsetY; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  renderEdges(ctx) {
    const edges = this.graph.edges;
    const step = this.currentStep;

    edges.forEach(edge => {
      const u = this.graph.getNode(edge.from);
      const v = this.graph.getNode(edge.to);
      if (!u || !v) return;

      const isActive = step && step.activeEdgeId === edge.id;
      const isHovered = this.hoveredEdge && this.hoveredEdge.id === edge.id;

      // Color scheme
      let strokeColor = '#334155';
      let lineWidth = 2.2;

      if (isActive) {
        strokeColor = '#38BDF8'; // Cyan
        lineWidth = 4;
      } else if (isHovered && this.mode === 'erase') {
        strokeColor = '#EF4444'; // Red erase
        lineWidth = 3.5;
      } else if (isHovered) {
        strokeColor = '#64748B';
        lineWidth = 3;
      }

      // Compute vector
      const dx = v.x - u.x;
      const dy = v.y - u.y;
      const dist = Math.hypot(dx, dy);
      if (dist === 0) return;

      const ux = dx / dist;
      const uy = dy / dist;

      // Edge endpoints (offset by radius so arrow sits on node perimeter)
      const startX = u.x + ux * u.radius;
      const startY = u.y + uy * u.radius;
      const endX = v.x - ux * (v.radius + (edge.directed ? 6 : 0));
      const endY = v.y - uy * (v.radius + (edge.directed ? 6 : 0));

      ctx.save();

      // Outer glow for active edge
      if (isActive) {
        ctx.shadowColor = '#38BDF8';
        ctx.shadowBlur = 12;
      }

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Animated energy pulse dashes on active edge
      if (isActive) {
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.setLineDash([8, 8]);
        ctx.lineDashOffset = -this.animTime * 45;
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw arrow if directed
      if (edge.directed) {
        this.drawArrowhead(ctx, endX, endY, Math.atan2(dy, dx), strokeColor, isActive);
      }

      ctx.restore();
    });
  }

  drawArrowhead(ctx, x, y, angle, color, isActive) {
    const headLen = isActive ? 12 : 10;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-headLen, -headLen * 0.45);
    ctx.lineTo(-headLen * 0.7, 0);
    ctx.lineTo(-headLen, headLen * 0.45);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  renderEdgeDraft(ctx) {
    const u = this.edgeDraftSource;
    const mouse = this.edgeDraftMouse;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(u.x, u.y);
    ctx.lineTo(mouse.x, mouse.y);
    ctx.strokeStyle = '#06B6D4';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.lineDashOffset = -this.animTime * 25;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  renderNodes(ctx) {
    const nodes = this.graph.getAllNodes();
    const step = this.currentStep;

    const visitedSet = new Set(step ? step.visitedNodeIds : []);
    const inStructureSet = new Set(step ? step.dataStructure : []);
    const currentNodeId = step ? step.currentNodeId : null;

    nodes.forEach(node => {
      const isStart = node.id === this.startNodeId;
      const isCurrent = node.id === currentNodeId;
      const isVisited = visitedSet.has(node.id);
      const isInStructure = inStructureSet.has(node.id);
      const isHovered = this.hoveredNode && this.hoveredNode.id === node.id;
      const isSelected = this.selectedNode && this.selectedNode.id === node.id;

      // Color scheme
      let fillColor = '#0F172A';
      let strokeColor = '#475569';
      let strokeWidth = 2.5;
      let textColor = '#F8FAFC';
      let glowColor = null;

      if (isCurrent) {
        fillColor = '#0284C7'; // Cyan vibrant
        strokeColor = '#38BDF8';
        strokeWidth = 3.5;
        textColor = '#FFFFFF';
        glowColor = '#38BDF8';
      } else if (isVisited) {
        fillColor = '#4338CA'; // Deep Indigo
        strokeColor = '#818CF8';
        strokeWidth = 3;
        textColor = '#EEF2FF';
      } else if (isInStructure) {
        fillColor = '#78350F'; // Warm Amber
        strokeColor = '#F59E0B';
        strokeWidth = 3;
        textColor = '#FEF3C7';
        glowColor = '#F59E0B';
      } else if (isStart) {
        strokeColor = '#10B981'; // Emerald
        strokeWidth = 3;
      }

      if (isHovered && this.mode === 'erase') {
        fillColor = '#450A0A';
        strokeColor = '#EF4444';
      } else if (isHovered) {
        strokeColor = '#94A3B8';
      }

      ctx.save();

      // Pulsing glow rings for active node
      if (isCurrent) {
        const pulseScale = 1 + (Math.sin(this.animTime * 5) * 0.15 + 0.15);
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * pulseScale, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Expanding ripple
        const ripplePhase = (this.animTime * 1.5) % 1;
        const rippleR = node.radius + ripplePhase * 28;
        ctx.beginPath();
        ctx.arc(node.x, node.y, rippleR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.7 * (1 - ripplePhase)})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Outer shadow glow
      if (glowColor) {
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 16;
      }

      // Main Node Circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();

      ctx.shadowBlur = 0; // reset shadow

      // Selected ring
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2);
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Start Node Flag/Badge
      if (isStart) {
        this.drawStartBadge(ctx, node.x, node.y - node.radius - 12);
      }

      // Visited order index badge
      if (isVisited && step && step.traversalOrder) {
        const orderIdx = step.traversalOrder.indexOf(node.label);
        if (orderIdx !== -1) {
          this.drawOrderBadge(ctx, node.x + node.radius * 0.7, node.y - node.radius * 0.7, orderIdx + 1);
        }
      }

      // Node Label Text
      ctx.fillStyle = textColor;
      ctx.font = '600 15px "JetBrains Mono", Inter, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y + 0.5);

      ctx.restore();
    });
  }

  drawStartBadge(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = '#10B981';
    ctx.font = '700 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const text = 'START';
    const textW = ctx.measureText(text).width;
    const pad = 6;
    const h = 16;
    const w = textW + pad * 2;

    ctx.beginPath();
    ctx.roundRect(x - w / 2, y - h / 2, w, h, 8);
    ctx.fill();

    ctx.fillStyle = '#022C22';
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  drawOrderBadge(ctx, x, y, order) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fillStyle = '#6366F1';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(order.toString(), x, y + 0.5);
    ctx.restore();
  }

  exportImage() {
    return this.canvas.toDataURL('image/png');
  }
}

window.GraphCanvas = GraphCanvas;
