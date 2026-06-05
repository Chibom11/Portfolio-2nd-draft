import { useEffect, useState } from 'react'
import { tracks } from './MusicPlayer'

const TRACK_META = [
  {
    cover: '/images/ultravisitor.jpg',
    year: '2004',
    desc: 'A hyper-kinetic drum & bass journey — frantic breakbeats layered over melodic bass runs, pulling apart time signatures until rhythm becomes sculpture.',
    tags: ['drum & bass', 'IDM', 'glitch'],
  },
  {
    cover: '/images/budakhan_mindphone.jpg',
    year: '1999',
    desc: 'Meditative yet restless — jazz-inflected bass guitar weaves through flickering electronic beats, hovering between improvisation and machine precision.',
    tags: ['IDM', 'jazz', 'electronic'],
  },
  {
    cover: '/images/kammerkonzart.jpg',
    year: '2015',
    desc: 'Chamber music collides with digital brutalism — live ensemble strings scraped raw against Tom Jenkinson\'s signature bass mayhem.',
    tags: ['avant-garde', 'classical', 'experimental'],
  },
  {
    cover: '/images/hardnormaldaddy.jpg',
    year: '1997',
    desc: 'Pure euphoria threaded through chaotic jungle rhythms — a short, blinding sprint that distills the entire Squarepusher aesthetic into two minutes.',
    tags: ['jungle', 'drum & bass', 'IDM'],
  },
  {
    cover: '/images/cometodaddy.jpg',
    year: '1997',
    desc: 'Disarmingly gentle — a warm ambient piece that feels like sunlight through frosted glass, hiding in one of IDM\'s most chaotic records.',
    tags: ['ambient', 'IDM', 'electronic'],
  },
  {
    cover: '/images/saw.jpg',
    year: '1992',
    desc: 'The opening prayer of ambient techno — crystalline synth arpeggios over slow, glacial pads. An infinite beginning.',
    tags: ['ambient', 'techno', 'classic'],
  },
  {
    cover: '/images/drukqs.jpg',
    year: '2001',
    desc: 'A solo piano piece of heartbreaking simplicity buried deep in a double album of sonic destruction. The still eye at the center of the storm.',
    tags: ['neoclassical', 'piano', 'ambient'],
  },
]

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
  @keyframes npSlideIn {
    from { opacity:0; transform:translateX(-50%) translateY(-18px) scale(0.96); }
    to   { opacity:1; transform:translateX(-50%) translateY(0) scale(1); }
  }
  @keyframes npSpin  { to { transform:rotate(360deg); } }
  @keyframes npPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }
  @keyframes npBar   { from{height:4px;opacity:0.4} to{height:var(--h);opacity:1} }
  @keyframes npProg  { from{width:0%} to{width:100%} }
  @keyframes npExpandDown {
    from { opacity:0; max-height:0; padding-top:0; padding-bottom:0; }
    to   { opacity:1; max-height:280px; }
  }
  .np-toast {
    position:fixed; top:24px; left:50%; transform:translateX(-50%);
    z-index:9999;
    width:420px;
    background:rgba(10,0,18,0.94);
    border:0.5px solid rgba(255,77,148,0.4);
    border-radius:14px;
    overflow:hidden;
    font-family:'Space Mono',monospace;
    backdrop-filter:blur(14px);
    animation:npSlideIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  .np-scanline {
    position:absolute;inset:0;pointer-events:none;border-radius:inherit;
    background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,77,148,0.02) 3px,rgba(255,77,148,0.02) 4px);
  }
  .np-top { display:flex;align-items:center;gap:14px;padding:10px 12px 10px 10px; }
  .np-art {
    width:52px;height:52px;border-radius:8px;flex-shrink:0;
    border:0.5px solid rgba(255,77,148,0.35);
    display:flex;align-items:center;justify-content:center;
    background:linear-gradient(135deg,#1a0030,#3a005a 50%,rgba(255,45,120,0.13));
    overflow:hidden; position:relative;
  }
  .np-vinyl {
    width:36px;height:36px;border-radius:50%;
    border:1px solid rgba(255,77,148,0.3);
    display:flex;align-items:center;justify-content:center;
    animation:npSpin 3s linear infinite;
    background:conic-gradient(#1a0030 0deg,#2a0040 30deg,#1a0030 60deg,#2a0040 90deg,#1a0030 120deg,#2a0040 150deg,#1a0030 180deg,#2a0040 210deg,#1a0030 240deg,#2a0040 270deg,#1a0030 300deg,#2a0040 330deg,#1a0030 360deg);
  }
  .np-hole { width:10px;height:10px;border-radius:50%;background:rgba(10,0,18,0.95);border:1px solid rgba(255,77,148,0.5); }
  .np-info { flex:1;min-width:0;display:flex;flex-direction:column;gap:3px; }
  .np-live { font-size:9px;letter-spacing:0.18em;color:rgba(255,77,148,0.7);text-transform:uppercase;display:flex;align-items:center;gap:5px; }
  .np-dot  { width:5px;height:5px;border-radius:50%;background:#ff4d94;display:inline-block;animation:npPulse 1.2s ease-in-out infinite; }
  .np-title { font-size:13px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
  .np-meta  { font-size:10px;color:rgba(255,170,204,0.7);white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
  .np-bars  { display:flex;align-items:flex-end;gap:2px;height:20px;flex-shrink:0; }
  .np-bar   { width:3px;background:#ff4d94;border-radius:2px;animation:npBar var(--d) ease-in-out infinite alternate; }
  .np-chevron {
    width:26px;height:26px;border-radius:6px;cursor:pointer;flex-shrink:0;
    border:0.5px solid rgba(255,77,148,0.3);background:rgba(255,77,148,0.08);
    color:#ff4d94;display:flex;align-items:center;justify-content:center;
    font-size:14px;transition:background 0.15s, transform 0.25s;
    user-select:none;
  }
  .np-chevron:hover { background:rgba(255,77,148,0.2); }
  .np-chevron.open  { transform:rotate(180deg); }
  .np-expanded {
    border-top:0.5px solid rgba(255,77,148,0.18);
    padding:0 14px 14px;
    overflow:hidden;
    animation:npExpandDown 0.3s ease both;
  }
  .np-cover-row { display:flex;gap:16px;padding-top:14px; }
  .np-cover {
    width:96px;height:96px;border-radius:10px;flex-shrink:0;
    border:0.5px solid rgba(255,77,148,0.3);
    background:linear-gradient(135deg,#1a0030,#3a005a);
    overflow:hidden;
  }
  .np-cover img { width:100%;height:100%;object-fit:cover;display:block; }
  .np-detail { flex:1;min-width:0;display:flex;flex-direction:column;gap:4px; }
  .np-d-title  { font-size:14px;font-weight:700;color:#fff;line-height:1.3; }
  .np-d-artist { font-size:11px;color:rgba(255,170,204,0.8);letter-spacing:0.05em; }
  .np-d-album  { font-size:10px;color:rgba(255,77,148,0.6);letter-spacing:0.08em;text-transform:uppercase; }
  .np-desc { font-size:10px;color:rgba(200,150,180,0.7);line-height:1.6;margin-top:2px;font-style:italic; }
  .np-tags { display:flex;gap:5px;flex-wrap:wrap;margin-top:5px; }
  .np-tag  { font-size:9px;letter-spacing:0.1em;text-transform:uppercase;padding:2px 7px;border-radius:4px;border:0.5px solid rgba(255,77,148,0.3);color:rgba(255,77,148,0.7); }
  .np-prog-wrap { margin-top:12px;height:2px;background:rgba(255,77,148,0.15);border-radius:2px;overflow:hidden; }
  .np-prog-bar  { height:100%;background:linear-gradient(90deg,#ff4d94,#aa00ff);animation:npProg 20s linear forwards; }
  .np-time { display:flex;justify-content:space-between;margin-top:4px;font-size:9px;color:rgba(255,77,148,0.5);letter-spacing:0.05em; }
  .np-foot-prog { position:absolute;bottom:0;left:0;height:1.5px;background:linear-gradient(90deg,#ff4d94,#aa00ff);animation:npProg 20s linear forwards; }
`

const BAR_PARAMS = [
  { d: '0.7s', h: '18px' },
  { d: '0.5s', h: '12px' },
  { d: '0.9s', h: '16px' },
  { d: '0.6s', h: '8px'  },
  { d: '0.8s', h: '14px' },
]

export default function NowPlayingToast({ activeTrack }) {
  const [visible,   setVisible]   = useState(false)
  const [displayed, setDisplayed] = useState(null)
  const [expanded,  setExpanded]  = useState(false)

  useEffect(() => {
    if (activeTrack === null) { setVisible(false); return }
    setVisible(false)
    setExpanded(false)
    const t = setTimeout(() => { setDisplayed(activeTrack); setVisible(true) }, 150)
    return () => clearTimeout(t)
  }, [activeTrack])

  if (!visible || displayed === null) return null

  const track = tracks[displayed]
  const meta  = TRACK_META[displayed]

  return (
    <>
      <style>{css}</style>
      <div className="np-toast" key={displayed}>
        <div className="np-scanline" />

        {/* ── collapsed row ── */}
        <div className="np-top">
          <div className="np-art">
            <div className="np-vinyl"><div className="np-hole" /></div>
          </div>

          <div className="np-info">
            <div className="np-live"><span className="np-dot" />now playing</div>
            <div className="np-title">{track.title}</div>
            <div className="np-meta">{track.artist} · {track.album}</div>
          </div>

          <div className="np-bars" aria-hidden="true">
            {BAR_PARAMS.map((b, i) => (
              <div key={i} className="np-bar" style={{ '--d': b.d, '--h': b.h, height: b.h }} />
            ))}
          </div>

          <div
            className={`np-chevron${expanded ? ' open' : ''}`}
            onClick={() => setExpanded(e => !e)}
            aria-label={expanded ? 'Collapse details' : 'Expand details'}
          >
            ⌄
          </div>
        </div>

        {/* ── expanded panel ── */}
        {expanded && (
          <div className="np-expanded">
            <div className="np-cover-row">
              <div className="np-cover">
                <img src={meta.cover} alt={`${track.album} cover`} />
              </div>
              <div className="np-detail">
                <div className="np-d-title">{track.title}</div>
                <div className="np-d-artist">{track.artist}</div>
                <div className="np-d-album">{track.album} · {meta.year}</div>
                <div className="np-desc">{meta.desc}</div>
                <div className="np-tags">
                  {meta.tags.map(tag => <span key={tag} className="np-tag">{tag}</span>)}
                </div>
              </div>
            </div>
            <div className="np-prog-wrap">
              <div className="np-prog-bar" key={displayed} />
            </div>
            <div className="np-time"><span>0:00</span><span>—:——</span></div>
          </div>
        )}

        <div className="np-foot-prog" key={`fp-${displayed}`} />
      </div>
    </>
  )
}