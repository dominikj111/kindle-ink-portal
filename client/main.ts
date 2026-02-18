/**
 * Portal Ink — Client-side entry point.
 * ES3 target, callback-based XHR only. No Promises, no arrow functions at runtime.
 * Progressive enhancement: every link works without JS.
 */

(function () {
  /**
   * Send an XHR GET request, returning HTML as text via callback.
   */
  function ajaxGet(
    url: string,
    callback: (err: string | null, html: string | null) => void,
  ): void {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          callback(null, xhr.responseText);
        } else {
          callback('HTTP ' + xhr.status, null);
        }
      }
    };

    xhr.send(null);
  }

  /**
   * POST JSON to a URL via XHR.
   */
  function ajaxPost(
    url: string,
    data: Record<string, unknown>,
    callback: (err: string | null) => void,
  ): void {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          callback(null);
        } else {
          callback('HTTP ' + xhr.status);
        }
      }
    };

    xhr.send(JSON.stringify(data));
  }

  /**
   * Log a client-side error to the server.
   */
  function logError(message: string, url?: string, line?: number, col?: number): void {
    ajaxPost(
      '/api/log',
      { level: 'error', message: message, url: url, line: line, col: col },
      function () {
        // fire and forget
      },
    );
  }

  /**
   * Attach AJAX navigation to data-ajax links.
   * Uses event delegation on #page so it survives innerHTML swaps.
   * Swaps both #breadcrumbs and #file-browser from the AJAX response.
   */
  function bindAjaxLinks(): void {
    var page = document.getElementById('page');
    if (!page) return;

    // Use event delegation on the page container
    page.onclick = function (e: MouseEvent) {
      var target = e.target as HTMLElement | null;

      // Walk up to find the anchor
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }

      if (!target) return;

      var anchor = target as HTMLAnchorElement;
      if (!anchor.getAttribute('data-ajax')) return;

      e.preventDefault();

      var href = anchor.href;

      ajaxGet(href, function (err, html) {
        if (err || !html) {
          logError('AJAX navigation failed: ' + (err || 'empty response'), href);
          // Fall back to normal navigation
          window.location.href = href;
          return;
        }

        // Parse the response to extract breadcrumbs and file list
        var temp = document.createElement('div');
        temp.innerHTML = html;

        var newBreadcrumbs = temp.querySelector('#breadcrumbs');
        var oldBreadcrumbs = document.getElementById('breadcrumbs');
        if (newBreadcrumbs && oldBreadcrumbs) {
          oldBreadcrumbs.parentNode!.replaceChild(newBreadcrumbs, oldBreadcrumbs);
        }

        // The file list is everything after the nav
        var fileBrowser = document.getElementById('file-browser');
        if (fileBrowser) {
          // Remove the breadcrumbs nav from temp, rest is the file list
          if (newBreadcrumbs && newBreadcrumbs.parentNode) {
            newBreadcrumbs.parentNode.removeChild(newBreadcrumbs);
          }
          fileBrowser.innerHTML = temp.innerHTML;
        }

        // Update browser URL without reload
        if (window.history && window.history.pushState) {
          window.history.pushState(null, '', href);
        }

        // Scroll to top on navigation
        window.scrollTo(0, 0);
      });
    };
  }

  /**
   * Handle browser back/forward with popstate.
   */
  function bindPopState(): void {
    if (!window.history || !window.history.pushState) return;

    window.onpopstate = function () {
      ajaxGet(window.location.href, function (err, html) {
        if (err || !html) {
          window.location.reload();
          return;
        }

        var temp = document.createElement('div');
        temp.innerHTML = html;

        var newBreadcrumbs = temp.querySelector('#breadcrumbs');
        var oldBreadcrumbs = document.getElementById('breadcrumbs');
        if (newBreadcrumbs && oldBreadcrumbs) {
          oldBreadcrumbs.parentNode!.replaceChild(newBreadcrumbs, oldBreadcrumbs);
        }

        var fileBrowser = document.getElementById('file-browser');
        if (fileBrowser) {
          if (newBreadcrumbs && newBreadcrumbs.parentNode) {
            newBreadcrumbs.parentNode.removeChild(newBreadcrumbs);
          }
          fileBrowser.innerHTML = temp.innerHTML;
        }
      });
    };
  }

  /**
   * Global error handler — sends client errors to server.
   */
  window.onerror = function (message, url, line, col) {
    logError(String(message), url as string | undefined, line, col);
  };

  // --- Initialize ---
  bindAjaxLinks();
  bindPopState();
})();
