import Hero from "./components/Hero";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <section>
      <div>
        <Navbar />
      </div>

      <div>
        <Hero />
      </div>
    </section>
  );
}
