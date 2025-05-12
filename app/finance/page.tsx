import FinancePage from "./FinancePage";

export const generateMetadata = () => ({
  title: "Finance",
  description: "Page to manage EmZ finances",
});

export default function Finance() {
  return <FinancePage />;
}
