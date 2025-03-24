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
import { MODELS, getModelPrice } from "@/lib/models";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { getLlmResponse } from "../mock-data";
import { useLlmSessionStore } from "../store/llm-session-store";
import type { TokenUsage } from "../store/llm-session-store";

const formSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  modelId: z.string(),
});

interface ResponseData {
  code?: string;
  advices?: string[];
  usage?: TokenUsage;
  [key: string]: unknown;
}

export default function LlmForm() {
  const {
    activeSessionId,
    sessions,
    addVersion,
    setVersionResponse,
    setVersionLoading,
    getPreviousConversation,
    getSelectedModelId,
    setSessionModelId,
  } = useLlmSessionStore();

  // Custom loading state to handle the async submission
  const [isLoading, setIsLoading] = useState(false);

  const activeSession = sessions.find(
    (session) => session.id === activeSessionId
  );

  // Get the currently selected model for this session
  const selectedModelId = getSelectedModelId(activeSessionId);

  // Get the price information for the selected model
  const modelPrice = getModelPrice(selectedModelId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      modelId: selectedModelId,
    },
  });

  const isSubmitting = form.formState.isSubmitting;
  const watchedModelId = form.watch("modelId");

  // Update form when selected model changes
  useEffect(() => {
    form.setValue("modelId", selectedModelId);
  }, [selectedModelId, form]);

  // Update model price when form model changes
  useEffect(() => {
    if (watchedModelId !== selectedModelId) {
      setSessionModelId(activeSessionId, watchedModelId);
    }
  }, [watchedModelId, activeSessionId, selectedModelId, setSessionModelId]);

  // Track previous session ID to detect session changes
  const prevSessionIdRef = React.useRef(activeSessionId);

  // Clear the form when active session changes
  useEffect(() => {
    if (prevSessionIdRef.current !== activeSessionId) {
      form.reset({
        prompt: "",
        modelId: getSelectedModelId(activeSessionId),
      });
      prevSessionIdRef.current = activeSessionId;
    }
  }, [activeSessionId, form, getSelectedModelId]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Set custom loading state to true
      setIsLoading(true);

      // Get previous conversation if available
      const previousConversation = getPreviousConversation(activeSessionId);

      // Prepare form data with history if available
      const formData = {
        prompt: values.prompt,
        modelId: values.modelId,
        ...(previousConversation && { history: [previousConversation] }),
      };

      // Create a new version with the input and history
      const versionId = addVersion(activeSessionId, formData);

      // Get the response, including history if available
      const response = await getLlmResponse(
        values.prompt,
        previousConversation || undefined,
        values.modelId
      );

      // Update the version with the response
      setVersionResponse(activeSessionId, versionId, {
        content: JSON.stringify(response),
        timestamp: Date.now(),
        usage: response.usage,
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
      if (activeVersion.input.modelId) {
        form.setValue("modelId", activeVersion.input.modelId);
      }
    }
  }, [activeVersion, form, isSubmitting]);

  // Handle clicking on an advice item to append to textarea
  const handleAdviceClick = (advice: string) => {
    const currentValue = form.getValues("prompt");
    const newValue = currentValue ? `${currentValue}\n\n${advice}` : advice;
    form.setValue("prompt", newValue);
  };

  // Parse response data to get advice and usage
  let adviceItems: string[] = [];
  let tokenUsage: TokenUsage | undefined;

  if (activeVersion?.response) {
    try {
      const responseData = JSON.parse(
        activeVersion.response.content
      ) as ResponseData;
      adviceItems = responseData.advices || [];
      tokenUsage = responseData.usage;
    } catch (e) {
      console.error("Failed to parse response data", e);
    }
  }

  // Calculate cost if we have usage and price data
  const calculatedCost = React.useMemo(() => {
    if (!tokenUsage || !modelPrice) return null;

    const inputCost = (tokenUsage.promptTokens / 1000000) * modelPrice.input;
    const outputCost =
      (tokenUsage.completionTokens / 1000000) * modelPrice.output;
    const totalCost = inputCost + outputCost;

    return {
      inputCost,
      outputCost,
      totalCost,
    };
  }, [tokenUsage, modelPrice]);

  // Use either our custom loading state or the form's built-in state
  const buttonDisabled = isLoading || isSubmitting;

  // Get the current model's price info for the watched model ID
  const currentModelPrice = getModelPrice(watchedModelId);

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="modelId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
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
                {currentModelPrice && (
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
          <Button type="submit" className="w-full" disabled={buttonDisabled}>
            {buttonDisabled && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Submit
          </Button>
        </form>
      </Form>

      {/* Token usage information */}
      {tokenUsage && modelPrice && (
        <Card className="mt-4 bg-muted/30">
          <CardContent className="pt-4 text-sm">
            <div className="mb-1 flex justify-between">
              <span>Input tokens:</span>
              <span>{tokenUsage.promptTokens.toLocaleString()}</span>
            </div>
            <div className="mb-1 flex justify-between">
              <span>Output tokens:</span>
              <span>{tokenUsage.completionTokens.toLocaleString()}</span>
            </div>
            <div className="mb-1 flex justify-between">
              <span>Total tokens:</span>
              <span>{tokenUsage.totalTokens.toLocaleString()}</span>
            </div>
            {calculatedCost && (
              <div className="mt-2 border-muted-foreground/20 border-t pt-2">
                <div className="mb-1 flex justify-between">
                  <span>Input cost:</span>
                  <span>${calculatedCost.inputCost.toFixed(6)}</span>
                </div>
                <div className="mb-1 flex justify-between">
                  <span>Output cost:</span>
                  <span>${calculatedCost.outputCost.toFixed(6)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total cost:</span>
                  <span>${calculatedCost.totalCost.toFixed(6)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
