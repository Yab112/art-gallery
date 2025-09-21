import { Link } from "react-router-dom";

const footerSections = [
  {
    title: "About us",
    links: [
      { label: "About", href: "/about" },
      { label: "Jobs", href: "/jobs" },
      { label: "Press", href: "/press" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Open Source", href: "/open-source" },
      { label: "Blog", href: "/blog" },
      { label: "The Art Genome Project", href: "/art-genome" },
    ],
  },
  {
    title: "Partnerships",
    links: [
      { label: "Artsy for Galleries", href: "/galleries" },
      { label: "Artsy for Museums", href: "/museums" },
      { label: "Artsy for Benefits", href: "/benefits" },
      { label: "Artsy for Fairs", href: "/fairs" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Visit our Help Center", href: "/help" },
      { label: "Buying on Artsy", href: "/buying-guide" },
    ],
    appLinks: [
      { label: "iOS App", href: "/ios" },
      { label: "Android App", href: "/android" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-gray-200 border-t py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="mb-4 font-semibold text-gray-900">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.href}
                      className="text-gray-600 transition-colors hover:text-gray-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                {section.appLinks && (
                  <>
                    <li className="pt-2">
                      <span className="font-medium text-gray-900">
                        Get the App
                      </span>
                    </li>
                    {section.appLinks.map((appLink, appIndex) => (
                      <li key={appIndex}>
                        <Link
                          to={appLink.href}
                          className="text-gray-600 transition-colors hover:text-gray-900"
                        >
                          {appLink.label}
                        </Link>
                      </li>
                    ))}
                  </>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
