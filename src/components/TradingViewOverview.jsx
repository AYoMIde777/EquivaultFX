import React, { useEffect, useRef } from 'react';

export default function TradingViewOverview({ height = 460 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    delete container.dataset.tvLoaded;
    container.replaceChildren();
    container.dataset.tvLoaded = 'true';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    container.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
    script.type = 'text/javascript';
    script.async = true;
    script.text = JSON.stringify({
      colorTheme: 'dark',
      dateRange: '1D',
      showChart: true,
      locale: 'en',
      isTransparent: true,
      showSymbolLogo: true,
      showFloatingTooltip: true,
      width: '100%',
      height: height,
      plotLineColorGrowing: '#10B981',
      plotLineColorFalling: '#E11D48',
      gridLineColor: 'rgba(148, 163, 184, 0.08)',
      scaleFontColor: '#94A3B8',
      belowLineFillColorGrowing: 'rgba(16, 185, 129, 0.14)',
      belowLineFillColorFalling: 'rgba(225, 29, 72, 0.16)',
      belowLineFillColorGrowingBottom: 'rgba(11, 15, 23, 0)',
      belowLineFillColorFallingBottom: 'rgba(11, 15, 23, 0)',
      symbolActiveColor: 'rgba(225, 29, 72, 0.22)',
      tabs: [
        {
          title: 'Forex',
          symbols: [
            { s: 'FX:EURUSD', d: 'EUR / USD' },
            { s: 'FX:GBPUSD', d: 'GBP / USD' },
            { s: 'FX:USDJPY', d: 'USD / JPY' },
            { s: 'FX:AUDUSD', d: 'AUD / USD' },
          ],
        },
        {
          title: 'Crypto',
          symbols: [
            { s: 'BINANCE:BTCUSDT', d: 'Bitcoin / USDT' },
            { s: 'BINANCE:ETHUSDT', d: 'Ethereum / USDT' },
            { s: 'BINANCE:SOLUSDT', d: 'Solana / USDT' },
            { s: 'BINANCE:XRPUSDT', d: 'XRP / USDT' },
          ],
        },
        {
          title: 'Indices',
          symbols: [
            { s: 'FOREXCOM:SPXUSD', d: 'S&P 500' },
            { s: 'FOREXCOM:NSXUSD', d: 'NASDAQ 100' },
            { s: 'FOREXCOM:DJI', d: 'Dow Jones 30' },
            { s: 'FOREXCOM:UKXGBP', d: 'FTSE 100' },
          ],
        },
        {
          title: 'Commodities',
          symbols: [
            { s: 'OANDA:XAUUSD', d: 'Gold Spot' },
            { s: 'OANDA:XAGUSD', d: 'Silver Spot' },
            { s: 'TVC:USOIL', d: 'WTI Crude Oil' },
            { s: 'TVC:UKOIL', d: 'Brent Crude Oil' },
          ],
        },
      ],
    });

    container.appendChild(script);

    return () => {
      delete container.dataset.tvLoaded;
      container.replaceChildren();
    };
  }, [height]);

  return (
    <div className="panel-card" style={{ padding: '14px' }}>
      <div className="tradingview-widget-container" ref={containerRef} />
    </div>
  );
}