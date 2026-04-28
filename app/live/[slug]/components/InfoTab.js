export default function InfoTab({ tournament }) {
  const info = tournament.infoContent || '';

  if (!info) return (
    <div className="empty-state">
      <div className="icon">📋</div>
      <p>No information added yet.</p>
    </div>
  );

  // Render plain text with line breaks preserved
  return (
    <div className="info-block">
      {info.split('\n\n').map((block, i) => (
        <div key={i} className="info-block" style={{ marginBottom: 20 }}>
          {block.split('\n').map((line, j) => {
            if (!line.trim()) return null;
            // Bold lines ending with : treated as titles
            const isTitle = line.trim().endsWith(':') || line.trim().startsWith('##');
            const clean = line.replace(/^#+\s*/, '').replace(/:$/, '');
            if (isTitle) return (
              <div key={j} className="info-block-title">{clean}</div>
            );
            return (
              <div key={j} className="info-row">
                <span className="info-row-icon">▸</span>
                <span dangerouslySetInnerHTML={{ __html: clean.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
