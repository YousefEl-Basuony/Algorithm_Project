/**
 * Curated Graph Presets for BFS / DFS Visualizations
 */

const PRESETS = {
  binaryTree: {
    name: 'Binary Tree (Depth 3)',
    description: 'Perfect for comparing BFS Level-Order vs DFS Depth-First Pre-order traversal.',
    data: {
      isDirected: true,
      nextId: 8,
      nodes: [
        { id: 1, x: 450, y: 120, label: 'A', radius: 24 },
        { id: 2, x: 280, y: 240, label: 'B', radius: 24 },
        { id: 3, x: 620, y: 240, label: 'C', radius: 24 },
        { id: 4, x: 200, y: 380, label: 'D', radius: 24 },
        { id: 5, x: 360, y: 380, label: 'E', radius: 24 },
        { id: 6, x: 540, y: 380, label: 'F', radius: 24 },
        { id: 7, x: 700, y: 380, label: 'G', radius: 24 }
      ],
      edges: [
        { id: 'e_1_2', from: 1, to: 2, directed: true },
        { id: 'e_1_3', from: 1, to: 3, directed: true },
        { id: 'e_2_4', from: 2, to: 4, directed: true },
        { id: 'e_2_5', from: 2, to: 5, directed: true },
        { id: 'e_3_6', from: 3, to: 6, directed: true },
        { id: 'e_3_7', from: 3, to: 7, directed: true }
      ]
    }
  },

  petersen: {
    name: 'Petersen Graph (10 Nodes)',
    description: 'Iconic 3-regular graph with an outer 5-star and inner pentagram.',
    data: {
      isDirected: false,
      nextId: 11,
      nodes: (() => {
        const cx = 450, cy = 280;
        const rOuter = 180, rInner = 85;
        const nodes = [];
        const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        // Outer 5
        for (let i = 0; i < 5; i++) {
          const angle = (i * 72 - 90) * (Math.PI / 180);
          nodes.push({
            id: i + 1,
            x: Math.round(cx + rOuter * Math.cos(angle)),
            y: Math.round(cy + rOuter * Math.sin(angle)),
            label: labels[i],
            radius: 24
          });
        }
        // Inner 5
        for (let i = 0; i < 5; i++) {
          const angle = (i * 72 - 90) * (Math.PI / 180);
          nodes.push({
            id: i + 6,
            x: Math.round(cx + rInner * Math.cos(angle)),
            y: Math.round(cy + rInner * Math.sin(angle)),
            label: labels[i + 5],
            radius: 24
          });
        }
        return nodes;
      })(),
      edges: [
        // Outer pentagon
        { id: 'e_1_2', from: 1, to: 2, directed: false },
        { id: 'e_2_3', from: 2, to: 3, directed: false },
        { id: 'e_3_4', from: 3, to: 4, directed: false },
        { id: 'e_4_5', from: 4, to: 5, directed: false },
        { id: 'e_5_1', from: 5, to: 1, directed: false },
        // Spokes
        { id: 'e_1_6', from: 1, to: 6, directed: false },
        { id: 'e_2_7', from: 2, to: 7, directed: false },
        { id: 'e_3_8', from: 3, to: 8, directed: false },
        { id: 'e_4_9', from: 4, to: 9, directed: false },
        { id: 'e_5_10', from: 5, to: 10, directed: false },
        // Inner star
        { id: 'e_6_8', from: 6, to: 8, directed: false },
        { id: 'e_8_10', from: 8, to: 10, directed: false },
        { id: 'e_10_7', from: 10, to: 7, directed: false },
        { id: 'e_7_9', from: 7, to: 9, directed: false },
        { id: 'e_9_6', from: 9, to: 6, directed: false }
      ]
    }
  },

  cycleChord: {
    name: 'Cycle Network with Bridges',
    description: 'Graph with multiple alternating cycles showcasing depth vs breadth discovery.',
    data: {
      isDirected: false,
      nextId: 7,
      nodes: [
        { id: 1, x: 450, y: 110, label: 'A', radius: 24 },
        { id: 2, x: 620, y: 210, label: 'B', radius: 24 },
        { id: 3, x: 620, y: 370, label: 'C', radius: 24 },
        { id: 4, x: 450, y: 450, label: 'D', radius: 24 },
        { id: 5, x: 280, y: 370, label: 'E', radius: 24 },
        { id: 6, x: 280, y: 210, label: 'F', radius: 24 }
      ],
      edges: [
        { id: 'e_1_2', from: 1, to: 2, directed: false },
        { id: 'e_2_3', from: 2, to: 3, directed: false },
        { id: 'e_3_4', from: 3, to: 4, directed: false },
        { id: 'e_4_5', from: 4, to: 5, directed: false },
        { id: 'e_5_6', from: 5, to: 6, directed: false },
        { id: 'e_6_1', from: 6, to: 1, directed: false },
        { id: 'e_2_5', from: 2, to: 5, directed: false },
        { id: 'e_1_4', from: 1, to: 4, directed: false }
      ]
    }
  },

  gridMaze: {
    name: '3x3 Mesh Grid',
    description: 'Rectangular grid demonstrating radial wave expansion (BFS) vs snake exploration (DFS).',
    data: {
      isDirected: false,
      nextId: 10,
      nodes: [
        { id: 1, x: 300, y: 150, label: 'A', radius: 24 },
        { id: 2, x: 450, y: 150, label: 'B', radius: 24 },
        { id: 3, x: 600, y: 150, label: 'C', radius: 24 },
        { id: 4, x: 300, y: 280, label: 'D', radius: 24 },
        { id: 5, x: 450, y: 280, label: 'E', radius: 24 },
        { id: 6, x: 600, y: 280, label: 'F', radius: 24 },
        { id: 7, x: 300, y: 410, label: 'G', radius: 24 },
        { id: 8, x: 450, y: 410, label: 'H', radius: 24 },
        { id: 9, x: 600, y: 410, label: 'I', radius: 24 }
      ],
      edges: [
        // Horizontal
        { id: 'e_1_2', from: 1, to: 2, directed: false },
        { id: 'e_2_3', from: 2, to: 3, directed: false },
        { id: 'e_4_5', from: 4, to: 5, directed: false },
        { id: 'e_5_6', from: 5, to: 6, directed: false },
        { id: 'e_7_8', from: 7, to: 8, directed: false },
        { id: 'e_8_9', from: 8, to: 9, directed: false },
        // Vertical
        { id: 'e_1_4', from: 1, to: 4, directed: false },
        { id: 'e_4_7', from: 4, to: 7, directed: false },
        { id: 'e_2_5', from: 2, to: 5, directed: false },
        { id: 'e_5_8', from: 5, to: 8, directed: false },
        { id: 'e_3_6', from: 3, to: 6, directed: false },
        { id: 'e_6_9', from: 6, to: 9, directed: false }
      ]
    }
  }
};

window.PRESETS = PRESETS;

