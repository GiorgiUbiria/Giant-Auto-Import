"use client";

import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { useServerAction } from "zsa-react";
import { getCsvVersionsAction, activateCsvVersionAction, deleteCsvVersionAction } from "@/lib/actions/pricingActions";
import { recalculateAllCarFeesAction } from "@/lib/actions/pricingActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Play, 
  Trash2, 
  Calendar,
  User,
  FileText,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export const CsvVersionHistory = () => {
  const t = useTranslations('CsvManagement');
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { execute: getVersions } = useServerAction(getCsvVersionsAction);
  const { execute: activateVersion, isPending: activating } = useServerAction(activateCsvVersionAction);
  const { execute: deleteVersion, isPending: deleting } = useServerAction(deleteCsvVersionAction);
  const { execute: recalculateFees, isPending: recalculating } = useServerAction(recalculateAllCarFeesAction);

  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    try {
      setLoading(true);
      const [result, error] = await getVersions();
      if (error) {
        toast.error("Failed to load CSV versions");
        return;
      }
      if (result.success) {
        setVersions(result.data || []);
      } else {
        toast.error("Failed to load CSV versions");
      }
    } catch (error) {
      toast.error("Failed to load CSV versions");
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (versionId: number) => {
    try {
      const [result, error] = await activateVersion({ versionId });
      if (error) {
        toast.error("Failed to activate CSV version");
        return;
      }
      if (result.success) {
        toast.success("CSV version activated successfully");
        loadVersions(); // Reload to update active status
      } else {
        toast.error(result.message || "Failed to activate version");
      }
    } catch (error) {
      toast.error("Failed to activate CSV version");
    }
  };

  const handleDelete = async (versionId: number) => {
    try {
      const [result, error] = await deleteVersion({ versionId });
      if (error) {
        toast.error("Failed to delete CSV version");
        return;
      }
      if (result.success) {
        toast.success("CSV version deleted successfully");
        loadVersions(); // Reload to update list
      } else {
        toast.error(result.message || "Failed to delete version");
      }
    } catch (error) {
      toast.error("Failed to delete CSV version");
    }
  };

  const handleRecalculateFees = async () => {
    try {
      const [result, error] = await recalculateFees();
      if (error) {
        toast.error("Failed to recalculate fees");
        return;
      }
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message || "Failed to recalculate fees");
      }
    } catch (error) {
      toast.error("Failed to recalculate fees");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          No CSV versions found. Upload your first CSV file to get started.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">CSV Versions</h3>
        <div className="flex gap-2">
          <Button 
            onClick={handleRecalculateFees} 
            variant="outline" 
            size="sm"
            disabled={recalculating}
          >
            {recalculating ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-3 w-3 mr-1" />
            )}
            Recalculate All Fees
          </Button>
          <Button onClick={loadVersions} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uploaded By</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {versions.map((version) => (
              <TableRow key={version.id}>
                <TableCell className="font-medium">
                  {version.versionName}
                </TableCell>
                <TableCell>
                  {version.isActive ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactive
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {version.uploadedBy}
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {format(new Date(version.uploadedAt), "MMM dd, yyyy HH:mm")}
                </TableCell>
                <TableCell>
                  {version.description || (
                    <span className="text-muted-foreground">No description</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {!version.isActive && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleActivate(version.id)}
                        disabled={activating}
                      >
                        {activating ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                        Activate
                      </Button>
                    )}
                    
                    {!version.isActive && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete CSV Version</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &quot;{version.versionName}&quot;? 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(version.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>• Only one version can be active at a time</p>
        <p>• Active versions cannot be deleted</p>
        <p>• Uploading a new version will automatically activate it</p>
      </div>
    </div>
  );
}; 