import React, { useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Crop } from 'lucide-react';
import { useWorkflowEditorStore } from '@/stores/workflowEditorStore';

export function CropImageNode({ id, data, selected }: NodeProps) {
  const updateNodeData = useWorkflowEditorStore((state) => state.updateNodeData);

  const onParamChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(id, { [evt.target.name]: parseInt(evt.target.value) || 0 });
  }, [id, updateNodeData]);

  return (
    <div className={`relative bg-[#1A1A23] rounded-lg shadow-sm border w-64 ${selected ? 'border-[#6F42C1] ring-2 ring-[#6F42C1]/20' : 'border-[#2A2A2F]'}`}>
      <div className="flex items-center px-3 py-2 border-b bg-[#1E1E24] rounded-t-lg border-[#2A2A2F]">
        <Crop className="w-4 h-4 mr-2 text-yellow-600" />
        <span className="text-sm font-medium text-gray-200">Crop Image</span>
      </div>
      
      <div className="p-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-400">X (%)</label>
            <input type="number" name="x_percent" className="w-full text-xs border border-[#2A2A2F] rounded p-1 bg-[#0E0E13] text-gray-200" value={data.x_percent || 0} onChange={onParamChange} />
          </div>
          <div>
            <label className="block text-xs text-gray-400">Y (%)</label>
            <input type="number" name="y_percent" className="w-full text-xs border border-[#2A2A2F] rounded p-1 bg-[#0E0E13] text-gray-200" value={data.y_percent || 0} onChange={onParamChange} />
          </div>
          <div>
            <label className="block text-xs text-gray-400">Width (%)</label>
            <input type="number" name="width_percent" className="w-full text-xs border border-[#2A2A2F] rounded p-1 bg-[#0E0E13] text-gray-200" value={data.width_percent || 100} onChange={onParamChange} />
          </div>
          <div>
            <label className="block text-xs text-gray-400">Height (%)</label>
            <input type="number" name="height_percent" className="w-full text-xs border border-[#2A2A2F] rounded p-1 bg-[#0E0E13] text-gray-200" value={data.height_percent || 100} onChange={onParamChange} />
          </div>
        </div>

        {data.imageUrl && (
          <div className="mt-2 text-xs text-gray-500 truncate">
            Input: ...{data.imageUrl.slice(-20)}
          </div>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Left}
        id="image_url"
        className="w-3 h-3 bg-green-500 border-2 border-green-500"
      />
      <div className="absolute left-[-50px] top-[40px] text-[10px] text-gray-500 w-[40px] text-right pointer-events-none">Image</div>

      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="w-3 h-3 bg-green-500 border-2 border-green-500"
      />
    </div>
  );
}
