import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, File, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioUploadProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  uploadProgress: number;
  error?: string;
}

export default function AudioUpload({ onFileSelect, isUploading, uploadProgress, error }: AudioUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
    // Log rejected files for debugging
    if (rejectedFiles.length > 0) {
      console.log('Rejected files:', rejectedFiles);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: false
  });

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <File className="text-primary mr-2 h-5 w-5" />
          Upload Interview Audio
        </h2>
        
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer",
            isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
            isUploading && "pointer-events-none opacity-50"
          )}
          data-testid="audio-upload-dropzone"
        >
          <input {...getInputProps()} data-testid="audio-upload-input" />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-foreground font-medium mb-2">
            {isDragActive ? "Drop your audio file here" : "Drag & drop your audio file here"}
          </p>
          <p className="text-muted-foreground text-sm mb-4">
            Supports MP3, WAV, M4A files up to 100MB
          </p>
          <Button 
            type="button" 
            disabled={isUploading}
            data-testid="button-browse-files"
          >
            <Upload className="mr-2 h-4 w-4" />
            Browse Files
          </Button>
        </div>

        {/* File Upload Progress */}
        {(isUploading || selectedFile) && (
          <div className="mt-4" data-testid="upload-progress-container">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span data-testid="text-filename">{selectedFile?.name}</span>
              {isUploading && <span data-testid="text-upload-progress">{uploadProgress}%</span>}
            </div>
            {isUploading && (
              <Progress 
                value={uploadProgress} 
                className="w-full"
                data-testid="progress-upload"
              />
            )}
          </div>
        )}

        {/* Error Messages */}
        {(error || fileRejections.length > 0) && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md" data-testid="upload-error-message">
            <div className="flex items-center text-destructive text-sm">
              <AlertCircle className="mr-2 h-4 w-4" />
              {error || fileRejections[0]?.errors[0]?.message || "Invalid file type. Please upload MP3, WAV, or M4A files only."}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
