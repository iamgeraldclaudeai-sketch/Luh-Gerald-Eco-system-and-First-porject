import DashboardHome from "@/components/DashboardHome";
import { getAgents, getRecentActivity } from "@/lib/agents";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [agents, activity] = await Promise.all([getAgents(), getRecentActivity()]);
  return <DashboardHome agents={agents ?? []} initialActivity={activity ?? []} />;
}
