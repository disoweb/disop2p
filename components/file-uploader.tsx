"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, X, Check } from "lucide-react"

interface FileUploaderProps {
  label: string
  icon?: React.ReactNode
  accept?: string
  onFileSelected: (file: File) => void
  required?: boolean
}

export function FileUploader({ label, icon, accept, onFileSelected, required = false }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      onFileSelected(selectedFile)

      // Create preview for images
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreview(e.target?.result as string)
        }
        reader.readAsDataURL(selectedFile)
      } else {
        setPreview(null)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      setFile(droppedFile)
      onFileSelected(droppedFile)

      // Create preview for images
      if (droppedFile.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreview(e.target?.result as string)
        }
        reader.readAsDataURL(droppedFile)
      } else {
        setPreview(null)
      }
    }
  }

  const removeFile = () => {
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <input
        type="file"
        id={`file-${label}`}
        className="sr-only"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        required={required}
      />

      {!file ? (
        <Card
          className={`border-2 border-dashed p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              {icon || <Upload className="h-6 w-6" />}
            </div>
            <div>
              <p className="font-medium text-gray-800">{label}</p>
              <p className="text-sm text-gray-500 mt-1">Drag & drop or click to browse</p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="relative overflow-hidden">
          {preview ? (
            <div className="relative aspect-video w-full">
              <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white text-gray-800 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                >
                  Change
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                <Check className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-gray-800/70 text-white hover:bg-gray-800"
            onClick={(e) => {
              e.stopPropagation()
              removeFile()
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </Card>
      )}
    </div>
  )
}
