/**
 * Dynamic SVG Tree Visualizer for Heap Sort
 * Accurately plots complete binary trees of sizes up to 31+ nodes
 * with smooth coordinate calculation, connecting edges, and active pointer badges (i, l, r, target).
 */
class TreeRenderer {
    constructor(svgElement, tooltipElement) {
        this.svg = svgElement;
        this.tooltip = tooltipElement;
        this.width = 800;
        this.height = 420;
        this.currentStep = null;
        this.nodePositions = new Map();
        this.onNodeClick = null;

        window.addEventListener('resize', () => {
            if (this.currentStep) this.render(this.currentStep);
        });
    }

    /**
     * Calculate coordinate layout for all nodes in the complete binary tree.
     */
    computeLayout(n) {
        this.nodePositions.clear();
        if (n <= 0) return;

        const rect = this.svg.getBoundingClientRect();
        this.width = Math.max(380, rect.width || 800);
        this.height = Math.max(280, rect.height || 420);

        const treeHeight = Math.floor(Math.log2(n)) + 1;
        const paddingX = Math.max(28, this.width * 0.05);
        const paddingY = Math.max(36, this.height * 0.1);
        const usableW = this.width - paddingX * 2;
        const usableH = this.height - paddingY * 2;
        const levelSpacing = treeHeight > 1 ? usableH / (treeHeight - 1) : 0;

        // Base node radius inversely proportional to tree depth/size
        let radius = 26;
        if (n > 20) radius = 17;
        else if (n > 10) radius = 22;

        for (let i = 0; i < n; i++) {
            const level = Math.floor(Math.log2(i + 1));
            const countInLevel = Math.pow(2, level);
            const posInLevel = i - (countInLevel - 1);
            const slotW = usableW / countInLevel;
            const x = paddingX + (posInLevel + 0.5) * slotW;
            const y = paddingY + level * levelSpacing;

            this.nodePositions.set(i, { x, y, radius, level });
        }
    }

    /**
     * Render the tree for the given step snapshot.
     */
    render(step) {
        if (!step) return;
        this.currentStep = step;
        const arr = step.array;
        const n = arr.length;
        this.computeLayout(n);

        // Clear existing SVG contents
        while (this.svg.firstChild) {
            this.svg.removeChild(this.svg.firstChild);
        }

        this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);

        // Defs for gradients, dropshadows, and markers
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `
            <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
            <filter id="swapGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
            <linearGradient id="edgeActiveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#38bdf8" />
                <stop offset="100%" stop-color="#818cf8" />
            </linearGradient>
            <linearGradient id="edgeSortedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#10b981" />
                <stop offset="100%" stop-color="#059669" />
            </linearGradient>
        `;
        this.svg.appendChild(defs);

        // Group 1: Edges
        const edgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        edgesGroup.setAttribute('class', 'tree-edges');

        for (let i = 0; i < n; i++) {
            const left = 2 * i + 1;
            const right = 2 * i + 2;

            if (left < n) this.drawEdge(edgesGroup, i, left, step);
            if (right < n) this.drawEdge(edgesGroup, i, right, step);
        }
        this.svg.appendChild(edgesGroup);

        // Group 2: Nodes
        const nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        nodesGroup.setAttribute('class', 'tree-nodes');

