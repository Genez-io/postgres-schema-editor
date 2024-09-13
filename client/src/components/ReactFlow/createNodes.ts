//-----IMPORTED FILES/MODULES
import { SchemaStore } from '../../store/schemaStore.js';
import { Edge, DataNode } from '../../Types.js';

export default function createNodes(
  schemaObject: SchemaStore,
  edges: Edge[]
): DataNode[] {
  // renders each table on the React Flow schema canvas
  const nodes: DataNode[] = [];

  let x: number = 0;
  let y: number = 0;

  for (const tableName in schemaObject) {
    const columnData = schemaObject[tableName];

    nodes.push({
      id: tableName,
      type: 'table',
      position: { x, y },
      data: { table: [tableName, columnData], edges },
    });

    y += 370;
    if (y > 1700) {
      y = 0;
      x += 600;
    }
  }

  return nodes;
}
