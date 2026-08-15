"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Control } from "react-hook-form";

export default function QuestionsSection({ control }: { control: Control<any> }) {
  const questions = [
    "What progress have you made since the last check-in?",
    "Are there any obstacles hindering your progress?",
    "What will you focus on next to move closer to your goal?",
    "Is there any help or resources you need?",
  ];

  return (
    <Card className="w-full bg-neutral-50">
      <CardHeader>
        <CardTitle className="text-left">Questions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((question, index) => (
          <FormField
            key={index}
            name={`question-${index}`}
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">{question}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Lorem ipsum"
                    {...field}
                    className="resize-y min-h-[100px] w-full"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        ))}
      </CardContent>
    </Card>
  );
}