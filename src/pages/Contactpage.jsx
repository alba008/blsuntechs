// src/components/Contact.jsx
import React from "react";
import {
  Home,
  PanelsTopLeft,
  FolderGit2,
  Mail,
  Sparkles,
  Linkedin,
  Github,
  Twitter,
  ArrowRight,
  Mail as MailIcon,
  Phone,
  MapPin,
} from "lucide-react";

export default function Contact({ onOpenStartProject }) {
  // Unified opener: use prop if available, otherwise broadcast a global event
  const handleStart = (label = "Contact") => {
    if (typeof onOpenStartProject === "function") {
      onOpenStartProject(label);
      return;
    }
    window.dispatchEvent(
      new CustomEvent("open-start-project", {
        detail: { presetService: label },
      })
    );
  };

  return (
    <footer id="contact" className="relative overflow-hidden bg-[#0a0a0b] text-white">
      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-[radial-gradient(1100px_420px_at_50%_-150px,rgba(245,222,179,0.12),transparent_55%)]" />
        <div className="absolute inset-0 bg-[conic-gradient(from_210deg_at_20%_30%,rgba(245,158,11,0.08),rgba(34,197,94,0.08),rgba(99,102,241,0.08),transparent_70%)]" />
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl bg-amber-400/20" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full blur-3xl bg-emerald-500/16" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "18px 18px" }}
        />
      </div>

      {/* TOP CTA (hidden on mobile to save space for bottom bar) */}
      <section className="container-safe py-6 sm:py-10 hidden md:block">
        <div className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-[#f5deb3]/60 via-[#caa46c]/28 to-[#f5deb3]/60 shadow-[0_22px_80px_-28px_rgba(255,215,150,.35)]">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-7 lg:p-8">
            <span
              className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500"
              style={{
                background:
                  "radial-gradient(520px 200px at var(--mx,50%) var(--my,50%), rgba(255,215,150,0.10), transparent 55%)",
              }}
              aria-hidden
            />
            <div
              className="flex items-center justify-between gap-5"
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.parentElement?.style.setProperty("--mx", `${e.clientX - r.left}px`);
                e.currentTarget.parentElement?.style.setProperty("--my", `${e.clientY - r.top}px`);
              }}
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold leading-tight">
                  <span className="bg-gradient-to-r from-amber-200 via-amber-100 to-white bg-clip-text text-transparent">
                    Let’s build something great.
                  </span>
                </h2>
                <p className="text-white/75">
                  Web & apps, AI features, cloud, security, and automation—delivered fast and safely.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleStart("Contact (desktop)")}
                  className="relative group inline-flex items-center justify-center rounded-full px-5 py-2.5 font-semibold text-black
                             bg-gradient-to-b from-amber-300 via-amber-300 to-amber-400 hover:from-amber-200 hover:to-amber-300
                             shadow-[0_12px_28px_-12px_rgba(251,191,36,0.65)]
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
                >
                  <span className="relative z-10">Start a project</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                  <span className="pointer-events-none absolute inset-0 rounded-full overflow-hidden">
                    <span className="absolute -inset-y-6 -left-10 w-16 rotate-12 bg-white/55 blur-md opacity-0 group-hover:opacity-100 transition" />
                  </span>
                </button>
                <a
                  href="mailto:info@blsuntech.com?subject=Project%20Enquiry"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5
                             px-5 py-2.5 text-white hover:bg-white/10 backdrop-blur-md
                             shadow-[0_12px_28px_-16px_rgba(0,0,0,0.6)]"
                >
                  <MailIcon className="h-4 w-4" />
                  Email us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER GRID (hidden on very small screens to keep it clean) */}
      <section id="contact-details" className="container-safe pb-24 md:pb-10 hidden sm:block">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="text-xl font-bold">BlsunTech</div>
            <p className="text-white/70 mt-3 max-w-prose">
              Results-driven engineering for modern companies. We ship secure, scalable products—from MVP to production—across the US &amp; Africa.
            </p>

            {/* Social */}
            <div className="mt-5 flex items-center gap-3">
              <IconButton href="https://www.linkedin.com" label="LinkedIn"><Linkedin className="h-4 w-4" /></IconButton>
              <IconButton href="https://github.com" label="GitHub"><Github className="h-4 w-4" /></IconButton>
              <IconButton href="https://twitter.com" label="Twitter / X"><Twitter className="h-4 w-4" /></IconButton>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white/90 font-semibold">Contact</h3>
            <ul className="mt-3 space-y-2 text-white/80">
              <li className="flex items-start gap-2.5">
                <MailIcon className="mt-0.5 h-4 w-4 text-amber-300/90" />
                <div className="flex gap-1 flex-wrap">
                  <span className="text-white/55">Email:</span>
                  <a className="hover:underline" href="mailto:info@blsuntech.com">lilian@blsuntechdynamics.com</a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 text-amber-300/90" />
                <div className="flex gap-1 flex-wrap">
                  <span className="text-white/55">Phone:</span>
                  <a className="hover:underline" href="tel:+13153516254">+1 720-281-0748</a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 text-amber-300/90" />
                <div className="flex gap-1 flex-wrap">
                  <span className="text-white/55">Location:</span>
                  <span>New Jersey, USA</span>
                </div>
              </li>
              <li className="pt-2">
                <a
                  href="#services"
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-sm
                             hover:bg-white/12 backdrop-blur-md
                             shadow-[0_12px_28px_-16px_rgba(0,0,0,0.6)]"
                >
                  Our services
                  <ArrowRight className="h-4 w-4" />
                </a>
              </li>
            </ul>
          </div>

          {/* Quick links + estimate */}
          <div>
            <h3 className="text-white/90 font-semibold">Quick Links</h3>
            <ul className="mt-3 space-y-2 text-white/80">
              <li><a className="hover:underline" href="#projects">Projects</a></li>
              <li><a className="hover:underline" href="#services">Services</a></li>
              <li><a className="hover:underline" href="/admin/enquiries">Admin</a></li>
            </ul>

            <div className="mt-5">
              <div className="text-white/80 text-sm mb-2">Get a quick estimate</div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const email = e.currentTarget.elements.email.value;
                  window.location.href = `mailto:info@blsuntech.com?subject=Estimate%20request&body=My%20email:%20${encodeURIComponent(email)}`;
                }}
                className="flex gap-2"
              >
                <div className="rounded-lg p-[1px] bg-gradient-to-br from-[#f5deb3]/60 via-[#caa46c]/28 to-[#f5deb3]/60 shadow-[0_12px_28px_-16px_rgba(255,215,150,.35)] w-full">
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="you@company.com"
                    className="w-full rounded-[10px] border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-300/30 placeholder:text-white/50"
                  />
                </div>
                <button className="relative group shrink-0 rounded-lg bg-white text-black px-4 py-2 font-semibold hover:bg-slate-100 transition shadow-[0_12px_28px_-12px_rgba(255,255,255,.15)]">
                  <span className="relative z-10">Send</span>
                  <span className="pointer-events-none absolute inset-0 rounded-lg overflow-hidden">
                    <span className="absolute -inset-y-6 -left-10 w-12 rotate-12 bg-white/60 blur-md opacity-0 group-hover:opacity-100 transition" />
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* LEGAL BAR (visible everywhere) */}
      <div className="border-t border-white/10">
        <div className="container-safe py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-white/65">
          <div>© {new Date().getFullYear()} BlsunTech. All rights reserved.</div>
          <div className="hidden sm:flex items-center gap-4">
            <a href="/privacy" className="hover:text-white">Privacy</a>
            <a href="/terms" className="hover:text-white">Terms</a>
            <a href="mailto:info@blsuntech.com" className="hover:text-white">Support</a>
          </div>
        </div>
      </div>

      {/* --- MOBILE APP-STYLE BOTTOM BAR (ICONS ONLY) --- */}
      <MobileBottomBar onOpenStartProject={() => handleStart("Contact (mobile)")} />
    </footer>
  );
}

