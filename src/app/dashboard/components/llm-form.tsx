"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { getLlmResponse } from "../mock-data";
import { useLlmSessionStore } from "../store/llm-session-store";

const formSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
});

interface ResponseData {
  code?: string;
  advices?: string[];
  [key: string]: unknown;
}

export default function LlmForm() {
  const {
    activeSessionId,
    sessions,
    addVersion,
    setVersionResponse,
    setVersionLoading,
  } = useLlmSessionStore();

  // Custom loading state to handle the async submission
  const [isLoading, setIsLoading] = useState(false);

  const activeSession = sessions.find(
    (session) => session.id === activeSessionId
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  // Track previous session ID to detect session changes
  const prevSessionIdRef = React.useRef(activeSessionId);

  // Clear the form when active session changes
  useEffect(() => {
    if (prevSessionIdRef.current !== activeSessionId) {
      form.reset({ prompt: "" });
      prevSessionIdRef.current = activeSessionId;
    }
  }, [activeSessionId, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Set custom loading state to true
      setIsLoading(true);

      // Create a new version with the input
      const versionId = addVersion(activeSessionId, { prompt: values.prompt });

      // Get the response
      const response = await getLlmResponse(values.prompt);

      // Update the version with the response
      setVersionResponse(activeSessionId, versionId, {
        content: JSON.stringify(response),
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      // Set version as not loading
      const activeSession = sessions.find(
        (session) => session.id === activeSessionId
      );
      if (activeSession?.activeVersionId) {
        setVersionLoading(
          activeSessionId,
          activeSession.activeVersionId,
          false
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Get the active version if it exists
  const activeVersion = activeSession?.activeVersionId
    ? activeSession.versions.find((v) => v.id === activeSession.activeVersionId)
    : null;

  // Use the active version's input if it exists and we're not submitting
  React.useEffect(() => {
    if (activeVersion && !isSubmitting) {
      form.setValue("prompt", activeVersion.input.prompt);
    }
  }, [activeVersion, form, isSubmitting]);

  // Handle clicking on an advice item to append to textarea
  const handleAdviceClick = (advice: string) => {
    const currentValue = form.getValues("prompt");
    const newValue = currentValue ? `${currentValue}\n\n${advice}` : advice;
    form.setValue("prompt", newValue);
  };

  // Parse response data to get advice
  let adviceItems: string[] = [];
  if (activeVersion?.response) {
    try {
      const responseData = JSON.parse(
        activeVersion.response.content
      ) as ResponseData;
      adviceItems = responseData.advices || [];
    } catch (e) {
      console.error("Failed to parse response data", e);
    }
  }

  // Use either our custom loading state or the form's built-in state
  const buttonDisabled = isLoading || isSubmitting;

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={buttonDisabled}>
            {buttonDisabled && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Submit
          </Button>
        </form>
      </Form>

      {adviceItems.length > 0 && (
        <Card className="mt-4">
          <CardContent className="pt-4">
            <h3 className="mb-2 font-medium text-sm">
              Advice (click to add to prompt)
            </h3>
            <div className="space-y-2">
              {adviceItems.map((advice, index) => (
                <Button
                  key={`advice-${activeVersion?.id}-${index}`}
                  variant="outline"
                  className="h-auto w-full justify-start p-2 text-left font-normal text-sm"
                  onClick={() => handleAdviceClick(advice)}
                >
                  {advice}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
