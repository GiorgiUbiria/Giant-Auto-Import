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
          <h2 className="text-2xl font-semibold">{t("title")}</h2>
          <p className="text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <Button onClick={handleDownloadTemplate} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          {t("downloadTemplate")}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            {t("uploadCsv")}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            {t("versionHistory")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("uploadNewCsv")}</CardTitle>
              <CardDescription>
                {t("uploadDescription")}
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
              <CardTitle>{t("csvVersionHistory")}</CardTitle>
              <CardDescription>
                {t("historyDescription")}
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