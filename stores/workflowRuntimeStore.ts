import { create } from 'zustand';

interface NodeStatus {
  [nodeId: string]: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
}

interface WorkflowRuntimeState {
  nodeStatuses: NodeStatus;
  runId: string | null;
  isRunning: boolean;
  executionScope: any;
  runningNodes: string[];
  errors: string[];
  runs: any[];
  
  startRun: (workflowId: string, inputs?: any) => Promise<void>;
  pollRun: (runId: string) => void;
  fetchRuns: (workflowId: string) => Promise<void>;
  reset: () => void;
}

export const useWorkflowRuntimeStore = create<WorkflowRuntimeState>((set, get) => ({
  nodeStatuses: {},
  runId: null,
  isRunning: false,
  executionScope: {},
  runningNodes: [],
  errors: [],
  runs: [],

  startRun: async (workflowId, inputs = {}) => {
    try {
      set({ runId: null, nodeStatuses: {}, errors: [], isRunning: true });
      
      const response = await fetch('/api/runs/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId, inputs }),
      });

      if (!response.ok) throw new Error('Failed to start run');

      const data = await response.json();
      set({ runId: data.runId });

      // Start polling
      get().pollRun(data.runId);
    } catch (error: any) {
      set({ errors: [error.message], isRunning: false });
    }
  },

  pollRun: (runId) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/runs/${runId}`);
        if (!response.ok) return;

        const run = await response.json();
        
        // Update node statuses map
        const newNodeStatuses: NodeStatus = {};
        run.nodeExecutions.forEach((exec: any) => {
          newNodeStatuses[exec.nodeId] = exec.status;
        });

        set({ 
          nodeStatuses: newNodeStatuses,
          executionScope: run // Or specific scope data
        });

        if (run.status === 'COMPLETED' || run.status === 'FAILED' || run.status === 'CANCELLED') {
          clearInterval(interval);
          set({ isRunning: false });
          // Refresh runs list
          get().fetchRuns(run.workflowId);
        }
      } catch (error) {
        console.error('Polling error', error);
        clearInterval(interval);
        set({ isRunning: false });
      }
    }, 1000);
  },

  fetchRuns: async (workflowId) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}/runs`);
      if (response.ok) {
        const runs = await response.json();
        set({ runs });
      }
    } catch (error) {
      console.error('Failed to fetch runs', error);
    }
  },

  reset: () => set({ nodeStatuses: {}, runId: null, isRunning: false, errors: [] }),
}));
        const response = await fetch(`/api/runs/${runId}`);
        if (!response.ok) return;

        const run = await response.json();
        
        // Map execution status to store format
        const newStatuses: NodeStatus = {};
        run.nodeExecutions.forEach((exec: any) => {
          newStatuses[exec.nodeId] = exec.status;
        });

        set({ nodeStatuses: newStatuses });

        if (run.status === 'COMPLETED' || run.status === 'FAILED') {
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Polling error", error);
      }
    }, 1000);
  },

  reset: () => set({ nodeStatuses: {}, runId: null, errors: [] })
}));
