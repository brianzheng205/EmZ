import TVPage from "./TVPage";

export const generateMetadata = () => {
  return {
    title: "TV",
    description: "Page to keep track of TV shows and movies EmZ is watching",
  };
};

export default function TV() {
  return <TVPage />;
}
