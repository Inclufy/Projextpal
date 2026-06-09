import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const Footer = () => {
  const { t } = useLanguage();

  const footerT = t.footer || {} as any;

  return (
    <footer className="bg-[hsl(220,40%,25%)] text-white py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <Link to="/landing" className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold">
                ProjeXt<span className="text-primary">Pal</span>
              </span>
            </Link>
            <p className="text-white/80 text-sm">
              {footerT.description || 'AI-Powered Project Management for Modern Teams'}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{footerT.product || 'Product'}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#home" className="text-white/80 hover:text-white transition-colors">
                  {t.nav?.home || 'Home'}
                </a>
              </li>
              <li>
                <a href="#features" className="text-white/80 hover:text-white transition-colors">
                  {t.nav?.features || 'Features'}
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-white/80 hover:text-white transition-colors">
                  {t.nav?.pricing || 'Pricing'}
                </a>
              </li>
              <li>
                <a href="#about" className="text-white/80 hover:text-white transition-colors">
                  {t.nav?.about || 'About'}
                </a>
              </li>
              <li>
                <a href="#contact" className="text-white/80 hover:text-white transition-colors">
                  {t.nav?.contact || 'Contact'}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{footerT.company || 'Company'}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <Link to="/privacy" className="text-white/80 hover:text-white transition-colors">
                  {footerT.privacy || 'Privacy Policy'}
                </Link>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  {footerT.terms || 'Terms'}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t.contact?.badge || 'Contact'}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-white/80">
                <Mail className="h-4 w-4 flex-shrink-0" />
                info@projextpal.com
              </li>
              <li className="flex items-center gap-2 text-white/80">
                <Phone className="h-4 w-4 flex-shrink-0" />
                +31 (0) 20 123 4567
              </li>
              <li className="flex items-center gap-2 text-white/80">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                Amsterdam, NL
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/60">
          &copy; 2026 ProjeXtPal. {footerT.rights || 'All rights reserved.'}
        </div>
      </div>
    </footer>
  );
};
