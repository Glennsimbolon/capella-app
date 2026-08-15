import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-slate-800 text-slate-400 py-6 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          © 2026 PT Capella Multidana — Aplikasi Pengajuan Kredit Digital
        </p>
        <p className="text-xs mt-1 text-slate-500">
          Versi 1.0.0 | Dibangun dengan React + Tailwind CSS
        </p>
      </div>
    </footer>
  );
};

export default Footer;