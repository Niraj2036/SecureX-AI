"use client";

import { FormField, FormControl, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Control } from "react-hook-form";
import Image from "next/image";
const gallery = "/main/gallery.png";
const Smiley = "/main/smiley.png";
const linki = "/main/link.png";
import { Button } from "@/components/ui/button";

interface RecognitionSectionProps {
  control: Control<any>;
  onSelectBadge: (badge: string) => void;
}

export default function RecognitionSection({ control, onSelectBadge }: RecognitionSectionProps) {
  return (
    <Card className="bg-neutral-50">
      <CardHeader>
        <CardTitle className="text-left text-xl">Recognition</CardTitle>
        <CardTitle className="text-left">
          <FormField
            control={control}
            name="selectedBadge" // Name of the field in the form
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  
                </FormControl>
              </FormItem>
            )}
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mt-4 space-y-4">
          <FormField
            control={control}
            name="recognitionComment"
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder="Add your comment here..."
                className="min-h-[120px] w-full"
              />
            )}
          />
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Image width={20} height={20} src={gallery} alt="gallery" className="w-5" />
              <Image width={20} height={20} src={Smiley} alt="Smiley" className="w-5" />
              <Image width={20} height={20} src={linki} alt="linki" className="w-5" />
            </div>
            <div>
              <Button>Submit</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}