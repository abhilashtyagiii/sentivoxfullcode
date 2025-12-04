import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles, Upload, X, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { apiFetch } from "@/lib/api";

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  interviewId?: string | null;
}

export default function JobDescriptionInput({ value, onChange, disabled, interviewId }: JobDescriptionInputProps) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleExtractSkills = async () => {
    setIsExtracting(true);
    // TODO: Implement skill extraction using AI
    setTimeout(() => {
      setIsExtracting(false);
    }, 1000);
  };

  const handleFileUpload = async (file: File) => {
    if (!interviewId) {
      setPendingFile(file);
      setUploadedFileName(file.name);
      toast({
        title: "JD File Ready",
        description: "Job description file will be uploaded when you upload the audio.",
      });
      return;
    }

    setIsUploadingFile(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('jobDescriptionFile', file);

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await apiFetch(`/api/interviews/${interviewId}/job-description`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to upload job description file');
      }

      const result = await response.json();
      setUploadProgress(100);
      setUploadedFileName(file.name);
      
      // Update the job description with extracted text
      console.log('[JD Upload] Extracted text length:', result.jobDescription?.length);
      onChange(result.jobDescription || '');

      toast({
        title: "File Uploaded",
        description: "Job description has been extracted from the file successfully.",
      });

    } catch (error: any) {
      console.error("Job description file upload failed:", error);
      toast({
        title: "Upload Failed",
        description: error?.message || "Failed to upload job description file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingFile(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      handleFileUpload(file);
    }
    if (rejectedFiles.length > 0) {
      console.log('Rejected files:', rejectedFiles);
      toast({
        title: "Invalid File",
        description: "Please upload PDF or Word documents only (max 10MB).",
        variant: "destructive",
      });
    }
  }, [interviewId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    disabled: disabled || isUploadingFile
  });

  const clearUploadedFile = () => {
    setUploadedFileName("");
    onChange("");
    setUploadProgress(0);
    setPendingFile(null);
  };

  useEffect(() => {
    if (interviewId && pendingFile && !isUploadingFile) {
      const uploadPendingFile = async () => {
        setIsUploadingFile(true);
        setUploadProgress(0);

        try {
          const formData = new FormData();
          formData.append('jobDescriptionFile', pendingFile);

          const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
              if (prev >= 90) {
                clearInterval(progressInterval);
                return prev;
              }
              return prev + 10;
            });
          }, 200);

          const response = await apiFetch(`/api/interviews/${interviewId}/job-description`, {
            method: 'POST',
            body: formData,
          });

          clearInterval(progressInterval);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to upload job description file');
          }

          const result = await response.json();
          setUploadProgress(100);
          setPendingFile(null);
          
          console.log('[JD Upload] Extracted text:', result.jobDescription?.substring(0, 100));
          onChange(result.jobDescription || '');

          toast({
            title: "File Uploaded",
            description: "Job description has been extracted from the file successfully.",
          });

        } catch (error: any) {
          console.error("Job description file upload failed:", error);
          setPendingFile(null);
          toast({
            title: "Upload Failed",
            description: error?.message || "Failed to upload job description file. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsUploadingFile(false);
        }
      };

      uploadPendingFile();
    }
  }, [interviewId, pendingFile, onChange, toast]);

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <FileText className="text-primary mr-2 h-5 w-5" />
          Job Description
        </h2>
        <p className="text-sm text-muted-foreground mb-3">
          Paste the job description text below or upload a PDF/DOC file
        </p>
        
        {pendingFile && !interviewId ? (
          <div className="border-2 border-yellow-500 rounded-lg p-4 mb-4 bg-yellow-50 dark:bg-yellow-950">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-foreground">File ready: {uploadedFileName}</p>
                  <p className="text-xs text-muted-foreground">Will be uploaded when audio is added</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearUploadedFile}
                disabled={disabled}
                data-testid="button-clear-jd-file"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : uploadedFileName && !isUploadingFile && !pendingFile ? (
          <div className="border-2 border-green-500 rounded-lg p-4 mb-4 bg-green-50 dark:bg-green-950">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-foreground">File uploaded: {uploadedFileName}</p>
                  <p className="text-xs text-muted-foreground">{value.length} characters extracted</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearUploadedFile}
                disabled={disabled}
                data-testid="button-clear-jd-file"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}

        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="min-h-[128px] resize-none mb-4"
          placeholder="Paste the job description here OR upload a PDF/Word document below..."
          data-testid="textarea-job-description"
        />

        {/* File Upload Dropzone */}
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-4 text-center transition-all duration-300 cursor-pointer mb-4",
            isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
            (disabled || isUploadingFile) && "pointer-events-none opacity-50"
          )}
          data-testid="jd-file-upload-dropzone"
        >
          <input {...getInputProps()} data-testid="jd-file-upload-input" />
          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-foreground font-medium mb-1">
            {isDragActive ? "Drop your file here" : "Or drag & drop a file here"}
          </p>
          <p className="text-xs text-muted-foreground">
            Supports PDF, DOC, DOCX up to 10MB
            {!interviewId && " (will be uploaded when audio is added)"}
          </p>
        </div>

        {isUploadingFile && (
          <div className="mb-4">
            <Progress value={uploadProgress} className="h-2" data-testid="progress-jd-upload" />
            <p className="text-xs text-muted-foreground mt-1 text-center">
              Uploading and extracting text... {uploadProgress}%
            </p>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            <span data-testid="text-character-count">{value.length}</span> characters
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExtractSkills}
            disabled={disabled || isExtracting || !value.trim()}
            data-testid="button-extract-skills"
          >
            <Sparkles className="mr-1 h-3 w-3" />
            {isExtracting ? "Extracting..." : "Extract Key Skills"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
