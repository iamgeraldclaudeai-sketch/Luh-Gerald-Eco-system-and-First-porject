import ModuleScreen from "@/components/ModuleScreen";
import { getModule } from "@/lib/modules";

export default function Page() {
  return <ModuleScreen module={getModule("marketing-suite")!} />;
}
