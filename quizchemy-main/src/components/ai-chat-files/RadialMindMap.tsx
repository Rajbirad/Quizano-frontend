import React, { useEffect, useRef } from "react";
import MindElixir from "mind-elixir";
import "mind-elixir/style.css";
import "./MindElixir.css";

interface Branch {
  topic?: string;
  overview?: string;
  key_points?: string[];
  headings?: string[];
  paragraphs?: string[];
  children?: any[];
}

interface SummaryMindmap {
  mindmap?: any;
  central_topic?: string;
  branches?: Branch[];
  topic?: string;
  children?: any[];
}

interface RadialMindMapProps {
  summary: SummaryMindmap | null;
}

export const RadialMindMap: React.FC<RadialMindMapProps> = ({ summary }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mindRef = useRef<any>(null);
  const wheelHandlerRef = useRef<any>(null);

  // Truncate helper (to avoid extremely long root nodes)
  const truncate = (text = "", max = 60) =>
    typeof text === "string" && text.length > max ? text.slice(0, max) + "..." : text;

  // Convert generic node -> MindElixir node
  const convertNode = (node: any): any => {
    if (typeof node === "string") {
      return { topic: truncate(node), id: cryptoId() };
    }
    const topic = truncate(node.topic || node.name || "");
    const out: any = { topic: topic || "Untitled", id: cryptoId(), expanded: true };
    if (node.children && Array.isArray(node.children) && node.children.length) {
      out.children = node.children.map(convertNode);
    }
    return out;
  };

  // Convert central_topic + branches -> nodeData
  const convertCentral = (central_topic: string, branches: Branch[]) => {
    const children = (branches || []).map((b) => {
      const branchChildren: any[] = [];
      if (b.overview) branchChildren.push({ topic: truncate(b.overview), id: cryptoId() });
      (b.key_points || []).forEach((kp) => branchChildren.push({ topic: truncate(kp), id: cryptoId() }));
      (b.headings || []).forEach((h) => branchChildren.push({ topic: truncate(h), id: cryptoId() }));
      (b.paragraphs || []).forEach((p) => branchChildren.push({ topic: truncate(p), id: cryptoId() }));
      return {
        topic: truncate(b.topic || "Branch"),
        id: cryptoId(),
        expanded: true,
        children: branchChildren,
      };
    });

    return {
      nodeData: {
        topic: truncate(central_topic || "Mind Map"),
        id: "root",
        expanded: true,
        children,
      },
    };
  };

  // stable-ish id
  const cryptoId = () => {
    // use crypto if available, fallback to Math.random
    if (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function") {
      try {
        return (crypto as any).randomUUID();
      } catch {
        // ignore
      }
    }
    return "id-" + Math.random().toString(36).substr(2, 9);
  };

  useEffect(() => {
    if (!summary) return;

    // Determine data shape and create nodeData for MindElixir
    let nodeDataWrapper: any = null;

    if ((summary as any).mindmap) {
      // already MindElixir-like
      const mm = (summary as any).mindmap;
      nodeDataWrapper = {
        nodeData: {
          topic: truncate(mm.topic || mm.name || "Mind Map"),
          id: "root",
          expanded: true,
          children: (mm.children || []).map(convertNode),
        },
      };
    } else if ((summary as any).central_topic && Array.isArray((summary as any).branches)) {
      nodeDataWrapper = convertCentral((summary as any).central_topic, (summary as any).branches);
    } else if ((summary as any).topic && Array.isArray((summary as any).children)) {
      nodeDataWrapper = { nodeData: convertNode(summary) };
    } else {
      // last resort - try to convert summary directly
      try {
        nodeDataWrapper = { nodeData: convertNode(summary) };
      } catch (e) {
        console.warn("RadialMindMap: no valid data format for summary", summary);
        return;
      }
    }

    // initialize
    const container = containerRef.current;
    if (!container) return;

    // clear previous
    container.innerHTML = "";
    if (mindRef.current) {
      try {
        // mind-elixir doesn't expose a destroy; nulling ref and clearing DOM is safe
        mindRef.current = null;
      } catch {}
    }

    // options
    const options = {
      el: container,
      direction: (MindElixir as any).SIDE, // left + right expansion
      draggable: true,
      toolBar: false,
      nodeMenu: false,
      keypress: false,
      contextMenu: false,
      editable: false,
      mouseSelectionButton: 0, // left button for dragging selection
    };

    const mind = new (MindElixir as any)(options);
    try {
      mind.init(nodeDataWrapper);
    } catch (err) {
      console.error("MindElixir init error:", err);
    }

    // small delay to let MindElixir compute layout then refresh and center
    setTimeout(() => {
      try {
        mind.refresh && mind.refresh();
        mind.toCenter && mind.toCenter();
      } catch (err) {
        // ignore
      }
    }, 120);

    mindRef.current = mind;

    // wheel (zoom) handler - passive false so we can preventDefault
    const wheelHandler = (e: WheelEvent) => {
      if (!mindRef.current) return;
      // if ctrlKey is pressed, allow browser zoom; otherwise prevent
      e.preventDefault();
      if ((e as any).deltaY < 0) {
        try {
          mindRef.current.scale(1.12);
        } catch {}
      } else {
        try {
          mindRef.current.scale(0.9);
        } catch {}
      }
    };

    // add wheel on container (not window) and make passive: false
    container.addEventListener("wheel", wheelHandler, { passive: false });
    wheelHandlerRef.current = wheelHandler;

    // handle resize -> refresh & recenter
    const onResize = () => {
      if (!mindRef.current) return;
      try {
        mindRef.current.refresh && mindRef.current.refresh();
        mindRef.current.toCenter && mindRef.current.toCenter();
      } catch {}
    };
    window.addEventListener("resize", onResize);

    // ensure map is centered when tab becomes visible (observe container)
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && mindRef.current) {
          try {
            mindRef.current.refresh && mindRef.current.refresh();
            mindRef.current.toCenter && mindRef.current.toCenter();
          } catch {}
        }
      });
    });
    io.observe(container);

    // cleanup
    return () => {
      try {
        container.removeEventListener("wheel", wheelHandlerRef.current as EventListener);
      } catch {}
      try {
        window.removeEventListener("resize", onResize);
      } catch {}
      io.disconnect();
      if (container) container.innerHTML = "";
      mindRef.current = null;
    };
  }, [summary]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%", // parent should provide explicit height (your tab wrapper)
        position: "relative",
        overflow: "hidden",
        background: "white",
        borderRadius: 8,
        boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
      }}
    >
      <div
        ref={containerRef}
        className="mind-elixir-container"
        style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}
      />
    </div>
  );
};
