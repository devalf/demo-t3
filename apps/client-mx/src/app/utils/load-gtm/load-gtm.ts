export const loadGTM = () => {
  const GA_ID = 'G-5FLGZWGM0Y';

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  if (document.querySelector(`script[data-ga-id="${GA_ID}"]`)) {
    return;
  }

  const loader = document.createElement('script');

  loader.async = true;
  loader.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  loader.setAttribute('data-ga-id', GA_ID);

  document.head.appendChild(loader);

  const inline = document.createElement('script');

  inline.setAttribute('data-ga-id', GA_ID);
  inline.text = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_ID}');
  `;
  document.head.appendChild(inline);
};
