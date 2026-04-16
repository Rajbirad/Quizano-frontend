import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from "react";
import * as d3 from "d3";
import { MindMapTheme } from '@/utils/mindmap-themes';
import { ChevronRight } from 'lucide-react';

interface MindMapNode {
  topic?: string;
  name?: string;
  id?: string;
  expanded?: boolean;
  children?: MindMapNode[];
  _children?: MindMapNode[]; // Hidden children when collapsed
}

interface D3MindMapExpandableProps {
  summary: MindMapNode;
  className?: string;
  theme?: MindMapTheme;
  centerRootOnInitialRender?: boolean;
  onContentSizeChange?: (size: { width: number; height: number }) => void;
}

export interface D3MindMapExpandableRef {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  expandAll: () => void;
  collapseAll: () => void;
}

interface D3Node extends d3.HierarchyNode<MindMapNode> {
  x: number;
  y: number;
  textWidth?: number;
  textHeight?: number;
  _children?: D3Node[];
}

const D3MindMapExpandable = forwardRef<D3MindMapExpandableRef, D3MindMapExpandableProps>(
  ({ summary, className = "", theme, centerRootOnInitialRender = false, onContentSizeChange }, ref) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
    const currentTransformRef = useRef<d3.ZoomTransform | null>(null);
    const isInitialRenderRef = useRef(true);
    const customPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
    const lastContentSizeRef = useRef<{ width: number; height: number } | null>(null);
    const [showHint, setShowHint] = useState(true);
    const [rootData, setRootData] = useState<MindMapNode | null>(null);

    // Default theme colors
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

    // Initialize data with collapse state
    useEffect(() => {
      if (summary) {
        const initializeNode = (node: MindMapNode, depth: number = 0): MindMapNode => {
          const newNode = { ...node };
          
          // Start with level 1 expanded, deeper levels collapsed
          if (newNode.children && newNode.children.length > 0) {
            if (depth >= 1) {
              // Collapse by default
              newNode._children = newNode.children.map(child => initializeNode(child, depth + 1));
              newNode.children = undefined;
            } else {
              // Keep expanded
              newNode.children = newNode.children.map(child => initializeNode(child, depth + 1));
            }
          }
          
          return newNode;
        };

        setRootData(initializeNode(summary));
      }
    }, [summary]);

    // Toggle children visibility with animation
    const toggleNode = (d: D3Node) => {
      const isExpanding = d.data._children && !d.data.children;
      
      if (d.data.children) {
        d.data._children = d.data.children;
        d.data.children = undefined;
      } else if (d.data._children) {
        d.data.children = d.data._children;
        d.data._children = undefined;
      }
      
      // If expanding, animate view to shift left (making room for right expansion)
      if (isExpanding && svgRef.current && currentTransformRef.current) {
        const svg = d3.select(svgRef.current);
        const currentTransform = currentTransformRef.current;
        
        // Shift view left by 120 pixels to reveal expanded content on the right
        const shiftAmount = -120;
        const newTransform = currentTransform.translate(shiftAmount, 0);
        
        svg.transition()
          .duration(400)
          .ease(d3.easeCubicOut)
          .call(zoomBehaviorRef.current!.transform, newTransform);
        
        currentTransformRef.current = newTransform;
      }
      
      // Trigger re-render
      setRootData({ ...rootData! });
    };

    // Expand all nodes
    const expandAll = () => {
      const expand = (node: MindMapNode): void => {
        if (node._children) {
          node.children = node._children;
          node._children = undefined;
        }
        if (node.children) {
          node.children.forEach(expand);
        }
      };
      if (rootData) {
        expand(rootData);
        setRootData({ ...rootData });
      }
    };

    // Collapse all nodes (except first level)
    const collapseAll = () => {
      const collapse = (node: MindMapNode, depth: number = 0): void => {
        if (node.children && depth >= 1) {
          node._children = node.children;
          node.children = undefined;
        }
        if (node.children) {
          node.children.forEach(child => collapse(child, depth + 1));
        }
        if (node._children) {
          node._children.forEach(child => collapse(child, depth + 1));
        }
      };
      if (rootData) {
        collapse(rootData);
        setRootData({ ...rootData });
      }
    };

    // Expose methods via ref
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
          const scale = 0.6;
          
          d3.select(svgRef.current)
            .transition()
            .duration(500)
            .call(zoomBehaviorRef.current.transform, d3.zoomIdentity.translate(centerX, centerY).scale(scale));
        }
      },
      expandAll,
      collapseAll,
    }));

    useEffect(() => {
      if (!svgRef.current || !rootData) return;

      const getNodeText = (node: MindMapNode): string =>
        node.topic || node.name || "Untitled";

      const svg = d3.select(svgRef.current);
      
      const container = containerRef.current;
      if (!container) return;

      const width = container.clientWidth;
      const height = container.clientHeight;

      svg.attr("width", width).attr("height", height);

      // Don't remove all elements on update - we'll update them instead
      let g = svg.select<SVGGElement>("g.mindmap-container");
      if (g.empty()) {
        g = svg.append("g").attr("class", "mindmap-container");
      }

      // Zoom behavior
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.2, 3])
        .on("zoom", (event) => {
          g.attr("transform", event.transform);
          currentTransformRef.current = event.transform;
          setShowHint(false);
        });
      
      zoomBehaviorRef.current = zoom;
      
      // Only set up zoom once
      if (!svg.property('__zoom_initialized__')) {
        svg.call(zoom);
        // Disable wheel zoom so page scrolling works naturally over the canvas.
        svg.on("wheel.zoom", null);
        svg.property('__zoom_initialized__', true);
      }
      
      // Restore previous transform if it exists (after expand/collapse)
      if (currentTransformRef.current && !isInitialRenderRef.current) {
        g.attr("transform", currentTransformRef.current.toString());
      }

      // Create hierarchy
      const hierarchyData = d3.hierarchy(rootData);
      
      // Tree layout with spacing for horizontal layout
      const treeLayout = d3.tree<MindMapNode>().nodeSize([120, 300]);
      const treeData = treeLayout(hierarchyData) as D3Node;

      const nodes = treeData.descendants();
      const links = treeData.links();

      // Swap x & y for horizontal layout (root on left)
      nodes.forEach((d) => {
        const oldX = d.x;
        d.x = d.y;
        d.y = oldX;
      });

      // Apply saved custom positions AFTER layout calculations
      nodes.forEach((d) => {
        const nodeText = getNodeText(d.data);
        const savedPos = customPositionsRef.current.get(nodeText);
        if (savedPos) {
          d.x = savedPos.x;
          d.y = savedPos.y;
        }
      });

      // Helper functions
      const measureText = (text: string, fontSize: number, fontWeight: string = "normal") => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) return { width: 100, height: 20 };
        context.font = `${fontWeight} ${fontSize}px Inter, sans-serif`;
        const metrics = context.measureText(text);
        return { width: metrics.width, height: fontSize };
      };

      const wrapText = (text: string | undefined | null, maxWidth: number, fontSize: number) => {
        if (!text) return { lines: [""], width: 0, height: fontSize + 6 };
        
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

        return { lines, width: maxLineWidth, height: lines.length * (fontSize + 6) };
      };

      // Calculate text dimensions
      nodes.forEach((d) => {
        const fontSize = d.depth === 0 ? 22 : d.depth === 1 ? 20 : 18;
        const maxWidth = 200;
        const nodeText = getNodeText(d.data);
        const wrappedText = wrapText(nodeText, maxWidth, fontSize);
        d.textWidth = wrappedText.width;
        d.textHeight = wrappedText.height;
      });

      // Expand the scrollable canvas as nodes expand, so scroll range grows with content.
      if (onContentSizeChange) {
        const minX = d3.min(nodes, d => d.x - ((d.textWidth ?? 180) / 2) - 220) ?? 0;
        const maxX = d3.max(nodes, d => d.x + ((d.textWidth ?? 180) / 2) + 240) ?? width;
        const minY = d3.min(nodes, d => d.y - ((d.textHeight ?? 60) / 2) - 220) ?? 0;
        const maxY = d3.max(nodes, d => d.y + ((d.textHeight ?? 60) / 2) + 220) ?? height;

        // Use the current transform so scroll size reflects what is actually visible after zoom/pan.
        const padding = 120;
        let effectiveTransform = currentTransformRef.current ?? d3.zoomIdentity;

        const transformedMinX = effectiveTransform.applyX(minX);
        const transformedMinY = effectiveTransform.applyY(minY);

        // Keep upper/left content reachable by ensuring a positive visible margin.
        if (transformedMinX < padding || transformedMinY < padding) {
          const shiftX = transformedMinX < padding ? (padding - transformedMinX) / effectiveTransform.k : 0;
          const shiftY = transformedMinY < padding ? (padding - transformedMinY) / effectiveTransform.k : 0;
          effectiveTransform = effectiveTransform.translate(shiftX, shiftY);
          currentTransformRef.current = effectiveTransform;
          svg.call(zoom.transform, effectiveTransform);
        }

        const transformedMaxX = effectiveTransform.applyX(maxX);
        const transformedMaxY = effectiveTransform.applyY(maxY);

        const nextSize = {
          width: Math.max(width, Math.ceil(transformedMaxX + padding)),
          height: Math.max(height, Math.ceil(transformedMaxY + padding)),
        };

        const prevSize = lastContentSizeRef.current;
        if (!prevSize || prevSize.width !== nextSize.width || prevSize.height !== nextSize.height) {
          lastContentSizeRef.current = nextSize;
          onContentSizeChange(nextSize);
        }
      }

      // Node colors
      const getNodeColor = (depth: number): string => {
        switch (depth) {
          case 0: return activeTheme.colors.root;
          case 1: return activeTheme.colors.level1;
          case 2: return activeTheme.colors.level2;
          case 3: return activeTheme.colors.level3;
          default: return activeTheme.colors.level4;
        }
      };

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

      const hashString = (value: string): number => {
        let hash = 0;
        for (let i = 0; i < value.length; i++) {
          hash = (hash << 5) - hash + value.charCodeAt(i);
          hash |= 0;
        }
        return Math.abs(hash);
      };

      const branchPalette = [
        activeTheme.colors.root,
        activeTheme.colors.level1,
        activeTheme.colors.level2,
        activeTheme.colors.level3,
        activeTheme.colors.level4,
      ];

      const getBranchRoot = (d: D3Node): D3Node => {
        if (d.depth <= 1) return d;
        let current: D3Node = d;
        while (current.parent && (current.parent as D3Node).depth > 0) {
          current = current.parent as D3Node;
        }
        return current;
      };

      const getBranchColor = (d: D3Node): string => {
        if (d.depth === 0) return activeTheme.colors.root;
        const branchRoot = getBranchRoot(d);
        const siblings = (branchRoot.parent?.children as D3Node[] | undefined) ?? [branchRoot];
        const siblingIndex = siblings.findIndex(
          (node) => getNodeText(node.data) === getNodeText(branchRoot.data)
        );
        const colorIndex = siblingIndex >= 0
          ? siblingIndex % branchPalette.length
          : hashString(getNodeText(branchRoot.data)) % branchPalette.length;
        return branchPalette[colorIndex];
      };

      const getBoxNodeColor = (d: D3Node): string => {
        const branchColor = getBranchColor(d);
        if (d.depth <= 1) return branchColor;
        const darkenBy = Math.min((d.depth - 1) * 6, 18);
        return darkenColor(branchColor, darkenBy);
      };

      const getLineColor = (d: D3Node): string => {
        return darkenColor(getBranchColor(d), 12);
      };

      const isLeafNode = (d: D3Node): boolean =>
        (!d.data.children || d.data.children.length === 0) &&
        (!d.data._children || d.data._children.length === 0);

      // Animation duration
      const duration = 400;

      // Draw links with smooth curves and transitions
      const linkSelection = g.selectAll<SVGPathElement, any>(".link")
        .data(links, (d: any) => getNodeText(d.target.data));

      // Remove old links
      linkSelection.exit()
        .transition()
        .duration(duration)
        .style("opacity", 0)
        .remove();

      // Add new links (insert at the beginning so they're behind nodes)
      const linkEnter = linkSelection.enter()
        .insert("path", ":first-child")
        .attr("class", "link")
        .style("fill", "none")
        .style("stroke", (d) => getLineColor(d.source as D3Node))
        .style("stroke-width", 2.5)
        .style("opacity", 0)
        .style("pointer-events", "none")
        .attr("d", (d) => {
          const source = d.source as D3Node;
          // Start from right edge where arrow would be
          const sourceX = source.x + (source.textWidth || 100) / 2 + 40;
          return `M${sourceX},${source.y}
                  C${sourceX},${source.y}
                   ${sourceX},${source.y}
                   ${sourceX},${source.y}`;
        });

      // Update all links
      linkEnter.merge(linkSelection)
        .transition()
        .duration(duration)
        .style("stroke", (d) => getLineColor(d.source as D3Node))
        .style("opacity", 0.8)
        .attr("d", (d) => {
          const source = d.source as D3Node;
          const target = d.target as D3Node;
          // Start from right edge where arrow is located
          const sourceX = source.x + (source.textWidth || 100) / 2 + 40;
          // End at left edge of target box
          const targetX = target.x - (target.textWidth || 100) / 2 - 30;
          return `M${sourceX},${source.y}
                  C${(sourceX + targetX) / 2},${source.y}
                   ${(sourceX + targetX) / 2},${target.y}
                   ${targetX},${target.y}`;
        });

      // Draw nodes with transitions
      const nodeSelection = g.selectAll<SVGGElement, D3Node>(".node")
        .data(nodes, (d: D3Node) => getNodeText(d.data));

      // Remove old nodes
      nodeSelection.exit()
        .transition()
        .duration(duration)
        .style("opacity", 0)
        .attr("transform", (d) => {
          const parent = d.parent as D3Node | null;
          return `translate(${parent ? parent.x : d.x},${parent ? parent.y : d.y})`;
        })
        .remove();

      // Add new nodes
      const nodeEnter = nodeSelection.enter()
        .append("g")
        .attr("class", "node")
        .style("opacity", 0)
        .attr("transform", (d) => {
          const parent = d.parent as D3Node | null;
          return `translate(${parent ? parent.x : d.x},${parent ? parent.y : d.y})`;
        })
        .style("cursor", "move");

      // Merge enter and update selections
      const nodeUpdate = nodeEnter.merge(nodeSelection);

      // Transition to new positions
      nodeUpdate.transition()
        .duration(duration)
        .style("opacity", 1)
        .attr("transform", (d) => `translate(${d.x},${d.y})`);

      // Add drag behavior to nodes
      let dragStartX = 0;
      let dragStartY = 0;
      let hasDragged = false;
      
      const drag = d3.drag<SVGGElement, D3Node>()
        .on("start", function(event, d) {
          dragStartX = event.x;
          dragStartY = event.y;
          hasDragged = false;
          d3.select(this).raise();
          d3.select(this).style("cursor", "grabbing");
        })
        .on("drag", function(event, d) {
          // Check if we've moved enough to consider it a drag
          const dx = event.x - dragStartX;
          const dy = event.y - dragStartY;
          if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            hasDragged = true;
          }
          
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
            // Start from right edge where arrow is located
            const sourceX = source.x + (source.textWidth || 100) / 2 + 40;
            // End at left edge of target box
            const targetX = target.x - (target.textWidth || 100) / 2 - 30;
            return `M${sourceX},${source.y}
                    C${(sourceX + targetX) / 2},${source.y}
                     ${(sourceX + targetX) / 2},${target.y}
                     ${targetX},${target.y}`;
          });
        })
        .on("end", function(event, d) {
          d3.select(this).style("cursor", "move");
          
          // If we didn't drag, treat it as a click for expand/collapse
          if (!hasDragged && (d.data.children || d.data._children)) {
            toggleNode(d as D3Node);
          }
        });

      // Apply drag behavior to all nodes
      nodeUpdate.call(drag);

      // Background rectangles (only for new nodes)
      nodeEnter.append("rect")
        .attr("class", "node-rect")
        .attr("width", (d) => (d.textWidth || 100) + 60)
        .attr("height", (d) => (d.textHeight || 30) + 28)
        .attr("x", (d) => -(d.textWidth || 100) / 2 - 30)
        .attr("y", (d) => -(d.textHeight || 30) / 2 - 14)
        .attr("rx", 16)
        .attr("ry", 16)
        .style("fill", (d) => isLeafNode(d) ? 'transparent' : getBoxNodeColor(d))
        .style("stroke", (d) => isLeafNode(d) ? 'none' : '#ffffff')
        .style("stroke-width", (d) => isLeafNode(d) ? 0 : 2.5)
        .style("filter", (d) => isLeafNode(d) ? 'none' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))')
        .style("cursor", "pointer")
        .style("transition", "filter 0.2s ease")
        .on("mouseenter", function(event, d) {
          if (!isLeafNode(d)) {
            d3.select(this).style("filter", "drop-shadow(0 8px 16px rgba(0,0,0,0.25))");
          }
        })
        .on("mouseleave", function(event, d) {
          if (!isLeafNode(d)) {
            d3.select(this).style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.15))");
          }
        });

      // Keep styles in sync for existing nodes too (not just newly entered nodes).
      nodeUpdate.select<SVGRectElement>(".node-rect")
        .style("fill", (d) => isLeafNode(d) ? "transparent" : getBoxNodeColor(d))
        .style("stroke", (d) => isLeafNode(d) ? "none" : "#ffffff")
        .style("stroke-width", (d) => isLeafNode(d) ? 0 : 2.5)
        .style("filter", (d) => isLeafNode(d) ? "none" : "drop-shadow(0 4px 8px rgba(0,0,0,0.15))");

      // Text labels
      nodeEnter.each(function (d) {
        const nodeGroup = d3.select(this);
        const fontSize = d.depth === 0 ? 22 : d.depth === 1 ? 20 : 18;
        const fontWeight = d.depth === 0 ? "bold" : "600";
        const maxWidth = 200;
        const nodeText = getNodeText(d.data);
        const wrappedText = wrapText(nodeText, maxWidth, fontSize);
        const lineHeight = fontSize + 6;
        const startY = -(wrappedText.lines.length - 1) * lineHeight / 2;

        wrappedText.lines.forEach((line, i) => {
          nodeGroup.append("text")
            .attr("x", 0)
            .attr("y", startY + i * lineHeight)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .style("font-family", "Inter, sans-serif")
            .style("font-size", `${fontSize}px`)
            .style("font-weight", fontWeight)
            .style("fill", isLeafNode(d) ? "#4a4a4a" : "#ffffff")
            .style("pointer-events", "none")
            .text(line);
        });
      });

      // Add expand/collapse indicators with SVG arrows (only show > when collapsed)
      // Remove all old expand/collapse indicators
      nodeUpdate.selectAll(".expand-indicator").remove();
      nodeUpdate.selectAll(".collapse-indicator").remove();

      // Add expand indicators for nodes with collapsed children (show >)
      const expandIndicatorGroup = nodeUpdate.filter(d => d.data._children)
        .append("g")
        .attr("class", "expand-indicator")
        .style("cursor", "pointer")
        .on("click", function(event, d) {
          event.stopPropagation();
          toggleNode(d as D3Node);
        });

      // Arrow circle background for expand
      expandIndicatorGroup.append("circle")
        .attr("cx", (d) => (d.textWidth || 100) / 2 + 40)
        .attr("cy", 0)
        .attr("r", 16)
        .style("fill", (d) => getBoxNodeColor(d))
        .style("stroke", "#ffffff")
        .style("stroke-width", 2)
        .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.2))")
        .style("transition", "filter 0.2s ease")
        .on("mouseenter", function() {
          d3.select(this)
            .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.3))");
        })
        .on("mouseleave", function() {
          d3.select(this)
            .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.2))");
        });

      // Arrow icon: > when collapsed (can expand)
      expandIndicatorGroup.append("path")
        .attr("d", "M-4 -2 L0 2 L4 -2")
        .attr("transform", (d) => {
          const x = (d.textWidth || 100) / 2 + 40;
          const y = 0;
          // Show > (270°) pointing right
          const rotation = 270;
          return `translate(${x}, ${y}) rotate(${rotation})`;
        })
        .style("fill", "none")
        .style("stroke", "#000000")
        .style("stroke-width", 2.5)
        .style("stroke-linecap", "round")
        .style("stroke-linejoin", "round")
        .style("pointer-events", "none");

      // Add collapse indicators for nodes with expanded children (show <)
      const collapseIndicatorGroup = nodeUpdate.filter(d => d.data.children && d.data.children.length > 0)
        .append("g")
        .attr("class", "collapse-indicator")
        .style("cursor", "pointer")
        .on("click", function(event, d) {
          event.stopPropagation();
          toggleNode(d as D3Node);
        });

      // Arrow circle background for collapse
      collapseIndicatorGroup.append("circle")
        .attr("cx", (d) => (d.textWidth || 100) / 2 + 40)
        .attr("cy", 0)
        .attr("r", 16)
        .style("fill", (d) => getBoxNodeColor(d))
        .style("stroke", "#ffffff")
        .style("stroke-width", 2)
        .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.2))")
        .style("transition", "filter 0.2s ease")
        .on("mouseenter", function() {
          d3.select(this)
            .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.3))");
        })
        .on("mouseleave", function() {
          d3.select(this)
            .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.2))");
        });

      // Arrow icon: < when expanded (can collapse)
      collapseIndicatorGroup.append("path")
        .attr("d", "M-4 -2 L0 2 L4 -2")
        .attr("transform", (d) => {
          const x = (d.textWidth || 100) / 2 + 40;
          const y = 0;
          // Show < (90°) pointing left
          const rotation = 90;
          return `translate(${x}, ${y}) rotate(${rotation})`;
        })
        .style("fill", "none")
        .style("stroke", "#000000")
        .style("stroke-width", 2.5)
        .style("stroke-linecap", "round")
        .style("stroke-linejoin", "round")
        .style("pointer-events", "none");

      // Position root node slightly left on initial render (since expansion goes right)
      if (isInitialRenderRef.current) {
        const scale = 0.6;
        // In fullscreen mode we keep the root centered for better first view.
        const initialX = centerRootOnInitialRender ? width / 2 : width * 0.4;
        const initialY = centerRootOnInitialRender ? height * 0.45 : height / 2;
        
        const initialTransform = d3.zoomIdentity.translate(initialX, initialY).scale(scale);
        svg.call(zoom.transform, initialTransform);
        currentTransformRef.current = initialTransform;
        isInitialRenderRef.current = false;
      }
      
    }, [rootData, theme, activeTheme, centerRootOnInitialRender, onContentSizeChange]);

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
          className="w-full h-full"
          style={{ display: "block" }}
        />
        
        {/* Instructions */}
        {showHint && (
          <div className="absolute top-4 right-4 pointer-events-none animate-pulse">
            <div className="bg-gradient-to-r from-blue-500/90 to-purple-500/90 backdrop-blur-sm px-6 py-3 rounded-full text-white text-sm font-semibold shadow-xl border border-white/20">
              💡 Click arrows or nodes to expand/collapse • Use controls to zoom
            </div>
          </div>
        )}
      </div>
    );
  }
);

D3MindMapExpandable.displayName = 'D3MindMapExpandable';

export default D3MindMapExpandable;
