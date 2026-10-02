import WallPage from "../../screens/WallPage.jsx";
import { wallMetadata, toNextMetadata } from "../../lib/metadata.js";

export const metadata = toNextMetadata(wallMetadata());

export default function Page() {
  return <WallPage />;
}
