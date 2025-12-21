// src/components/NavLinks.jsx
import React from "react";
import { Link } from "react-router-dom";

/**
 * Single source of truth for nav links
 * - Use "#about" anchors for homepage sections
 * - Use "/about" routes if you later create standalone pages
 */
const NAV_LINKS = [
  { href: "#about", label: "About", type: "anchor" },
  { href: "#projects", label: "Work", type: "anchor" },
  { href: "#contact", label: "Contact", type: "anchor" },
];

function isAnchor(href) {
  return typeof href === "string" && href.startsWith("#");
}

export default function NavLinks({ onClick }) {
  const base =
    "px-3 py-2 rounded-md text-sm md:text-[15px] " +
    "text-amber-100/85 hover:text-amber-50 " +
    "hover:bg-amber-300/10 transition " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60";

  return (
    <>
      {NAV_LINKS.map((l) => {
        if (isAnchor(l.href)) {
          return (
            <a key={l.href} href={l.href} onClick={onClick} className={base}>
              {l.label}
            </a>
          );
        }

        return (
          <Link key={l.href} to={l.href} onClick={onClick} className={base}>
            {l.label}
          </Link>
        );
      })}
    </>
  );
}
