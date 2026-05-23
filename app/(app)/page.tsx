import { HomeView } from "@/components/home/HomeView";
import { loadHomePageData } from "@/lib/home/load-home-data";

export default async function HomePage() {
  const data = await loadHomePageData();
  return <HomeView {...data} />;
}
