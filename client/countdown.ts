/**
 * Portal Ink — Simple Countdown Timer.
 * ES5-safe, callback-based, no Promises.
 */

(function () {
  // --- Helpers ---
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

  function pad2(n: number): string {
    return (n < 10 ? '0' : '') + n;
  }

  // --- State ---
  var setHours = 0;
  var setMinutes = 5;
  var setSeconds = 0;
  var secondsLeft = 0;
  var totalSeconds = 0;
  var timerInterval: number | null = null;
  var running = false;
  var done = false;

  // --- Rendering ---
  function formatHMS(secs: number): string {
    var h = Math.floor(secs / 3600);
    var m = Math.floor((secs % 3600) / 60);
    var s = secs % 60;
    return pad2(h) + ':' + pad2(m) + ':' + pad2(s);
  }

  function renderDisplay(): void {
    var el = byId('cd-display');
    if (!el) return;

    if (done) {
      el.innerHTML = 'DONE';
      if (el.className.indexOf('cd-done') === -1) {
        el.className = el.className + ' cd-done';
      }
    } else {
      el.innerHTML = formatHMS(secondsLeft);
      el.className = el.className.replace(' cd-done', '');
    }
  }

  function renderSetter(): void {
    var h = byId('cd-hours');
    var m = byId('cd-minutes');
    var s = byId('cd-seconds');
    if (h) h.innerHTML = pad2(setHours);
    if (m) m.innerHTML = pad2(setMinutes);
    if (s) s.innerHTML = pad2(setSeconds);
  }

  function renderProgress(): void {
    var bar = byId('cd-progress-bar');
    var body = document.body;
    if (!bar) return;

    var elapsed = totalSeconds - secondsLeft;
    var pct = totalSeconds > 0 ? Math.round((elapsed / totalSeconds) * 100) : 0;
    bar.style.width = pct + '%';

    // Color stages: normal → warning (75%) → urgent (90%)
    body.className = body.className.replace(' cd-warning', '').replace(' cd-urgent', '');
    if (totalSeconds > 0) {
      var remaining = secondsLeft / totalSeconds;
      if (remaining <= 0.1) {
        body.className = body.className + ' cd-urgent';
      } else if (remaining <= 0.25) {
        body.className = body.className + ' cd-warning';
      }
    }
  }

  function renderLabel(): void {
    var el = byId('cd-label');
    if (!el) return;

    if (done) {
      el.innerHTML = 'Time is up!';
    } else if (running) {
      el.innerHTML = 'Counting down...';
    } else if (secondsLeft > 0) {
      el.innerHTML = 'Paused';
    } else {
      el.innerHTML = 'Set time and press Start';
    }
  }

  function renderAll(): void {
    renderDisplay();
    renderSetter();
    renderProgress();
    renderLabel();
  }

  // --- Timer ---
  function getSetTotal(): number {
    return (setHours * 3600) + (setMinutes * 60) + setSeconds;
  }

  function tick(): void {
    if (secondsLeft <= 0) {
      stopTimer();
      done = true;
      renderAll();
      flashDone();
      return;
    }
    secondsLeft--;
    renderDisplay();
    renderProgress();
  }

  function flashDone(): void {
    // Flash the display a few times for visibility on e-ink
    var el = byId('cd-display');
    if (!el) return;
    var count = 0;
    var flashInterval = window.setInterval(function () {
      count++;
      if (!el || count > 6) {
        window.clearInterval(flashInterval);
        if (el) el.style.visibility = 'visible';
        return;
      }
      el.style.visibility = (count % 2 === 0) ? 'visible' : 'hidden';
    }, 500);
  }

  function startTimer(): void {
    if (running) return;
    if (done) return;

    if (secondsLeft <= 0) {
      // Starting fresh from setter values
      totalSeconds = getSetTotal();
      secondsLeft = totalSeconds;
      if (totalSeconds <= 0) return;
    }

    running = true;
    done = false;
    noSleep.enable();
    renderLabel();
    timerInterval = window.setInterval(tick, 1000);
  }

  function stopTimer(): void {
    if (timerInterval !== null) {
      window.clearInterval(timerInterval);
      timerInterval = null;
    }
    running = false;
    noSleep.disable();
    renderLabel();
  }

  function resetTimer(): void {
    stopTimer(); // also calls noSleep.disable()
    done = false;
    secondsLeft = 0;
    totalSeconds = 0;

    // Clean color classes
    document.body.className = document.body.className
      .replace(' cd-warning', '')
      .replace(' cd-urgent', '');

    renderAll();
  }

  // --- Controls ---
  on('btn-cd-start', function () { startTimer(); });
  on('btn-cd-pause', function () { stopTimer(); });
  on('btn-cd-reset', function () { resetTimer(); });

  // --- Setter +/- ---
  function clamp(val: number, min: number, max: number): number {
    if (val < min) return min;
    if (val > max) return max;
    return val;
  }

  function adjustSetTime(field: string, delta: number): void {
    if (running) return;
    if (field === 'h') setHours = clamp(setHours + delta, 0, 23);
    if (field === 'm') setMinutes = clamp(setMinutes + delta, 0, 59);
    if (field === 's') setSeconds = clamp(setSeconds + delta, 0, 59);

    // Update display to match setter when not running
    if (secondsLeft <= 0 && !done) {
      totalSeconds = getSetTotal();
      secondsLeft = totalSeconds;
      renderDisplay();
      renderProgress();
    }
    renderSetter();
  }

  on('btn-h-up', function () { adjustSetTime('h', 1); });
  on('btn-h-down', function () { adjustSetTime('h', -1); });
  on('btn-m-up', function () { adjustSetTime('m', 5); });
  on('btn-m-down', function () { adjustSetTime('m', -5); });
  on('btn-s-up', function () { adjustSetTime('s', 15); });
  on('btn-s-down', function () { adjustSetTime('s', -15); });

  // --- Presets ---
  var presets = document.getElementById('cd-presets');
  if (presets) {
    presets.onclick = function (e: MouseEvent) {
      var target = e.target as HTMLElement | null;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }
      if (!target) return;

      var val = target.getAttribute('data-preset');
      if (!val) return;

      e.preventDefault();

      if (running) return;

      var total = parseInt(val, 10);
      if (isNaN(total) || total <= 0) return;

      setHours = Math.floor(total / 3600);
      setMinutes = Math.floor((total % 3600) / 60);
      setSeconds = total % 60;
      totalSeconds = total;
      secondsLeft = total;
      done = false;

      renderAll();
    };
  }

  // --- No-Sleep (silent looping audio keeps screen awake) ---
  // Classic nosleep.js technique: loop a tiny silent audio clip so the
  // Kindle OS treats the page as "playing media" and delays auto-sleep.
  var noSleep = (function () {
    // Minimal silent WAV: RIFF header + fmt chunk + 0-byte data chunk
    var SILENT_WAV =
      'data:audio/wav;base64,' +
      'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
    var audio: HTMLAudioElement | null = null;

    return {
      enable: function () {
        if (!audio) {
          audio = document.createElement('audio');
          audio.setAttribute('loop', 'loop');
          audio.setAttribute('muted', 'muted');
          audio.src = SILENT_WAV;
          audio.style.cssText = 'position:absolute;width:0;height:0;opacity:0';
          document.body.appendChild(audio);
        }
        try { audio.play(); } catch (e) { /* ignore */ }
      },
      disable: function () {
        if (audio) { audio.pause(); }
      }
    };
  })();

  // --- Body class for layout ---
  var body = document.body;
  if (body.className.indexOf('countdown-page') === -1) {
    body.className = body.className + ' countdown-page';
  }

  // --- Init ---
  totalSeconds = getSetTotal();
  secondsLeft = totalSeconds;
  renderAll();
})();
