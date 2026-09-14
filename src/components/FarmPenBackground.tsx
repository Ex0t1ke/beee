import React from 'react';
import { motion } from 'motion/react';

export const FarmPenBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#6ec5f7] via-[#a8e0fd] to-[#d6f2ff]" />

      {/* Sun with pulsing warm rays */}
      <div className="absolute top-6 right-16 md:right-28">
        <motion.div
          animate={{ scale: [1, 1.08, 1], rotate: 360 }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          className="relative flex items-center justify-center"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-300 via-yellow-200 to-yellow-100 shadow-[0_0_60px_rgba(251,191,36,0.55)]" />
          {/* Subtle sun rays */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-36 h-2 bg-gradient-to-r from-yellow-200/30 to-transparent rounded-full"
              style={{ transform: `rotate(${i * 45}deg)` }}
            />
          ))}
        </motion.div>
      </div>

      {/* Floating Animated Clouds */}
      <motion.div
        animate={{ x: [-80, window.innerWidth || 1200] }}
        transition={{ duration: 65, repeat: Infinity, ease: 'linear' }}
        className="absolute top-12 left-0 opacity-85"
      >
        <svg width="140" height="50" viewBox="0 0 140 50" fill="white">
          <path d="M20 40 Q25 15 50 20 Q70 5 95 18 Q120 15 130 35 Q135 45 110 45 L30 45 Q15 45 20 40 Z" fill="#ffffff" />
        </svg>
      </motion.div>

      <motion.div
        animate={{ x: [-120, window.innerWidth || 1200] }}
        transition={{ duration: 90, repeat: Infinity, ease: 'linear', delay: 15 }}
        className="absolute top-28 left-0 opacity-70 scale-90"
      >
        <svg width="180" height="60" viewBox="0 0 180 60" fill="white">
          <path d="M25 48 Q30 18 65 22 Q90 5 125 20 Q155 18 165 42 Q175 52 140 52 L35 52 Q20 52 25 48 Z" fill="#ffffff" />
        </svg>
      </motion.div>

      <motion.div
        animate={{ x: [-100, window.innerWidth || 1200] }}
        transition={{ duration: 75, repeat: Infinity, ease: 'linear', delay: 35 }}
        className="absolute top-8 left-0 opacity-60 scale-75"
      >
        <svg width="120" height="40" viewBox="0 0 120 40" fill="white">
          <path d="M15 32 Q20 12 45 16 Q60 5 80 15 Q100 12 110 28 Q115 36 95 36 L25 36 Q12 36 15 32 Z" fill="#ffffff" />
        </svg>
      </motion.div>

      {/* Far Distant Hills */}
      <svg
        className="absolute bottom-40 md:bottom-48 w-full h-44 md:h-60"
        viewBox="0 0 1440 240"
        preserveAspectRatio="none"
      >
        {/* Deep background mountains / hills */}
        <path
          d="M0,130 C320,60 540,160 880,90 C1160,30 1340,110 1440,80 L1440,240 L0,240 Z"
          fill="#86d482"
          opacity="0.6"
        />
        {/* Mid-range rolling hills */}
        <path
          d="M0,170 C240,120 500,200 780,140 C1080,80 1280,160 1440,130 L1440,240 L0,240 Z"
          fill="#6fc46b"
          opacity="0.8"
        />
      </svg>

      {/* Distant Red Barn & Silo on the hill */}
      <div className="absolute bottom-[230px] md:bottom-[280px] left-[10%] md:left-[18%] scale-75 md:scale-90 opacity-90">
        <svg width="120" height="90" viewBox="0 0 120 90">
          {/* Silo */}
          <rect x="10" y="25" width="22" height="55" rx="3" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
          <path d="M10 25 Q21 8 32 25 Z" fill="#94a3b8" />
          {/* Barn walls */}
          <polygon points="30,40 65,15 100,40 100,80 30,80" fill="#dc2626" stroke="#b91c1c" strokeWidth="2" />
          {/* Barn roof */}
          <polygon points="26,42 65,12 104,42 98,44 65,16 32,44" fill="#f8fafc" />
          {/* Barn white X doors */}
          <rect x="52" y="52" width="26" height="28" fill="#ffffff" />
          <line x1="52" y1="52" x2="78" y2="80" stroke="#dc2626" strokeWidth="2" />
          <line x1="78" y1="52" x2="52" y2="80" stroke="#dc2626" strokeWidth="2" />
          {/* Loft window */}
          <polygon points="65,24 57,32 73,32" fill="#ffffff" />
        </svg>
      </div>

      {/* Hay Bales Stack */}
      <div className="absolute bottom-[170px] md:bottom-[210px] right-[12%] md:right-[20%] scale-75 md:scale-90">
        <svg width="100" height="70" viewBox="0 0 100 70">
          {/* Bottom hay bales */}
          <g>
            <ellipse cx="25" cy="48" rx="20" ry="14" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
            <ellipse cx="25" cy="48" rx="13" ry="8" fill="none" stroke="#d97706" strokeWidth="1.5" strokeDasharray="3 3" />
            <ellipse cx="65" cy="50" rx="20" ry="14" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
            <ellipse cx="65" cy="50" rx="13" ry="8" fill="none" stroke="#b45309" strokeWidth="1.5" strokeDasharray="3 3" />
          </g>
          {/* Top hay bale */}
          <g>
            <ellipse cx="45" cy="28" rx="22" ry="15" fill="#fde68a" stroke="#d97706" strokeWidth="2" />
            <ellipse cx="45" cy="28" rx="14" ry="9" fill="none" stroke="#d97706" strokeWidth="1.5" strokeDasharray="3 3" />
          </g>
        </svg>
      </div>

      {/* Lush Foreground Green Meadow Grass Base */}
      <div className="absolute bottom-0 inset-x-0 h-48 md:h-64 bg-gradient-to-t from-[#3b9637] via-[#48ab44] to-[#59c454]">
        {/* Grass tufts texture along top boundary */}
        <svg
          className="absolute -top-6 w-full h-8"
          viewBox="0 0 1200 24"
          preserveAspectRatio="none"
          fill="#59c454"
        >
          <path d="M0,24 Q30,4 60,24 Q90,2 120,24 Q150,5 180,24 Q210,0 240,24 Q270,3 300,24 Q330,2 360,24 Q390,6 420,24 Q450,1 480,24 Q510,4 540,24 Q570,2 600,24 Q630,7 660,24 Q690,1 720,24 Q750,5 780,24 Q810,2 840,24 Q870,4 900,24 Q930,0 960,24 Q990,5 1020,24 Q1050,3 1080,24 Q1110,6 1140,24 Q1170,2 1200,24 L1200,24 L0,24 Z" />
        </svg>
      </div>

      {/* ========================================================= */}
      {/* THE PADDOCK / CORRAL (ЗАГОН) - Beautiful Wooden Fence Enclosure */}
      {/* ========================================================= */}
      <div className="absolute bottom-16 md:bottom-24 inset-x-0 h-44 md:h-56">
        <svg
          className="w-full h-full"
          viewBox="0 0 1200 220"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Wood plank gradient */}
            <linearGradient id="woodPost" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="35%" stopColor="#92400e" />
              <stop offset="70%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <linearGradient id="woodRail" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="50%" stopColor="#92400e" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Back horizontal fence rails (enclosing the corral) */}
          <g filter="url(#shadow)">
            {/* Top horizontal rail across corral */}
            <path
              d="M-20,60 Q300,56 600,60 Q900,56 1220,60 L1220,78 Q900,74 600,78 Q300,74 -20,78 Z"
              fill="url(#woodRail)"
            />
            {/* Bottom horizontal rail across corral */}
            <path
              d="M-20,120 Q300,116 600,120 Q900,116 1220,120 L1220,138 Q900,134 600,138 Q300,134 -20,138 Z"
              fill="url(#woodRail)"
            />
          </g>

          {/* Wooden Fence Posts standing in the paddock */}
          {[
            { x: 30, h: 170 },
            { x: 170, h: 165 },
            { x: 310, h: 175 },
            { x: 450, h: 168 },
            { x: 590, h: 172 },
            { x: 730, h: 166 },
            { x: 870, h: 174 },
            { x: 1010, h: 168 },
            { x: 1150, h: 172 },
          ].map((post, index) => (
            <g key={index} filter="url(#shadow)">
              {/* Post body */}
              <polygon
                points={`
                  ${post.x},${210} 
                  ${post.x + 24},${210} 
                  ${post.x + 22},${210 - post.h + 12} 
                  ${post.x + 12},${210 - post.h} 
                  ${post.x + 2},${210 - post.h + 12}
                `}
                fill="url(#woodPost)"
              />
              {/* Post top bevel highlight */}
              <polygon
                points={`
                  ${post.x + 2},${210 - post.h + 12} 
                  ${post.x + 12},${210 - post.h} 
                  ${post.x + 22},${210 - post.h + 12}
                `}
                fill="#d97706"
                opacity="0.8"
              />
              {/* Iron nails/bolts on the rails */}
              <circle cx={post.x + 12} cy="69" r="3.5" fill="#334155" />
              <circle cx={post.x + 11} cy="68" r="1.5" fill="#94a3b8" />
              <circle cx={post.x + 12} cy="129" r="3.5" fill="#334155" />
              <circle cx={post.x + 11} cy="128" r="1.5" fill="#94a3b8" />
            </g>
          ))}

          {/* Wooden Feeding Trough in Corral Left Corner */}
          <g transform="translate(110, 140)">
            {/* Trough shadow */}
            <ellipse cx="60" cy="55" rx="55" ry="12" fill="#2d6a24" opacity="0.4" />
            {/* Trough back */}
            <polygon points="10,20 110,20 115,45 5,45" fill="#78350f" />
            {/* Fresh yellow hay spilling out */}
            <path
              d="M12,20 Q25,8 40,22 Q60,6 80,21 Q95,7 108,22 Q95,28 60,26 Q25,28 12,20 Z"
              fill="#fbbf24"
            />
            {/* Hay strands */}
            <line x1="30" y1="12" x2="22" y2="4" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="50" y1="10" x2="48" y2="2" stroke="#fde68a" strokeWidth="2" strokeLinecap="round" />
            <line x1="75" y1="12" x2="82" y2="3" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
            {/* Trough front board */}
            <polygon points="5,26 115,26 110,50 10,50" fill="#92400e" stroke="#78350f" strokeWidth="2" />
            {/* Legs */}
            <rect x="15" y="48" width="10" height="12" fill="#78350f" rx="2" />
            <rect x="95" y="48" width="10" height="12" fill="#78350f" rx="2" />
          </g>
        </svg>
      </div>

      {/* Blooming Daisies & Clover in the Paddock Grass */}
      <div className="absolute bottom-4 inset-x-4 md:inset-x-12 flex justify-between items-end opacity-90">
        {[
          { x: '5%', color: '#ffffff', size: 16 },
          { x: '14%', color: '#fef08a', size: 20 },
          { x: '24%', color: '#ffffff', size: 18 },
          { x: '35%', color: '#f472b6', size: 16 },
          { x: '68%', color: '#ffffff', size: 20 },
          { x: '78%', color: '#fef08a', size: 18 },
          { x: '88%', color: '#ffffff', size: 16 },
          { x: '94%', color: '#f472b6', size: 18 },
        ].map((flower, idx) => (
          <div key={idx} className="flex flex-col items-center">
            {/* Flower Petals */}
            <svg width={flower.size} height={flower.size} viewBox="0 0 24 24">
              <circle cx="12" cy="7" r="4" fill={flower.color} />
              <circle cx="12" cy="17" r="4" fill={flower.color} />
              <circle cx="7" cy="12" r="4" fill={flower.color} />
              <circle cx="17" cy="12" r="4" fill={flower.color} />
              <circle cx="12" cy="12" r="3.5" fill="#eab308" />
            </svg>
            {/* Stem */}
            <div className="w-1 h-3 bg-emerald-600 rounded-full" />
          </div>
        ))}
      </div>

      {/* Fluttering Butterflies */}
      <motion.div
        animate={{
          x: [40, 160, 280, 200, 80, 40],
          y: [260, 220, 250, 290, 270, 260],
          rotate: [0, 15, -10, 20, -5, 0],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-10 pointer-events-none"
      >
        <div className="flex gap-0.5">
          <motion.div
            animate={{ scaleX: [1, 0.2, 1] }}
            transition={{ duration: 0.25, repeat: Infinity }}
            className="w-3.5 h-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full origin-right"
          />
          <motion.div
            animate={{ scaleX: [1, 0.2, 1] }}
            transition={{ duration: 0.25, repeat: Infinity }}
            className="w-3.5 h-3 bg-gradient-to-bl from-amber-400 to-orange-500 rounded-full origin-left"
          />
        </div>
      </motion.div>

      <motion.div
        animate={{
          x: [window.innerWidth ? window.innerWidth - 100 : 700, 550, 420, 520, 680],
          y: [320, 280, 310, 270, 320],
          rotate: [0, -12, 15, -8, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute top-1/2 right-12 pointer-events-none"
      >
        <div className="flex gap-0.5">
          <motion.div
            animate={{ scaleX: [1, 0.2, 1] }}
            transition={{ duration: 0.3, repeat: Infinity }}
            className="w-3 h-2.5 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-full origin-right"
          />
          <motion.div
            animate={{ scaleX: [1, 0.2, 1] }}
            transition={{ duration: 0.3, repeat: Infinity }}
            className="w-3 h-2.5 bg-gradient-to-bl from-sky-400 to-indigo-500 rounded-full origin-left"
          />
        </div>
      </motion.div>
    </div>
  );
};
