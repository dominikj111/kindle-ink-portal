/**
 * Portal Ink — Refresh demo interactions.
 * All ES5-safe, no Promises.
 */

(function () {
  // --- Helper ---
  function byId(id: string): HTMLElement | null {
    return document.getElementById(id);
  }

  function on(id: string, handler: (e: Event) => void): void {
    var el = byId(id);
    if (el) {
      el.onclick = function (e: Event) {
        e.preventDefault();
        handler(e);
      };
    }
  }

  // --- Test 1: Counter ---
  var counter = 0;

  function updateCounter(): void {
    var el = byId('demo-counter');
    if (el) el.innerHTML = String(counter);
  }

  on('btn-increment', function () { counter++; updateCounter(); });
  on('btn-decrement', function () { counter--; updateCounter(); });
  on('btn-reset', function () { counter = 0; updateCounter(); });

  // --- Test 2: Row swap ---
  var swapState = false;
  var rowA = '<td>Beta</td><td style="text-align:right">200</td>';
  var rowB = '<td>CHANGED</td><td style="text-align:right">999</td>';

  on('btn-swap-row', function () {
    var row = byId('demo-swap-row');
    if (row) {
      swapState = !swapState;
      row.innerHTML = swapState ? rowB : rowA;
    }
  });

  // --- Test 3: Toggle block ---
  on('btn-toggle', function () {
    var block = byId('demo-toggle-block');
    if (block) {
      block.style.display = block.style.display === 'none' ? 'block' : 'none';
    }
  });

  // --- Test 4: Pagination ---
  var pages: string[][] = [
    [
      '<tr><td>file-001.txt</td><td style="text-align:right">1.2 KB</td><td style="text-align:right">2026-01-01</td></tr>',
      '<tr><td>file-002.txt</td><td style="text-align:right">3.4 KB</td><td style="text-align:right">2026-01-02</td></tr>',
      '<tr><td>file-003.txt</td><td style="text-align:right">5.6 KB</td><td style="text-align:right">2026-01-03</td></tr>',
      '<tr><td>file-004.txt</td><td style="text-align:right">7.8 KB</td><td style="text-align:right">2026-01-04</td></tr>',
      '<tr><td>file-005.txt</td><td style="text-align:right">9.0 KB</td><td style="text-align:right">2026-01-05</td></tr>',
    ],
    [
      '<tr><td>report-A.pdf</td><td style="text-align:right">24 KB</td><td style="text-align:right">2026-02-10</td></tr>',
      '<tr><td>report-B.pdf</td><td style="text-align:right">18 KB</td><td style="text-align:right">2026-02-11</td></tr>',
      '<tr><td>report-C.pdf</td><td style="text-align:right">31 KB</td><td style="text-align:right">2026-02-12</td></tr>',
      '<tr><td>notes.md</td><td style="text-align:right">2.1 KB</td><td style="text-align:right">2026-02-13</td></tr>',
      '<tr><td>todo.txt</td><td style="text-align:right">512 B</td><td style="text-align:right">2026-02-14</td></tr>',
    ],
    [
      '<tr><td>photo-001.jpg</td><td style="text-align:right">1.8 MB</td><td style="text-align:right">2026-02-15</td></tr>',
      '<tr><td>photo-002.jpg</td><td style="text-align:right">2.3 MB</td><td style="text-align:right">2026-02-16</td></tr>',
      '<tr><td>backup.tar.gz</td><td style="text-align:right">48 MB</td><td style="text-align:right">2026-02-17</td></tr>',
      '<tr><td>config.yaml</td><td style="text-align:right">890 B</td><td style="text-align:right">2026-02-17</td></tr>',
      '<tr><td>README.md</td><td style="text-align:right">4.5 KB</td><td style="text-align:right">2026-02-18</td></tr>',
    ],
  ];
  var currentPage = 0;

  function renderPage(): void {
    var tbody = byId('demo-page-tbody');
    var info = byId('demo-page-info');
    if (tbody) {
      tbody.innerHTML = pages[currentPage].join('');
    }
    if (info) {
      info.textContent = 'Page ' + (currentPage + 1) + ' of ' + pages.length;
    }
  }

  on('btn-prev-page', function () {
    if (currentPage > 0) {
      currentPage--;
      renderPage();
    }
  });

  on('btn-next-page', function () {
    if (currentPage < pages.length - 1) {
      currentPage++;
      renderPage();
    }
  });

  // --- Test 5: Invert ---
  var inverted = false;

  on('btn-invert', function () {
    inverted = !inverted;
    if (inverted) {
      document.body.style.backgroundColor = '#000';
      document.body.style.color = '#fff';
    } else {
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    }
  });

  // --- Test 6: Clock ---
  var clockInterval: number | null = null;

  function updateClock(): void {
    var el = byId('demo-clock');
    if (el) {
      var now = new Date();
      var h = now.getHours();
      var m = now.getMinutes();
      var s = now.getSeconds();
      el.textContent =
        (h < 10 ? '0' : '') + h + ':' +
        (m < 10 ? '0' : '') + m + ':' +
        (s < 10 ? '0' : '') + s;
    }
  }

  on('btn-clock-start', function () {
    if (clockInterval === null) {
      updateClock();
      clockInterval = window.setInterval(updateClock, 1000);
    }
  });

  on('btn-clock-stop', function () {
    if (clockInterval !== null) {
      window.clearInterval(clockInterval);
      clockInterval = null;
    }
  });
})();
