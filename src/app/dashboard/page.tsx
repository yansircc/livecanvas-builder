import LlmForm from "./components/llm-form";
import ResultDisplay from "./components/result-display";
import SessionTabs from "./components/session-tabs";

export default function Dashboard() {
  return (
    <div className="container mx-auto space-y-4 p-4">
      <SessionTabs />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <LlmForm />
        </div>
        <ResultDisplay />
      </div>
    </div>
  );
}
