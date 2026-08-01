import ModuleScreen from "@/components/ModuleScreen";
import ModuleItemsList from "@/components/ModuleItemsList";
import { getModule } from "@/lib/modules";
import { getModuleItems } from "@/lib/moduleItems";

export const dynamic = "force-dynamic";

export default async function Page() {
  const items = await getModuleItems("finance-office");
  return (
    <ModuleScreen module={getModule("finance-office")!}>
      <ModuleItemsList items={items} heading="Ledger" color="amber" />
    </ModuleScreen>
  );
}
