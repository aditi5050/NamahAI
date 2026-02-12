"use client";

import React, { useState, useRef, useCallback } from 'react';
import { MessageSquareText, Image, Video, Sparkles, Crop, Film } from 'lucide-react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
  addEdge,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';

import { TextNode } from '@/components/nodes/TextNode';
import { UploadImageNode } from '@/components/nodes/UploadImageNode';
import { UploadVideoNode } from '@/components/nodes/UploadVideoNode';
import { LLMNode } from '@/components/nodes/LLMNode';
import { CropImageNode } from '@/components/nodes/CropImageNode';
import { ExtractFrameNode } from '@/components/nodes/ExtractFrameNode';

const nodeTypes = {
  textNode: TextNode,
  uploadImageNode: UploadImageNode,
  uploadVideoNode: UploadVideoNode,
  llmNode: LLMNode,
  cropImageNode: CropImageNode,
  extractFrameNode: ExtractFrameNode,
};

interface WeavyEditorProps {
  flowId: string;
}

export default function WeavyEditor({ flowId }: WeavyEditorProps) {
  // State for sidebar tabs
  const [activeTab, setActiveTab] = useState('recent');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);

  // Drop handlers
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowInstance) return;

      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!bounds) return;

      // Project the mouse position to flow coordinates
      const position = reactFlowInstance.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const newNode: Node = {
        id: uuidv4(),
        type,
        position,
        data: { label: `${type} Node` },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [reactFlowInstance, setNodes]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        id: uuidv4(),
        animated: true,
        style: { stroke: '#6F42C1' },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  return (
    <div id="weavy-main" style={{ height: '100vh', width: '100vw', overflow: 'hidden', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', display: 'flex', zIndex: 10, pointerEvents: 'none' }}>
        
        {/* Narrow Toolbar */}
        <div style={{ height: '100%', width: '56px', pointerEvents: 'all', background: '#0E0E13', borderRight: '1px solid #2A2A2F', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0' }}>
          <div style={{ marginBottom: '24px', width: '32px', height: '32px', background: '#6F42C1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '16px', fontWeight: 'bold' }}>W</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button onClick={() => { setActiveTab('search'); setIsSidebarOpen(true); }} style={{ background: 'transparent', border: 'none', color: activeTab === 'search' ? '#fff' : '#888', cursor: 'pointer', padding: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M10.5 18C14.6421 18 18 14.6421 18 10.5C18 6.35786 14.6421 3 10.5 3C6.35786 3 3 6.35786 3 10.5C3 14.6421 6.35786 18 10.5 18Z" stroke="currentColor" strokeWidth="1.125"></path><path d="M15.8035 15.8035L21 21" stroke="currentColor" strokeWidth="1.125"></path></svg>
            </button>
            <button onClick={() => { setActiveTab('recent'); setIsSidebarOpen(true); }} style={{ background: 'transparent', border: 'none', color: activeTab === 'recent' ? '#fff' : '#888', cursor: 'pointer', padding: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 7.5V12L15.75 14.25" stroke="currentColor" strokeWidth="1.125"></path><path d="M6.75 9.75H3V6" stroke="currentColor" strokeWidth="1.125"></path><path d="M6.3375 18.0004C7.51685 19.1132 8.99798 19.8538 10.5958 20.1297C12.1937 20.4056 13.8374 20.2045 15.3217 19.5515C16.8059 18.8986 18.0648 17.8227 18.9411 16.4584C19.8173 15.0941 20.2721 13.5017 20.2486 11.8804C20.2251 10.2591 19.7244 8.68062 18.8089 7.34226C17.8934 6.0039 16.6039 4.96499 15.1014 4.35533C13.5988 3.74568 11.95 3.59231 10.3608 3.9144C8.77157 4.23648 7.31253 5.01974 6.16594 6.1663C5.0625 7.2838 4.15125 8.33755 3 9.75036" stroke="currentColor" strokeWidth="1.125"></path></svg>
            </button>
          </div>
        </div>

        {/* Expanded Sidebar Panel */}
        {isSidebarOpen && (
          <div style={{ height: '100%', width: '240px', pointerEvents: 'all', background: '#131318', borderRight: '1px solid #2A2A2F', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div style={{ padding: '16px', color: 'white', flex: 1, overflowY: 'auto' }}>
              <h3 style={{ fontSize: '14px', marginBottom: '16px', fontWeight: 600, color: '#E1E1E3' }}>
                {activeTab === 'recent' ? 'Quick access' : 'Search'}
              </h3>
              
              {/* Search Input */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ background: '#1E1E24', borderRadius: '8px', padding: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10.5 18C14.6421 18 18 14.6421 18 10.5C18 6.35786 14.6421 3 10.5 3C6.35786 3 3 6.35786 3 10.5C3 14.6421 6.35786 18 10.5 18Z" stroke="#888" strokeWidth="1.125"></path></svg>
                  <input type="text" placeholder="Search" style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none', fontSize: '12px' }} />
                </div>
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                
                {activeTab === 'recent' && (
                  <>
                    {/* Node 1: Text Node */}
                    <div 
                      draggable 
                      onDragStart={(e) => { 
                        e.dataTransfer.setData('application/reactflow', 'textNode'); 
                        e.dataTransfer.effectAllowed = 'move'; 
                      }} 
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '8px', cursor: 'grab', background: '#1E1E24', transition: 'all 0.2s', border: '1px solid transparent' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6F42C1'; e.currentTarget.style.background = '#1A1A20'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = '#1E1E24'; }}
                    >
                      <MessageSquareText className="w-5 h-5 flex-shrink-0" color="#E1E1E3" />
                      <span style={{ fontSize: '13px', color: '#E1E1E3' }}>Text Node</span>
                    </div>

                    {/* Node 2: Upload Image */}
                    <div 
                      draggable 
                      onDragStart={(e) => { 
                        e.dataTransfer.setData('application/reactflow', 'uploadImageNode'); 
                        e.dataTransfer.effectAllowed = 'move'; 
                      }} 
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '8px', cursor: 'grab', background: '#1E1E24', transition: 'all 0.2s', border: '1px solid transparent' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6F42C1'; e.currentTarget.style.background = '#1A1A20'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = '#1E1E24'; }}
                    >
                      <Image className="w-5 h-5 flex-shrink-0" color="#E1E1E3" />
                      <span style={{ fontSize: '13px', color: '#E1E1E3' }}>Upload Image</span>
                    </div>

                    {/* Node 3: Upload Video */}
                    <div 
                      draggable 
                      onDragStart={(e) => { 
                        e.dataTransfer.setData('application/reactflow', 'uploadVideoNode'); 
                        e.dataTransfer.effectAllowed = 'move'; 
                      }} 
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '8px', cursor: 'grab', background: '#1E1E24', transition: 'all 0.2s', border: '1px solid transparent' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6F42C1'; e.currentTarget.style.background = '#1A1A20'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = '#1E1E24'; }}
                    >
                      <Video className="w-5 h-5 flex-shrink-0" color="#E1E1E3" />
                      <span style={{ fontSize: '13px', color: '#E1E1E3' }}>Upload Video</span>
                    </div>

                    {/* Node 4: Run Any LLM */}
                    <div 
                      draggable 
                      onDragStart={(e) => { 
                        e.dataTransfer.setData('application/reactflow', 'llmNode'); 
                        e.dataTransfer.effectAllowed = 'move'; 
                      }} 
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '8px', cursor: 'grab', background: '#1E1E24', transition: 'all 0.2s', border: '1px solid transparent' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6F42C1'; e.currentTarget.style.background = '#1A1A20'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = '#1E1E24'; }}
                    >
                      <Sparkles className="w-5 h-5 flex-shrink-0" color="#E1E1E3" />
                      <span style={{ fontSize: '13px', color: '#E1E1E3' }}>Run Any LLM</span>
                    </div>

                    {/* Node 5: Crop Image */}
                    <div 
                      draggable 
                      onDragStart={(e) => { 
                        e.dataTransfer.setData('application/reactflow', 'cropImageNode'); 
                        e.dataTransfer.effectAllowed = 'move'; 
                      }} 
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '8px', cursor: 'grab', background: '#1E1E24', transition: 'all 0.2s', border: '1px solid transparent' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6F42C1'; e.currentTarget.style.background = '#1A1A20'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = '#1E1E24'; }}
                    >
                      <Crop className="w-5 h-5 flex-shrink-0" color="#E1E1E3" />
                      <span style={{ fontSize: '13px', color: '#E1E1E3' }}>Crop Image</span>
                    </div>

                    {/* Node 6: Extract Frame */}
                    <div 
                      draggable 
                      onDragStart={(e) => { 
                        e.dataTransfer.setData('application/reactflow', 'extractFrameNode'); 
                        e.dataTransfer.effectAllowed = 'move'; 
                      }} 
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '8px', cursor: 'grab', background: '#1E1E24', transition: 'all 0.2s', border: '1px solid transparent' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6F42C1'; e.currentTarget.style.background = '#1A1A20'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = '#1E1E24'; }}
                    >
                      <Film className="w-5 h-5 flex-shrink-0" color="#E1E1E3" />
                      <span style={{ fontSize: '13px', color: '#E1E1E3' }}>Extract Frame</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Canvas Area */}
      <div ref={reactFlowWrapper} style={{ flexGrow: 1, position: 'relative', marginLeft: isSidebarOpen ? '296px' : '56px', transition: 'margin-left 0.2s' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          onInit={setReactFlowInstance}
          fitView
          className="dark"
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          style={{ background: 'rgb(14, 14, 19)' }}
        >
          <Background 
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#65616b"
          />
          <Controls style={{ bottom: 20, left: 20 }} />
          <MiniMap
            style={{
              height: 120,
              backgroundColor: "rgba(0,0,0,0.2)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            zoomable
            pannable
          />
        </ReactFlow>
      </div>
    </div>
  );
}
