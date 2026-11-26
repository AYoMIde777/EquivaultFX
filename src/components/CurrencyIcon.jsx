import React from 'react';

export default function CurrencyIcon({ code, size = 20 }) {
  const normalized = String(code || '').toUpperCase();

  if (normalized === 'BTC') {
    return (
      <span
        aria-hidden="true"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: '#F7931A',
          color: '#09090B',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: Math.max(10, Math.round(size * 0.58)),
          flexShrink: 0,
        }}
      >
        ₿
      </span>
    );
  }

  if (normalized === 'ETH' || normalized === 'ERC20') {
    return (
      <span
        aria-hidden="true"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: normalized === 'ETH' ? '#627EEA' : '#3B82F6',
          color: '#FFFFFF',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: Math.max(10, Math.round(size * 0.58)),
          flexShrink: 0,
        }}
      >
        Ξ
      </span>
    );
  }

  if (normalized === 'TRC20') {
    return (
      <span
        aria-hidden="true"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: '#26A17B',
          color: '#FFFFFF',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: Math.max(9, Math.round(size * 0.5)),
          flexShrink: 0,
        }}
      >
        ₮
      </span>
    );
  }

  // BEP20
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#F3BA2F',
        color: '#09090B',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: Math.max(9, Math.round(size * 0.5)),
        flexShrink: 0,
      }}
    >
      B
    </span>
  );
}