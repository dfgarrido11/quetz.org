"use client";

import { useState } from "react";
import Header from "./components/header";
import HeroSection from "./components/hero-section";
import PlansSection from "./components/plans-section";
import HowItWorksSection from "./components/how-it-works-section";
import TransparencySection from "./components/transparency-section";
import GallerySection from "./components/gallery-section";
import TreesSection from "./components/trees-section";
import SchoolSection from "./components/school-section";
import CsrTeaserSection from "./components/csr-teaser-section";
import GiftTeaserSection from "./components/gift-teaser-section";
import FaqSection from "./components/faq-section";
import NewsletterSection from "./components/newsletter-section";
import { LeadModal } from "./components/lead-modal";
import AdoptionModal from "./components/adoption-modal";
import DonationModal from "./components/donation-modal";
import QuetzitoChatbot from "./components/quetzito-chatbot";
import Footer from "./components/footer";

export default function Home() {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isAdoptionModalOpen, setIsAdoptionModalOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [selectedTree, setSelectedTree] = useState<any>(null);

  const openLeadModal = () => setIsLeadModalOpen(true);
  const closeLeadModal = () => setIsLeadModalOpen(false);

  const openAdoptionModal = (tree: any) => {
    setSelectedTree(tree);
    setIsAdoptionModalOpen(true);
  };
  const closeAdoptionModal = () => setIsAdoptionModalOpen(false);

  const openDonationModal = () => setIsDonationModalOpen(true);
  const closeDonationModal = () => setIsDonationModalOpen(false);

  return (
    <>
      <Header onOpenModal={openLeadModal} />
      <HeroSection onLeadModalOpen={openLeadModal} />
      <PlansSection />
      <HowItWorksSection />
      <TransparencySection />
      <GallerySection />
      <TreesSection onAdopt={openAdoptionModal} />
      <SchoolSection />
      <CsrTeaserSection />
      <GiftTeaserSection />
      <FaqSection />
      <NewsletterSection />
      <Footer />
      <LeadModal open={isLeadModalOpen} onOpenChange={closeLeadModal} />
      <AdoptionModal isOpen={isAdoptionModalOpen} onClose={closeAdoptionModal} tree={selectedTree} />
      <DonationModal isOpen={isDonationModalOpen} onClose={closeDonationModal} />
      <QuetzitoChatbot />
    </>
  );
}
