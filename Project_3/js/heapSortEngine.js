/**
 * HeapSortEngine
 * Generates an immutable, step-by-step execution trace of Heap Sort.
 * Supports Max-Heap (Ascending sort) and Min-Heap (Descending sort).
 * Accurately tracks active indices: i, l, r, target (largest/smallest),
 * heap size boundary, and sorted region.
 */
class HeapSortEngine {
    constructor() {
        this.steps = [];
        this.comparisons = 0;
        this.swaps = 0;
    }

    /**
     * Generate all execution steps for the given array and mode.
     * @param {number[]} initialArray 
     * @param {'max'|'min'} mode 'max' for ascending sort, 'min' for descending sort
     * @returns {Array<Object>} List of step snapshots
     */
    generateTrace(initialArray, mode = 'max') {
        const arr = [...initialArray];
        const n = arr.length;
        this.steps = [];
        this.comparisons = 0;
        this.swaps = 0;

        const isBetter = (a, b) => mode === 'max' ? a > b : a < b;
        const targetLabel = mode === 'max' ? 'largest' : 'smallest';
        const targetWordAr = mode === 'max' ? 'الأكبر' : 'الأصغر';
        const heapTypeName = mode === 'max' ? 'Max-Heap' : 'Min-Heap';

        const record = (opts) => {
            const sortedIndices = [];
            const heapSize = opts.heapSize !== undefined ? opts.heapSize : n;
            for (let idx = heapSize; idx < n; idx++) {
                sortedIndices.push(idx);
            }
            if (opts.action === 'ALL_SORTED') {
                for (let idx = 0; idx < n; idx++) {
                    if (!sortedIndices.includes(idx)) sortedIndices.push(idx);
                }
            }

            this.steps.push({
                stepIndex: this.steps.length,
                array: [...arr],
                heapSize,
                i: opts.i !== undefined ? opts.i : null,
                l: opts.l !== undefined ? opts.l : null,
                r: opts.r !== undefined ? opts.r : null,
                target: opts.target !== undefined ? opts.target : null,
                phase: opts.phase || 'BUILD_HEAP',
                action: opts.action || 'STEP',
                swapping: opts.swapping || null,
                comparing: opts.comparing || null,
                sortedIndices,
                codeLine: opts.codeLine || 1,
                comparisons: this.comparisons,
                swaps: this.swaps,
                title: opts.title || '',
                description: opts.description || '',
                descriptionAr: opts.descriptionAr || ''
            });
        };

        // Step 0: Initial State
        record({
            heapSize: n,
            phase: 'INIT',
            action: 'INIT',
            codeLine: 1,
            title: 'Initial Array',
            description: `Starting Heap Sort on array of size ${n}. Target is to sort in ${mode === 'max' ? 'Ascending' : 'Descending'} order using a ${heapTypeName}.`,
            descriptionAr: `بدء خوارزمية Heap Sort على مصفوفة من ${n} عناصر. الهدف ترتيب العناصر ${mode === 'max' ? 'تصاعدياً' : 'تنازلياً'} باستخدام ${heapTypeName}.`
        });

        // -------------------------------------------------------------
        // HEAPIFY HELPER
        // -------------------------------------------------------------
        const heapify = (heapSize, i, phase = 'BUILD_HEAP') => {
            let target = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;

            record({
                heapSize,
                i,
                l: left < heapSize ? left : null,
                r: right < heapSize ? right : null,
                target,
                phase,
                action: 'HEAPIFY_START',
                codeLine: 12,
                title: `Heapify at node [${i}]`,
                description: `Evaluating subtree rooted at index i=${i} (value: ${arr[i]}). Left child l=${left < heapSize ? left : 'none'}, Right child r=${right < heapSize ? right : 'none'}.`,
                descriptionAr: `فحص الشجرة الفرعية من العقدة الجذرية i=${i} (القيمة: ${arr[i]}). الابن الأيسر l=${left < heapSize ? left : 'لا يوجد'}، الابن الأيمن r=${right < heapSize ? right : 'لا يوجد'}.`
            });

            // Check Left Child
            if (left < heapSize) {
                this.comparisons++;
                const leftWins = isBetter(arr[left], arr[target]);
                record({
                    heapSize,
                    i,
                    l: left,
                    r: right < heapSize ? right : null,
                    target,
                    phase,
                    action: 'COMPARE_LEFT',
                    comparing: [left, target],
                    codeLine: 13,
                    title: `Compare Left Child [${left}] with [${target}]`,
                    description: `Comparing left child arr[${left}]=${arr[left]} with arr[${target}]=${arr[target]}. ${leftWins ? `${arr[left]} is ${targetLabel}! Updating ${targetLabel} = ${left}.` : `${arr[target]} remains ${targetLabel}.`}`,
                    descriptionAr: `مقارنة الابن الأيسر arr[${left}]=${arr[left]} مع arr[${target}]=${arr[target]}. ${leftWins ? `القيمة ${arr[left]} هي ${targetWordAr}! تحديث المؤشر = ${left}.` : `العنصر الحالي يظل ${targetWordAr}.`}`
                });

                if (leftWins) {
                    target = left;
                }
            }

            // Check Right Child
            if (right < heapSize) {
                this.comparisons++;
                const rightWins = isBetter(arr[right], arr[target]);
                record({
                    heapSize,
                    i,
                    l: left < heapSize ? left : null,
                    r: right,
                    target,
                    phase,
                    action: 'COMPARE_RIGHT',
                    comparing: [right, target],
                    codeLine: 14,
                    title: `Compare Right Child [${right}] with [${target}]`,
                    description: `Comparing right child arr[${right}]=${arr[right]} with current ${targetLabel} arr[${target}]=${arr[target]}. ${rightWins ? `${arr[right]} is ${targetLabel}! Updating ${targetLabel} = ${right}.` : `${arr[target]} remains ${targetLabel}.`}`,
                    descriptionAr: `مقارنة الابن الأيمن arr[${right}]=${arr[right]} مع ${targetWordAr} الحالي arr[${target}]=${arr[target]}. ${rightWins ? `القيمة ${arr[right]} هي ${targetWordAr}! تحديث المؤشر = ${right}.` : `المؤشر الحالي يظل ${targetWordAr}.`}`
                });

                if (rightWins) {
                    target = right;
                }
            }

            // If target != i, swap and continue heapifying downward
            if (target !== i) {
                const valI = arr[i];
                const valTarget = arr[target];

                record({
                    heapSize,
                    i,
                    l: left < heapSize ? left : null,
                    r: right < heapSize ? right : null,
                    target,
                    phase,
                    action: 'SWAP_HEAPIFY',
                    swapping: [i, target],
                    codeLine: 16,
                    title: `Swap violated node [${i}] with [${target}]`,
                    description: `Heap property violated at i=${i}. Swapping arr[${i}]=${valI} with ${targetLabel} child arr[${target}]=${valTarget}.`,
                    descriptionAr: `شرط الـ Heap غير محقق عند العقدة i=${i}. يتم تبديل arr[${i}]=${valI} مع الابن ${targetWordAr} arr[${target}]=${valTarget}.`
                });

                this.swaps++;
                const temp = arr[i];
                arr[i] = arr[target];
                arr[target] = temp;

                record({
                    heapSize,
                    i,
                    l: left < heapSize ? left : null,
                    r: right < heapSize ? right : null,
                    target,
                    phase,
                    action: 'SWAP_DONE',
                    codeLine: 17,
                    title: `Swapped [${i}] and [${target}]`,
                    description: `Swap complete. Subtree at index ${target} may now violate heap property. Recursively heapifying index ${target}...`,
                    descriptionAr: `اكتمل التبديل. الشجرة الفرعية عند ${target} قد تحتاج لإعادة ضبط. استدعاء heapify تكرارياً للعقدة ${target}...`
                });

                heapify(heapSize, target, phase);
            } else {
                record({
                    heapSize,
                    i,
                    l: left < heapSize ? left : null,
                    r: right < heapSize ? right : null,
                    target,
                    phase,
                    action: 'NO_SWAP',
                    codeLine: 15,
                    title: `Subtree at [${i}] Valid`,
                    description: `Subtree rooted at index ${i} already satisfies the ${heapTypeName} property. No swap needed.`,
                    descriptionAr: `الشجرة الفرعية عند العقدة ${i} تحقق خاصية الـ ${heapTypeName} بالفعل. لا داعي للتبديل.`
                });
            }
        };

        // -------------------------------------------------------------
        // PHASE 1: BUILD HEAP
        // -------------------------------------------------------------
        const startNonLeaf = Math.floor(n / 2) - 1;
        record({
            heapSize: n,
            phase: 'BUILD_HEAP',
            action: 'PHASE_1_START',
            codeLine: 4,
            title: 'Phase 1: Build Heap',
            description: `Building ${heapTypeName} from bottom up, starting from last non-leaf parent index floor(${n}/2) - 1 = ${startNonLeaf} down to 0.`,
            descriptionAr: `المرحلة 1: بناء الـ ${heapTypeName} من الأسفل للأعلى، بدءاً من آخر أب غير ورقي: floor(${n}/2) - 1 = ${startNonLeaf} وصولاً إلى 0.`
        });

        for (let i = startNonLeaf; i >= 0; i--) {
            heapify(n, i, 'BUILD_HEAP');
        }

        // Phase 1 Complete
        record({
            heapSize: n,
            phase: 'HEAP_BUILT',
            action: 'HEAP_BUILT',
            codeLine: 6,
            title: `${heapTypeName} Successfully Built!`,
            description: `Phase 1 Complete! The entire array now satisfies the ${heapTypeName} property. Root arr[0]=${arr[0]} is guaranteed to be the ${targetLabel} element.`,
            descriptionAr: `اكتملت المرحلة 1! أصبحت المصفوفة بالكامل ${heapTypeName}. الجذر arr[0]=${arr[0]} هو العنصر ${targetWordAr} على الإطلاق.`
        });

        // -------------------------------------------------------------
        // PHASE 2: EXTRACT AND SORT
        // -------------------------------------------------------------
        record({
            heapSize: n,
            phase: 'SORTING',
            action: 'PHASE_2_START',
            codeLine: 7,
            title: 'Phase 2: In-place Extraction',
            description: `Phase 2: Repeatedly extract the root element (${targetLabel}) to the end of the unsorted heap, expand the sorted region, and heapify the new root.`,
            descriptionAr: `المرحلة 2: استخراج العنصر الجذر (${targetWordAr}) ونقله إلى نهاية الجزء غير المرتب، وتوسيع المنطقة المرتبة، ثم استعادة خاصية الـ Heap.`
        });

        for (let end = n - 1; end >= 1; end--) {
            // Highlight root before extraction
            record({
                heapSize: end + 1,
                i: 0,
                target: 0,
                phase: 'SORTING',
                action: 'EXTRACT_ROOT',
                codeLine: 8,
                title: `Extract Root arr[0]=${arr[0]}`,
                description: `Root element arr[0]=${arr[0]} is the ${targetLabel} among remaining ${end + 1} heap elements. Preparing to swap with arr[${end}]=${arr[end]}.`,
                descriptionAr: `العنصر الجذر arr[0]=${arr[0]} هو ${targetWordAr} بين الـ ${end + 1} عناصر المتبقية. الاستعداد لتبديله مع arr[${end}]=${arr[end]}.`
            });

            // Swap root with end
            this.swaps++;
            const maxVal = arr[0];
            const endVal = arr[end];
            const temp = arr[0];
            arr[0] = arr[end];
            arr[end] = temp;

            record({
                heapSize: end + 1,
                i: 0,
                phase: 'SORTING',
                action: 'SWAP_ROOT_END',
                swapping: [0, end],
                codeLine: 8,
                title: `Swap Root arr[0] with arr[${end}]`,
                description: `Swapped root (${maxVal}) with element at index ${end} (${endVal}).`,
                descriptionAr: `تم تبديل الجذر (${maxVal}) مع العنصر في الموقع ${end} (${endVal}).`
            });

            // Lock element into sorted region
            record({
                heapSize: end, // shrinks heap by 1, locks index `end`
                phase: 'SORTING',
                action: 'LOCK_SORTED',
                codeLine: 9,
                title: `Element arr[${end}]=${maxVal} Locked in Sorted Region`,
                description: `Index ${end} (value ${maxVal}) is now fixed in its final sorted position. Active heap size reduced to ${end}.`,
                descriptionAr: `العنصر في الموقع ${end} (القيمة ${maxVal}) تم تثبيته في مكانه النهائي المرتب. تم تقليص حجم الـ Heap إلى ${end}.`
            });

            // Heapify new root if heapSize > 1
            if (end > 1) {
                heapify(end, 0, 'SORTING');
            }
        }

        // Final All-Sorted Step
        record({
            heapSize: 0,
            phase: 'DONE',
            action: 'ALL_SORTED',
            codeLine: 10,
            title: 'Sorting Complete! 🎉',
            description: `All ${n} elements are now fully sorted in ${mode === 'max' ? 'ascending' : 'descending'} order! Total comparisons: ${this.comparisons}, Total swaps: ${this.swaps}.`,
            descriptionAr: `تم ترتيب جميع الـ ${n} عناصر بنجاح ${mode === 'max' ? 'تصاعدياً' : 'تنازلياً'}! إجمالي المقارنات: ${this.comparisons}، إجمالي التبديلات: ${this.swaps}.`
        });

        return this.steps;
    }
}

window.HeapSortEngine = HeapSortEngine;

