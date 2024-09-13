//
// State Management for React Flow
//
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { FlowState } from '../Types.js';

const useFlowStore = create<FlowState>()(
  subscribeWithSelector(
    devtools((set, get) => ({
      edges: [],
      setEdges: (eds) =>
        set((state:any) => ({ ...state, edges: eds }), false, 'setEdges in /flowStore'),
      nodes: [],
      setNodes: (nds) =>
        set((state:any) => ({ ...state, nodes: nds }), false, 'setNodes in /flowStore'),

      onNodesChange: (changes) =>
        set(
          (state) => ({
            ...state,
            nodes: applyNodeChanges(changes, get().nodes),
          }),
          false,
          'onNodesChange in /flowStore'
        ),

      onEdgesChange: (changes) =>
        set(
          (state) => ({
            ...state,
            edges: applyEdgeChanges(changes, get().edges),
          }),
          false,
          'onEdgesChange in /flowStore'
        ),
      onConnect: (connection) =>
        set(
          (state) => ({
            ...state,
            edges: addEdge(connection, get().edges),
          }),
          false,
          'onConnect in /flowStore'
        ),
    }))
  )
);

export default useFlowStore;