export function NavLinkScript() {
  const html = `(function(){
  function update() {
    var path = location.pathname;
    document.querySelectorAll('[data-navlink-href]').forEach(function(link) {
      var href = link.getAttribute('data-navlink-href');
      var exact = link.hasAttribute('data-navlink-exact');
      var active = (exact || href === '/') ? path === href : (path === href || path.startsWith(href + '/'));
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  update();

  if (document.readyState === 'loading') {
    var observer = new MutationObserver(update);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    addEventListener('DOMContentLoaded', function() {
      update();
      observer.disconnect();
    }, { once: true });
  }
})()`;

  return (
    <script
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
