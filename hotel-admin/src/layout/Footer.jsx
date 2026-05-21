import React from 'react';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-200 bg-white px-8 py-4 shrink-0 shadow-inner">
      <div className="flex-between flex-wrap gap-2 text-xs text-slate-400 font-medium">
        <span>&copy; {year} Hotel Operations Administrator Portal. Confidential.</span>
        <span>
          Maintained by{' '}
          <a
            href="https://blackcube.ae/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-slate-600 hover:text-accent hover:underline transition-colors"
          >
            BlackCube Solutions LLC
          </a>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
