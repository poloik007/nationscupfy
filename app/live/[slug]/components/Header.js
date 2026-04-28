export default function Header({ tournament }) {
  const bgStyle = tournament.backgroundImageUrl
    ? { backgroundImage: `url(${tournament.backgroundImageUrl})` }
    : { backgroundImage: `url(/bg-hero.png)` };

  return (
    <div className="hero">
      <div className="hero-bg" style={bgStyle} />
      <div className="hero-content">
        <img
          src={tournament.logoUrl || '/logo.png'}
          alt="Tournament logo"
          className="hero-logo"
        />
        <h1 className="hero-title">{tournament.name}</h1>
        {tournament.date && <p className="hero-date">{tournament.date}</p>}
      </div>
    </div>
  );
}
