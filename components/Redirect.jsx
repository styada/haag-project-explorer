'use client';

// The old team-matching pages were redirect stubs: a meta refresh plus
// window.location.replace(). Both are preserved here (React hoists the
// <meta> tag into <head>).
import { useEffect } from 'react';

export default function Redirect({ to }) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);
  return <meta httpEquiv="refresh" content={`0; url=${to}`} />;
}
