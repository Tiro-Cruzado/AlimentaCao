// Content of the home page. The route lives in src/app/page.jsx.
import Opening from "../components/Opening.jsx";
import Gallery from "../components/Gallery.jsx";
import WallPreview from "../components/WallPreview.jsx";
import Contribute from "../components/Contribute.jsx";
import About from "../components/About.jsx";
import Transparency from "../components/Transparency.jsx";
import GalleryComingSoon from "../components/GalleryComingSoon.jsx";
import ContributeComingSoon from "../components/ContributeComingSoon.jsx";
import { FEATURES } from "../data/features.js";
import { ANIMALS_ARE_SAMPLE } from "../data/animals.js";

export default function Home() {
  return (
    <>
      <Opening />
      {/* The gallery only shows animals registered in Sanity. While there are
          none, the panel says the animals are still being registered. */}
      {FEATURES.gallery && !ANIMALS_ARE_SAMPLE ? <Gallery /> : <GalleryComingSoon registering={FEATURES.gallery} />}
      <WallPreview />
      {FEATURES.donation || FEATURES.sponsorship ? <Contribute /> : <ContributeComingSoon />}
      <About />
      <Transparency />
    </>
  );
}
