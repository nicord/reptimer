import React, { useState, useRef } from 'react'
import {
  XMarkIcon,
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline'
import { Routine } from '../types'
import { exportRoutine, importRoutine, downloadRoutineAsFile } from '../utils/storage'

interface ImportExportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (routine: Routine) => void
  currentRoutine?: Routine
  mode: 'import' | 'export'
}

export default function ImportExportModal({
  isOpen,
  onClose,
  onImport,
  currentRoutine,
  mode
}: ImportExportModalProps) {
  const [jsonInput, setJsonInput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const exportJson = currentRoutine ? exportRoutine(currentRoutine) : ''

  // Handle file import
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      try {
        const routine = importRoutine(content)
        onImport(routine)
        onClose()
        setError('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to import routine')
      }
    }
    reader.readAsText(file)
  }

  // Handle JSON text import
  const handleJsonImport = () => {
    try {
      const routine = importRoutine(jsonInput.trim())
      onImport(routine)
      onClose()
      setError('')
      setJsonInput('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import routine')
    }
  }

  // Copy to clipboard
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportJson)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.warn('Failed to copy to clipboard:', err)
    }
  }

  // Download as file
  const handleDownload = () => {
    if (!currentRoutine) return
    const filename = `routine-${new Date().toISOString().split('T')[0]}.json`
    downloadRoutineAsFile(currentRoutine, filename)
  }

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setError('')
      setJsonInput('')
      setCopied(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4 text-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              {mode === 'import' ? (
                <>
                  <DocumentArrowUpIcon className="w-5 h-5 mr-2" />
                  Import Routine
                </>
              ) : (
                <>
                  <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                  Export Routine
                </>
              )}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
            {mode === 'import' ? (
              <div className="space-y-6">
                {/* File upload */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Import from File</h3>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileImport}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-primary"
                    >
                      <DocumentArrowUpIcon className="w-4 h-4 mr-2" />
                      Choose JSON File
                    </button>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Select a .json file containing routine data
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">OR</span>
                  </div>
                </div>

                {/* JSON text input */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Import from JSON Text</h3>
                  <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder="Paste routine JSON here..."
                    className="w-full h-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 font-mono"
                  />
                  {error && (
                    <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {error}
                    </div>
                  )}
                  <button
                    onClick={handleJsonImport}
                    disabled={!jsonInput.trim()}
                    className="btn btn-primary mt-3 disabled:opacity-50"
                  >
                    Import Routine
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Export options */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Export Options</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={handleDownload}
                      className="btn btn-primary"
                    >
                      <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                      Download File
                    </button>
                    <button
                      onClick={handleCopyToClipboard}
                      className="btn btn-secondary"
                    >
                      {copied ? (
                        <>
                          <ClipboardDocumentCheckIcon className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <ClipboardDocumentIcon className="w-4 h-4 mr-2" />
                          Copy to Clipboard
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* JSON preview */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Routine JSON</h3>
                  <div className="relative">
                    <pre className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-xs bg-gray-50 dark:bg-gray-900 font-mono overflow-auto">
                      {exportJson}
                    </pre>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    This JSON can be saved to a file or shared with others to import the same routine.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
