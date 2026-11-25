import React, { useEffect, useRef } from 'react';

export default function TradingViewTicker() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || container.dataset.tvLoaded === 'true') return;
    container.dataset.tvLoaded = 'true';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    container.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.type = 'text/javascript';
    script.async = true;
    script.text = JSON.stringify({
      symbols: [
        { proName: 'FX:EURUSD', title: 'EUR/USD' },
        { proName: 'FX:GBPUSD', title: 'GBP/USD' },
        { proName: 'FX:USDJPY', title: 'USD/JPY' },
        { proName: 'BINANCE:BTCUSDT', title: 'BTC/USDT' },
        { proName: 'BINANCE:ETHUSDT', title: 'ETH/USDT' },
        { proName: 'OANDA:XAUUSD', title: 'Gold' },
        { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500' },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: 'adaptive',
      colorTheme: 'dark',
      locale: 'en',
    });

    container.appendChild(script);

    return () => {
      delete container.dataset.tvLoaded;
      container.replaceChildren();
    };
  }, []);

  return (
    <div className="ticker-strip">
      <div className="tradingview-widget-container" ref={containerRef} />
    </div>
  );
}