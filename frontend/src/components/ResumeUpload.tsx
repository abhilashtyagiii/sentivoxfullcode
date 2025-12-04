import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResumeUploadProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  uploadProgress: number;
  error?: string;
  isUploaded?: boolean;
  resumeFileName?: string;
}

export default function ResumeUpload({ 
  onFileSelect, 
  isUploading, 
  uploadProgress, 
  error,
  isUploaded,
  resumeFileName 
}: ResumeUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
    if (rejectedFiles.length > 0) {
      console.log('Rejected files:', rejectedFiles);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    disabled: isUploading || isUploaded
  });

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <FileText className="text-primary mr-2 h-5 w-5" />
          Upload Candidate Resume (Optional)
        </h2>
        
        {isUploaded ? (
          <div className="border-2 border-green-500 rounded-lg p-6 text-center bg-green-50 dark:bg-green-950" data-testid="resume-uploaded-success">
            <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
            <p className="text-foreground font-medium mb-2">Resume Uploaded Successfully</p>
            <p className="text-sm text-muted-foreground">{resumeFileName || selectedFile?.name}</p>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer",
              isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
              isUploading && "pointer-events-none opacity-50"
            )}
            data-testid="resume-upload-dropzone"
          >
            <input {...getInputProps()} data-testid="resume-upload-input" />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-foreground font-medium mb-2">
              {isDragActive ? "Drop your resume here" : "Drag & drop resume here"}
            </p>
            <p className="text-muted-foreground text-sm mb-4">
              Supports PDF, DOC, DOCX files up to 10MB
            </p>
            <Button 
              type="button" 
              disabled={isUploading}
              data-testid="button-browse-resume"
            >
              <Upload className="mr-2 h-4 w-4" />
              Browse Files
            </Button>
          </div>
        )}

        {(isUploading || selectedFile) && !isUploaded && (
          <div className="mt-4" data-testid="resume-upload-progress-container">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground font-medium" data-testid="text-resume-filename">
                  {selectedFile?.name}
                </span>
                <span className="text-muted-foreground" data-testid="text-resume-upload-progress">
                  {uploadProgress}%
                </span>
              </div>
              <Progress value={uploadProgress} className="h-2" data-testid="progress-resume-upload" />
            </div>

            {error && (
              <div className="mt-3 p-3 bg-destructive/10 border border-destructive rounded-md flex items-start" data-testid="error-resume-upload">
                <AlertCircle className="h-4 w-4 text-destructive mr-2 mt-0.5" />
                <p className="text-sm text-destructive">
                  {error || fileRejections[0]?.errors[0]?.message || "Invalid file type. Please upload PDF or Word documents only."}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
