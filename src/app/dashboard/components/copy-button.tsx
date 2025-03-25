import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

export function CopyButton({ text }: { text: string }) {
  const handleClick = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Button variant="outline" size="icon" onClick={handleClick}>
      <Copy className="h-4 w-4" />
    </Button>
  );
}
