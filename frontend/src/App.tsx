import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Analytics } from "./pages/Analytics";
import { Insights } from "./pages/Insights";
import { Research } from "./pages/Research";
import { Methodology } from "./pages/Methodology";
import { MediaLiteracy } from "./pages/MediaLiteracy";
import { AboutProject } from "./pages/AboutProject";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="research" element={<Research />} />
        <Route path="methodology" element={<Methodology />} />
        <Route path="media-literacy" element={<MediaLiteracy />} />
        <Route path="about" element={<AboutProject />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="insights" element={<Insights />} />
      </Route>
    </Routes>
  );
}
