import CountdownPage from "./CountdownPage";

export const generateMetadata = () => ({
  title: "Countdown",
  description: "Page to countdown to important dates",
});

export default function Countdown() {
  return <CountdownPage />;
}
