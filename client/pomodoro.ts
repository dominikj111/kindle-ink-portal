/**
 * Portal Ink — Pomodoro Timer.
 * ES5-safe, callback-based, no Promises.
 * Cycles: WORK → BREAK → WORK → BREAK → WORK → BREAK → WORK → LONG BREAK → repeat
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

  // --- State ---
  var workMin = 25;
  var breakMin = 5;
  var longBreakMin = 15;
  var sessionsPerRound = 4;

  var currentSession = 1;    // 1-based, up to sessionsPerRound
  var isWorking = true;       // true = work, false = break
  var secondsLeft = workMin * 60;
  var totalSeconds = workMin * 60;
  var timerInterval: number | null = null;
  var running = false;
  var completedSessions = 0;

  // --- Rendering ---
  function pad2(n: number): string {
    return (n < 10 ? '0' : '') + n;
  }

  function formatTime(secs: number): string {
    var m = Math.floor(secs / 60);
    var s = secs % 60;
    return pad2(m) + ':' + pad2(s);
  }

  function renderCountdown(): void {
    var el = byId('pom-countdown');
    if (el) el.innerHTML = formatTime(secondsLeft);
  }

  function renderMode(): void {
    var el = byId('pom-mode');
    if (!el) return;

    if (isWorking) {
      el.innerHTML = 'WORK';
    } else if (currentSession >= sessionsPerRound) {
      el.innerHTML = 'LONG BREAK';
    } else {
      el.innerHTML = 'BREAK';
    }

    // Toggle body class for color theme progress bar
    var body = document.body;
    if (isWorking) {
      body.className = body.className.replace(' pom-break', '');
    } else {
      if (body.className.indexOf('pom-break') === -1) {
        body.className = body.className + ' pom-break';
      }
    }
  }

  function renderSessionInfo(): void {
    var el = byId('pom-session-info');
    if (el) el.innerHTML = 'Session ' + currentSession + ' of ' + sessionsPerRound;
  }

  function renderDots(): void {
    var el = byId('pom-dots');
    if (!el) return;

    var html = '';
    for (var i = 0; i < sessionsPerRound; i++) {
      if (i < completedSessions) {
        html += '<span class="dot-done">&#x25A0;</span> ';
      } else {
        html += '<span class="dot-empty">&#x25A1;</span> ';
      }
    }
    el.innerHTML = html;
  }

  function renderProgress(): void {
    var bar = byId('pom-progress-bar');
    if (!bar) return;

    var elapsed = totalSeconds - secondsLeft;
    var pct = totalSeconds > 0 ? Math.round((elapsed / totalSeconds) * 100) : 0;
    bar.style.width = pct + '%';
  }

  function renderSettings(): void {
    var w = byId('pom-work-val');
    var b = byId('pom-break-val');
    var l = byId('pom-long-val');
    if (w) w.innerHTML = String(workMin);
    if (b) b.innerHTML = String(breakMin);
    if (l) l.innerHTML = String(longBreakMin);
  }

  function renderAll(): void {
    renderCountdown();
    renderMode();
    renderSessionInfo();
    renderDots();
    renderProgress();
    renderSettings();
  }

  // --- Timer logic ---
  function tick(): void {
    if (secondsLeft <= 0) {
      onPhaseComplete();
      return;
    }
    secondsLeft--;
    renderCountdown();
    renderProgress();
  }

  function onPhaseComplete(): void {
    stopTimer();

    if (isWorking) {
      // Work phase done — mark session complete
      completedSessions++;
      renderDots();

      if (completedSessions >= sessionsPerRound) {
        // Long break
        isWorking = false;
        totalSeconds = longBreakMin * 60;
        secondsLeft = totalSeconds;
      } else {
        // Short break
        isWorking = false;
        totalSeconds = breakMin * 60;
        secondsLeft = totalSeconds;
      }
    } else {
      // Break done — next work session
      isWorking = true;

      if (completedSessions >= sessionsPerRound) {
        // Full round done, reset
        completedSessions = 0;
        currentSession = 1;
      } else {
        currentSession = completedSessions + 1;
      }

      totalSeconds = workMin * 60;
      secondsLeft = totalSeconds;
    }

    renderAll();

    // Auto-start next phase
    startTimer();
  }

  function startTimer(): void {
    if (running) return;
    running = true;
    timerInterval = window.setInterval(tick, 1000);
  }

  function stopTimer(): void {
    if (timerInterval !== null) {
      window.clearInterval(timerInterval);
      timerInterval = null;
    }
    running = false;
  }

  function resetTimer(): void {
    stopTimer();
    isWorking = true;
    currentSession = 1;
    completedSessions = 0;
    totalSeconds = workMin * 60;
    secondsLeft = totalSeconds;
    renderAll();
  }

  function skipPhase(): void {
    stopTimer();
    secondsLeft = 0;
    onPhaseComplete();
  }

  // --- Controls ---
  on('btn-pom-start', function () { startTimer(); });
  on('btn-pom-pause', function () { stopTimer(); });
  on('btn-pom-reset', function () { resetTimer(); });
  on('btn-pom-skip', function () { skipPhase(); });

  // --- Settings ---
  function clamp(val: number, min: number, max: number): number {
    if (val < min) return min;
    if (val > max) return max;
    return val;
  }

  function updateWorkTime(delta: number): void {
    if (running) return;
    workMin = clamp(workMin + delta, 1, 90);
    if (isWorking) {
      totalSeconds = workMin * 60;
      secondsLeft = totalSeconds;
      renderCountdown();
      renderProgress();
    }
    renderSettings();
  }

  function updateBreakTime(delta: number): void {
    if (running) return;
    breakMin = clamp(breakMin + delta, 1, 30);
    if (!isWorking && completedSessions < sessionsPerRound) {
      totalSeconds = breakMin * 60;
      secondsLeft = totalSeconds;
      renderCountdown();
      renderProgress();
    }
    renderSettings();
  }

  function updateLongBreakTime(delta: number): void {
    if (running) return;
    longBreakMin = clamp(longBreakMin + delta, 1, 60);
    if (!isWorking && completedSessions >= sessionsPerRound) {
      totalSeconds = longBreakMin * 60;
      secondsLeft = totalSeconds;
      renderCountdown();
      renderProgress();
    }
    renderSettings();
  }

  on('btn-work-up', function () { updateWorkTime(5); });
  on('btn-work-down', function () { updateWorkTime(-5); });
  on('btn-break-up', function () { updateBreakTime(1); });
  on('btn-break-down', function () { updateBreakTime(-1); });
  on('btn-long-up', function () { updateLongBreakTime(5); });
  on('btn-long-down', function () { updateLongBreakTime(-5); });

  // --- Body class for landscape hint ---
  var body = document.body;
  if (body.className.indexOf('pomodoro-page') === -1) {
    body.className = body.className + ' pomodoro-page';
  }

  // --- Init ---
  renderAll();
})();
