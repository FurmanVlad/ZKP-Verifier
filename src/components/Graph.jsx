import React, { useState } from 'react';
import './Graph.css';
const GraphIsomorphismProof = () => {
  const [originalGraph, setOriginalGraph] = useState({
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
  });
  
  const [proofGraph, setProofGraph] = useState({
    nodes: [
      { id: 1, label: '1', x: 100, y: 100 },
      { id: 2, label: '2', x: 200, y: 100 },
      { id: 3, label: '3', x: 300, y: 100 },
      { id: 4, label: '4', x: 100, y: 200 },
      { id: 5, label: '5', x: 200, y: 200 },
      { id: 6, label: '6', x: 300, y: 200 },
      { id: 7, label: '7', x: 100, y: 300 },
      { id: 8, label: '8', x: 200, y: 300 },
      { id: 9, label: '9', x: 300, y: 300 },
      { id: 10, label: '10', x: 400, y: 200 }
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
  });

  const [isProofStarted, setIsProofStarted] = useState(false);
  const [message, setMessage] = useState('');
  const [matchedNode, setMatchedNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [matchedNodes, setMatchedNodes] = useState(new Set());
  const [matchedOriginalNodes, setMatchedOriginalNodes] = useState(new Set());
  const [successRate, setSuccessRate] = useState(0);
  const totalNodes = originalGraph.nodes.length;
  const [draggingNode, setDraggingNode] = useState(null);

  const handleDragStart = (graph, nodeId, event) => {
    if (isProofStarted) return;

    const node =
      graph === 'original'
        ? originalGraph.nodes.find((n) => n.id === nodeId)
        : proofGraph.nodes.find((n) => n.id === nodeId);
  
    const offsetX = event.clientX - node.x;
    const offsetY = event.clientY - node.y;
  
    setDraggingNode({ graph, nodeId, offsetX, offsetY });
  };

  const handleDrag = (event) => {
    if (!draggingNode) return;
  
    const { graph, nodeId, offsetX, offsetY } = draggingNode;
    const updatedGraph =
      graph === 'original' ? { ...originalGraph } : { ...proofGraph };
  
    updatedGraph.nodes = updatedGraph.nodes.map((node) =>
      node.id === nodeId
        ? {
            ...node,
            x: event.clientX - offsetX,
            y: event.clientY - offsetY,
          }
        : node
    );
  
    if (graph === 'original') {
      setOriginalGraph(updatedGraph);
    } else {
      setProofGraph(updatedGraph);
    }
  };

  const handleDragEnd = () => {
    setDraggingNode(null);
  };

  const calculateDegree = (nodeId, edges) => {
    return edges.filter(edge => edge.from === nodeId || edge.to === nodeId).length;
  };

  const ProgressBar = () => {
  return (
    <div className="w-full bg-gray-200 rounded h-4 mt-4">
      <div
        className="bg-blue-500 h-full rounded transition-all duration-1000 ease-in-out"
        style={{
          width: `${(matchedNodes.size / originalGraph.nodes.length) * 100}%`,
          background: 'linear-gradient(45deg, #3b82f6 25%, #60a5fa 25%, #60a5fa 50%, #3b82f6 50%, #3b82f6 75%, #60a5fa 75%, #60a5fa)',
          backgroundSize: '40px 40px',
          animation: 'progressBarAnimation 1s linear infinite'
        }}
      >
      </div>
    </div>
  );
};

  const checkBasicIsomorphism = () => {
    if (originalGraph.nodes.length !== proofGraph.nodes.length) {
      setMessage('Graphs have different number of vertices');
      return false;
    }
    if (originalGraph.edges.length !== proofGraph.edges.length) {
      setMessage('Graphs have different number of edges');
      return false;
    }
    return true;
  };

  const startProof = () => {
    if (checkBasicIsomorphism()) {
      setIsProofStarted(true);
      setMessage('Select a node from the visible graph to find its match');
      setMatchedNode(null);
      setSelectedNode(null);
      setMatchedNodes(new Set());
      setMatchedOriginalNodes(new Set());
    }
  };

  const handleNodeClick = async (nodeId) => {
    if (!isProofStarted || matchedNodes.has(nodeId)) return;

    setSelectedNode(nodeId);
    
    try {
        const response = await fetch(`http://localhost:5000/api/verify/${nodeId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                nodes: proofGraph.nodes,
                edges: proofGraph.edges,
                matchedNodes: Array.from(matchedNodes),
                matchedOriginalNodes: Array.from(matchedOriginalNodes)
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.isValid) {
            const newMatchedNodes = new Set(matchedNodes);
            newMatchedNodes.add(nodeId);
            setMatchedNodes(newMatchedNodes);
            
            const newMatchedOriginalNodes = new Set(matchedOriginalNodes);
            newMatchedOriginalNodes.add(result.matchedNode);
            setMatchedOriginalNodes(newMatchedOriginalNodes);
            
            setSuccessRate(result.successRate);
            setMatchedNode(result.matchedNode);
        }
        setMessage(result.message);

    } catch (error) {
        console.error('Error during verification:', error);
        setMessage('Error communicating with verifier');
    }
  };

  const resetProof = () => {
    setIsProofStarted(false);
    setMessage('');
    setMatchedNode(null);
    setSelectedNode(null);
    setMatchedNodes(new Set());
    setMatchedOriginalNodes(new Set());
    setSuccessRate(0);
  };

  
// Modified return statement in GraphIsomorphismProof component. The rest remains the same.
return (
  <div className="container">
    <div className="graph-container"
    onMouseMove={handleDrag}
    onMouseUp={handleDragEnd}
    >   
      <div className="header">
        <h1 className="title">Graph Isomorphism Proof</h1>
        <p className="subtitle">Interactive visualization of graph isomorphism verification</p>
      </div>      

      <div className="button-container">
        <button
          onClick={startProof}
          disabled={isProofStarted}
          className="proof-button start-button"
        >
          Start Proof
        </button>
        <button
          onClick={resetProof}
          className="proof-button reset-button"
        >
          Reset
        </button>
      </div>

      {message && (
  <div className="mb-4">
    <div className={`p-3 rounded-lg ${
      message.includes('Match found') 
        ? 'bg-green-100 text-green-800 border border-green-200' 
        : 'bg-blue-100 text-blue-800 border border-blue-200'
    }`}>
      {message}
    </div>
    <div className="mt-4">
      <div className="text-lg font-semibold mb-2">
        Progress: {matchedNodes.size} out of {originalGraph.nodes.length} nodes matched
      </div>
      <div className="w-full bg-gray-200 rounded h-4 mt-4">
        <div
          className="bg-blue-500 h-full rounded transition-all duration-1000 ease-in-out animate-progress"
          style={{
            width: `${(matchedNodes.size / originalGraph.nodes.length) * 100}%`,
            background: 'linear-gradient(45deg, #3b82f6 25%, #60a5fa 25%, #60a5fa 50%, #3b82f6 50%, #3b82f6 75%, #60a5fa 75%, #60a5fa)',
            backgroundSize: '40px 40px'
          }}
        >
        </div>
      </div>
      {successRate >= 90 && matchedNodes.size !== originalGraph.nodes.length && (
        <h1 className="title">The Graph Is Isomorphic with at least 90% match!</h1>
      )}
      {matchedNodes.size === originalGraph.nodes.length && (
        <h1 className="title">Proof Complete! All nodes have been matched successfully!</h1>
      )}
    </div>
  </div>
)}
<div className="progress-bar">
  <div 
    className="progress-bar-fill"
    style={{
      width: `${(matchedNodes.size / originalGraph.nodes.length) * 100}%`
    }}
  />
</div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
        alignItems: 'start'
      }}>
        <div>
          <h3 className="title2">Original Graph</h3>
          <div className="border rounded-lg p-2 bg-slate-50">
            <svg 
              width="100%" 
              height="400" 
              viewBox="-50 -50 500 400"
              preserveAspectRatio="xMidYMid meet"
            >
              {originalGraph.edges.map((edge, index) => {
                const fromNode = originalGraph.nodes.find(n => n.id === edge.from);
                const toNode = originalGraph.nodes.find(n => n.id === edge.to);
                return (
                  <line
                    key={index}
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke="#666"
                    strokeWidth="2"
                  />
                );
              })}
              
              {originalGraph.nodes.map(node => (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="20"
                    fill={matchedOriginalNodes.has(node.id) ? '#22c55e' : 
                          matchedNode === node.id ? '#22c55e' : '#6366f1'}
                    stroke="#312e81"
                    strokeWidth="2"
                    onMouseDown={(event) =>
                      handleDragStart('original', node.id, event)}
                  />
                  <text
                    x={node.x}
                    y={node.y}
                    textAnchor="middle"
                    dy=".3em"
                    fill="white"
                    fontSize="14"
                    pointerEvents="none"
                  >
                    {node.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        <div>
          <h3 className="title2">Proof Graph</h3>
          <div className="border rounded-lg p-2 bg-slate-50">
            <svg 
              width="100%" 
              height="400" 
              viewBox="-50 -50 500 400"
              preserveAspectRatio="xMidYMid meet"
            >
              {proofGraph.edges.map((edge, index) => {
                const fromNode = proofGraph.nodes.find(n => n.id === edge.from);
                const toNode = proofGraph.nodes.find(n => n.id === edge.to);
                return (
                  <line
                    key={index}
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke="#666"
                    strokeWidth="2"
                  />
                );
              })}
              
              {proofGraph.nodes.map(node => (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="20"
                    fill={matchedNodes.has(node.id) ? '#22c55e' : 
                          selectedNode === node.id ? '#22c55e' : '#6366f1'}
                    stroke="#312e81"
                    strokeWidth="2"
                    onMouseDown={(event) =>
                      handleDragStart('proof', node.id, event)
                    }
                    onClick={() => handleNodeClick(node.id)}
                    style={{ cursor: isProofStarted && !matchedNodes.has(node.id) ? 'pointer' : 'default' }}
                    className={isProofStarted && !matchedNodes.has(node.id) ? 'hover:fill-indigo-500' : ''}
                  />
                  <text
                    x={node.x}
                    y={node.y}
                    textAnchor="middle"
                    dy=".3em"
                    fill="white"
                    fontSize="14"
                    pointerEvents="none"
                  >
                    {node.label}
                  </text>
                  {isProofStarted && (
                    <text
                      x={node.x}
                      y={node.y - 25}
                      textAnchor="middle"
                      fill="#1f2937"
                      fontSize="12"
                    >
                      deg: {calculateDegree(node.id, proofGraph.edges)}
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
);}

export default GraphIsomorphismProof;