//-----IMPORTED FILES/MODULES
import { SchemaStore } from '../../store/schemaStore.js';
import { Edge, DataNode } from '../../Types.js';
import dagre from 'dagre';

export default function createNodes(
  schemaObject: SchemaStore,
  edges: Edge[]
): DataNode[] {
  // renders each table on the React Flow schema canvas
  const nodes: DataNode[] = [];
  const dbId = window.location.href.replace(/.*edit\//, '')
  const spStr = localStorage.getItem(dbId);
  let sp:any;
  if (spStr) {
    sp = JSON.parse(spStr);
  }

  const nodeWidth = 500;
  const direction = 'TB';

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  //const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  for (const tableName in schemaObject) {
    const columnData = schemaObject[tableName];
    let x = 0, y = Object.keys(columnData).length;
    if (sp && sp[tableName]) {
      x = sp[tableName].x;
      y = sp[tableName].y;
    }

    nodes.push({
      id: tableName,
      type: 'table',
      position: { x, y},
      data: { table: [tableName, columnData], edges },
    });
  }

  if (!sp) {
    // rearrange nodes
    nodes.forEach((node) => {
      const nodeHeight = 90 + 25 * node.position.y;
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const storedPositions:any = {};

    nodes.forEach((node) => {
      let nodeWithPosition:any = dagreGraph.node(node.id);
      // node.targetPosition = isHorizontal ? 'left' : 'top';
      // node.sourcePosition = isHorizontal ? 'right' : 'bottom';

      // We are shifting the dagre node position (anchor=center center) to the top left
      while (nodeWithPosition.x > 2000) {
        nodeWithPosition.x -= 2000;
        nodeWithPosition.y += 200;
      }
      node.position = {
        x: nodeWithPosition.x - nodeWithPosition.width / 2,
        y: nodeWithPosition.y - nodeWithPosition.height / 2,
      };

      storedPositions[node.id] = {x: node.position.x, y: node.position.y};

      return node;
    });

    if (dbId) {
      localStorage.setItem(dbId, JSON.stringify(storedPositions));
    }
  }

  return nodes;
}
