"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MODELS } from "@/lib/models";
import { Loader2 } from "lucide-react";
import type { Session } from "next-auth";
import { useState } from "react";
import type * as z from "zod";
import { formSchema, useLlmForm } from "./use-llm-form";

export type FormValues = z.infer<typeof formSchema>;

interface LlmFormProps {
  session: Session | null;
}

export function LlmFormComponent({ session }: LlmFormProps) {
  // State to track if component is mounted (to avoid hydration mismatch)
  const [isMounted, setIsMounted] = useState(false);

  const {
    form,
    isLoading,
    currentModelPrice,
    isSubmitting,
    handleSubmit,
    hasBackgroundInfo,
    isUserLoggedIn,
  } = useLlmForm({
    session,
    isMounted,
    setIsMounted,
    formSchema,
  });

  // Use either our custom loading state or the form's built-in state
  const buttonDisabled = isLoading || isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="modelId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model</FormLabel>
              {isMounted ? (
                <Select
                  onValueChange={(value) => {
                    if (value !== field.value) {
                      field.onChange(value);
                    }
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MODELS.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-10 w-full rounded-md border border-input bg-background" />
              )}
              {isMounted && currentModelPrice && (
                <FormDescription>
                  Input: ${currentModelPrice.input.toFixed(3)}/M tokens |
                  Output: ${currentModelPrice.output.toFixed(3)}/M tokens
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prompt</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter your prompt here..."
                  className="min-h-32 resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Type your message for the AI assistant
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-4 sm:flex-row">
          <FormField
            control={form.control}
            name="withBackgroundInfo"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={!isUserLoggedIn || !hasBackgroundInfo}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Use Background Info</FormLabel>
                  <FormDescription>
                    {!isUserLoggedIn
                      ? "Sign in to use background information"
                      : hasBackgroundInfo
                      ? "Include your profile background information"
                      : "No background information available in your profile"}
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="precisionMode"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Precision Mode</FormLabel>
                  <FormDescription>
                    Enable higher accuracy with increased token usage
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={buttonDisabled}>
          {buttonDisabled && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit
        </Button>
      </form>
    </Form>
  );
}
