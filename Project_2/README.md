# 📊 Project 2: Divide & Conquer Analysis (Merge vs. Quick Sort)

This project empirically analyzes the behavior of two fundamental divide-and-conquer algorithms: **Merge Sort** and **Quick Sort** (implemented with a last-element pivot).

## 1. Implementation & Testing
Both algorithms were implemented from scratch. To ensure robustness, a unit test suite (`test_sorts.py`) was created to validate the sorting logic against the exact edge cases required:
*   Empty arrays
*   Single-element arrays
*   Arrays with duplicate values
*   Already sorted arrays
*   Reverse-sorted arrays

## 2. Experimental Setup
The execution time was measured for input sizes ($n$) scaling from $10^3$ up to $10^6$ elements. Each input size was tested across three datasets: Randomly distributed, fully sorted, and reverse-sorted.

## 3. Empirical Analysis & Graph Models

 
### Merge Sort Observations: $O(n \log n)$
As seen in the left graph, Merge Sort's execution time grows identically regardless of the input data's initial state (Random, Sorted, or Reversed). It strictly follows the theoretical $O(n \log n)$ curve. This confirms that Merge Sort does not suffer from worst-case data permutations, though it consistently requires $O(n)$ auxiliary space.

### Quick Sort (Last-Element Pivot) Observations: $O(n \log n)$ vs $O(n^2)$
The right graph clearly demonstrates the critical flaw of choosing the *last element* as a pivot:
*   **Random Data:** Quick Sort performs exceptionally well, often outperforming Merge Sort due to lower constant factors and in-place swapping. It follows the expected $O(n \log n)$ curve.
*   **Sorted & Reversed Data (The $O(n^2)$ Trap):** When the array is already sorted or reverse-sorted, the last element is the absolute worst pivot choice (either the maximum or minimum value). This causes the partition step to degenerate from dividing the array in half to merely reducing it by one element per recursive call. 
*   *Note on Hardware Limit:* For $n \ge 10^5$, the $O(n^2)$ complexity of Quick Sort on sorted/reversed arrays requires trillions of operations and exceeds maximum recursion depth. The measurements for these specific worst cases were capped at $n=10,000$ to prevent complete system unresponsiveness.

## 4. Conclusion
While Quick Sort is faster on average for randomized data due to zero memory allocation overhead, its naive last-element pivot implementation is highly vulnerable to sorted data. Merge Sort, while slightly slower practically on random data, guarantees $O(n \log n)$ mathematical stability, making it the required choice when worst-case latency must be strictly bounded.