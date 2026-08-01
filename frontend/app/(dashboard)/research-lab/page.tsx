import ModuleScreen from "@/components/ModuleScreen";
import ModuleItemsList from "@/components/ModuleItemsList";
import { getModule } from "@/lib/modules";
import { getModuleItems } from "@/lib/moduleItems";

export const dynamic = "force-dynamic";

export default async function Page() {
  const items = await getModuleItems("research-lab");
  return (
    <ModuleScreen module={getModule("research-lab")!}>
      <ModuleItemsList items={items} heading="Research Notes" color="violet" />
    </ModuleScreen>
  );
}
