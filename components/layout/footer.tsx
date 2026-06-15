import Link from "next/link";
import { Bike, Twitter, Instagram, Facebook, Linkedin, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
    { label: "Press", href: "/press" },
    { label: "Partners", href: "/partners" },
  ],
  services: [
    { label: "Food Delivery", href: "/restaurants" },
    { label: "Grocery Delivery", href: "/grocery" },
    { label: "Parcel Delivery", href: "/parcel" },
    { label: "Personal Pickup", href: "/pickup" },
    { label: "Scheduled Delivery", href: "/schedule" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "FAQ", href: "/#faq" },
    { label: "Contact Us", href: "/contact" },
    { label: "Live Chat", href: "/support" },
    { label: "Report an Issue", href: "/support/report" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Refund Policy", href: "/refunds" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Bike className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-white font-bold text-xl">
                  Student<span className="text-primary">Express</span>
                </span>
                <p className="text-xs text-gray-500">Georgia</p>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              The #1 delivery platform built for students in Georgia. Order food,
              groceries, and parcels — all in one place.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Mail className="w-4 h-4 text-primary" />
                <span>support@studentexpress.ge</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Phone className="w-4 h-4 text-primary" />
                <span>+995 555 123 456</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Tbilisi, Georgia</span>
              </div>
            </div>

            {/* Social */}
            <div className="flex gap-3 mt-6">
              {[
                { Icon: Twitter, href: "#", label: "Twitter" },
                { Icon: Instagram, href: "#", label: "Instagram" },
                { Icon: Facebook, href: "#", label: "Facebook" },
                { Icon: Linkedin, href: "#", label: "LinkedIn" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 bg-gray-800 hover:bg-primary rounded-lg flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { title: "Company", links: footerLinks.company },
            { title: "Services", links: footerLinks.services },
            { title: "Support", links: footerLinks.support },
            { title: "Legal", links: footerLinks.legal },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* App Download */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex gap-3">
            <a
              href="#"
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2.5 rounded-xl transition-colors border border-gray-700"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <div className="text-left">
                <div className="text-[10px] text-gray-400">Download on the</div>
                <div className="text-xs font-semibold text-white">App Store</div>
              </div>
            </a>
            <a
              href="#"
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2.5 rounded-xl transition-colors border border-gray-700"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                <path d="M3.18 23.76c.33.18.7.24 1.06.18l12.14-12.14L13.06 8.5 3.18 23.76zm15.45-10.2L5.29.4C4.96.22 4.6.16 4.25.2l11.32 11.32 3.06-1.96zM1.26 1.08C1.1 1.37 1 1.71 1 2.09v19.82c0 .38.1.72.26 1.01l.09.09 11.1-11.1v-.26L1.35.99l-.09.09zm20.47 9.25l-2.88-1.77-3.24 3.24 3.24 3.24 2.9-1.78c.83-.51.83-1.42-.02-1.93z" />
              </svg>
              <div className="text-left">
                <div className="text-[10px] text-gray-400">Get it on</div>
                <div className="text-xs font-semibold text-white">Google Play</div>
              </div>
            </a>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} StudentExpress Georgia. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
