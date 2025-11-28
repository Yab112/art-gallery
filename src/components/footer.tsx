import { Link } from "react-router-dom";
import {
  Instagram,
  Twitter,
  Facebook,
  Mail,
  Phone,
  MapPin,
  Palette,
  Brush,
  Camera,
} from "lucide-react";
import { useState } from "react";

function Logo() {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <span className="text-2xl font-bold text-red-500">artopia</span>
    );
  }

  return (
    <img 
      src="/mainlogo.png" 
      alt="Logo" 
      className="h-10 w-auto"
      onError={() => setImageError(true)}
    />
  );
}

const footerSections = [
  {
    title: "Discover Art",
    icon: Palette,
    links: [
      { label: "Browse Collections", href: "/buyart" },
      { label: "Featured Artists", href: "/artists" },
      { label: "New Arrivals", href: "/new-arrivals" },
      { label: "Curated Galleries", href: "/galleries" },
      { label: "Art Categories", href: "/categories" },
    ],
  },
  {
    title: "For Artists",
    icon: Brush,
    links: [
      { label: "Sell Your Art", href: "/sell-art" },
      { label: "Artist Resources", href: "/artist-resources" },
      { label: "Gallery Partnerships", href: "/gallery-partnerships" },
      { label: "Commission Work", href: "/commissions" },
      { label: "Artist Community", href: "/artist-community" },
    ],
  },
  {
    title: "Learn & Explore",
    icon: Camera,
    links: [
      { label: "Art Blog", href: "/blog" },
      { label: "Art History", href: "/art-history" },
      { label: "Collecting Guide", href: "/collecting-guide" },
      { label: "Art Investment", href: "/art-investment" },
      { label: "Exhibitions", href: "/exhibitions" },
    ],
  },
];

const socialLinks = [
  {
    name: "Instagram",
    icon: Instagram,
    href: "https://instagram.com/artopia",
  },
  { name: "Twitter", icon: Twitter, href: "https://twitter.com/artopia" },
  { name: "Facebook", icon: Facebook, href: "https://facebook.com/artopia" },
];

const contactInfo = [
  { icon: Mail, text: "hello@artopia.com" },
  { icon: Phone, text: "+1 (555) 123-4567" },
  { icon: MapPin, text: "123 Art District, Creative City, NY 10001" },
];

export function Footer() {
  return (
    <footer className="bg-white text-gray-900">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <Logo />
              <p className="text-gray-600 text-sm leading-relaxed mt-3 mb-4">
                Your gateway to the world of contemporary art. Discover,
                collect, and connect with exceptional artworks and talented
                artists from around the globe.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              {contactInfo.map((contact, index) => {
                const Icon = contact.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <Icon className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <span className="truncate">{contact.text}</span>
                  </div>
                );
              })}
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-red-500 hover:text-white"
                    aria-label={social.name}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={index}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="h-4 w-4 text-red-500" />
                  <h3 className="text-sm font-semibold text-gray-900">
                    {section.title}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        to={link.href}
                        className="text-sm text-gray-600 transition-colors hover:text-gray-900 block"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
            <div className="text-center lg:text-left">
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                Stay Updated with Artopia
              </h3>
              <p className="text-sm text-gray-600">
                Get the latest art news, new artist features, and exclusive
                offers.
              </p>
            </div>
            <div className="flex w-full max-w-md gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
              <button className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/20">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col items-center justify-between gap-3 lg:flex-row">
            <div className="text-center lg:text-left">
              <p className="text-sm text-gray-600">
                © {new Date().getFullYear()} Artopia. All rights reserved. Making art accessible to
                everyone.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600">
              <Link
                to="/privacy"
                className="hover:text-gray-900 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-gray-900 transition-colors">
                Terms of Service
              </Link>
              <Link
                to="/cookies"
                className="hover:text-gray-900 transition-colors"
              >
                Cookie Policy
              </Link>
              <Link
                to="/accessibility"
                className="hover:text-gray-900 transition-colors"
              >
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
