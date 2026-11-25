import React, { useEffect, useRef } from 'react';

export default function TradingViewChart({ symbol = 'FX:EURUSD', height = 540 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = '';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = `${height}px`;
    widgetDiv.style.width = '100%';
    container.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: '15',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      backgroundColor: '#151d2c',
      gridColor: 'rgba(148, 163, 184, 0.08)',
      allow_symbol_change: true,
      calendar: false,
      hide_side_toolbar: false,
      studies: ['STD;EMA'],
      support_host: 'https://www.tradingview.com',
    });

    container.appendChild(script);
  }, [symbol, height]);

  return (
    <div className="panel-card" style={{ padding: '12px' }}>
      <div
        className="tradingview-widget-container"
        ref={containerRef}
        style={{ height: `${height}px`, width: '100%' }}
      />
    </div>
  );
}