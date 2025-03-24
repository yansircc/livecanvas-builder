import { Card, CardContent } from "@/components/ui/card";
import { getModelPrice } from "@/lib/models";
import { useMemo } from "react";
import type { TokenUsage } from "../../hooks/llm-session-store";
import type { CalculatedCost } from "./types";

interface TokenUsageDisplayProps {
  tokenUsage: TokenUsage;
  modelId: string;
}

export function TokenUsageDisplay({
  tokenUsage,
  modelId,
}: TokenUsageDisplayProps) {
  const modelPrice = getModelPrice(modelId);

  // Calculate cost if we have usage and price data
  const calculatedCost = useMemo(() => {
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

  if (!tokenUsage || !modelPrice) return null;

  return (
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
  );
}
