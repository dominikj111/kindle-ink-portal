/**
 * Portal Ink — JS Benchmark runner.
 * ES5-safe, no Promises. Each benchmark is a sync function returning elapsed ms.
 * Tests run sequentially with a small setTimeout gap so the DOM can repaint
 * between each one (important on e-ink — you can see progress as it runs).
 */

(function () {
  // --- Timing ---------------------------------------------------------------
  function now(): number {
    // Use performance.now() when available for sub-ms precision.
    if (typeof performance !== 'undefined' && performance.now) {
      return performance.now();
    }
    return Date.now();
  }

  // --- Anti-optimization sink -----------------------------------------------
  // Each benchmark writes its final computed value here. This global is read
  // back and shown in the DOM at the end, which forces the JS engine to
  // actually execute the computation (prevents dead-code elimination on old
  // WebKit / Kindle Silk where `void x` is not always sufficient).
  var SINK = 0;

  // --- Benchmark functions --------------------------------------------------
  // Each returns elapsed ms as a number and adds its output to SINK.

  /** 10 million mixed arithmetic ops. */
  function benchArithmetic(): number {
    var t = now();
    var x = 0;
    for (var i = 0; i < 10000000; i++) {
      x = (x + i * 3.14159) % 1000000;
    }
    SINK += x; // observable: engine must compute x
    return now() - t;
  }

  /** Sort a 10,000-item array 50 times. */
  function benchSort(): number {
    var t = now();
    var last = 0;
    for (var r = 0; r < 50; r++) {
      var arr: number[] = [];
      for (var i = 0; i < 10000; i++) {
        arr.push(Math.random() * 10000);
      }
      arr.sort(function (a, b) { return a - b; });
      last = arr[arr.length - 1]; // read final element to pin the sort
    }
    SINK += last;
    return now() - t;
  }

  /** Build a 50,000-character string via concatenation. */
  function benchString(): number {
    var t = now();
    var s = '';
    for (var i = 0; i < 50000; i++) {
      s += String.fromCharCode(97 + (i % 26)); // a-z cycling, not constant
    }
    SINK += s.length; // observable: engine must build the string
    return now() - t;
  }

  /** Create, read, and destroy 500 DOM nodes, 10 rounds. */
  function benchDOM(): number {
    var container = document.createElement('div');
    container.style.cssText = 'position:absolute;left:-9999px;top:-9999px';
    document.body.appendChild(container);
    var t = now();
    for (var r = 0; r < 10; r++) {
      for (var i = 0; i < 500; i++) {
        var el = document.createElement('div');
        el.className = 'bench-item';
        el.innerHTML = 'node ' + i;
        container.appendChild(el);
      }
      SINK += container.childNodes.length; // force read before clear
      container.innerHTML = '';
    }
    var elapsed = now() - t;
    document.body.removeChild(container);
    return elapsed;
  }

  /** JSON.stringify + JSON.parse on a 1,000-item array, 100 rounds. */
  function benchJSON(): number {
    var data: Array<{ id: number; name: string; value: number }> = [];
    for (var i = 0; i < 1000; i++) {
      data.push({ id: i, name: 'item' + i, value: Math.random() });
    }
    var t = now();
    var last: { id: number; name: string; value: number }[] = data;
    for (var r = 0; r < 100; r++) {
      last = JSON.parse(JSON.stringify(data)) as typeof data;
    }
    SINK += last.length; // observable: engine must run JSON ops
    return now() - t;
  }

  /** Run an email-like RegExp against 10,000 strings. */
  function benchRegExp(): number {
    var re = /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/;
    var strs: string[] = [];
    for (var i = 0; i < 10000; i++) {
      strs.push('user' + i + '@example.com');
    }
    var t = now();
    var hits = 0;
    for (var j = 0; j < strs.length; j++) {
      if (re.test(strs[j])) hits++;
    }
    SINK += hits; // observable: engine must run the regexp
    return now() - t;
  }

  // --- Test suite -----------------------------------------------------------
  var TESTS: Array<{ id: string; fn: () => number }> = [
    { id: 'bench-arithmetic', fn: benchArithmetic },
    { id: 'bench-sort',       fn: benchSort       },
    { id: 'bench-string',     fn: benchString      },
    { id: 'bench-dom',        fn: benchDOM         },
    { id: 'bench-json',       fn: benchJSON        },
    { id: 'bench-regexp',     fn: benchRegExp      },
  ];

  var results: number[] = [];

  function fmtMs(ms: number): string {
    if (ms < 1) return ms.toFixed(2) + 'ms';
    if (ms < 10) return ms.toFixed(1) + 'ms';
    return Math.round(ms) + 'ms';
  }

  // --- DOM helpers ----------------------------------------------------------
  function setCell(id: string, text: string): void {
    var el = document.getElementById(id);
    if (el) el.innerHTML = text;
  }

  function setStatus(msg: string): void {
    var el = document.getElementById('bench-status');
    if (el) el.innerHTML = msg;
  }

  // --- Sequential runner ----------------------------------------------------
  function runNext(idx: number): void {
    if (idx >= TESTS.length) {
      var total = 0;
      for (var i = 0; i < results.length; i++) {
        total += results[i];
      }
      setCell('total-device', fmtMs(total));
      setStatus('Done! Lower is better. Your total: <strong>' + fmtMs(total) + '</strong>');
      // Write SINK to a hidden element — this is what forces the engine to
      // actually compute all the benchmark values (makes them observable).
      var sinkEl = document.getElementById('bench-sink');
      if (sinkEl) sinkEl.innerHTML = String(SINK);
      SINK = 0; // reset for next run
      var btn = document.getElementById('btn-run-bench');
      if (btn) {
        btn.removeAttribute('disabled');
        btn.innerHTML = '[Run Again]';
      }
      return;
    }

    var test = TESTS[idx];
    setCell(test.id + '-device', 'Running...');
    setStatus('Running test ' + (idx + 1) + ' of ' + TESTS.length + '...');

    // Delay enough for the DOM repaint to happen before the blocking benchmark.
    window.setTimeout(function () {
      var ms = test.fn();
      results.push(ms);
      setCell(test.id + '-device', fmtMs(ms));
      // Short gap between tests so each result is visible before next starts.
      window.setTimeout(function () {
        runNext(idx + 1);
      }, 20);
    }, 60);
  }

  // --- Button ---------------------------------------------------------------
  var runBtn = document.getElementById('btn-run-bench');
  if (runBtn) {
    runBtn.onclick = function (e: Event) {
      e.preventDefault();
      results = [];
      for (var i = 0; i < TESTS.length; i++) {
        setCell(TESTS[i].id + '-device', '&mdash;');
      }
      setCell('total-device', '&mdash;');
      var btn = document.getElementById('btn-run-bench');
      if (btn) {
        btn.setAttribute('disabled', 'disabled');
        btn.innerHTML = '[Running...]';
      }
      runNext(0);
    };
  }
})();
