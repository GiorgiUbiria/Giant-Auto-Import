"use client";

import { useState, useRef } from "react";
import { useTranslations } from 'next-intl';
import { useServerAction } from "zsa-react";
import { uploadCsvAction } from "@/lib/actions/pricingActions";
import { validateCsvFormat, parseCsvToJson } from "@/lib/csv-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, FileText, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface CsvUploadFormProps {
  onSuccess?: () => void;
}

export const CsvUploadForm = ({ onSuccess }: CsvUploadFormProps) => {
  const t = useTranslations('CsvManagement');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvContent, setCsvContent] = useState("");
  const [versionName, setVersionName] = useState("");
  const [description, setDescription] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isValid, setIsValid] = useState(false);

  const { execute: uploadCsv, isPending } = useServerAction(uploadCsvAction);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvContent(content);
      validateCsvContent(content);
    };
    reader.readAsText(file);
  };

  const handlePaste = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = event.target.value;
    setCsvContent(content);
    validateCsvContent(content);
  };

  const validateCsvContent = (content: string) => {
    if (!content.trim()) {
      setIsValid(false);
      setValidationErrors([]);
      setPreviewData([]);
      return;
    }

    const validation = validateCsvFormat(content);
    setValidationErrors(validation.errors);
    setIsValid(validation.isValid);

    if (validation.isValid) {
      try {
        const data = parseCsvToJson(content);
        setPreviewData(data.slice(0, 5)); // Show first 5 rows
      } catch (error) {
        setValidationErrors([`Error parsing CSV: ${error}`]);
        setIsValid(false);
      }
    } else {
      setPreviewData([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid || !versionName.trim()) {
      toast.error("Please fix validation errors and provide a version name");
      return;
    }

    try {
      const [result, error] = await uploadCsv({
        versionName: versionName.trim(),
        csvContent,
        description: description.trim() || undefined,
      });

      if (error) {
        toast.error("Failed to upload CSV file");
        return;
      }

      if (result.success) {
        toast.success(result.message);
        setCsvContent("");
        setVersionName("");
        setDescription("");
        setValidationErrors([]);
        setPreviewData([]);
        setIsValid(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        onSuccess?.();
      } else {
        toast.error(result.message);
        if (result.errors) {
          setValidationErrors(result.errors);
        }
      }
    } catch (error) {
      toast.error("Failed to upload CSV file");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === "text/csv") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCsvContent(content);
        validateCsvContent(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* File Upload Section */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="versionName">Version Name *</Label>
            <Input
              id="versionName"
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              placeholder="e.g., Q1 2024 Pricing Update"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this pricing update..."
              rows={3}
            />
          </div>

          <div>
            <Label>Upload CSV File</Label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                Click to upload or drag and drop a CSV file
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports .csv files only
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div>
            <Label>Or Paste CSV Content</Label>
            <Textarea
              value={csvContent}
              onChange={handlePaste}
              placeholder="Paste your CSV content here..."
              rows={8}
              className="font-mono text-sm"
            />
          </div>
        </div>

        {/* Validation & Preview Section */}
        <div className="space-y-4">
          <div>
            <Label>Validation Status</Label>
            <div className="mt-2">
              {csvContent ? (
                isValid ? (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      CSV format is valid
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      CSV format has errors
                    </AlertDescription>
                  </Alert>
                )
              ) : (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    No CSV content provided
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {validationErrors.length > 0 && (
            <div>
              <Label>Validation Errors</Label>
              <div className="mt-2 space-y-1">
                {validationErrors.map((error, index) => (
                  <Alert key={index} className="border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 text-sm">
                      {error}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          {previewData.length > 0 && (
            <div>
              <Label>Data Preview (First 5 rows)</Label>
              <Card className="mt-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Parsed Data</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {previewData.map((row, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="text-xs">
                          {row.auction}
                        </Badge>
                        <span className="flex-1">{row.auctionLocation}</span>
                        <span className="text-muted-foreground">${row.rate}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={!isValid || !versionName.trim() || isPending}>
          {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Upload CSV
        </Button>
      </div>
    </form>
  );
}; 