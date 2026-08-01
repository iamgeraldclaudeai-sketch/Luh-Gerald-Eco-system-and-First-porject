import ModuleScreen from "@/components/ModuleScreen";
import ModuleItemsList from "@/components/ModuleItemsList";
import { getModule } from "@/lib/modules";
import { getModuleItems } from "@/lib/moduleItems";

export const dynamic = "force-dynamic";

export default async function Page() {
  const items = await getModuleItems("content-studio");
  return (
    <ModuleScreen module={getModule("content-studio")!}>
      <ModuleItemsList items={items} heading="Content Items" color="amber" />
    </ModuleScreen>
  );
}
