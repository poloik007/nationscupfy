export default function InfoTab({ tournament }) {
  const info = tournament.infoContent || '';
  const attachments = (tournament.attachments || '')
    .split('\n')
    .filter(line => line.includes('|'))
    .map(line => {
      const [name, url] = line.split('|').map(s => s.trim());
      return { name, url };
    });

  const sponsors = (tournament.sponsorLogos || '').split('\n').filter(s => s.trim());
  const partners = (tournament.partnerLogos || '').split('\n').filter(s => s.trim());

  if (!info && !tournament.location && attachments.length === 0 && sponsors.length === 0 && partners.length === 0) {
    return (
      <div className="empty-state">
        <div className="icon">📋</div>
        <p>No information added yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="info-grid">
        {/* ── Left Column: Main Info / Rules ── */}
        <div className="info-main-col">
          <div className="info-block">
            <div className="info-block-title">📝 General Info</div>
          </div>
          {info && info.split('\n\n').map((block, i) => (
            <div key={i} className="info-block">
              {block.split('\n').map((line, j) => {
                if (!line.trim()) return null;
                const isTitle = line.trim().endsWith(':') || line.trim().startsWith('##');
                const clean = line.replace(/^#+\s*/, '').replace(/:$/, '');
                if (isTitle) return <div key={j} className="info-block-title">{clean}</div>;
                return (
                  <div key={j} className="info-row">
                    <span className="info-row-icon">▸</span>
                    <span dangerouslySetInnerHTML={{ __html: clean.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
                  </div>
                );
              })}
            </div>
          ))}
          {!info && <div className="empty-state" style={{ padding: 0, textAlign: 'left' }}><p>General information coming soon.</p></div>}
        </div>

        {/* ── Right Column: Place & Attachments ── */}
        <div className="info-side-col">
          {/* Place Widget */}
          {tournament.location && (
            <div className="info-block">
              <div className="info-block-title">📍 Place</div>
              <div className="info-row">
                <span>{tournament.location}</span>
              </div>
              {tournament.mapUrl && (
                <div style={{ marginTop: 12 }}>
                  <a href={tournament.mapUrl} target="_blank" rel="noreferrer">
                    <img 
                      src={tournament.mapUrl} 
                      alt="Map" 
                      style={{ width: '100%', borderRadius: 12, border: '1px solid var(--border)', display: 'block', cursor: 'zoom-in' }} 
                    />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Attachments Widget */}
          {attachments.length > 0 && (
            <div className="info-block">
              <div className="info-block-title">📎 Attachments</div>
              {attachments.map((file, i) => (
                <div key={i} className="info-row">
                  <span className="info-row-icon">📄</span>
                  <a href={file.url} target="_blank" rel="noreferrer" className="info-link">
                    {file.name}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Section: Sponsors & Partners (Full Width) ── */}
      <div style={{ marginTop: 20, borderTop: '2px solid var(--border)', paddingTop: 40 }}>
        {sponsors.length > 0 && (
          <div className="info-block" style={{ textAlign: 'center', marginBottom: 60 }}>
            <div className="info-block-title">🏆 Sponsors</div>
            <div className="logo-grid">
              {sponsors.map((url, i) => (
                <img key={i} src={url} alt="Sponsor" className="logo-item" />
              ))}
            </div>
          </div>
        )}

        {partners.length > 0 && (
          <div className="info-block" style={{ textAlign: 'center' }}>
            <div className="info-block-title">🤝 Partners</div>
            <div className="logo-grid">
              {partners.map((url, i) => (
                <img key={i} src={url} alt="Partner" className="logo-item" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
