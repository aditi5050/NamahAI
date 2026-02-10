import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Models from "@/components/Models";
import ProfessionalTools from "@/components/ProfessionalTools";
import Outcome from "@/components/Outcome";
import WorkflowToApp from "@/components/WorkflowToApp";
import ExploreWorkflows from "@/components/ExploreWorkflows";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="page-wrapper">
      <div className="main-wrapper">
        <Navbar />
        <Hero />
        <Models />
        <ProfessionalTools />
        <Outcome />
        <WorkflowToApp />
        <ExploreWorkflows />
        <Footer />
      </div>
    </div>
  );
}
