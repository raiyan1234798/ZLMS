'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface HeroGeometricProps {
  badge?: string;
  title1?: string;
  title2?: string;
  description?: string;
  action?: React.ReactNode;
}

export function HeroGeometric({ badge, title1, title2, description, action }: HeroGeometricProps) {
  return (
    <section
      style={{
        position: 'relative',
        zIndex: 10,
        padding: 'clamp(80px, 12vw, 160px) 24px clamp(60px, 8vw, 100px)',
        textAlign: 'center',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Decorative geometric shapes */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '-5%',
            width: '40vw',
            height: '40vw',
            background: 'radial-gradient(circle, rgba(79,70,229,0.25) 0%, transparent 70%)',
            filter: 'blur(60px)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '5%',
            right: '-10%',
            width: '50vw',
            height: '50vw',
            background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)',
            filter: 'blur(80px)',
            borderRadius: '50%',
          }}
        />
        {/* Floating squares */}
        <motion.div
          animate={{ rotate: 360, y: [0, -20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            top: '15%',
            left: '8%',
            width: '80px',
            height: '80px',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '16px',
            transform: 'rotate(15deg)',
          }}
        />
        <motion.div
          animate={{ rotate: -360, y: [0, 20, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            top: '20%',
            right: '10%',
            width: '60px',
            height: '60px',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            borderRadius: '12px',
            transform: 'rotate(-20deg)',
          }}
        />
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            bottom: '20%',
            left: '15%',
            width: '50px',
            height: '50px',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '10px',
            transform: 'rotate(30deg)',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        {badge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '999px',
              padding: '6px 20px',
              fontSize: '0.9rem',
              color: '#a5b4fc',
              fontWeight: 500,
              marginBottom: '32px',
              backdropFilter: 'blur(8px)',
            }}
          >
            {badge}
          </motion.div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 50 }}
          style={{
            fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
            marginBottom: '8px',
            color: '#f8fafc',
            maxWidth: '900px',
          }}
        >
          {title1}
        </motion.h1>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 50 }}
          style={{
            fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
            marginBottom: '32px',
            background: 'linear-gradient(135deg, #818cf8, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            maxWidth: '900px',
          }}
        >
          {title2}
        </motion.h1>

        {description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: '#94a3b8',
              maxWidth: '680px',
              lineHeight: 1.7,
              marginBottom: '48px',
              margin: '0 auto 48px',
            }}
          >
            {description}
          </motion.p>
        )}

        {action && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ display: 'flex', justifyContent: 'center', marginTop: '48px' }}
          >
            {action}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
