const express = require('express');

const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors());




const originalGraph = {
  nodes: [
    { id: 1, label: 'A', x: 100, y: 100 },
    { id: 2, label: 'B', x: 200, y: 100 },
    { id: 3, label: 'C', x: 300, y: 100 },
    { id: 4, label: 'D', x: 100, y: 200 },
    { id: 5, label: 'E', x: 200, y: 200 },
    { id: 6, label: 'F', x: 300, y: 200 },
    { id: 7, label: 'G', x: 100, y: 300 },
    { id: 8, label: 'H', x: 200, y: 300 },
    { id: 9, label: 'I', x: 300, y: 300 },
    { id: 10, label: 'J', x: 400, y: 200 }
  ],
  edges: [
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 1, to: 4 },
    { from: 2, to: 5 },
    { from: 3, to: 6 },
    { from: 4, to: 7 },
    { from: 5, to: 8 },
    { from: 6, to: 9 },
    { from: 4, to: 5 },
    { from: 5, to: 6 },
    { from: 7, to: 8 },
    { from: 8, to: 9 },
    { from: 6, to: 10 },
    { from: 10, to: 3 }
  ]
};

function calculateDegree(nodeId, edges) {
  return edges.filter(edge => edge.from === nodeId || edge.to === nodeId).length;
}

app.post('/api/verify/:nodeId', async (req, res) => {
  try {
    const selectedNode = parseInt(req.params.nodeId);
    const proofGraph = {
      nodes: req.body.nodes,
      edges: req.body.edges
    };
    const matchedOriginalNodes = new Set(req.body.matchedOriginalNodes || []);

    const selectedDegree = calculateDegree(selectedNode, proofGraph.edges);
    
    // Find matching nodes with same degree that haven't been matched yet
    const matchingNodes = originalGraph.nodes.filter(node => 
      calculateDegree(node.id, originalGraph.edges) === selectedDegree &&
      !matchedOriginalNodes.has(node.id)
    );

    if (matchingNodes.length === 0) {
      return res.status(200).json({
        isValid: false,
        message: 'No matching node found with the same degree',
        successRate: (matchedOriginalNodes.size * 10)
      });
    }

    // Pick first available matching node
    const matchingNode = matchingNodes[0];
    const newSuccessRate = (matchedOriginalNodes.size + 1) * 10;
    const remainingNodes = originalGraph.nodes.length - (matchedOriginalNodes.size + 1);

    let progressMessage = `Match found! Node ${selectedNode} corresponds to Node ${matchingNode.label}. `;
    if (remainingNodes > 0) {
      progressMessage += `Progress: ${newSuccessRate}%. ${remainingNodes} nodes remaining.`;
    } else {
      progressMessage += 'Congratulations! You have successfully matched all nodes!';
    }

    res.status(200).json({
      isValid: true,
      message: progressMessage,
      matchedNode: matchingNode.id,
      successRate: newSuccessRate,
      remainingNodes: remainingNodes
    });

  } catch (error) {
    console.error('Error verifying isomorphism:', error);
    res.status(500).json({ 
      isValid: false,
      message: 'Internal server error',
      successRate: 0
    });
  }
});
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Verifier server running on port ${PORT}`);
  });