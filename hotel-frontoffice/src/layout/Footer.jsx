import React from 'react';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-200 bg-white px-6 py-4">
      <div className="flex-between flex-wrap gap-2 text-sm text-text-muted">
        <span>&copy; {year} Hotel Front Office. All rights reserved.</span>
        <span>
          Designed &amp; Developed by{' '}
          <a
            href="https://blackcube.ae/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:underline transition-colors"
          >
            BlackCube Solutions LLC
          </a>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
