/**
 * Sorting Algorithms Generator Engine
 * Yields discrete animation steps for total control (Play, Pause, Step-by-Step, Speed change).
 */

const Algorithms = {
  /**
   * Quick Sort (Lomuto Partition with Last-Element Pivot)
   * Matches the exact theoretical analysis of Project 2.
   */
  *quickSort(array) {
    const arr = [...array];

    function* quickSortHelper(low, high) {
      if (low < high) {
        yield { type: 'range', left: low, right: high, description: `Dividing subarray: indices [${low}..${high}]` };

        // Partition
        const pivotVal = arr[high];
        yield { type: 'pivot', index: high, value: pivotVal, description: `Selected Pivot: arr[${high}] = ${pivotVal}` };

        let i = low - 1;

        for (let j = low; j < high; j++) {
          yield { 
            type: 'compare', 
            indices: [j, high], 
            values: [arr[j], pivotVal],
            description: `Comparing arr[${j}] (${arr[j]}) with Pivot (${pivotVal})` 
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
                description: `Swapped arr[${i}] and arr[${j}] to place smaller element on left` 
              };
            }
          }
        }

        // Place pivot in correct sorted spot
        const temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;

        yield { 
          type: 'swap', 
          indices: [i + 1, high], 
          values: [arr[i + 1], arr[high]],
          description: `Pivot arr[${high}] moved to final sorted index ${i + 1}` 
        };

        const pivotIndex = i + 1;
        yield { type: 'mark-sorted', indices: [pivotIndex], description: `Pivot ${arr[pivotIndex]} is now in final position` };
        yield { type: 'clear-pivot' };

        // Recurse left and right
        yield* quickSortHelper(low, pivotIndex - 1);
        yield* quickSortHelper(pivotIndex + 1, high);
      } else if (low === high) {
        yield { type: 'mark-sorted', indices: [low], description: `Single element at index ${low} is sorted` };
      }
    }

    yield* quickSortHelper(0, arr.length - 1);

    // Final sweep
    const allIndices = Array.from({ length: arr.length }, (_, k) => k);
    yield { type: 'finish', indices: allIndices, description: `Quick Sort completed successfully!` };
  },

  /**
   * Merge Sort (Divide and Conquer)
   * Visually highlights split subarrays, element comparison, and merge overwrites.
   */
  *mergeSort(array) {
    const arr = [...array];

    function* merge(low, mid, high) {
      yield { type: 'range', left: low, right: high, description: `Merging subarrays [${low}..${mid}] and [${mid + 1}..${high}]` };

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
          description: `Comparing left element (${leftArr[i]}) and right element (${rightArr[j]})` 
        };

        if (leftArr[i] <= rightArr[j]) {
          arr[k] = leftArr[i];
          yield { 
            type: 'overwrite', 
            index: k, 
            value: leftArr[i], 
            description: `Writing ${leftArr[i]} into index ${k}` 
          };
          i++;
        } else {
          arr[k] = rightArr[j];
          yield { 
            type: 'overwrite', 
            index: k, 
            value: rightArr[j], 
            description: `Writing ${rightArr[j]} into index ${k}` 
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
          description: `Writing remaining left element ${leftArr[i]} into index ${k}` 
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
          description: `Writing remaining right element ${rightArr[j]} into index ${k}` 
        };
        j++;
        k++;
      }

      // Temporarily mark this merged slice as settled
      const mergedIndices = [];
      for (let m = low; m <= high; m++) mergedIndices.push(m);
      yield { type: 'slice-merged', indices: mergedIndices, description: `Subarray [${low}..${high}] merged!` };
    }

    function* mergeSortHelper(low, high) {
      if (low < high) {
        const mid = Math.floor((low + high) / 2);
        yield { type: 'range', left: low, right: high, description: `Splitting array [${low}..${high}] at mid ${mid}` };

        yield* mergeSortHelper(low, mid);
        yield* mergeSortHelper(mid + 1, high);
        yield* merge(low, mid, high);
      }
    }

    yield* mergeSortHelper(0, arr.length - 1);

    const allIndices = Array.from({ length: arr.length }, (_, k) => k);
    yield { type: 'finish', indices: allIndices, description: `Merge Sort completed successfully!` };
  },

  /**
   * Quick Sort with Median-of-Three / Random Pivot
   * Provided to demonstrate the theoretical solution to the O(n^2) trap!
   */
  *quickSortRandom(array) {
    const arr = [...array];

    function* quickSortHelper(low, high) {
      if (low < high) {
        // Random pivot index
        const randPivot = low + Math.floor(Math.random() * (high - low + 1));
        
        // Swap with high
        if (randPivot !== high) {
          const temp = arr[randPivot];
          arr[randPivot] = arr[high];
          arr[high] = temp;
          yield { 
            type: 'swap', 
            indices: [randPivot, high], 
            values: [arr[randPivot], arr[high]],
            description: `Randomly picked pivot at ${randPivot} and swapped to end [${high}]` 
          };
        }

        const pivotVal = arr[high];
        yield { type: 'pivot', index: high, value: pivotVal, description: `Pivot (Randomized): arr[${high}] = ${pivotVal}` };

        let i = low - 1;
        for (let j = low; j < high; j++) {
          yield { 
            type: 'compare', 
            indices: [j, high], 
            values: [arr[j], pivotVal],
            description: `Comparing arr[${j}] (${arr[j]}) with Pivot (${pivotVal})` 
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
                description: `Swapped arr[${i}] and arr[${j}]` 
              };
            }
          }
        }

        const temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;
        yield { 
          type: 'swap', 
          indices: [i + 1, high], 
          values: [arr[i + 1], arr[high]],
          description: `Pivot moved to index ${i + 1}` 
        };

        const pivotIndex = i + 1;
        yield { type: 'mark-sorted', indices: [pivotIndex], description: `Pivot settled at index ${pivotIndex}` };
        yield { type: 'clear-pivot' };

        yield* quickSortHelper(low, pivotIndex - 1);
        yield* quickSortHelper(pivotIndex + 1, high);
      } else if (low === high) {
        yield { type: 'mark-sorted', indices: [low], description: `Index ${low} is sorted` };
      }
    }

    yield* quickSortHelper(0, arr.length - 1);
    const allIndices = Array.from({ length: arr.length }, (_, k) => k);
    yield { type: 'finish', indices: allIndices, description: `Randomized Quick Sort completed!` };
  }
};

window.Algorithms = Algorithms;
