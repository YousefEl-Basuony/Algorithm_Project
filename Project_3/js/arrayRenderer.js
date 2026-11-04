/**
 * Synchronized Array Visualizer for Heap Sort
 * Renders array cells, proportional visual bars, labels for i, l, r,
 * and a distinct divider marking the Sorted Region.
 */
class ArrayRenderer {
    constructor(containerElement) {
        this.container = containerElement;
        this.currentStep = null;
        this.onCellClick = null;
    }

    render(step) {
        if (!step || !this.container) return;
        this.currentStep = step;

        const arr = step.array;
        const n = arr.length;
        const maxVal = Math.max(...arr, 1);
        const heapSize = step.heapSize !== undefined ? step.heapSize : n;

        this.container.innerHTML = '';

        // Header info bar for Array View
        const header = document.createElement('div');
        header.className = 'array-view-header';
        
        const activeCount = Math.max(0, heapSize);
        const sortedCount = Math.max(0, n - heapSize);

        header.innerHTML = `
            <div class="array-status-pills">
                <span class="region-pill active-heap-pill">
                    <span class="pill-dot"></span> Active Heap: <strong>${activeCount}</strong> items (indices 0..${Math.max(0, activeCount - 1)})
                </span>
                <span class="region-pill sorted-region-pill ${sortedCount > 0 ? 'has-sorted' : ''}">
                    <span class="pill-dot"></span> 🔒 Sorted Region: <strong>${sortedCount}</strong> items
                </span>
            </div>
        `;
        this.container.appendChild(header);

        // Main Array Strip Wrapper
        const stripWrapper = document.createElement('div');
        stripWrapper.className = 'array-strip-wrapper';

        // Horizontal Array Strip
        const strip = document.createElement('div');
        strip.className = 'array-strip';

        for (let idx = 0; idx < n; idx++) {
            const val = arr[idx];
            const isSorted = step.sortedIndices.includes(idx);
            const isI = step.i === idx;
            const isL = step.l === idx;
            const isR = step.r === idx;
            const isTarget = step.target === idx;
            const isSwapping = step.swapping && step.swapping.includes(idx);
            const isComparing = step.comparing && step.comparing.includes(idx);

            // Check if this is the boundary between Heap and Sorted Region
            const isBoundary = idx === heapSize && heapSize > 0 && heapSize < n;

            if (isBoundary) {
                const divider = document.createElement('div');
                divider.className = 'heap-sorted-divider';
                divider.innerHTML = `
                    <div class="divider-line"></div>
                    <span class="divider-label">BOUNDARY</span>
                `;
                strip.appendChild(divider);
            }

            // Cell Container
            const cellCol = document.createElement('div');
            cellCol.className = `array-cell-col ${isSorted ? 'is-sorted' : ''} ${isSwapping ? 'is-swapping' : ''}`;
            cellCol.dataset.index = idx;

            // Badges Row Above Cell
            const badgeRow = document.createElement('div');
            badgeRow.className = 'array-badge-row';

            if (isI) {
                badgeRow.appendChild(this.createBadge('i', 'badge-i'));
            }
            if (isL) {
                badgeRow.appendChild(this.createBadge('l', 'badge-l'));
            }
            if (isR) {
                badgeRow.appendChild(this.createBadge('r', 'badge-r'));
            }
            if (isTarget && !isI) {
                badgeRow.appendChild(this.createBadge('max', 'badge-target'));
            }
            if (isSorted) {
                badgeRow.appendChild(this.createBadge('🔒', 'badge-lock'));
            }

            // Value Box
            const valBox = document.createElement('div');
            valBox.className = 'array-val-box';
            if (isSorted) valBox.classList.add('box-sorted');
            if (isSwapping) valBox.classList.add('box-swapping');
            else if (isTarget) valBox.classList.add('box-target');
            else if (isI) valBox.classList.add('box-i');
            else if (isL) valBox.classList.add('box-l');
            else if (isR) valBox.classList.add('box-r');
            else if (isComparing) valBox.classList.add('box-comparing');

            valBox.textContent = val;

            // Proportional Height Bar Container
            const barContainer = document.createElement('div');
            barContainer.className = 'array-bar-container';

            const bar = document.createElement('div');
            bar.className = 'array-bar';
            const heightPercent = Math.max(12, Math.round((val / maxVal) * 100));
            bar.style.height = `${heightPercent}%`;

            if (isSorted) bar.classList.add('bar-sorted');
            else if (isSwapping) bar.classList.add('bar-swapping');
            else if (isTarget) bar.classList.add('bar-target');
            else if (isI) bar.classList.add('bar-i');
            else if (isL) bar.classList.add('bar-l');
            else if (isR) bar.classList.add('bar-r');
            else if (isComparing) bar.classList.add('bar-comparing');

            barContainer.appendChild(bar);

            // Index Subscript
            const idxBox = document.createElement('div');
            idxBox.className = 'array-idx-box';
            idxBox.textContent = idx;

            // Assemble Column
            cellCol.appendChild(badgeRow);
            cellCol.appendChild(valBox);
            cellCol.appendChild(barContainer);
            cellCol.appendChild(idxBox);

            // Click listener
            if (this.onCellClick) {
                cellCol.addEventListener('click', () => this.onCellClick(idx, val));
            }

            strip.appendChild(cellCol);
        }

        stripWrapper.appendChild(strip);
        this.container.appendChild(stripWrapper);
    }

    createBadge(text, className) {
        const badge = document.createElement('span');
        badge.className = `pointer-badge ${className}`;
        badge.textContent = text;
        return badge;
    }
}

window.ArrayRenderer = ArrayRenderer;

