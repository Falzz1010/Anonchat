import React from 'react';
import { Heart, Github, Twitter } from 'lucide-react';

interface FooterProps {
  darkMode: boolean;
}

function Footer({ darkMode }: FooterProps) {
  return (
    <footer className={`mt-16 py-8 ${darkMode ? 'text-white' : 'text-black'}`}>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 brutal-card ${
        darkMode ? 'bg-[#2a2a2a]' : 'bg-white'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold mb-4">Tentang Chat Anonim</h3>
            <p className="opacity-70 leading-relaxed">
              Ruang aman untuk percakapan anonim. Ekspresikan dirimu dengan bebas sambil menjaga privasi dan terhubung dengan yang lain.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold mb-4">Tautan Cepat</h3>
            <ul className="space-y-3">
              {['Panduan', 'Kebijakan Privasi', 'Ketentuan Penggunaan', 'Laporkan Masalah'].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className={`hover:text-[#ff5757] transition-colors duration-200 flex items-center gap-2 group`}
                  >
                    <span className="w-1.5 h-1.5 bg-[#ff5757] rounded-full group-hover:scale-150 transition-transform"></span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold mb-4">Hubungi Kami</h3>
            <div className="flex justify-center md:justify-start gap-4">
              <a
                href="#"
                className="brutal-button p-3 hover:text-[#ff5757] transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="brutal-button p-3 hover:text-[#ff5757] transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t-4 border-black dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="flex items-center gap-2 font-medium">
            Dibuat dengan <Heart className="w-4 h-4 text-[#ff5757] animate-pulse" /> oleh Tim Chat Anonim
          </p>
          <p className="opacity-70 text-sm">
            © {new Date().getFullYear()} Chat Anonim. Hak cipta dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;