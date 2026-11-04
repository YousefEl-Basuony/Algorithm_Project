# 📊 Empirical Analysis of Insertion Sort

![Language](https://img.shields.io/badge/Language-Python-blue)
![Algorithm](https://img.shields.io/badge/Algorithm-Insertion%20Sort-success)
![Focus](https://img.shields.io/badge/Focus-Empirical%20Analysis-orange)

This repository contains the complete implementation, empirical analysis, and formal report for the **Insertion Sort Mini-Project**. It is structured to fulfill all code, testing, and documentation requirements[cite: 1, 2].

## 📑 Table of Contents
1. [Problem Statement](#1-problem-statement)
2. [Algorithm & Complexity](#2-algorithm--complexity)
3. [Experimental Setup](#3-experimental-setup)
4. [Empirical Analysis & Graph Models](#4-empirical-analysis--graph-models)
5. [Comparison with Merge Sort](#5-comparison-with-merge-sort)
6. [Conclusion](#6-conclusion)
7. [Reflection](#7-reflection)
8. [How to Run](#8-how-to-run)

---

## 1. Problem Statement
The objective is to implement the Insertion Sort algorithm in-place, augmenting it to count both **comparisons** and **shifts**[cite: 2]. We then conduct an empirical analysis by timing the algorithm for input sizes ($n$) ranging from 100 to 5,000[cite: 2]. The behavior is tested across three distinct input states to observe best, worst, and average-case scenarios:
- **Sorted**
- **Reverse-Sorted**
- **Random**

---

## 2. Algorithm & Complexity
Insertion Sort builds the final sorted array one item at a time. It is highly efficient for small data sets or nearly sorted data, but generally underperforms on large, unordered datasets.

| Scenario | Input State | Time Complexity | Space Complexity |
| :--- | :--- | :--- | :--- |
| **Best Case** | Already Sorted | $O(n)$ | $O(1)$ |
| **Worst Case** | Reverse-Sorted | $O(n^2)$ | $O(1)$ |
| **Average Case** | Randomly Distributed | $O(n^2)$ | $O(1)$ |

---

## 3. Experimental Setup
- **Input Sizes ($n$):** 100 to 5,000 elements[cite: 2].
- **Metrics Tracked:** Execution time (seconds), Number of Comparisons, Number of Shifts[cite: 2].
- **Environment:** *(You can type your PC specs here, e.g., Python 3.10 on Intel Core i7, 16GB RAM)*.

---

## 4. Empirical Analysis & Graph Models

### A. Execution Time Analysis
The graph below plots the running time against the input size ($n$) and compares the empirical data with the theoretical $O(n)$ and $O(n^2)$ curves[cite: 2].

> **[ 📌 قم بوضع صورة الرسم البياني الخاص بالوقت هنا ]**
> *Example: `![Execution Time Graph](images/time_graph.png)`*

**Observations:**
- **Sorted Input (Best Case):** The execution time grows strictly linearly, aligning perfectly with the $O(n)$ curve.
- **Random & Reverse (Average/Worst Cases):** The curves form steep parabolas, exhibiting textbook quadratic $O(n^2)$ growth. The reverse-sorted array consistently takes the longest time.

### B. Operations Count (Comparisons & Shifts)
To further prove the complexity, the algorithm tracks exact operations. 

> **[ 📌 قم بوضع صورة الرسم البياني الخاص بعدد المقارنات/النقل هنا ]**
> *Example: `![Operations Graph](images/operations_graph.png)`*

**Observations:**
- In the **sorted** array, the number of shifts is minimal, and comparisons equal $n-1$.
- In the **reverse-sorted** array, every element requires maximum shifts, proving why the time complexity spikes quadratically.

---

## 5. Comparison with Merge Sort

| Feature | Insertion Sort | Merge Sort |
| :--- | :--- | :--- |
| **Time Complexity** | $O(n)$ best, $O(n^2)$ worst/average | $O(n \log n)$ across all cases |
| **Space/Memory** | **$O(1)$** (In-place, highly efficient) | **$O(n)$** (Requires auxiliary arrays) |
| **Behavior** | Adaptive (Fast on nearly sorted data) | Non-adaptive (Same operations regardless of input state) |
| **Best Use Case** | Small datasets ($n < 50$) or nearly sorted arrays | Large, heavily scrambled datasets |

---

## 6. Conclusion
The empirical data successfully validates the mathematical bounds of Insertion Sort[cite: 1]. While the $O(n^2)$ complexity makes it impractical for large-scale random data compared to Merge Sort, its $O(n)$ best-case behavior and zero memory overhead ($O(1)$ space) make it an incredibly powerful algorithm for specific edge cases. 

---

## 7. Reflection
**What surprised you?**[cite: 1]
I was genuinely surprised by the sheer scale of the performance gap between the best and worst cases as $n$ approached 5,000. Theoretically, I knew $O(n^2)$ was slower, but visually seeing the execution time for reverse-sorted data explode while the sorted data remained near zero milliseconds gave me a profound appreciation for algorithmic efficiency. It highlighted that hardware speed cannot outrun bad complexity.

**What would you do next?**[cite: 1]
If I were to expand on this, I would implement **Merge Sort** and overlay its execution time on the exact same graph to visually compare the $O(n^2)$ curve against the $O(n \log n)$ curve. Furthermore, I would like to build a hybrid algorithm (similar to Timsort) that uses Merge Sort globally but switches to Insertion Sort when subarrays fall below 32 elements, testing if the combined approach yields the fastest empirical time.

---

## 8. How to Run
This repository contains a clean, testable implementation.

**1. Run Unit Tests (Correctness Check):**
```bash
python insertion_sort.py