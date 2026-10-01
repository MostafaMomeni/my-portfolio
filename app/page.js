import Navbar from "../components/Navbar";
import Reveal from "../components/Reveal";
import Hero from "../components/Hero";
import Stats from "../components/Stats";
import Intro from "../components/Intro";
import Skills from "../components/Skills";
import About from "../components/About";
import Timeline from "../components/Timeline";
import Services from "../components/Services";
import Projects from "../components/Projects";
import CaseStudies from "../components/CaseStudies";
import GitHub from "../components/GitHub";
import Experience from "../components/Experience";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Intro />
        <Skills />
        <About />
        <Timeline />
        <Services />
        <Projects />
        <CaseStudies />
        <GitHub />
        <Experience />
        <Contact />
      </main>
      <Footer />
      <Reveal />
    </>
  );
}