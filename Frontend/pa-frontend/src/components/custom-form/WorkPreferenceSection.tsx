"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Control } from "react-hook-form";

export default function WorkPreferenceSection({
  control,
}: {
  control: Control<any>;
}) {
  return (
    <Card className="w-full bg-neutral-50">
      <CardHeader>
        <FormLabel className="text-base">
          What type of work do you prefer?
        </FormLabel>
      </CardHeader>
      <CardContent>
        <FormField
          control={control}
          name="workPreference"
          render={({ field }) => (
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="office" id="office" />
                <FormLabel htmlFor="office" className="text-base">
                  Working From Office
                </FormLabel>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="home" id="home" />
                <FormLabel htmlFor="home" className="text-base">
                  Working From Home
                </FormLabel>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hybrid" id="hybrid" />
                <FormLabel htmlFor="hybrid" className="text-base">
                  Hybrid
                </FormLabel>
              </div>
            </RadioGroup>
          )}
        />
      </CardContent>
    </Card>
  );
}
