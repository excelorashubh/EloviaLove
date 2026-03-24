import { useEffect, useRef, useState } from 'react';

const isProduction = typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1';

/**
 * Base ad unit with lazy loading via IntersectionObserver.
 * Only renders on production (not localhost).
 */
const AdUnit = ({ slot, format = 'auto', style = {}, className = '' }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const pushed = useRef(false);

  useEffect(() => {
    if (!isProduction) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin: '200px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (e) { /* ignore */ }
  }, [visible]);

  if (!isProduction) return null;

  return (
    <div ref={ref} className={className}>
      {visible && (
        <ins
          className="adsbygoogle"
          style={{ display: 'block', ...style }}
          data-ad-client={import.meta.env.VITE_ADSENSE_CLIENT_ID}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      )}
    </div>
  );
};

export default AdUnit;
