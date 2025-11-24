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
      <span className="text-2xl font-bold text-gray-900 block mb-4">ARTOPIA</span>
    );
  }

  return (
    <img 
      src="/mainlogo.png" 
      alt="Logo" 
      className="h-12 w-auto mb-4"
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
    href: "https://instagram.com/artalistic",
  },
  { name: "Twitter", icon: Twitter, href: "https://twitter.com/artalistic" },
  { name: "Facebook", icon: Facebook, href: "https://facebook.com/artalistic" },
];

const contactInfo = [
  { icon: Mail, text: "hello@artalistic.com" },
  { icon: Phone, text: "+1 (555) 123-4567" },
  { icon: MapPin, text: "123 Art District, Creative City, NY 10001" },
];

export function Footer() {
  return (
    <footer className="bg-white text-gray-900">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-red-500 mb-4">
                artalistic
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Your gateway to the world of contemporary art. Discover,
                collect, and connect with exceptional artworks and talented
                artists from around the globe.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 mb-8">
              {contactInfo.map((contact, index) => {
                const Icon = contact.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-gray-600"
                  >
                    <Icon className="h-5 w-5 text-red-500" />
                    <span>{contact.text}</span>
                  </div>
                );
              })}
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600 transition-colors hover:bg-red-500 hover:text-white"
                  >
                    <Icon className="h-5 w-5" />
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
                <div className="flex items-center gap-2 mb-6">
                  <Icon className="h-5 w-5 text-red-500" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {section.title}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        to={link.href}
                        className="text-gray-600 transition-colors hover:text-gray-900 block"
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
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
            <div className="text-center lg:text-left">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Stay Updated with Artalistic
              </h3>
              <p className="text-gray-600">
                Get the latest art news, new artist features, and exclusive
                offers.
              </p>
            </div>
            <div className="flex w-full max-w-md gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
              <button className="rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/20">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
            <div className="text-center lg:text-left">
              <p className="text-gray-600">
                © 2024 Artalistic. All rights reserved. Making art accessible to
                everyone.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <Link
                to="/privacy"
                className="hover:text-gray-900 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
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
