import { Terminal } from "@/components";
import { useTerminalStore } from "@/stores";

export function TerminalPanel() {
  const lines = useTerminalStore(s => s.lines);
  return (
    <Terminal title="LOG" height="10rem" lines={lines} className="mb-px" />
  );
}
