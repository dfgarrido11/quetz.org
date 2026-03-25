'use client';

import { useState } from 'react';
import Header from './components/header';
import HeroSection from './components/hero-section';
import PlansSection from './components/plans-section';
import HowItWorksSection from './components/how-it-works-section';
import TreesSection from './components/trees-section';
import GallerySection from './components/gallery-section';
import SchoolSection from './components/school-section';
import GiftTeaserSection from './components/gift-teaser-section';
import CsrTeaserSection from './components/csr-teaser-section';
import TransparencySection from './components/transparency-section';
import FaqSection from './components/faq-section';
import NewsletterSection from './components/newsletter-section';
import LeadModal from './components/lead-modal';
import AdoptionModal from './components/adoption-modal';
import DonationModal from './components/donation-modal';
import QuetzitoChatbot from './components/quetzito-chatbot';
import Footer from './components/footer';

interface Tree {
  id: string;
  name: string;
  description: string;
  image: string;
}

export default function Home() {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isAdoptionModalOpen, setIsAdoptionModalOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);

  const openLeadModal = () => setIsLeadModalOpen(true);
  const closeLeadModal = () => setIsLeadModalOpen(false);

  const openAdoptionModal = (tree: Tree) => {
    setSelectedTree(tree);
    setIsAdoptionModalOpen(true);
  };
  const closeAdoptionModal = () => {
    setIsAdoptionModalOpen(false);
    setSelectedTree(null);
  };

  const openDonationModal = () => setIsDonationModalOpen(true);
  const closeDonationModal = () => setIsDonationModalOpen(false);

  const handleSelectPlan = (planId: string) => {
    // TODO: En Fase 3, esto abrirá el modal de suscripción
    console.log('Plan seleccionado:', planId);
    // Por ahora redirigimos a la sección de árboles
    document.getElementById('arboles')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen">
      <Header onOpenModal={openLeadModal} />
      <HeroSection onOpenModal={openLeadModal} />
      {/* NUEVAS SECCIONES - Fase 1 (sin borrar las existentes) */}
      <PlansSection onSelectPlan={handleSelectPlan} />
      <HowItWorksSection />
      {/* SECCIONES EXISTENTES (intactas) */}
      <TreesSection onSelectTree={openAdoptionModal} />
      <GallerySection />
      <SchoolSection onOpenDonation={openDonationModal} />
      {/* NUEVOS BLOQUES TEASER */}
      <GiftTeaserSection />
      <CsrTeaserSection />
      {/* SECCIÓN EXISTENTE (intacta) */}
      <TransparencySection />
      {/* NUEVA SECCIÓN FAQ */}
      <FaqSection />
      {/* NEWSLETTER - Lead Capture */}
      <NewsletterSection />
      <Footer />
      <LeadModal isOpen={isLeadModalOpen} onClose={closeLeadModal} />
      <AdoptionModal isOpen={isAdoptionModalOpen} onClose={closeAdoptionModal} tree={selectedTree} />
      <DonationModal isOpen={isDonationModalOpen} onClose={closeDonationModal} />
      <QuetzitoChatbot />
    </main>
  );
}
