import React, { useState } from "react";
import Tree from "react-d3-tree";

export interface MindMapTreeNode {
  name: string;
  overview?: string;
  children?: MindMapTreeNode[];
}

function convertSummaryToTree(summary: any): MindMapTreeNode {
  // Convert summary JSON to tree format, using only short names for nodes
  const root: MindMapTreeNode = {
    name: summary.central_topic,
    overview: summary.overview,
    children: summary.branches.map((branch: any) => ({
      name: branch.topic,
      overview: branch.overview,
      children: branch.key_points?.map((point: string) => ({ name: point.length > 30 ? point.slice(0, 30) + "..." : point })) || [],
    })),
  };
  return root;
}

const renderCustomNode = ({ nodeDatum, toggleNode }: any) => (
  <g>
    <circle r={22} fill="#6366F1" stroke="#E0E7FF" strokeWidth={2} onClick={toggleNode} style={{ cursor: "pointer" }} />
    <text fill="white" fontSize={13} x={-nodeDatum.name.length * 3} dy=".35em" textAnchor="start">
      {nodeDatum.name}
    </text>
  </g>
);

export const MindMapTree: React.FC<{ summary: any }> = ({ summary }) => {
  const [selectedNode, setSelectedNode] = useState<MindMapTreeNode | null>(null);
  if (!summary) return null;
  const treeData = convertSummaryToTree(summary);
  return (
    <div style={{ width: "100%", height: "600px", position: "relative" }}>
      <Tree
        data={treeData}
        orientation="vertical" // fallback to vertical, but use custom layout
        zoomable
        collapsible
        translate={{ x: 400, y: 300 }}
        separation={{ siblings: 1.5, nonSiblings: 2 }}
        renderCustomNodeElement={renderCustomNode}
        pathFunc="elbow" // visually spreads branches
        onNodeClick={(nodeData) => {
          // nodeData is a HierarchyPointNode, extract data
          setSelectedNode(nodeData.data as MindMapTreeNode);
        }}
      />
      {selectedNode && (
        <div style={{ position: "absolute", top: 20, right: 20, background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #0002", padding: 16, minWidth: 220 }}>
          <h3 style={{ color: "#6366F1", marginBottom: 8 }}>{selectedNode.name}</h3>
          {selectedNode.overview && <p style={{ fontSize: 14, color: "#444" }}>{selectedNode.overview}</p>}
          <button style={{ marginTop: 8, background: "#6366F1", color: "#fff", border: "none", borderRadius: 4, padding: "4px 12px", cursor: "pointer" }} onClick={() => setSelectedNode(null)}>Close</button>
        </div>
      )}
    </div>
  );
};
