'use client';

// Project Explorer UI, ported from the inline script in the old
// project-explorer.html. Projects arrive as props (projects/*.yml parsed and
// normalized at build time by lib/projects.js — the same buildProject /
// link-normalization / accent-hash logic). Filter state, sidebar derivation,
// card markup, and the modal (including its scroll-anchored positioning)
// behave as before.
//
// Recruiting upgrades: projects that are recruiting are ordered first, carry
// a "Recruiting now" badge on the card and an apply CTA in the modal, and a
// quick filter row above the grid mirrors the sidebar Recruitment filter
// (which is hidden on mobile).

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const BUZZME_URL =
  'https://buzzme.cc.gatech.edu/research/project/search/?instructor_of_record=Breanna%20Shi&title=&description_content=&recommended_skills_content=';

function DetailGroup({ title, items }) {
  if (!items.length) return null;
  return (
    <div className="detail-group">
      <h3>{title}</h3>
      <ul className="detail-list">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function ExplorerClient({ projects }) {
  const [selectedFaculties, setSelectedFaculties] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [recruitFilter, setRecruitFilter] = useState(null);
  const [openProject, setOpenProject] = useState(null);

  const modalRef = useRef(null);
  const cardRef = useRef(null);
  const triggerRef = useRef(null);

  const faculties = [...new Set(projects.flatMap((p) => p.faculty))].sort();

  const tagPool = projects.filter(
    (p) =>
      (!selectedFaculties.length || p.faculty.some((f) => selectedFaculties.includes(f))) &&
      (recruitFilter === null || p.recruiting === recruitFilter) &&
      (!selectedStatus || p.status.toLowerCase() === selectedStatus)
  );
  const tags = [...new Set(tagPool.flatMap((p) => p.tags))].sort();

  const filtered = projects.filter((project) => {
    if (selectedTags.length && !project.tags.some((t) => selectedTags.includes(t))) return false;
    if (selectedFaculties.length && !project.faculty.some((f) => selectedFaculties.includes(f))) return false;
    if (recruitFilter !== null && project.recruiting !== recruitFilter) return false;
    if (selectedStatus && project.status.toLowerCase() !== selectedStatus) return false;
    return true;
  });

  // Recruiting projects surface first; within each group, keep alphabetical.
  const sorted = [...filtered].sort((a, b) => {
    if (a.recruiting !== b.recruiting) return a.recruiting ? -1 : 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });
  const recruitingTotal = projects.filter((p) => p.recruiting).length;

  const toggleIn = (list, value) =>
    list.includes(value) ? list.filter((x) => x !== value) : [...list, value];

  function openModal(project, event) {
    triggerRef.current = event.currentTarget;
    setOpenProject(project);
  }

  function closeModal() {
    setOpenProject(null);
  }

  function toggleTagSelection(tag) {
    setSelectedTags((prev) => toggleIn(prev, tag));
    setOpenProject(null);
  }

  // Replicates the original openModal() positioning: the modal spans the full
  // document height and the card is centered on the clicked card (or viewport).
  useLayoutEffect(() => {
    if (!openProject || !modalRef.current || !cardRef.current) return;
    const modal = modalRef.current;
    const card = cardRef.current;
    const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    modal.style.height = docHeight + 'px';
    card.style.marginTop = '0px';
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    let anchorMid = scrollY + window.innerHeight / 2;
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      anchorMid = rect.top + scrollY + rect.height / 2;
    }
    const cardHeight = card.offsetHeight;
    let top = anchorMid - cardHeight / 2 - 16;
    top = Math.max(0, Math.min(top, docHeight - cardHeight - 32));
    card.style.marginTop = top + 'px';
  }, [openProject]);

  useEffect(() => {
    if (!openProject) return;
    const onKey = (event) => {
      if (event.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openProject]);

  const filterBtn = (active, onClick, label, key) => (
    <button key={key} type="button" className={`filter-item ${active ? 'active' : ''}`} onClick={onClick}>
      {label}
    </button>
  );

  return (
    <>
      <div className="explorer">
        <aside id="filter-sidebar">
          <div className="filter-section">
            <div className="filter-title">Faculty</div>
            <div className="filter-list" id="faculty-list">
              {filterBtn(!selectedFaculties.length, () => setSelectedFaculties([]), 'All', 'all')}
              {faculties.map((f) =>
                filterBtn(selectedFaculties.includes(f), () => setSelectedFaculties((prev) => toggleIn(prev, f)), f, f)
              )}
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-title">Recruitment</div>
            <div className="filter-list" id="recruit-list">
              {filterBtn(recruitFilter === null, () => setRecruitFilter(null), 'Any')}
              {filterBtn(recruitFilter === true, () => setRecruitFilter(recruitFilter === true ? null : true), 'Open')}
              {filterBtn(recruitFilter === false, () => setRecruitFilter(recruitFilter === false ? null : false), 'Closed')}
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-title">Project Status</div>
            <div className="filter-list" id="status-list">
              {filterBtn(selectedStatus === '', () => setSelectedStatus(''), 'All')}
              {filterBtn(selectedStatus === 'active', () => setSelectedStatus(selectedStatus === 'active' ? '' : 'active'), 'Active')}
              {filterBtn(selectedStatus === 'new', () => setSelectedStatus(selectedStatus === 'new' ? '' : 'new'), 'New')}
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-title">Categories</div>
            <div className="filter-list" id="tag-list">
              {filterBtn(!selectedTags.length, () => setSelectedTags([]), 'All', 'all')}
              {tags.map((t) =>
                filterBtn(selectedTags.includes(t), () => setSelectedTags((prev) => toggleIn(prev, t)), t, t)
              )}
            </div>
          </div>
        </aside>

        <div className="main-area">
          <p id="project-result-count" data-feature="projectResultCount" role="status" aria-live="polite">
            Showing {sorted.length} of {projects.length} public projects
          </p>
          <div className="quick-filter" role="group" aria-label="Quick filters">
            <button
              type="button"
              className={`quick-chip ${recruitFilter === null ? 'active' : ''}`}
              onClick={() => setRecruitFilter(null)}
            >
              All projects <span className="quick-count">{projects.length}</span>
            </button>
            <button
              type="button"
              className={`quick-chip ${recruitFilter === true ? 'active' : ''}`}
              onClick={() => setRecruitFilter(recruitFilter === true ? null : true)}
            >
              <span className="quick-dot" aria-hidden="true"></span>
              Recruiting now <span className="quick-count">{recruitingTotal}</span>
            </button>
          </div>
          <div id="project-grid" className="project-grid">
            {sorted.length === 0 ? (
              <div className="empty-state">
                <strong>No public projects match your search yet.</strong>
                <div>Try another keyword or tag.</div>
              </div>
            ) : (
              sorted.map((project) => (
                <button
                  key={project.id}
                  className={`project-card ${project.recruiting ? 'is-recruiting' : ''}`}
                  type="button"
                  onClick={(event) => openModal(project, event)}
                >
                  <div
                    className="project-image"
                    style={{
                      background: `linear-gradient(135deg, ${project.accent[0]}, ${project.accent[1]})`,
                    }}
                  >
                    <div className="card-hover">
                      <p>{project.summary || 'See the full metadata in the popup.'}</p>
                    </div>
                    <div className="project-meta">
                      {project.recruiting ? (
                        <span className="recruit-pill">● Recruiting now</span>
                      ) : (
                        <span className="status-pill">{project.status || 'Status available'}</span>
                      )}
                      <h3 className="project-title">{project.name}</h3>
                    </div>
                    <span className="open-icon">↗</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {openProject && (
        <div
          id="project-modal"
          className="modal"
          ref={modalRef}
          onClick={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={cardRef}>
            <button className="modal-close" type="button" aria-label="Close popup" onClick={closeModal}>
              ×
            </button>
            <div id="modal-content">
              <h2 id="modal-title">{openProject.name}</h2>
              {openProject.recruiting ? (
                <div className="modal-recruit-banner">
                  <div>
                    <span className="recruit-pill dark">● Recruiting now</span>
                    <div className="modal-recruit-label">
                      This project is accepting applications for the current cohort.
                    </div>
                  </div>
                  <a className="modal-apply-btn" href={BUZZME_URL} target="_blank" rel="noreferrer">
                    Apply on BuzzMe →
                  </a>
                </div>
              ) : null}
              {openProject.summary
                ? String(openProject.summary)
                    .split(/\n\s*\n/)
                    .map((p, i) => <p key={i}>{p}</p>)
                : null}
              {openProject.status ? (
                <div className="status-pill modal-status">{openProject.status}</div>
              ) : null}
              <DetailGroup title="Faculty" items={openProject.faculty} />
              <DetailGroup title="Researchers" items={openProject.researchers} />
              <DetailGroup title="Advisors" items={openProject.advisors} />
              {openProject.tags.length ? (
                <div className="detail-group">
                  <h3>Tags</h3>
                  <div className="link-list">
                    {openProject.tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className="tag-chip"
                        onClick={() => toggleTagSelection(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              {openProject.links.length ? (
                <div className="detail-group">
                  <h3>Links</h3>
                  <div className="link-list">
                    {openProject.links.map((link) => (
                      <a key={link.label} href={link.value} target="_blank" rel="noreferrer">
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
