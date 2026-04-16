import React, { useEffect, useRef, useState } from "react";

interface MindMapNode {
  name: string;
  children?: MindMapNode[];
}

interface CustomMindMapProps {
  summary: any;
}

export const CustomMindMap: React.FC<CustomMindMapProps> = ({ summary }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!summary || !svgRef.current || !containerRef.current) return;

    const svg = svgRef.current;
    const container = containerRef.current;

    // Clear previous content
    svg.innerHTML = '';

    // Convert API response to tree structure
    const convertToTreeNode = (node: any): MindMapNode => {
      if (typeof node === "string") {
        return { name: node };
      }
      
      return {
        name: node.name || node.topic || "Unknown",
        children: node.children ? node.children.map((child: any) => convertToTreeNode(child)) : undefined
      };
    };

    let rootNode: MindMapNode;

    // Handle different data formats - simplified for cleaner layout
    if (summary.mindmap) {
      console.log("CustomMindMap: Using mindmap format", summary.mindmap);
      rootNode = {
        name: summary.mindmap.topic,
        children: summary.mindmap.children.map((child: any) => convertToTreeNode(child))
      };
    } else if (summary.central_topic && summary.branches) {
      console.log("CustomMindMap: Using central_topic format", { central_topic: summary.central_topic, branches: summary.branches });
      // Simplified structure - only main branches without deep nesting
      rootNode = {
        name: summary.central_topic,
        children: summary.branches.map((branch: any) => ({
          name: branch.topic,
          children: branch.key_points ? branch.key_points.slice(0, 3).map((point: string) => ({ name: point })) : undefined
        }))
      };
    } else if (summary.topic && summary.children) {
      console.log("CustomMindMap: Using topic format", summary);
      rootNode = convertToTreeNode(summary);
    } else {
      console.error("CustomMindMap: No valid data format found", summary);
      return;
    }

    console.log("CustomMindMap: Final rootNode", rootNode);

    // Get container dimensions
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Set SVG dimensions
    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // Mind Elixir color scheme
    const colors = [
      '#4f46e5', // Root - Blue
      '#ef4444', // Level 1 - Red  
      '#10b981', // Level 2 - Green
      '#f59e0b', // Level 3 - Yellow
      '#8b5cf6', // Level 4 - Purple
      '#ec4899', // Level 5 - Pink
    ];

    // Calculate positions for clean linear Mind Elixir SIDE layout
    interface NodePosition {
      x: number;
      y: number;
      node: MindMapNode;
      level: number;
      parent?: NodePosition;
      side: 'left' | 'right';
    }

    const positions: NodePosition[] = [];
    const centerX = width / 2;
    const centerY = height / 2;

    // Add root node in center
    const rootPosition: NodePosition = {
      x: centerX,
      y: centerY,
      node: rootNode,
      level: 0,
      side: 'right'
    };
    positions.push(rootPosition);

    // Simple linear positioning like Mind Elixir SIDE
    if (rootNode.children && rootNode.children.length > 0) {
      const mainBranches = rootNode.children;
      const leftBranches = mainBranches.slice(0, Math.ceil(mainBranches.length / 2));
      const rightBranches = mainBranches.slice(Math.ceil(mainBranches.length / 2));

      // Position LEFT side branches
      leftBranches.forEach((branch, index) => {
        const x = centerX - 250; // Fixed distance from center
        const y = centerY + (index - (leftBranches.length - 1) / 2) * 100; // Spread vertically

        const branchPos: NodePosition = {
          x: x,
          y: y,
          node: branch,
          level: 1,
          parent: rootPosition,
          side: 'left'
        };
        positions.push(branchPos);

        // Add children of this branch (extending further left)
        if (branch.children && branch.children.length > 0) {
          branch.children.forEach((child, childIndex) => {
            const childPos: NodePosition = {
              x: x - 200, // Further left
              y: y + (childIndex - (branch.children!.length - 1) / 2) * 60,
              node: child,
              level: 2,
              parent: branchPos,
              side: 'left'
            };
            positions.push(childPos);
          });
        }
      });

      // Position RIGHT side branches
      rightBranches.forEach((branch, index) => {
        const x = centerX + 250; // Fixed distance from center
        const y = centerY + (index - (rightBranches.length - 1) / 2) * 100; // Spread vertically

        const branchPos: NodePosition = {
          x: x,
          y: y,
          node: branch,
          level: 1,
          parent: rootPosition,
          side: 'right'
        };
        positions.push(branchPos);

        // Add children of this branch (extending further right)
        if (branch.children && branch.children.length > 0) {
          branch.children.forEach((child, childIndex) => {
            const childPos: NodePosition = {
              x: x + 200, // Further right
              y: y + (childIndex - (branch.children!.length - 1) / 2) * 60,
              node: child,
              level: 2,
              parent: branchPos,
              side: 'right'
            };
            positions.push(childPos);
          });
        }
      });
    }

    console.log("CustomMindMap: Final positions", positions.map(p => ({ name: p.node.name, x: p.x, y: p.y, level: p.level, side: p.side })));

    // Create Mind Elixir style smooth horizontal curves
    const createMindElixirPath = (start: NodePosition, end: NodePosition): string => {
      const startX = start.x;
      const startY = start.y;
      const endX = end.x;
      const endY = end.y;
      
      // Mind Elixir SIDE mode curves - horizontal flow
      const midX = startX + (endX - startX) * 0.5;
      
      return `M ${startX} ${startY} Q ${midX} ${startY} ${midX} ${endY} T ${endX} ${endY}`;
    };

    // Draw connections (Mind Elixir style)
    positions.forEach(pos => {
      if (pos.parent) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', createMindElixirPath(pos.parent, pos));
        path.setAttribute('stroke', colors[Math.min(pos.level, colors.length - 1)]);
        path.setAttribute('stroke-width', '3');
        path.setAttribute('fill', 'none');
        path.setAttribute('opacity', '0.9');
        path.setAttribute('stroke-linecap', 'round');
        svg.appendChild(path);
      }
    });

    // Draw nodes (Mind Elixir style)
    positions.forEach(pos => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('class', 'mind-node');
      
      // Calculate text dimensions more accurately
      const fontSize = pos.level === 0 ? 16 : pos.level === 1 ? 14 : 12;
      const fontWeight = pos.level === 0 ? 'bold' : '600';
      const padding = pos.level === 0 ? 24 : 20;
      
      // More accurate text width calculation
      const avgCharWidth = fontSize * 0.6; // Increased character width for better accuracy
      const textWidth = pos.node.name.length * avgCharWidth;
      const maxWidth = pos.level === 0 ? 400 : 320; // Increased max width even more
      const minWidth = pos.level === 0 ? 180 : 140; // Increased min width
      const nodeWidth = Math.min(Math.max(textWidth + padding * 2, minWidth), maxWidth);
      const nodeHeight = pos.level === 0 ? 55 : 45; // Increased height

      // Create node background first
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', (pos.x - nodeWidth / 2).toString());
      rect.setAttribute('y', (pos.y - nodeHeight / 2).toString());
      rect.setAttribute('width', nodeWidth.toString());
      rect.setAttribute('height', nodeHeight.toString());
      rect.setAttribute('rx', (pos.level === 0 ? 25 : 20).toString());
      rect.setAttribute('fill', colors[Math.min(pos.level, colors.length - 1)]);
      rect.setAttribute('stroke', '#ffffff');
      rect.setAttribute('stroke-width', '2');
      rect.setAttribute('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))');
      
      group.appendChild(rect);

      // Better text wrapping with more generous space
      const maxCharsPerLine = Math.floor((nodeWidth - padding * 1.5) / avgCharWidth); // More conservative padding
      const words = pos.node.name.split(' ');
      let lines: string[] = [];
      let currentLine = '';

      words.forEach(word => {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        if (testLine.length > maxCharsPerLine && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });
      
      if (currentLine) {
        lines.push(currentLine);
      }

      // Allow more lines for longer text, but adjust node height accordingly
      if (lines.length > 2) {
        // Increase node height for more lines
        const newHeight = nodeHeight + (lines.length - 2) * 18; // Increased line spacing
        rect.setAttribute('height', newHeight.toString());
        rect.setAttribute('y', (pos.y - newHeight / 2).toString());
        
        // Limit to 4 lines maximum for better readability
        if (lines.length > 4) {
          lines = lines.slice(0, 4);
          lines[3] = lines[3].substring(0, Math.floor(maxCharsPerLine * 0.7)) + '...';
        }
      }

      // Add text lines
      const lineHeight = fontSize + 4; // Increased line spacing
      const totalTextHeight = lines.length * lineHeight;
      const startY = pos.y - totalTextHeight / 2 + lineHeight / 2;

      lines.forEach((line, lineIndex) => {
        const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textElement.textContent = line;
        textElement.setAttribute('x', pos.x.toString());
        textElement.setAttribute('y', (startY + lineIndex * lineHeight).toString());
        textElement.setAttribute('font-family', 'Inter, -apple-system, BlinkMacSystemFont, sans-serif');
        textElement.setAttribute('font-size', fontSize.toString());
        textElement.setAttribute('font-weight', fontWeight);
        textElement.setAttribute('text-anchor', 'middle');
        textElement.setAttribute('dominant-baseline', 'central');
        textElement.setAttribute('fill', '#ffffff');
        textElement.setAttribute('pointer-events', 'none'); // Prevent text from interfering with interactions
        group.appendChild(textElement);
      });

      svg.appendChild(group);
    });

  }, [summary, scale, offset]);

  // Mouse wheel zoom (like Mind Elixir)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.3, Math.min(3, prev * delta)));
  };

  // Pan functionality (like Mind Elixir)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!summary) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No mind map data available</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="custom-mind-map bg-white rounded-lg shadow-sm border"
      style={{
        width: "100%",
        height: "800px",
        overflow: "hidden",
        position: "relative",
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-800">Mind Map</h3>
        <p className="text-xs text-gray-600">Scroll to zoom • Drag to pan</p>
      </div>
      
      <div className="relative w-full h-full" style={{ background: '#fafafa' }}>
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{
            transform: `scale(${scale}) translate(${offset.x}px, ${offset.y}px)`,
            transformOrigin: 'center center'
          }}
        />
      </div>
    </div>
  );
};
