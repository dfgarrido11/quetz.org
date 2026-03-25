'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Shield, MapPin, Send, MessageCircle, Camera,
  Play, Clock, Loader2, ChevronDown, User,
} from 'lucide-react';

export default function GuardianPage() {
  const [guardian, setGuardian] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/guardian').then(r => r.json()),
      fetch('/api/messages').then(r => r.json()),
    ])
      .then(([g, m]) => {
        setGuardian(g ?? null);
        setMessages(m ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    chatEndRef?.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages, showChat]);

  const sendMessage = async () => {
    if (!newMsg?.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMsg.trim() }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages(prev => [...(prev ?? []), msg]);
        setNewMsg('');
      }
    } catch (err) {
      console.error('Send message error:', err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-3 border-green-700 border-t-transparent rounded-full" /></div>;
  }

  if (!guardian || guardian?.error) {
    return (
      <div className="text-center py-20">
        <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-400">Aún no tienes un guardián asignado</p>
      </div>
    );
  }

  const updates = guardian?.updates ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-green-600" /> Mi Guardián del Bosque
        </h1>
        <p className="text-sm text-gray-500 mt-1">Conoce a la persona que cuida tus árboles cada día</p>
      </div>

      {/* Guardian Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <div className="bg-gradient-to-r from-green-700 to-emerald-600 h-32 relative" />
        <div className="px-6 pb-6 relative">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg -mt-12 bg-green-200">
            <Image
              src={guardian?.photoUrl ?? '/favicon.svg'}
              alt={guardian?.name ?? 'Guardián'}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
          <div className="mt-3">
            <h2 className="text-xl font-bold text-gray-900">{guardian?.name ?? ''}</h2>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5" /> {guardian?.location ?? 'Zacapa, Guatemala'}
            </p>
          </div>
          <div className="mt-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {guardian?.bio ?? ''}
          </div>
        </div>
      </motion.div>

      {/* Welcome Video */}
      {guardian?.videoUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-5"
        >
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Play className="w-4 h-4 text-green-600" /> Video de Bienvenida
          </h3>
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
            <iframe
              src={guardian.videoUrl}
              title="Video de bienvenida del guardián"
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </motion.div>
      )}

      {/* Guardian Updates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm p-5"
      >
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Camera className="w-4 h-4 text-green-600" /> Updates del Guardián
        </h3>
        {(updates?.length ?? 0) === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">Aún no hay updates</p>
        ) : (
          <div className="space-y-4">
            {updates.map?.((update: any) => (
              <div key={update?.id ?? Math.random()} className="flex gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{update?.content ?? ''}</p>
                  {update?.photoUrl && (
                    <div className="relative aspect-video rounded-lg overflow-hidden mt-2 bg-green-100 max-w-md">
                      <Image
                        src={update.photoUrl}
                        alt="Update del guardián"
                        fill
                        className="object-cover"
                        sizes="400px"
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(update?.createdAt ?? '').toLocaleDateString('es-GT', { day: 'numeric', month: 'long' })}
                  </p>
                </div>
              </div>
            )) ?? null}
          </div>
        )}
      </motion.div>

      {/* Chat Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <button
          onClick={() => setShowChat(!showChat)}
          className="w-full flex items-center justify-between p-5 hover:bg-green-50 transition-colors"
        >
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-green-600" /> Mensajería con {guardian?.name?.split?.(' ')?.[0] ?? 'Guardián'}
          </h3>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showChat ? 'rotate-180' : ''}`} />
        </button>

        {showChat && (
          <div className="border-t border-gray-100">
            <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {(messages?.length ?? 0) === 0 && (
                <p className="text-center text-gray-400 text-sm py-8">Envía tu primer mensaje al guardián</p>
              )}
              {messages?.map?.((msg: any) => (
                <div
                  key={msg?.id ?? Math.random()}
                  className={`flex ${msg?.isFromGuardian ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[80%] rounded-xl px-4 py-2.5 ${
                    msg?.isFromGuardian
                      ? 'bg-white shadow-sm text-gray-800'
                      : 'bg-green-700 text-white'
                  }`}>
                    <p className="text-sm">{msg?.content ?? ''}</p>
                    <p className={`text-[10px] mt-1 ${msg?.isFromGuardian ? 'text-gray-400' : 'text-green-200'}`}>
                      {new Date(msg?.createdAt ?? '').toLocaleString('es-GT', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )) ?? null}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Escribe un mensaje..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm text-gray-900 bg-white"
              />
              <button
                onClick={sendMessage}
                disabled={sending || !newMsg?.trim()}
                className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg flex items-center gap-1.5 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
