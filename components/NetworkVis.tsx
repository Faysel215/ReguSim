import React, { useMemo } from 'react';
import { NodeEntity, LinkEntity } from '../types';

interface NetworkVisProps {
  nodes: NodeEntity[];
  links: LinkEntity[];
}

const NetworkVis: React.FC<NetworkVisProps> = ({ nodes, links }) => {
  // Memoize links to avoid re-calculating on every render if inputs don't change
  // Note: In a real heavy simulation we'd use Canvas, but for < 100 nodes SVG is fine and easier to style in React
  
  return (
    <div className="w-full h-full min-h-[300px] bg-slate-900/50 rounded-lg p-4 border border-slate-700 overflow-hidden relative">
      <h3 className="text-sm font-semibold text-slate-400 mb-2 tracking-wider uppercase">Contagion Network Map</h3>
      <div className="absolute top-4 right-4 flex flex-col gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-cyan-500"></span> Healthy</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> Stressed</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-600"></span> Defaulted</div>
      </div>
      <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
        <g>
          {links.map((link, i) => {
             const source = nodes.find(n => n.id === link.source);
             const target = nodes.find(n => n.id === link.target);
             if (!source || !target) return null;
             
             // Calculate opacity based on stress of connected nodes
             const stressFactor = (200 - source.health - target.health) / 200;
             const strokeColor = stressFactor > 0.6 ? '#ef4444' : '#334155';
             const strokeWidth = stressFactor > 0.6 ? 1.5 : 0.5;

             return (
               <line
                 key={i}
                 x1={source.x}
                 y1={source.y}
                 x2={target.x}
                 y2={target.y}
                 stroke={strokeColor}
                 strokeWidth={strokeWidth}
                 opacity={0.6}
               />
             );
          })}
        </g>
        <g>
          {nodes.map((node) => {
            let fill = '#06b6d4'; // Cyan 500
            let r = 4;
            
            if (node.type === 'SUKUK_ISSUER') r = 6;
            if (node.type === 'MARKET_MAKER') {
                fill = '#8b5cf6'; // Violet 500
                r = 5;
            }

            if (node.health < 30) fill = '#dc2626'; // Red 600
            else if (node.health < 70) fill = '#eab308'; // Yellow 500

            // Pulse effect for defaulting nodes
            const isDefaulting = node.health < 30;

            return (
              <g key={node.id}>
                {isDefaulting && (
                  <circle cx={node.x} cy={node.y} r={r * 2.5} fill={fill} opacity="0.2">
                    <animate attributeName="r" from={r} to={r * 2.5} dur="1s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.6" to="0" dur="1s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={r}
                  fill={fill}
                  stroke="#0f172a"
                  strokeWidth="1"
                />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default NetworkVis;