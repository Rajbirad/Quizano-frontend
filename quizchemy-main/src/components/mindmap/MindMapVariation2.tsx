import React, { useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface MindMapNode {
  name: string;
  children?: MindMapNode[];
  description?: string;
}

interface MindMapTheme {
  id: string;
  name: string;
  colors: {
    root: string;
    level1: string;
    level2: string;
    level3: string;
    level4: string;
    text: string;
    link: string;
    background: string;
  };
}

interface MindMapVariation2Props {
  data: MindMapNode;
  theme?: MindMapTheme;
}

export const MindMapVariation2: React.FC<MindMapVariation2Props> = ({ data, theme }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const customPositionsRef = useRef<Map<string, {x: number, y: number}>>(new Map());

  // Generate a stable key for this mindmap
  const getMindmapKey = (data: MindMapNode): string => {
    const getNodeText = (node: MindMapNode): string => node.name || "";
    return `mindmap_v2_positions_${getNodeText(data).slice(0, 30).replace(/\s+/g, '_')}`;
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
    if (!svgRef.current || !data || !data.name) return;

    const getNodeText = (node: MindMapNode): string => node.name || "Untitled";

    // Load saved positions for this mindmap
    const mindmapKey = getMindmapKey(data);
    customPositionsRef.current = loadSavedPositions(mindmapKey);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    svg.attr("width", width).attr("height", height);

    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Create hierarchy - handle single child wrapper
    let hierarchyData: d3.HierarchyNode<MindMapNode>;
    const shouldSkipRoot = data.children && data.children.length === 1 && 
                          data.children[0].children && data.children[0].children.length > 0;

    if (shouldSkipRoot) {
      hierarchyData = d3.hierarchy(data.children[0]);
    } else {
      hierarchyData = d3.hierarchy(data);
    }

    // Tree layout - reduced spacing for compact view
    const treeLayout = d3.tree<MindMapNode>().nodeSize([120, 260]);
    const treeData = treeLayout(hierarchyData) as any;

    const nodes = treeData.descendants();
    const links = treeData.links();

    // Swap x & y for horizontal layout
    nodes.forEach((d: any) => {
      const oldX = d.x;
      d.x = d.y;
      d.y = oldX;
    });

    // Position root at center
    const rootNode = nodes.find((d: any) => d.depth === 0);
    if (rootNode) {
      rootNode.x = 0;
      rootNode.y = 0;
    }

    // Split children left/right
    const depth1Children = nodes.filter((d: any) => d.depth === 1);
    const halfCount = Math.ceil(depth1Children.length / 2);
    const verticalSpacing = 600; // Vertical spacing between branches

    depth1Children.forEach((child: any, index: number) => {
      const isLeft = index < halfCount;
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

      // Calculate vertical offset for this branch
      let verticalIndex;
      if (isLeft) {
        verticalIndex = index - (halfCount - 1) / 2; // Center around 0
      } else {
        verticalIndex = (index - halfCount) - (Math.floor((depth1Children.length - halfCount) / 2)); // Center around 0
      }
      
      const baseYOffset = verticalIndex * verticalSpacing;
      const branchOriginalY = child.y;

      allDescendants.forEach((node: any) => {
        if (isLeft) {
          node.x = -Math.abs(node.x);
        } else {
          node.x = Math.abs(node.x);
        }
        
        // Adjust Y position to spread branches vertically
        const relativeYInBranch = node.y - branchOriginalY;
        node.y = baseYOffset + relativeYInBranch;
      });
    });

    // Apply saved custom positions AFTER all transformations
    nodes.forEach((node: any) => {
      const nodeText = getNodeText(node.data);
      const savedPos = customPositionsRef.current.get(nodeText);
      if (savedPos) {
        node.x = savedPos.x;
        node.y = savedPos.y;
      }
    });

    // Use theme colors or fallback to default palette - same as other views
    const colors = theme ? [
      theme.colors.level1,
      theme.colors.level2,
      theme.colors.level3,
      theme.colors.level4,
    ] : ['#CC7600', '#CC1075', '#AA0F2E', '#7A1D87', '#008855', '#004D99'];
    
    // Get node color
    const getNodeColor = (depth: number, index: number): string => {
      if (depth === 0) return theme?.colors.root || '#6B7280';
      return colors[(index) % colors.length];
    };

    // Function to darken a color for better line visibility
    const darkenColor = (color: string, percent: number = 30): string => {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      const newR = Math.max(0, Math.floor(r * (1 - percent / 100)));
      const newG = Math.max(0, Math.floor(g * (1 - percent / 100)));
      const newB = Math.max(0, Math.floor(b * (1 - percent / 100)));
      
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    };

    // Function to get line color - darker version for visibility
    const getLineColor = (index: number): string => {
      return darkenColor(colors[index % colors.length], 25);
    };

    // Draw curved links - shorten links to leaf nodes
    g.selectAll(".link")
      .data(links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", (d: any) => {
        // Check if target is a leaf node (no children)
        const isLeafNode = !d.target.data.children || d.target.data.children.length === 0;
        const offsetX = isLeafNode ? 20 : 0; // Stop 20px before leaf nodes
        
        return d3.linkHorizontal()
          .x((d: any) => d.x)
          .y((d: any) => d.y)({
            source: d.source,
            target: { x: d.target.x - offsetX, y: d.target.y }
          });
      })
      .style("fill", "none")
      .style("stroke", (d: any, i: number) => {
        const depth1Index = depth1Children.findIndex((n: any) => {
          // Find which depth-1 branch this link belongs to
          let current = d.target;
          while (current.depth > 1) {
            current = current.parent;
          }
          return current === n;
        });
        return depth1Index >= 0 ? getLineColor(depth1Index) : '#000000';
      })
      .style("stroke-width", (d: any) => d.target.depth === 1 ? 3 : 3)
      .style("opacity", 1);

    // Draw nodes - NO BOXES, just text
    const node = g.selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`)
      .style("cursor", "move");

    // Add drag behavior to nodes
    const drag = d3.drag<SVGGElement, any>()
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
          return d3.linkHorizontal()
            .x((d: any) => d.x)
            .y((d: any) => d.y)(linkData);
        });
      })
      .on("end", function(event, d) {
        d3.select(this).style("cursor", "move");
        // Save all positions to localStorage
        const mindmapKey = getMindmapKey(data);
        savePositions(mindmapKey, customPositionsRef.current);
      });

    // Apply drag behavior to all nodes
    node.call(drag);

    // Add transparent rect for drag hit area BEFORE text
    node.each(function(d: any) {
      const nodeGroup = d3.select(this);
      const nodeText = d.data.name || "Untitled";
      
      // Estimate text dimensions
      const fontSize =
        d.depth === 0 ? 20 :
        d.depth === 1 ? 16 :
        13;
      const words = nodeText.split(/\s+/);
      const maxCharsPerLine = d.depth <= 1 ? 22 : 28;
      const lines: string[] = [];
      let currentLine = "";

      words.forEach((word: string) => {
        if ((currentLine + word).length > maxCharsPerLine && currentLine) {
          lines.push(currentLine.trim());
          currentLine = word + " ";
        } else {
          currentLine += word + " ";
        }
      });
      if (currentLine) lines.push(currentLine.trim());

      const lineHeight = fontSize + 2;
      const textHeight = lines.length * lineHeight;
      const textWidth = Math.max(...lines.map(l => l.length)) * fontSize * 0.6;
      
      // Add transparent rectangle for hit area
      nodeGroup.insert("rect", ":first-child")
        .attr("x", -textWidth / 2 - 10)
        .attr("y", -textHeight / 2 - 5)
        .attr("width", textWidth + 20)
        .attr("height", textHeight + 10)
        .style("fill", "transparent")
        .style("cursor", "move");
    });

    // Add text
    node.each(function(d: any, i: number) {
      const nodeGroup = d3.select(this);
      const nodeText = d.data.name || "Untitled";
      const fontSize =
        d.depth === 0 ? 24 :
        d.depth === 1 ? 20 :
        16;
      const fontWeight = d.depth === 0 ? "700" : d.depth === 1 ? "700" : "600";
      
      // All text in dark gray
      const color = '#2d3748';

      // Simple text wrapping
      const words = nodeText.split(/\s+/);
      const maxCharsPerLine = d.depth <= 1 ? 22 : 28;
      const lines: string[] = [];
      let currentLine = "";

      words.forEach((word: string) => {
        if ((currentLine + word).length > maxCharsPerLine && currentLine) {
          lines.push(currentLine.trim());
          currentLine = word + " ";
        } else {
          currentLine += word + " ";
        }
      });
      if (currentLine) lines.push(currentLine.trim());

      const lineHeight = fontSize + 2;
      const startY = -(lines.length - 1) * lineHeight / 2;

      lines.forEach((line: string, i: number) => {
        // Add white background stroke for clearing lines - thicker for better clearance
        nodeGroup.append("text")
          .attr("x", 0)
          .attr("y", startY + i * lineHeight)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .style("font-family", "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif")
          .style("font-size", `${fontSize}px`)
          .style("font-weight", fontWeight)
          .style("fill", "none")
          .style("stroke", "white")
          .style("stroke-width", "5px")
          .style("stroke-linecap", "round")
          .style("stroke-linejoin", "round")
          .style("pointer-events", "none")
          .text(line);
        
        // Add sharp colored text on top
        nodeGroup.append("text")
          .attr("x", 0)
          .attr("y", startY + i * lineHeight)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .style("font-family", "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif")
          .style("font-size", `${fontSize}px`)
          .style("font-weight", fontWeight)
          .style("fill", color)
          .style("pointer-events", "none")
          .text(line);
      });
    });

    // Center the view with higher zoom for more compact appearance
    const scale = 0.7;
    const centerX = width / 2;
    const centerY = height / 2;
    
    svg.call(zoom.transform, d3.zoomIdentity.translate(centerX, centerY).scale(scale));

  }, [data, theme]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg overflow-hidden"
      style={{ minHeight: "400px" }}
    >
      <svg
        ref={svgRef}
        className="w-full h-full cursor-move"
        style={{ display: "block" }}
      />
    </div>
  );
};
