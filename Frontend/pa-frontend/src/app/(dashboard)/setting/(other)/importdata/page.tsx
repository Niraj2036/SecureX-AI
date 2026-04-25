"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download } from "lucide-react";
import Image from "next/image";
import Uploaddata from "@/components/setting-components/upload-data";
import employment from "../../../../../../public/settings/employment.png";

const ImportPage: React.FC = () => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCardSelect = (card: string) => {
    setSelectedCard(card);
  };

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
    <div className="max-w-3xl mx-auto pt-8 px-4 sm:px-6">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-xl font-semibold text-black">Import Employee Information</h1>
          <Button 
            onClick={handleDownloadTemplate} 
            variant="outline" 
            className="flex items-center gap-2 text-sm self-start sm:self-auto"
          >
            Download Template
            <Download className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Upload your employee data using our template for best results
        </p>
      </div>

      <div className="grid gap-4">
        <Card
          className={`relative cursor-pointer transition-all duration-200 hover:shadow-md ${
            selectedCard === "Employment" ? "ring-2 ring-primary-500" : "border-gray-200"
          }`}
          onClick={() => handleCardSelect("Employment")}
        >
          {selectedCard === "Employment" && (
            <div className="absolute top-3 right-3">
              <CheckCircle className="text-primary-500" />
            </div>
          )}
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Upload Employment Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Image src={employment} alt="Employment" width={32} height={32} />
              </div>
              <div className="flex-grow">
                <p className="text-gray-700">Import a file with employee names, emails, roles, etc.</p>
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: .xlsx
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* You can add more card options here */}
        
        <div className="mt-6 mb-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="w-full py-5" 
                disabled={!selectedCard}
              >
                {selectedCard ? "Upload & Import Data" : "Select an import option"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              {/* <DialogTitle>Upload Employee File</DialogTitle> */}
              <Uploaddata change={setDialogOpen} selectedCard={selectedCard} />
            </DialogContent>
          </Dialog>
        </div>
        
        {/* <p className="text-xs text-center text-gray-500">
          Need help with importing? <a href="#" className="text-primary-500 hover:underline">View our guide</a>
        </p> */}
      </div>
    </div>
  );
};

export default ImportPage;