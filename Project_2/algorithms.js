/**
 * Enhanced Sorting Algorithms Generator Engine
 * Yields detailed execution steps, pointers (i, j, pivot), active ranges, and pseudocode highlights.
 */

const Algorithms = {
  /**
   * Quick Sort (Lomuto Partition with Last-Element Pivot)
   */
  *quickSort(array) {
    const arr = [...array];

    function* quickSortHelper(low, high) {
      if (low < high) {
        yield { 
          type: 'range', 
          low, 
          high, 
          description: `🎯 Active Subarray partition [Index ${low} to ${high}]`,
          codeLine: `quickSort(arr, ${low}, ${high})`
        };

        const pivotVal = arr[high];
        yield { 
          type: 'pivot', 
          index: high, 
          value: pivotVal, 
          low,
          high,
          description: `👑 Selected Pivot: arr[${high}] = ${pivotVal}`,
          codeLine: `pivot = arr[high] // ${pivotVal}`
        };

        let i = low - 1;
        yield {
          type: 'pointers',
          i: i,
          j: low,
          pivot: high,
          description: `Initializing boundary pointer i = ${i}, scan pointer j = ${low}`,
          codeLine: `i = low - 1`
        };

        for (let j = low; j < high; j++) {
          yield { 
            type: 'compare', 
            indices: [j, high], 
            values: [arr[j], pivotVal],
            i: i,
            j: j,
            pivot: high,
            low,
            high,
            description: `🔍 Comparing arr[${j}] (${arr[j]}) with Pivot (${pivotVal})`,
            codeLine: `if (arr[${j}] <= pivot) // ${arr[j]} <= ${pivotVal} : ${arr[j] <= pivotVal ? 'YES' : 'NO'}`
          };

          if (arr[j] <= pivotVal) {
            i++;
            if (i !== j) {
              const temp = arr[i];
              arr[i] = arr[j];
              arr[j] = temp;

              yield { 
                type: 'swap', 
                indices: [i, j], 
                values: [arr[i], arr[j]],
                i: i,
                j: j,
                pivot: high,
                low,
                high,
                description: `🔄 Element ${arr[i]} ≤ Pivot. Swapped arr[${i}] & arr[${j}] to expand smaller partition`,
                codeLine: `swap(arr[${i}], arr[${j}])`
              };
            } else {
              yield {
                type: 'pointers',
                i: i,
                j: j,
                pivot: high,
                description: `Pointer i advanced to ${i} (already in correct partition)`,
                codeLine: `i++ // i is now ${i}`
              };
            }
          }
        }

        // Place pivot in correct sorted spot
        const temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;

        const pivotIndex = i + 1;
        yield { 
          type: 'swap', 
          indices: [pivotIndex, high], 
          values: [arr[pivotIndex], arr[high]],
          i: i,
          j: high,
          pivot: pivotIndex,
          low,
          high,
          description: `📍 Moving Pivot (${arr[pivotIndex]}) to its permanent sorted position: index ${pivotIndex}`,
          codeLine: `swap(arr[${pivotIndex}], arr[high])`
        };

        yield { 
          type: 'mark-sorted', 
          indices: [pivotIndex], 
          description: `✅ Pivot ${arr[pivotIndex]} is permanently SORTED at index ${pivotIndex}`,
          codeLine: `// Subarray successfully partitioned around index ${pivotIndex}`
        };
        yield { type: 'clear-pivot' };

        // Recurse Left
        yield* quickSortHelper(low, pivotIndex - 1);
        // Recurse Right
        yield* quickSortHelper(pivotIndex + 1, high);
      } else if (low === high) {
        yield { 
          type: 'mark-sorted', 
          indices: [low], 
          description: `✅ Single element at index ${low} (${arr[low]}) is trivially sorted`,
          codeLine: `// Base case: single element sorted`
        };
      }
    }

    yield* quickSortHelper(0, arr.length - 1);

    const allIndices = Array.from({ length: arr.length }, (_, k) => k);
    yield { 
      type: 'finish', 
      indices: allIndices, 
      description: `🎉 Quick Sort Completed! All ${arr.length} elements are in ascending order.`,
      codeLine: `// Sorting Finished`
    };
  },

  /**
   * Merge Sort (Divide and Conquer with visual Subarray split and Merge)
   */
  *mergeSort(array) {
    const arr = [...array];

    function* merge(low, mid, high) {
      yield { 
        type: 'range', 
        low, 
        mid, 
        high, 
        description: `📦 Merging Left Subarray [${low}..${mid}] and Right Subarray [${mid + 1}..${high}]`,
        codeLine: `merge(arr, ${low}, ${mid}, ${high})`
      };

      const leftArr = arr.slice(low, mid + 1);
      const rightArr = arr.slice(mid + 1, high + 1);

      let i = 0, j = 0, k = low;

      while (i < leftArr.length && j < rightArr.length) {
        const actualLeftIdx = low + i;
        const actualRightIdx = mid + 1 + j;

        yield { 
          type: 'compare', 
          indices: [actualLeftIdx, actualRightIdx], 
          values: [leftArr[i], rightArr[j]],
          leftSubarray: [low, mid],
          rightSubarray: [mid + 1, high],
          activeWrite: k,
          description: `🔍 Compare Left [${actualLeftIdx}]=${leftArr[i]} vs Right [${actualRightIdx}]=${rightArr[j]}`,
          codeLine: `if (left[${i}] <= right[${j}]) // ${leftArr[i]} <= ${rightArr[j]} : ${leftArr[i] <= rightArr[j] ? 'LEFT' : 'RIGHT'}`
        };

        if (leftArr[i] <= rightArr[j]) {
          arr[k] = leftArr[i];
          yield { 
            type: 'overwrite', 
            index: k, 
            value: leftArr[i], 
            leftSubarray: [low, mid],
            rightSubarray: [mid + 1, high],
            description: `📥 Merging smaller value ${leftArr[i]} into main array index ${k}`,
            codeLine: `arr[${k}] = ${leftArr[i]}`
          };
          i++;
        } else {
          arr[k] = rightArr[j];
          yield { 
            type: 'overwrite', 
            index: k, 
            value: rightArr[j], 
            leftSubarray: [low, mid],
            rightSubarray: [mid + 1, high],
            description: `📥 Merging smaller value ${rightArr[j]} into main array index ${k}`,
            codeLine: `arr[${k}] = ${rightArr[j]}`
          };
          j++;
        }
        k++;
      }

      while (i < leftArr.length) {
        arr[k] = leftArr[i];
        yield { 
          type: 'overwrite', 
          index: k, 
          value: leftArr[i], 
          description: `📥 Flushing remaining left element ${leftArr[i]} to index ${k}`,
          codeLine: `arr[${k}] = ${leftArr[i]} // Left remainder`
        };
        i++;
        k++;
      }

      while (j < rightArr.length) {
        arr[k] = rightArr[j];
        yield { 
          type: 'overwrite', 
          index: k, 
          value: rightArr[j], 
          description: `📥 Flushing remaining right element ${rightArr[j]} to index ${k}`,
          codeLine: `arr[${k}] = ${rightArr[j]} // Right remainder`
        };
        j++;
        k++;
      }

      const mergedIndices = [];
      for (let m = low; m <= high; m++) mergedIndices.push(m);
      yield { 
        type: 'slice-merged', 
        indices: mergedIndices, 
        description: `✨ Subarray [${low}..${high}] successfully merged & ordered!`,
        codeLine: `// Subarray [${low}..${high}] is sorted`
      };
    }

    function* mergeSortHelper(low, high) {
      if (low < high) {
        const mid = Math.floor((low + high) / 2);
        yield { 
          type: 'range', 
          low, 
          high, 
          mid,
          description: `✂️ Divide Step: Splitting array [${low}..${high}] into halves at mid index ${mid}`,
          codeLine: `mid = Math.floor((${low} + ${high}) / 2) // ${mid}`
        };

        yield* mergeSortHelper(low, mid);
        yield* mergeSortHelper(mid + 1, high);
        yield* merge(low, mid, high);
      }
    }

    yield* mergeSortHelper(0, arr.length - 1);

    const allIndices = Array.from({ length: arr.length }, (_, k) => k);
    yield { 
      type: 'finish', 
      indices: allIndices, 
      description: `🎉 Merge Sort Completed! Perfect $O(n \\log n)$ divide & conquer execution.`,
      codeLine: `// Sorting Finished`
    };
  },

  /**
   * Quick Sort with Random Pivot
   */
  *quickSortRandom(array) {
    const arr = [...array];

    function* quickSortHelper(low, high) {
      if (low < high) {
        const randPivot = low + Math.floor(Math.random() * (high - low + 1));
        
        if (randPivot !== high) {
          const temp = arr[randPivot];
          arr[randPivot] = arr[high];
          arr[high] = temp;
          yield { 
            type: 'swap', 
            indices: [randPivot, high], 
            values: [arr[randPivot], arr[high]],
            low,
            high,
            description: `🎲 Randomly picked index ${randPivot} as Pivot and swapped with end index ${high}`,
            codeLine: `swap(arr[randPivot], arr[high])`
          };
        }

        const pivotVal = arr[high];
        yield { 
          type: 'pivot', 
          index: high, 
          value: pivotVal, 
          low,
          high,
          description: `👑 Randomized Pivot: arr[${high}] = ${pivotVal}`,
          codeLine: `pivot = arr[high] // ${pivotVal}`
        };

        let i = low - 1;
        for (let j = low; j < high; j++) {
          yield { 
            type: 'compare', 
            indices: [j, high], 
            values: [arr[j], pivotVal],
            i,
            j,
            pivot: high,
            low,
            high,
            description: `🔍 Compare arr[${j}] (${arr[j]}) with Pivot (${pivotVal})`,
            codeLine: `if (arr[${j}] <= ${pivotVal})`
          };

          if (arr[j] <= pivotVal) {
            i++;
            if (i !== j) {
              const temp = arr[i];
              arr[i] = arr[j];
              arr[j] = temp;
              yield { 
                type: 'swap', 
                indices: [i, j], 
                values: [arr[i], arr[j]],
                i,
                j,
                pivot: high,
                low,
                high,
                description: `🔄 Swapped arr[${i}] and arr[${j}]`,
                codeLine: `swap(arr[${i}], arr[${j}])`
              };
            }
          }
        }

        const temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;

        const pivotIndex = i + 1;
        yield { 
          type: 'swap', 
          indices: [pivotIndex, high], 
          values: [arr[pivotIndex], arr[high]],
          pivot: pivotIndex,
          low,
          high,
          description: `📍 Placed Pivot at final sorted index ${pivotIndex}`,
          codeLine: `swap(arr[${pivotIndex}], arr[high])`
        };

        yield { 
          type: 'mark-sorted', 
          indices: [pivotIndex], 
          description: `✅ Pivot settled at index ${pivotIndex}`,
          codeLine: `// Subarray partitioned`
        };
        yield { type: 'clear-pivot' };

        yield* quickSortHelper(low, pivotIndex - 1);
        yield* quickSortHelper(pivotIndex + 1, high);
      } else if (low === high) {
        yield { 
          type: 'mark-sorted', 
          indices: [low], 
          description: `✅ Single element at index ${low} is sorted`,
          codeLine: `// Single element sorted`
        };
      }
    }

    yield* quickSortHelper(0, arr.length - 1);
    const allIndices = Array.from({ length: arr.length }, (_, k) => k);
    yield { 
      type: 'finish', 
      indices: allIndices, 
      description: `🎉 Randomized Quick Sort finished! Prevented O(n²) worst-case.`,
      codeLine: `// Sorting Finished`
    };
  }
};

window.Algorithms = Algorithms;
