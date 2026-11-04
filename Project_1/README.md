# Empirical Analysis of Insertion Sort

This repository contains a clean implementation of the Insertion Sort algorithm along with an empirical analysis of its performance across different input states, fulfilling both the code and report requirements of the mini-project.

---

## 1. Problem Statement
The objective is to implement the Insertion Sort algorithm, count the number of comparisons and shifts, and empirically analyze its running time. The algorithm is tested for input sizes ($n$) ranging from 100 to 5,000 across three different input permutations:
- **Sorted** (Best case scenario)
- **Reverse-sorted** (Worst case scenario)
- **Random inputs** (Average case scenario)

## 2. Algorithm and Complexity
Insertion sort builds the final sorted array one item at a time. It is an in-place comparison-based sorting algorithm.

- **Best Case Complexity:** $O(n)$
  - Occurs when the input array is already sorted. The algorithm makes only one comparison per element and zero shifts in the inner loop.
- **Worst Case Complexity:** $O(n^2)$
  - Occurs when the input is reverse-sorted. Every new element must be compared and shifted past all previously sorted elements.
- **Average Case Complexity:** $O(n^2)$
  - Occurs with randomly distributed elements.
- **Space Complexity:** $O(1)$ (In-place sorting).

## 3. Graph Model & Experiments
To verify the theoretical complexity, the algorithm was executed with varying input sizes ($n = 100 \rightarrow 5000$). The execution time was recorded and plotted against $n$.

### Empirical Results Plot
*(Below is the graph comparing the actual running time of sorted, reverse-sorted, and random inputs against the theoretical $O(n)$ and $O(n^2)$ curves).*

![Empirical Analysis Graph](ضع_رابط_صورة_الرسم_البياني_هنا.png)

**Observations:**
- The curve for **Sorted Input** grows linearly, matching the theoretical $O(n)$ complexity.
- The curves for **Random** and **Reverse-Sorted Inputs** exhibit quadratic growth, perfectly aligning with the theoretical $O(n^2)$ model. 

## 4. Conclusion & Comparison with Merge Sort
The empirical experiments successfully validate the theoretical time complexities of Insertion Sort. 

**Comparison with Merge Sort:**
1. **Time Complexity:** Merge Sort is strictly $O(n \log n)$ across all cases (Best, Worst, Average), making it vastly superior to Insertion Sort ($O(n^2)$) for large, unstructured datasets.
2. **Space Complexity:** Insertion Sort operates in $O(1)$ auxiliary space, whereas standard Merge Sort requires $O(n)$ space to merge sub-arrays.
3. **Adaptability:** Insertion Sort is highly adaptive. If the array is already mostly sorted, its time complexity drops to nearly $O(n)$, outperforming Merge Sort in this specific edge case.

## 5. Clean Code & Unit Tests
The repository includes a clean implementation of the algorithm with embedded unit tests to ensure correctness across multiple edge cases (Random, Sorted, and Reverse-sorted arrays).

To run the unit tests, simply execute:
```bash
python insertion_sort.py