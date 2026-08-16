"use client";

import { CalendarDays, Loader2, Building } from "lucide-react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import React, { useEffect, useRef, useState } from "react";
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
import { V3Button } from "@/components/v3/V3Button";
import Image from "next/image";
import { Calendar } from "@/components/ui/calendar";

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
      <div className="p-0 pb-4 flex items-center gap-2">
        <Building className="h-5 w-5 text-indigo-600" />
        <h2 className="text-xl font-bold">Company Identity / {companyName || "Organization"}</h2>
      </div>
      <div className="border-t border-border/60 mb-4" />
      <div className="p-0 pt-4">
        <FormProvider {...methods}>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <section className="space-y-4">
              <h3 className="font-bold text-sm text-foreground">Company Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Company Name <span className="text-rose-500">*</span>
                  </label>
                  <Controller
                    name="companyName"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        placeholder="Enter your company name"
                        disabled={userRole === "employee"}
                        className="w-full h-9 rounded-lg border border-border/80 bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:opacity-60 disabled:bg-muted"
                      />
                    )}
                  />
                  {errors.companyName && (
                    <p className="text-rose-500 text-[11px] mt-1">{errors.companyName.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Incorporation Date <span className="text-rose-500">*</span>
                  </label>
                  <Controller
                    name="incorporationDate"
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className={cn(
                              "w-full h-9 inline-flex items-center justify-start px-3 text-xs rounded-lg border border-border/80 bg-background font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarDays className="mr-2 h-4 w-4 text-indigo-600" />
                            {field.value ? moment(field.value).format("DD/MM/YYYY") : <span>DD/MM/YYYY</span>}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-card shadow-lg rounded-lg border border-border z-50" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={field.onChange}
                            initialFocus
                            disabled={userRole === "employee"}
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {errors.incorporationDate && <p className="text-rose-500 text-[11px] mt-1">{String(errors.incorporationDate.message)}</p>}
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Street Address <span className="text-rose-500">*</span></label>
                  <Controller name="streetAddress" control={control} render={({ field }) => (
                    <input {...field} placeholder="Enter street address" disabled={userRole === "employee"} className="w-full h-9 rounded-lg border border-border/80 bg-background px-3 text-xs mt-1 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-60 disabled:bg-muted" />
                  )} />
                  {errors.streetAddress && <p className="text-rose-500 text-[11px] mt-1">{errors.streetAddress.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Street Number <span className="text-rose-500">*</span></label>
                  <Controller name="streetNumber" control={control} render={({ field }) => (
                    <input type="number" {...field} onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(parseInt(e.target.value))} value={field.value ?? ""} placeholder="Enter street number" disabled={userRole === "employee"} className="w-full h-9 rounded-lg border border-border/80 bg-background px-3 text-xs mt-1 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-60 disabled:bg-muted" />
                  )} />
                  {errors.streetNumber && <p className="text-rose-500 text-[11px] mt-1">{errors.streetNumber.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">City <span className="text-rose-500">*</span></label>
                  <Controller name="city" control={control} render={({ field }) => (
                    <input {...field} placeholder="Enter city name" disabled={userRole === "employee"} className="w-full h-9 rounded-lg border border-border/80 bg-background px-3 text-xs mt-1 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-60 disabled:bg-muted" />
                  )} />
                  {errors.city && <p className="text-rose-500 text-[11px] mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Country <span className="text-rose-500">*</span></label>
                  <Controller name="country" control={control} render={({ field }) => (
                    <select value={field.value} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => field.onChange(e.target.value)} disabled={userRole === "employee"} className="w-full h-9 rounded-lg border border-border/80 bg-background px-3 text-xs mt-1 text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-60 disabled:bg-muted">
                      <option value="">Select country</option>
                      {data.map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}
                    </select>
                  )} />
                  {errors.country && <p className="text-rose-500 text-[11px] mt-1">{errors.country.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Zip Code <span className="text-rose-500">*</span></label>
                  <Controller name="zipCode" control={control} render={({ field }) => (
                    <input type="number" {...field} onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(parseInt(e.target.value))} value={field.value ?? ""} placeholder="Enter Zip Code" disabled={userRole === "employee"} className="w-full h-9 rounded-lg border border-border/80 bg-background px-3 text-xs mt-1 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-60 disabled:bg-muted" />
                  )} />
                  {errors.zipCode && <p className="text-rose-500 text-[11px] mt-1">{errors.zipCode.message}</p>}
                </div>
              </div>
            </section>

            <section className="space-y-4 pt-2">
              <h3 className="font-bold text-sm text-foreground">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Billing Email <span className="text-rose-500">*</span></label>
                  <Controller name="billingEmail" control={control} render={({ field }) => (
                    <input {...field} placeholder="Enter Billing Email" disabled={userRole === "employee"} className="w-full h-9 rounded-lg border border-border/80 bg-background px-3 text-xs mt-1 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-60 disabled:bg-muted" />
                  )} />
                  {errors.billingEmail && <p className="text-rose-500 text-[11px] mt-1">{errors.billingEmail.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Contact Person <span className="text-rose-500">*</span></label>
                  <Controller name="contactPerson" control={control} render={({ field }) => (
                    <input {...field} placeholder="Enter Name of Contact Person" disabled={userRole === "employee"} className="w-full h-9 rounded-lg border border-border/80 bg-background px-3 text-xs mt-1 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-60 disabled:bg-muted" />
                  )} />
                  {errors.contactPerson && <p className="text-rose-500 text-[11px] mt-1">{errors.contactPerson.message}</p>}
                </div>
              </div>
            </section>

            <section className="space-y-4 pt-2">
              <h3 className="font-bold text-sm text-foreground">Financial Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Currency <span className="text-rose-500">*</span></label>
                  <Controller name="currency" control={control} render={({ field }) => (
                    <select value={field.value} onChange={e => field.onChange(e.target.value)} disabled={userRole === "employee"} className="w-full h-9 rounded-lg border border-border/80 bg-background px-3 text-xs mt-1 text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-60 disabled:bg-muted">
                      <option value="">Select currency</option>
                      {currencyList.map((c) => <option key={c.code} value={c.code}>{c.code} - {c.currency}</option>)}
                    </select>
                  )} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Tax ID No. <span className="text-rose-500">*</span></label>
                  <Controller name="vatNumber" control={control} render={({ field }) => (
                    <input {...field} placeholder="Enter VAT Number" disabled={userRole === "employee"} className="w-full h-9 rounded-lg border border-border/80 bg-background px-3 text-xs mt-1 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-60 disabled:bg-muted" />
                  )} />
                  {errors.vatNumber && <p className="text-rose-500 text-[11px] mt-1">{errors.vatNumber.message}</p>}
                </div>
              </div>
            </section>

            <section className="space-y-4 pt-2">
              <h3 className="font-bold text-sm text-foreground">Language &amp; Branding</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-foreground block mb-1">Default Language <span className="text-rose-500">*</span></label>
                  <Controller name="defaultLanguage" control={control} render={({ field }) => (
                    <select value={field.value} onChange={e => field.onChange(e.target.value)} disabled={userRole === "employee"} className="w-full h-9 rounded-lg border border-border/80 bg-background px-3 text-xs mt-1 text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-60 disabled:bg-muted">
                      <option value="">Select language</option>
                      {languageOptions.map((lang) => <option key={lang.code} value={lang.code || lang.name}>{lang.name}</option>)}
                    </select>
                  )} />
                  {errors.defaultLanguage && <p className="text-rose-500 text-[11px] mt-1">{errors.defaultLanguage.message}</p>}
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-foreground block mb-1">Company Logo</label>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="w-36 h-12 overflow-hidden border border-border/80 flex items-center justify-center bg-muted/40 rounded-lg">
                      {logoPreview ? (
                        <Image src={logoPreview} width={144} height={48} alt="Logo preview" className="w-full h-full object-contain" />
                      ) : companyLogo ? (
                        <Image src={companyLogo} width={144} height={48} alt="Company logo" className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-muted-foreground text-xs font-medium">No logo</div>
                      )}
                    </div>
                    <input type="file" id="logo" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <div className="flex items-center gap-2">
                      <V3Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>Select Logo</V3Button>
                      {selectedFile && (
                        <>
                          <V3Button type="button" size="sm" onClick={handleUpload} isLoading={updateLogoMutation.isPending}>
                            {updateLogoMutation.isPending ? "Uploading..." : "Upload"}
                          </V3Button>
                          <V3Button type="button" variant="ghost" size="sm" onClick={handleCancel} disabled={updateLogoMutation.isPending}>Cancel</V3Button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      id="whitelabel"
                      role="switch"
                      aria-checked={whitelabel}
                      onClick={() => { setWhitelabel(!whitelabel); handleWhiteLabelMutation.mutate(); }}
                      disabled={userRole === "employee"}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${whitelabel ? "bg-indigo-600" : "bg-muted-foreground/30"} disabled:opacity-50`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${whitelabel ? "translate-x-4" : "translate-x-0.5"}`} />
                    </button>
                    <label htmlFor="whitelabel" className="text-xs font-medium cursor-pointer">Enable White-labelling</label>
                  </div>
                </div>
              </div>
            </section>

            <div className="flex justify-end space-x-3 pt-4 border-t border-border/60">
              <V3Button variant="outline" type="button" disabled={userRole === "employee"}>Cancel</V3Button>
              <V3Button disabled={userRole === "employee" || patchMutation.isPending} type="submit" isLoading={patchMutation.isPending}>
                {patchMutation.isPending ? "Saving..." : "Save Settings"}
              </V3Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </V3Card>
  );
};

export default SettingsPage;