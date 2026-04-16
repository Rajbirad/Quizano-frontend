declare module "gojs-react" {
  import React from "react";
  import * as go from "gojs";

  interface ReactDiagramProps {
    divClassName?: string;
    initDiagram: () => go.Diagram;
    nodeDataArray: Array<any>;
    linkDataArray: Array<any>;
    modelData?: object;
    skipsDiagramUpdate?: boolean;
    onModelChange?: (e: go.ChangedEvent) => void;
  }

  export const ReactDiagram: React.ComponentType<ReactDiagramProps>;
}
