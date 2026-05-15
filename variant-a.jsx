/* global React */
/* Variant A — Clinical Refined
   IBM Plex Sans + IBM Plex Mono. Navy primary, red accent.
   Hybrid: table on desktop, dense card list on mobile.
*/
const { useState, useEffect, useMemo, useRef } = window.React;

function VariantA({ tweaks, bookmarks, toggleBookmark, openInteractions, darkMode, onToggleDarkMode }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('A');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [refsOpen, setRefsOpen] = useState(false);
  const layout = tweaks.layout; // 'auto' | 'table' | 'card'
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 820 : false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 820);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Mobile selalu pakai card. Desktop ikut tweak (auto → table, atau eksplisit table/card).
  const effectiveLayout = isMobile ? 'card' : (layout === 'auto' ? 'table' : layout);
  const bookmarksSet = useMemo(() => new Set(bookmarks), [bookmarks]);

  const toggleExpand = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const groups = useMemo(() => {
    return window.KARDIO_DATA.map(g => ({
      ...g,
      dr: g.dr.filter(d => window.kdMatchesDrug(d, query, filter, bookmarksSet, showBookmarksOnly))
    })).filter(g => g.dr.length > 0);
  }, [query, filter, bookmarksSet, showBookmarksOnly]);

  const totalCount = useMemo(() => groups.reduce((s, g) => s + g.dr.length, 0), [groups]);
  const allCount = useMemo(() => window.KARDIO_DATA.reduce((s, g) => s + g.dr.length, 0), []);

  const [clOpen, setClOpen] = useState(false);

  return (
    <div className="va-root">
      {/* Header — desain asli dipertahankan */}
      <header className="va-header">
        <div className="va-accent-anim" />
        <div className="va-header-inner">
          <div className="va-header-logowrap">
            <img src={window.LASKAR_LOGO} alt="LASKAR FKUB" className="va-header-logo" />
          </div>
          <div className="va-header-body">
            <div className="va-header-applabel">LASKAR (Keluarga Asisten Kardiovaskuler) — Prodi Spesialis Jantung FKUB Malang</div>
            <h1 className="va-header-title">Referensi Dosis Obat Kardiovaskular</h1>
            <div className="va-header-author">
              by <strong>Shalahuddin Suryo Baskoro</strong>
              <span className="va-header-sep">·</span>
              <a href="https://orcid.org/0000-0002-4141-8273" target="_blank" rel="noopener noreferrer" className="va-header-orcid">
                <span className="va-orcid-dot" /> orcid.org/0000-0002-4141-8273
              </a>
            </div>
          </div>
          <div className="va-header-right">
            <div className="va-header-count">{totalCount} dari {allCount} obat</div>
            <div className="va-header-version">KardioDoc v1.2 · {window.KARDIO_DATA.length} kelompok</div>
            <div className="va-header-hint">Ctrl+P untuk cetak / PDF</div>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <section className="va-toolbar">
        <div className="va-search">
          <svg className="va-search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          <input
            type="text"
            placeholder="Cari nama obat, merek, kelas, indikasi…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className="va-search-clear" onClick={() => setQuery('')} aria-label="Bersihkan">×</button>
          )}
        </div>

        <div className="va-filters">
          {window.KARDIO_FILTERS.map(f => (
            <button
              key={f.id}
              className={`va-chip ${filter === f.id ? 'on' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="va-actions">
          <button
            className={`va-action ${showBookmarksOnly ? 'on' : ''}`}
            onClick={() => setShowBookmarksOnly(v => !v)}
            disabled={bookmarks.length === 0}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill={showBookmarksOnly ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
            Bookmark ({bookmarks.length})
          </button>
          <button className="va-action" onClick={openInteractions}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v3a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V3" /><path d="M5 8h14v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" /></svg>
            Interaksi Obat
          </button>
          <button className="va-action" onClick={() => setRefsOpen(true)}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
            Referensi
          </button>
          <button className="va-action" onClick={() => setClOpen(true)}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3 8-8" /><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10" /></svg>
            Changelog
          </button>
          <span className="va-action-spacer" />
          <button className="va-action va-action-icon" onClick={onToggleDarkMode} aria-label="Toggle dark mode" title={darkMode ? 'Mode terang' : 'Mode gelap'}>
            {darkMode ? (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
            )}
          </button>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="va-disclaimer">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
        <span><strong>Alat bantu klinis</strong> — tidak menggantikan penilaian dokter. Keputusan medis menjadi tanggung jawab klinisi.</span>
      </div>

      {/* Groups */}
      <main className="va-main">
        {groups.length === 0 && (
          <div className="va-empty">
            <div className="va-empty-icon">⌖</div>
            <div className="va-empty-title">Tidak ada obat ditemukan</div>
            <div className="va-empty-sub">
              {showBookmarksOnly ? 'Belum ada bookmark yang cocok dengan filter aktif.' : 'Coba ubah kata kunci atau filter.'}
            </div>
          </div>
        )}
        {groups.map(g => (
          <GroupBlock
            key={g.id}
            group={g}
            query={query}
            expanded={expanded}
            onToggle={toggleExpand}
            bookmarks={bookmarksSet}
            toggleBookmark={toggleBookmark}
            layout={effectiveLayout}
          />
        ))}
      </main>

      <window.ReferencesModal open={refsOpen} onClose={() => setRefsOpen(false)} />
      <window.ChangelogModal open={clOpen} onClose={() => setClOpen(false)} />

      <FullFooter />
    </div>
  );
}

function FullFooter() {
  return (
    <footer className="va-footer-full">
      <div className="va-footer-title">Disclaimer</div>
      <p>
        Aplikasi ini adalah alat bantu referensi farmakologi kardiovaskular untuk tenaga medis terlatih. Aplikasi ini <strong>bukan alat diagnosis</strong> dan tidak menggantikan penilaian klinis dokter. Setiap keputusan medis sepenuhnya merupakan tanggung jawab dokter yang merawat berdasarkan kondisi klinis individual pasien. Pengembang tidak bertanggung jawab atas konsekuensi klinis apapun yang timbul dari penggunaan informasi dalam aplikasi ini.
      </p>
      <p>
        <strong>Cutoff data:</strong> Informasi dosis bersumber dari guideline ESC/ACC/AHA edisi terbaru yang tersedia hingga sekitar tahun 2024. Rekomendasi dapat berubah seiring publikasi guideline baru.
      </p>
      <p>
        <strong>Data Fornas BPJS:</strong> Mengacu pada KMK HK.01.07/MENKES/2197/2023 beserta adendum KMK HK.01.07/MENKES/1818/2024 (berlaku 1 Februari 2025). Data Fornas dalam aplikasi ini belum diverifikasi ulang secara langsung terhadap daftar e-fornas terkini dan menunggu verifikasi manual oleh pengembang sebelum rilis publik.
      </p>
      <p className="va-footer-cr">
        <strong>© 2025 Shalahuddin Suryo Baskoro · KardioDoc v1.2 · 14 Mei 2025</strong> · Seluruh hak cipta dilindungi undang-undang (UU No. 28 Tahun 2014 tentang Hak Cipta). ORCID: <a href="https://orcid.org/0000-0002-4141-8273" target="_blank" rel="noopener noreferrer">0000-0002-4141-8273</a>
      </p>
    </footer>
  );
}

function GroupBlock({ group, query, expanded, onToggle, bookmarks, toggleBookmark, layout }) {
  const [open, setOpen] = useState(true);
  const tone = window.KD_TONES[group.tone] || window.KD_TONES.blue;
  return (
    <section className="va-group">
      <button className={`va-group-head ${open ? 'open' : ''}`} onClick={() => setOpen(o => !o)} style={{ '--gfg': tone.fg, '--gbg': tone.bg, '--gdot': tone.dot }}>
        <span className="va-group-dot" />
        <span className="va-group-title">{group.lb}</span>
        <span className="va-group-count">{group.dr.length}</span>
        <svg className="va-group-chev" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      {open && (
        layout === 'table' ? (
          <DrugTable drugs={group.dr} query={query} expanded={expanded} onToggle={onToggle} bookmarks={bookmarks} toggleBookmark={toggleBookmark} groupId={group.id} />
        ) : (
          <DrugCards drugs={group.dr} query={query} expanded={expanded} onToggle={onToggle} bookmarks={bookmarks} toggleBookmark={toggleBookmark} groupId={group.id} />
        )
      )}
    </section>
  );
}

function DrugTable({ drugs, query, expanded, onToggle, bookmarks, toggleBookmark, groupId }) {
  let lastSb = null;
  return (
    <div className="va-tbl-wrap">
      <table className="va-tbl">
        <thead>
          <tr>
            <th className="va-th-name">Nama Obat / Merek</th>
            <th>Dosis Awal</th>
            <th>Dosis Target</th>
            <th>Catatan & Keamanan</th>
            <th className="va-th-act"></th>
          </tr>
        </thead>
        <tbody>
          {drugs.map(d => {
            const key = `${groupId}-${d.n}`;
            const isOpen = !!expanded[key];
            const isBm = bookmarks.has(d.n);
            const showSub = d.sb && d.sb !== lastSb;
            if (d.sb) lastSb = d.sb;
            return (
              <React.Fragment key={key}>
                {showSub && (
                  <tr className="va-tr-sub">
                    <td colSpan={5}>{d.sb}</td>
                  </tr>
                )}
                <tr className={`va-tr ${isOpen ? 'open' : ''}`} onClick={() => onToggle(key)}>
                  <td className="va-td-name">
                    <div className="va-dn">{window.kdHighlight(d.n, query)}</div>
                    <div className="va-br">{window.kdHighlight(d.b, query)}</div>
                  </td>
                  <td className="va-td-dose">
                    <div className="va-dose-pill va-dose-start">{window.kdHighlight(d.s, query)}</div>
                  </td>
                  <td className="va-td-dose">
                    <div className="va-dose-pill va-dose-target">{window.kdHighlight(d.t, query)}</div>
                  </td>
                  <td className="va-td-meta">
                    <div className="va-tags-row">
                      {(d.tg || []).slice(0, 4).map(t => <window.TagPill key={t} id={t} />)}
                      {d.fn && <window.TagPill id="FN" />}
                    </div>
                    {d.pregCls && (
                      <div className="va-preg-inline">
                        <window.PregBadge cls={d.pregCls} cat={d.pregCat} />
                      </div>
                    )}
                  </td>
                  <td className="va-td-act" onClick={(e) => e.stopPropagation()}>
                    <window.BookmarkBtn active={isBm} onClick={() => toggleBookmark(d.n)} />
                    <span className={`va-chev ${isOpen ? 'open' : ''}`} onClick={() => onToggle(key)}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
                    </span>
                  </td>
                </tr>
                {isOpen && (
                  <tr className="va-tr-exp">
                    <td colSpan={5}>
                      <window.ExpandPanel drug={d} query={query} variant="a" />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DrugCards({ drugs, query, expanded, onToggle, bookmarks, toggleBookmark, groupId }) {
  let lastSb = null;
  return (
    <div className="va-cards">
      {drugs.map(d => {
        const key = `${groupId}-${d.n}`;
        const isOpen = !!expanded[key];
        const isBm = bookmarks.has(d.n);
        const showSub = d.sb && d.sb !== lastSb;
        if (d.sb) lastSb = d.sb;
        return (
          <React.Fragment key={key}>
            {showSub && <div className="va-card-sub">{d.sb}</div>}
            <article className={`va-card ${isOpen ? 'open' : ''}`}>
            <header className="va-card-head" onClick={() => onToggle(key)}>
              <div className="va-card-namewrap">
                <div className="va-dn">{window.kdHighlight(d.n, query)}</div>
                <div className="va-br">{window.kdHighlight(d.b, query)}</div>
              </div>
              <div className="va-card-actions" onClick={(e) => e.stopPropagation()}>
                <window.BookmarkBtn active={isBm} onClick={() => toggleBookmark(d.n)} />
              </div>
            </header>
            <div className="va-card-doses">
              <div className="va-dose-block">
                <div className="va-dose-lbl">Awal</div>
                <div className="va-dose-val">{window.kdHighlight(d.s, query)}</div>
              </div>
              <div className="va-dose-block">
                <div className="va-dose-lbl">Target</div>
                <div className="va-dose-val">{window.kdHighlight(d.t, query)}</div>
              </div>
            </div>
            <div className="va-card-tags">
              {(d.tg || []).slice(0, 5).map(t => <window.TagPill key={t} id={t} />)}
              {d.fn && <window.TagPill id="FN" />}
              {d.pregCls && <window.PregBadge cls={d.pregCls} cat={d.pregCat} />}
            </div>
            <button className="va-card-expand" onClick={() => onToggle(key)}>
              {isOpen ? 'Sembunyikan detail' : 'Lihat detail klinis'}
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}><path d="m6 9 6 6 6-6" /></svg>
            </button>
            {isOpen && <window.ExpandPanel drug={d} query={query} variant="a" />}
          </article>
          </React.Fragment>
        );
      })}
    </div>
  );
}

window.VariantA = VariantA;
