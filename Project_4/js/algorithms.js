/**
 * BFS and DFS Algorithm Timeline Generators
 * Generates an immutable, step-by-step execution timeline for interactive
 * forward/backward scrubbing, pseudocode synchronization, and live data structure inspector.
 */

const ALGORITHM_METADATA = {
  bfs: {
    name: 'Breadth-First Search (BFS)',
    dataStructure: 'Queue',
    policy: 'FIFO (First-In, First-Out)',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    pseudocode: [
      'function BFS(Graph, startNode):',
      '    create a queue Q',
      '    Q.enqueue(startNode)',
      '    mark startNode as visited',
      '    while Q is not empty:',
      '        u = Q.dequeue()',
      '        process(u)',
      '        for each neighbor v of u:',
      '            if v is not visited:',
      '                mark v as visited',
      '                Q.enqueue(v)'
    ]
  },
  dfs: {
    name: 'Depth-First Search (DFS)',
    dataStructure: 'Stack',
    policy: 'LIFO (Last-In, First-Out)',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    pseudocode: [
      'function DFS(Graph, startNode):',
      '    create a stack S',
      '    S.push(startNode)',
      '    while S is not empty:',
      '        u = S.pop()',
      '        if u is not visited:',
      '            mark u as visited',
      '            process(u)',
      '            for each neighbor v of u (in reverse):',
      '                if v is not visited:',
      '                    S.push(v)'
    ]
  }
};

class AlgorithmEngine {
  /**
   * Generates complete BFS Timeline
   */
  static generateBFSTimeline(graph, startNodeId) {
    const timeline = [];
    const startNode = graph.getNode(startNodeId);
    if (!startNode) return timeline;

    const visitedSet = new Set();
    const queue = [];
    const traversalOrder = [];
    const edgeStates = new Map(); // edgeId -> 'traversed' | 'tree'

    // Step 0: Initialization
    timeline.push({
      stepIndex: 0,
      type: 'init',
      codeLine: 1,
      currentNodeId: null,
      activeEdgeId: null,
      visitedNodeIds: [],
      dataStructure: [],
      dataStructureName: 'Queue',
      traversalOrder: [],
      description: `Initializing Breadth-First Search starting at node [${startNode.label}]. Queue initialized empty.`,
      soundEffect: null
    });

    // Step 1: Enqueue start node & mark visited
    queue.push(startNodeId);
    visitedSet.add(startNodeId);
    traversalOrder.push(startNode.label);

    timeline.push({
      stepIndex: 1,
      type: 'enqueue',
      codeLine: 3,
      currentNodeId: startNodeId,
      activeEdgeId: null,
      visitedNodeIds: Array.from(visitedSet),
      dataStructure: [...queue],
      dataStructureName: 'Queue',
      traversalOrder: [...traversalOrder],
      description: `Enqueue start node [${startNode.label}] into Queue and mark as visited.`,
      soundEffect: 'enqueue'
    });

    let stepCounter = 2;

    // While loop
    while (queue.length > 0) {
      // Step: Check while condition
      timeline.push({
        stepIndex: stepCounter++,
        type: 'check_loop',
        codeLine: 5,
        currentNodeId: null,
        activeEdgeId: null,
        visitedNodeIds: Array.from(visitedSet),
        dataStructure: [...queue],
        dataStructureName: 'Queue',
        traversalOrder: [...traversalOrder],
        description: `Queue has ${queue.length} element(s). Proceeding to next iteration.`,
        soundEffect: null
      });

      // Dequeue
      const u = queue.shift();
      const uNode = graph.getNode(u);

      timeline.push({
        stepIndex: stepCounter++,
        type: 'dequeue',
        codeLine: 6,
        currentNodeId: u,
        activeEdgeId: null,
        visitedNodeIds: Array.from(visitedSet),
        dataStructure: [...queue],
        dataStructureName: 'Queue',
        traversalOrder: [...traversalOrder],
        description: `Dequeued [${uNode.label}] from Queue front. Currently processing node [${uNode.label}].`,
        soundEffect: 'dequeue'
      });

      // Process node
      timeline.push({
        stepIndex: stepCounter++,
        type: 'process',
        codeLine: 7,
        currentNodeId: u,
        activeEdgeId: null,
        visitedNodeIds: Array.from(visitedSet),
        dataStructure: [...queue],
        dataStructureName: 'Queue',
        traversalOrder: [...traversalOrder],
        description: `Inspecting neighbors of node [${uNode.label}].`,
        soundEffect: 'visitNode'
      });

      // Get neighbors
      const neighbors = graph.getNeighbors(u);

      if (neighbors.length === 0) {
        timeline.push({
          stepIndex: stepCounter++,
          type: 'no_neighbors',
          codeLine: 8,
          currentNodeId: u,
          activeEdgeId: null,
          visitedNodeIds: Array.from(visitedSet),
          dataStructure: [...queue],
          dataStructureName: 'Queue',
          traversalOrder: [...traversalOrder],
          description: `Node [${uNode.label}] has no outgoing unvisited connections.`,
          soundEffect: null
        });
      }

      for (const { nodeId: v, edgeId } of neighbors) {
        const vNode = graph.getNode(v);

        // Inspect neighbor step
        timeline.push({
          stepIndex: stepCounter++,
          type: 'inspect_neighbor',
          codeLine: 8,
          currentNodeId: u,
          activeEdgeId: edgeId,
          visitedNodeIds: Array.from(visitedSet),
          dataStructure: [...queue],
          dataStructureName: 'Queue',
          traversalOrder: [...traversalOrder],
          description: `Evaluating edge ([${uNode.label}] ➔ [${vNode.label}])...`,
          soundEffect: null
        });

        if (!visitedSet.has(v)) {
          visitedSet.add(v);
          queue.push(v);
          traversalOrder.push(vNode.label);
          edgeStates.set(edgeId, 'tree');

          // Mark visited
          timeline.push({
            stepIndex: stepCounter++,
            type: 'visit',
            codeLine: 10,
            currentNodeId: v,
            activeEdgeId: edgeId,
            visitedNodeIds: Array.from(visitedSet),
            dataStructure: [...queue],
            dataStructureName: 'Queue',
            traversalOrder: [...traversalOrder],
            description: `Neighbor [${vNode.label}] is unvisited! Marked as visited.`,
            soundEffect: 'visitNode'
          });

          // Enqueue neighbor
          timeline.push({
            stepIndex: stepCounter++,
            type: 'enqueue',
            codeLine: 11,
            currentNodeId: v,
            activeEdgeId: edgeId,
            visitedNodeIds: Array.from(visitedSet),
            dataStructure: [...queue],
            dataStructureName: 'Queue',
            traversalOrder: [...traversalOrder],
            description: `Pushed [${vNode.label}] to the rear of the Queue.`,
            soundEffect: 'enqueue'
          });
        } else {
          timeline.push({
            stepIndex: stepCounter++,
            type: 'already_visited',
            codeLine: 9,
            currentNodeId: u,
            activeEdgeId: edgeId,
            visitedNodeIds: Array.from(visitedSet),
            dataStructure: [...queue],
            dataStructureName: 'Queue',
            traversalOrder: [...traversalOrder],
            description: `Neighbor [${vNode.label}] has already been visited. Skipping.`,
            soundEffect: null
          });
        }
      }
    }

    // Traversal complete
    timeline.push({
      stepIndex: stepCounter++,
      type: 'complete',
      codeLine: 12,
      currentNodeId: null,
      activeEdgeId: null,
      visitedNodeIds: Array.from(visitedSet),
      dataStructure: [],
      dataStructureName: 'Queue',
      traversalOrder: [...traversalOrder],
      description: `BFS Traversal Complete! Visited ${visitedSet.size} of ${graph.nodes.size} nodes. Traversal sequence: ${traversalOrder.join(' ➔ ')}`,
      soundEffect: 'complete'
    });

    return timeline;
  }

