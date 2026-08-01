import ModuleScreen from "@/components/ModuleScreen";
import ModuleItemsList from "@/components/ModuleItemsList";
import { getModule } from "@/lib/modules";
import { getModuleItems } from "@/lib/moduleItems";

export const dynamic = "force-dynamic";

export default async function Page() {
  const items = await getModuleItems("operations-hub");
  return (
    <ModuleScreen module={getModule("operations-hub")!}>
      <ModuleItemsList items={items} heading="Workflows" color="green" />
    </ModuleScreen>
  );
}
