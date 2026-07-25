import { ScrollDrillSection } from "@/components/dashboard/ScrollDrillSection";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function Page() {
  return (
    <main className="min-h-screen bg-bg-primary">
      <ThemeToggle />
      <div className="w-full">
        <ScrollDrillSection />
      </div>
    </main>
  );
}
