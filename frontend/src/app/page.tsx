import { DashboardPage } from "components/pages";
import "styles/global.scss";

export const metadata = {
  title: "Tradescrope Dashboard",
  description:
    "Monitor markets, analyze trends, and manage your trading activity with Tradescrope’s real-time dashboard.",
};

export default function Home() {
  return <DashboardPage />;
}
