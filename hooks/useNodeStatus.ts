import { useWorkflowRuntimeStore } from '@/stores/workflowRuntimeStore';

export function useNodeStatus(nodeId: string) {
  const status = useWorkflowRuntimeStore((state) => state.nodeStatuses[nodeId]);
  return status || 'PENDING';
}
