
import HomePage from "../components/client-pages/home";

export const generateStaticParams = async () => []

export async function generateMetadata() {
  return {
    title: "Home",
    description: "Home page",
  };
}

export default function Home() {
  return <HomePage />
}