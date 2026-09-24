import FAQ from "./components/Faq";
import Features from "./components/Features";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Works from "./components/Works";

export default function Home() {
  return (
    <section>
      <div>
        <Navbar />
      </div>

      <div>
        <Hero />
      </div>

      <div>
        <Features />
      </div>

      <div>
        <Works />
      </div>

      <div>
        <FAQ />
      </div>
    </section>
  );
}
