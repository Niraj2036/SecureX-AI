"use client";

import React, { useState } from "react";
import { CheckCircle, Download, Upload, FileSpreadsheet, X } from "lucide-react";
import Uploaddata from "@/components/setting-components/upload-data";
import { V3PageHeader } from "@/components/v3/V3PageHeader";
import { V3Card } from "@/components/v3/V3Card";
import { V3Button } from "@/components/v3/V3Button";
import { V3Modal } from "@/components/v3/V3Modal";

const ImportPage: React.FC = () => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDownloadTemplate = () => {
    const fileUrl = "/templates/Template-For-Download.xlsx";
    const link = document.createElement("a");
    link.href = fileUrl;
    link.setAttribute("download", "Template-For-Download.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <V3PageHeader
        title="Import Employee Data"
        description="Bulk import employee information from an Excel template file."
        badgeText="Data Import"
        badgeIcon={<Upload className="h-3 w-3 text-indigo-600" />}
      >
        <V3Button variant="outline" onClick={handleDownloadTemplate}>
          <Download className="h-4 w-4 mr-1.5" />
          Download Template
        </V3Button>
      </V3PageHeader>

      <div className="max-w-2xl space-y-4">
        {/* Import Option Card */}
        <button
          type="button"
          className={`w-full text-left transition-all rounded-xl border-2 ${
            selectedCard === "Employment"
              ? "border-indigo-500 bg-indigo-500/5"
              : "border-border/60 bg-card hover:border-indigo-400/50"
          } p-5`}
          onClick={() => setSelectedCard("Employment")}
        >
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Upload Employment Data</h3>
                {selectedCard === "Employment" && (
                  <CheckCircle className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Import a file with employee names, emails, roles, departments, and teams.
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1.5 flex items-center gap-1.5">
                <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-muted border border-border/60">
                  .xlsx
                </span>
                Excel format only
              </p>
            </div>
          </div>
        </button>

        {/* Action Button */}
        <V3Button
          onClick={() => setDialogOpen(true)}
          disabled={!selectedCard}
          className="w-full"
          size="lg"
        >
          <Upload className="h-4 w-4 mr-1.5" />
          {selectedCard ? "Upload & Import Data" : "Select an import option above"}
        </V3Button>
      </div>

      {/* Upload Modal */}
      <V3Modal
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Upload Employee File"
        description="Upload your Excel file to bulk import employee data."
      >
        <Uploaddata change={setDialogOpen} selectedCard={selectedCard} />
      </V3Modal>
    </div>
  );
};

export default ImportPage;