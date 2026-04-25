"use client";

import { CalendarDays, Loader2 } from "lucide-react";
import {
  Card,
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
      <div className="p-6 text-center text-red-600 font-semibold">
        You do not have access to this page.
      </div>
    );
  }

  const currencyList = currencyCodes?.data || [];

  return (
    <>
      <Card className="w-full max-w-4xl bg-white rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-700">
            Company / {companyName} 
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent>
          <FormProvider {...methods}>
            <form className="space-y-6 pt-2" onSubmit={handleSubmit(onSubmit)}>
              <section>
                <h3 className="font-bold text-lg">Company Information</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="companyName">
                      Company Name <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="companyName"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Enter your company name"
                          disabled={userRole === "employee"}
                        />
                      )}
                    />
                    {errors.companyName && (
                      <p className="text-red-500 text-sm">
                        {errors.companyName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <FormField
                      control={control}
                      name="incorporationDate"
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormLabel className="text-sm m-0">
                            Incorporation Date{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full inline-flex items-center justify-start font-normal",
                                    !field.value && "text-muted-foreground",
                                    "py-2 px-3"
                                  )}
                                >
                                  <CalendarDays className="opacity-50 bg-muted p-[2px] scale-110" />
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
                                className="bg-white shadow-lg rounded-lg"
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <Label htmlFor="streetAddress">
                      Street Address <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="streetAddress"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Enter street address"
                          disabled={userRole === "employee"}
                        />
                      )}
                    />
                    {errors.streetAddress && (
                      <p className="text-red-500 text-sm">
                        {errors.streetAddress.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="streetNumber">
                      Street Number <span className="text-red-500">*</span>
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
                        />
                      )}
                    />
                    {errors.streetNumber && (
                      <p className="text-red-500 text-sm">
                        {errors.streetNumber.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="city">
                      City <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="city"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Enter city name"
                          disabled={userRole === "employee"}
                        />
                      )}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm">
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="country">
                      Country <span className="text-red-500">*</span>
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
                          <SelectTrigger className="w-[425px]">
                            <SelectValue
                              className="placeholder:text-slate-500"
                              placeholder="Select country name"
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {data.map((country) => (
                              <SelectItem
                                key={country.code}
                                value={country.code}
                              >
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.country && (
                      <p className="text-red-500 text-sm">
                        {errors.country.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="zipCode">
                      Zip Code <span className="text-red-500">*</span>
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
                        />
                      )}
                    />
                    {errors.zipCode && (
                      <p className="text-red-500 text-sm">
                        {errors.zipCode.message}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="font-bold text-lg">Contact Information</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="billingEmail">
                      Billing Email <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="billingEmail"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Enter Billing Email"
                          disabled={userRole === "employee"}
                        />
                      )}
                    />
                    {errors.billingEmail && (
                      <p className="text-red-500 text-sm">
                        {errors.billingEmail.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="contactPerson">
                      Contact Person <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="contactPerson"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Enter Name of Contact Person"
                          disabled={userRole === "employee"}
                        />
                      )}
                    />
                    {errors.contactPerson && (
                      <p className="text-red-500 text-sm">
                        {errors.contactPerson.message}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="font-bold text-lg">Financial Information</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="currency">
                      Currency <span className="text-red-500">*</span>
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
                          <SelectTrigger className="w-[425px]">
                            <SelectValue
                              className="placeholder:text-slate-500"
                              placeholder="Select a currency"
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {currencyList.map((currency) => (
                              <SelectItem
                                key={currency.code}
                                value={currency.code}
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
                    <Label htmlFor="vatNumber">
                      Tax ID No. <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="vatNumber"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Enter VAT Number"
                          disabled={userRole === "employee"}
                        />
                      )}
                    />
                    {errors.vatNumber && (
                      <p className="text-red-500 text-sm">
                        {errors.vatNumber.message}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section className="flex flex-col gap-4 justify-center">
                <span className="font-bold text-lg">
                  Language and Preferences
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <Label htmlFor="defaultLanguage">
                      Default Language <span className="text-red-500">*</span>
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
                          <SelectTrigger className="w-full mt-2">
                            <SelectValue
                              className="placeholder:text-slate-500"
                              placeholder="Select a Language"
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {languageOptions.map((language) => (
                              <SelectItem
                                key={language.code}
                                value={language.code || language.name}
                              >
                                {language.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.defaultLanguage && (
                      <p className="text-red-500 text-sm">
                        {errors.defaultLanguage.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <Label htmlFor="logo">Company Logo</Label>
                    <div className="flex items-start gap-6 mt-2 flex-wrap sm:flex-nowrap">
                      <div className="w-auto h-16 overflow-hidden border flex items-center justify-center bg-gray-100 rounded-md">
                        {logoPreview ? (
                          <Image
                            src={logoPreview}
                            width={176}
                            height={64}
                            alt="Logo preview"
                            className="w-full h-full object-fit"
                          />
                        ) : companyLogo ? (
                          <Image
                            src={companyLogo}
                            width={176}
                            height={64}
                            alt="Company logo"
                            className="w-full h-full object-fit"
                          />
                        ) : (
                          <div className="text-gray-400 text-sm">No logo</div>
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

                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Select Logo
                          </Button>

                          {selectedFile && (
                            <>
                              <Button
                                type="button"
                                onClick={handleUpload}
                                disabled={updateLogoMutation.isPending}
                              >
                                {updateLogoMutation.isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                  </>
                                ) : (
                                  "Update Logo"
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={handleCancel}
                                disabled={updateLogoMutation.isPending}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Recommended size: 500x200px (max 5MB)
                        </p>
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
                        className="text-sm font-medium"
                      >
                        Enable White-labelling
                      </Label>
                    </div>
                  </div>
                </div>
              </section>

              <CardFooter className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  type="button"
                  disabled={userRole === "employee"}
                >
                  Cancel
                </Button>
                <Button 
                  disabled={userRole === "employee" || patchMutation.isPending} 
                  type="submit"
                >
                  {patchMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </CardFooter>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </>
  );
};

export default SettingsPage;
