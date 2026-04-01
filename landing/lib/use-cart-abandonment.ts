'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useCartStore } from './cart-store';

const ABANDONMENT_DELAY_MS = 60 * 60 * 1000; // 1 hour
const STORAGE_KEY = 'quetz_cart_abandon_timer';
const SENT_KEY = 'quetz_cart_abandon_sent';

/**
 * Hook that tracks cart abandonment.
 * When a logged-in user has items in their cart and hasn't checked out
 * after 1 hour, it triggers the abandoned cart email API.
 * 
 * The timer resets when:
 * - User completes checkout (cart is cleared)
 * - User adds new items
 * - User visits the cart page
 */
export function useCartAbandonment(language: string = 'es') {
  const { data: session, status } = useSession();
  const items = useCartStore((state) => state.items);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendAbandonmentEmail = async () => {
    if (!session?.user?.email || !items.length) return;

    // Check if we already sent an email for this cart session
    const sentAt = sessionStorage.getItem(SENT_KEY);
    if (sentAt) return; // Already sent this session

    const cartItems = items.map(item => ({
      name: item.type === 'subscription' ? (item.planName || 'Plan') : (item.treeName || 'Árbol'),
      type: item.type,
      price: item.pricePerUnit,
      quantity: item.quantity,
      treesPerMonth: item.treesPerMonth,
    }));

    const totalValue = items.reduce((sum, item) => sum + item.pricePerUnit * item.quantity, 0);
    const cartUrl = `${window.location.origin}/carrito`;

    try {
      const response = await fetch('/api/cart-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: 'quetz-cron-secret-2024',
          userEmail: session.user.email,
          userName: session.user.name || session.user.email,
          language,
          items: cartItems,
          totalValue,
          cartUrl,
        }),
      });

      if (response.ok) {
        // Mark as sent so we don't spam
        sessionStorage.setItem(SENT_KEY, Date.now().toString());
      }
    } catch (err) {
      // Silently fail — don't disrupt the user experience
      console.error('Cart abandonment email failed:', err);
    }
  };

  useEffect(() => {
    // Only track for authenticated users with items in cart
    if (status !== 'authenticated' || !items.length) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Reset the "sent" flag when cart changes (new items added)
    // This allows re-sending if user adds items after a previous reminder
    const sentAt = sessionStorage.getItem(SENT_KEY);
    if (sentAt) {
      const sentTime = parseInt(sentAt, 10);
      const hoursSinceSent = (Date.now() - sentTime) / (1000 * 60 * 60);
      if (hoursSinceSent > 24) {
        // Reset after 24 hours so we can send again if they come back
        sessionStorage.removeItem(SENT_KEY);
      }
    }

    // Set timer for 1 hour
    timerRef.current = setTimeout(() => {
      sendAbandonmentEmail();
    }, ABANDONMENT_DELAY_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [items.length, status, session?.user?.email]);

  // Clear the sent flag when cart is emptied (after purchase)
  useEffect(() => {
    if (items.length === 0) {
      sessionStorage.removeItem(SENT_KEY);
    }
  }, [items.length]);
}
