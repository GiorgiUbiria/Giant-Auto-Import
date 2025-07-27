"use client";

import { useState } from "react";
import { useTranslations } from 'next-intl';
import { CsvUploadForm } from "./csv-upload-form";
import { CsvVersionHistory } from "./csv-version-history";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, History, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateCsvTemplate } from "@/lib/csv-utils";

export const CsvManagementClient = () => {
  const t = useTranslations('CsvManagement');
  const [activeTab, setActiveTab] = useState("upload");

  const handleDownloadTemplate = () => {
    const template = generateCsvTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pricing-template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">CSV Data Management</h2>
          <p className="text-muted-foreground">
            Upload new pricing data and manage existing versions
          </p>
        </div>
        <Button onClick={handleDownloadTemplate} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload CSV
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Version History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload New CSV Data</CardTitle>
              <CardDescription>
                Upload a new CSV file with updated pricing data. The file must follow the required format.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CsvUploadForm onSuccess={() => setActiveTab("history")} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>CSV Version History</CardTitle>
              <CardDescription>
                View and manage uploaded CSV versions. Only one version can be active at a time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CsvVersionHistory />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 