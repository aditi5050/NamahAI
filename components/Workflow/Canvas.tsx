'use client';

import React, { useCallback, useRef, useState } from 'react';
import {
    ReactFlow,
    Background,
    MiniMap,
    BackgroundVariant,
    ReactFlowProvider,
    Panel,
    useReactFlow,
    reconnectEdge,
    Edge,
    Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ZoomIn, ZoomOut, Maximize2, Lock, Unlock, Undo2, Redo2, Save, Loader2, Play } from 'lucide-react';

import { useWorkflowStore } from '@/stores/workflowStore';
import { useWorkflowRuntimeStore } from '@/stores/workflowRuntimeStore';
import { TextNode } from '@/components/nodes/TextNode';
import { UploadImageNode } from '@/components/nodes/UploadImageNode';
import { LLMNode } from '@/components/nodes/LLMNode';
import { CropImageNode } from '@/components/nodes/CropImageNode';
import { ExtractFrameNode } from '@/components/nodes/ExtractFrameNode';
import { UploadVideoNode } from '@/components/nodes/UploadVideoNode';

const nodeTypes = {
    text: TextNode,
    image: UploadImageNode,
    llm: LLMNode,
    crop: CropImageNode,
    extract: ExtractFrameNode,
    video: UploadVideoNode,
};

interface CanvasProps {
    onDragOver: (event: React.DragEvent) => void;
    onDrop: (event: React.DragEvent) => void;
}

const CanvasInner: React.FC<CanvasProps> = ({ onDragOver, onDrop }) => {
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setEdges, deleteNode, undo, redo, canUndo, canRedo, saveToDatabase, isSaving, isSaved, workflowId } = useWorkflowStore();
    const { startRun, isRunning } = useWorkflowRuntimeStore();
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { zoomIn, zoomOut, fitView } = useReactFlow();
    const [isLocked, setIsLocked] = useState(false);
    const edgeReconnectSuccessful = useRef(true);

    // Handle save workflow
    const handleSave = useCallback(async () => {
        await saveToDatabase();
    }, [saveToDatabase]);

    // Handle run entire workflow
    const handleRunWorkflow = useCallback(async () => {
        // Save first if not saved
        if (!isSaved) {
            const saved = await saveToDatabase();
            if (!saved) {
                alert('Failed to save workflow. Please try again.');
                return;
            }
        }
        // Then run the workflow
        const currentWorkflowId = useWorkflowStore.getState().workflowId;
        await startRun(currentWorkflowId);
    }, [isSaved, saveToDatabase, startRun]);

    // Handle edge reconnection start
    const onReconnectStart = useCallback(() => {
        edgeReconnectSuccessful.current = false;
    }, []);

    // Handle edge reconnection
    const onReconnect = useCallback((oldEdge: Edge, newConnection: Connection) => {
        edgeReconnectSuccessful.current = true;
        setEdges(reconnectEdge(oldEdge, newConnection, edges));
    }, [edges, setEdges]);

    // Handle edge reconnection end (delete if not successful)
    const onReconnectEnd = useCallback((_: any, edge: Edge) => {
        if (!edgeReconnectSuccessful.current) {
            setEdges(edges.filter((e) => e.id !== edge.id));
        }
        edgeReconnectSuccessful.current = true;
    }, [edges, setEdges]);

    // Handle keyboard shortcuts
    const onKeyDown = useCallback((event: React.KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'z') {
            event.preventDefault();
            if (event.shiftKey) {
                redo();
            } else {
                undo();
            }
        }
    }, [undo, redo]);

    return (
        <div className="w-full h-full" ref={reactFlowWrapper} onKeyDown={onKeyDown} tabIndex={0}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onReconnect={onReconnect}
                onReconnectStart={onReconnectStart}
                onReconnectEnd={onReconnectEnd}
                nodeTypes={nodeTypes}
                onDragOver={onDragOver}
                onDrop={onDrop}
                fitView
                className="bg-[#0a0a0a]"
                minZoom={0.1}
                maxZoom={2}
                defaultEdgeOptions={{
                    type: 'default',
                    animated: true,
                    style: { stroke: '#444', strokeWidth: 2 },
                }}
                proOptions={{ hideAttribution: true }}
                nodesDraggable={!isLocked}
                nodesConnectable={!isLocked}
                elementsSelectable={!isLocked}
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={24}
                    size={2.5}
                    color="#555"
                    className="opacity-100"
                />
                
                {/* Controls Panel */}
                <Panel position="bottom-center" className="flex items-center gap-2 bg-[#161616] p-1.5 rounded-lg border border-[#2a2a2a] mb-8 shadow-xl">
                    <button 
                        onClick={() => zoomOut()}
                        className="p-1.5 text-white/70 hover:text-white hover:bg-[#2a2a2a] rounded transition-colors"
                        title="Zoom Out"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => zoomIn()}
                        className="p-1.5 text-white/70 hover:text-white hover:bg-[#2a2a2a] rounded transition-colors"
                        title="Zoom In"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-[#2a2a2a] mx-0.5" />
                    <button 
                        onClick={() => fitView({ duration: 800 })}
                        className="p-1.5 text-white/70 hover:text-white hover:bg-[#2a2a2a] rounded transition-colors"
                        title="Fit View"
                    >
                        <Maximize2 className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-[#2a2a2a] mx-0.5" />
                    <button 
                        onClick={() => setIsLocked(!isLocked)}
                        className={`p-1.5 rounded transition-colors ${isLocked ? 'text-red-400 bg-red-400/10' : 'text-white/70 hover:text-white hover:bg-[#2a2a2a]'}`}
                        title={isLocked ? "Unlock Canvas" : "Lock Canvas"}
                    >
                        {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                    <div className="w-px h-4 bg-[#2a2a2a] mx-0.5" />
                    <button 
                        onClick={undo}
                        disabled={!canUndo()}
                        className="p-1.5 text-white/70 hover:text-white hover:bg-[#2a2a2a] rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo2 className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={redo}
                        disabled={!canRedo()}
                        className="p-1.5 text-white/70 hover:text-white hover:bg-[#2a2a2a] rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Redo (Ctrl+Shift+Z)"
                    >
                        <Redo2 className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-[#2a2a2a] mx-0.5" />
                    <button 
                        onClick={handleSave}
                        disabled={isSaving || isSaved}
                        className={`p-1.5 rounded transition-colors ${isSaved ? 'text-green-400 bg-green-400/10' : 'text-white/70 hover:text-white hover:bg-[#2a2a2a]'} disabled:opacity-50`}
                        title={isSaved ? "Saved" : "Save Workflow (to database)"}
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </button>
                    <button 
                        onClick={handleRunWorkflow}
                        disabled={isRunning || nodes.length === 0}
                        className={`p-1.5 rounded transition-colors ${isRunning ? 'text-purple-400 bg-purple-400/10' : 'text-green-400 hover:text-green-300 hover:bg-green-400/10'} disabled:opacity-50`}
                        title="Run Workflow"
                    >
                        {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    </button>
                </Panel>

                <MiniMap 
                    nodeStrokeColor="#333"
                    nodeColor="#1a1a1a"
                    maskColor="rgba(0, 0, 0, 0.6)"
                    className="!bg-[#111] !border !border-[#2a2a2a] !rounded-lg !bottom-8 !right-8"
                />
            </ReactFlow>
        </div>
    );
};

export default function Canvas(props: CanvasProps) {
    return (
        <ReactFlowProvider>
            <CanvasInner {...props} />
        </ReactFlowProvider>
    );
}
