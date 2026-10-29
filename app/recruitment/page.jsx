import './page.css';
import { UtilityBar, Nav, Masthead, Breadcrumb, FooterB } from '../../components/Chrome';
import {
  getRecruitment,
  getFaqSections,
  getTestimonials,
  getProjectCount,
  getRawProjects,
  getPeople,
  formatDisplayValue,
  phaseStates,
  currentPhaseLabel,
} from '../../lib/data';
import { buildPublicProjects } from '../../lib/projects';
import StatCounters from './StatCounters';

export const metadata = {
  title: 'Recruitment Status | Human-Augmented Analytics Group',
};

const BUZZME_URL =
  'https://buzzme.cc.gatech.edu/research/project/search/?instructor_of_record=Breanna%20Shi&title=&description_content=&recommended_skills_content=';
const QUALTRICS_URL = 'https://gatech.co1.qualtrics.com/jfe/form/SV_86XF2sy4ZpbOLYy';

// Same transform as the old page's formatFaqAnswer(): escape, blank lines
// become paragraph breaks, single newlines become <br>, wrapped in <p>.
function faqAnswerHtml(answer) {
  const escaped = String(answer ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return '<p>' + escaped.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>') + '</p>';
}

export default function RecruitmentPage() {
  const data = getRecruitment();
  const faqSections = getFaqSections();
  const testimonials = getTestimonials();
  const phases = phaseStates(data);
  const updated = formatDisplayValue(data.last_updated) || 'unknown';

  // Recruiting snapshot for the counters row: same public-project filter
  // the Project Explorer shows, so the two pages always agree.
  const projectCount = getProjectCount();
  const publicProjects = buildPublicProjects(getRawProjects());
  const recruitingCount = publicProjects.filter((p) => p.recruiting).length;

  const stats = [
    {
      value: 125,
      label: 'Active researchers',
      desc: 'across computing, engineering, and the sciences',
      animate: true,
    },
    {
      value: projectCount,
      label: 'Research projects',
      desc: 'real faculty-led work, not toy benchmarks',
      animate: true,
    },
    {
      value: recruitingCount,
      label: 'Projects recruiting now',
      desc: 'open for the current cycle on BuzzMe',
      animate: true,
    },
    {
      value: 2024,
      label: 'Founded',
      desc: 'by Dr. Breanna Shi',
      animate: false,
    },
  ];

  // Editorial claims — every line describes a real, public HAAG project.
  // Keep this honest: add or swap only from projects/*.yml entries.
  const runway = [
    {
      lead: 'A “CT scan” for mental health',
      body: 'Deep CNN models that read sleep, stress, and well-being from passive phone-sensing data — turning multivariate time series into learnable images.',
      href: '/project-explorer',
    },
    {
      lead: 'Generative AI meets paleontology',
      body: 'Neural shape models exploring more than 2,000 3D scans of fossil and modern lizard vertebrae.',
      href: '/project-explorer',
    },
    {
      lead: 'Ecology through a warbler’s buzz',
      body: 'Event-level spectrogram detection to distinguish flight buzzes from calls, and read new behavior out of the sound.',
      href: '/project-explorer',
    },
    {
      lead: 'Rescuing artifacts from time',
      body: 'Photogrammetry pipelines that digitize historic artifacts and specimens into public 3D records before they are lost.',
      href: '/project-explorer',
    },
  ];

  // People teaser: monogram cards for a few current researchers.
  const crew = getPeople().researchers.slice(0, 8).map((p) => {
    const initials = (p.name || '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
    return { ...p, initials: initials || 'HA' };
  });

  return (
    <>
      <UtilityBar links={['Georgia Institute of Technology', 'GT Directory']} />
      <Masthead
        eyebrow="HAAG · Recruitment"
        title="Human-Augmented Analytics Group"
        sub="Advancing interdisciplinary data science collaboration through applied research and education."
      />
      <Nav current="recruitment" variant="B" />
      <Breadcrumb here="Recruitment Status" />

      {/* ---------- Editorial hero (Stanford-style: left set, serif display) ---------- */}
      <div className="recruit-hero">
        <div className="recruit-hero-inner">
          <div className="eyebrow">{data.cycle_name || 'Recruitment'}</div>
          <h1>Research that counts.</h1>
          <p className="sub">
            HAAG is a selective virtual laboratory where OMSCS students join real faculty
            projects — for course credit, with named mentors, on work that ships. No prior
            research experience required. Every application is read by a person.
          </p>
          <div className="phase-chip-wrap">
            <span className="phase-chip-dot" aria-hidden="true"></span>
            <span className="phase-chip-label">Current phase</span>
            <strong className="phase-chip-value">{currentPhaseLabel(data)}</strong>
          </div>
          <div className="hero-ctas">
            <a className="btn btn-gold" href="/project-explorer">
              Browse {recruitingCount} projects recruiting now →
            </a>
            <a className="btn btn-outline" href="#how-it-works">
              How the cycle works
            </a>
          </div>
        </div>
      </div>

      {/* ---------- Count-up stats (Stanford-style hairline row) ---------- */}
      <div className="count-band">
        <StatCounters stats={stats} />
      </div>

      {/* ---------- Research in progress (real projects, punchy claims) ---------- */}
      <div className="section band-paper" id="runway">
        <div className="section-head">
          <div className="eyebrow">Research in progress</div>
          <h2>What HAAG researchers are working on right now</h2>
          <p className="head-deck">
            Every HAAG project begins with a faculty question worth answering. A few of the
            {projectCount} live in the current portfolio:
          </p>
        </div>
        <ul className="claims">
          {runway.map((item, i) => (
            <li key={i}>
              <a href={item.href} className="claim-link">
                <strong>{item.lead}</strong>
                <p>{item.body}</p>
                <span className="claim-more">Explore →</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* ---------- Why join (editorial, not SaaS cards) ---------- */}
      <div className="section band-stone" id="why-join">
        <div className="section-head">
          <div className="eyebrow">Why join HAAG</div>
          <h2>What you actually get as a HAAG researcher</h2>
        </div>
        <div className="benefit-grid">
          <div className="benefit-card">
            <h3>Faculty mentorship, not busywork</h3>
            <p>
              Work directly with faculty advisors on their own research programs. What you
              build and ship becomes part of a real project — with your name on the
              contribution.
            </p>
          </div>
          <div className="benefit-card">
            <h3>Earn academic credit</h3>
            <p>
              Research for CS 8903 or CS 6999 credit counts toward your degree. One semester
              makes you a researcher; two semesters usually make you the one training the
              next.
            </p>
          </div>
          <div className="benefit-card">
            <h3>A co-authorship pipeline</h3>
            <p>
              Strong work here leads to publications, conference submissions, and
              recommendation letters that actually say something specific about you.
            </p>
          </div>
          <div className="benefit-card">
            <h3>A cohort of 125 researchers</h3>
            <p>
              Admission is selective — but within the cohort you'll find study partners,
              project teammates, and people who went through exactly what you're about to do.
            </p>
          </div>
        </div>
      </div>

      {/* ---------- People teaser (Stanford "Meet our faculty" analog) ---------- */}
      {crew.length ? (
        <div className="section" id="people-teaser">
          <div className="section-head">
            <div className="eyebrow">The researchers</div>
            <h2>Meet the community you would join</h2>
          </div>
          <div className="crew-grid">
            {crew.map((person) => (
              <a
                className="crew-card"
                key={person.name + person.profile_url}
                href={person.profile_url}
              >
                <span className="crew-mono" aria-hidden="true">{person.initials}</span>
                <span className="crew-name">{person.name}</span>
                <span className="crew-role">{person.role_label || person.role}</span>
              </a>
            ))}
          </div>
          <div className="crew-more">
            <a className="cta-link" href="/people">See everyone →</a>
          </div>
        </div>
      ) : null}

      {/* ---------- How it works ---------- */}
      <div className="section band-stone" id="how-it-works" style={{ paddingTop: 64 }}>
        <div className="section-head">
          <div className="eyebrow">How it works</div>
          <h2>Three steps from applicant to researcher</h2>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-idx">01</div>
            <div>
              <span className="step-kicker">This week</span>
              <h3>Explore the projects</h3>
              <p>
                Browse the Project Explorer by category, faculty, and recruiting status. Find
                work that genuinely matches what you want to learn — applying for a project
                you care about is the strongest predictor of getting in.
              </p>
              <a className="cta-link" href="/project-explorer">Open the Project Explorer →</a>
            </div>
          </div>
          <div className="step-card">
            <div className="step-idx">02</div>
            <span className="step-kicker">When the window is open</span>
            <h3>Apply on BuzzMe</h3>
            <p>
              Submit through BuzzMe for the project you want. Going for 8903 credit? Complete
              the short 8903 form right after — one project application, one form. That's it.
            </p>
            <a className="cta-link" href={BUZZME_URL} target="_blank" rel="noreferrer">Find projects on BuzzMe →</a>
          </div>
          <div className="step-card">
            <div className="step-idx">03</div>
            <span className="step-kicker">Rolling basis</span>
            <h3>Get matched with a team</h3>
            <p>
              The recruitment team matches applications with faculty and advisors in the order
              received. You'll hear back either way, and matched researchers start immediately
              within their cohort.
            </p>
          </div>
        </div>
      </div>

      {/* ---------- Researcher voices ---------- */}
      {testimonials.length ? (
        <div className="section" id="voices">
          <div className="section-head">
            <div className="eyebrow">Researcher voices</div>
            <h2>What the program looks like from inside</h2>
          </div>
          <div className="voice-grid">
            {testimonials.map((t, i) => (
              <figure className="voice-card" key={i}>
                <blockquote>“{String(t.quote || '').trim()}”</blockquote>
                <figcaption>
                  <div className="voice-name">{t.name || ''}</div>
                  <div className="voice-role">{t.role || ''}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      ) : null}

      {/* ---------- Live status (original page content, restyled) ---------- */}
      <div className="section band-stone" id="status" style={{ paddingTop: 64 }}>
        <div className="section-head">
          <div className="eyebrow">Live status</div>
          <h2>Where the recruitment cycle stands right now</h2>
        </div>
        <div className="grid">
          <div>
            <div id="content" style={{ marginTop: 0 }}>
              <div className="status-banner">
                <div className="top-row">
                  <div>
                    <div className="label">Current Phase</div>
                    <div className="phase">{currentPhaseLabel(data)}</div>
                  </div>
                  <div className="cycle">{data.cycle_name || ''}</div>
                </div>
                <div className="updated">Last updated {updated}</div>
              </div>

              {data.notes ? <div className="notes">{String(data.notes).trim()}</div> : null}

              <div className="side-card apply apply-flow">
                <h3>CS 8903 Application</h3>
                <p>
                  Applying for 8903 credit? You must first submit a BuzzMe application for the
                  main project you want to join, then complete the 8903 application form.
                </p>
                <div className="cta-stack">
                  <a className="cta" href={BUZZME_URL} target="_blank" rel="noreferrer">
                    <span className="step">Step 1</span> Find your project on BuzzMe →
                  </a>
                  <a className="cta" href={QUALTRICS_URL} target="_blank" rel="noreferrer">
                    <span className="step">Step 2</span> Submit the 8903 application →
                  </a>
                </div>
              </div>

              <div className="log-heading">Cycle Log</div>
              <div className="timeline">
                {phases.map((p, i) => (
                  <div className={`phase-row ${p.state}`} key={p.key || i}>
                    <div className="rail">
                      <div className={`dot ${p.state}`}>{p.state === 'complete' ? '✓' : `P${i + 1}`}</div>
                      {!p.isLast && <div className={`line ${p.state === 'complete' ? 'complete' : ''}`}></div>}
                    </div>
                    <div className="phase-content">
                      <span className="phase-label">{p.label}</span>
                      {p.state === 'current' && <span className="badge current">Current</span>}
                      {p.state === 'complete' && <span className="badge complete">Complete</span>}
                      <div className="phase-desc">{p.description || ''}</div>
                    </div>
                  </div>
                ))}
              </div>

              {faqSections.length ? (
                <div className="faq-shell">
                  <div className="log-heading">Enrollment FAQs</div>
                  <div className="faq-grid">
                    {faqSections.map((section) => (
                      <section className="faq-card" id={section.key || 'faq-section'} key={section.key}>
                        <div className="faq-kicker">{section.eyebrow || 'FAQ'}</div>
                        <h3>{section.title || ''}</h3>
                        {section.description ? <p className="faq-desc">{section.description}</p> : null}
                        <div className="faq-list">
                          {(section.items || []).map((item, i) => (
                            <details className="faq-item" key={i}>
                              <summary>{item.question || ''}</summary>
                              <div
                                className="faq-answer"
                                dangerouslySetInnerHTML={{ __html: faqAnswerHtml(item.answer || '') }}
                              />
                            </details>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          <div>
            <div className="side-card">
              <h3>How this stays current</h3>
              <p>
                This page is driven by a single structured file maintained by the recruitment
                team. When the phase changes, the file is updated and this page reflects it
                automatically.
              </p>
            </div>
            <div className="side-card contact" id="contact-card">
              {data.contact ? (
                <>
                  <h3 id="contact-haag">Questions about this cycle?</h3>
                  <p>Jump to the right FAQ first, then reach out if you still need help.</p>
                  <div className="cta-stack">
                    <a className="cta" href="#faq-8903">8903 FAQ for New Researchers →</a>
                    <a className="cta" href="#faq-6999">6999 FAQ for Returning Project Track →</a>
                    <a className="cta" href={data.contact}>Additional questions? Contact HAAG →</a>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Final CTA ---------- */}
      <div className="cta-band">
        <div className="cta-band-inner">
          <h2>Ready to become a HAAG researcher?</h2>
          <p>
            The next cycle starts with one application. Find the project where you'd actually do
            your best work — and go for it.
          </p>
          <div className="hero-ctas">
            <a className="btn btn-gold" href="/project-explorer">Browse recruiting projects →</a>
            <a className="btn btn-outline" href={BUZZME_URL} target="_blank" rel="noreferrer">Apply on BuzzMe</a>
          </div>
        </div>
      </div>

      <FooterB />
    </>
  );
}
