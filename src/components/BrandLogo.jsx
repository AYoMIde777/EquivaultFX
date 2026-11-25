import React, { useState } from 'react';
import efxLogo from '../assets/EFX logo.jpg';

export default function BrandLogo({ showText = true }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <span className="brand-mark">
      {!imgFailed ? (
        <img
          src={efxLogo}
          alt="EquivaultFX"
          className="brand-logo-img"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span className="brand-logo-fallback">EF</span>
      )}
      {showText && (
        <span>
          Equivault<span className="brand-accent">FX</span>
        </span>
      )}
    </span>
  );
}