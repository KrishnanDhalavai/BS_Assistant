import React, { useState, useEffect, useRef } from 'react';
import DraftPanel from './components/DraftPanel';
import Recommendations from './components/Recommendations';
import gsap from 'gsap';

export default function App() {
  const [brawlers, setBrawlers] = useState([]);
  const [enemyPicks, setEnemyPicks] = useState(['', '', '']);
  const [allyPicks, setAllyPicks] = useState(['', '', '']);
  const [bannedBrawlers, setBannedBrawlers] = useState(['', '', '']);

  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBrawlersLoading, setIsBrawlersLoading] = useState(true);
  const [error, setError] = useState(null);

  const logoRef = useRef(null);
  const cursorRef = useRef(null);
  const [isHoveredInteractive, setIsHoveredInteractive] = useState(false);

  // Background Loop Audio Control
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef(null);

  // Background Theme Toggle (BSlike -> BackgroundBlue.mp4, BSDislike -> BackgroundRed.mp4)
  const [isDislike, setIsDislike] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.35;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.muted = nextMuted;
    if (!nextMuted) {
      audioRef.current.play().catch((err) => {
        console.log("Audio play failed:", err);
      });
    }
  };

  const toggleBackground = () => {
    setIsDislike(!isDislike);
  };



  // Custom Cursor Follower mouse coordinate tracking
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const moveCursor = (e) => {
      cursor.style.transform = `translate3d(${e.clientX - 32}px, ${e.clientY - 32}px, 0)`;
    };

    window.addEventListener('mousemove', moveCursor);
    return () => {
      window.removeEventListener('mousemove', moveCursor);
    };
  }, []);

  // Detect cursor hovering over interactive elements for custom hover styles
  useEffect(() => {
    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;
      const isInteractive = target.closest('a, button, select, input, textarea, [role="button"], .cursor-pointer, option');
      setIsHoveredInteractive(!!isInteractive);
    };

    window.addEventListener('mouseover', handleMouseOver);
    return () => window.removeEventListener('mouseover', handleMouseOver);
  }, []);

  // Fetch all brawlers list on initialization
  useEffect(() => {
    fetchBrawlers();
  }, []);

  // 3D Tilt Perspective Warp effect for Ranked Masters Logo
  useEffect(() => {
    const el = logoRef.current;
    if (!el) return;

    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Map offset to max 25 degrees rotation
      const rotateY = (x / (rect.width / 2)) * 25;
      const rotateX = -(y / (rect.height / 2)) * 25;

      gsap.to(el, {
        rotateX: rotateX,
        rotateY: rotateY,
        scale: 1.15,
        transformPerspective: 500,
        ease: 'power2.out',
        duration: 0.35,
        overwrite: 'auto'
      });
    };

    const handleMouseLeave = () => {
      gsap.to(el, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        ease: 'power2.out',
        duration: 0.55,
        overwrite: 'auto'
      });
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const fetchBrawlers = async () => {
    setIsBrawlersLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/brawlers');
      if (!res.ok) {
        throw new Error(`Failed to load brawlers list. Server status: ${res.status}`);
      }
      const data = await res.json();
      setBrawlers(data);
    } catch (err) {
      console.error('Error fetching brawlers:', err);
      setError('Could not connect to the API server. Make sure the backend server is running and the database is properly configured and seeded.');
    } finally {
      setIsBrawlersLoading(false);
    }
  };

  const handleEnemyPickChange = (index, value) => {
    const updated = [...enemyPicks];
    updated[index] = value;
    setEnemyPicks(updated);
  };

  const handleAllyPickChange = (index, value) => {
    const updated = [...allyPicks];
    updated[index] = value;
    setAllyPicks(updated);
  };

  const handleBanChange = (index, value) => {
    const updated = [...bannedBrawlers];
    updated[index] = value;
    setBannedBrawlers(updated);
  };

  // Prevent selecting duplicate brawlers across the draft board
  const disabledOptions = [
    ...enemyPicks.filter(Boolean),
    ...allyPicks.filter(Boolean),
    ...bannedBrawlers.filter(Boolean)
  ];

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          enemyPicks: enemyPicks.filter(Boolean),
          allyPicks: allyPicks.filter(Boolean),
          bannedBrawlers: bannedBrawlers.filter(Boolean)
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch recommendations.');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while compiling recommendations.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setEnemyPicks(['', '', '']);
    setAllyPicks(['', '', '']);
    setBannedBrawlers(['', '', '']);
    setRecommendations([]);
    setError(null);
  };

  return (
    <>
      {/* Background Audio Loop */}
      <audio
        ref={audioRef}
        src="/brawl_ingame_07.ogg"
        loop
        autoPlay
        muted={isMuted}
      />

      {/* Background Video Loops (Stacked for smooth cross-fade transition) */}
      <div className="fixed inset-0 z-0 overflow-hidden w-full h-full">
        {/* Blue Theme Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className={`absolute top-1/2 left-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover transition-opacity duration-1000 ease-in-out ${
            isDislike ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <source src="/BackgroundBlue.mp4" type="video/mp4" />
        </video>

        {/* Red Theme Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className={`absolute top-1/2 left-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover transition-opacity duration-1000 ease-in-out ${
            isDislike ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <source src="/BackgroundRed.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="min-h-screen flex flex-col px-4 py-8 sm:px-6 lg:px-8 max-w-6xl mx-auto relative z-10">
        {/* Top Right Controls (Audio & Background Video Toggle) */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:right-8 z-50 flex items-center gap-4">
          {/* Theme Like/Dislike Toggle */}
          <button
            onClick={toggleBackground}
            className="transition-all duration-300 hover:scale-110 active:scale-90 cursor-pointer flex items-center justify-center"
            title={isDislike ? "Switch to Blue Background (Like)" : "Switch to Red Background (Dislike)"}
          >
            <img
              src={isDislike ? "/BSDislike.png" : "/BSlike.png"}
              alt="Toggle Theme"
              className="w-10 h-10 object-contain select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)]"
            />
          </button>

          {/* Audio Toggle Button */}
          <button
            onClick={toggleMute}
            className="transition-all duration-300 hover:scale-110 active:scale-90 cursor-pointer flex items-center justify-center"
            title={isMuted ? "Unmute Background Music" : "Mute Background Music"}
          >
            {isMuted ? (
              <svg className="w-9 h-9 text-gray-500 hover:text-gray-400 transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zm10.707-6.293l-4 4m0-4l4 4" />
              </svg>
            ) : (
              <svg className="w-9 h-9 text-emerald-400 hover:text-emerald-300 transition-colors animate-pulse drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>
        </div>



        {/* Top Left Brawl Stars Logo */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 lg:left-8 hidden md:block">
          <img
            src="/BSlogo.webp"
            alt="Brawl Stars Logo"
            className="w-32 sm:w-36 object-contain drop-shadow-[0_0_16px_rgba(245,158,11,0.35)] hover:scale-105 transition-all duration-300 select-none cursor-pointer"
          />
        </div>
        {/* Header Banner */}
        <header className="text-center mb-8 flex flex-col items-center justify-center" style={{ perspective: '1000px' }}>
          <img
            ref={logoRef}
            src="/icon_ranked_masters.png"
            alt="Ranked Masters Logo"
            className="w-28 h-28 sm:w-32 sm:h-32 object-contain mb-4 drop-shadow-[0_0_18px_rgba(168,85,247,0.45)] select-none cursor-pointer will-change-transform"
          />

          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mb-2">
            BRAWL STARS <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 glow-text-red">DRAFT ASSISTANT</span>
          </h1>
          <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed font-semibold">
            Select pick and ban states to generate deterministic counter picks derived directly from match weights and team synergies.
          </p>
        </header>

        {/* Primary Layout */}
        <main className="flex-1 space-y-6">
          {/* Error Notice */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs font-semibold leading-relaxed flex items-start gap-3.5 animate-fade-in-up">
              <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <span className="font-extrabold uppercase tracking-wider block mb-0.5">System Alert</span>
                {error}
              </div>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200 font-extrabold text-[10px] uppercase tracking-wider px-2">
                Dismiss
              </button>
            </div>
          )}

          {/* Missing Seed Notification */}
          {!isBrawlersLoading && brawlers.length === 0 && !error && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs font-semibold leading-relaxed flex items-start gap-3.5 animate-fade-in-up">
              <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <span className="font-extrabold uppercase tracking-wider block mb-0.5">Database Unseeded</span>
                No brawlers found in the database. Please specify your password in <code className="bg-amber-950 px-1 rounded font-mono">backend/.env</code> and run <code className="bg-amber-950 px-1 rounded font-mono">npm run seed</code> in the backend directory to initialize.
              </div>
              <button onClick={fetchBrawlers} className="text-amber-400 hover:text-amber-200 font-extrabold text-[10px] uppercase tracking-wider px-2 flex items-center gap-1 shrink-0">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.306 9H18" />
                </svg>
                Retry
              </button>
            </div>
          )}

          {/* Draft Board */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Enemy Panel */}
            <DraftPanel
              title="Enemy Picks"
              subtitle="Opponent team roster"
              brawlers={brawlers}
              picks={enemyPicks}
              onChangePick={handleEnemyPickChange}
              disabledOptions={disabledOptions}
              accentColor="red"
              icon={
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              }
            />

            {/* Ally Panel */}
            <DraftPanel
              title="Ally Picks"
              subtitle="Your draft selections"
              brawlers={brawlers}
              picks={allyPicks}
              onChangePick={handleAllyPickChange}
              disabledOptions={disabledOptions}
              accentColor="cyan"
              icon={
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
            />

            {/* Bans Panel */}
            <DraftPanel
              title="Banned Picks"
              subtitle="Excluded from draft"
              brawlers={brawlers}
              picks={bannedBrawlers}
              onChangePick={handleBanChange}
              disabledOptions={disabledOptions}
              accentColor="amber"
              icon={
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />
          </div>

          {/* Control Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center pt-3">
            <button
              onClick={handleGenerate}
              disabled={isLoading || isBrawlersLoading || brawlers.length === 0}
              className="w-full sm:w-auto h-12 px-8 rounded-xl font-bold uppercase tracking-wider text-xs bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_25px_rgba(16,185,129,0.55)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Analyzing Team Matchups...
                </>
              ) : (
                <>
                  Generate Recommendations
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="w-full sm:w-auto h-12 px-6 rounded-xl font-bold uppercase tracking-wider text-[10px] border border-gray-850 hover:border-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-900/30 transition-all duration-200 cursor-pointer"
            >
              Clear Draft
            </button>
          </div>

          {/* Recommendations Grid */}
          <div className="max-w-2xl mx-auto pt-4">
            <Recommendations recommendations={recommendations} isLoading={isLoading} />
          </div>
        </main>

        {/* Footer Details */}
        <footer className="mt-12 text-center text-[10px] text-gray-650 font-bold uppercase tracking-widest">
          Brawl Stars Draft Assistant • Deterministic Matching Logic
        </footer>

        {/* Custom Cursor Follower */}
        <div
          ref={cursorRef}
          className="fixed top-0 left-0 w-16 h-16 pointer-events-none z-[9999] hidden md:block select-none will-change-transform"
          style={{ transform: 'translate3d(-100px, -100px, 0)' }}
        >
          <img
            src="/BS_Symbol.png"
            alt="Brawl Stars Cursor"
            className="w-full h-full object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
          />
        </div>
      </div>
    </>
  );
}