        for (let i = 0; i < n; i++) {
            this.drawNode(nodesGroup, i, arr[i], step);
        }
        this.svg.appendChild(nodesGroup);
    }

    drawEdge(group, parentIdx, childIdx, step) {
        const parentPos = this.nodePositions.get(parentIdx);
        const childPos = this.nodePositions.get(childIdx);
        if (!parentPos || !childPos) return;

        const isChildSorted = step.sortedIndices.includes(childIdx);
        const isParentSorted = step.sortedIndices.includes(parentIdx);
        const isEdgeActiveComparison = 
            (step.comparing && ((step.comparing[0] === parentIdx && step.comparing[1] === childIdx) || 
                                (step.comparing[1] === parentIdx && step.comparing[0] === childIdx))) ||
            (step.i === parentIdx && (step.l === childIdx || step.r === childIdx));

        const isEdgeSwapping = step.swapping && 
            ((step.swapping[0] === parentIdx && step.swapping[1] === childIdx) ||
             (step.swapping[1] === parentIdx && step.swapping[0] === childIdx));

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        // Curved Bézier branch for modern organic look
        const midY = (parentPos.y + childPos.y) / 2;
        const d = `M ${parentPos.x} ${parentPos.y} C ${parentPos.x} ${midY}, ${childPos.x} ${midY}, ${childPos.x} ${childPos.y}`;
        path.setAttribute('d', d);

        let strokeClass = 'edge-default';
        if (isEdgeSwapping) {
            strokeClass = 'edge-swapping';
        } else if (isEdgeActiveComparison) {
            strokeClass = 'edge-active';
        } else if (isChildSorted && isParentSorted) {
            strokeClass = 'edge-sorted';
        }

        path.setAttribute('class', `tree-edge ${strokeClass}`);
        group.appendChild(path);
    }

    drawNode(group, index, value, step) {
        const pos = this.nodePositions.get(index);
        if (!pos) return;

        const isSorted = step.sortedIndices.includes(index);
        const isI = step.i === index;
        const isL = step.l === index;
        const isR = step.r === index;
        const isTarget = step.target === index;
        const isSwapping = step.swapping && step.swapping.includes(index);
        const isComparing = step.comparing && step.comparing.includes(index);

        const nodeG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        nodeG.setAttribute('class', `tree-node-group ${isSorted ? 'is-sorted' : ''} ${isSwapping ? 'is-swapping' : ''}`);
        nodeG.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);
        nodeG.style.cursor = 'pointer';

        // Outer glow circle for active states
        if (isI || isL || isR || isTarget || isSwapping || isComparing) {
            const pulseCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            pulseCircle.setAttribute('r', pos.radius + 6);
            let glowColor = 'rgba(56, 189, 248, 0.4)';
            if (isSwapping) glowColor = 'rgba(239, 68, 68, 0.6)';
            else if (isTarget) glowColor = 'rgba(244, 63, 94, 0.5)';
            else if (isI) glowColor = 'rgba(56, 189, 248, 0.6)';
            else if (isL) glowColor = 'rgba(245, 158, 11, 0.5)';
            else if (isR) glowColor = 'rgba(168, 85, 247, 0.5)';

            pulseCircle.setAttribute('fill', 'none');
            pulseCircle.setAttribute('stroke', glowColor);
            pulseCircle.setAttribute('stroke-width', '3');
            pulseCircle.setAttribute('class', 'node-pulse-ring');
            nodeG.appendChild(pulseCircle);
        }

        // Main Node Circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', pos.radius);

        let fill = 'var(--node-bg, #1e293b)';
        let stroke = 'var(--node-border, #475569)';
        let strokeWidth = '2';

        if (isSorted) {
            fill = 'var(--node-sorted-bg, #064e3b)';
            stroke = 'var(--node-sorted-border, #10b981)';
            strokeWidth = '2.5';
        } else if (isSwapping) {
            fill = '#7f1d1d';
            stroke = '#ef4444';
            strokeWidth = '3';
        } else if (isTarget) {
            fill = '#831843';
            stroke = '#f43f5e';
            strokeWidth = '3';
        } else if (isI) {
            fill = '#0c4a6e';
            stroke = '#38bdf8';
            strokeWidth = '3';
        } else if (isL) {
            fill = '#78350f';
            stroke = '#f59e0b';
            strokeWidth = '2.5';
        } else if (isR) {
            fill = '#581c87';
            stroke = '#a855f7';
            strokeWidth = '2.5';
        } else if (isComparing) {
            fill = '#1e3a8a';
            stroke = '#60a5fa';
            strokeWidth = '2.5';
        }

        circle.setAttribute('fill', fill);
        circle.setAttribute('stroke', stroke);
        circle.setAttribute('stroke-width', strokeWidth);
        circle.setAttribute('class', 'node-circle');
        nodeG.appendChild(circle);

        // Node Value Text
        const textVal = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textVal.setAttribute('text-anchor', 'middle');
        textVal.setAttribute('dominant-baseline', 'central');
        textVal.setAttribute('class', 'node-val-text');
        textVal.setAttribute('font-size', pos.radius > 20 ? '14' : '11');
        textVal.setAttribute('font-weight', '700');
        textVal.setAttribute('fill', isSorted ? '#a7f3d0' : '#f8fafc');
        textVal.textContent = value;
        nodeG.appendChild(textVal);

        // Node Subscript Index Badge below node
        const textIdx = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textIdx.setAttribute('text-anchor', 'middle');
        textIdx.setAttribute('y', pos.radius + 12);
        textIdx.setAttribute('class', 'node-idx-text');
        textIdx.setAttribute('font-size', '10');
        textIdx.setAttribute('font-weight', '600');
        textIdx.setAttribute('fill', isSorted ? '#059669' : '#94a3b8');
        textIdx.textContent = `[${index}]`;
        nodeG.appendChild(textIdx);

        // Active Pointer Badges (i, l, r, largest) floating above the node
        const badges = [];
        if (isI) badges.push({ text: 'i', color: '#38bdf8', bg: '#0369a1' });
        if (isL) badges.push({ text: 'l', color: '#fbbf24', bg: '#b45309' });
        if (isR) badges.push({ text: 'r', color: '#c084fc', bg: '#7e22ce' });
        if (isTarget && !isI) badges.push({ text: 'max', color: '#fda4af', bg: '#be123c' });
        if (isSorted) badges.push({ text: '✓', color: '#6ee7b7', bg: '#047857' });

        if (badges.length > 0) {
            const badgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            badgeGroup.setAttribute('class', 'node-pointer-badges');

            const badgeW = 20;
            const badgeH = 14;
            const totalW = badges.length * (badgeW + 2) - 2;
            const startX = -totalW / 2;

            badges.forEach((b, bIdx) => {
                const bx = startX + bIdx * (badgeW + 2);
                const by = -pos.radius - 17;

                const bRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                bRect.setAttribute('x', bx);
                bRect.setAttribute('y', by);
                bRect.setAttribute('width', badgeW);
                bRect.setAttribute('height', badgeH);
                bRect.setAttribute('rx', '4');
                bRect.setAttribute('fill', b.bg);
                bRect.setAttribute('stroke', b.color);
                bRect.setAttribute('stroke-width', '1');
                badgeGroup.appendChild(bRect);

                const bTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                bTxt.setAttribute('x', bx + badgeW / 2);
                bTxt.setAttribute('y', by + badgeH / 2 + 1);
                bTxt.setAttribute('text-anchor', 'middle');
                bTxt.setAttribute('dominant-baseline', 'central');
                bTxt.setAttribute('fill', '#ffffff');
                bTxt.setAttribute('font-size', '9');
                bTxt.setAttribute('font-weight', '800');
                bTxt.textContent = b.text;
                badgeGroup.appendChild(bTxt);
            });

            nodeG.appendChild(badgeGroup);
        }

        // Hover & Tooltip Events
        nodeG.addEventListener('mouseenter', (e) => this.showTooltip(e, index, value, step));
        nodeG.addEventListener('mousemove', (e) => this.moveTooltip(e));
        nodeG.addEventListener('mouseleave', () => this.hideTooltip());

        if (this.onNodeClick) {
            nodeG.addEventListener('click', () => this.onNodeClick(index, value));
        }

        group.appendChild(nodeG);
    }

    showTooltip(event, index, value, step) {
        if (!this.tooltip) return;
        const parentIdx = index > 0 ? Math.floor((index - 1) / 2) : 'None (Root)';
        const leftIdx = 2 * index + 1 < step.array.length ? 2 * index + 1 : 'None';
        const rightIdx = 2 * index + 2 < step.array.length ? 2 * index + 2 : 'None';
        const isSorted = step.sortedIndices.includes(index);

        this.tooltip.innerHTML = `
            <div class="tooltip-header">
                <span class="tooltip-tag">${isSorted ? '🔒 Sorted Region' : '⚡ Active Heap'}</span>
                <strong>Node Index: [${index}]</strong>
            </div>
            <div class="tooltip-body">
                <div><strong>Value:</strong> <span class="highlight-val">${value}</span></div>
                <div><strong>Parent:</strong> floor((${index}-1)/2) = ${parentIdx}</div>
                <div><strong>Left Child:</strong> 2(${index})+1 = ${leftIdx}</div>
                <div><strong>Right Child:</strong> 2(${index})+2 = ${rightIdx}</div>
            </div>
        `;
        this.tooltip.style.display = 'block';
        this.moveTooltip(event);
    }

    moveTooltip(event) {
        if (!this.tooltip) return;
        const x = event.clientX + 14;
        const y = event.clientY + 14;
        this.tooltip.style.left = `${x}px`;
        this.tooltip.style.top = `${y}px`;
    }

    hideTooltip() {
        if (!this.tooltip) return;
        this.tooltip.style.display = 'none';
    }
}

window.TreeRenderer = TreeRenderer;

