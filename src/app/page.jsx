import Home from "../screens/Home.jsx";
import { SITE, toNextMetadata } from "../lib/metadata.js";

export const metadata = toNextMetadata({ title: SITE.title, description: SITE.description, path: "/" });

export default function Page() {
  return <Home />;
}
