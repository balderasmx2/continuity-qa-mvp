'use client';

import React, { useState, useRef } from 'react';
import { Upload, AlertTriangle, Zap, TrendingUp, Activity, Image } from 'lucide-react';

interface Frame {
  id: number;
  url: string;
  name: string;
  file: File;
}

interface Issue {
  id: number;
  type: string;
  severity: 'high' | 'medium' | 'low';
  frames: number[];
  description: string;
  confidence: number;
  location?: { x: number; y: number };
  colorDelta?: { deltaE: number; temp: string };
  exposure?: string;
  displacement?: string;
}

interface AnalysisResults {
  totalFrames: number;
  sceneName: string;
  analysisDate: string;
  continuityScore: number;
  issues: Issue[];
  metrics: {
    colorConsistency: number;
    objectTracking: number;
    lightingConsistency: number;
    spatialContinuity: number;
  };
}

export default function ContinuityQASystem() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeFrames = async (imageFiles: File[]) => {
    setAnalyzing(true);
    
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const mockResults: AnalysisResults = {
      totalFrames: imageFiles.length,
      sceneName: "Scene_045_Shot_12",
      analysisDate: new Date().toLocaleString(),
      continuityScore: 78,
      issues: [
        {
          id: 1,
          type: "prop_discontinuity",
          severity: "high",
          frames: [2, 3],
          description: "Cup disappears between frame 2 and 3",
          confidence: 0.94,
          location: { x: 340, y: 520 }
        },
        {
          id: 2,
          type: "color_shift",
          severity: "medium",
          frames: [5, 6],
          description: "Drastic color temperature shift (+450K)",
          confidence: 0.88,
          colorDelta: { deltaE: 12.4, temp: "+450K" }
        },
        {
          id: 3,
          type: "wardrobe_change",
          severity: "high",
          frames: [7, 8],
          description: "Main character necklace change",
          confidence: 0.91,
          location: { x: 512, y: 180 }
        },
        {
          id: 4,
          type: "lighting_inconsistency",
          severity: "low",
          frames: [4, 5],
          description: "Minor exposure variation (-0.3 stops)",
          confidence: 0.76,
          exposure: "-0.3 EV"
        },
        {
          id: 5,
          type: "position_jump",
          severity: "medium",
          frames: [6, 7],
          description: "Background object position jump (15px)",
          confidence: 0.82,
          displacement: "15px"
        }
      ],
      metrics: {
        colorConsistency: 82,
        objectTracking: 71,
        lightingConsistency: 85,
        spatialContinuity: 76
      }
    };
    
    setResults(mockResults);
    setAnalyzing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    
    const framePromises = imageFiles.map((file, idx) => {
      return new Promise<Frame>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            id: idx,
            url: e.target?.result as string,
            name: file.name,
            file: file
          });
        };
        reader.readAsDataURL(file);
      });
    });
    
    Promise.all(framePromises).then(loadedFrames => {
      setFrames(loadedFrames);
      analyzeFrames(imageFiles);
    });
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'color_shift': return '🎨';
      case 'prop_discontinuity': return '🔧';
      case 'wardrobe_change': return '👔';
      case 'lighting_inconsistency': return '💡';
      case 'position_jump': return '📍';
      default: return '⚠️';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl font-bold">Continuity QA System</h1>
          </div>
          <p className="text-slate-400">Automatic continuity analysis for feature films</p>
        </div>

        {/* Upload Area */}
        {frames.length === 0 && (
          <div className="bg-slate-800 rounded-xl p-12 border-2 border-dashed border-slate-600 hover:border-cyan-500 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="text-center">
              <Upload className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Upload Scene Frames</h3>
              <p className="text-slate-400 mb-6">Upload multiple frames for continuity analysis</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-cyan-600 hover:bg-cyan-700 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Select Frames
              </button>
              <p className="text-sm text-slate-500 mt-4">Supported formats: JPG, PNG, EXR</p>
            </div>
          </div>
        )}

        {/* Analysis in Progress */}
        {analyzing && (
          <div className="bg-slate-800 rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Analyzing Continuity...</h3>
            <p className="text-slate-400">Processing {frames.length} frames with AI models</p>
            <div className="mt-6 space-y-2 text-sm text-slate-500">
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Extracting visual embeddings (CLIP)</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Image className="w-4 h-4 text-cyan-400" />
                <span>Object and prop tracking (YOLO)</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Colorimetric analysis (Delta-E)</span>
              </div>
            </div>
          </div>
        )}

        {/* Results Dashboard */}
        {results && !analyzing && (
          <div className="space-y-6">
            {/* Scene Info & Score */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="text-slate-400 text-sm mb-1">Scene</div>
                <div className="text-2xl font-bold">{results.sceneName}</div>
                <div className="text-slate-500 text-sm mt-1">{results.totalFrames} frames</div>
              </div>
              
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="text-slate-400 text-sm mb-1">Continuity Score</div>
                <div className={`text-4xl font-bold ${getScoreColor(results.continuityScore)}`}>
                  {results.continuityScore}
                  <span className="text-2xl">/100</span>
                </div>
              </div>
              
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="text-slate-400 text-sm mb-1">Issues Detected</div>
                <div className="text-4xl font-bold text-red-400">{results.issues.length}</div>
                <div className="text-sm text-slate-500 mt-1">
                  {results.issues.filter(i => i.severity === 'high').length} critical
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold mb-4">Analysis Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(results.metrics).map(([key, value]) => (
                  <div key={key}>
                    <div className="text-slate-400 text-sm capitalize mb-1">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full ${value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${value}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold">{value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Issues List */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold mb-4">Detected Issues</h3>
              <div className="space-y-3">
                {results.issues.map(issue => (
                  <div 
                    key={issue.id}
                    onClick={() => setSelectedIssue(selectedIssue?.id === issue.id ? null : issue)}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${getSeverityColor(issue.severity)} ${
                      selectedIssue?.id === issue.id ? 'ring-2 ring-cyan-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="text-2xl">{getTypeIcon(issue.type)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold capitalize">
                              {issue.type.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-black bg-opacity-20 font-medium uppercase">
                              {issue.severity}
                            </span>
                          </div>
                          <p className="text-sm mb-2">{issue.description}</p>
                          <div className="flex gap-4 text-xs">
                            <span>Frames: {issue.frames.join(', ')}</span>
                            <span>Confidence: {(issue.confidence * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    </div>
                    
                    {selectedIssue?.id === issue.id && (
                      <div className="mt-4 pt-4 border-t border-current border-opacity-20 space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {issue.colorDelta && (
                            <div>
                              <span className="font-semibold">Delta-E:</span> {issue.colorDelta.deltaE}
                            </div>
                          )}
                          {issue.exposure && (
                            <div>
                              <span className="font-semibold">Exposure:</span> {issue.exposure}
                            </div>
                          )}
                          {issue.displacement && (
                            <div>
                              <span className="font-semibold">Displacement:</span> {issue.displacement}
                            </div>
                          )}
                          {issue.location && (
                            <div>
                              <span className="font-semibold">Location:</span> ({issue.location.x}, {issue.location.y})
                            </div>
                          )}
                        </div>
                        
                        {/* Affected frame thumbnails */}
                        <div>
                          <div className="text-sm font-semibold mb-2">Affected Frames:</div>
                          <div className="flex gap-3">
                            {issue.frames.map(frameIdx => {
                              const frame = frames[frameIdx];
                              if (!frame) return null;
                              return (
                                <div key={frameIdx} className="relative">
                                  <img 
                                    src={frame.url} 
                                    alt={`Frame ${frameIdx}`}
                                    className="w-32 h-24 object-cover rounded border-2 border-current border-opacity-30"
                                  />
                                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 px-2 py-1 rounded text-xs font-semibold">
                                    Frame {frameIdx + 1}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Frame Timeline */}
            {frames.length > 0 && (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold mb-4">Frame Timeline with Issues</h3>
                <div className="space-y-4">
                  <div className="relative">
                    <div className="flex gap-1 overflow-x-auto pb-2">
                      {frames.map((frame, idx) => {
                        const frameIssues = results.issues.filter(issue => 
                          issue.frames.includes(idx)
                        );
                        const hasIssue = frameIssues.length > 0;
                        const highestSeverity = hasIssue 
                          ? frameIssues.reduce((max, issue) => 
                              issue.severity === 'high' ? 'high' : 
                              (max === 'high' || issue.severity === 'medium') ? max : 'low'
                            , 'low' as 'high' | 'medium' | 'low')
                          : null;
                        
                        return (
                          <div 
                            key={frame.id} 
                            className="relative flex-shrink-0 group cursor-pointer"
                            onClick={() => {
                              if (frameIssues.length > 0) {
                                setSelectedIssue(frameIssues[0]);
                              }
                            }}
                          >
                            <div className={`w-16 h-16 rounded border-2 overflow-hidden transition-all
                              ${hasIssue 
                                ? highestSeverity === 'high' 
                                  ? 'border-red-500 ring-2 ring-red-500 ring-opacity-50' 
                                  : highestSeverity === 'medium'
                                    ? 'border-yellow-500 ring-2 ring-yellow-500 ring-opacity-50'
                                    : 'border-blue-500'
                                : 'border-slate-600'
                              } group-hover:border-cyan-500 group-hover:scale-110`}
                            >
                              <img 
                                src={frame.url} 
                                alt={`Frame ${idx}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            <div className="absolute -bottom-5 left-0 right-0 text-center text-xs text-slate-500">
                              {idx + 1}
                            </div>
                            
                            {hasIssue && (
                              <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
                                ${highestSeverity === 'high' ? 'bg-red-500' : 
                                  highestSeverity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`}
                              >
                                {frameIssues.length}
                              </div>
                            )}
                            
                            {hasIssue && (
                              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                <div className="bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg border border-slate-700">
                                  {frameIssues.length} issue{frameIssues.length > 1 ? 's' : ''}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-slate-400 pt-4 border-t border-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border-2 border-red-500 ring-2 ring-red-500 ring-opacity-50"></div>
                      <span>Critical Issue</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border-2 border-yellow-500 ring-2 ring-yellow-500 ring-opacity-50"></div>
                      <span>Medium Issue</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border-2 border-blue-500"></div>
                      <span>Low Issue</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border-2 border-slate-600"></div>
                      <span>No Issues</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setFrames([]);
                  setResults(null);
                  setSelectedIssue(null);
                }}
                className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                New Analysis
              </button>
              <button
                className="bg-cyan-600 hover:bg-cyan-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                onClick={() => {
                  const reportData = JSON.stringify(results, null, 2);
                  const blob = new Blob([reportData], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `qa_report_${results.sceneName}_${Date.now()}.json`;
                  a.click();
                }}
              >
                Export Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}