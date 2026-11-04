# 🚀 Algorithmic Engineering & Empirical Analysis

![Language](https://img.shields.io/badge/Language-Python%20%7C%20C++-blue)
![Course](https://img.shields.io/badge/Course-Design%20and%20Analysis%20of%20Algorithms-success)
![Status](https://img.shields.io/badge/Status-Active-brightgreen)

Welcome to the **Algorithm_Project** repository. This workspace is dedicated to the implementation, empirical testing, and formal theoretical analysis of core computer science algorithms. 

Throughout this repository, algorithms are not just written—they are stress-tested against mathematical models (Big-O Notation) to observe their real-world performance, execution time, and hardware constraints.

---

## 📂 Repository Projects & Roadmap

As the course progresses, new mini-projects and assignments will be continuously added to this repository. Each project resides in its own isolated directory containing the source code, unit tests, and a comprehensive mathematical/empirical report.

### 🟢 [Project 1: Empirical Analysis of Insertion Sort](./Project_1) *(Completed)*
* **Algorithm Focus:** Insertion Sort (In-place comparison sort).
* **Objective:** Implement the algorithm, count element comparisons and shifts, and analyze its running time empirically.
* **Analysis:** Detailed performance graphs comparing $O(n)$ and $O(n^2)$ theoretical complexities against real execution times for Sorted, Reverse-Sorted, and Random datasets ($n=100$ to $5000$).

### 🟡 [Project 2: Divide & Conquer Analysis] *(Upcoming)*
* **Anticipated Focus:** Implementation and empirical testing of $O(n \log n)$ algorithms (e.g., Merge Sort, Quick Sort).
* **Objective:** Comparing recursive overhead against iterative efficiency.

### 🟡 [Project 3: Advanced Data Structures & Graphs] *(Upcoming)*
* **Anticipated Focus:** Dynamic Programming, Graph Traversals (BFS/DFS), or Shortest Path algorithms.

---

## 🏗️ Architecture & Navigation

To maintain a clean and professional workspace, the repository is structured as follows:

```text
Algorithm_Project/
│
├── Project_1/                  # First Mini-Project Directory
│   ├── insertion_sort.py       # Core algorithm logic & Unit Tests
│   ├── README.md               # Detailed report & graphs specifically for Project 1
│   └── images/                 # Plots & visual assets
│
├── Project_2/                  # (Future Assignment)
│
└── README.md                   # This master index and documentation file




# Clone the repository
git clone [https://github.com/YousefEl-Basuony/Algorithm_Project.git](https://github.com/YousefEl-Basuony/Algorithm_Project.git)

# Navigate to the specific project
cd Algorithm_Project/Project_1

# Run the algorithm and tests
python insertion_sort.py