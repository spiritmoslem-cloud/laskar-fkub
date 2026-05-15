/* global React */
const { useState, useEffect, useMemo, useRef } = React;

// ============== SHARED HELPERS ==============

window.kdUseLocalState = function (key, initial) {
  const [v, setV] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? initial : JSON.parse(raw);
    } catch (e) { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {}
  }, [key, v]);
  return [v, setV];
};

window.kdHighlight = function (text, query) {
  if (!query || query.length < 2) return text;
  const safe = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = String(text).split(new RegExp(`(${safe})`, 'ig'));
  return parts.map((p, i) =>
    p.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="kd-mark">{p}</mark>
      : <React.Fragment key={i}>{p}</React.Fragment>
  );
};

window.kdMatchesDrug = function (drug, query, filter, bookmarkedSet, showBookmarksOnly) {
  if (showBookmarksOnly && !bookmarkedSet.has(drug.n)) return false;
  if (filter && filter !== 'A') {
    const tags = drug.tg || [];
    if (filter === 'FN') {
      if (!drug.fn) return false;
    } else if (!tags.includes(filter)) {
      return false;
    }
  }
  if (query && query.length >= 1) {
    const q = query.toLowerCase();
    const hay = [drug.n, drug.b, drug.c, drug.se, (drug.tg||[]).join(' ')].join(' ').toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
};

// Pregnancy category presentation
window.kdPregBadge = function (cls) {
  const map = {
    'cat-a': { label: 'A', color: '#1f7a3f', bg: '#e6f4ec' },
    'cat-b': { label: 'B', color: '#0c447c', bg: '#e6f1fb' },
    'cat-c': { label: 'C', color: '#854f0b', bg: '#fbf0e3' },
    'cat-d': { label: 'D', color: '#791f1f', bg: '#fdecec' },
    'cat-x': { label: 'X', color: '#3c3489', bg: '#eeedfe' },
    'cat-ni': { label: '?', color: '#5a5a5a', bg: '#eeeeee' },
  };
  return map[cls] || map['cat-ni'];
};

window.KD_TONES = {
  blue:   { fg: '#0c447c', bg: '#e6f1fb', bd: '#a6c8ec', dot: '#1d6fc0' },
  green:  { fg: '#27500a', bg: '#eaf3de', bd: '#bcd692', dot: '#5b8f1f' },
  amber:  { fg: '#854f0b', bg: '#fbf0e3', bd: '#ddb27a', dot: '#b87618' },
  rose:   { fg: '#72243e', bg: '#fbeaf0', bd: '#dca4b8', dot: '#b94166' },
  teal:   { fg: '#0f5847', bg: '#dcefe7', bd: '#9ccbbb', dot: '#16886a' },
  slate:  { fg: '#3a3a36', bg: '#ededea', bd: '#cdcbc4', dot: '#6e6c66' },
  violet: { fg: '#3c3489', bg: '#eeedfe', bd: '#b8b3df', dot: '#5f56c0' },
  orange: { fg: '#7a2a0e', bg: '#fbebe1', bd: '#dca58b', dot: '#c45a26' },
  red:    { fg: '#791f1f', bg: '#fdecec', bd: '#e5a8a8', dot: '#c43838' },
};

// ============== SHARED UI COMPONENTS ==============

function PregBadge({ cls, cat }) {
  const b = window.kdPregBadge(cls);
  return (
    <span className="kd-preg" style={{ color: b.color, background: b.bg, borderColor: b.color + '33', '--preg-fg': b.color }}>
      <span className="kd-preg-letter">{b.label}</span>
      <span className="kd-preg-text">{cat || ''}</span>
    </span>
  );
}

function TagPill({ id, mono }) {
  const label = window.KARDIO_TAGS[id] || id;
  return <span className={`kd-tag kd-tag-${id.toLowerCase()} ${mono ? 'kd-tag-mono' : ''}`}>{label}</span>;
}

function BookmarkBtn({ active, onClick, size = 18 }) {
  return (
    <button
      className={`kd-bm ${active ? 'on' : ''}`}
      onClick={onClick}
      aria-label={active ? 'Hapus bookmark' : 'Tambah bookmark'}
      style={{ width: size + 10, height: size + 10 }}
    >
      <svg viewBox="0 0 24 24" width={size} height={size} fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}

// ============== EXPAND PANEL (shared between variants) ==============

function ExpandPanel({ drug, query, variant }) {
  return (
    <div className={`kd-detail kd-detail-${variant}`}>
      <div className="kd-detail-grid">
        {drug.rn && (
          <div className="kd-detail-cell kd-cell-renal">
            <div className="kd-detail-lbl">Renal Adjustment</div>
            <div className="kd-detail-val">{window.kdHighlight(drug.rn, query)}</div>
          </div>
        )}
        {drug.pd && (
          <div className="kd-detail-cell kd-cell-pd">
            <div className="kd-detail-lbl">Pediatrik</div>
            <div className="kd-detail-val">{window.kdHighlight(drug.pd, query)}</div>
          </div>
        )}
        {drug.pregTxt && (
          <div className="kd-detail-cell kd-cell-preg">
            <div className="kd-detail-lbl">Keamanan Kehamilan & Laktasi</div>
            <div className="kd-detail-val">
              <PregBadge cls={drug.pregCls} cat={drug.pregCat} />
              <div style={{ marginTop: 6 }}>{window.kdHighlight(drug.pregTxt, query)}</div>
            </div>
          </div>
        )}
        {drug.c && (
          <div className="kd-detail-cell kd-cell-notes" style={{ gridColumn: '1 / -1' }}>
            <div className="kd-detail-lbl">Catatan Klinis</div>
            <div className="kd-detail-val">{window.kdHighlight(drug.c, query)}</div>
          </div>
        )}
        {drug.se && (
          <div className="kd-detail-cell kd-cell-se" style={{ gridColumn: '1 / -1' }}>
            <div className="kd-detail-lbl">Efek Samping</div>
            <div className="kd-detail-val">{window.kdHighlight(drug.se, query)}</div>
          </div>
        )}
      </div>
      <div className="kd-detail-tags">
        {(drug.tg || []).map(t => <TagPill key={t} id={t} />)}
        {drug.fn && <TagPill id="FN" />}
        {drug.fn && (
          <a
            className="kd-fornas-btn"
            href="https://e-fornas.kemkes.go.id/guest/daftar-obat"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg>
            Cek Fornas
          </a>
        )}
      </div>
    </div>
  );
}

// ============== INTERACTION MODAL ==============

function InteractionModal({ open, onClose, query, setQuery }) {
  if (!open) return null;
  const list = window.KARDIO_INTERACTIONS;
  const q = (query || '').trim().toLowerCase();
  const filtered = q
    ? list.filter(it => (it.a + ' ' + it.b + ' ' + it.txt).toLowerCase().includes(q))
    : list;
  const sevMap = {
    major: { label: 'Major', color: '#791f1f', bg: '#fdecec', bd: '#e5a8a8' },
    moderate: { label: 'Moderate', color: '#854f0b', bg: '#fbf0e3', bd: '#ddb27a' },
    minor: { label: 'Minor', color: '#27500a', bg: '#eaf3de', bd: '#bcd692' },
  };
  return (
    <div className="kd-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="kd-modal kd-modal-interaction" role="dialog" aria-label="Interaksi Obat">
        <div className="kd-modal-head">
          <div>
            <div className="kd-modal-eyebrow">Modul Klinis</div>
            <div className="kd-modal-title">Interaksi Obat Kardiovaskular</div>
          </div>
          <button className="kd-modal-close" onClick={onClose} aria-label="Tutup">×</button>
        </div>
        <div className="kd-modal-search">
          <input
            type="text"
            placeholder="Cari pasangan obat… (mis. warfarin, aspirin)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
        <div className="kd-modal-body">
          {filtered.length === 0 && (
            <div className="kd-empty">Tidak ada interaksi cocok untuk pencarian Anda.</div>
          )}
          {filtered.map((it, i) => {
            const s = sevMap[it.sev] || sevMap.moderate;
            return (
              <div key={i} className="kd-ix-row">
                <div className="kd-ix-pair">
                  <span className="kd-ix-drug">{it.a}</span>
                  <span className="kd-ix-arrow">↔</span>
                  <span className="kd-ix-drug">{it.b}</span>
                </div>
                <div className="kd-ix-sev" style={{ color: s.color, background: s.bg, borderColor: s.bd }}>
                  {s.label}
                </div>
                <div className="kd-ix-txt">{it.txt}</div>
              </div>
            );
          })}
        </div>
        <div className="kd-modal-foot">
          Data demo. Pada versi final, dataset interaksi akan diverifikasi dari Lexicomp / Stockley's Drug Interactions.
        </div>
      </div>
    </div>
  );
}

// ============== REFERENCES MODAL ==============

function ReferencesModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="kd-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="kd-modal" role="dialog">
        <div className="kd-modal-head">
          <div>
            <div className="kd-modal-eyebrow">Sumber Data</div>
            <div className="kd-modal-title">Referensi Guideline</div>
          </div>
          <button className="kd-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="kd-modal-body kd-refs">
          <section>
            <h4>Dosis Dewasa</h4>
            <ul>
              <li>ESC Guidelines HF 2021, HTN 2023, ACS 2023, AF 2020</li>
              <li>ACC/AHA Guidelines HF 2022, HTN 2017, ACS 2023</li>
              <li>ESC Guidelines PH 2022, Aritmia 2019–2022</li>
            </ul>
          </section>
          <section>
            <h4>Dosis Pediatrik</h4>
            <ul>
              <li><strong>¹</strong> IDAI 2016 — Buku Saku Dosis Obat Pediatri, Ikatan Dokter Anak Indonesia</li>
              <li><strong>²</strong> BNF for Children 2020–2021 — British National Formulary for Children</li>
            </ul>
          </section>
          <section>
            <h4>Fornas BPJS</h4>
            <ul>
              <li>KMK HK.01.07/MENKES/2197/2023</li>
              <li>Adendum KMK HK.01.07/MENKES/1818/2024 (berlaku 1 Feb 2025)</li>
            </ul>
          </section>
          <p className="kd-refs-note">
            Selalu verifikasi dengan sumber primer terbaru sebelum keputusan klinis.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============== CHANGELOG MODAL ==============

function ChangelogModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="kd-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="kd-modal" role="dialog">
        <div className="kd-modal-head">
          <div>
            <div className="kd-modal-eyebrow">Riwayat Perubahan</div>
            <div className="kd-modal-title">Changelog KardioDoc</div>
          </div>
          <button className="kd-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="kd-modal-body kd-cl">
          <div className="kd-cl-ver">
            <div className="kd-cl-vlbl">v1.2 — 14 Mei 2025 <span className="kd-cl-badge">Terkini</span></div>
            <ul>
              <li><strong>Redesign visual</strong> dengan tipografi IBM Plex + Newsreader</li>
              <li><strong>Bookmark obat favorit</strong> — tersimpan otomatis di perangkat</li>
              <li><strong>Mode gelap</strong> untuk ronde malam</li>
              <li><strong>Modul Interaksi Obat</strong> kardiovaskular (demo, 8 pasangan)</li>
              <li>Hybrid layout — table di desktop, card di mobile</li>
              <li>Detail klinis dengan kotak warna untuk Renal / Pediatrik / Kehamilan / Catatan / Efek Samping</li>
            </ul>
          </div>
          <div className="kd-cl-ver">
            <div className="kd-cl-vlbl">v1.1 — 14 Mei 2025</div>
            <ul>
              <li>143 obat kardiovaskular dalam 18 kelompok terapi</li>
              <li>Filter per indikasi: HF, HT, CAD/ACS, Angina, Aritmia, Anti-PH, dll</li>
              <li>Merek dagang Indonesia + dosis dewasa berbasis ESC/ACC/AHA 2023–2024</li>
              <li>Dosis awal / target / renal / pediatrik di kotak warna</li>
              <li>Renal adjustment berbasis CrCl/eGFR untuk 39 obat</li>
              <li>Kolom keamanan kehamilan & laktasi — kategori A/B/C/D/X</li>
              <li>Tag Fornas BPJS (52 obat, KMK 2197/2023 + adendum 2024)</li>
              <li>Tombol <strong>Cek Fornas ↗</strong> per obat yang masuk Fornas</li>
              <li>Search highlight, scroll to top, disclaimer banner</li>
              <li>PWA — install di Android & iOS tanpa Play Store, akses offline</li>
            </ul>
          </div>
          <div className="kd-cl-ver kd-cl-future">
            <div className="kd-cl-vlbl">Roadmap</div>
            <ul>
              <li>Sidebar menu navigasi antar modul</li>
              <li>Protokol emergensi ACLS</li>
              <li>QR code untuk distribusi ke grup klinis</li>
              <li>Kalkulator skor klinis: GRACE, TIMI, CHA₂DS₂-VASc, HAS-BLED, Killip, Mehran</li>
              <li>Kalkulator dosis berbasis BB: vasopressor, heparin, enoxaparin</li>
              <li>Protokol titrasi HF: carvedilol, bisoprolol, sacubitril/valsartan</li>
              <li>Dosis renal adjustment eGFR-based untuk semua obat</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  PregBadge, TagPill, BookmarkBtn, ExpandPanel, InteractionModal, ReferencesModal, ChangelogModal
});
