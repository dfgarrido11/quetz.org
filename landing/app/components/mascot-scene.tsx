'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function MascotScene() {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const handleMouse = (e: MouseEvent) => {
      const rect = scene.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      const bg = scene.querySelector('.ms-bg') as HTMLElement;
      const m1 = scene.querySelector('.ms-mist1') as HTMLElement;
      const m2 = scene.querySelector('.ms-mist2') as HTMLElement;
      const qz = scene.querySelector('.ms-quetzito') as HTMLElement;
      const qa = scene.querySelector('.ms-quetzita') as HTMLElement;

      if(bg) bg.style.transform = `translate(${x*-8}px, ${y*-8}px) scale(1.02)`;
      if(m1) m1.style.transform = `translateX(${x*25}px)`;
      if(m2) m2.style.transform = `translateX(${x*-15}px)`;
      if(qz) qz.style.transform = `translate(${x*20}px, ${y*12}px)`;
      if(qa) qa.style.transform = `translate(${x*-20}px, ${y*-12}px)`;
    };

    scene.addEventListener('mousemove', handleMouse);
    return () => scene.removeEventListener('mousemove', handleMouse);
  }, []);

  useEffect(() => {
    const container = document.querySelector('.ms-fireflies');
    if (!container) return;
    for (let i = 0; i < 12; i++) {
      const ff = document.createElement('div');
      const size = 3 + Math.random() * 4;
      ff.style.cssText = `position:absolute;width:${size}px;height:${size}px;background:radial-gradient(circle,rgba(233,196,106,0.9),rgba(233,196,106,0));border-radius:50%;left:${10+Math.random()*80}%;bottom:${10+Math.random()*60}%;animation:firefly ${4+Math.random()*4}s ease-in-out ${Math.random()*5}s infinite;pointer-events:none;`;
      container.appendChild(ff);
    }
  }, []);

  return (
    <div ref={sceneRef} className="relative w-full h-[420px] md:h-[500px] overflow-hidden cursor-crosshair" style={{borderRadius:'0'}}>
      <div className="ms-bg absolute inset-0 transition-transform duration-300" style={{background:'linear-gradient(180deg, #081C15 0%, #1B4332 30%, #2D6A4F 60%, #40916C 85%, #52B788 100%)'}} />

      <div className="ms-mist1 absolute bottom-0 -left-[10%] w-[120%] h-[200px] transition-transform duration-500" style={{background:'radial-gradient(ellipse at 50% 100%, rgba(183,228,199,0.15) 0%, transparent 70%)'}} />
      <div className="ms-mist2 absolute bottom-10 -left-[5%] w-[110%] h-[150px] transition-transform duration-500" style={{background:'radial-gradient(ellipse at 30% 100%, rgba(82,183,136,0.1) 0%, transparent 60%)'}} />

      <div className="absolute bottom-16 left-[5%] w-[90%] h-1 rounded-full" style={{background:'linear-gradient(90deg,transparent,#6B5535,#8B6F47,#6B5535,transparent)'}} />

      <motion.div
        className="ms-quetzito absolute bottom-20 left-[8%] md:left-[12%] z-10 transition-transform duration-150"
        initial={{opacity:0, y:60, scale:0.5}}
        animate={{opacity:1, y:0, scale:1}}
        transition={{duration:1, delay:0.3, type:'spring', bounce:0.4}}
      >
        <div className="mascot-float-qz relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full mascot-glow-green" />
          <img src="/mascot/quetzito-aventurero.png" alt="Quetzito" className="relative z-2 w-[160px] md:w-[220px] h-auto drop-shadow-[0_8px_24px_rgba(0,0,0,0.3)]" />
          <div className="mascot-shadow mx-auto" />
        </div>
        <div className="text-center mt-2">
          <span className="font-bold text-sm text-[#B7E4C7]" style={{textShadow:'0 2px 8px rgba(0,0,0,0.5)',fontFamily:'Montserrat,sans-serif'}}>Quetzito</span>
          <br/>
          <span className="text-xs text-[#B7E4C7]/60" style={{fontFamily:'Montserrat,sans-serif'}}>El Aventurero</span>
        </div>
      </motion.div>

      <motion.div
        className="ms-quetzita absolute bottom-20 right-[8%] md:right-[12%] z-10 transition-transform duration-150"
        initial={{opacity:0, y:60, scale:0.5}}
        animate={{opacity:1, y:0, scale:1}}
        transition={{duration:1, delay:0.6, type:'spring', bounce:0.4}}
      >
        <div className="mascot-float-qa relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full mascot-glow-gold" />
          <img src="/mascot/yupp-generated-image-839091.png" alt="Quetzita" className="relative z-2 w-[160px] md:w-[220px] h-auto drop-shadow-[0_8px_24px_rgba(0,0,0,0.3)]" />
          <div className="mascot-shadow mx-auto" />
        </div>
        <div className="text-center mt-2">
          <span className="font-bold text-sm text-[#F4D58D]" style={{textShadow:'0 2px 8px rgba(0,0,0,0.5)',fontFamily:'Montserrat,sans-serif'}}>Quetzita</span>
          <br/>
          <span className="text-xs text-[#F4D58D]/60" style={{fontFamily:'Montserrat,sans-serif'}}>La Protectora</span>
        </div>
      </motion.div>

      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-5 pointer-events-none"
        initial={{opacity:0, y:30}}
        animate={{opacity:1, y:0}}
        transition={{duration:0.8, delay:0.1}}
      >
        <h2 className="font-extrabold text-2xl md:text-4xl text-white" style={{textShadow:'0 4px 16px rgba(0,0,0,0.4)',fontFamily:'Montserrat,sans-serif',letterSpacing:'-0.5px'}}>Guardianes del Bosque</h2>
        <p className="text-sm md:text-base text-[#B7E4C7] mt-2" style={{textShadow:'0 2px 8px rgba(0,0,0,0.3)',fontFamily:'Montserrat,sans-serif'}}>Cada árbol cuenta una historia</p>
      </motion.div>

      <div className="ms-fireflies absolute inset-0 pointer-events-none z-3" />
    </div>
  );
}
