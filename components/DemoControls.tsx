'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Settings, X, Play, RotateCcw, CheckCircle, XCircle, Loader2, Terminal } from 'lucide-react'

type ScriptStatus = 'idle' | 'running' | 'success' | 'error'

interface ScriptResult {
  output: string
  error?: string
}

export default function DemoControls() {
  const [isVisible, setIsVisible] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [createStatus, setCreateStatus] = useState<ScriptStatus>('idle')
  const [resetStatus, setResetStatus] = useState<ScriptStatus>('idle')
  const [output, setOutput] = useState<string>('')
  const [lastAction, setLastAction] = useState<string>('')

  // Listen for keyboard shortcut: Cmd/Ctrl + Shift + D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        setIsVisible(true)
        setIsOpen(true)
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const runScript = useCallback(async (action: 'create' | 'reset') => {
    const setStatus = action === 'create' ? setCreateStatus : setResetStatus
    setStatus('running')
    setOutput('')
    setLastAction(action === 'create' ? 'Create Demo PR' : 'Reset Demo')

    try {
      const response = await fetch(`/api/demo/${action}`, {
        method: 'POST',
      })

      const data: ScriptResult & { success: boolean } = await response.json()

      setOutput(data.output || data.error || 'No output')
      setStatus(data.success ? 'success' : 'error')
    } catch (error: any) {
      setOutput(`Error: ${error.message}`)
      setStatus('error')
    }
  }, [])

  const isRunning = createStatus === 'running' || resetStatus === 'running'

  // Don't render anything if not visible
  if (!isVisible) {
    return null
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-slate-800 hover:bg-slate-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 z-40"
        title="Demo Controls (Cmd+Shift+D)"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-slate-800 to-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <Terminal className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Demo Controls</h2>
                  <p className="text-xs text-slate-300">Macroscope demo workflow</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Create Demo Button */}
                <button
                  onClick={() => runScript('create')}
                  disabled={isRunning}
                  className="flex flex-col items-center gap-2 p-4 bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 hover:border-indigo-300 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="w-10 h-10 bg-indigo-500 group-hover:bg-indigo-600 rounded-lg flex items-center justify-center transition-colors">
                    {createStatus === 'running' ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : createStatus === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : createStatus === 'error' ? (
                      <XCircle className="w-5 h-5 text-white" />
                    ) : (
                      <Play className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <span className="font-medium text-indigo-900">Create Demo PR</span>
                  <span className="text-xs text-indigo-600">Branch + bugs + PR</span>
                </button>

                {/* Reset Demo Button */}
                <button
                  onClick={() => runScript('reset')}
                  disabled={isRunning}
                  className="flex flex-col items-center gap-2 p-4 bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 hover:border-slate-300 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="w-10 h-10 bg-slate-600 group-hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors">
                    {resetStatus === 'running' ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : resetStatus === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : resetStatus === 'error' ? (
                      <XCircle className="w-5 h-5 text-white" />
                    ) : (
                      <RotateCcw className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <span className="font-medium text-slate-900">Reset Demo</span>
                  <span className="text-xs text-slate-600">Clean up branches</span>
                </button>
              </div>

              {/* Output Console */}
              {(output || isRunning) && (
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  {/* Console Header */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 border-b border-gray-200">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <span className="text-xs font-medium text-gray-600 ml-2">
                      {lastAction} {isRunning && '- Running...'}
                    </span>
                    {!isRunning && (createStatus === 'success' || resetStatus === 'success') && (
                      <span className="ml-auto text-xs text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Success
                      </span>
                    )}
                    {!isRunning && (createStatus === 'error' || resetStatus === 'error') && (
                      <span className="ml-auto text-xs text-red-600 font-medium flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Error
                      </span>
                    )}
                  </div>

                  {/* Console Output */}
                  <div className="bg-slate-900 p-4 max-h-64 overflow-auto">
                    {isRunning && !output ? (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Running script...</span>
                      </div>
                    ) : (
                      <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                        {output || 'No output'}
                      </pre>
                    )}
                  </div>
                </div>
              )}

              {/* Help Text */}
              {!output && !isRunning && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">
                    Click a button to run the demo workflow script.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Shortcut: <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">⌘⇧D</kbd>
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Demo controls are only available in development mode
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
