# ⚡ AlgoScope // Interactive Divide & Conquer Sorting Visualizer & Analytics

<div align="center">

![Project Status](https://img.shields.io/badge/Status-Completed-success?style=for-the-badge&logo=statuspage&logoColor=white)
![Level](https://img.shields.io/badge/Level-Intermediate-f59e0b?style=for-the-badge&logo=target)
![Pacing](https://img.shields.io/badge/Tempo-Educational%20(Auto--Tuned)-00f5d4?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20ES6%2B%20%7C%20Web%20Audio-38bdf8?style=for-the-badge&logo=javascript&logoColor=black)

<br/>

**An interactive, hardware-accelerated algorithm laboratory with real-time empirical statistics, comparison counters, and acoustic synthesis to analyze Divide & Conquer algorithms.**

<br/>

<img src="assets/preview.png" alt="Sorting Visualizer & Analytics Preview" width="100%" style="border-radius: 14px; box-shadow: 0 20px 40px rgba(0,0,0,0.7); border: 1px solid rgba(255,255,255,0.12);" />

</div>

---

## 🚀 Key Highlights & Educational Enhancements

### 📊 1. Empirical Statistics & Benchmark Suite (NEW)
* **Operation Proportions Chart:** Live visual ratio of Comparisons vs Swaps measured against the theoretical worst-case ceiling $\frac{n(n-1)}{2}$.
* **Efficiency Index & Asymptotics:** Live evaluation assessing whether the execution matches the optimal $O(n \log n)$ bounds or has degraded to the quadratic $O(n^2)$ trap.
* **Comparative Run History:** Automatically logs past runs (Algorithm, Dataset, Comparisons, Swaps, Elapsed Time) allowing direct side-by-side comparison of **Merge Sort** vs **Quick Sort** on the exact same array.

### ⏱️ 2. Auto-Tuned Educational Pacing (No Manual Tweaking Needed)
* Calibrated to an optimal **~480ms human comprehension tempo**.
* Slow enough to track every comparison, observe the movement of boundary pointers (`i`, `j`, and `PIVOT`), and read the live pseudocode line without feeling rushed.
* Users can pause (`Pause`), resume (`Resume`), or step forward one operation at a time (`Step`) whenever needed.

### 🏷️ 3. 10 3D Glass Pillars with Clear Number Badges
* Designed specifically with **10 high-contrast elements** by default:
  * **Bold Number Badges** prominently floating on top of each pillar (`85`, `34`, `92`...).
  * **Array Index Badges** underneath each bar (`#0` to `#9`).
  * **Dynamic Floating Pointer Badges**:
    * 👑 `PIVOT`: Crimson neon tag tracking the active partition pivot.
    * 🔎 `j`: Amber scanner tag tracking the current array comparison.
    * 👆 `i`: Cyan boundary tag tracking the smaller-element partition border.

### 💻 4. Live Code Execution HUD
* A dedicated terminal display showing the exact code line running in real-time:
  ```text
  if (arr[j] <= pivot) // 32 <= 75 : YES -> swap(arr[i], arr[j])
  ```

### 🔊 5. Futuristic Web Audio Synthesizer
* Native integration with the **Web Audio API** (zero external dependencies).
* Maps each array element's value to an audible frequency ($180\text{ Hz} \to 920\text{ Hz}$).
* Distinct acoustic soundscapes for comparisons, swaps, pivot selections, and an arpeggio victory chord upon completion.

---

## 📊 Divide & Conquer Empirical Analysis

This visualizer empirically validates the mathematical behavior of **Merge Sort** and **Quick Sort** (Lomuto partition with last-element pivot):

| Algorithm | Best Case | Average Case | Worst Case | Auxiliary Space | Stable? | Primary Mechanism |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Merge Sort** | $\Omega(n \log n)$ | $\Theta(n \log n)$ | $O(n \log n)$ | $O(n)$ | **Yes** | Divide in half, merge sorted subarrays |
| **Quick Sort (Last Pivot)** | $\Omega(n \log n)$ | $\Theta(n \log n)$ | $\mathbf{O(n^2)}$ | $O(\log n)$ | **No** | In-place partition around $arr[\text{high}]$ |
| **Quick Sort (Random Pivot)** | $\Omega(n \log n)$ | $\Theta(n \log n)$ | $O(n \log n)^*$ | $O(\log n)$ | **No** | Randomized pivot avoids pathological inputs |

*\*Expected worst-case probability is negligibly small ($O(1/n!)$).*

---

### ⚠️ The $O(n^2)$ Last-Element Pivot Trap (Empirical Test)

A core focus of this laboratory is demonstrating what happens when selecting the **last element** as the pivot on sorted or reversed data:

1. **Random Input:** The pivot splits the array into reasonably balanced partitions:
   $$T(n) = 2T(n/2) + \Theta(n) \implies O(n \log n)$$
2. **Reverse-Sorted Input:** The pivot is always the minimum or maximum element, degenerating the recurrence into:
   $$T(n) = T(n - 1) + \Theta(n) \implies \sum_{i=1}^{n-1} i = \frac{n(n - 1)}{2} = \mathbf{O(n^2)}$$

> **Try it in the app:** With 10 elements, select **Reverse Sorted** and run **Quick Sort (Last-Element Pivot)**. Watch the comparison counter hit exactly **45 comparisons** ($\frac{10 \times 9}{2}$), triggering the **🚨 $O(n^2)$ Worst-Case Trap** alert in the Analytics panel! Then switch to **Merge Sort** or **Randomized Quick Sort** to see it completed in ~20-25 comparisons.

---

## 🗂️ Project Structure

```text
Project_2/
├── assets/
│   └── preview.png          # High-resolution screenshot of the application & analytics suite
├── index.html               # Semantic HTML5 layout, HUD counters & analytics dashboard
├── style.css                # Cyberpunk theme, glassmorphism, 3D pillars & stat bars
├── audio.js                 # Web Audio API sound synthesis engine
├── algorithms.js            # Generator-based implementations (Merge, Quick, Random Quick)
├── app.js                   # Application state manager & empirical analytics pipeline
└── README.md                # Project documentation & complexity analysis
```

---

## 💻 How to Run Locally

Built entirely with **Vanilla Web Technologies** — zero build tools, no `npm install`, and no local server required.

### Quick Start:
1. Clone this repository:
   ```bash
   git clone https://github.com/YousefEl-Basuony/Algorithm_Project.git
   cd Algorithm_Project/Project_2
   ```
2. Open `index.html` directly in any web browser:
   * **Windows:** Double-click `index.html` or run:
     ```powershell
     Start-Process index.html
     ```
   * **Mac / Linux:**
     ```bash
     open index.html # Mac
     xdg-open index.html # Linux
     ```
