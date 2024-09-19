import useFlowStore from '../../store/flowStore';
import useSchemaStore, { SchemaStore } from '../../store/schemaStore.js';
import { useEffect } from 'react';
import ReactFlow, {
  Controls,
  ControlButton,
  ReactFlowProps,
  Background
} from 'reactflow';
import 'reactflow/dist/style.css';
import DownloadButton from './DownloadButton';
import TableNode from './TableNode';
import createEdges from './createEdges';
import createNodes from './createNodes';

const nodeTypes = {
  table: TableNode,
};

export default function Flow(): JSX.Element {
  // set up states for nodes and edges
  const { edges, setEdges, nodes, setNodes, onNodesChange, onEdgesChange, onConnect } =
    useFlowStore((state:any) => state);
  const { schemaStore } = useSchemaStore((state:any) => state);

  // re-render every time schemaStore updates

  useEffect(() => {
    reRender(schemaStore);
  }, [schemaStore]);

  function reRender(schemaStore: SchemaStore) {
    if (!schemaStore || !Object.keys(schemaStore).length) return;
    const initialEdges = createEdges(schemaStore);

    setEdges(initialEdges);
    const initialNodes = createNodes(schemaStore, initialEdges);
    setNodes(initialNodes);
  }

  // function for highlighting the edges associated with the current node - db 7.0
  const handleNodeClick = (_: any, node: ReactFlowProps) => {
    // Find edges connected to the clicked node and update their selected property using map method
    const updatedEdges = edges.map((edge: any) => {
      const hlColor = '#fedd0a';
      // The below condition checks to see if the selected node is either the source or the target of the current node in the edges array.
      if (edge.source === node.id || edge.target === node.id) {
        return {
          ...edge,
          type: 'smoothstep',
          style: {
            //strokeWidth: 2,
            ...edge.style,
            stroke: hlColor,
          },
          markerEnd: {
            ...edge.markerEnd,
            color: hlColor,
          },
        };
      }
      //if the current edge is not associated with the node then return this styling.
      return {
        ...edge,
        type: 'smoothstep',
        style: {
          //strokeWidth: 2,
          ...edge.style,
          stroke: '#085c84',
        },
        markerEnd: {
          ...edge.markerEnd,
          color: '#085c84',
        },
      };
    });
    // pass in new edges array with altered stylings into setter function to update the state
    setEdges(updatedEdges);
  };
  // renders React Flow canvas
  return (
    <div className="flow" style={{ height: '98%', width: '100%', zIndex: 0 }}>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <div id="download-image"></div>
        <Background className=" transition-colors duration-500 dark:bg-black" />
        <Controls position="top-right">
          <ControlButton>
            <DownloadButton />
          </ControlButton>
        </Controls>

      </ReactFlow>
    </div>
  );
}
