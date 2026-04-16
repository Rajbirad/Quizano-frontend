import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import * as d3 from "d3";
import { MindMapTheme } from '@/utils/mindmap-themes';

interface MindMapNode {
  topic?: string; // Your API uses 'topic'
  name?: string; // Fallback for other formats
  id?: string;
  expanded?: boolean;
  children?: MindMapNode[];
}

interface D3MindMapProps {
  summary: MindMapNode;
  className?: string;
  theme?: MindMapTheme;
}

export interface D3MindMapRef {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}

interface D3Node extends d3.HierarchyNode<MindMapNode> {
  x: number;
  y: number;
  textWidth?: number;
  textHeight?: number;
}

const D3MindMap = forwardRef<D3MindMapRef, D3MindMapProps>(({ summary, className = "", theme }, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const customPositionsRef = useRef<Map<string, {x: number, y: number}>>(new Map());
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Default theme colors if no theme provided
  const defaultTheme: MindMapTheme = {
    id: 'default',
    name: 'Default',
    colors: {
      root: '#3b82f6',
      level1: '#60a5fa',
      level2: '#93c5fd',
      level3: '#dbeafe',
      level4: '#eff6ff',
      text: '#1e293b',
      link: '#94a3b8',
      background: '#ffffff',
    },
  };

  const activeTheme = theme || defaultTheme;
  const [showHint, setShowHint] = React.useState(true);

  // Expose zoom methods via ref
  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      if (svgRef.current && zoomBehaviorRef.current) {
        d3.select(svgRef.current)
          .transition()
          .duration(300)
          .call(zoomBehaviorRef.current.scaleBy, 1.3);
      }
    },
    zoomOut: () => {
      if (svgRef.current && zoomBehaviorRef.current) {
        d3.select(svgRef.current)
          .transition()
          .duration(300)
          .call(zoomBehaviorRef.current.scaleBy, 0.7);
      }
    },
    resetZoom: () => {
      if (svgRef.current && zoomBehaviorRef.current && containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        const centerX = width / 2;
        const centerY = height / 2;
        const scale = 0.5;
        
        d3.select(svgRef.current)
          .transition()
          .duration(500)
          .call(zoomBehaviorRef.current.transform, d3.zoomIdentity.translate(centerX, centerY).scale(scale));
      }
    },
  }));

  // Generate a stable key for this mindmap based on its content
  const getMindmapKey = (data: MindMapNode): string => {
    const getNodeText = (node: MindMapNode): string => node.topic || node.name || "";
    return `mindmap_positions_${getNodeText(data).slice(0, 30).replace(/\s+/g, '_')}`;
  };

  // Load saved positions from localStorage
  const loadSavedPositions = (mindmapKey: string): Map<string, {x: number, y: number}> => {
    const saved = localStorage.getItem(mindmapKey);
    if (saved) {
      try {
        const positions = JSON.parse(saved);
        return new Map(Object.entries(positions));
      } catch (e) {
        console.error('Failed to load saved positions:', e);
      }
    }
    return new Map();
  };

  // Save positions to localStorage
  const savePositions = (mindmapKey: string, positions: Map<string, {x: number, y: number}>) => {
    const positionsObj = Object.fromEntries(positions);
    localStorage.setItem(mindmapKey, JSON.stringify(positionsObj));
  };

  useEffect(() => {
    if (!svgRef.current || !summary) return;

    const getNodeText = (node: MindMapNode): string =>
      node.topic || node.name || "Untitled";

    const rootText = getNodeText(summary);
    if (!rootText || rootText === "Untitled") return;

    // Load saved positions for this mindmap
    const mindmapKey = getMindmapKey(summary);
    customPositionsRef.current = loadSavedPositions(mindmapKey);

    console.log("D3MindMap received data:", summary);
    console.log("Loaded custom positions:", customPositionsRef.current.size);

    // Check if root has unhelpful generic message
    const shouldSkipRoot = rootText.includes("does not provide enough information") || 
                          rootText.includes("extract a core technical topic") ||
                          rootText.includes("Unable to extract") ||
                          rootText.toLowerCase().includes("not enough information");

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    svg.attr("width", width).attr("height", height);

    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        // Hide hint on first interaction
        setShowHint(false);
      });
    
    // Store zoom behavior in ref for external control
    zoomBehaviorRef.current = zoom;
    svg.call(zoom);
    // Disable wheel zoom so page scrolling works naturally over the canvas.
    svg.on("wheel.zoom", null);

    // Create hierarchy - skip root if it has generic message
    let nodes: D3Node[];
    let links: d3.HierarchyLink<MindMapNode>[];

    if (shouldSkipRoot && summary.children && summary.children.length > 0) {
      // If root should be skipped and has children, create multiple trees from children
      const childTrees = summary.children.map(child => d3.hierarchy(child));
      
      // For now, let's take the first child as the main tree to avoid complexity
      const hierarchyData = childTrees[0];
      
      // Tree layout with dynamic sizing function
      const treeLayout = d3.tree<MindMapNode>().nodeSize([150, 350]);
      const treeData = treeLayout(hierarchyData) as D3Node;

      nodes = treeData.descendants();
      links = treeData.links();
    } else {
      // Normal hierarchy with root
      const hierarchyData = d3.hierarchy(summary);
      
      // Tree layout with dynamic sizing function
      const treeLayout = d3.tree<MindMapNode>().nodeSize([150, 350]);
      const treeData = treeLayout(hierarchyData) as D3Node;

      nodes = treeData.descendants();
      links = treeData.links();
    }

    // Swap x & y for horizontal layout
    nodes.forEach((d) => {
      const oldX = d.x;
      d.x = d.y;
      d.y = oldX;
    });
    
    // Get root and its immediate children
    const rootNode = nodes.find(d => d.depth === 0);
    if (rootNode) {
      rootNode.x = 0;
      rootNode.y = 0;
    }
    
    // Determine which level to split
    let depth1Children = nodes.filter(d => d.depth === 1);
    let splitDepth = 1;
    let childrenToSplit = depth1Children;
    
    // If only 1 child at depth 1, go deeper
    if (depth1Children.length === 1) {
      splitDepth = 2;
      childrenToSplit = nodes.filter(d => d.depth === 2);
      console.log('Single depth-1 child detected, splitting at depth 2');
      // Keep the single depth-1 node on the right side (positive x)
      if (depth1Children[0]) {
        depth1Children[0].x = Math.abs(depth1Children[0].x);
        depth1Children[0].y = 0; // Center it vertically
        console.log('Depth-1 node positioned at x:', depth1Children[0].x);
      }
    }
    
    const halfCount = Math.ceil(childrenToSplit.length / 2);
    console.log(`Splitting ${childrenToSplit.length} nodes at depth ${splitDepth}, half: ${halfCount}`);
    
    // Calculate vertical spacing for children on each side - reduced for better compactness
    const verticalSpacing = 1200; // Space between branches
    
    // Split children and their descendants into left and right
    childrenToSplit.forEach((child, index) => {
      const isLeft = index < halfCount;
      const originalX = child.x;
      
      // Calculate vertical offset for this branch
      let verticalIndex;
      if (isLeft) {
        verticalIndex = index - (halfCount - 1) / 2; // Center around 0
      } else {
        verticalIndex = (index - halfCount) - (Math.floor((childrenToSplit.length - halfCount) / 2)); // Center around 0
      }
      
      // Find all descendants of this child
      const allDescendants = [child];
      const findDescendants = (node: any) => {
        if (node.children) {
          node.children.forEach((childNode: any) => {
            allDescendants.push(childNode);
            findDescendants(childNode);
          });
        }
      };
      findDescendants(child);
      
      console.log(`Child ${index} (${isLeft ? 'LEFT' : 'RIGHT'}):`, child.data.name || child.data.topic, 
                  `- Original X: ${originalX}, Vertical index: ${verticalIndex}, ${allDescendants.length} descendants`);
      
      // Store the Y offset for this branch
      const baseYOffset = verticalIndex * verticalSpacing;
      
      // Get the original Y value of the main branch node before adjustment
      const branchOriginalY = child.y;
      
      // Position all nodes in this branch
      allDescendants.forEach(node => {
        const before = node.x;
        const beforeY = node.y;
        if (isLeft) {
          node.x = -Math.abs(node.x);
        } else {
          node.x = Math.abs(node.x);
        }
        
        // Adjust Y position: maintain relative position within branch + add base offset
        const relativeYInBranch = node.y - branchOriginalY;
        node.y = baseYOffset + relativeYInBranch;
        
        if (node === child) {
          console.log(`  -> Positioned at X: ${node.x} (was ${before}), Y: ${node.y} (base: ${baseYOffset}, relative: ${relativeYInBranch})`);
        }
      });
    });

    // Measure + wrap text
    const measureText = (
      text: string,
      fontSize: number,
      fontWeight: string = "normal"
    ) => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) return { width: 100, height: 20 };
      context.font = `${fontWeight} ${fontSize}px Inter, sans-serif`;
      const metrics = context.measureText(text);
      return { width: metrics.width, height: fontSize };
    };

    const wrapText = (
      text: string | undefined | null,
      maxWidth: number,
      fontSize: number
    ): { lines: string[]; width: number; height: number } => {
      if (!text) {
        return { lines: [""], width: 0, height: fontSize + 6 };
      }
      const words = text.split(/\s+/);
      const lines: string[] = [];
      let currentLine = "";
      let maxLineWidth = 0;

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const { width: testWidth } = measureText(testLine, fontSize);
        if (testWidth > maxWidth && currentLine) {
          lines.push(currentLine);
          const { width: lineWidth } = measureText(currentLine, fontSize);
          maxLineWidth = Math.max(maxLineWidth, lineWidth);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
        const { width: lineWidth } = measureText(currentLine, fontSize);
        maxLineWidth = Math.max(maxLineWidth, lineWidth);
      }

      return {
        lines,
        width: maxLineWidth,
        height: lines.length * (fontSize + 6),
      };
    };

    // Calculate text dimensions
    nodes.forEach((d) => {
      const fontSize = d.depth === 0 ? 24 : d.depth === 1 ? 22 : 20;
      const maxWidth = 260;
      const fontWeight = d.depth === 0 ? "bold" : "600";
      const nodeText = getNodeText(d.data);
      const wrappedText = wrapText(nodeText, maxWidth, fontSize);
      d.textWidth = wrappedText.width;
      d.textHeight = wrappedText.height;
    });

    // Apply saved custom positions AFTER all transformations
    nodes.forEach((d) => {
      const nodeText = getNodeText(d.data);
      const savedPos = customPositionsRef.current.get(nodeText);
      if (savedPos) {
        d.x = savedPos.x;
        d.y = savedPos.y;
      }
    });

    // Function to get node color based on depth using theme
    const getNodeColor = (depth: number): string => {
      switch (depth) {
        case 0: return activeTheme.colors.root;
        case 1: return activeTheme.colors.level1;
        case 2: return activeTheme.colors.level2;
        case 3: return activeTheme.colors.level3;
        default: return activeTheme.colors.level4;
      }
    };

    // Function to darken a color for better line visibility
    const darkenColor = (color: string, percent: number = 30): string => {
      // Convert hex to RGB
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      // Darken by reducing RGB values
      const newR = Math.max(0, Math.floor(r * (1 - percent / 100)));
      const newG = Math.max(0, Math.floor(g * (1 - percent / 100)));
      const newB = Math.max(0, Math.floor(b * (1 - percent / 100)));
      
      // Convert back to hex
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    };

    // Function to get line color - darker version of source node color
    const getLineColor = (depth: number): string => {
      const nodeColor = getNodeColor(depth);
      // Darken slightly for lighter levels (higher depth)
      const darkenPercent = depth >= 2 ? 25 : 15;
      return darkenColor(nodeColor, darkenPercent);
    };

    // Draw links
    g.selectAll(".link")
      .data(links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", (d) => {
        const source = d.source as D3Node;
        const target = d.target as D3Node;
        return `M${source.x},${source.y}
                C${(source.x + target.x) / 2},${source.y}
                 ${(source.x + target.x) / 2},${target.y}
                 ${target.x},${target.y}`;
      })
      .style("fill", "none")
      .style("stroke", (d) => {
        const source = d.source as D3Node;
        return getLineColor(source.depth);
      })
      .style("stroke-width", (d) => {
        const source = d.source as D3Node;
        // Make lines thicker for deeper levels to improve visibility
        return source.depth >= 2 ? 3 : 2;
      })
      .style("opacity", 1);

    // Draw nodes
    const node = g
      .selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x},${d.y})`)
      .style("cursor", "move");

    // Add drag behavior to nodes
    const drag = d3.drag<SVGGElement, D3Node>()
      .on("start", function(event, d) {
        d3.select(this).raise();
        d3.select(this).style("cursor", "grabbing");
      })
      .on("drag", function(event, d) {
        // Update node position
        d.x = event.x;
        d.y = event.y;
        
        // Save custom position
        const nodeText = getNodeText(d.data);
        customPositionsRef.current.set(nodeText, { x: d.x, y: d.y });
        
        // Move the node
        d3.select(this).attr("transform", `translate(${d.x},${d.y})`);
        
        // Update links connected to this node
        g.selectAll(".link").attr("d", function(linkData: any) {
          const source = linkData.source as D3Node;
          const target = linkData.target as D3Node;
          return `M${source.x},${source.y}
                  C${(source.x + target.x) / 2},${source.y}
                   ${(source.x + target.x) / 2},${target.y}
                   ${target.x},${target.y}`;
        });
      })
      .on("end", function(event, d) {
        d3.select(this).style("cursor", "move");
        // Save all positions to localStorage
        const mindmapKey = getMindmapKey(summary);
        savePositions(mindmapKey, customPositionsRef.current);
      });

    // Apply drag behavior to all nodes
    node.call(drag);

    // Background rects
    node
      .append("rect")
      .attr("width", (d) => (d.textWidth || 100) + 50)
      .attr("height", (d) => (d.textHeight || 30) + 30)
      .attr("x", (d) => -(d.textWidth || 100) / 2 - 25)
      .attr("y", (d) => -(d.textHeight || 30) / 2 - 15)
      .attr("rx", (d) => (d.depth === 0 ? 25 : 20))
      .attr("ry", (d) => (d.depth === 0 ? 25 : 20))
      .style("fill", (d) => getNodeColor(d.depth))
      .style("stroke", "#ffffff")
      .style("stroke-width", 2)
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.2))")
      .style("transition", "all 0.2s ease")
      .on("mouseenter", function() {
        d3.select(this)
          .style("filter", "drop-shadow(0 6px 12px rgba(0,0,0,0.3))")
          .attr("transform", "scale(1.05)");
      })
      .on("mouseleave", function() {
        d3.select(this)
          .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.2))")
          .attr("transform", "scale(1)");
      });

    // Text
    node.each(function (d) {
      const nodeGroup = d3.select(this);
      const fontSize = d.depth === 0 ? 24 : d.depth === 1 ? 22 : 20;
      const fontWeight = d.depth === 0 ? "bold" : "600";
      const maxWidth = 260;
      const nodeText = getNodeText(d.data);
      const wrappedText = wrapText(nodeText, maxWidth, fontSize);
      const lineHeight = fontSize + 6;
      const startY = -(wrappedText.lines.length - 1) * lineHeight / 2;

      wrappedText.lines.forEach((line, i) => {
        nodeGroup
          .append("text")
          .attr("x", 0)
          .attr("y", startY + i * lineHeight)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .style("font-family", "Inter, sans-serif")
          .style("font-size", `${fontSize}px`)
          .style("font-weight", fontWeight)
          .style("fill", d.depth === 0 || d.depth === 1 ? "#ffffff" : activeTheme.colors.text)
          .style("pointer-events", "none")
          .text(line);
      });
    });

    // Center on root node
    const scale = 0.5; // Balanced scale for readability
    
    // Root node is at (0, 0), center the viewport on it
    const centerX = width / 2;
    const centerY = height / 2;
    
    svg.call(zoom.transform, d3.zoomIdentity.translate(centerX, centerY).scale(scale));
  }, [summary, theme]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg overflow-hidden relative ${className}`}
      style={{ 
        minHeight: "400px",
        backgroundColor: activeTheme.colors.background 
      }}
    >
      <svg
        ref={svgRef}
        className="w-full h-full cursor-move"
        style={{ display: "block" }}
      />
      
      {/* Zoom instruction hint */}
      {showHint && (
        <div className="absolute top-4 right-4 pointer-events-none animate-pulse">
          <div className="bg-gradient-to-r from-blue-500/90 to-purple-500/90 backdrop-blur-sm px-6 py-3 rounded-full text-white text-sm font-semibold shadow-xl border border-white/20">
            💡 Hover & drag any node to reposition • Use controls to zoom • Drag background to pan
          </div>
        </div>
      )}
    </div>
  );
});

D3MindMap.displayName = 'D3MindMap';

export default D3MindMap;
