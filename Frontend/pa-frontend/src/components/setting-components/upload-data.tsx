import * as XLSX from "xlsx";

import { CheckCircle, Trash, XCircle } from "lucide-react";
import Dropzone, { DropzoneState } from "shadcn-dropzone";

import { Button } from "../ui/button";
import Image from "next/image";
import axios from "axios";
import moment from "moment";
import { toast } from "@/hooks/use-toast";
import upload from "../../../public/settings/upload.png";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useState } from "react";

interface ResponseItem {
  name: string;
  email: string;
  status: string;
  message: string;
}

const Uploaddata = ({ change, selectedCard }: any) => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [jsonData, setJsonData] = useState<any[]>([]);
  const [finalData, setFinalData] = useState<any[]>([]);
  const { data: userSession } = useSession();
  const [responseData, setResponseData] = useState<ResponseItem[]>([]);

  const handleFileDrop = (acceptedFiles: File[]) => {
    console.log("Files dropped:", acceptedFiles);

    const file = acceptedFiles[0];

    if (
      file &&
      file.type !==
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      setErrorMessage(
        "Invalid file type. Please upload an Excel (.xlsx) file."
      );
      toast({
        title: "Invalid file type",
        description: "Please upload an Excel (.xlsx) file.",
        duration: 3000,
      });
      return;
    }

    setErrorMessage("");
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const data = e.target?.result;
      if (data) {
        try {
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const sheetData = XLSX.utils.sheet_to_json(sheet);
          setJsonData(sheetData);
          console.log("Excel data:", sheetData);
        } catch (error) {
          setErrorMessage("Error parsing Excel file.");
          toast({
            title: "Error parsing file",
            description: "There was an error while reading the Excel file.",
            duration: 3000,
          });
        }
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDeleteFile = () => {
    setFileName("");
    setErrorMessage("");
    setJsonData([]);
    setResponseData([]);
  };

  const uploadMutation = useMutation({
    mutationFn: async (data: any) => {
      try {
        const response = await axios.post(
          `${backendUrl}/users/inviteBulk`,
          data,
          {
            headers: { Authorization: `Bearer ${userSession?.user.token}` },
          }
        );
        setResponseData(response.data.data);
        return response.data;
      } catch (error: any) {
        toast({
          title: "Error uploading data",
          description: error.message || "There was an error uploading the data.",
          duration: 3000,
        });
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Data uploaded successfully",
        description: "Data has been uploaded successfully.",
        duration: 3000,
      });
    },
  });

  const handleUploadFile = async () => {
    try {
        if (jsonData.length === 0) {
            throw new Error("No valid data found in the file.");
        }
        const newFinalData = jsonData.map((item: any) => {
            // Convert Excel serial dates to proper format if needed
            const excelDateToJSDate = (excelDate: number) => {
                const date = new Date((excelDate - 25569) * 86400 * 1000);
                return moment(date).format("DD-MM-YYYY");
            };

            // Handle dates - check if they're Excel serial numbers or strings
            const joiningDate = typeof item["Joining_date"] === 'number' 
                ? excelDateToJSDate(item["Joining_date"])
                : moment(item["Joining_date"]).format("DD-MM-YYYY");
            
            const dob = typeof item["Date_of_Birth"] === 'number'
                ? excelDateToJSDate(item["Date_of_Birth"])
                : moment(item["Date_of_Birth"]).format("DD-MM-YYYY");

            return {
                name: item["Name"] || "",
                email: item["Email"] || "",
                phoneCode: "+91",
                mobile: item["Phone_number"] ? item["Phone_number"].toString() : "",
                designation: item["Designation"] || "",
                teamName: item["Team"] || "",
                deptName: item["Department"] || "",
                empId: item["Emp_id"] ? item["Emp_id"].toString() : "",
                joiningDate: joiningDate,
                role: item["Role"] || "employee",
                gender: item["Gender"] || "",
                dob: dob,
                managerMail: item["Reporting_Manager_Email"] || "",
                probationDuration: item["Probation_period_days"] 
                    ? item["Probation_period_days"].toString() 
                    : "",
                probationEnd: item["Probation_period_end"] || "",
                salary: item["Basic_salary"] ? item["Basic_salary"].toString() : "",
                salaryCurrency: item["Currency"] || "INR",
                linkedinURL: item["LinkedIn_url"] || "",
            };
        });

        setFinalData(newFinalData);
        await uploadMutation.mutateAsync(newFinalData);
        
    } catch (error: any) {
        console.error("Error processing data:", error);
        toast({
            title: "Error",
            description: error.message || "There was an error processing the data.",
            variant: "destructive",
            duration: 3000,
        });
    }
};


  return (
    <>
      <div>
        <h1 className="text-xl text-black mb-2">Upload {selectedCard} Data</h1>
        <hr />
      </div>

      <p className="text-start text-gray-500 text-sm ">
        Please upload the {selectedCard} data file. Ensure all required fields
        are completed for accurate import.
      </p>

      <div className="p-4 border border-dashed border-gray-300 rounded-lg">
        <Dropzone onDrop={handleFileDrop}>
          {(dropzone: DropzoneState) => (
            <div className="py-6">
              {dropzone.isDragAccept ? (
                <div className="text-sm font-medium">Drop your files here!</div>
              ) : (
                <div className="flex items-center flex-col gap-2">
                  <Image src={upload} alt="upload icon" className="w-6" />
                  <div className="text-sm font-semibold">
                    Create or Import Classification
                  </div>
                  <span className="text-gray-500 text-sm">
                    Maximum file size: 50 MB
                  </span>
                  <span className="text-gray-500 text-sm">
                    Supported format: .xlsx
                  </span>
                </div>
              )}
            </div>
          )}
        </Dropzone>

        {errorMessage && (
          <div className="mt-4 text-red-500 text-sm font-medium">
            {errorMessage}
          </div>
        )}

        {fileName && (
          <div className="mt-4 text-gray-600 flex items-center justify-between">
            <div>
              <strong>Uploaded File: </strong>
              {fileName}
            </div>
            <button
              onClick={handleDeleteFile}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Delete file"
            >
              <Trash className="w-5 h-5 text-red-500 hover:text-red-700" />
            </button>
          </div>
        )}
      </div>
      <hr />
      {responseData && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h3 className="text-sm font-medium text-gray-700">
              Upload Results
            </h3>
          </div>

          {/* Scrollable container for response data */}
          <div className="divide-y max-h-[180px] overflow-y-auto">
            {Array.isArray(responseData) && responseData.length === 0 ? (
              <div className="px-4 py-3 text-gray-600 text-sm">
                No data uploaded yet.
              </div>
            ) : (
              Array.isArray(responseData) &&
              responseData.map((item, index) => (
                <div key={index} className="px-4 py-3 flex items-start gap-2">
                  {item.status === "error" ? (
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="text-sm">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-gray-600">{item.email}</p>
                    {item.status === "error" && (
                      <p className="text-red-600 mt-1">{item.message}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <footer className="flex row-auto">
        <Button
          className="bg-white text-primary-400 hover:bg-secondary-100 border border-primary-400 w-1/2"
          onClick={change}
        >
          Cancel
        </Button>
        <Button
          className="ml-4 w-1/2 flex items-center justify-center"
          onClick={handleUploadFile}
          disabled={uploadMutation.isPending}
        >
          {uploadMutation.isPending ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></span>
              Uploading...
            </>
          ) : (
            "Upload"
          )}
        </Button>
      </footer>
    </>
  );
};


export default Uploaddata;
