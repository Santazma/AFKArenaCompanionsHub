// Counterpart to public/404.html's redirect: restores the real path (encoded in
// the query string) before React Router boots. Kept as an external file — rather
// than an inline <script> — so the production Content-Security-Policy can use a
// strict `script-src 'self'` with no inline allowance or per-build hash.
;(function (l) {
  if (l.search[1] === '/') {
    var decoded = l.search
      .slice(1)
      .split('&')
      .map(function (s) {
        return s.replace(/~and~/g, '&')
      })
      .join('?')
    window.history.replaceState(null, '', l.pathname.slice(0, -1) + decoded + l.hash)
  }
})(window.location)