  /**
   * Generates complete DFS Timeline
   */
  static generateDFSTimeline(graph, startNodeId) {
    const timeline = [];
    const startNode = graph.getNode(startNodeId);
    if (!startNode) return timeline;

    const visitedSet = new Set();
    const stack = [];
    const traversalOrder = [];
    const backtrackHistory = [];

    // Step 0: Init
    timeline.push({
      stepIndex: 0,
      type: 'init',
      codeLine: 1,
      currentNodeId: null,
      activeEdgeId: null,
      visitedNodeIds: [],
      dataStructure: [],
      dataStructureName: 'Stack',
      traversalOrder: [],
      description: `Initializing Depth-First Search starting at node [${startNode.label}]. Stack initialized empty.`,
      soundEffect: null
    });

    // Push start node to stack
    stack.push({ nodeId: startNodeId, edgeFrom: null });
    let stepCounter = 1;

    timeline.push({
      stepIndex: stepCounter++,
      type: 'push',
      codeLine: 2,
      currentNodeId: startNodeId,
      activeEdgeId: null,
      visitedNodeIds: [],
      dataStructure: stack.map(s => s.nodeId),
      dataStructureName: 'Stack',
      traversalOrder: [],
      description: `Pushed start node [${startNode.label}] onto the Stack.`,
      soundEffect: 'enqueue'
    });

    while (stack.length > 0) {
      // Check loop condition
      timeline.push({
        stepIndex: stepCounter++,
        type: 'check_loop',
        codeLine: 3,
        currentNodeId: null,
        activeEdgeId: null,
        visitedNodeIds: Array.from(visitedSet),
        dataStructure: stack.map(s => s.nodeId),
        dataStructureName: 'Stack',
        traversalOrder: [...traversalOrder],
        description: `Stack has ${stack.length} element(s). Top of stack will be popped.`,
        soundEffect: null
      });

      // Pop from stack
      const { nodeId: u, edgeFrom } = stack.pop();
      const uNode = graph.getNode(u);

      timeline.push({
        stepIndex: stepCounter++,
        type: 'pop',
        codeLine: 4,
        currentNodeId: u,
        activeEdgeId: edgeFrom,
        visitedNodeIds: Array.from(visitedSet),
        dataStructure: stack.map(s => s.nodeId),
        dataStructureName: 'Stack',
        traversalOrder: [...traversalOrder],
        description: `Popped [${uNode.label}] from Stack.`,
        soundEffect: 'dequeue'
      });

      if (!visitedSet.has(u)) {
        visitedSet.add(u);
        traversalOrder.push(uNode.label);

        // Mark visited and process
        timeline.push({
          stepIndex: stepCounter++,
          type: 'visit',
          codeLine: 6,
          currentNodeId: u,
          activeEdgeId: edgeFrom,
          visitedNodeIds: Array.from(visitedSet),
          dataStructure: stack.map(s => s.nodeId),
          dataStructureName: 'Stack',
          traversalOrder: [...traversalOrder],
          description: `Node [${uNode.label}] marked as visited. Processing node.`,
          soundEffect: 'visitNode'
        });

        // Get neighbors and reverse them so that when pushed to stack, they are popped alphabetically
        const neighbors = graph.getNeighbors(u);
        const unvisitedNeighbors = neighbors.filter(n => !visitedSet.has(n.nodeId));

        if (unvisitedNeighbors.length === 0) {
          timeline.push({
            stepIndex: stepCounter++,
            type: 'dead_end',
            codeLine: 8,
            currentNodeId: u,
            activeEdgeId: null,
            visitedNodeIds: Array.from(visitedSet),
            dataStructure: stack.map(s => s.nodeId),
            dataStructureName: 'Stack',
            traversalOrder: [...traversalOrder],
            description: `Node [${uNode.label}] has reached a branch end (all neighbors explored). Backtracking...`,
            soundEffect: 'backtrack'
          });
        } else {
          // Push neighbors in reverse order
          const reversed = [...neighbors].reverse();
          for (const { nodeId: v, edgeId } of reversed) {
            const vNode = graph.getNode(v);
            if (!visitedSet.has(v)) {
              stack.push({ nodeId: v, edgeFrom: edgeId });

              timeline.push({
                stepIndex: stepCounter++,
                type: 'push',
                codeLine: 10,
                currentNodeId: v,
                activeEdgeId: edgeId,
                visitedNodeIds: Array.from(visitedSet),
                dataStructure: stack.map(s => s.nodeId),
                dataStructureName: 'Stack',
                traversalOrder: [...traversalOrder],
                description: `Pushed unvisited neighbor [${vNode.label}] onto Stack.`,
                soundEffect: 'enqueue'
              });
            } else {
              timeline.push({
                stepIndex: stepCounter++,
                type: 'already_visited',
                codeLine: 9,
                currentNodeId: u,
                activeEdgeId: edgeId,
                visitedNodeIds: Array.from(visitedSet),
                dataStructure: stack.map(s => s.nodeId),
                dataStructureName: 'Stack',
                traversalOrder: [...traversalOrder],
                description: `Neighbor [${vNode.label}] was already visited. Not pushed to Stack.`,
                soundEffect: null
              });
            }
          }
        }
      } else {
        timeline.push({
          stepIndex: stepCounter++,
          type: 'already_visited_pop',
          codeLine: 5,
          currentNodeId: u,
          activeEdgeId: edgeFrom,
          visitedNodeIds: Array.from(visitedSet),
          dataStructure: stack.map(s => s.nodeId),
          dataStructureName: 'Stack',
          traversalOrder: [...traversalOrder],
          description: `[${uNode.label}] was popped but already visited in an earlier branch. Skipping.`,
          soundEffect: null
        });
      }
    }

    // Complete
    timeline.push({
      stepIndex: stepCounter++,
      type: 'complete',
      codeLine: 11,
      currentNodeId: null,
      activeEdgeId: null,
      visitedNodeIds: Array.from(visitedSet),
      dataStructure: [],
      dataStructureName: 'Stack',
      traversalOrder: [...traversalOrder],
      description: `DFS Traversal Complete! Visited ${visitedSet.size} of ${graph.nodes.size} nodes. Traversal sequence: ${traversalOrder.join(' ➔ ')}`,
      soundEffect: 'complete'
    });

    return timeline;
  }
}

window.ALGORITHM_METADATA = ALGORITHM_METADATA;
window.AlgorithmEngine = AlgorithmEngine;

