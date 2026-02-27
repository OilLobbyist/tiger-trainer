/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Rabbit, Bird, Fish, Play, X, Lock, Wind, Leaf, Waves, Shield, Zap, Volume2, Monitor, MousePointer2, Maximize, Minimize, Settings, VolumeX, Volume1, Activity } from 'lucide-react';
import GameCanvas from './components/GameCanvas';
import { EntityType } from './types';
import { soundService } from './services/soundService';

const MODES: { id: EntityType; icon: React.ReactNode; label: string; color: string }[] = [
  { id: 'laser', icon: <Sparkles className="w-8 h-8" />, label: 'Agility Spark', color: 'bg-cyan-500' },
  { id: 'string' as EntityType, icon: <Activity className="w-8 h-8" />, label: 'Dangling Yarn', color: 'bg-rose-500' },
  { id: 'mouse', icon: <Rabbit className="w-8 h-8" />, label: 'Jungle Scout', color: 'bg-amber-600' },
  { id: 'bird', icon: <Bird className="w-8 h-8" />, label: 'Canopy Hunter', color: 'bg-emerald-600' },
  { id: 'fish', icon: <Fish className="w-8 h-8" />, label: 'River Raider', color: 'bg-blue-600' },
];

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<EntityType>('laser');
  const [score, setScore] = useState(0);
  const [isFlat, setIsFlat] = useState(false);
  const [hasMotion, setHasMotion] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sfxVolume, setSfxVolume] = useState(0.5);
  const [ambientVolume, setAmbientVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const tapTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    soundService.setSfxVolume(sfxVolume);
    soundService.setAmbientVolume(ambientVolume);
    soundService.setMuted(isMuted);
  }, [sfxVolume, ambientVolume, isMuted]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      setHasMotion(true);
      const { beta, gamma } = event;
      // Flat is usually beta ~ 0 and gamma ~ 0
      if (beta !== null && gamma !== null) {
        const isCurrentlyFlat = Math.abs(beta) < 15 && Math.abs(gamma) < 15;
        setIsFlat(isCurrentlyFlat);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) {
        switch (e.key) {
          case 'ArrowRight':
            setFocusedIndex(prev => (prev + 1) % 6);
            break;
          case 'ArrowLeft':
            setFocusedIndex(prev => (prev - 1 + 6) % 6);
            break;
          case 'ArrowDown':
            if (focusedIndex < 5) setFocusedIndex(5);
            break;
          case 'ArrowUp':
            if (focusedIndex === 5) setFocusedIndex(2);
            break;
          case 'Enter':
          case ' ':
            if (focusedIndex < 5) {
              setMode(MODES[focusedIndex].id);
            } else {
              setIsPlaying(true);
            }
            break;
        }
      } else {
        // In-game keyboard exit support
        if (e.key === 'Enter' || e.key === ' ') {
          handleTripleTap();
        }
        if (e.key === 'Escape') {
          setIsPlaying(false);
          setScore(0);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // No longer using hold-to-exit
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, focusedIndex]);

  // Ambient Sounds Effect
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      // Random chance to play sound
      if (Math.random() > 0.7) {
        switch (mode) {
          case 'bird':
            soundService.playBirdChirp();
            break;
          case 'mouse':
            soundService.playSquirrelChirp();
            break;
          case 'laser':
            soundService.playLaserSpark();
            break;
          case 'fish':
            soundService.playBubble();
            break;
          case 'string':
            soundService.playStringWobble();
            break;
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isPlaying, mode]);

  const playCatchSound = () => {
    soundService.playCatchEffect(mode);
  };

  const handleCatch = () => {
    setScore(prev => prev + 1);
    playCatchSound();
  };

  const handleTripleTap = () => {
    setTapCount(prev => {
      const next = prev + 1;
      if (next >= 3) {
        setIsPlaying(false);
        setScore(0);
        return 0;
      }
      return next;
    });

    if (tapTimeoutRef.current) window.clearTimeout(tapTimeoutRef.current);
    tapTimeoutRef.current = window.setTimeout(() => {
      setTapCount(0);
    }, 1000);
  };

  return (
    <div 
      className="relative w-full h-screen overflow-hidden oled-safe-bg font-sans text-white flex flex-col"
      onContextMenu={(e) => e.preventDefault()}
    >
      <AnimatePresence mode="wait">
        {!isPlaying ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center w-full min-h-full p-12 md:p-24 pt-32 md:pt-40 pb-24 md:pb-32"
          >
            <div className="text-center mb-8">
              <motion.h1 
                className="text-7xl md:text-9xl font-black tracking-tighter mb-2 uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600"
                initial={{ x: -100 }}
                animate={{ x: 0 }}
              >
                Tiger Trainer
              </motion.h1>
              <p className="text-orange-200/60 text-xl font-medium uppercase tracking-widest mb-8">
                Awaken the Inner Beast
              </p>
              <h2 className="text-white/80 text-lg font-bold uppercase tracking-widest animate-pulse">
                Where shall your tiger prowl today?
              </h2>
            </div>

            <div className="mb-12 p-4 border border-white/10 rounded-2xl bg-white/5 max-w-md text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-orange-200/40 leading-relaxed">
                🛡️ Use tempered glass: A pouncing cat's weight will crack unprotected screens.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-5xl w-full mb-12">
              {MODES.map((m, idx) => (
                <motion.button
                  key={m.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setMode(m.id);
                    setFocusedIndex(idx);
                  }}
                  className={`relative flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all duration-300 ${
                    mode === m.id 
                      ? 'border-white bg-white/20 shadow-[0_0_40px_rgba(255,255,255,0.2)]' 
                      : 'border-white/5 bg-black/20 hover:bg-white/5'
                  } ${focusedIndex === idx ? 'ring-4 ring-orange-500 ring-offset-4 ring-offset-black scale-105' : ''}`}
                >
                  {/* Background Animations Container */}
                  <div className="absolute inset-0 rounded-[22px] overflow-hidden pointer-events-none">
                    <AnimatePresence>
                      {mode === m.id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0"
                        >
                          {m.id === 'laser' && (
                            <div className="absolute inset-0 flex flex-col justify-around opacity-20">
                              {[...Array(5)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ x: '-100%' }}
                                  animate={{ x: '200%' }}
                                  transition={{
                                    duration: 0.5 + Math.random() * 0.5,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                    ease: "linear"
                                  }}
                                  className="h-1 bg-white w-24 rounded-full"
                                />
                              ))}
                            </div>
                          )}
                          {m.id === 'mouse' && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-20">
                              {[...Array(6)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ scale: 0, rotate: 0 }}
                                  animate={{ 
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 15, -15, 0],
                                    y: [0, -10, 0]
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.3,
                                  }}
                                  className="absolute"
                                  style={{
                                    left: `${Math.random() * 80 + 10}%`,
                                    top: `${Math.random() * 80 + 10}%`,
                                  }}
                                >
                                  <Leaf className="w-6 h-6 text-emerald-400" />
                                </motion.div>
                              ))}
                            </div>
                          )}
                          {m.id === 'bird' && (
                            <div className="absolute inset-0 opacity-20">
                              {[...Array(4)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ y: -20, x: Math.random() * 100, opacity: 0 }}
                                  animate={{ 
                                    y: 120,
                                    x: (Math.random() * 100) + (Math.sin(i) * 20),
                                    opacity: [0, 1, 1, 0],
                                    rotate: 360
                                  }}
                                  transition={{
                                    duration: 3 + Math.random() * 2,
                                    repeat: Infinity,
                                    delay: i * 1,
                                    ease: "easeInOut"
                                  }}
                                  className="absolute"
                                >
                                  <Wind className="w-8 h-8 text-blue-200" />
                                </motion.div>
                              ))}
                            </div>
                          )}
                          {m.id === 'fish' && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-30">
                              {[0, 1, 2].map((i) => (
                                <motion.div
                                  key={`ripple-stable-${i}`}
                                  initial={{ scale: 0, opacity: 0.8 }}
                                  animate={{ 
                                    scale: 4,
                                    opacity: 0
                                  }}
                                  transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    delay: i * 1,
                                    ease: "linear"
                                  }}
                                  className="absolute w-12 h-12 border-2 border-blue-400 rounded-full"
                                />
                              ))}
                            </div>
                          )}
                          {m.id === 'string' && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-20">
                              {[...Array(3)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  animate={{ 
                                    rotate: [0, 20, -20, 0],
                                    y: [0, 5, 0]
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.5,
                                  }}
                                  className="absolute"
                                  style={{
                                    left: `${30 + i * 20}%`,
                                    top: '20%',
                                    height: '60%',
                                    width: '2px',
                                    backgroundColor: 'white'
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className={`mb-4 p-4 rounded-2xl relative z-10 ${m.color}`}>
                    {m.icon}
                  </div>
                  <span className="font-bold uppercase tracking-tight text-sm relative z-10">{m.label}</span>
                  {mode === m.id && (
                    <motion.div 
                      layoutId="active-pill"
                      className="absolute -bottom-3 bg-white text-black px-3 py-1 rounded-full text-[10px] font-black uppercase z-20"
                    >
                      Selected
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setIsPlaying(true);
                // Resume audio context on user interaction
                soundService.playCatchEffect(mode); 
              }}
              onMouseEnter={() => setFocusedIndex(5)}
              className={`group flex items-center gap-4 bg-white text-black px-12 py-6 rounded-full font-black text-2xl uppercase tracking-tighter shadow-xl shadow-orange-500/40 hover:bg-orange-50 transition-all ${
                focusedIndex === 5 ? 'ring-4 ring-orange-500 ring-offset-4 ring-offset-black scale-110' : ''
              }`}
            >
              <Play className="fill-current" />
              Begin Training
            </motion.button>

            {/* Features Blurb */}
            <div className="mt-24 max-w-5xl w-full text-center mb-12">
              <h2 className="text-sm font-black uppercase tracking-[0.4em] text-orange-500 mb-4">The Ultimate Feline Simulator</h2>
              <p className="text-xs text-white/60 leading-relaxed uppercase tracking-widest max-w-2xl mx-auto">
                Tiger Trainer is a high-fidelity hunting simulator engineered to engage your cat's natural predatory drives through scientifically-tuned visual and auditory stimuli.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
              <div className="flex flex-col items-center text-center p-6 border border-white/5 rounded-3xl bg-white/[0.02]">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4">
                  <Monitor className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest mb-2 text-white/80">OLED Optimized</h3>
                <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-wider">
                  Pure black backgrounds prevent pixel burn-in while providing infinite contrast for your cat's nocturnal vision.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-6 border border-white/5 rounded-3xl bg-white/[0.02]">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest mb-2 text-white/80">Cat-Visible Spectrum</h3>
                <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-wider">
                  Colors are scientifically tuned to the dichromatic range of feline eyes, ensuring maximum target visibility.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-6 border border-white/5 rounded-3xl bg-white/[0.02]">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
                  <Volume2 className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest mb-2 text-white/80">Thematic Audio</h3>
                <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-wider">
                  AI-synthesized chirps and chatter trigger deep-seated hunting instincts for a fully immersive session.
                </p>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-16 flex flex-col items-center gap-8"
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors text-[10px] font-bold uppercase tracking-widest text-white/60"
                >
                  <Settings className="w-3 h-3" />
                  Audio Settings
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-2 rounded-full transition-colors ${isMuted ? 'bg-orange-500/20 text-orange-500' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col gap-6 p-6 bg-white/5 border border-white/10 rounded-3xl w-64 overflow-hidden"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Sound Effects</span>
                        <span className="text-[8px] font-mono text-orange-500">{Math.round(sfxVolume * 100)}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01" 
                        value={sfxVolume} 
                        onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Ambient Sounds</span>
                        <span className="text-[8px] font-mono text-orange-500">{Math.round(ambientVolume * 100)}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01" 
                        value={ambientVolume} 
                        onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 hover:text-white/40 transition-colors">
                Designed by <a href="https://www.linkedin.com/in/gerald-crawford/" target="_blank" rel="noopener noreferrer" className="underline decoration-orange-500/40 hover:decoration-orange-500 underline-offset-4">Gerald Crawford</a>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full relative"
          >
            <GameCanvas mode={mode} onCatch={handleCatch} />
            
            {/* HUD */}
            <div className="absolute top-8 left-8 pointer-events-none">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-200/40">Successful Strikes</span>
                <span className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">{score}</span>
              </div>
            </div>

            <div className="absolute top-8 right-8 flex flex-col items-end gap-2">
              <button
                onClick={toggleFullscreen}
                className="p-4 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize className="w-5 h-5 text-white/60" /> : <Maximize className="w-5 h-5 text-white/60" />}
              </button>
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleTripleTap();
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleTripleTap();
                }}
                className={`relative p-6 bg-black/50 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/10 transition-all overflow-hidden ${tapCount > 0 ? 'scale-110 border-orange-500/50' : ''}`}
              >
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <motion.div 
                      key={i}
                      animate={{ 
                        scale: i < tapCount ? 1.25 : 1,
                        backgroundColor: i < tapCount ? '#f97316' : 'rgba(255,255,255,0.2)',
                        boxShadow: i < tapCount ? '0 0 10px #f97316' : 'none'
                      }}
                      className="w-2 h-2 rounded-full transition-all duration-300"
                    />
                  ))}
                </div>
              </button>
              <span className="text-[8px] font-bold uppercase tracking-widest text-orange-200/20 mr-2">Triple Tap to End Session</span>
            </div>

            {/* Hint for humans - only if motion detected and not flat */}
            {hasMotion && !isFlat && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none">
                <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-orange-400/60 animate-pulse text-center">
                  ✨ Training is best on a flat surface ✨
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
