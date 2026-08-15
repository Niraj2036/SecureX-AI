"use client";

import { CalendarDays, Loader2, Building } from "lucide-react";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Controller, FormProvider, useForm } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import React, { useEffect, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import { cn } from "@/lib/utils";
import currencyCodes from "currency-codes";
import data from "../../../../assets/country-data.json";
import languages from "iso-639-1";
import moment from "moment";
import { queryClient } from "@/app/providers";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useSessionStore from "@/store/sessionStore";
import useSessionStoreCompany from "@/store/signupStore";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { V3Card } from "@/components/v3/V3Card";

const companySchema = z.object({
  companyName: z.string().nonempty("Company Name is required"),
  incorporationDate: z
    .preprocess(
      (val) => (typeof val === "string" ? new Date(val) : val),
      z.date()
    )
    .refine((date) => !isNaN(date.getTime()), "Invalid date"),
  streetAddress: z.string().nonempty("Street Address is required"),
  streetNumber: z.number().nullable(),
  city: z.string().nonempty("City is required"),
  country: z.string().nonempty("Country is required"),
  zipCode: z.number().nullable(),
  billingEmail: z
    .string()
    .nonempty("Billing Email is required")
    .email("Invalid email format"),
  contactPerson: z.string().nonempty("Contact Person is required"),
  currency: z.string().nonempty("Currency is required"),
  vatNumber: z.string().nonempty("VAT Number is required"),
  defaultLanguage: z.string().nonempty("Default Language is required"),
});

type FormDataType = z.infer<typeof companySchema>;

const SettingsPage = () => {
  const methods = useForm<FormDataType>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: "",
      incorporationDate: undefined,
      streetAddress: "",
      streetNumber: 0,
      city: "",
      country: "",
      zipCode: 0,
      billingEmail: "",
      contactPerson: "",
      currency: "",
      vatNumber: "",
      defaultLanguage: "",
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = methods;

  const { toast } = useToast();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const { data: session } = useSession();
  const { setCompanyName, companyName } = useSessionStoreCompany(
    (state: any) => state
  );
  const [whitelabel, setWhitelabel] = useState(false);
  const { userRole, setCompanyLogo, companyLogo } = useSessionStore((state) => state);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch company details
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/company/`, {
          headers: {
            Authorization: `Bearer ${session?.user?.token}`,
          },
        });

        const companyDetails = data?.data || {};

        const fieldMapping: Record<keyof FormDataType, keyof typeof companyDetails> = {
          companyName: "name",
          incorporationDate: "establishedDate",
          streetAddress: "streetAddress",
          streetNumber: "streetNo",
          city: "city",
          country: "country",
          zipCode: "zipCode",
          billingEmail: "billingEmail",
          contactPerson: "contactPerson",
          currency: "currency",
          vatNumber: "vatNo",
          defaultLanguage: "language",
        };

        setCompanyLogo(companyDetails?.logo);
        setWhitelabel(companyDetails?.whitelabel);

        Object.entries(fieldMapping).forEach(([formField, dataField]) => {
          let value = companyDetails[dataField] ?? "";

          if (formField === "incorporationDate" && value) {
            value = new Date(value);
          }

          if (formField === "zipCode" && value) {
            value = parseInt(value, 10);
          }
          setValue(formField as keyof FormDataType, value);
        });

        setCompanyName(companyDetails.name);
      } catch (error) {
        console.error("Error fetching company details:", error);
      }
    };

    if (session?.user?.token) {
      fetchCompanyDetails();
    }
  }, [backendUrl, session?.user?.token, setValue, setCompanyName, setCompanyLogo]);

  // Company details update mutation
  const patchMutation = useMutation({
    mutationFn: async (data: FormDataType) => {
      const transformedData = {
        ...data,
        establishedDate:
          data.incorporationDate instanceof Date
            ? data.incorporationDate.toISOString()
            : data.incorporationDate,
        zipCode:
          data.zipCode !== null ? parseInt(data.zipCode.toString()) : null,
        vatNo: data.vatNumber,
        language: data.defaultLanguage,
        streetNo:
          data.streetNumber !== null
            ? parseInt(data.streetNumber.toString())
            : null,
        contactPerson: data.contactPerson,
      };

      const response = await axios.patch(
        `${backendUrl}/company/update`,
        transformedData,
        {
          headers: {
            Authorization: `Bearer ${session?.user?.token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Company details updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
  });

  // Logo update mutation
  const updateLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("logo", file);

      const response = await axios.post(
        `${backendUrl}/company/update-logo`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${session?.user?.token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Company logo updated successfully",
        duration: 3000,
      });
      setSelectedFile(null);
      setLogoPreview(null);
      queryClient.invalidateQueries({ queryKey: ["companyDetails"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update logo",
        duration: 3000,
      });
    },
  });

  // White label mutation
  const handleWhiteLabelMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.get(
        `${backendUrl}/company/whitelabel`,
        {
          headers: {
            Authorization: `Bearer ${session?.user?.token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "White-labelling updated successfully",
      });
      setWhitelabel(data?.data?.whitelabel);
      queryClient.invalidateQueries({ queryKey: ["companyDetails"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
  });

  // Form submit handler
  const onSubmit = (data: FormDataType) => {
    patchMutation.mutate(data);
  };

  // Language options
  const languageOptions = languages.getAllNames().map((language) => ({
    name: language,
    code: languages.getCode(language),
  }));

  // File upload handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/svg+xml",
      ];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPEG, PNG, GIF or SVG image",
          duration: 3000,
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 5MB",
          duration: 3000,
        });
        return;
      }

      // For SVGs, skip aspect ratio check
      if (file.type === "image/svg+xml") {
        setSelectedFile(file);
        setLogoPreview(URL.createObjectURL(file));
        return;
      }

      // For other image types, check aspect ratio
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        setSelectedFile(file);
        setLogoPreview(img.src);
      };

      img.onerror = () => {
        toast({
          title: "Image load error",
          description: "Could not process the selected image",
          duration: 3000,
        });
      };
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      updateLogoMutation.mutate(selectedFile);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (userRole && userRole === "employee") {
    return (
      <div className="p-6 text-center text-rose-600 font-semibold text-xs">
        You do not have access to this page.
      </div>
    );
  }

  const currencyList = currencyCodes?.data || [];

  return (
    <V3Card className="w-full max-w-4xl p-6">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Building className="h-5 w-5 text-indigo-600" />
          Company Identity / {companyName || "Organization"}
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="p-0 pt-4">
        <FormProvider {...methods}>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <section className="space-y-4">
              <h3 className="font-bold text-sm text-foreground">Company Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName" className="text-xs font-semibold">
                    Company Name <span className="text-rose-500">*</span>
                  </Label>
                  <Controller
                    name="companyName"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Enter your company name"
                        disabled={userRole === "employee"}
                        className="text-xs mt-1"
                      />
                    )}
                  />
                  {errors.companyName && (
                    <p className="text-rose-500 text-[11px] mt-1">
                      {errors.companyName.message}
                    </p>
                  )}
                </div>
                <div>
                  <FormField
                    control={control}
                    name="incorporationDate"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs font-semibold">
                          Incorporation Date <span className="text-rose-500">*</span>
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full inline-flex items-center justify-start font-normal text-xs",
                                  !field.value && "text-muted-foreground",
                                  "h-9 px-3"
                                )}
                              >
                                <CalendarDays className="mr-2 h-4 w-4 text-indigo-600" />
                                {field.value ? (
                                  moment(field.value).format("DD/MM/YYYY")
                                ) : (
                                  <span>DD/MM/YYYY</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-0"
                            align="start"
                          >
                            <Calendar
                              className="bg-card shadow-lg rounded-lg border"
                              mode="single"
                              selected={
                                field.value
                                  ? new Date(field.value)
                                  : undefined
                              }
                              onSelect={field.onChange}
                              initialFocus
                              disabled={userRole === "employee"}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="streetAddress" className="text-xs font-semibold">
                    Street Address <span className="text-rose-500">*</span>
                  </Label>
                  <Controller
                    name="streetAddress"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Enter street address"
                        disabled={userRole === "employee"}
                        className="text-xs mt-1"
                      />
                    )}
                  />
                  {errors.streetAddress && (
                    <p className="text-rose-500 text-[11px] mt-1">
                      {errors.streetAddress.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="streetNumber" className="text-xs font-semibold">
                    Street Number <span className="text-rose-500">*</span>
                  </Label>
                  <Controller
                    name="streetNumber"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => {
                          field.onChange(parseInt(e.target.value));
                        }}
                        value={field.value ?? ""}
                        placeholder="Enter street number"
                        disabled={userRole === "employee"}
                        className="text-xs mt-1"
                      />
                    )}
                  />
                  {errors.streetNumber && (
                    <p className="text-rose-500 text-[11px] mt-1">
                      {errors.streetNumber.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="city" className="text-xs font-semibold">
                    City <span className="text-rose-500">*</span>
                  </Label>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Enter city name"
                        disabled={userRole === "employee"}
                        className="text-xs mt-1"
                      />
                    )}
                  />
                  {errors.city && (
                    <p className="text-rose-500 text-[11px] mt-1">
                      {errors.city.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="country" className="text-xs font-semibold">
                    Country <span className="text-rose-500">*</span>
                  </Label>
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={userRole === "employee"}
                      >
                        <SelectTrigger className="w-full text-xs mt-1 h-9">
                          <SelectValue placeholder="Select country name" />
                        </SelectTrigger>
                        <SelectContent>
                          {data.map((country) => (
                            <SelectItem
                              key={country.code}
                              value={country.code}
                              className="text-xs"
                            >
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.country && (
                    <p className="text-rose-500 text-[11px] mt-1">
                      {errors.country.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="zipCode" className="text-xs font-semibold">
                    Zip Code <span className="text-rose-500">*</span>
                  </Label>
                  <Controller
                    name="zipCode"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => {
                          field.onChange(parseInt(e.target.value));
                        }}
                        value={field.value ?? ""}
                        placeholder="Enter Zip Code"
                        disabled={userRole === "employee"}
                        className="text-xs mt-1"
                      />
                    )}
                  />
                  {errors.zipCode && (
                    <p className="text-rose-500 text-[11px] mt-1">
                      {errors.zipCode.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="space-y-4 pt-2">
              <h3 className="font-bold text-sm text-foreground">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="billingEmail" className="text-xs font-semibold">
                    Billing Email <span className="text-rose-500">*</span>
                  </Label>
                  <Controller
                    name="billingEmail"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Enter Billing Email"
                        disabled={userRole === "employee"}
                        className="text-xs mt-1"
                      />
                    )}
                  />
                  {errors.billingEmail && (
                    <p className="text-rose-500 text-[11px] mt-1">
                      {errors.billingEmail.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="contactPerson" className="text-xs font-semibold">
                    Contact Person <span className="text-rose-500">*</span>
                  </Label>
                  <Controller
                    name="contactPerson"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Enter Name of Contact Person"
                        disabled={userRole === "employee"}
                        className="text-xs mt-1"
                      />
                    )}
                  />
                  {errors.contactPerson && (
                    <p className="text-rose-500 text-[11px] mt-1">
                      {errors.contactPerson.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="space-y-4 pt-2">
              <h3 className="font-bold text-sm text-foreground">Financial Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency" className="text-xs font-semibold">
                    Currency <span className="text-rose-500">*</span>
                  </Label>
                  <Controller
                    name="currency"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={userRole === "employee"}
                      >
                        <SelectTrigger className="w-full text-xs mt-1 h-9">
                          <SelectValue placeholder="Select a currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencyList.map((currency) => (
                            <SelectItem
                              key={currency.code}
                              value={currency.code}
                              className="text-xs"
                            >
                              {currency.code} - {currency.currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div>
                  <Label htmlFor="vatNumber" className="text-xs font-semibold">
                    Tax ID No. <span className="text-rose-500">*</span>
                  </Label>
                  <Controller
                    name="vatNumber"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Enter VAT Number"
                        disabled={userRole === "employee"}
                        className="text-xs mt-1"
                      />
                    )}
                  />
                  {errors.vatNumber && (
                    <p className="text-rose-500 text-[11px] mt-1">
                      {errors.vatNumber.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="space-y-4 pt-2">
              <h3 className="font-bold text-sm text-foreground">Language & Branding</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <Label htmlFor="defaultLanguage" className="text-xs font-semibold">
                    Default Language <span className="text-rose-500">*</span>
                  </Label>
                  <Controller
                    name="defaultLanguage"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={userRole === "employee"}
                      >
                        <SelectTrigger className="w-full text-xs mt-1 h-9">
                          <SelectValue placeholder="Select a Language" />
                        </SelectTrigger>
                        <SelectContent>
                          {languageOptions.map((language) => (
                            <SelectItem
                              key={language.code}
                              value={language.code || language.name}
                              className="text-xs"
                            >
                              {language.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.defaultLanguage && (
                    <p className="text-rose-500 text-[11px] mt-1">
                      {errors.defaultLanguage.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col">
                  <Label htmlFor="logo" className="text-xs font-semibold mb-1">Company Logo</Label>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="w-36 h-12 overflow-hidden border border-border/80 flex items-center justify-center bg-muted/40 rounded-lg">
                      {logoPreview ? (
                        <Image
                          src={logoPreview}
                          width={144}
                          height={48}
                          alt="Logo preview"
                          className="w-full h-full object-contain"
                        />
                      ) : companyLogo ? (
                        <Image
                          src={companyLogo}
                          width={144}
                          height={48}
                          alt="Company logo"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-muted-foreground text-xs font-medium">No logo</div>
                      )}
                    </div>

                    <input
                      type="file"
                      id="logo"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs font-medium border-border/80"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Select Logo
                      </Button>

                      {selectedFile && (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            className="text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={handleUpload}
                            disabled={updateLogoMutation.isPending}
                          >
                            {updateLogoMutation.isPending ? (
                              <>
                                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              "Upload"
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={handleCancel}
                            disabled={updateLogoMutation.isPending}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <Switch
                      id="whitelabel"
                      checked={whitelabel}
                      onCheckedChange={(checked) => {
                        setWhitelabel(checked);
                        handleWhiteLabelMutation.mutate();
                      }}
                      disabled={userRole === "employee"}
                    />
                    <Label
                      htmlFor="whitelabel"
                      className="text-xs font-medium cursor-pointer"
                    >
                      Enable White-labelling
                    </Label>
                  </div>
                </div>
              </div>
            </section>

            <CardFooter className="flex justify-end space-x-3 pt-4 border-t border-border/60 p-0">
              <Button
                variant="outline"
                type="button"
                className="text-xs font-medium"
                disabled={userRole === "employee"}
              >
                Cancel
              </Button>
              <Button 
                disabled={userRole === "employee" || patchMutation.isPending} 
                type="submit"
                className="text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {patchMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Settings"
                )}
              </Button>
            </CardFooter>
          </form>
        </FormProvider>
      </CardContent>
    </V3Card>
  );
};

export default SettingsPage;