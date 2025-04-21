import React, { useState, useRef, useCallback } from 'react'

interface FileItem {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  result?: { success: boolean }
  error?: string
}

const JsonFileUploader: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  /**
   * Обновляет состояние файла.
   */
  const updateFile = useCallback(
    (
      file: File,
      updates: Partial<FileItem> | ((prev: FileItem) => Partial<FileItem>)
    ) => {
      setFiles(prevFiles =>
        prevFiles.map(item => {
          if (item.file !== file) return item
          const changes = typeof updates === 'function' ? updates(item) : updates
          return { ...item, ...changes }
        })
      )
    },
    []
  )

  const uploadFile = useCallback(
    (item: FileItem) => {
      updateFile(item.file, { status: 'uploading', progress: 0 })

      const interval = setInterval(() => {
        updateFile(item.file, prev => ({
          progress: Math.min(prev.progress + Math.random() * 10, 90)
        }))
      }, 200)

      const reader = new FileReader()
      reader.onload = async () => {
        clearInterval(interval)
        try {
          const json = JSON.parse(reader.result as string)
          const resp = await fetch('http://localhost:3000/api/fill', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(json)
          })
          const data: { success: boolean } = await resp.json()
          updateFile(item.file, {
            status: resp.ok && data.success ? 'success' : 'error',
            progress: 100,
            result: data
          })
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Unknown error'
          updateFile(item.file, { status: 'error', progress: 100, error: message })
        }
      }
      reader.readAsText(item.file)
    },
    [updateFile]
  )

  const handleFiles = (selected: FileList | null) => {
    if (!selected) return
    const newItems: FileItem[] = Array.from(selected).map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }))
    setFiles(prev => [...prev, ...newItems])
    newItems.forEach(uploadFile)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="p-4 grid gap-4">
      <h1 className="text-xl font-semibold">Загрузите JSON файлы</h1>
      <input
        ref={inputRef}
        type="file"
        accept="application/json"
        multiple
        onChange={e => handleFiles(e.target.files)}
        className="p-2 border rounded"
      />

      <div className="grid gap-3">
        {files.map((item, idx) => (
          <div key={idx} className="p-4 bg-white rounded-2xl shadow">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{item.file.name}</span>
              <span className="text-sm">
                {item.status === 'uploading' && 'Загрузка…'}
                {item.status === 'success' && 'Успешно'}
                {item.status === 'error' && 'Ошибка'}
              </span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded mb-2 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded transition-all"
                style={{ width: `${item.progress}%` }}
              />
            </div>
            {item.status === 'success' && item.result && (
              <div className="text-green-600 text-sm">
                Файл «{item.file.name}» успешно обработан.
              </div>
            )}
            {item.status === 'error' && (
              <div className="text-red-500 text-sm">{item.error}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default JsonFileUploader