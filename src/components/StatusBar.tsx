/* ═══════════════════════════════════════════════════════
   StatusBar — system-style status bar
   Rendered globally in Layout.tsx, outside <main>,
   sharing the same container class as the navbar
   for pixel-perfect horizontal alignment.
   ═══════════════════════════════════════════════════════ */

function StatusBarInner() {
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        borderBottom: '0.5px solid #2c2c2a',
        backdropFilter: 'blur(8px)',
        background: 'linear-gradient(180deg, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.65) 100%)',
        opacity: 0,
        animation: 'statusFadeDown 0.9s 1.8s cubic-bezier(0.16,1,0.3,1) forwards',
      }}
    >
      <div
        className="mx-auto flex max-w-content items-center overflow-x-auto px-gutter justify-between"
        style={{
          height: 36,
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          fontSize: 10,
        }}
      >
        {/* status — amber dot + teal text */}
        <div className="flex items-center gap-2 transition-colors duration-150 hover:bg-[#1a1a17] rounded cursor-default" style={{ paddingRight: 16 }}>
          <span
            className="block rounded-full"
            style={{ width: 5, height: 5, background: '#EF9F27', animation: 'amberPulse 2.5s ease-in-out infinite' }}
          />
          <span style={{ color: '#6FD9B6', fontWeight: 500 }}>online</span>
        </div>

        {/* ─── divider ─── */}
        <span style={{ width: '0.5px', height: 14, background: '#2c2c2a', display: 'inline-block', flexShrink: 0 }} />

        {/* build */}
        <div className="flex items-center gap-1 transition-colors duration-150 hover:bg-[#1a1a17] rounded cursor-default" style={{ padding: '0 16px' }}>
          <span style={{ color: '#5a5a58' }}>build:</span>
          <span style={{ color: '#7a7974', fontWeight: 500 }}>v3.0.0</span>
        </div>

        {/* ─── divider ─── */}
        <span style={{ width: '0.5px', height: 14, background: '#2c2c2a', display: 'inline-block', flexShrink: 0 }} />

        {/* uptime */}
        <div className="flex items-center gap-1 transition-colors duration-150 hover:bg-[#1a1a17] rounded cursor-default" style={{ padding: '0 16px' }}>
          <span style={{ color: '#5a5a58' }}>uptime:</span>
          <span style={{ color: '#7a7974', fontWeight: 500 }}>142d 06:21:14</span>
        </div>

        {/* ─── divider ─── */}
        <span style={{ width: '0.5px', height: 14, background: '#2c2c2a', display: 'inline-block', flexShrink: 0 }} />

        {/* region */}
        <div className="flex items-center gap-1 transition-colors duration-150 hover:bg-[#1a1a17] rounded cursor-default" style={{ padding: '0 16px' }}>
          <span style={{ color: '#5a5a58' }}>region:</span>
          <span style={{ color: '#7a7974', fontWeight: 500 }}>blr-1</span>
        </div>

        {/* ─── divider ─── */}
        <span style={{ width: '0.5px', height: 14, background: '#2c2c2a', display: 'inline-block', flexShrink: 0 }} />

        {/* load */}
        <div className="flex items-center gap-1 transition-colors duration-150 hover:bg-[#1a1a17] rounded cursor-default" style={{ padding: '0 16px' }}>
          <span style={{ color: '#5a5a58' }}>load:</span>
          <span id="load-readout" style={{ color: '#7a7974', fontWeight: 500 }}>0.42</span>
        </div>
      </div>
    </div>
  );
}

export function StatusBar() {
  return (
    <>
      <StatusBarInner />
      <style>{`
        @keyframes statusFadeDown {
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes amberPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </>
  );
}