/* ---------- Small atoms ---------- */
function IconButton({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 ring-1 ring-transparent hover:ring-amber-300/20 transition shadow-[0_10px_24px_-14px_rgba(0,0,0,0.55)]"
    >
      <span className="text-white/85">{children}</span>
    </a>
  );
}

/* ---------- Mobile bottom nav ---------- */
function MobileBottomBar({ onOpenStartProject }) {
  return (
    <nav
      className="
        sm:hidden fixed bottom-0 inset-x-0 z-50
        p-2 pb-[calc(env(safe-area-inset-bottom)+0px)]
      "
      aria-label="Primary"
    >
      {/* Gradient frame */}
      <div className="rounded-2xl p-[1px] bg-gradient-to-br from-[#f5deb3]/06 via-[#caa46c]/28 to-[#f5deb3]/60 shadow-[0_-10px_40px_-16px_rgba(255,215,150,.35)]">
        {/* Glass bar */}
        <div
          className="
            grid grid-cols-5 gap-1 rounded-2xl
            border border-white/10 bg-white/5 backdrop-blur-xl
            px-2 py-2
          "
        >
          <IconOnly href="#home" label="Home"><Home className="h-5 w-5" /></IconOnly>
          <IconOnly href="#services" label="Services"><PanelsTopLeft className="h-5 w-5" /></IconOnly>

          {/* center action */}
          <button
            onClick={onOpenStartProject}
            aria-label="Start a project"
            className="
              -mt-6 mx-auto inline-flex items-center justify-center h-12 w-12 rounded-full
              text-black
              bg-gradient-to-b from-amber-300 via-amber-300 to-amber-400
              shadow-[0_12px_28px_-12px_rgba(251,191,36,0.65)]
              ring-2 ring-[#f5deb3]/60
              active:scale-95 transition
            "
          >
            <Sparkles className="h-5 w-5" />
          </button>

          <IconOnly href="#projects" label="Projects"><FolderGit2 className="h-5 w-5" /></IconOnly>
          <IconOnly href="#contact-details" label="Contact"><Mail className="h-5 w-5" /></IconOnly>
        </div>
      </div>
    </nav>
  );
}

function IconOnly({ href, label, children }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="
        mx-auto inline-flex h-10 w-10 items-center justify-center rounded-xl
        text-white/85 hover:text-white
        active:scale-95 transition
      "
    >
      {children}
      <span className="sr-only">{label}</span>
    </a>
  );
}

/* Helper: tailwind container width class (if you didn't add it globally)
   .container-safe { @apply max-w-7xl mx-auto px-6 sm:px-8; }
*/
