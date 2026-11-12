/* === MEDNERD Mandatory Auth Guard, Room Invite Preservation & Logout Bar === */
(function () {
  try {
    var urlParams = new URLSearchParams(window.location.search);
    var invitedRoom = urlParams.get("room");
    if (invitedRoom) {
      sessionStorage.setItem("mednerd_pending_room", invitedRoom.toUpperCase());
    }
    var auth = JSON.parse(localStorage.getItem("mednerd_auth_user") || "null");
    if (!auth || !auth.loggedIn || auth.guest === true || !auth.email) {
      window.location.replace("login.html");
      return;
    }
    window.addEventListener("DOMContentLoaded", function () {
      if (document.getElementById("mednerdAuthFloatingBar")) return;
      var bar = document.createElement("div");
      bar.id = "mednerdAuthFloatingBar";
      bar.style.cssText =
        "position:fixed;bottom:14px;left:14px;z-index:9999;display:flex;align-items:center;gap:8px;background:var(--white, #ffffff);color:var(--dark-text, #0f172a);padding:6px 12px;border-radius:999px;font-size:12px;font-family:Cairo,Inter,sans-serif;border:1.5px solid var(--petrol, #1A7398);box-shadow:0 8px 24px rgba(15,23,42,0.18);";
      var safeName = String(auth.name || auth.email || "").replace(/[<>]/g, "");
      bar.innerHTML =
        '<span style="font-weight:800;color:var(--petrol, #1A7398);">👤 ' +
        safeName +
        "</span>" +
        '<button type="button" onclick="localStorage.removeItem(\'mednerd_auth_user\');location.replace(\'login.html\');" style="background:#dc2626;color:#fff;border:none;border-radius:999px;padding:3px 10px;cursor:pointer;font-weight:800;font-size:11px;font-family:inherit;">خروج</button>';
      document.body.appendChild(bar);
    });
  } catch (e) {
    window.location.replace("login.html");
  }
})();

/* ============================================================================
   MEDNERD AI — ADVANCED EXTENSIONS SUITE v3.0 (SECOND FILE ONLY)
   100% Compatible with existing index.html & callGeminiAPI integration
   ============================================================================ */
(function () {
  'use strict';
  if (window.MEDNERD_EXT_LOADED) return;
  window.MEDNERD_EXT_LOADED = true;

  /* ==========================================================================
     0. حقن التنسيقات الموحدة (CSS) بهوية MEDNERD المعتمدة
     ========================================================================== */
  const styleEl = document.createElement('style');
  styleEl.id = 'mednerd-extension-styles';
  styleEl.textContent = `
    .mn-ext-badge-bar { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 16px; padding: 10px 14px; background: var(--bg-elevated); border: 1px solid var(--border-color); border-radius: 12px; font-size: 13px; }
    .mn-ext-pill { padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 12px; background: var(--petrol-soft); color: var(--petrol); border: 1px solid var(--border-color); display: inline-flex; align-items: center; gap: 5px; }
    .mn-ext-pill.green { background: var(--dark-green-soft); color: var(--dark-green); }
    .mn-ext-pill.mustard { background: var(--mustard-soft); color: var(--mustard); }
    .mn-ext-pill.danger { background: var(--danger-soft); color: var(--danger); }

    /* شريط الفئات الأكاديمية السريع */
    .mn-dept-filter-bar { display: flex; gap: 6px; flex-wrap: wrap; margin: 10px 0 14px; padding: 8px 10px; background: var(--bg-elevated); border: 1px solid var(--border-color); border-radius: 12px; align-items: center; }
    .mn-dept-chip { padding: 5px 11px; border-radius: 999px; font-size: 11.5px; font-weight: 800; border: 1px solid var(--border-color); background: var(--white); color: var(--dark-text); cursor: pointer; transition: all .18s ease; }
    .mn-dept-chip:hover, .mn-dept-chip.active { background: var(--petrol); color: #fff; border-color: var(--petrol); }

    /* 1. MindMap Studio */
    .mm-viewport { position: relative; width: 100%; height: 540px; background: radial-gradient(circle, var(--border-color) 1px, transparent 1px); background-size: 22px 22px; background-color: var(--bg-main); border: 1px solid var(--border-color); border-radius: 16px; overflow: hidden; cursor: grab; user-select: none; margin-top: 16px; touch-action: none; }
    .mm-viewport:active { cursor: grabbing; }
    .mm-floating-Controls { position: absolute; top: 12px; inset-inline-end: 12px; z-index: 10; display: flex; gap: 6px; flex-wrap: wrap; background: var(--white); padding: 6px; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); }
    .mm-legend { position: absolute; bottom: 12px; inset-inline-start: 12px; z-index: 10; display: flex; gap: 8px; flex-wrap: wrap; background: var(--white); padding: 6px 12px; border-radius: 10px; border: 1px solid var(--border-color); font-size: 12px; font-weight: 700; }
    .mm-legend-item { display: inline-flex; align-items: center; gap: 5px; }
    .mm-legend-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }

    /* 2. Collaborative Study Room */
    .csr-grid { display: grid; grid-template-columns: 1fr 1.25fr; gap: 18px; margin-top: 14px; }
    @media (max-width: 768px) { .csr-grid { grid-template-columns: 1fr; } }
    .csr-panel { background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 16px; padding: 18px; display: flex; flex-direction: column; gap: 12px; }
    .csr-timer-display { font-size: 52px; font-weight: 800; font-family: 'Inter', monospace; color: var(--petrol); text-align: center; letter-spacing: 2px; padding: 14px 0; background: var(--white); border-radius: 14px; border: 1px solid var(--border-color); }
    .csr-dropzone { border: 2px dashed var(--petrol); background: var(--petrol-soft); border-radius: 12px; padding: 18px; text-align: center; cursor: pointer; transition: all .2s; font-size: 13.5px; font-weight: 700; color: var(--petrol); }
    .csr-dropzone.dragover { background: var(--dark-green-soft); border-color: var(--dark-green); color: var(--dark-green); }
    .csr-dropzone.disabled { opacity: 0.45; cursor: not-allowed; border-color: var(--muted-text); color: var(--muted-text); }
    .csr-file-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--white); border: 1px solid var(--border-color); border-radius: 10px; font-size: 13px; }
    .csr-peer-list { display: flex; gap: 6px; flex-wrap: wrap; padding: 8px 10px; background: var(--white); border: 1px solid var(--border-color); border-radius: 10px; font-size: 12px; }
    .csr-peer-dot { width: 8px; height: 8px; border-radius: 50%; background: #16a34a; display: inline-block; }

    /* 3. Voice & Clinical Patient Simulation */
    .vp-orb-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; background: var(--bg-elevated); border-radius: 16px; border: 1px solid var(--border-color); margin-bottom: 14px; }
    .vp-mic-btn { width: 82px; height: 82px; border-radius: 50%; border: none; background: var(--petrol); color: #fff; font-size: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 25px rgba(14,116,144,.35); transition: all .25s; }
    .vp-mic-btn.listening { background: var(--danger); animation: vpPulse 1.2s infinite; }
    .vp-mic-btn.speaking { background: var(--dark-green); animation: vpPulse 1.5s infinite; }
    .vp-mic-btn.processing { background: var(--mustard); animation: vpPulse 1s infinite; }
    @keyframes vpPulse { 0% { box-shadow: 0 0 0 0 rgba(14,116,144,.55); transform: scale(1); } 70% { box-shadow: 0 0 0 20px rgba(14,116,144,0); transform: scale(1.06); } 100% { box-shadow: 0 0 0 0 rgba(14,116,144,0); transform: scale(1); } }
    .mn-voice-bar { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--white); border: 1px solid var(--border-color); border-radius: 12px; margin-bottom: 12px; font-size: 12.5px; }

    /* 4. Audio Transcriber */
    .at-recorder-box { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 16px; background: var(--bg-elevated); border: 1px solid var(--border-color); border-radius: 14px; margin-bottom: 16px; }
    .at-rec-dot { width: 12px; height: 12px; border-radius: 50%; background: var(--muted-text); display: inline-block; }
    .at-rec-dot.active { background: var(--danger); animation: vpPulse 1s infinite; }

    /* 5. Timed Clinical Exam Arena & MedExam */
    .tea-topbar { position: sticky; top: 0; z-index: 20; background: var(--white); border: 1px solid var(--border-color); border-radius: 14px; padding: 12px 18px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; box-shadow: var(--shadow-sm); }
    .tea-option { display: flex; align-items: flex-start; gap: 12px; padding: 13px 16px; border: 1.5px solid var(--border-color); border-radius: 12px; background: var(--white); cursor: pointer; transition: all .15s; margin-bottom: 10px; text-align: start; width: 100%; font-size: 15px; color: var(--dark-text); }
    .tea-option:hover { border-color: var(--petrol); background: var(--petrol-soft); }
    .tea-option.selected { border-color: var(--petrol); background: var(--petrol-soft); font-weight: 700; }
    .tea-option.correct { border-color: var(--dark-green); background: var(--dark-green-soft); }
    .tea-option.wrong { border-color: var(--danger); background: var(--danger-soft); }
    .tea-kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin: 16px 0; }
    .tea-kpi-card { background: var(--white); border: 1px solid var(--border-color); border-radius: 14px; padding: 16px; text-align: center; }
    .tea-kpi-val { font-size: 26px; font-weight: 800; color: var(--petrol); }
    .tea-bar-track { width: 100%; height: 10px; background: var(--bg-elevated); border-radius: 8px; overflow: hidden; margin-top: 6px; }
    .tea-bar-fill { height: 100%; background: var(--petrol); border-radius: 8px; transition: width .4s; }

    /* 6. FeynmanMed Engine */
    .fme-rubric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 18px; }
    .fme-score-card { background: var(--white); border: 1px solid var(--border-color); border-radius: 14px; padding: 16px; text-align: center; }
    .fme-ring { font-size: 30px; font-weight: 800; color: var(--petrol); margin: 6px 0; }

    /* 7. 3D Anatomy Atlas & Studio */
    .a3d-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
    .a3d-tab { padding: 9px 16px; border-radius: 12px; border: 1px solid var(--border-color); background: var(--bg-elevated); color: var(--dark-text); font-weight: 700; font-size: 13.5px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all .2s; }
    .a3d-tab.active, .a3d-tab:hover { background: var(--petrol); color: #fff; border-color: var(--petrol); }
    .a3d-organ-chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
    .a3d-chip { padding: 6px 13px; border-radius: 20px; border: 1px solid var(--border-color); background: var(--white); color: var(--dark-text); font-size: 13px; font-weight: 700; cursor: pointer; transition: all .15s; display: inline-flex; align-items: center; gap: 6px; }
    .a3d-chip.active, .a3d-chip:hover { border-color: var(--petrol); background: var(--petrol-soft); color: var(--petrol); }
    .a3d-stage { position: relative; width: 100%; height: 500px; background: #0f172a; border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; box-shadow: var(--shadow-md); }
    .a3d-stage iframe, .a3d-stage canvas, .a3d-stage model-viewer { width: 100%; height: 100%; border: none; display: block; }
    .a3d-results-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 12px; margin-top: 14px; max-height: 290px; overflow-y: auto; padding: 4px; }
    .a3d-model-card { background: var(--white); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; cursor: pointer; transition: all .2s; display: flex; flex-direction: column; }
    .a3d-model-card:hover { border-color: var(--petrol); transform: translateY(-2px); box-shadow: var(--shadow-sm); }
    .a3d-model-thumb { width: 100%; height: 110px; object-fit: cover; background: #1e293b; }
    .a3d-model-info { padding: 8px 10px; font-size: 12.5px; font-weight: 700; color: var(--dark-text); line-height: 1.4; }
    .a3d-overlay-controls { position: absolute; bottom: 12px; inset-inline-start: 12px; inset-inline-end: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; pointer-events: none; }
    .a3d-overlay-controls > * { pointer-events: auto; }

    /* 8. MedPlanner & MedProgress */
    .mp-cal-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 12px; margin-top: 14px; }
    .mp-day-card { background: var(--white); border: 1px solid var(--border-color); border-radius: 14px; padding: 14px; display: flex; flex-direction: column; gap: 8px; }
    .mp-day-card.today { border: 2px solid var(--petrol); box-shadow: 0 6px 20px rgba(14,116,144,0.12); }
    .mp-task-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 10px; border-radius: 10px; background: var(--bg-elevated); border: 1px solid var(--border-color); font-size: 13px; }
    .mp-task-row.done { opacity: 0.65; text-decoration: line-through; background: var(--dark-green-soft); }
    .mp-rec-card { padding: 12px 16px; border-radius: 12px; border-inline-start: 4px solid var(--mustard); background: var(--mustard-soft); margin-bottom: 10px; font-size: 13.5px; display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }

    /* 9. MedTutor Video Whiteboard Player */
    .mt-video-stage { background: #0f172a; color: #f8fafc; border-radius: 16px; border: 2px solid var(--petrol); overflow: hidden; margin-bottom: 18px; box-shadow: 0 16px 36px rgba(15,23,42,0.25); }
    .mt-canvas-wrap { position: relative; width: 100%; min-height: 340px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; background: radial-gradient(circle at 80% 20%, rgba(26,115,152,0.22), #0f172a 70%); }
    .mt-controls-bar { background: #1e293b; padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; border-top: 1px solid #334155; }
    .mt-step-dot { width: 10px; height: 10px; border-radius: 50%; background: #475569; cursor: pointer; transition: all .2s; }
    .mt-step-dot.active { width: 26px; border-radius: 10px; background: #22d3ee; }

    /* 10. MedFlash 3D Cards */
    .mf-card-stage { perspective: 1000px; width: 100%; max-width: 620px; height: 270px; margin: 18px auto; cursor: pointer; }
    .mf-card-inner { position: relative; width: 100%; height: 100%; text-align: center; transition: transform 0.55s; transform-style: preserve-3d; border-radius: 18px; box-shadow: var(--shadow-md); border: 2px solid var(--petrol); background: var(--white); }
    .mf-card-inner.flipped { transform: rotateY(180deg); }
    .mf-card-face { position: absolute; inset: 0; backface-visibility: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; border-radius: 18px; overflow-y: auto; }
    .mf-card-back { transform: rotateY(180deg); background: var(--petrol-soft); }

    /* 11. ECG Canvas & Clinical Grid */
    .ecg-paper-canvas { width: 100%; height: 210px; background-color: #fff5f5; background-image: linear-gradient(rgba(220,38,38,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(220,38,38,0.18) 1px, transparent 1px); background-size: 16px 16px; border: 1.5px solid #dc2626; border-radius: 12px; display: block; margin-bottom: 14px; }
    .mn-lab-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(175px, 1fr)); gap: 10px; margin: 12px 0; }
    .mn-lab-cell { background: var(--white); border: 1px solid var(--border-color); border-radius: 10px; padding: 10px 12px; }
  `;
  document.head.appendChild(styleEl);

  /* ==========================================================================
     1. محمّل الاعتماديات والمكتبات الموحد (MedDependencyLoader)
        يمنع التحميل المكرر، يدعم الـ CDN البديل، ويعمل بنظام Lazy Loading
     ========================================================================== */
  const MedDependencyLoader = {
    _cache: {},
    loadScript(key, urls, globalCheckFn, isModule = false) {
      if (typeof globalCheckFn === 'function' && globalCheckFn()) {
        return Promise.resolve(true);
      }
      if (this._cache[key]) return this._cache[key];

      const urlList = Array.isArray(urls) ? urls : [urls];
      this._cache[key] = new Promise((resolve, reject) => {
        let idx = 0;
        const tryNext = () => {
          if (typeof globalCheckFn === 'function' && globalCheckFn()) {
            resolve(true);
            return;
          }
          if (idx >= urlList.length) {
            delete this._cache[key];
            reject(new Error(LANG === 'en' ? `Failed to load library: ${key}` : `تعذر تحميل المكتبة البرمجية (${key}). تحقق من الاتصال.`));
            return;
          }
          const currentUrl = urlList[idx++];
          const existing = document.querySelector(`script[data-med-dep="${key}"][src="${currentUrl}"]`);
          if (existing) {
            setTimeout(() => {
              if (typeof globalCheckFn === 'function' && globalCheckFn()) resolve(true);
              else tryNext();
            }, 400);
            return;
          }
          const sc = document.createElement('script');
          sc.setAttribute('data-med-dep', key);
          if (isModule) sc.type = 'module';
          sc.src = currentUrl;
          let settled = false;
          const timer = setTimeout(() => {
            if (settled) return;
            settled = true;
            sc.remove();
            tryNext();
          }, 12000);

          sc.onload = () => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            resolve(true);
          };
          sc.onerror = () => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            sc.remove();
            tryNext();
          };
          document.head.appendChild(sc);
        };
        tryNext();
      });
      return this._cache[key];
    },

    ensurePeerJS() {
      return this.loadScript(
        'peerjs',
        [
          'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js',
          'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js'
        ],
        () => !!window.Peer
      );
    },

    ensureThreeJS() {
      return this.loadScript(
        'threejs',
        [
          'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
          'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js'
        ],
        () => !!window.THREE
      );
    },

    ensureModelViewer() {
      return this.loadScript(
        'model-viewer',
        [
          'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js'
        ],
        () => !!(window.customElements && window.customElements.get('model-viewer')),
        true
      );
    },

    async ensurePdfJS() {
      await this.loadScript(
        'pdfjs',
        [
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
          'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js'
        ],
        () => !!window.pdfjsLib
      );
      if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
      return window.pdfjsLib;
    },

    async extractTextFromPdfFile(file, maxPages = 25) {
      if (!file) return '';
      const pdfjsLib = await this.ensurePdfJS();
      const arrayBuf = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuf }).promise;
      const numPages = Math.min(pdf.numPages, maxPages);
      const pagesText = [];
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map(item => item.str || '').join(' ');
        if (strings.trim()) pagesText.push(`[Page ${i}]\n${strings.trim()}`);
      }
      return pagesText.join('\n\n');
    }
  };

  /* ==========================================================================
     2. مخزن بيانات وتقدم الطالب الفعلي (MedStorage)
        يغذي MedPlanner و MedProgress و MedFlash و MedExam ببيانات حقيقية 100%
     ========================================================================== */
  const MedStorage = {
    KEYS: {
      PLANNER: 'mednerd_planner_v3',
      FLASH_DECKS: 'mednerd_flash_decks_v3',
      EXAM_HISTORY: 'mednerd_exam_history_v3',
      STUDY_LOGS: 'mednerd_study_logs_v3',
      VOICE_PREFS: 'mednerd_voice_prefs_v3'
    },

    read(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (_) {
        return fallback;
      }
    },

    write(key, val) {
      try {
        localStorage.setItem(key, JSON.stringify(val));
      } catch (_) {}
    },

    recordExamAttempt(entry) {
      const list = this.read(this.KEYS.EXAM_HISTORY, []);
      list.unshift({
        id: 'ex_' + Date.now(),
        date: new Date().toISOString(),
        topic: entry.topic || 'General Medicine',
        sourceTool: entry.sourceTool || 'MedExam',
        total: Number(entry.total) || 1,
        correct: Number(entry.correct) || 0,
        scorePct: Math.round(((Number(entry.correct) || 0) / Math.max(1, Number(entry.total) || 1)) * 100),
        timeSec: Number(entry.timeSec) || 0,
        weakDomains: Array.isArray(entry.weakDomains) ? entry.weakDomains : []
      });
      this.write(this.KEYS.EXAM_HISTORY, list.slice(0, 100));
    },

    recordStudyMinutes(minutes, subject) {
      const logs = this.read(this.KEYS.STUDY_LOGS, []);
      logs.unshift({
        date: new Date().toISOString().slice(0, 10),
        minutes: Number(minutes) || 0,
        subject: subject || 'General'
      });
      this.write(this.KEYS.STUDY_LOGS, logs.slice(0, 200));
    },

    getAnalyticsSummary() {
      const planner = this.read(this.KEYS.PLANNER, { tasks: [], courses: [] });
      const tasks = Array.isArray(planner.tasks) ? planner.tasks : [];
      const completedTasks = tasks.filter(t => t.done);
      const pendingOverdue = tasks.filter(t => !t.done && t.date && t.date < new Date().toISOString().slice(0, 10));

      const exams = this.read(this.KEYS.EXAM_HISTORY, []);
      const totalExams = exams.length;
      const totalQ = exams.reduce((s, e) => s + (e.total || 0), 0);
      const totalCorrect = exams.reduce((s, e) => s + (e.correct || 0), 0);
      const avgExamScore = totalExams
        ? Math.round(exams.reduce((s, e) => s + (e.scorePct || 0), 0) / totalExams)
        : 0;
      const accuracyPct = totalQ ? Math.round((totalCorrect / totalQ) * 100) : 0;

      const weakMap = {};
      const strongSet = new Set();
      exams.forEach(ex => {
        if (ex.scorePct >= 80 && ex.topic) strongSet.add(ex.topic);
        if (ex.scorePct < 65 && ex.topic) weakMap[ex.topic] = (weakMap[ex.topic] || 0) + 1;
        (ex.weakDomains || []).forEach(w => {
          weakMap[w] = (weakMap[w] || 0) + 1;
        });
      });

      const cards = this.read(this.KEYS.FLASH_DECKS, []);
      const now = Date.now();
      const masteredCards = cards.filter(c => (c.repetitions || 0) >= 2 && (c.interval || 0) >= 6);
      const dueCards = cards.filter(c => !c.nextReview || c.nextReview <= now);
      const hardCards = cards.filter(c => c.difficultyFlag === 'hard' || (c.easeFactor && c.easeFactor < 2.0));

      const studyLogs = this.read(this.KEYS.STUDY_LOGS, []);
      const plannedMinutesDone = completedTasks.reduce((s, t) => s + (Number(t.durationMin) || 45), 0);
      const loggedMinutes = studyLogs.reduce((s, l) => s + (Number(l.minutes) || 0), 0);
      const totalStudyHours = Math.round(((plannedMinutesDone + loggedMinutes) / 60) * 10) / 10;

      return {
        tasksTotal: tasks.length,
        tasksCompleted: completedTasks.length,
        tasksOverdue: pendingOverdue,
        totalExams,
        avgExamScore,
        accuracyPct,
        totalCards: cards.length,
        masteredCardsCount: masteredCards.length,
        dueCardsCount: dueCards.length,
        hardCardsCount: hardCards.length,
        weakTopics: Object.keys(weakMap),
        strongTopics: Array.from(strongSet),
        totalStudyHours,
        examsList: exams
      };
    }
  };

  /* ==========================================================================
     3. محرك الصوت الطبي الذكي المطور (MedVoiceEngine)
        يدعم انتقاء أفضل صوت عربي/إنجليزي، تقسيم الجمل، منع الصدى، والتحكم الكامل
     ========================================================================== */
  const MedVoiceEngine = {
    state: {
      voices: [],
      selectedVoiceURI: '',
      lang: 'ar-SA',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      muted: false,
      speaking: false,
      lastSpokenText: '',
      queue: [],
      onStateChange: null
    },

    init() {
      const saved = MedStorage.read(MedStorage.KEYS.VOICE_PREFS, null);
      if (saved) {
        this.state.rate = Number(saved.rate) || 1.0;
        this.state.pitch = Number(saved.pitch) || 1.0;
        this.state.volume = saved.volume !== undefined ? Number(saved.volume) : 1.0;
        this.state.selectedVoiceURI = saved.selectedVoiceURI || '';
      }
      if (window.speechSynthesis) {
        const loadVoices = () => {
          this.state.voices = window.speechSynthesis.getVoices() || [];
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    },

    savePrefs() {
      MedStorage.write(MedStorage.KEYS.VOICE_PREFS, {
        rate: this.state.rate,
        pitch: this.state.pitch,
        volume: this.state.volume,
        selectedVoiceURI: this.state.selectedVoiceURI
      });
    },

    getBestVoicesForLang(langCode) {
      const all = (window.speechSynthesis && window.speechSynthesis.getVoices()) || this.state.voices || [];
      const prefix = String(langCode || 'ar').slice(0, 2).toLowerCase();
      const matching = all.filter(v => String(v.lang || '').toLowerCase().startsWith(prefix));
      const scoreVoice = v => {
        const n = (v.name || '').toLowerCase();
        let sc = 0;
        if (n.includes('natural') || n.includes('online')) sc += 50;
        if (n.includes('hamed') || n.includes('salma') || n.includes('zariyah') || n.includes('aria') || n.includes('guy')) sc += 40;
        if (n.includes('google') || n.includes('microsoft') || n.includes('siri') || n.includes('maged') || n.includes('tarik') || n.includes('samantha')) sc += 25;
        if (v.localService === false) sc += 10;
        return sc;
      };
      return matching.sort((a, b) => scoreVoice(b) - scoreVoice(a));
    },

    normalizeMedicalSpeech(rawText, langCode) {
      let txt = String(rawText || '')
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/[*_#`~>|]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const isAr = String(langCode || 'ar').toLowerCase().startsWith('ar');
      if (isAr) {
        txt = txt
          .replace(/\bBP\b/g, 'ضغط الدم')
          .replace(/\bHR\b/g, 'معدل النبض')
          .replace(/\bRR\b/g, 'معدل التنفس')
          .replace(/\bSpO2\b/gi, 'أكسجة الدم')
          .replace(/\bmmHg\b/gi, 'مليمتر زئبقي')
          .replace(/\bbpm\b/gi, 'نبضة في الدقيقة');
      }
      return txt;
    },

    splitIntoSentences(text) {
      const rawChunks = String(text || '').split(/(?<=[.!\?؟،؛\n])\s+/);
      const chunks = [];
      let current = '';
      rawChunks.forEach(part => {
        if ((current + ' ' + part).length <= 165) {
          current = current ? (current + ' ' + part) : part;
        } else {
          if (current) chunks.push(current.trim());
          current = part;
        }
      });
      if (current.trim()) chunks.push(current.trim());
      return chunks.length ? chunks : [text];
    },

    stop() {
      this.state.queue = [];
      this.state.speaking = false;
      if (window.speechSynthesis) {
        try { window.speechSynthesis.cancel(); } catch (_) {}
      }
      if (typeof this.state.onStateChange === 'function') {
        this.state.onStateChange('idle');
      }
    },

    speak(rawText, langOverride, onStartCb, onEndCb) {
      if (!window.speechSynthesis || this.state.muted) {
        if (typeof onEndCb === 'function') onEndCb();
        return;
      }
      const lang = langOverride || this.state.lang || (typeof LANG !== 'undefined' && LANG === 'en' ? 'en-US' : 'ar-SA');
      const cleaned = this.normalizeMedicalSpeech(rawText, lang);
      if (!cleaned) {
        if (typeof onEndCb === 'function') onEndCb();
        return;
      }

      this.stop();
      this.state.lastSpokenText = rawText;
      const sentences = this.splitIntoSentences(cleaned);
      this.state.queue = sentences.slice();

      const candidateVoices = this.getBestVoicesForLang(lang);
      const chosenVoice =
        candidateVoices.find(v => v.voiceURI === this.state.selectedVoiceURI) ||
        candidateVoices[0] ||
        null;

      this.state.speaking = true;
      if (typeof onStartCb === 'function') onStartCb();
      if (typeof this.state.onStateChange === 'function') this.state.onStateChange('speaking');

      const playNext = () => {
        if (!this.state.queue.length || this.state.muted) {
          this.state.speaking = false;
          if (typeof onEndCb === 'function') onEndCb();
          if (typeof this.state.onStateChange === 'function') this.state.onStateChange('idle');
          return;
        }
        const chunk = this.state.queue.shift();
        const utter = new SpeechSynthesisUtterance(chunk);
        utter.lang = chosenVoice ? chosenVoice.lang : lang;
        if (chosenVoice) utter.voice = chosenVoice;
        utter.rate = Math.min(Math.max(this.state.rate, 0.6), 1.6);
        utter.pitch = Math.min(Math.max(this.state.pitch, 0.6), 1.4);
        utter.volume = Math.min(Math.max(this.state.volume, 0), 1);

        utter.onend = () => playNext();
        utter.onerror = () => playNext();
        try {
          window.speechSynthesis.speak(utter);
        } catch (_) {
          this.state.speaking = false;
          if (typeof onEndCb === 'function') onEndCb();
        }
      };

      playNext();
    },

    replayLast(langOverride) {
      if (this.state.lastSpokenText) {
        this.speak(this.state.lastSpokenText, langOverride);
      }
    },

    testVoice(langOverride) {
      const lang = langOverride || this.state.lang || 'ar-SA';
      const sample = String(lang).startsWith('en')
        ? 'Hello Doctor, MEDNERD clinical voice engine is active and ready for simulation.'
        : 'مرحباً بك دكتور، نظام الصوت الطبي في منصة ميدنيرد جاهز ويعمل بوضوح.';
      this.speak(sample, lang);
    },

    renderVoiceControlToolbar(containerId, langCode) {
      const isEn = typeof LANG !== 'undefined' && LANG === 'en';
      const voices = this.getBestVoicesForLang(langCode || this.state.lang);
      const voiceOpts = voices.length
        ? voices.map(v => `<option value="${escapeHtml(v.voiceURI)}" ${v.voiceURI === this.state.selectedVoiceURI ? 'selected' : ''}>${escapeHtml(v.name)} (${escapeHtml(v.lang)})</option>`).join('')
        : `<option value="">${isEn ? 'System Default Voice' : 'الصوت الافتراضي للنظام'}</option>`;

      return `
        <div class="mn-voice-bar" id="${containerId}_bar">
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <i class="fa-solid fa-sliders" style="color:var(--petrol);"></i>
            <select class="form-select" style="width:auto;max-width:210px;padding:4px 8px;font-size:12px;" onchange="window.MEDNERD_EXT.MedVoiceEngine.setVoiceURI(this.value)">
              ${voiceOpts}
            </select>
            <label style="display:inline-flex;align-items:center;gap:4px;font-weight:700;">
              <span>${isEn ? 'Speed:' : 'السرعة:'}</span>
              <input type="range" min="0.75" max="1.35" step="0.05" value="${this.state.rate}" style="width:65px;" onchange="window.MEDNERD_EXT.MedVoiceEngine.setRate(this.value)">
            </label>
            <label style="display:inline-flex;align-items:center;gap:4px;font-weight:700;">
              <span>${isEn ? 'Pitch:' : 'الطبقة:'}</span>
              <input type="range" min="0.8" max="1.2" step="0.05" value="${this.state.pitch}" style="width:55px;" onchange="window.MEDNERD_EXT.MedVoiceEngine.setPitch(this.value)">
            </label>
          </div>
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
            <button type="button" class="btn-secondary" style="padding:4px 10px;font-size:11.5px;" onclick="window.MEDNERD_EXT.MedVoiceEngine.testVoice('${escapeHtml(langCode || 'ar-SA')}')">
              <i class="fa-solid fa-ear-listen"></i> ${isEn ? 'Test Voice' : 'اختبار الصوت'}
            </button>
            <button type="button" class="btn-secondary" style="padding:4px 10px;font-size:11.5px;" onclick="window.MEDNERD_EXT.MedVoiceEngine.replayLast('${escapeHtml(langCode || 'ar-SA')}')">
              <i class="fa-solid fa-rotate-right"></i> ${isEn ? 'Replay' : 'إعادة النطق'}
            </button>
            <button type="button" class="btn-secondary" style="padding:4px 10px;font-size:11.5px;border-color:var(--danger);color:var(--danger);" onclick="window.MEDNERD_EXT.MedVoiceEngine.stop()">
              <i class="fa-solid fa-stop"></i> ${isEn ? 'Stop' : 'إيقاف الصوت'}
            </button>
          </div>
        </div>
      `;
    },

    setVoiceURI(uri) { this.state.selectedVoiceURI = uri; this.savePrefs(); },
    setRate(r) { this.state.rate = parseFloat(r) || 1.0; this.savePrefs(); },
    setPitch(p) { this.state.pitch = parseFloat(p) || 1.0; this.savePrefs(); }
  };
  MedVoiceEngine.init();

  /* ==========================================================================
     4. القواميس والترجمة والأدوات المساعدة (17 أداة متقدمة)
     ========================================================================== */
  const EXT_EN_EXACT = {
    "خرائط ذهنية": "Mind Maps",
    "غرفة دراسة": "Study Room",
    "محاكاة صوتية": "Voice Sim",
    "تفريغ صوتي": "Transcriber",
    "امتحان موقّت": "Timed Arena",
    "تقييم فاينمان": "Feynman Eval",
    "أطلس 3D": "3D Atlas",
    "منظم الدراسة": "MedPlanner",
    "مدرس بالفيديو": "MedTutor",
    "منظومة امتحانات": "MedExam",
    "بطاقات ذكية": "MedFlash",
    "مدرب ECG": "ECG Tutor",
    "محلل ABG": "ABG Analyzer",
    "مفسر التحاليل": "Lab Interpreter",
    "تشخيص تفريقي": "Diff Diagnosis",
    "تداخلات دوائية": "Drug Checker",
    "متابعة التقدم": "MedProgress",
    "مختبر البحث": "Research Lab"
  };
  if (typeof EN_EXACT === 'object') Object.assign(EN_EXACT, EXT_EN_EXACT);

  const EXT_EN_TOOLS = {
    "mindmap_studio": {
      "d": "Interactive draggable & zoomable medical mind-map canvas generated from lectures/topics with expand/collapse, medical tag colors, and SVG/PNG export.",
      "l": ["Medical Topic or Lecture Text:", "Map Depth:", "Focus Angle:"],
      "p": ["Paste lecture notes or enter a clinical topic (e.g., Acute Coronary Syndrome)..."],
      "o": {
        "depth": ["Balanced (3 Levels)", "Deep & Detailed (4 Levels)"],
        "focus": ["Comprehensive (Pathophysiology + Clinical + Mgmt)", "Diagnostic & Differential Focus", "Pharmacology & Mechanisms"]
      },
      "ld": "Structuring interactive mind-map tree...",
      "v": "Please enter a medical topic or lecture text first.",
      "b": "Generate Interactive Mind Map"
    },
    "study_room": {
      "d": "Synchronized multi-user Pomodoro study room with WebRTC P2P + local tab sync, live participant list, chat, file hub, and Role-Based Access Control.",
      "l": ["Action Mode (Create or Join Room):", "Room Code (leave blank to auto-generate):", "Your Display Name:", "Your Role (RBAC):", "Pomodoro Focus / Break (min):"],
      "p": [null, "e.g., MED-STEP2-ROOM", "e.g., Dr. Ahmad"],
      "o": {
        "mode": ["Create New Room (Host)", "Join Existing Room by Code"],
        "role": ["Host (Full Timer, Chat & File Control)", "Editor (Chat & Upload Files)", "Viewer (Read-Only & Sync Timer)"],
        "cycle": ["25 / 5 (Classic Pomodoro)", "50 / 10 (Deep Clinical Block)", "15 / 3 (Rapid Sprint)"]
      },
      "b": "Launch / Join Collaborative Room"
    },
    "voice_patient": {
      "d": "Complete Clinical & Voice Patient Simulation: take history via voice/text, order labs & imaging, formulate DDx & management plan, and receive a 6-domain OSCE evaluation.",
      "l": ["Chief Complaint or Clinical Scenario:", "Patient Persona & Emotional Tone:", "Voice Recognition / TTS Language:"],
      "p": ["e.g., 58-year-old with crushing retrosternal chest pain radiating to left jaw"],
      "o": {
        "tone": ["Anxious & In Pain (Realistic)", "Calm & Cooperative", "Vague / Poor Historian (Challenging)"],
        "vlang": ["Arabic (ar-SA)", "English (en-US)"]
      },
      "w": "Uses browser Web Speech API & MedVoiceEngine. Automatic mic pause prevents speaker echo.",
      "b": "Initialize Clinical & Voice Encounter"
    },
    "audio_transcriber": {
      "d": "Upload lecture audio (MP3, WAV, M4A, WEBM, OGG) or record live via microphone with real-time audio spectrum meter for medical transcription and notes.",
      "l": ["Upload Audio File (MP3, WAV, M4A, WEBM, OGG):", "Medical Specialty Context:", "Post-Processing Output Mode:"],
      "p": [null, "e.g., Cardiology, Neuroanatomy, Antimicrobial Pharmacology"],
      "o": {
        "mode": ["Complete Package (Verbatim + Structured Notes + Exam Pearls)", "Verbatim Medical Transcript Only", "Structured Lecture Notes & High-Yield Pearls Only"]
      },
      "ld": "Transcribing audio & extracting medical nomenclature...",
      "b": "Transcribe & Process Audio"
    },
    "timed_exam_arena": {
      "d": "Timed clinical vignette & MCQ assessment engine supporting total-exam or per-question countdowns, rationale review mode, and domain analytics.",
      "l": ["Exam Topic or Paste Lecture Material:", "Number of Clinical Vignettes (3 - 15):", "Countdown Timer Mode:", "Time Allocation (seconds per question):"],
      "p": ["e.g., Nephrology Acid-Base Disorders, or paste lecture text..."],
      "o": {
        "tmode": ["Total Exam Countdown Timer", "Strict Per-Question Countdown Timer"],
        "tsec": ["60 seconds / question", "90 seconds / question (USMLE Pace)", "45 seconds / question (Rapid Pace)"]
      },
      "ld": "Constructing timed clinical vignettes...",
      "v": "Please specify an exam topic or paste source text.",
      "b": "Enter Timed Exam Arena"
    },
    "feynman_engine": {
      "d": "Evaluates your own explanation of a medical topic to detect conceptual blind spots, jargon over-reliance, and clinical inaccuracies with rubric scoring.",
      "l": ["Target Medical Concept:", "Your Explanation (in your own words):", "Target Audience Benchmark:"],
      "p": ["e.g., Frank-Starling Mechanism", "Explain how and why it works in your own words..."],
      "o": {
        "aud": ["Junior Medical Student / Peer", "Intelligent Layperson / Patient", "Clinical Attending (Mechanism Deep-Dive)"]
      },
      "ld": "Auditing explanation for blind spots & jargon...",
      "v": "Please enter both the medical concept and your explanation.",
      "b": "Analyze My Explanation (Feynman Audit)"
    },
    "anatomy_3d_atlas": {
      "d": "Interactive 3D Anatomy Library powered by Sketchfab 3D API, Three.js WebGL Anatomical Planes Dissector, and Google <model-viewer> (.GLB/AR).",
      "l": ["Select Anatomical System / Organ Preset:", "Study Mode for AI Co-Pilot:", "Or Search Any 3D Anatomical Structure (English):"],
      "p": [null, null, "e.g., Brachial plexus, Circle of Willis, Sphenoid bone, Heart valves..."],
      "ld": "Loading 3D Anatomy Studio & AI Guide...",
      "b": "Launch 3D Anatomy Studio"
    },
    "med_planner": {
      "d": "Smart adaptive study scheduler with Calendar, Daily/Weekly views, Spaced Repetition slots, Auto-Reschedule on delay, and real-data Smart Recommendations.",
      "l": ["Subject / Course Name:", "Lecture Title or Topic Batch:", "Number of Lectures:", "Duration per Lecture (minutes):", "Exam Date:", "Subject Difficulty:", "Your Current Mastery:", "Daily Available Study Hours:", "Preferred Study Time:", "Weekly Rest Day:", "Daily Revision Hours:"],
      "p": ["e.g., Internal Medicine - Cardiology", "e.g., Arrhythmias & Valvular Disease"],
      "b": "Generate & Save Smart Study Schedule"
    },
    "med_tutor": {
      "d": "Interactive AI Medical Video Whiteboard & Text Tutor: upload PDF lectures or paste text for animated visual slide walkthroughs with synchronized voice narration, terminology breakdown, and inline quizzes.",
      "l": ["Upload Lecture PDF (optional):", "Or Paste Lecture Paragraph / Medical Topic:", "Explanation Level:", "Teaching Mode:"],
      "p": [null, "Paste the paragraph or concept you want explained..."],
      "b": "Launch Interactive Video Whiteboard & Tutor"
    },
    "med_exam": {
      "d": "Comprehensive Multi-Format Medical Exam Engine (MCQ, True/False, Clinical Cases, Matching, Fill-in-the-Blanks) from PDF or topic with blind exam mode and full option-by-option rationales.",
      "l": ["Upload Lecture PDF (optional):", "Exam Topic or Source Text:", "Question Format:", "Number of Questions (3 - 15):", "Difficulty Level:", "Timer Allocation (sec/question):"],
      "p": [null, "Enter topic or paste lecture text..."],
      "b": "Generate & Start Blind Medical Exam"
    },
    "med_flash": {
      "d": "Spaced Repetition Medical Flashcards powered by FSRS / SM-2 algorithm: generate from PDF/text or create manually, flip 3D cards, rate recall difficulty, and track daily retention.",
      "l": ["Upload Lecture PDF (optional):", "Subject / Deck Category:", "Topic or Source Text to Generate Cards (leave empty to open saved decks):", "Number of New Cards to Generate:"],
      "p": [null, "e.g., Pharmacology, Pathology", "Paste text to generate cards, or click launch to review saved cards..."],
      "b": "Open MedFlash Deck & Spaced Repetition"
    },
    "ecg_tutor": {
      "d": "Interactive 12-Lead & Rhythm Strip ECG Interpretation Trainer: live Canvas ECG waveform simulator, deterministic Heart Rate, QRS Axis & QTc calculators, pattern library, and practice cases.",
      "l": ["Select ECG Pattern / Rhythm Strip:", "Ventricular Rate (bpm) or RR Interval (small boxes):", "Lead I Net QRS (mm) & aVF Net QRS (mm) (comma-separated):", "QT Interval (ms) for QTc Calculation:", "Clinical Context / Practice Case Mode:"],
      "p": [null, "e.g., 88 (or 17 boxes)", "e.g., +6, -4", "e.g., 420", "Optional clinical scenario..."],
      "b": "Simulate ECG Waveform & Run Analysis"
    },
    "abg_analyzer": {
      "d": "Deterministic JavaScript Arterial Blood Gas & Electrolyte Analyzer: Primary disorder, Winter's formula, acute/chronic compensation rules, albumin-corrected Anion Gap, and Delta Ratio.",
      "l": ["Arterial pH (normal 7.35 - 7.45):", "PaCO2 (mmHg, normal 35 - 45):", "HCO3- (mEq/L, normal 22 - 26):", "Na+ & Cl- (mEq/L, comma-separated for Anion Gap):", "Albumin (g/dL, default 4.0) & Chronicity (Acute/Chronic):"],
      "p": ["e.g., 7.24", "e.g., 28", "e.g., 12", "e.g., 138, 102", "e.g., 4.0, acute"],
      "b": "Calculate ABG, Compensation & Anion Gap"
    },
    "lab_interpreter": {
      "d": "Clinical Lab Panel Interpreter (CBC, LFT, RFT, Electrolytes, Thyroid, Coagulation) with exact reference intervals, critical value alerts, and pathophysiological correlation.",
      "l": ["Select Lab Panel:", "Enter Lab Values (or select a preset clinical panel):", "Patient Age / Sex / Clinical Context:"],
      "p": [null, "e.g., Hb: 8.2 g/dL, MCV: 68 fL, Ferritin: 6 ng/mL, Platelets: 460...", "e.g., 32yo female with fatigue"],
      "b": "Evaluate Reference Ranges & Interpret Panel"
    },
    "diff_dx_trainer": {
      "d": "Systematic Differential Diagnosis Trainer: symptom analysis, problem representation, prioritized DDx (Common vs. Must-Not-Miss Red Flags), diagnostic workup, and Bayesian likelihood reasoning.",
      "l": ["Patient Presentation (Age, Sex, Chief Complaint & HPI):", "Vital Signs & Physical Exam Findings:", "Diagnostic Stage:"],
      "p": ["e.g., 64yo male smoker with sudden tearing chest pain radiating to interscapular back...", "e.g., BP 185/105 right arm, 145/85 left arm, HR 108..."],
      "b": "Build Structured Differential & Workup Matrix"
    },
    "drug_checker": {
      "d": "Evidence-grounded Drug-Drug Interaction Checker combining curated high-alert pharmacology rules, live OpenFDA official drug label verification, severity grading, and mechanism analysis.",
      "l": ["Enter Medications (comma-separated, generic or brand names in English):", "Patient Renal/Hepatic/Pregnancy Status (optional):"],
      "p": ["e.g., Warfarin, Amiodarone, Aspirin, Spironolactone", "e.g., CKD Stage 3 (eGFR 42), Elderly"],
      "b": "Check Interactions & Query OpenFDA Labels"
    },
    "med_progress": {
      "d": "Real-time Student Academic Progress Dashboard aggregating actual completed lectures, exam scores, flashcard mastery, study hours, and weak domains.",
      "l": ["Dashboard View Filter:"],
      "b": "Open Live Academic Progress Dashboard"
    },
    "research_lab": {
      "d": "Evidence-Based Medical Research Lab: PICO Builder, Live NCBI PubMed Search (real PMIDs & DOIs), Paper Summarizer, Critical Appraisal, Deterministic Biostatistics Calculator, and Reference Formatter.",
      "l": ["Select Research Tool / Module:", "Research Topic, Clinical Question, or Manuscript Text:", "Biostatistics Data (2x2 Table a,b,c,d or Sample Size params):"],
      "p": [null, "e.g., SGLT2 inhibitors in heart failure with preserved ejection fraction (HFpEF)", "e.g., 45, 15, 20, 80 (for 2x2 Sensitivity/Specificity/OR/RR/NNT)"],
      "b": "Run Research Lab & Live PubMed Search"
    }
  };
  if (typeof EN_TOOLS === 'object') Object.assign(EN_TOOLS, EXT_EN_TOOLS);

  function extractJsonBlock(rawText) {
    const str = String(rawText || '').trim();
    const fenceMatch = str.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidate = fenceMatch ? fenceMatch[1].trim() : str;
    const firstBrace = candidate.indexOf('{');
    const lastBrace = candidate.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(candidate.slice(firstBrace, lastBrace + 1));
    }
    throw new Error(LANG === 'en' ? 'Could not parse structured JSON from model output.' : 'تعذر قراءة البيانات المنظمة (JSON) من استجابة النموذج.');
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const b64 = String(reader.result || '').split(',')[1];
        b64 ? resolve(b64) : reject(new Error('Failed to encode file.'));
      };
      reader.onerror = () => reject(new Error('Error reading file.'));
      reader.readAsDataURL(file);
    });
  }

  /* ==========================================================================
     MODULE 1: MINDMAP STUDIO
     ========================================================================== */
  const MindMapStudio = {
    state: { tree: null, panX: 60, panY: 40, scale: 1, isPanning: false, startX: 0, startY: 0, dragNode: null, dragOffsetX: 0, dragOffsetY: 0 },
    TAG_COLORS: {
      core:       { bg: '#0e7490', border: '#0b5c73', text: '#ffffff', labelAr: 'مفهوم رئيسي', labelEn: 'Core' },
      patho:      { bg: '#fef3c7', border: '#d97706', text: '#78350f', labelAr: 'آلية مرضية', labelEn: 'Pathophysiology' },
      clinical:   { bg: '#dcfce7', border: '#15803d', text: '#14532d', labelAr: 'سريري/أعراض', labelEn: 'Clinical' },
      diagnosis:  { bg: '#e0e7ff', border: '#4338ca', text: '#1e1b4b', labelAr: 'تشخيص', labelEn: 'Diagnosis' },
      pharma:     { bg: '#fce7f3', border: '#be185d', text: '#831843', labelAr: 'علاج/أدوية', labelEn: 'Pharmacology/Tx' },
      redflag:    { bg: '#fee2e2', border: '#dc2626', text: '#7f1d1d', labelAr: 'علامة خطر', labelEn: 'Red Flag' }
    },

    async run() {
      if (APP_STATE.isRequestInFlight) return;
      const topic = ($('mm_topic') && $('mm_topic').value.trim()) || '';
      const depth = ($('mm_depth') && $('mm_depth').value) || '3';
      const focus = ($('mm_focus') && $('mm_focus').value) || 'comprehensive';
      if (!topic) {
        renderToolError(LANG === 'en' ? EXT_EN_TOOLS.mindmap_studio.v : 'يرجى إدخال الموضوع الطبي أو نص المحاضرة أولاً.');
        return;
      }

      setToolLoadingState(true, LANG === 'en' ? EXT_EN_TOOLS.mindmap_studio.ld : 'جارٍ بناء الشجرة المعرفية والخريطة الذهنية...');
      $('toolOutputContainer').innerHTML = '';

      const sysPrompt = `أنت خبير هيكلة معرفية طبية. حوّل الموضوع أو المحاضرة إلى شجرة خريطة ذهنية طبية منظمة بصيغة JSON فقط دون أي نص خارج JSON.
القواعد:
1. أخرج كائن JSON جذري واحد يتبع الهيكل:
{
  "id": "root",
  "label": "عنوان المفهوم الرئيسي",
  "tag": "core",
  "note": "ملخص دقيق في سطر واحد",
  "children": [
    {
      "id": "n1",
      "label": "عنوان الفرع (مع المصطلح الإنجليزي)",
      "tag": "patho | clinical | diagnosis | pharma | redflag",
      "note": "توضيح علمي مختصر",
      "children": []
    }
  ]
}
2. عمق الشجرة المطلوب: ${depth}، والتركيز: ${focus}.
3. اجعل العناوين (label) موجزة وواضحة (2 إلى 6 كلمات) لتناسب عقد الخريطة الذهنية.`;

      try {
        const raw = await callGeminiAPI({
          systemInstruction: sysPrompt + SAFE_RULES,
          contents: [{ role: 'user', parts: [{ text: topic }] }]
        });
        const treeData = extractJsonBlock(raw);
        this.prepareTree(treeData, 0);
        this.state.tree = treeData;
        this.state.panX = 60;
        this.state.panY = 40;
        this.state.scale = 1;
        this.computeLayout();
        this.mountCanvas();
        MedStorage.recordStudyMinutes(10, topic.slice(0, 40));
      } catch (e) {
        renderToolError(e.message, () => this.run());
      } finally {
        setToolLoadingState(false);
      }
    },

    prepareTree(node, depth, idxObj = { c: 1 }) {
      node.id = node.id || ('node_' + (idxObj.c++));
      node.tag = this.TAG_COLORS[node.tag] ? node.tag : (depth === 0 ? 'core' : 'clinical');
      node.collapsed = false;
      node.customX = null;
      node.customY = null;
      if (!Array.isArray(node.children)) node.children = [];
      node.children.forEach(ch => this.prepareTree(ch, depth + 1, idxObj));
    },

    computeLayout() {
      const root = this.state.tree;
      if (!root) return;
      let leafIndex = 0;
      const levelGapX = 250;
      const leafGapY = 82;

      const assignCoords = (node, depth) => {
        const defaultX = 80 + depth * levelGapX;
        if (!node.children || node.children.length === 0 || node.collapsed) {
          const defaultY = 70 + leafIndex * leafGapY;
          leafIndex++;
          node.x = node.customX === null ? defaultX : node.customX;
          node.y = node.customY === null ? defaultY : node.customY;
          return node.y;
        }
        const childYs = node.children.map(ch => assignCoords(ch, depth + 1));
        const midY = (childYs[0] + childYs[childYs.length - 1]) / 2;
        node.x = node.customX === null ? defaultX : node.customX;
        node.y = node.customY === null ? midY : node.customY;
        return node.y;
      };
      assignCoords(root, 0);
    },

    mountCanvas() {
      const c = $('toolOutputContainer');
      if (!c) return;
      const isEn = LANG === 'en';
      const legendHtml = Object.entries(this.TAG_COLORS).map(([, v]) =>
        `<span class="mm-legend-item">
          <span class="mm-legend-dot" style="background:${v.border};"></span>${isEn ? v.labelEn : v.labelAr}
        </span>`
      ).join('');

      c.innerHTML = `
        <div class="ai-output-box" data-notr="1">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
            <h3 style="margin:0;"><i class="fa-solid fa-diagram-project"></i> ${isEn ? 'MindMap Studio Interactive Canvas' : 'لوحة الخريطة الذهنية التفاعلية'}</h3>
            <span style="font-size:12.5px;color:var(--muted-text);">${isEn ? 'Drag nodes • Click (+/-) to expand/collapse • Click tag dot to cycle color' : 'اسحب العقد لتحريكها • اضغط (+/-) للطي/التوسيع • اضغط الدائرة الملونة لتغيير التصنيف'}</span>
          </div>
          <div class="mm-viewport" id="mmViewport">
            <div class="mm-floating-Controls">
              <button type="button" class="btn-secondary" style="padding:6px 10px;font-size:12px;" onclick="window.MEDNERD_EXT.MindMapStudio.zoom(1.18)"><i class="fa-solid fa-magnifying-glass-plus"></i></button>
              <button type="button" class="btn-secondary" style="padding:6px 10px;font-size:12px;" onclick="window.MEDNERD_EXT.MindMapStudio.zoom(0.84)"><i class="fa-solid fa-magnifying-glass-minus"></i></button>
              <button type="button" class="btn-secondary" style="padding:6px 10px;font-size:12px;" onclick="window.MEDNERD_EXT.MindMapStudio.resetLayout()">${isEn ? 'Reset' : 'إعادة ترتيب'}</button>
              <button type="button" class="btn-secondary" style="padding:6px 10px;font-size:12px;" onclick="window.MEDNERD_EXT.MindMapStudio.expandAll(false)">${isEn ? 'Expand All' : 'توسيع الكل'}</button>
              <button type="button" class="btn-secondary" style="padding:6px 10px;font-size:12px;" onclick="window.MEDNERD_EXT.MindMapStudio.expandAll(true)">${isEn ? 'Collapse' : 'طي الفروع'}</button>
              <button type="button" class="btn-primary" style="padding:6px 12px;font-size:12px;" onclick="window.MEDNERD_EXT.MindMapStudio.exportSVG()"><i class="fa-solid fa-code"></i> SVG</button>
              <button type="button" class="btn-primary" style="padding:6px 12px;font-size:12px;background:var(--dark-green);" onclick="window.MEDNERD_EXT.MindMapStudio.exportPNG()"><i class="fa-solid fa-image"></i> PNG</button>
            </div>
            <svg id="mmSvg" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <g id="mmTransformGroup"></g>
            </svg>
            <div class="mm-legend">${legendHtml}</div>
          </div>
          <div id="mmNodeInspector" style="margin-top:12px;padding:10px 14px;border-radius:10px;background:var(--bg-elevated);border:1px solid var(--border-color);font-size:13.5px;display:none;"></div>
        </div>`;

      this.bindViewportEvents();
      this.renderGraph();
    },

    bindViewportEvents() {
      const vp = $('mmViewport');
      if (!vp) return;
      vp.onwheel = e => {
        e.preventDefault();
        this.zoom(e.deltaY < 0 ? 1.1 : 0.9);
      };
      vp.onpointerdown = e => {
        if (e.target.closest('.mm-floating-Controls') || e.target.closest('.mm-legend') || e.target.closest('.mm-node-group')) return;
        this.state.isPanning = true;
        this.state.startX = e.clientX - this.state.panX;
        this.state.startY = e.clientY - this.state.panY;
        vp.setPointerCapture(e.pointerId);
      };
      vp.onpointermove = e => {
        if (this.state.dragNode) {
          const pt = this.screenToWorld(e.clientX, e.clientY);
          this.state.dragNode.customX = pt.x - this.state.dragOffsetX;
          this.state.dragNode.customY = pt.y - this.state.dragOffsetY;
          this.state.dragNode.x = this.state.dragNode.customX;
          this.state.dragNode.y = this.state.dragNode.customY;
          this.renderGraph();
          return;
        }
        if (!this.state.isPanning) return;
        this.state.panX = e.clientX - this.state.startX;
        this.state.panY = e.clientY - this.state.startY;
        this.updateTransform();
      };
      vp.onpointerup = () => {
        this.state.isPanning = false;
        this.state.dragNode = null;
      };
    },

    screenToWorld(clientX, clientY) {
      const svg = $('mmSvg');
      const rect = svg.getBoundingClientRect();
      return {
        x: (clientX - rect.left - this.state.panX) / this.state.scale,
        y: (clientY - rect.top - this.state.panY) / this.state.scale
      };
    },

    updateTransform() {
      const g = $('mmTransformGroup');
      if (g) g.setAttribute('transform', `translate(${this.state.panX},${this.state.panY}) scale(${this.state.scale})`);
    },

    zoom(factor) {
      this.state.scale = Math.min(Math.max(this.state.scale * factor, 0.35), 2.5);
      this.updateTransform();
    },

    resetLayout() {
      const clearCustom = n => { n.customX = null; n.customY = null; (n.children || []).forEach(clearCustom); };
      if (this.state.tree) clearCustom(this.state.tree);
      this.state.panX = 60;
      this.state.panY = 40;
      this.state.scale = 1;
      this.computeLayout();
      this.renderGraph();
    },

    expandAll(collapseSub) {
      const walk = (n, d) => {
        n.collapsed = collapseSub ? d >= 1 : false;
        (n.children || []).forEach(c => walk(c, d + 1));
      };
      if (this.state.tree) walk(this.state.tree, 0);
      this.computeLayout();
      this.renderGraph();
    },

    findNode(id, cur = this.state.tree) {
      if (!cur) return null;
      if (cur.id === id) return cur;
      for (const ch of (cur.children || [])) {
        const f = this.findNode(id, ch);
        if (f) return f;
      }
      return null;
    },

    toggleCollapse(id, evt) {
      if (evt) evt.stopPropagation();
      const n = this.findNode(id);
      if (!n) return;
      n.collapsed = !n.collapsed;
      this.computeLayout();
      this.renderGraph();
    },

    cycleTag(id, evt) {
      if (evt) evt.stopPropagation();
      const n = this.findNode(id);
      if (!n) return;
      const keys = Object.keys(this.TAG_COLORS);
      n.tag = keys[(keys.indexOf(n.tag) + 1) % keys.length];
      this.renderGraph();
    },

    inspectNode(id) {
      const n = this.findNode(id);
      const box = $('mmNodeInspector');
      if (!n || !box) return;
      const tagMeta = this.TAG_COLORS[n.tag] || this.TAG_COLORS.core;
      box.style.display = 'block';
      box.innerHTML = `<b style="color:${tagMeta.border};">[${LANG === 'en' ? tagMeta.labelEn : tagMeta.labelAr}] ${escapeHtml(n.label)}</b>` +
        (n.note ? ` — <span>${escapeHtml(n.note)}</span>` : '');
    },

    renderGraph() {
      const g = $('mmTransformGroup');
      if (!g || !this.state.tree) return;
      this.updateTransform();

      const links = [], nodes = [];
      const collect = n => {
        nodes.push(n);
        if (!n.collapsed && Array.isArray(n.children)) {
          n.children.forEach(ch => { links.push({ source: n, target: ch }); collect(ch); });
        }
      };
      collect(this.state.tree);

      const nodeW = 195, nodeH = 54;
      let svgHtml = '';

      links.forEach(l => {
        const x1 = l.source.x + nodeW, y1 = l.source.y + nodeH / 2;
        const x2 = l.target.x, y2 = l.target.y + nodeH / 2;
        const cx = x1 + (x2 - x1) * 0.5;
        const stroke = (this.TAG_COLORS[l.target.tag] || this.TAG_COLORS.clinical).border;
        svgHtml += `<path d="M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}" fill="none" stroke="${stroke}" stroke-width="2.2" stroke-opacity="0.7"/>`;
      });

      nodes.forEach(n => {
        const theme = this.TAG_COLORS[n.tag] || this.TAG_COLORS.clinical;
        const labelShort = String(n.label || '').length > 28 ? String(n.label).slice(0, 26) + '…' : String(n.label || '');
        const hasChildren = Array.isArray(n.children) && n.children.length > 0;
        const badgeSign = n.collapsed ? '+' : '−';

        svgHtml += `
          <g class="mm-node-group" data-id="${escapeHtml(n.id)}" transform="translate(${n.x},${n.y})" style="cursor:move;">
            <rect width="${nodeW}" height="${nodeH}" rx="12" ry="12" fill="${theme.bg}" stroke="${theme.border}" stroke-width="2.2"/>
            <circle class="mm-tag-btn" data-id="${escapeHtml(n.id)}" cx="16" cy="16" r="6" fill="${theme.border}" style="cursor:pointer;"/>
            <text x="${nodeW / 2}" y="${nodeH / 2 + 5}" text-anchor="middle" fill="${theme.text}" font-family="Cairo, Inter, sans-serif" font-size="13" font-weight="700" style="pointer-events:none;">${escapeHtml(labelShort)}</text>
            ${hasChildren ? `
              <g class="mm-collapse-btn" data-id="${escapeHtml(n.id)}" transform="translate(${nodeW - 12}, ${nodeH / 2})" style="cursor:pointer;">
                <circle r="10" fill="#ffffff" stroke="${theme.border}" stroke-width="2"/>
                <text y="4" text-anchor="middle" fill="${theme.border}" font-size="14" font-weight="800">${badgeSign}</text>
              </g>
            ` : ''}
          </g>`;
      });

      g.innerHTML = svgHtml;

      g.querySelectorAll('.mm-node-group').forEach(el => {
        const id = el.getAttribute('data-id');
        el.onpointerdown = e => {
          if (e.target.closest('.mm-collapse-btn') || e.target.closest('.mm-tag-btn')) return;
          e.stopPropagation();
          const n = this.findNode(id);
          if (!n) return;
          this.inspectNode(id);
          const pt = this.screenToWorld(e.clientX, e.clientY);
          this.state.dragNode = n;
          this.state.dragOffsetX = pt.x - n.x;
          this.state.dragOffsetY = pt.y - n.y;
        };
      });

      g.querySelectorAll('.mm-collapse-btn').forEach(btn => {
        btn.onclick = e => this.toggleCollapse(btn.getAttribute('data-id'), e);
      });
      g.querySelectorAll('.mm-tag-btn').forEach(btn => {
        btn.onclick = e => this.cycleTag(btn.getAttribute('data-id'), e);
      });
    },

    buildStandaloneSVGString() {
      const g = $('mmTransformGroup');
      if (!g) return '';
      const bbox = g.getBBox();
      const pad = 40;
      const w = Math.max(Math.ceil(bbox.width + pad * 2), 600);
      const h = Math.max(Math.ceil(bbox.height + pad * 2), 400);
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <rect width="100%" height="100%" fill="#fdfbf7"/>
        <g transform="translate(${-bbox.x + pad},${-bbox.y + pad})">${g.innerHTML}</g>
      </svg>`;
    },

    exportSVG() {
      const svgStr = this.buildStandaloneSVGString();
      if (!svgStr) return;
      const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'mednerd-mindmap.svg';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1500);
    },

    exportPNG() {
      const svgStr = this.buildStandaloneSVGString();
      if (!svgStr) return;
      const img = new Image();
      const url = URL.createObjectURL(new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' }));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        const ctx = canvas.getContext('2d');
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob(pngBlob => {
          if (!pngBlob) return;
          const a = document.createElement('a');
          a.href = URL.createObjectURL(pngBlob);
          a.download = 'mednerd-mindmap.png';
          document.body.appendChild(a);
          a.click();
          a.remove();
        }, 'image/png');
      };
      img.src = url;
    }
  };

  /* ==========================================================================
     MODULE 2: COLLABORATIVE STUDY ROOM (مُصلحة بالكامل مع WebRTC STUN،
     إدارة مشاركين حقيقية، استرداد تلقائي لـ Host/Guest، ودخول تلقائي من الرابط)
     ========================================================================== */
  const CollaborativeStudyRoom = {
    state: {
      channel: null,
      peer: null,
      connections: [],
      isHostPeer: false,
      myPeerId: '',
      roomCode: '',
      userName: '',
      role: 'host',
      focusSec: 1500,
      breakSec: 300,
      phase: 'FOCUS',
      remainingSec: 1500,
      running: false,
      intervalId: null,
      reconnectTimer: null,
      messages: [],
      files: [],
      participants: {} // { peerId: { id, name, role, status, joinedAt } }
    },

    ICE_CONFIG: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun.cloudflare.com:3478' }
      ]
    },

    permissions() {
      const r = this.state.role;
      return {
        canControlTimer: r === 'host' || this.state.isHostPeer,
        canChat: r === 'host' || r === 'editor',
        canUpload: r === 'host' || r === 'editor',
        canDeleteFile: r === 'host' || this.state.isHostPeer,
        canAskAiCoPilot: r === 'host' || r === 'editor'
      };
    },

    cleanup() {
      if (this.state.intervalId) { clearInterval(this.state.intervalId); this.state.intervalId = null; }
      if (this.state.reconnectTimer) { clearTimeout(this.state.reconnectTimer); this.state.reconnectTimer = null; }
      if (this.state.channel) {
        try {
          this.state.channel.postMessage({ type: 'PEER_LEAVE', peerId: this.state.myPeerId, name: this.state.userName });
          this.state.channel.close();
        } catch (_) {}
        this.state.channel = null;
      }
      if (this.state.peer) {
        try { this.state.peer.destroy(); } catch (_) {}
        this.state.peer = null;
      }
      this.state.connections = [];
      this.state.participants = {};
    },

    getInviteUrl() {
      const base = window.location.origin + window.location.pathname;
      return `${base}?room=${encodeURIComponent(this.state.roomCode)}`;
    },

    copyInviteLink(btnEl) {
      const url = this.getInviteUrl();
      copyTextSafe(url).then(() => {
        if (!btnEl) return;
        const orig = btnEl.innerHTML;
        btnEl.innerHTML = `<i class="fa-solid fa-check"></i> ${LANG === 'en' ? 'Link Copied!' : 'تم نسخ رابط الدعوة!'}`;
        setTimeout(() => { btnEl.innerHTML = orig; }, 2200);
      });
    },

    copyRoomCodeOnly(btnEl) {
      copyTextSafe(this.state.roomCode).then(() => {
        if (!btnEl) return;
        const orig = btnEl.innerHTML;
        btnEl.innerHTML = `<i class="fa-solid fa-check"></i> ${LANG === 'en' ? 'Code Copied!' : 'تم نسخ الرمز!'}`;
        setTimeout(() => { btnEl.innerHTML = orig; }, 2000);
      });
    },

    shareViaTelegram() {
      const url = this.getInviteUrl();
      const text = LANG === 'en'
        ? `Join my MEDNERD Collaborative Study Room (${this.state.roomCode}):`
        : `انضم إليّ في غرفة الدراسة المشتركة على منصة MEDNERD (رمز الغرفة: ${this.state.roomCode}):`;
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    },

    shareViaWhatsApp() {
      const url = this.getInviteUrl();
      const text = LANG === 'en'
        ? `Join my MEDNERD Study Room (${this.state.roomCode}): ${url}`
        : `انضم إليّ في غرفة الدراسة المشتركة على MEDNERD (رمز الغرفة: ${this.state.roomCode}):\n${url}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    },

    addSystemNotice(textAr, textEn) {
      const entry = {
        id: 'sys_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        user: 'SYSTEM',
        role: 'system',
        text: LANG === 'en' ? textEn : textAr,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      this.state.messages.push(entry);
      this.renderChatList();
    },

    async run() {
      this.cleanup();
      const modeVal = ($('csr_mode') && $('csr_mode').value) || 'create';
      let codeRaw = ($('csr_code') && $('csr_code').value.trim()) || '';
      if (!codeRaw) {
        codeRaw = 'MED-' + Math.floor(1000 + Math.random() * 9000);
      }
      const code = codeRaw.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
      if ($('csr_code')) $('csr_code').value = code;

      const p = typeof getProfile === 'function' ? getProfile() : null;
      let authUser = null;
      try { authUser = JSON.parse(localStorage.getItem('mednerd_auth_user') || 'null'); } catch (_) {}
      const name =
        (($('csr_name') && $('csr_name').value.trim()) ||
          (authUser && authUser.name) ||
          (p && p.name) ||
          (LANG === 'en' ? 'Dr. Med Student' : 'طالب طب'));
      if ($('csr_name')) $('csr_name').value = name;

      let roleVal = ($('csr_role') && $('csr_role').value) || (modeVal === 'join' ? 'editor' : 'host');
      if (modeVal === 'join' && roleVal === 'host') {
        roleVal = 'editor';
        if ($('csr_role')) $('csr_role').value = 'editor';
      }

      const cycleVal = ($('csr_cycle') && $('csr_cycle').value) || '25/5';
      const [fMin, bMin] = cycleVal.split('/').map(n => parseInt(n, 10) || 25);

      this.state.myPeerId = 'peer_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
      this.state.roomCode = code;
      this.state.userName = name;
      this.state.role = roleVal;
      this.state.focusSec = fMin * 60;
      this.state.breakSec = bMin * 60;
      this.state.phase = 'FOCUS';
      this.state.remainingSec = this.state.focusSec;
      this.state.running = false;

      const savedRoom = this.loadRoomStorage(code);
      this.state.messages = savedRoom.messages || [];
      this.state.files = savedRoom.files || [];

      this.state.participants = {
        [this.state.myPeerId]: {
          id: this.state.myPeerId,
          name: this.state.userName,
          role: this.state.role,
          status: 'online',
          joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      };

      // 1. تزامن التبويبات على نفس الجهاز (BroadcastChannel)
      if (typeof BroadcastChannel !== 'undefined') {
        this.state.channel = new BroadcastChannel('mednerd_csr_' + code);
        this.state.channel.onmessage = ev => this.handleIncomingPacket(ev.data, null);
        this.state.channel.postMessage({
          type: 'HELLO_PEER',
          peer: this.state.participants[this.state.myPeerId]
        });
      }

      this.renderRoomUI();
      await this.initPeerNetwork(code, modeVal);
    },

    async initPeerNetwork(code, modeVal) {
      const hostPeerId = 'mednerd-csr-v3-' + code.toLowerCase();
      try {
        await MedDependencyLoader.ensurePeerJS();
      } catch (err) {
        this.updateNetStatus(
          LANG === 'en'
            ? 'Local Browser Sync Active (External P2P CDN blocked)'
            : 'التزامن المحلي نشط (تعذر الوصول لخادم WebRTC الخارجي)',
          'mustard'
        );
        return;
      }
      if (!window.Peer) return;

      const startAsHost = () => {
        const peer = new window.Peer(hostPeerId, { config: this.ICE_CONFIG });
        this.state.peer = peer;

        peer.on('open', id => {
          this.state.isHostPeer = true;
          this.state.myPeerId = id;
          this.state.participants[id] = {
            id,
            name: this.state.userName,
            role: 'host',
            status: 'online (Host)',
            joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          this.renderParticipantsBar();
          this.updateNetStatus(
            LANG === 'en' ? `Room Host Ready (${Object.keys(this.state.participants).length} online)` : `الغرفة متصلة عبر الإنترنت (${Object.keys(this.state.participants).length} متصل حالياً)`,
            'green'
          );
          this.addSystemNotice(`تم فتح الغرفة (${code}) وأنت المضيف الآن.`, `Room (${code}) is live. You are the Host.`);
        });

        peer.on('connection', conn => this.registerConn(conn));

        peer.on('error', err => {
          if (err && err.type === 'unavailable-id') {
            try { peer.destroy(); } catch (_) {}
            startAsGuest(0);
          } else {
            this.updateNetStatus(
              LANG === 'en' ? 'Signaling warning: ' + (err.type || 'network') : 'تنبيه شبكة: ' + (err.type || 'جاري إعادة المحاولة'),
              'mustard'
            );
          }
        });
      };

      const startAsGuest = (retryCount = 0) => {
        const guestPeer = new window.Peer(undefined, { config: this.ICE_CONFIG });
        this.state.peer = guestPeer;
        this.state.isHostPeer = false;

        guestPeer.on('open', myId => {
          this.state.myPeerId = myId;
          this.state.participants = {
            [myId]: {
              id: myId,
              name: this.state.userName,
              role: this.state.role,
              status: 'connecting...',
              joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          };
          this.renderParticipantsBar();
          this.updateNetStatus(
            LANG === 'en' ? 'Connecting to Room Host...' : 'جارٍ الاتصال بمضيف الغرفة...',
            'mustard'
          );

          const conn = guestPeer.connect(hostPeerId, { reliable: true });
          let connected = false;
          const connTimeout = setTimeout(() => {
            if (!connected) {
              try { conn.close(); } catch (_) {}
              if (retryCount < 1) {
                try { guestPeer.destroy(); } catch (_) {}
                startAsHost();
              } else {
                this.updateNetStatus(
                  LANG === 'en' ? 'Host not found yet — waiting or click Reconnect' : 'المضيف غير متصل حالياً أو الرمز غير نشط بعد',
                  'mustard'
                );
              }
            }
          }, 5500);

          conn.on('open', () => {
            connected = true;
            clearTimeout(connTimeout);
          });
          this.registerConn(conn);
        });

        guestPeer.on('error', err => {
          if (err && err.type === 'peer-unavailable') {
            try { guestPeer.destroy(); } catch (_) {}
            startAsHost();
          } else {
            this.updateNetStatus(
              LANG === 'en' ? 'Connection issue — click Reconnect' : 'تعذر الاتصال المباشر — اضغط إعادة اتصال',
              'mustard'
            );
          }
        });
      };

      if (modeVal === 'join') {
        startAsGuest(0);
      } else {
        startAsHost();
      }
    },

    registerConn(conn) {
      conn.on('open', () => {
        if (!this.state.connections.includes(conn)) this.state.connections.push(conn);
        conn.send({
          type: 'HELLO_PEER',
          peer: {
            id: this.state.myPeerId,
            name: this.state.userName,
            role: this.state.role,
            status: 'online',
            joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        });
        if (this.state.isHostPeer) {
          conn.send({
            type: 'FULL_SYNC',
            phase: this.state.phase,
            remainingSec: this.state.remainingSec,
            running: this.state.running,
            messages: this.state.messages,
            files: this.state.files,
            participants: this.state.participants
          });
        }
      });

      conn.on('data', data => this.handleIncomingPacket(data, conn));

      conn.on('close', () => {
        this.state.connections = this.state.connections.filter(c => c !== conn);
        if (conn._peerMeta && conn._peerMeta.id) {
          const leftName = conn._peerMeta.name || 'طالب';
          delete this.state.participants[conn._peerMeta.id];
          this.renderParticipantsBar();
          this.addSystemNotice(`غادر (${leftName}) الغرفة.`, `${leftName} left the room.`);
          if (this.state.isHostPeer) {
            this.broadcast({ type: 'PARTICIPANTS_SYNC', participants: this.state.participants });
          }
        }
        const totalOnline = Object.keys(this.state.participants).length;
        this.updateNetStatus(
          LANG === 'en' ? `Connected (${totalOnline} in room)` : `متصل الآن (${totalOnline} في الغرفة)`,
          'green'
        );
      });
    },

    updateNetStatus(txt, pillClass = 'green') {
      const el = $('csrNetBadge');
      if (!el) return;
      el.className = 'mn-ext-pill ' + pillClass;
      el.innerHTML = `<i class="fa-solid fa-wifi"></i> ${escapeHtml(txt)}`;
    },

    renderParticipantsBar() {
      const box = $('csrPeersList');
      if (!box) return;
      const list = Object.values(this.state.participants);
      box.innerHTML = list.map(p => `
        <span class="mn-ext-pill" style="background:var(--bg-elevated);">
          <span class="csr-peer-dot"></span>
          <b>${escapeHtml(p.name)}</b>
          <small style="opacity:0.75;">(${escapeHtml(String(p.role || 'peer').toUpperCase())})</small>
        </span>
      `).join('');
    },

    loadRoomStorage(code) {
      try { return JSON.parse(sessionStorage.getItem('mednerd_csr_data_' + code) || '{}'); } catch (_) { return {}; }
    },

    saveRoomStorage() {
      try {
        sessionStorage.setItem('mednerd_csr_data_' + this.state.roomCode, JSON.stringify({
          messages: this.state.messages.slice(-60),
          files: this.state.files.slice(-15)
        }));
      } catch (_) {}
    },

    broadcast(payload, excludeConn = null) {
      if (this.state.channel) { try { this.state.channel.postMessage(payload); } catch (_) {} }
      this.state.connections.forEach(conn => {
        if (conn !== excludeConn && conn.open) { try { conn.send(payload); } catch (_) {} }
      });
    },

    handleIncomingPacket(msg, senderConn) {
      if (!msg || typeof msg !== 'object') return;
      if (this.state.isHostPeer && senderConn && msg.type !== 'HELLO_PEER') {
        this.broadcast(msg, senderConn);
      }

      if (msg.type === 'HELLO_PEER' && msg.peer) {
        if (senderConn) senderConn._peerMeta = msg.peer;
        const isNew = !this.state.participants[msg.peer.id];
        this.state.participants[msg.peer.id] = { ...msg.peer, status: 'online' };
        this.renderParticipantsBar();
        const count = Object.keys(this.state.participants).length;
        this.updateNetStatus(
          LANG === 'en' ? `Connected (${count} in room)` : `متصل الآن (${count} طلاب في الغرفة)`,
          'green'
        );
        if (isNew && msg.peer.id !== this.state.myPeerId) {
          this.addSystemNotice(`انضم (${msg.peer.name}) إلى غرفة الدراسة.`, `${msg.peer.name} joined the study room.`);
        }
        if (this.state.isHostPeer) {
          this.broadcast({
            type: 'FULL_SYNC',
            phase: this.state.phase,
            remainingSec: this.state.remainingSec,
            running: this.state.running,
            messages: this.state.messages,
            files: this.state.files,
            participants: this.state.participants
          });
        }
      } else if (msg.type === 'PEER_LEAVE' && msg.peerId) {
        delete this.state.participants[msg.peerId];
        this.renderParticipantsBar();
        if (msg.name) this.addSystemNotice(`غادر (${msg.name}) الغرفة.`, `${msg.name} left the room.`);
      } else if (msg.type === 'PARTICIPANTS_SYNC' && msg.participants) {
        this.state.participants = { ...msg.participants, ...this.state.participants };
        this.renderParticipantsBar();
      } else if (msg.type === 'FULL_SYNC') {
        this.state.phase = msg.phase;
        this.state.remainingSec = msg.remainingSec;
        this.state.running = msg.running;
        this.state.messages = msg.messages || [];
        this.state.files = msg.files || [];
        if (msg.participants) {
          this.state.participants = { ...msg.participants, [this.state.myPeerId]: this.state.participants[this.state.myPeerId] };
        }
        this.saveRoomStorage();
        this.syncIntervalLoop();
        this.updateTimerDOM();
        this.renderParticipantsBar();
        this.renderChatList();
        this.renderFileList();
        const count = Object.keys(this.state.participants).length;
        this.updateNetStatus(
          LANG === 'en' ? `Synced (${count} in room)` : `متزامن بنجاح (${count} طلاب في الغرفة)`,
          'green'
        );
      } else if (msg.type === 'TIMER_SYNC') {
        this.state.phase = msg.phase;
        this.state.remainingSec = msg.remainingSec;
        this.state.running = msg.running;
        this.syncIntervalLoop();
        this.updateTimerDOM();
      } else if (msg.type === 'CHAT_MSG') {
        if (!this.state.messages.some(m => m.id === msg.entry.id)) {
          this.state.messages.push(msg.entry);
          this.saveRoomStorage();
          this.renderChatList();
        }
      } else if (msg.type === 'FILE_ADD') {
        if (!this.state.files.some(f => f.id === msg.file.id)) {
          this.state.files.push(msg.file);
          this.saveRoomStorage();
          this.renderFileList();
        }
      } else if (msg.type === 'FILE_DEL') {
        this.state.files = this.state.files.filter(f => f.id !== msg.id);
        this.saveRoomStorage();
        this.renderFileList();
      }
    },

    formatTime(sec) {
      const m = Math.floor(Math.max(0, sec) / 60);
      const s = Math.max(0, sec) % 60;
      return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    },

    toggleTimer() {
      if (!this.permissions().canControlTimer) return;
      this.state.running = !this.state.running;
      this.syncIntervalLoop();
      this.updateTimerDOM();
      this.broadcast({ type: 'TIMER_SYNC', phase: this.state.phase, remainingSec: this.state.remainingSec, running: this.state.running });
    },

    switchPhase(newPhase) {
      if (!this.permissions().canControlTimer) return;
      this.state.running = false;
      this.state.phase = newPhase;
      this.state.remainingSec = newPhase === 'FOCUS' ? this.state.focusSec : this.state.breakSec;
      this.syncIntervalLoop();
      this.updateTimerDOM();
      this.broadcast({ type: 'TIMER_SYNC', phase: this.state.phase, remainingSec: this.state.remainingSec, running: false });
    },

    syncIntervalLoop() {
      if (this.state.intervalId) { clearInterval(this.state.intervalId); this.state.intervalId = null; }
      if (!this.state.running) return;
      this.state.intervalId = setInterval(() => {
        if (this.state.remainingSec > 0) {
          this.state.remainingSec--;
          this.updateTimerDOM();
        } else {
          if (this.state.phase === 'FOCUS') {
            MedStorage.recordStudyMinutes(Math.round(this.state.focusSec / 60), 'Study Room (' + this.state.roomCode + ')');
          }
          this.state.phase = this.state.phase === 'FOCUS' ? 'BREAK' : 'FOCUS';
          this.state.remainingSec = this.state.phase === 'FOCUS' ? this.state.focusSec : this.state.breakSec;
          this.updateTimerDOM();
        }
      }, 1000);
    },

    updateTimerDOM() {
      const disp = $('csrTimerClock'), badge = $('csrPhaseBadge'), btn = $('csrStartPauseBtn');
      if (disp) disp.textContent = this.formatTime(this.state.remainingSec);
      if (badge) {
        const isFocus = this.state.phase === 'FOCUS';
        badge.className = 'mn-ext-pill ' + (isFocus ? 'green' : 'mustard');
        badge.textContent = isFocus ? (LANG === 'en' ? 'FOCUS SESSION' : 'جلسة تركيز') : (LANG === 'en' ? 'REST BREAK' : 'استراحة');
      }
      if (btn) {
        btn.innerHTML = this.state.running
          ? `<i class="fa-solid fa-pause"></i> ${LANG === 'en' ? 'Pause' : 'إيقاف مؤقت'}`
          : `<i class="fa-solid fa-play"></i> ${LANG === 'en' ? 'Start' : 'بدء المؤقت'}`;
      }
    },

    changeRoleLive(newRole) {
      this.state.role = newRole;
      const sel = $('csr_role');
      if (sel) sel.value = newRole;
      if (this.state.participants[this.state.myPeerId]) {
        this.state.participants[this.state.myPeerId].role = newRole;
      }
      this.renderRoomUI();
      this.broadcast({ type: 'PARTICIPANTS_SYNC', participants: this.state.participants });
    },

    sendChatMessage() {
      if (!this.permissions().canChat) return;
      const inp = $('csrChatInput');
      if (!inp) return;
      const txt = inp.value.trim();
      if (!txt) return;
      inp.value = '';
      const entry = {
        id: 'm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
        user: this.state.userName,
        role: this.state.role,
        text: txt,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      this.state.messages.push(entry);
      this.saveRoomStorage();
      this.renderChatList();
      this.broadcast({ type: 'CHAT_MSG', entry });
    },

    async askRoomAI() {
      if (!this.permissions().canAskAiCoPilot || APP_STATE.isRequestInFlight) return;
      const inp = $('csrChatInput');
      const question = (inp && inp.value.trim()) || '';
      if (!question) return;
      inp.value = '';

      const userEntry = {
        id: 'm_' + Date.now(),
        user: this.state.userName + ' (@AI)',
        role: this.state.role,
        text: question,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      this.state.messages.push(userEntry);
      this.renderChatList();
      this.broadcast({ type: 'CHAT_MSG', entry: userEntry });

      const aiBtn = $('csrAskAiBtn');
      if (aiBtn) aiBtn.disabled = true;

      try {
        const sharedContext = this.state.files
          .filter(f => f.textPreview)
          .map(f => `[File: ${f.name}]\n${f.textPreview.slice(0, 1800)}`)
          .join('\n\n');
        const reply = await callGeminiAPI({
          systemInstruction: 'أنت مساعد دراسة طبي تعاوني داخل غرفة مذاكرة. أجب بإيجاز ودقة علمية عالية.' + SAFE_RULES,
          contents: [{ role: 'user', parts: [{ text: (sharedContext ? `ملفات الغرفة:\n${sharedContext}\n\n` : '') + `سؤال الطالب: ${question}` }] }]
        });
        const aiEntry = {
          id: 'm_' + Date.now() + '_ai',
          user: 'MEDNERD AI Co-Pilot',
          role: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        this.state.messages.push(aiEntry);
        this.saveRoomStorage();
        this.renderChatList();
        this.broadcast({ type: 'CHAT_MSG', entry: aiEntry });
      } catch (e) {
        renderToolError(e.message);
      } finally {
        if (aiBtn) aiBtn.disabled = false;
      }
    },

    async handleFilesDropped(fileList) {
      if (!this.permissions().canUpload || !fileList || !fileList.length) return;
      for (const file of Array.from(fileList)) {
        if (file.size > 4 * 1024 * 1024) {
          this.addSystemNotice(`حجم الملف (${file.name}) يتجاوز الحد المسموح للمشاركة المباشرة (4MB).`, `File (${file.name}) exceeds 4MB P2P limit.`);
          continue;
        }
        let textPreview = '';
        if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
          try { textPreview = await file.text(); } catch (_) {}
        } else if (file.name.toLowerCase().endsWith('.pdf')) {
          try { textPreview = await MedDependencyLoader.extractTextFromPdfFile(file, 5); } catch (_) {}
        }
        const b64 = await fileToBase64(file);
        const item = {
          id: 'f_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          name: file.name,
          sizeKB: Math.max(1, Math.round(file.size / 1024)),
          dataUrl: `data:${file.type || 'application/octet-stream'};base64,${b64}`,
          uploader: this.state.userName,
          textPreview
        };
        this.state.files.push(item);
        this.saveRoomStorage();
        this.renderFileList();
        this.broadcast({ type: 'FILE_ADD', file: item });
        this.addSystemNotice(`شارك (${this.state.userName}) الملف: ${file.name}`, `${this.state.userName} shared file: ${file.name}`);
      }
    },

    deleteFile(id) {
      if (!this.permissions().canDeleteFile) return;
      this.state.files = this.state.files.filter(f => f.id !== id);
      this.saveRoomStorage();
      this.renderFileList();
      this.broadcast({ type: 'FILE_DEL', id });
    },

    renderChatList() {
      const box = $('csrChatLog');
      if (!box) return;
      if (!this.state.messages.length) {
        box.innerHTML = `<p style="color:var(--muted-text);text-align:center;font-size:13px;margin:auto;">${LANG === 'en' ? 'No messages yet. Share the invite link above!' : 'لا توجد رسائل بعد. انسخ رابط الدعوة في الأعلى وأرسله لزملائك!'}</p>`;
        return;
      }
      box.innerHTML = this.state.messages.map(m => {
        if (m.role === 'system') {
          return `<div style="text-align:center;font-size:11.5px;color:var(--petrol);background:var(--petrol-soft);padding:5px 12px;border-radius:999px;margin:4px auto;font-weight:700;">${escapeHtml(m.text)} • ${escapeHtml(m.time || '')}</div>`;
        }
        return `
          <div class="chat-bubble ${m.user === this.state.userName ? 'user' : 'patient'}" style="max-width:92%;">
            <div style="display:flex;justify-content:space-between;gap:10px;font-size:11.5px;font-weight:800;margin-bottom:4px;opacity:0.85;">
              <span>${escapeHtml(m.user)} [${escapeHtml(String(m.role).toUpperCase())}]</span>
              <span>${escapeHtml(m.time || '')}</span>
            </div>
            <div data-notr="1">${m.role === 'ai' ? renderSafeMarkdown(m.text) : escapeHtml(m.text)}</div>
          </div>
        `;
      }).join('');
      box.scrollTop = box.scrollHeight;
    },

    renderFileList() {
      const listEl = $('csrFileList');
      if (!listEl) return;
      const perm = this.permissions();
      if (!this.state.files.length) {
        listEl.innerHTML = `<p style="font-size:12.5px;color:var(--muted-text);text-align:center;">${LANG === 'en' ? 'No shared files yet.' : 'لا توجد ملفات مشاركة حالياً.'}</p>`;
        return;
      }
      listEl.innerHTML = this.state.files.map(f => `
        <div class="csr-file-item">
          <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:65%;">
            <i class="fa-solid fa-file-medical" style="color:var(--petrol);margin-inline-end:6px;"></i>
            <b>${escapeHtml(f.name)}</b> <small style="color:var(--muted-text);">(${f.sizeKB} KB • ${escapeHtml(f.uploader)})</small>
          </div>
          <div style="display:flex;gap:6px;">
            <a href="${f.dataUrl}" download="${escapeHtml(f.name)}" class="btn-secondary" style="padding:4px 10px;font-size:12px;"><i class="fa-solid fa-download"></i></a>
            ${perm.canDeleteFile ? `<button type="button" class="btn-secondary" style="padding:4px 10px;font-size:12px;border-color:var(--danger);color:var(--danger);" onclick="window.MEDNERD_EXT.CollaborativeStudyRoom.deleteFile('${f.id}')"><i class="fa-solid fa-trash"></i></button>` : ''}
          </div>
        </div>
      `).join('');
    },

    renderRoomUI() {
      const c = $('toolOutputContainer');
      if (!c) return;
      const isEn = LANG === 'en';
      const perm = this.permissions();
      const roleLabels = { host: isEn ? 'HOST' : 'مضيف (تحكم كامل)', editor: isEn ? 'EDITOR' : 'محرر', viewer: isEn ? 'VIEWER' : 'مشاهد فقط' };
      const inviteUrl = this.getInviteUrl();

      c.innerHTML = `
        <div class="ai-output-box" data-notr="1">
          <div style="background:var(--petrol-soft);border:1.5px solid var(--petrol);border-radius:14px;padding:14px 16px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
            <div style="flex:1;min-width:220px;">
              <div style="font-weight:800;color:var(--petrol);font-size:14.5px;margin-bottom:4px;">
                <i class="fa-solid fa-share-nodes"></i> ${isEn ? 'Direct Invite Link (Click to Copy & Share)' : 'رابط الدعوة المباشر للغرفة (بمجرد فتحه يدخل زميلك تلقائياً)'}
              </div>
              <input type="text" class="form-input" value="${escapeHtml(inviteUrl)}" readonly dir="ltr" onclick="this.select()" style="font-size:12.5px;padding:6px 10px;background:var(--white);font-family:monospace;">
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
              <button type="button" class="btn-primary" style="padding:9px 14px;font-size:13px;" onclick="window.MEDNERD_EXT.CollaborativeStudyRoom.copyInviteLink(this)">
                <i class="fa-solid fa-link"></i> ${isEn ? 'Copy Link' : 'نسخ الرابط'}
              </button>
              <button type="button" class="btn-secondary" style="padding:9px 12px;font-size:13px;" onclick="window.MEDNERD_EXT.CollaborativeStudyRoom.copyRoomCodeOnly(this)">
                <i class="fa-solid fa-hashtag"></i> ${isEn ? 'Code' : 'الرمز'}
              </button>
              <button type="button" class="btn-telegram" style="padding:9px 12px;font-size:13px;" onclick="window.MEDNERD_EXT.CollaborativeStudyRoom.shareViaTelegram()">
                <i class="fa-brands fa-telegram"></i> Telegram
              </button>
              <button type="button" class="btn-primary" style="padding:9px 12px;font-size:13px;background:#25D366;" onclick="window.MEDNERD_EXT.CollaborativeStudyRoom.shareViaWhatsApp()">
                <i class="fa-brands fa-whatsapp"></i> WhatsApp
              </button>
            </div>
          </div>

          <div class="mn-ext-badge-bar" style="justify-content:space-between;">
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
              <span class="mn-ext-pill"><i class="fa-solid fa-door-open"></i> ${escapeHtml(this.state.roomCode)}</span>
              <span class="mn-ext-pill green"><i class="fa-solid fa-user-check"></i> ${escapeHtml(this.state.userName)}</span>
              <span class="mn-ext-pill mustard"><i class="fa-solid fa-user-shield"></i> ${roleLabels[this.state.role]}</span>
              <span id="csrNetBadge" class="mn-ext-pill"><i class="fa-solid fa-wifi"></i> ${isEn ? 'Connecting...' : 'جارٍ الربط...'}</span>
            </div>
            <div style="display:flex;gap:6px;align-items:center;">
              <button type="button" class="btn-secondary" style="padding:4px 10px;font-size:11.5px;" onclick="window.MEDNERD_EXT.CollaborativeStudyRoom.run()">
                <i class="fa-solid fa-rotate"></i> ${isEn ? 'Reconnect' : 'إعادة اتصال'}
              </button>
              <select class="form-select" style="width:auto;padding:4px 8px;font-size:12px;" onchange="window.MEDNERD_EXT.CollaborativeStudyRoom.changeRoleLive(this.value)">
                <option value="host" ${this.state.role === 'host' ? 'selected' : ''}>Host</option>
                <option value="editor" ${this.state.role === 'editor' ? 'selected' : ''}>Editor</option>
                <option value="viewer" ${this.state.role === 'viewer' ? 'selected' : ''}>Viewer</option>
              </select>
            </div>
          </div>

          <!-- قائمة المشاركين المتصلين فعلياً -->
          <div style="margin-bottom:12px;">
            <div style="font-size:12px;font-weight:800;color:var(--muted-text);margin-bottom:5px;">
              <i class="fa-solid fa-users"></i> ${isEn ? 'Active Participants in Room:' : 'المشاركون المتصلون حالياً في الغرفة:'}
            </div>
            <div id="csrPeersList" class="csr-peer-list"></div>
          </div>

          <div class="csr-grid">
            <div style="display:flex;flex-direction:column;gap:16px;">
              <div class="csr-panel">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <h4 style="margin:0;"><i class="fa-solid fa-stopwatch"></i> ${isEn ? 'Synced Pomodoro' : 'مؤقت بومودورو المتزامن'}</h4>
                  <span id="csrPhaseBadge" class="mn-ext-pill green">FOCUS</span>
                </div>
                <div id="csrTimerClock" class="csr-timer-display">${this.formatTime(this.state.remainingSec)}</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">
                  <button type="button" id="csrStartPauseBtn" class="btn-primary" style="padding:8px 16px;font-size:13.5px;" ${!perm.canControlTimer ? 'disabled' : ''} onclick="window.MEDNERD_EXT.CollaborativeStudyRoom.toggleTimer()">
                    <i class="fa-solid fa-play"></i> ${isEn ? 'Start' : 'بدء المؤقت'}
                  </button>
                  <button type="button" class="btn-secondary" style="padding:8px 12px;font-size:13px;" ${!perm.canControlTimer ? 'disabled' : ''} onclick="window.MEDNERD_EXT.CollaborativeStudyRoom.switchPhase('FOCUS')">${isEn ? 'Focus' : 'تركيز'}</button>
                  <button type="button" class="btn-secondary" style="padding:8px 12px;font-size:13px;" ${!perm.canControlTimer ? 'disabled' : ''} onclick="window.MEDNERD_EXT.CollaborativeStudyRoom.switchPhase('BREAK')">${isEn ? 'Break' : 'استراحة'}</button>
                </div>
              </div>

              <div class="csr-panel">
                <h4 style="margin:0;"><i class="fa-solid fa-folder-open"></i> ${isEn ? 'Shared File Hub (PDF/TXT/Images)' : 'مشاركة الملفات والمحاضرات'}</h4>
                <div id="csrDropzone" class="csr-dropzone ${!perm.canUpload ? 'disabled' : ''}">
                  <i class="fa-solid fa-cloud-arrow-up" style="font-size:24px;margin-bottom:6px;display:block;"></i>
                  ${perm.canUpload ? (isEn ? 'Drag & drop study files (up to 4MB)' : 'اسحب وأفلت ملفات الدراسة هنا أو اضغط للاختيار') : (isEn ? 'Read-Only Mode' : 'وضع المشاهدة فقط')}
                  <input type="file" id="csrHiddenFileInput" style="display:none;" multiple ${!perm.canUpload ? 'disabled' : ''}>
                </div>
                <div id="csrFileList" style="display:flex;flex-direction:column;gap:8px;max-height:190px;overflow-y:auto;"></div>
              </div>
            </div>

            <div class="csr-panel">
              <h4 style="margin:0;"><i class="fa-solid fa-comments"></i> ${isEn ? 'Live Room Chat & AI Study Co-Pilot' : 'المحادثة الجماعية الفورية ومساعد الذكاء الاصطناعي'}</h4>
              <div id="csrChatLog" class="chat-container" style="height:310px;margin-bottom:6px;"></div>
              <div style="display:flex;gap:8px;">
                <input type="text" id="csrChatInput" class="form-input" ${!perm.canChat ? 'disabled' : ''} placeholder="${perm.canChat ? (isEn ? 'Type message or question for @AI...' : 'اكتب رسالة لزملائك أو سؤالاً طبياً واضغط AI...') : (isEn ? 'Read-only' : 'للقراءة فقط')}">
                <button type="button" class="btn-primary" style="padding:10px 16px;" ${!perm.canChat ? 'disabled' : ''} onclick="window.MEDNERD_EXT.CollaborativeStudyRoom.sendChatMessage()"><i class="fa-solid fa-paper-plane"></i></button>
                <button type="button" id="csrAskAiBtn" class="btn-secondary" title="Ask MEDNERD AI Co-Pilot" ${!perm.canAskAiCoPilot ? 'disabled' : ''} onclick="window.MEDNERD_EXT.CollaborativeStudyRoom.askRoomAI()"><i class="fa-solid fa-robot"></i> AI</button>
              </div>
            </div>
          </div>
        </div>`;

      this.updateTimerDOM();
      this.renderParticipantsBar();
      this.renderChatList();
      this.renderFileList();

      const chatInp = $('csrChatInput');
      if (chatInp) chatInp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); this.sendChatMessage(); } };

      const dz = $('csrDropzone'), fi = $('csrHiddenFileInput');
      if (dz && fi && perm.canUpload) {
        dz.onclick = () => fi.click();
        fi.onchange = () => { this.handleFilesDropped(fi.files); fi.value = ''; };
        dz.ondragover = e => { e.preventDefault(); dz.classList.add('dragover'); };
        dz.ondragleave = () => dz.classList.remove('dragover');
        dz.ondrop = e => { e.preventDefault(); dz.classList.remove('dragover'); this.handleFilesDropped(e.dataTransfer.files); };
      }
    }
  };

  /* ==========================================================================
     MODULE 3: MEDPATIENT CLINICAL & VOICE SIMULATOR (تطوير شامل للمحاكاة السريرية
     والصوتية مع طلب التحاليل والأشعة، التشخيص التفريقي، الخطة العلاجية، وتقييم 6 محاور)
     ========================================================================== */
  const MedPatientVoice = {
    state: {
      recognition: null,
      listening: false,
      speaking: false,
      processing: false,
      autoSpeak: true,
      autoSubmitVoice: false,
      vlang: 'ar-SA',
      complaint: '',
      tone: '',
      history: [],
      orderedInvestigations: []
    },

    cleanup() {
      this.stopListening();
      MedVoiceEngine.stop();
      this.state.speaking = false;
      this.state.processing = false;
    },

    systemPrompt() {
      return `أنت مريض حقيقي في محاكاة سريرية وصوتية (OSCE) لطلاب الطب.
الشكوى الرئيسية والسيناريو: (${this.state.complaint}).
الحالة الشعورية: (${this.state.tone}).
القواعد الصارمة:
1. عندما يسألك الطبيب سؤالاً في القصة المرضية، أجب بلسان المريض فقط بجمل طبيعية واضحـة (1 إلى 3 جمل) دون كشف التشخيص النهائي أبداً.
2. إذا طلب الطبيب فحصاً سريرياً أو تحليلاً مخبرياً أو صورة شعاعية أو تخطيط قلب بصيغة [طلب فحص: ...]، قدّم نتيجة الفحص السريري/المخبري الواقعية المتوافقة مع حالتك المرضية بوضوح تحت ترويسة [نتيجة الفحص المطلوب] ثم أضف تعليقاً قصيراً بلسان المريض.`;
    },

    async run() {
      if (APP_STATE.isRequestInFlight) return;
      this.cleanup();
      this.state.complaint = ($('vp_complaint') && $('vp_complaint').value.trim()) || (LANG === 'en' ? '55-year-old male with acute retrosternal chest pain radiating to left jaw' : 'رجل 55 سنة يعاني من ألم صدري عاصر خلف القص يمتد للفك الأيسر منذ ساعة مع تعرق');
      this.state.tone = ($('vp_tone') && $('vp_tone').value) || 'Anxious';
      this.state.vlang = ($('vp_vlang') && $('vp_vlang').value) || (LANG === 'en' ? 'en-US' : 'ar-SA');
      MedVoiceEngine.state.lang = this.state.vlang;
      this.state.orderedInvestigations = [];
      this.state.history = [{ role: 'user', parts: [{ text: `ابدأ المحاكاة الصوتية الآن. قدم نفسك كمريض في جملتين تصف شكواك الرئيسية وشعورك الحالي، وانتظر سؤالي.` }] }];

      setToolLoadingState(true, LANG === 'en' ? 'Initializing clinical & voice encounter...' : 'جارٍ تهيئة المريض الافتراضي والنظام الصوتي...');
      $('toolOutputContainer').innerHTML = '';

      try {
        const opening = await callGeminiAPI({
          systemInstruction: this.systemPrompt() + SAFE_RULES,
          contents: this.state.history,
          generationConfig: { maxOutputTokens: 1024 }
        });
        this.state.history.push({ role: 'model', parts: [{ text: opening }] });
        this.mountVoiceUI();
        this.appendVoiceLog('patient', opening);
        this.speakPatientReply(opening);
      } catch (e) {
        renderToolError(e.message, () => this.run());
      } finally {
        setToolLoadingState(false);
      }
    },

    mountVoiceUI() {
      const c = $('toolOutputContainer');
      if (!c) return;
      const isEn = LANG === 'en';
      const hasSR = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

      c.innerHTML = `
        <div class="ai-output-box" data-notr="1">
          ${MedVoiceEngine.renderVoiceControlToolbar('vpVoiceCtrl', this.state.vlang)}

          <div class="vp-orb-wrap">
            <button type="button" id="vpMicBtn" class="vp-mic-btn" onclick="window.MEDNERD_EXT.MedPatientVoice.toggleMic()">
              <i class="fa-solid fa-microphone"></i>
            </button>
            <p id="vpStatusLabel" style="font-weight:800;color:var(--petrol);margin-top:12px;font-size:14.5px;">
              ${hasSR ? (isEn ? 'Tap microphone to speak (Review text below before sending)' : 'اضغط زر الميكروفون للتحدث بصوتك (يمكنك مراجعة النص وتعديله قبل الإرسال)') : (isEn ? 'Speech Recognition not supported on this browser — use text input below' : 'التعرف الصوتي غير مدعوم في هذا المتصفح — استخدم الكتابة أدناه')}
            </p>
            <div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:8px;font-size:12.5px;">
              <label class="checkbox-label">
                <input type="checkbox" checked onchange="window.MEDNERD_EXT.MedPatientVoice.state.autoSpeak = this.checked; window.MEDNERD_EXT.MedVoiceEngine.state.muted = !this.checked; if(!this.checked) window.MEDNERD_EXT.MedVoiceEngine.stop();">
                <span>${isEn ? 'Auto-speak patient replies' : 'نطق ردود المريض تلقائياً'}</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" onchange="window.MEDNERD_EXT.MedPatientVoice.state.autoSubmitVoice = this.checked">
                <span>${isEn ? 'Auto-send immediately after speaking' : 'إرسال فوري بعد انتهاء الكلام دون تعديل'}</span>
              </label>
            </div>
          </div>

          <div id="vpChatLog" class="chat-container" style="max-height:330px;"></div>

          <!-- إدخال السؤال السريري أو تصحيح نص الميكروفون -->
          <div style="display:flex;gap:8px;margin-bottom:12px;">
            <input type="text" id="vpTextInput" class="form-input" placeholder="${isEn ? 'Speak via mic or type open/focused question here...' : 'تحدث بالميكروفون أو اكتب سؤالك المفتوح/الموجه للمريض هنا...'}">
            <button type="button" id="vpSendBtn" class="btn-primary" style="padding:10px 18px;" onclick="window.MEDNERD_EXT.MedPatientVoice.submitDoctorTurn()"><i class="fa-solid fa-paper-plane"></i></button>
          </div>

          <!-- قسم طلب الفحوصات السريرية والمخبرية والشعاعية -->
          <div style="background:var(--bg-elevated);border:1px solid var(--border-color);border-radius:12px;padding:12px;margin-bottom:14px;">
            <div style="font-size:13px;font-weight:800;color:var(--petrol);margin-bottom:8px;">
              <i class="fa-solid fa-microscope"></i> ${isEn ? 'Order Physical Exam, Labs or Imaging (Results revealed on request):' : 'طلب فحص سريري أو تحاليل مخبرية أو استقصاءات شعاعية (تظهر النتيجة عند طلبها):'}
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">
              <button type="button" class="btn-secondary" style="padding:5px 10px;font-size:12px;" onclick="window.MEDNERD_EXT.MedPatientVoice.orderInvestigation('العلامات الحيوية والفحص العام (Vital Signs & General Exam)')">Vital Signs</button>
              <button type="button" class="btn-secondary" style="padding:5px 10px;font-size:12px;" onclick="window.MEDNERD_EXT.MedPatientVoice.orderInvestigation('تخطيط القلب الكهربائي 12 مسرى (12-Lead ECG)')">12-Lead ECG</button>
              <button type="button" class="btn-secondary" style="padding:5px 10px;font-size:12px;" onclick="window.MEDNERD_EXT.MedPatientVoice.orderInvestigation('تعداد دم كامل، شوارد، وظائف كبد وكلية، تروبونين (CBC, BMP, Troponin)')">CBC / Chem / Troponin</button>
              <button type="button" class="btn-secondary" style="padding:5px 10px;font-size:12px;" onclick="window.MEDNERD_EXT.MedPatientVoice.orderInvestigation('صورة صدر شعاعية (Chest X-Ray)')">Chest X-Ray</button>
            </div>
            <div style="display:flex;gap:8px;">
              <input type="text" id="vpCustomOrderInput" class="form-input" style="font-size:13px;padding:7px 10px;" placeholder="${isEn ? 'Or type specific exam/lab/imaging order (e.g., Fundoscopy, CT Angiogram, Lumbar Puncture)...' : 'أو اكتب فحصاً محدداً تطلبه (مثال: إصغاء الصدر، إيكو قلب، طبقي محوري)...'}">
              <button type="button" class="btn-secondary" style="padding:7px 14px;font-size:12.5px;" onclick="window.MEDNERD_EXT.MedPatientVoice.orderCustomInvestigation()">
                <i class="fa-solid fa-flask"></i> ${isEn ? 'Order' : 'طلب الفحص'}
              </button>
            </div>
          </div>

          <!-- قسم التشخيص التفريقي والنهائي والخطة العلاجية والتقييم -->
          <div style="padding:14px;border-radius:12px;border:1px solid var(--border-color);background:var(--white);">
            <h4 style="margin:0 0 10px 0;color:var(--petrol);"><i class="fa-solid fa-user-doctor"></i> ${isEn ? 'Clinical Submission & Final OSCE Assessment' : 'تقديم التشخيص والخطة العلاجية والتقييم الختامي'}</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-bottom:10px;">
              <input type="text" id="vpDiffDx" class="form-input" placeholder="${isEn ? '1. Differential Diagnoses (DDx)...' : '1. التشخيصات التفريقية (DDx)...'}">
              <input type="text" id="vpProvisionalDx" class="form-input" placeholder="${isEn ? '2. Final / Primary Diagnosis...' : '2. التشخيص النهائي المرجح...'}">
              <input type="text" id="vpManagementPlan" class="form-input" placeholder="${isEn ? '3. Initial Management & Tx Plan...' : '3. الخطة العلاجية والتدبير الإسعافي...'}">
            </div>
            <button type="button" id="vpEndBtn" class="btn-primary" style="width:100%;background:var(--dark-green);" onclick="window.MEDNERD_EXT.MedPatientVoice.evaluateEncounter()">
              <i class="fa-solid fa-clipboard-check"></i> ${isEn ? 'End Encounter & Generate 6-Domain OSCE Report' : 'إنهاء المقابلة وإصدار تقرير التقييم السريري المفصل (6 محاور)'}
            </button>
          </div>

          <div id="vpFeedbackBox"></div>
        </div>`;

      const inp = $('vpTextInput');
      if (inp) inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); this.submitDoctorTurn(); } };
    },

    updateOrbState(mode, customLabel) {
      const btn = $('vpMicBtn');
      const lbl = $('vpStatusLabel');
      if (!btn) return;
      btn.classList.remove('listening', 'speaking', 'processing');
      if (mode === 'listening') btn.classList.add('listening');
      if (mode === 'speaking') btn.classList.add('speaking');
      if (mode === 'processing') btn.classList.add('processing');
      if (lbl && customLabel) lbl.textContent = customLabel;
    },

    speakPatientReply(text) {
      if (!this.state.autoSpeak) return;
      // إيقاف الميكروفون فوراً أثناء نطق المريض لمنع التقاط صوت السماعة
      if (this.state.listening) this.stopListening();
      MedVoiceEngine.speak(
        text,
        this.state.vlang,
        () => {
          this.state.speaking = true;
          this.updateOrbState('speaking', LANG === 'en' ? '🔊 Patient is speaking...' : '🔊 المريض يتحدث الآن...');
        },
        () => {
          this.state.speaking = false;
          this.updateOrbState('idle', LANG === 'en' ? 'Tap microphone to speak or type below' : 'اضغط الميكروفون للتحدث أو اكتب سؤالك أدناه');
        }
      );
    },

    toggleMic() {
      if (this.state.listening) {
        this.stopListening();
        return;
      }
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) {
        renderToolError(LANG === 'en' ? 'Browser does not support Web Speech Recognition.' : 'متصفحك لا يدعم ميزة التعرف على الكلام صوتياً، يمكنك الكتابة في الحقل النصي.');
        return;
      }
      // إيقاف نطق المريض قبل فتح الميكروفون
      MedVoiceEngine.stop();

      const rec = new SR();
      rec.lang = this.state.vlang;
      rec.interimResults = true;
      rec.continuous = false;
      let finalTranscript = '';

      rec.onstart = () => {
        this.state.listening = true;
        this.updateOrbState('listening', LANG === 'en' ? '🎙️ Listening... Speak clearly now' : '🎙️ جارٍ الاستماع لصوتك... تحدث بوضوح الآن');
      };

      rec.onresult = event => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const piece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += (finalTranscript ? ' ' : '') + piece.trim();
          } else {
            interim += piece;
          }
        }
        const inp = $('vpTextInput');
        if (inp) inp.value = (finalTranscript + ' ' + interim).trim();

        if (event.results[event.results.length - 1].isFinal) {
          this.stopListening();
          if (this.state.autoSubmitVoice) {
            this.submitDoctorTurn();
          } else {
            this.updateOrbState('idle', LANG === 'en' ? '✓ Speech captured — review text below and press Send' : '✓ تم التقاط صوتك — راجع النص في الحقل أدناه أو عدّله ثم اضغط إرسال');
          }
        }
      };

      rec.onerror = () => {
        this.stopListening();
        this.updateOrbState('idle', LANG === 'en' ? 'Mic stopped — tap again or type below' : 'توقف الميكروفون — اضغط مجدداً أو اكتب سؤالك');
      };
      rec.onend = () => this.stopListening();
      this.state.recognition = rec;
      try { rec.start(); } catch (_) { this.stopListening(); }
    },

    stopListening() {
      this.state.listening = false;
      if (this.state.recognition) {
        try { this.state.recognition.stop(); } catch (_) {}
        this.state.recognition = null;
      }
      $('vpMicBtn')?.classList.remove('listening');
    },

    appendVoiceLog(role, text) {
      const log = $('vpChatLog');
      if (!log) return;
      const b = document.createElement('div');
      b.className = 'chat-bubble ' + (role === 'user' ? 'user' : 'patient');
      const roleTitle = role === 'user'
        ? (LANG === 'en' ? 'Doctor (You):' : 'الطبيب (أنت):')
        : role === 'lab'
          ? (LANG === 'en' ? 'Clinical Investigation Result:' : 'نتيجة الفحص / الاستقصاء:')
          : (LANG === 'en' ? 'Patient:' : 'المريض:');
      b.innerHTML = `<div style="font-weight:800;font-size:12px;margin-bottom:4px;">${roleTitle}</div><div data-notr="1">${role === 'lab' ? renderSafeMarkdown(text) : escapeHtml(text)}</div>`;
      log.appendChild(b);
      log.scrollTop = log.scrollHeight;
    },

    async orderCustomInvestigation() {
      const inp = $('vpCustomOrderInput');
      if (!inp || !inp.value.trim()) return;
      const orderName = inp.value.trim();
      inp.value = '';
      await this.orderInvestigation(orderName);
    },

    async orderInvestigation(orderName) {
      if (APP_STATE.isRequestInFlight) return;
      this.state.orderedInvestigations.push(orderName);
      const promptText = `[طلب فحص سريري/مخبري/شعاعي]: طلب الطبيب إجراء (${orderName}). أعطِ النتيجة السريرية أو المخبرية الدقيقة المتوافقة مع سيناريو الحالة دون كشف اسم التشخيص النهائي صراحةً.`;
      this.appendVoiceLog('user', `🔬 طلب فحص: ${orderName}`);
      this.state.history.push({ role: 'user', parts: [{ text: promptText }] });

      APP_STATE.isRequestInFlight = true;
      this.updateOrbState('processing', LANG === 'en' ? '⏳ Processing clinical order...' : '⏳ جارٍ استخراج نتيجة الفحص...');
      try {
        const reply = await callGeminiAPI({
          systemInstruction: this.systemPrompt() + SAFE_RULES,
          contents: this.state.history,
          generationConfig: { maxOutputTokens: 1024 }
        });
        this.state.history.push({ role: 'model', parts: [{ text: reply }] });
        this.appendVoiceLog('lab', reply);
        this.updateOrbState('idle', LANG === 'en' ? 'Investigation result ready' : 'ظهرت نتيجة الفحص في السجل أدناه');
      } catch (e) {
        this.state.history.pop();
        renderToolError(e.message);
      } finally {
        APP_STATE.isRequestInFlight = false;
      }
    },

    async submitDoctorTurn() {
      if (APP_STATE.isRequestInFlight) return;
      const inp = $('vpTextInput');
      if (!inp) return;
      const q = inp.value.trim();
      if (!q) return;
      inp.value = '';
      this.appendVoiceLog('user', q);
      this.state.history.push({ role: 'user', parts: [{ text: q }] });
      APP_STATE.isRequestInFlight = true;
      this.updateOrbState('processing', LANG === 'en' ? '⏳ Patient is thinking...' : '⏳ جارٍ معالجة السؤال...');
      try {
        const reply = await callGeminiAPI({
          systemInstruction: this.systemPrompt() + SAFE_RULES,
          contents: this.state.history,
          generationConfig: { maxOutputTokens: 1024 }
        });
        this.state.history.push({ role: 'model', parts: [{ text: reply }] });
        this.appendVoiceLog('patient', reply);
        this.speakPatientReply(reply);
      } catch (e) {
        this.state.history.pop();
        renderToolError(e.message);
        this.updateOrbState('idle', '');
      } finally {
        APP_STATE.isRequestInFlight = false;
      }
    },

    async evaluateEncounter() {
      if (APP_STATE.isRequestInFlight) return;
      this.cleanup();
      const ddx = ($('vpDiffDx') && $('vpDiffDx').value.trim()) || 'لم يُذكر';
      const provDx = ($('vpProvisionalDx') && $('vpProvisionalDx').value.trim()) || 'لم يُذكر';
      const mgmt = ($('vpManagementPlan') && $('vpManagementPlan').value.trim()) || 'لم يُذكر';
      const orders = this.state.orderedInvestigations.join('، ') || 'لم تُطلب فحوصات';
      const box = $('vpFeedbackBox');
      if (box) box.innerHTML = `<div style="padding:14px;color:var(--petrol);font-weight:700;"><span class="loading-spinner req-spin"></span> جارٍ إعداد تقييم المقابلة السريرية الشامل (6 محاور)...</div>`;

      APP_STATE.isRequestInFlight = true;
      try {
        const evalPrompt = `[تقييم المقابلة السريرية الختامي OSCE]:
- الفحوصات التي طلبها الطالب: (${orders})
- التشخيص التفريقي المقدم: (${ddx})
- التشخيص النهائي المقدم: (${provDx})
- الخطة العلاجية المقدمة: (${mgmt})

قدّم تقريراً تقييمياً شاملاً ومفصلاً يتضمن الدرجة من 100 موزعة على المحاور الستة الإلزامية التالية:
1. أخذ القصة المرضية (History Taking)
2. المحاكمة السريرية (Clinical Reasoning)
3. اختيار الاستقصاءات والفحوصات (Investigation Selection)
4. دقة التشخيص التفريقي والنهائي (Diagnosis)
5. الخطة العلاجية والتدبير (Management)
6. مهارات التواصل الطبي (Communication Skills)`;

        const report = await callGeminiAPI({
          systemInstruction: this.systemPrompt() + SAFE_RULES,
          contents: [...this.state.history, { role: 'user', parts: [{ text: evalPrompt }] }]
        });
        MedStorage.recordStudyMinutes(15, 'MedPatient OSCE: ' + this.state.complaint.slice(0, 35));
        if (box) {
          box.innerHTML = `<div style="margin-top:18px;padding:20px;border-radius:14px;background:var(--dark-green-soft);border:1.5px solid var(--dark-green);"><div data-notr="1">${renderSafeMarkdown(report)}</div></div>`;
          addExportBar(box.firstElementChild, report, 'mednerd-osce-voice-report');
        }
      } catch (e) {
        if (box) box.innerHTML = `<div class="error-alert">${escapeHtml(e.message)}</div>`;
      } finally {
        APP_STATE.isRequestInFlight = false;
      }
    }
  };

  /* ==========================================================================
     MODULE 4: MEDICAL AUDIO & LECTURE TRANSCRIBER (مُطورة مع Web Audio API
     طيف صوتي حي ودعم كامل لصيغ الصوت على iPad Safari و Chrome)
     ========================================================================== */
  const MedicalTranscriber = {
    state: {
      mediaRecorder: null,
      chunks: [],
      recordedBlob: null,
      recordedMime: '',
      previewUrl: '',
      isRecording: false,
      secElapsed: 0,
      timerId: null,
      audioCtx: null,
      analyserId: null
    },

    cleanup() {
      if (this.state.timerId) { clearInterval(this.state.timerId); this.state.timerId = null; }
      if (this.state.analyserId) { cancelAnimationFrame(this.state.analyserId); this.state.analyserId = null; }
      if (this.state.audioCtx) { try { this.state.audioCtx.close(); } catch (_) {} this.state.audioCtx = null; }
      if (this.state.mediaRecorder && this.state.isRecording) { try { this.state.mediaRecorder.stop(); } catch (_) {} }
      this.state.isRecording = false;
    },

    injectRecorderWidget() {
      const fileInput = $('at_file');
      if (!fileInput || $('atLiveRecorderWidget')) return;
      const isEn = LANG === 'en';
      const wrap = document.createElement('div');
      wrap.id = 'atLiveRecorderWidget';
      wrap.className = 'at-recorder-box';
      wrap.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;">
          <span id="atRecDot" class="at-rec-dot"></span>
          <div>
            <div style="font-weight:800;font-size:14px;color:var(--petrol);">${isEn ? 'Live Lecture Microphone Recorder' : 'مسجل المحاضرات الصوتي المباشر'}</div>
            <small id="atRecStatus" style="color:var(--muted-text);">${isEn ? 'Record directly from mic or upload audio file above' : 'سجّل من الميكروفون مباشرة أو ارفع ملفاً صوتياً أعلاه'}</small>
          </div>
        </div>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
          <canvas id="atWaveCanvas" width="130" height="32" style="background:var(--white);border:1px solid var(--border-color);border-radius:8px;display:none;"></canvas>
          <button type="button" id="atRecBtn" class="btn-secondary" onclick="window.MEDNERD_EXT.MedicalTranscriber.toggleRecording()">
            <i class="fa-solid fa-microphone-lines"></i> <span>${isEn ? 'Start Recording' : 'بدء التسجيل'}</span>
          </button>
          <audio id="atAudioPreview" controls style="display:none;height:36px;max-width:220px;"></audio>
        </div>`;
      fileInput.parentElement.insertAdjacentElement('afterend', wrap);
    },

    startAudioVisualizer(stream) {
      const canvas = $('atWaveCanvas');
      if (!canvas) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      try {
        canvas.style.display = 'block';
        const audioCtx = new AudioCtx();
        this.state.audioCtx = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        const dataArr = new Uint8Array(analyser.frequencyBinCount);
        const ctx = canvas.getContext('2d');

        const draw = () => {
          if (!this.state.isRecording) return;
          this.state.analyserId = requestAnimationFrame(draw);
          analyser.getByteFrequencyData(dataArr);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const barW = 4;
          let x = 2;
          for (let i = 0; i < 20; i++) {
            const h = Math.max(3, Math.round((dataArr[i] / 255) * 28));
            ctx.fillStyle = '#0e7490';
            ctx.fillRect(x, canvas.height - h, barW, h);
            x += barW + 2;
          }
        };
        draw();
      } catch (_) {}
    },

    async toggleRecording() {
      const isEn = LANG === 'en';
      if (this.state.isRecording) {
        this.cleanup();
        $('atRecDot')?.classList.remove('active');
        if ($('atWaveCanvas')) $('atWaveCanvas').style.display = 'none';
        const btn = $('atRecBtn');
        if (btn) btn.innerHTML = `<i class="fa-solid fa-microphone-lines"></i> <span>${isEn ? 'Re-record' : 'إعادة التسجيل'}</span>`;
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        });
        let mime = 'audio/webm';
        if (typeof MediaRecorder !== 'undefined') {
          if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) mime = 'audio/webm;codecs=opus';
          else if (MediaRecorder.isTypeSupported('audio/mp4')) mime = 'audio/mp4';
          else if (MediaRecorder.isTypeSupported('audio/ogg')) mime = 'audio/ogg';
        }
        const mr = new MediaRecorder(stream);
        this.state.chunks = [];
        this.state.recordedBlob = null;
        this.state.recordedMime = mr.mimeType || mime;
        this.state.secElapsed = 0;

        mr.ondataavailable = e => { if (e.data && e.data.size > 0) this.state.chunks.push(e.data); };
        mr.onstop = () => {
          stream.getTracks().forEach(t => t.stop());
          this.state.recordedBlob = new Blob(this.state.chunks, { type: this.state.recordedMime });
          if (this.state.previewUrl) URL.revokeObjectURL(this.state.previewUrl);
          this.state.previewUrl = URL.createObjectURL(this.state.recordedBlob);
          const audioEl = $('atAudioPreview');
          if (audioEl) { audioEl.src = this.state.previewUrl; audioEl.style.display = 'block'; }
          const st = $('atRecStatus');
          if (st) st.textContent = isEn ? `Recorded ${this.state.secElapsed}s — Ready` : `تم تسجيل ${this.state.secElapsed} ثانية — جاهز للتفريغ`;
        };

        mr.start();
        this.state.mediaRecorder = mr;
        this.state.isRecording = true;
        this.startAudioVisualizer(stream);
        $('atRecDot')?.classList.add('active');
        const btn = $('atRecBtn');
        if (btn) btn.innerHTML = `<i class="fa-solid fa-stop" style="color:var(--danger);"></i> <span>${isEn ? 'Stop' : 'إيقاف'}</span>`;
        this.state.timerId = setInterval(() => {
          this.state.secElapsed++;
          const st = $('atRecStatus');
          if (st) st.textContent = (isEn ? 'Recording... ' : 'جارٍ التسجيل... ') + this.state.secElapsed + 's';
        }, 1000);
      } catch (e) {
        renderToolError(e.message);
      }
    },

    resolveAudioMime(file) {
      if (file.type && file.type.startsWith('audio/')) {
        return file.type.split(';')[0];
      }
      const ext = (file.name || '').split('.').pop().toLowerCase();
      const map = {
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
        m4a: 'audio/mp4',
        mp4: 'audio/mp4',
        aac: 'audio/aac',
        ogg: 'audio/ogg',
        webm: 'audio/webm'
      };
      return map[ext] || 'audio/mpeg';
    },

    async run() {
      if (APP_STATE.isRequestInFlight) return;
      const fileInp = $('at_file');
      const uploadedFile = fileInp && fileInp.files && fileInp.files[0];
      const spec = ($('at_spec') && $('at_spec').value.trim()) || 'General Medicine';
      const mode = ($('at_mode') && $('at_mode').value) || 'complete';
      const maxBytes = (typeof GEMINI_CONFIG === 'object' && GEMINI_CONFIG.maxFileSizeBytes) ? GEMINI_CONFIG.maxFileSizeBytes : 15 * 1024 * 1024;

      let targetBlob = null, mimeType = '';
      if (uploadedFile) {
        if (uploadedFile.size > maxBytes) { renderToolError('حجم الملف الصوتي يتجاوز الحد المسموح (15MB).'); return; }
        targetBlob = uploadedFile;
        mimeType = this.resolveAudioMime(uploadedFile);
      } else if (this.state.recordedBlob) {
        targetBlob = this.state.recordedBlob;
        mimeType = (this.state.recordedMime || 'audio/webm').split(';')[0];
      } else {
        renderToolError('يرجى رفع ملف صوتي أو تسجيل مقطع صوتي أولاً.');
        return;
      }

      setToolLoadingState(true, 'جارٍ تفريغ الصوت وضبط المصطلحات الطبية...');
      $('toolOutputContainer').innerHTML = '';

      try {
        const b64 = await fileToBase64(targetBlob);
        const sysPrompt = `أنت محرر ومحاضر طبي متخصص في تفريغ المحاضرات الصوتية الطبية بدقة (التخصص: ${spec} | الوضع: ${mode}). قدم: 1) النص المفرّغ 2) ملاحظات منظمة 3) نقاط امتحانية عالية العائد.`;
        const output = await callGeminiAPI({
          systemInstruction: sysPrompt + SAFE_RULES,
          contents: [{ role: 'user', parts: [{ text: `فرّغ وحلّل هذا التسجيل الصوتي الطبي.` }, { inlineData: { mimeType, data: b64 } }] }]
        });
        MedStorage.recordStudyMinutes(15, 'Audio Transcriber: ' + spec);
        renderToolOutput(output);
      } catch (e) {
        renderToolError(e.message, () => this.run());
      } finally {
        setToolLoadingState(false);
      }
    }
  };

  /* ==========================================================================
     MODULE 5: TIMED CLINICAL EXAM ARENA (مربوطة بلوحة التقدم MedProgress)
     ========================================================================== */
  const TimedExamArena = {
    state: { topic: '', questions: [], currentIndex: 0, timerMode: 'total', secPerQ: 60, remainingSec: 0, timerId: null, qStartTimestamp: 0, finished: false },
    cleanup() { if (this.state.timerId) { clearInterval(this.state.timerId); this.state.timerId = null; } },
    async run() {
      if (APP_STATE.isRequestInFlight) return;
      this.cleanup();
      const topic = ($('tea_topic') && $('tea_topic').value.trim()) || '';
      const count = Math.min(Math.max(parseInt(($('tea_count') && $('tea_count').value) || '5', 10), 3), 15);
      const tmode = ($('tea_tmode') && $('tea_tmode').value) || 'total';
      const tsec = parseInt(($('tea_tsec') && $('tea_tsec').value) || '60', 10) || 60;

      if (!topic) { renderToolError('يرجى تحديد موضوع الامتحان.'); return; }
      this.state.topic = topic.slice(0, 60);

      setToolLoadingState(true, 'جارٍ إعداد الحالات السريرية الموقّتة...');
      $('toolOutputContainer').innerHTML = '';

      const sysPrompt = `أنت رئيس لجنة امتحانات سريرية. أنشئ (${count}) أسئلة سريرية حول الموضوع المحدد بصيغة JSON فقط:
{
  "questions": [
    { "id": 1, "domain": "التخصص", "stem": "الحالة", "options": ["A", "B", "C", "D"], "correctIndex": 0, "rationale": "التفسير العلمي" }
  ]
}`;

      try {
        const raw = await callGeminiAPI({ systemInstruction: sysPrompt + SAFE_RULES, contents: [{ role: 'user', parts: [{ text: topic }] }] });
        const parsed = extractJsonBlock(raw);
        if (!parsed.questions || !parsed.questions.length) throw new Error('No questions generated.');

        this.state.questions = parsed.questions.map((q, idx) => ({
          id: idx + 1, domain: q.domain || 'Clinical Medicine', stem: q.stem || '',
          options: Array.isArray(q.options) ? q.options.slice(0, 5) : ['A', 'B', 'C', 'D'],
          correctIndex: Number.isInteger(q.correctIndex) ? q.correctIndex : 0,
          rationale: q.rationale || '', selected: null, timeSpentSec: 0
        }));

        this.state.currentIndex = 0;
        this.state.timerMode = tmode;
        this.state.secPerQ = tsec;
        this.state.remainingSec = tmode === 'total' ? (this.state.questions.length * tsec) : tsec;
        this.state.finished = false;
        this.state.qStartTimestamp = Date.now();

        this.startCountdown();
        this.renderActiveQuestion();
      } catch (e) {
        renderToolError(e.message, () => this.run());
      } finally {
        setToolLoadingState(false);
      }
    },
    recordElapsedForCurrent() {
      const q = this.state.questions[this.state.currentIndex];
      if (!q || !this.state.qStartTimestamp) return;
      q.timeSpentSec += Math.max(0, Math.round((Date.now() - this.state.qStartTimestamp) / 1000));
      this.state.qStartTimestamp = Date.now();
    },
    startCountdown() {
      this.cleanup();
      this.state.timerId = setInterval(() => {
        if (this.state.finished) { this.cleanup(); return; }
        if (this.state.remainingSec > 0) {
          this.state.remainingSec--;
          const clk = $('teaClockText');
          if (clk) {
            const m = Math.floor(this.state.remainingSec / 60), s = this.state.remainingSec % 60;
            clk.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
          }
        } else if (this.state.timerMode === 'per_question') {
          this.recordElapsedForCurrent();
          if (this.state.currentIndex < this.state.questions.length - 1) {
            this.state.currentIndex++;
            this.state.remainingSec = this.state.secPerQ;
            this.renderActiveQuestion();
          } else this.finishExam();
        } else {
          this.finishExam();
        }
      }, 1000);
    },
    selectOption(optIdx) {
      if (this.state.finished) return;
      this.state.questions[this.state.currentIndex].selected = optIdx;
      this.renderActiveQuestion();
    },
    goToQuestion(newIdx) {
      if (this.state.finished) return;
      this.recordElapsedForCurrent();
      this.state.currentIndex = newIdx;
      if (this.state.timerMode === 'per_question') this.state.remainingSec = this.state.secPerQ;
      this.renderActiveQuestion();
    },
    renderActiveQuestion() {
      const c = $('toolOutputContainer'); if (!c) return;
      const isEn = LANG === 'en';
      const q = this.state.questions[this.state.currentIndex], total = this.state.questions.length;
      const m = Math.floor(this.state.remainingSec / 60), s = this.state.remainingSec % 60;

      c.innerHTML = `
        <div class="ai-output-box" data-notr="1">
          <div class="tea-topbar">
            <div><span class="mn-ext-pill">${isEn ? 'Question' : 'السؤال'} ${this.state.currentIndex + 1} / ${total}</span><span class="mn-ext-pill green" style="margin-inline-start:6px;">${escapeHtml(q.domain)}</span></div>
            <span id="teaClockText" class="mn-ext-pill danger" style="font-size:15px;font-family:monospace;">${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}</span>
          </div>
          <p style="font-size:16px;font-weight:700;line-height:1.8;margin-bottom:18px;">${escapeHtml(q.stem)}</p>
          <div>${q.options.map((opt, idx) => `<button type="button" class="tea-option ${q.selected === idx ? 'selected' : ''}" onclick="window.MEDNERD_EXT.TimedExamArena.selectOption(${idx})"><b style="color:var(--petrol);">${idx + 1}.</b> <span>${escapeHtml(opt)}</span></button>`).join('')}</div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:18px;padding-top:14px;border-top:1px solid var(--border-color);flex-wrap:wrap;gap:10px;">
            <div style="display:flex;gap:8px;">
              ${this.state.timerMode === 'total' ? `<button type="button" class="btn-secondary" ${this.state.currentIndex === 0 ? 'disabled' : ''} onclick="window.MEDNERD_EXT.TimedExamArena.goToQuestion(${this.state.currentIndex - 1})">${isEn ? 'Previous' : 'السابق'}</button>` : ''}
              ${this.state.currentIndex < total - 1 ? `<button type="button" class="btn-primary" onclick="window.MEDNERD_EXT.TimedExamArena.goToQuestion(${this.state.currentIndex + 1})">${isEn ? 'Next' : 'التالي'}</button>` : ''}
            </div>
            <button type="button" class="btn-primary" style="background:var(--dark-green);" onclick="window.MEDNERD_EXT.TimedExamArena.finishExam()"><i class="fa-solid fa-flag-checkered"></i> ${isEn ? 'Submit' : 'تسليم الامتحان'}</button>
          </div>
        </div>`;
    },
    finishExam() {
      this.recordElapsedForCurrent();
      this.state.finished = true;
      this.cleanup();
      const qs = this.state.questions, total = qs.length;
      let correctCount = 0, totalTime = 0;
      const domainMap = {};
      const weakDomains = [];

      qs.forEach(q => {
        const ok = q.selected === q.correctIndex;
        if (ok) correctCount++;
        totalTime += q.timeSpentSec;
        if (!domainMap[q.domain]) domainMap[q.domain] = { total: 0, correct: 0, time: 0 };
        domainMap[q.domain].total++; if (ok) domainMap[q.domain].correct++;
        domainMap[q.domain].time += q.timeSpentSec;
      });

      Object.entries(domainMap).forEach(([dom, st]) => {
        if ((st.correct / st.total) < 0.65) weakDomains.push(dom);
      });

      MedStorage.recordExamAttempt({
        topic: this.state.topic || 'Timed Clinical Arena',
        sourceTool: 'TimedExamArena',
        total,
        correct: correctCount,
        timeSec: totalTime,
        weakDomains
      });

      const scorePct = Math.round((correctCount / total) * 100), avgTime = Math.round(totalTime / total);
      const isEn = LANG === 'en';

      const domainRowsHtml = Object.entries(domainMap).map(([dom, st]) => {
        const pct = Math.round((st.correct / st.total) * 100);
        const col = pct >= 70 ? 'var(--dark-green)' : pct >= 50 ? 'var(--mustard)' : 'var(--danger)';
        return `<div style="margin-bottom:12px;"><div style="display:flex;justify-content:space-between;font-size:13.5px;font-weight:700;"><span>${escapeHtml(dom)}</span><span style="color:${col};">${st.correct}/${st.total} (${pct}%)</span></div><div class="tea-bar-track"><div class="tea-bar-fill" style="width:${pct}%;background:${col};"></div></div></div>`;
      }).join('');

      const reviewCardsHtml = qs.map((q, i) => {
        const ok = q.selected === q.correctIndex;
        return `<div style="padding:18px;border:1px solid var(--border-color);border-radius:14px;background:var(--white);margin-bottom:14px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:10px;"><span class="mn-ext-pill ${ok ? 'green' : 'danger'}">${ok ? '✓ صحيحة' : '✗ خاطئة'}</span><small>${q.timeSpentSec}s</small></div>
          <p style="font-weight:700;margin-bottom:12px;">Q${i + 1}: ${escapeHtml(q.stem)}</p>
          ${q.options.map((opt, oIdx) => `<div class="tea-option ${oIdx === q.correctIndex ? 'correct' : (q.selected === oIdx ? 'wrong' : '')}" style="cursor:default;"><span>${escapeHtml(opt)}</span></div>`).join('')}
          <div style="margin-top:10px;padding:12px;background:var(--petrol-soft);border-radius:10px;font-size:14px;">${renderSafeMarkdown(q.rationale)}</div>
        </div>`;
      }).join('');

      const c = $('toolOutputContainer'); if (!c) return;
      c.innerHTML = `<div class="ai-output-box" data-notr="1">
        <h3><i class="fa-solid fa-chart-pie"></i> ${isEn ? 'Performance Metrics' : 'لوحة مؤشرات الأداء والمراجعة (حُفظت في سجل تقدمك)'}</h3>
        <div class="tea-kpi-grid">
          <div class="tea-kpi-card"><div class="tea-kpi-val">${scorePct}%</div><small>${correctCount}/${total}</small></div>
          <div class="tea-kpi-card"><div class="tea-kpi-val">${avgTime}s</div><small>${isEn ? 'Avg Time/Q' : 'متوسط الزمن'}</small></div>
          <div class="tea-kpi-card"><div class="tea-kpi-val">${totalTime}s</div><small>${isEn ? 'Total Time' : 'إجمالي الزمن'}</small></div>
        </div>
        <div style="padding:16px;background:var(--white);border:1px solid var(--border-color);border-radius:14px;margin-bottom:20px;">${domainRowsHtml}</div>
        ${reviewCardsHtml}
      </div>`;
    }
  };

  /* ==========================================================================
     MODULE 6: FEYNMANMED ENGINE
     ========================================================================== */
  const FeynmanEngine = {
    async run() {
      if (APP_STATE.isRequestInFlight) return;
      const concept = ($('fme_concept') && $('fme_concept').value.trim()) || '';
      const explanation = ($('fme_exp') && $('fme_exp').value.trim()) || '';
      const aud = ($('fme_aud') && $('fme_aud').value) || 'Peer';

      if (!concept || !explanation) { renderToolError('يرجى إدخال المفهوم وشرحك الشخصي له.'); return; }

      setToolLoadingState(true, 'جارٍ فحص شرحك واكتشاف الفجوات المفاهيمية...');
      $('toolOutputContainer').innerHTML = '';

      const sysPrompt = `أنت مقيم أكاديمي خبير بتقنية فاينمان الطبية. حلّل شرح الطالب للمفهوم (${concept}) الموجه لجمهور (${aud}). أخرج JSON فقط:
{
  "scores": { "clarity": 85, "accuracy": 90, "depth": 75, "overall": 83 },
  "blindSpots": ["فجوة أو خطأ"],
  "jargonDetected": [{ "term": "المصطلح", "issue": "المشكلة", "simplerRewrite": "البديل" }],
  "analogies": ["تشبيه مقترح"],
  "idealFeynmanRewrite": "إعادة صياغة نموذجية"
}`;

      try {
        const raw = await callGeminiAPI({ systemInstruction: sysPrompt + SAFE_RULES, contents: [{ role: 'user', parts: [{ text: `المفهوم: ${concept}\n\nشرح الطالب:\n${explanation}` }] }] });
        const parsed = extractJsonBlock(raw);
        const overall = (parsed.scores && Number(parsed.scores.overall)) || 75;
        MedStorage.recordExamAttempt({
          topic: concept,
          sourceTool: 'FeynmanEngine',
          total: 100,
          correct: overall,
          timeSec: 120,
          weakDomains: overall < 65 ? [concept] : []
        });
        this.renderReport(parsed, concept);
      } catch (e) {
        renderToolError(e.message, () => this.run());
      } finally {
        setToolLoadingState(false);
      }
    },
    renderReport(d, concept) {
      const c = $('toolOutputContainer'); if (!c) return;
      const isEn = LANG === 'en';
      const sc = d.scores || { clarity: 0, accuracy: 0, depth: 0, overall: 0 };
      const blind = Array.isArray(d.blindSpots) ? d.blindSpots : [], jargon = Array.isArray(d.jargonDetected) ? d.jargonDetected : [], analogies = Array.isArray(d.analogies) ? d.analogies : [];

      c.innerHTML = `<div class="ai-output-box" data-notr="1">
        <h3><i class="fa-solid fa-magnifying-glass-chart"></i> ${isEn ? 'Feynman Audit' : 'تقرير تقييم فاينمان وفحص الفهم'} — ${escapeHtml(concept)}</h3>
        <div class="fme-rubric-grid">
          <div class="fme-score-card"><div>${isEn ? 'Clarity' : 'الوضوح'}</div><div class="fme-ring">${sc.clarity}/100</div></div>
          <div class="fme-score-card"><div>${isEn ? 'Accuracy' : 'الدقة'}</div><div class="fme-ring" style="color:var(--dark-green);">${sc.accuracy}/100</div></div>
          <div class="fme-score-card"><div>${isEn ? 'Depth' : 'العمق'}</div><div class="fme-ring" style="color:var(--mustard);">${sc.depth}/100</div></div>
          <div class="fme-score-card"><div>${isEn ? 'Overall' : 'الدرجة الكلية'}</div><div class="fme-ring">${sc.overall}/100</div></div>
        </div>
        <h4>أ) الفجوات المفاهيمية</h4><ul>${blind.map(b => `<li>${escapeHtml(b)}</li>`).join('')}</ul>
        <h4>ب) المصطلحات غير المفسرة</h4>
        ${jargon.length ? `<table><thead><tr><th>المصطلح</th><th>المشكلة</th><th>البديل</th></tr></thead><tbody>${jargon.map(j => `<tr><td><b>${escapeHtml(j.term)}</b></td><td>${escapeHtml(j.issue)}</td><td>${escapeHtml(j.simplerRewrite)}</td></tr>`).join('')}</tbody></table>` : '<p>ممتاز!</p>'}
        <h4>ج) تشبيهات مقترحة</h4><ul>${analogies.map(a => `<li>${escapeHtml(a)}</li>`).join('')}</ul>
        <h4>الصياغة النموذجية</h4><blockquote>${renderSafeMarkdown(d.idealFeynmanRewrite || '')}</blockquote>
      </div>`;
    }
  };

  /* ==========================================================================
     MODULE 7: 3D ANATOMY ATLAS & STUDIO (إصلاح تسرب الذاكرة وأيقونة الهضمي)
     ========================================================================== */
  const Anatomy3DStudio = {
    state: {
      activeTab: 'sketchfab',
      currentQuery: 'Human Heart Anatomy',
      currentModelUid: '',
      currentModelTitle: '',
      searchResults: [],
      threeAnimId: null,
      threeRenderer: null,
      threeScene: null,
      threeCamera: null,
      threeGroup: null,
      windowPointerUpHandler: null,
      planesVisible: { sagittal: true, coronal: true, axial: true },
      wireframe: false,
      autoRotate: true
    },

    ORGAN_PRESETS: [
      { id: 'heart',     q: 'Human Heart Anatomy Valves Chambers', labelAr: 'القلب والصمامات', labelEn: 'Heart & Valves', icon: 'fa-heart-pulse' },
      { id: 'brain',     q: 'Human Brain Anatomy Lobes Cranial',   labelAr: 'الدماغ والأعصاب', labelEn: 'Brain & Nerves', icon: 'fa-brain' },
      { id: 'skull',     q: 'Human Skull Anatomy Bones Foramina',  labelAr: 'الجمجمة والعظام', labelEn: 'Skull & Bones',  icon: 'fa-skull' },
      { id: 'skeleton',  q: 'Human Skeleton Full Anatomy',         labelAr: 'الهيكل العظمي',   labelEn: 'Full Skeleton',  icon: 'fa-bone' },
      { id: 'muscles',   q: 'Human Muscular System Ecorche',       labelAr: 'الجهاز العضلي',   labelEn: 'Muscular System',icon: 'fa-person-running' },
      { id: 'lungs',     q: 'Lungs Bronchial Tree Respiratory',    labelAr: 'الرئتان والقصبات', labelEn: 'Lungs & Airway', icon: 'fa-lungs' },
      { id: 'digestive', q: 'Digestive System Liver Stomach',      labelAr: 'الجهاز الهضمي',   labelEn: 'Digestive Tract',icon: 'fa-kit-medical' },
      { id: 'kidney',    q: 'Kidney Anatomy Nephron Renal',        labelAr: 'الكلية والنفرون', labelEn: 'Kidney & Renal', icon: 'fa-filter' },
      { id: 'eye',       q: 'Human Eye Anatomy Orbit',             labelAr: 'العين والحجاج',   labelEn: 'Eye & Orbit',    icon: 'fa-eye' },
      { id: 'ear',       q: 'Inner Ear Anatomy Cochlea',           labelAr: 'الأذن الداخلية',  labelEn: 'Ear & Cochlea',  icon: 'fa-ear-listen' }
    ],

    cleanup() {
      if (this.state.threeAnimId) {
        cancelAnimationFrame(this.state.threeAnimId);
        this.state.threeAnimId = null;
      }
      if (this.state.windowPointerUpHandler) {
        window.removeEventListener('pointerup', this.state.windowPointerUpHandler);
        this.state.windowPointerUpHandler = null;
      }
      if (this.state.threeRenderer) {
        try { this.state.threeRenderer.dispose(); } catch (_) {}
        this.state.threeRenderer = null;
      }
    },

    async run() {
      this.cleanup();
      const customSearch = ($('a3d_search') && $('a3d_search').value.trim()) || '';
      const presetVal = ($('a3d_preset') && $('a3d_preset').value) || 'Human Heart Anatomy Valves Chambers';
      this.state.currentQuery = customSearch || presetVal;

      this.mountStudioShell();
      await this.searchSketchfabModels(this.state.currentQuery);
      this.generateAiStudyGuide(this.state.currentQuery);
    },

    mountStudioShell() {
      const c = $('toolOutputContainer');
      if (!c) return;
      const isEn = LANG === 'en';

      const chipsHtml = this.ORGAN_PRESETS.map(p => `
        <button type="button" class="a3d-chip" onclick="window.MEDNERD_EXT.Anatomy3DStudio.selectOrganChip('${p.q.replace(/'/g, "\\'")}')">
          <i class="fa-solid ${p.icon}"></i>
          <span>${isEn ? p.labelEn : p.labelAr}</span>
        </button>
      `).join('');

      c.innerHTML = `
        <div class="ai-output-box" data-notr="1">
          <div class="a3d-tabs">
            <button type="button" id="a3dTabSketchfab" class="a3d-tab active" onclick="window.MEDNERD_EXT.Anatomy3DStudio.switchEngine('sketchfab')">
              <i class="fa-solid fa-cube"></i>
              <span>${isEn ? '1. Sketchfab 3D Medical Atlas (Online)' : '1. أطلس Sketchfab الطبي ثلاثي الأبعاد'}</span>
            </button>
            <button type="button" id="a3dTabThree" class="a3d-tab" onclick="window.MEDNERD_EXT.Anatomy3DStudio.switchEngine('threejs')">
              <i class="fa-solid fa-layer-group"></i>
              <span>${isEn ? '2. Three.js WebGL Anatomical Planes & Dissector' : '2. محاكي المستويات التشريحية (Three.js WebGL)'}</span>
            </button>
            <button type="button" id="a3dTabGlb" class="a3d-tab" onclick="window.MEDNERD_EXT.Anatomy3DStudio.switchEngine('glb')">
              <i class="fa-solid fa-vr-cardboard"></i>
              <span>${isEn ? '3. Google <model-viewer> (.GLB / AR Loader)' : '3. عارض ملفات GLB والواقع المعزز (AR)'}</span>
            </button>
          </div>

          <div id="a3dSketchfabControls">
            <div class="a3d-organ-chips">${chipsHtml}</div>
            <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;">
              <input type="text" id="a3dLiveQueryInput" class="form-input" style="flex:1;min-width:220px;" value="${escapeHtml(this.state.currentQuery)}" placeholder="${isEn ? 'Search 3D model in English (e.g., Brachial plexus, Circle of Willis, Femur)...' : 'ابحث بالإنجليزية عن أي مجسم تشريحي 3D (مثال: Sphenoid bone, Circle of Willis, Heart)...'}">
              <button type="button" class="btn-primary" style="padding:10px 18px;" onclick="window.MEDNERD_EXT.Anatomy3DStudio.triggerLiveSearch()">
                <i class="fa-solid fa-magnifying-glass"></i> ${isEn ? 'Search 3D Atlas' : 'بحث في مكتبة 3D'}
              </button>
              <button type="button" class="btn-secondary" style="padding:10px 16px;" onclick="window.MEDNERD_EXT.Anatomy3DStudio.generateAiStudyGuide()">
                <i class="fa-solid fa-wand-magic-sparkles"></i> ${isEn ? 'Explain 3D Landmarks (AI)' : 'شرح معالم المجسم بالذكاء الاصطناعي'}
              </button>
            </div>
          </div>

          <div id="a3dStageContainer" class="a3d-stage">
            <div style="display:flex;align-items:center;justify-content:center;height:100%;color:#fff;font-weight:700;">
              <span class="loading-spinner" style="margin-inline-end:10px;"></span>
              <span>${isEn ? 'Loading 3D WebGL Viewport...' : 'جارٍ تحميل المجسم ثلاثي الأبعاد...'}</span>
            </div>
          </div>

          <div id="a3dGalleryWrap" style="margin-top:16px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <h4 style="margin:0;"><i class="fa-solid fa-cubes"></i> ${isEn ? 'Matching 3D Anatomical Models (Click any model to load in 3D viewer)' : 'المجسمات ثلاثية الأبعاد المطابقة (اضغط على أي مجسم لفتحه في شاشة الـ 3D)'}</h4>
              <small id="a3dResultCount" style="color:var(--muted-text);font-weight:700;"></small>
            </div>
            <div id="a3dResultsGrid" class="a3d-results-grid"></div>
          </div>

          <div id="a3dAiGuideBox" style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border-color);"></div>
        </div>`;

      const inp = $('a3dLiveQueryInput');
      if (inp) inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); this.triggerLiveSearch(); } };
    },

    switchEngine(tab) {
      this.cleanup();
      this.state.activeTab = tab;
      ['Sketchfab', 'Three', 'Glb'].forEach(k => {
        const el = $('a3dTab' + k);
        if (el) el.classList.remove('active');
      });
      if (tab === 'sketchfab') {
        $('a3dTabSketchfab')?.classList.add('active');
        if ($('a3dSketchfabControls')) $('a3dSketchfabControls').style.display = 'block';
        if ($('a3dGalleryWrap')) $('a3dGalleryWrap').style.display = 'block';
        if (this.state.currentModelUid) {
          this.loadSketchfabIframe(this.state.currentModelUid, this.state.currentModelTitle);
        } else {
          this.searchSketchfabModels(this.state.currentQuery);
        }
      } else if (tab === 'threejs') {
        $('a3dTabThree')?.classList.add('active');
        if ($('a3dSketchfabControls')) $('a3dSketchfabControls').style.display = 'none';
        if ($('a3dGalleryWrap')) $('a3dGalleryWrap').style.display = 'none';
        this.mountThreeJsDissector();
      } else if (tab === 'glb') {
        $('a3dTabGlb')?.classList.add('active');
        if ($('a3dSketchfabControls')) $('a3dSketchfabControls').style.display = 'none';
        if ($('a3dGalleryWrap')) $('a3dGalleryWrap').style.display = 'none';
        this.mountGlbViewer();
      }
    },

    selectOrganChip(query) {
      this.state.currentQuery = query;
      const inp = $('a3dLiveQueryInput');
      if (inp) inp.value = query;
      this.searchSketchfabModels(query);
      this.generateAiStudyGuide(query);
    },

    triggerLiveSearch() {
      const inp = $('a3dLiveQueryInput');
      const q = (inp && inp.value.trim()) || this.state.currentQuery;
      if (!q) return;
      this.state.currentQuery = q;
      this.searchSketchfabModels(q);
      this.generateAiStudyGuide(q);
    },

    async searchSketchfabModels(query) {
      const grid = $('a3dResultsGrid');
      const countEl = $('a3dResultCount');
      const stage = $('a3dStageContainer');
      const isEn = LANG === 'en';

      if (grid) grid.innerHTML = `<p style="color:var(--muted-text);font-size:13px;">${isEn ? 'Searching Sketchfab 3D Medical Repository...' : 'جارٍ البحث في مستودع Sketchfab 3D الطبي...'}</p>`;

      try {
        const url = `https://api.sketchfab.com/v3/search?type=models&q=${encodeURIComponent(query + ' anatomy')}&sort_by=-relevance&count=12`;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('Sketchfab API HTTP ' + resp.status);
        const data = await resp.json();
        const list = (data && Array.isArray(data.results)) ? data.results : [];

        if (!list.length) {
          if (grid) grid.innerHTML = `<p style="color:var(--mustard);font-size:13.5px;">${isEn ? 'No exact 3D models found. Try English anatomical terms (e.g., Heart, Skull, Brain).' : 'لم يُعثر على مجسمات مطابقة. جرب كتابة المصطلح التشريحي بالإنجليزية (مثل Heart, Skull, Brain).'}</p>`;
          return;
        }

        this.state.searchResults = list;
        if (countEl) countEl.textContent = `${list.length} ${isEn ? '3D models available' : 'مجسم 3D متاح'}`;

        const first = list[0];
        this.loadSketchfabIframe(first.uid, first.name);

        if (grid) {
          grid.innerHTML = list.map(item => {
            const imgs = (item.thumbnails && Array.isArray(item.thumbnails.images)) ? item.thumbnails.images : [];
            const thumb = (imgs.find(im => im.width >= 200 && im.width <= 450) || imgs[0] || {}).url || '';
            const author = (item.user && item.user.displayName) || 'Medical 3D';
            return `
              <div class="a3d-model-card" onclick="window.MEDNERD_EXT.Anatomy3DStudio.loadSketchfabIframe('${escapeHtml(item.uid)}', '${escapeHtml(item.name.replace(/'/g, "\\'"))}')">
                ${thumb ? `<img class="a3d-model-thumb" src="${escapeHtml(thumb)}" alt="${escapeHtml(item.name)}" loading="lazy">` : `<div class="a3d-model-thumb"></div>`}
                <div class="a3d-model-info">
                  <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</div>
                  <small style="color:var(--muted-text);font-weight:500;">${escapeHtml(author)}</small>
                </div>
              </div>`;
          }).join('');
        }
      } catch (err) {
        if (stage) {
          stage.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#fff;padding:20px;text-align:center;">
            <p style="margin-bottom:12px;">${isEn ? 'Could not reach Sketchfab API. Switching to local Three.js 3D Engine...' : 'تعذر الوصول لمستودع Sketchfab الخارجي. يمكنك استخدام محاكي Three.js WebGL المحلي مباشرة:'}</p>
            <button type="button" class="btn-primary" onclick="window.MEDNERD_EXT.Anatomy3DStudio.switchEngine('threejs')">تشغيل محرك Three.js 3D المحلي</button>
          </div>`;
        }
      }
    },

    loadSketchfabIframe(uid, title) {
      this.state.currentModelUid = uid;
      this.state.currentModelTitle = title || this.state.currentQuery;
      const stage = $('a3dStageContainer');
      if (!stage) return;
      const embedUrl = `https://sketchfab.com/models/${encodeURIComponent(uid)}/embed?autostart=1&ui_infos=0&ui_watermark=0&ui_theme=dark`;
      stage.innerHTML = `
        <iframe
          title="${escapeHtml(this.state.currentModelTitle)}"
          src="${embedUrl}"
          allow="autoplay; fullscreen; xr-spatial-tracking"
          allowfullscreen
          mozallowfullscreen="true"
          webkitallowfullscreen="true">
        </iframe>`;
    },

    async mountThreeJsDissector() {
      const stage = $('a3dStageContainer');
      if (!stage) return;
      const isEn = LANG === 'en';
      stage.innerHTML = `<div id="a3dThreeMount" style="width:100%;height:100%;position:relative;"></div>`;
      const mount = $('a3dThreeMount');

      try {
        await MedDependencyLoader.ensureThreeJS();
        const THREE = window.THREE;
        const w = mount.clientWidth || 800;
        const h = mount.clientHeight || 500;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0f172a);

        const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
        camera.position.set(4.2, 3.2, 5.5);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        mount.appendChild(renderer.domElement);

        scene.add(new THREE.AmbientLight(0xffffff, 0.65));
        const dirLight = new THREE.DirectionalLight(0x22d3ee, 0.9);
        dirLight.position.set(5, 8, 6);
        scene.add(dirLight);
        const rimLight = new THREE.DirectionalLight(0xf43f5e, 0.6);
        rimLight.position.set(-5, -4, -4);
        scene.add(rimLight);

        const group = new THREE.Group();
        scene.add(group);

        const coreGeo = new THREE.IcosahedronGeometry(1.25, 3);
        const coreMat = new THREE.MeshPhongMaterial({
          color: 0xe11d48,
          shininess: 90,
          transparent: true,
          opacity: 0.88,
          wireframe: this.state.wireframe
        });
        group.add(new THREE.Mesh(coreGeo, coreMat));

        const archGeo = new THREE.TorusGeometry(0.85, 0.18, 16, 50, Math.PI);
        const archMat = new THREE.MeshPhongMaterial({ color: 0xdc2626, wireframe: this.state.wireframe });
        const archMesh = new THREE.Mesh(archGeo, archMat);
        archMesh.position.set(0, 1.05, 0);
        group.add(archMesh);

        const veinGeo = new THREE.CylinderGeometry(0.18, 0.18, 2.8, 20);
        const veinMat = new THREE.MeshPhongMaterial({ color: 0x2563eb, wireframe: this.state.wireframe });
        const veinMesh = new THREE.Mesh(veinGeo, veinMat);
        veinMesh.position.set(-0.75, 0.2, 0.4);
        group.add(veinMesh);

        const planeGeo = new THREE.PlaneGeometry(3.8, 3.8);
        const sagPlane = new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({ color: 0x22d3ee, side: THREE.DoubleSide, transparent: true, opacity: 0.22 }));
        sagPlane.rotation.y = Math.PI / 2;
        sagPlane.name = 'sagittal';
        group.add(sagPlane);

        const corPlane = new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({ color: 0x4ade80, side: THREE.DoubleSide, transparent: true, opacity: 0.22 }));
        corPlane.name = 'coronal';
        group.add(corPlane);

        const axiPlane = new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.DoubleSide, transparent: true, opacity: 0.22 }));
        axiPlane.rotation.x = Math.PI / 2;
        axiPlane.name = 'axial';
        group.add(axiPlane);

        const ctrlBar = document.createElement('div');
        ctrlBar.className = 'a3d-overlay-controls';
        ctrlBar.innerHTML = `
          <div style="display:flex;gap:6px;flex-wrap:wrap;background:rgba(15,23,42,.85);padding:8px 12px;border-radius:12px;border:1px solid #334155;">
            <button type="button" class="btn-secondary" style="padding:5px 10px;font-size:12px;color:#22d3ee;border-color:#22d3ee;" onclick="window.MEDNERD_EXT.Anatomy3DStudio.togglePlane('sagittal')">
              ${isEn ? 'Sagittal Plane' : 'المستوى السهمي (Sagittal)'}
            </button>
            <button type="button" class="btn-secondary" style="padding:5px 10px;font-size:12px;color:#4ade80;border-color:#4ade80;" onclick="window.MEDNERD_EXT.Anatomy3DStudio.togglePlane('coronal')">
              ${isEn ? 'Coronal Plane' : 'المستوى الإكليلي (Coronal)'}
            </button>
            <button type="button" class="btn-secondary" style="padding:5px 10px;font-size:12px;color:#fbbf24;border-color:#fbbf24;" onclick="window.MEDNERD_EXT.Anatomy3DStudio.togglePlane('axial')">
              ${isEn ? 'Axial Plane' : 'المستوى المعترض (Axial)'}
            </button>
            <button type="button" class="btn-secondary" style="padding:5px 10px;font-size:12px;color:#fff;" onclick="window.MEDNERD_EXT.Anatomy3DStudio.toggleWireframe()">
              <i class="fa-solid fa-border-all"></i> ${isEn ? 'Wireframe / X-Ray' : 'وضع الشبكة / الأشعة'}
            </button>
          </div>
          <span style="background:rgba(15,23,42,.85);color:#cbd5e1;padding:6px 12px;border-radius:10px;font-size:12px;">
            ${isEn ? 'Drag to rotate 3D • Scroll to zoom' : 'اسحب بالماوس أو الإصبع لتدوير المجسم بـ 360°'}
          </span>`;
        mount.appendChild(ctrlBar);

        let dragging = false, prevX = 0, prevY = 0;
        renderer.domElement.addEventListener('pointerdown', e => { dragging = true; prevX = e.clientX; prevY = e.clientY; });
        this.state.windowPointerUpHandler = () => { dragging = false; };
        window.addEventListener('pointerup', this.state.windowPointerUpHandler);
        renderer.domElement.addEventListener('pointermove', e => {
          if (!dragging) return;
          group.rotation.y += (e.clientX - prevX) * 0.01;
          group.rotation.x += (e.clientY - prevY) * 0.01;
          prevX = e.clientX; prevY = e.clientY;
        });
        renderer.domElement.addEventListener('wheel', e => {
          e.preventDefault();
          camera.position.multiplyScalar(e.deltaY > 0 ? 1.08 : 0.92);
        });

        this.state.threeRenderer = renderer;
        this.state.threeScene = scene;
        this.state.threeCamera = camera;
        this.state.threeGroup = group;
        this.state.coreMat = coreMat;
        this.state.archMat = archMat;
        this.state.veinMat = veinMat;

        const animate = () => {
          this.state.threeAnimId = requestAnimationFrame(animate);
          if (!dragging && this.state.autoRotate) group.rotation.y += 0.0045;
          renderer.render(scene, camera);
        };
        animate();
      } catch (e) {
        stage.innerHTML = `<div class="error-alert">${escapeHtml(e.message)}</div>`;
      }
    },

    togglePlane(planeName) {
      const g = this.state.threeGroup;
      if (!g) return;
      const obj = g.getObjectByName(planeName);
      if (obj) obj.visible = !obj.visible;
    },

    toggleWireframe() {
      this.state.wireframe = !this.state.wireframe;
      ['coreMat', 'archMat', 'veinMat'].forEach(k => {
        if (this.state[k]) this.state[k].wireframe = this.state.wireframe;
      });
    },

    async mountGlbViewer() {
      try { await MedDependencyLoader.ensureModelViewer(); } catch (_) {}
      const stage = $('a3dStageContainer');
      if (!stage) return;
      const isEn = LANG === 'en';
      stage.innerHTML = `
        <div style="display:flex;flex-direction:column;height:100%;background:#0f172a;padding:16px;color:#fff;">
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px;">
            <label class="btn-primary" style="padding:8px 16px;font-size:13px;cursor:pointer;">
              <i class="fa-solid fa-upload"></i> ${isEn ? 'Load .GLB / .GLTF 3D File from Device' : 'اختر ملف مجسم ثلاثي الأبعاد (.GLB / .GLTF) من جهازك'}
              <input type="file" id="a3dGlbFileInput" accept=".glb,.gltf" style="display:none;">
            </label>
            <input type="text" id="a3dGlbUrlInput" class="form-input" style="flex:1;min-width:220px;background:#1e293b;color:#fff;border-color:#334155;" placeholder="${isEn ? 'Or paste direct .glb URL...' : 'أو ألصق رابط مباشر لملف .glb...'}">
            <button type="button" class="btn-secondary" style="color:#22d3ee;border-color:#22d3ee;" onclick="window.MEDNERD_EXT.Anatomy3DStudio.loadCustomGlbUrl()">
              ${isEn ? 'Load URL' : 'عرض الرابط'}
            </button>
          </div>
          <div id="a3dModelViewerHost" style="flex:1;border-radius:12px;overflow:hidden;background:#1e293b;display:flex;align-items:center;justify-content:center;">
            <model-viewer
              id="a3dMvElement"
              src="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
              camera-controls
              auto-rotate
              ar
              shadow-intensity="1"
              style="width:100%;height:100%;">
            </model-viewer>
          </div>
        </div>`;

      const fi = $('a3dGlbFileInput');
      if (fi) {
        fi.onchange = () => {
          const f = fi.files && fi.files[0];
          if (!f) return;
          const blobUrl = URL.createObjectURL(f);
          const mv = $('a3dMvElement');
          if (mv) mv.setAttribute('src', blobUrl);
        };
      }
    },

    loadCustomGlbUrl() {
      const inp = $('a3dGlbUrlInput');
      const mv = $('a3dMvElement');
      if (inp && mv && inp.value.trim()) {
        mv.setAttribute('src', inp.value.trim());
      }
    },

    async generateAiStudyGuide(customTopic) {
      if (APP_STATE.isRequestInFlight) return;
      const box = $('a3dAiGuideBox');
      if (!box) return;
      const topic = customTopic || this.state.currentModelTitle || this.state.currentQuery;
      const aimode = ($('a3d_aimode') && $('a3d_aimode').value) || 'Comprehensive';
      const isEn = LANG === 'en';

      box.innerHTML = `<div style="padding:14px;color:var(--petrol);font-weight:700;"><span class="loading-spinner req-spin" style="margin-inline-end:8px;"></span>${isEn ? 'Preparing 3D anatomical landmarks & clinical guide...' : 'جارٍ إعداد دليل المعالم التشريحية الثلاثية الأبعاد والشرح السريري...'}</div>`;

      const sysPrompt = `أنت أستاذ علم التشريح السريري والجراحي. الطالب يستعرض الآن مجسماً ثلاثي الأبعاد لـ (${topic}) بوضع دراسة (${aimode}).
قدّم دليلاً تشريحياً منظماً يساعده أثناء تدوير المجسم الـ 3D:
1. **قائمة المعالم التشريحية (3D Landmarks Checklist)**: أهم التراكيب البارزة التي يجب على الطالب البحث عنها وتحديدها على المجسم الثلاثي الأبعاد (مع المصطلح الإنجليزي الدقيق).
2. **العلاقات التشريحية المكانية (3D Spatial Relations)**: ماذا يقع في الأمام (Anterior)، الخلف (Posterior)، الأعلى (Superior)، الأسفل (Inferior)، الأنسي (Medial)، والوحشي (Lateral).
3. **التروية الدموية والتعصيب والمنشأ/المرتكز (Vascular Supply, Innervation & Attachments)**.
4. **الأهمية السريرية والجراحية (Clinical & Surgical Pearls)**: إصابات الأعصاب أو الأوعية المرتبطة وكيف تُسأل في الامتحانات العملية (Spotter / OSCE).`;

      try {
        const md = await callGeminiAPI({
          systemInstruction: sysPrompt + SAFE_RULES,
          contents: [{ role: 'user', parts: [{ text: `التركيب التشريحي الثلاثي الأبعاد: ${topic}\nنمط الدراسة: ${aimode}` }] }]
        });
        box.innerHTML = `
          <div style="background:var(--white);border:1px solid var(--border-color);border-radius:14px;padding:20px;">
            <h3 style="margin-top:0;color:var(--petrol);"><i class="fa-solid fa-compass-drafting"></i> ${isEn ? '3D Anatomical Guide: ' : 'الدليل التشريحي المرافق للمجسم: '} ${escapeHtml(topic)}</h3>
            <div data-notr="1">${renderSafeMarkdown(md)}</div>
          </div>`;
        addExportBar(box.firstElementChild, md, 'mednerd-3d-anatomy-guide');
      } catch (e) {
        box.innerHTML = `<div class="error-alert">${escapeHtml(e.message)}</div>`;
      }
    }
  };

  /* ==========================================================================
     MODULE 8: MEDPLANNER — SMART STUDY SCHEDULER & RECOMMENDATIONS
     ========================================================================== */
  const MedPlanner = {
    state: { viewMode: 'daily' }, // daily | weekly | calendar

    loadData() {
      return MedStorage.read(MedStorage.KEYS.PLANNER, { courses: [], tasks: [], updatedAt: null });
    },

    saveData(data) {
      data.updatedAt = new Date().toISOString();
      MedStorage.write(MedStorage.KEYS.PLANNER, data);
    },

    run() {
      const course = ($('mp_course') && $('mp_course').value.trim()) || '';
      const lectureBatch = ($('mp_lecture') && $('mp_lecture').value.trim()) || '';
      const numLectures = Math.min(Math.max(parseInt(($('mp_count') && $('mp_count').value) || '6', 10), 1), 60);
      const durationMin = Math.min(Math.max(parseInt(($('mp_duration') && $('mp_duration').value) || '45', 10), 15), 240);
      const examDateStr = ($('mp_exam_date') && $('mp_exam_date').value) || '';
      const difficulty = ($('mp_difficulty') && $('mp_difficulty').value) || 'medium';
      const mastery = ($('mp_mastery') && $('mp_mastery').value) || 'beginner';
      const dailyHours = Math.min(Math.max(parseFloat(($('mp_daily_hours') && $('mp_daily_hours').value) || '4'), 1), 14);
      const prefTime = ($('mp_pref_time') && $('mp_pref_time').value) || 'morning';
      const restDay = ($('mp_rest_day') && $('mp_rest_day').value) || 'Friday';
      const revHours = Math.min(Math.max(parseFloat(($('mp_rev_hours') && $('mp_rev_hours').value) || '1'), 0), 6);

      if (!course) {
        // عرض الجدول المحفوظ مع التوصيات الذكية إذا لم يضف مادة جديدة
        this.renderDashboard();
        return;
      }

      const data = this.loadData();
      const diffWeight = difficulty === 'hard' ? 1.45 : difficulty === 'medium' ? 1.15 : 0.9;
      const masteryWeight = mastery === 'beginner' ? 1.3 : mastery === 'intermediate' ? 1.0 : 0.75;
      const effectiveMin = Math.round(durationMin * diffWeight * masteryWeight);

      const courseObj = {
        id: 'crs_' + Date.now(),
        name: course,
        examDate: examDateStr,
        difficulty,
        mastery,
        prefTime,
        restDay,
        dailyHours,
        revHours
      };
      data.courses.push(courseObj);

      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const examDate = examDateStr ? new Date(examDateStr + 'T00:00:00') : new Date(start.getTime() + 21 * 86400000);
      const daysUntilExam = Math.max(2, Math.ceil((examDate - start) / 86400000));
      const maxStudyMinPerDay = Math.max(45, Math.round((dailyHours - Math.min(revHours, dailyHours * 0.4)) * 60));

      let currentDayOffset = 0;
      let usedMinToday = 0;

      const getNextAvailableDate = () => {
        for (let guard = 0; guard < 180; guard++) {
          const d = new Date(start.getTime() + currentDayOffset * 86400000);
          const dayName = dayNames[d.getDay()];
          if (dayName === restDay && daysUntilExam > 5) {
            currentDayOffset++;
            usedMinToday = 0;
            continue;
          }
          if (usedMinToday + effectiveMin > maxStudyMinPerDay && usedMinToday > 0) {
            currentDayOffset++;
            usedMinToday = 0;
            continue;
          }
          return d.toISOString().slice(0, 10);
        }
        return start.toISOString().slice(0, 10);
      };

      const timeLabelMap = {
        morning: LANG === 'en' ? '08:30 AM' : '08:30 صباحاً',
        afternoon: LANG === 'en' ? '02:00 PM' : '02:00 ظهراً',
        evening: LANG === 'en' ? '06:30 PM' : '06:30 مساءً',
        night: LANG === 'en' ? '09:30 PM' : '09:30 ليلاً'
      };

      for (let i = 1; i <= numLectures; i++) {
        const assignedDate = getNextAvailableDate();
        usedMinToday += effectiveMin;
        const lecTitle = lectureBatch
          ? `${course} — ${lectureBatch} (${i}/${numLectures})`
          : `${course} — ${LANG === 'en' ? 'Lecture' : 'محاضرة'} ${i}`;

        data.tasks.push({
          id: 'tsk_' + Date.now() + '_' + i + '_' + Math.random().toString(36).slice(2, 5),
          courseId: courseObj.id,
          courseName: course,
          title: lecTitle,
          date: assignedDate,
          timeSlot: timeLabelMap[prefTime] || prefTime,
          durationMin: effectiveMin,
          type: 'lecture',
          difficulty,
          done: false
        });

        // جدولة مراجعة متباعدة تلقائية (Spaced Repetition +1d و +4d قبل الامتحان)
        [1, 4].forEach(gap => {
          const revDate = new Date(new Date(assignedDate + 'T00:00:00').getTime() + gap * 86400000);
          if (revDate <= examDate) {
            data.tasks.push({
              id: 'rev_' + Date.now() + '_' + i + '_' + gap + '_' + Math.random().toString(36).slice(2, 4),
              courseId: courseObj.id,
              courseName: course,
              title: (LANG === 'en' ? `Spaced Review (+${gap}d): ` : `مراجعة متباعدة (+${gap} يوم): `) + lecTitle,
              date: revDate.toISOString().slice(0, 10),
              timeSlot: timeLabelMap[prefTime] || prefTime,
              durationMin: Math.max(20, Math.round(revHours * 30) || 25),
              type: 'revision',
              difficulty,
              done: false
            });
          }
        });
      }

      data.tasks.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      this.saveData(data);
      this.renderDashboard();
    },

    toggleTaskDone(taskId) {
      const data = this.loadData();
      const t = data.tasks.find(x => x.id === taskId);
      if (t) {
        t.done = !t.done;
        this.saveData(data);
        this.renderDashboard();
      }
    },

    deleteTask(taskId) {
      const data = this.loadData();
      data.tasks = data.tasks.filter(x => x.id !== taskId);
      this.saveData(data);
      this.renderDashboard();
    },

    rescheduleOverdue() {
      const data = this.loadData();
      const todayStr = new Date().toISOString().slice(0, 10);
      let shiftIdx = 0;
      data.tasks.forEach(t => {
        if (!t.done && t.date && t.date < todayStr) {
          const target = new Date(Date.now() + Math.floor(shiftIdx / 2) * 86400000);
          t.date = target.toISOString().slice(0, 10);
          shiftIdx++;
        }
      });
      data.tasks.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      this.saveData(data);
      this.renderDashboard();
    },

    clearAllSchedules() {
      this.saveData({ courses: [], tasks: [] });
      this.renderDashboard();
    },

    exportScheduleCSV() {
      const data = this.loadData();
      if (!data.tasks.length) return;
      const rows = [['Date', 'Time', 'Course', 'Task', 'Type', 'Minutes', 'Status']];
      data.tasks.forEach(t => rows.push([t.date, t.timeSlot, t.courseName, t.title, t.type, t.durationMin, t.done ? 'Done' : 'Pending']));
      const csv = '\uFEFF' + rows.map(r => r.map(c => `"${String(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
      a.download = 'mednerd-study-schedule.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    },

    buildSmartRecommendations(data, analytics) {
      const recs = [];
      const isEn = LANG === 'en';
      const todayStr = new Date().toISOString().slice(0, 10);

      // 1. المحاضرات المتراكمة (Overdue)
      if (analytics.tasksOverdue.length > 0) {
        recs.push({
          type: 'overdue',
          text: isEn
            ? `You have ${analytics.tasksOverdue.length} overdue tasks from earlier days. Re-balance your schedule automatically to stay on track.`
            : `لديك (${analytics.tasksOverdue.length}) مهام دراسية متراكمة من أيام سابقة. يُنصح بالضغط على "إعادة تنظيم الجدول" لتوزيعها بذكاء على الأيام القادمة.`,
          actionBtn: `<button type="button" class="btn-primary" style="padding:5px 12px;font-size:12px;" onclick="window.MEDNERD_EXT.MedPlanner.rescheduleOverdue()">${isEn ? 'Auto-Reschedule Now' : 'إعادة تنظيم الجدول الآن'}</button>`
        });
      }

      // 2. قرب الامتحان
      (data.courses || []).forEach(c => {
        if (!c.examDate) return;
        const diffDays = Math.ceil((new Date(c.examDate + 'T00:00:00') - new Date(todayStr + 'T00:00:00')) / 86400000);
        const remainingForCourse = (data.tasks || []).filter(t => t.courseId === c.id && !t.done).length;
        if (diffDays >= 0 && diffDays <= 7 && remainingForCourse > 0) {
          recs.push({
            type: 'exam',
            text: isEn
              ? `Exam alert: "${c.name}" is in ${diffDays} days with ${remainingForCourse} pending items. Prioritize this subject today.`
              : `تنبيه قرب امتحان "${c.name}" خلال (${diffDays} أيام) مع بقاء (${remainingForCourse}) مهام غير منجزة — يُفضل تقديم هذه المادة في جدول اليوم.`,
            actionBtn: ''
          });
        }
      });

      // 3. الموضوعات الضعيفة من الامتحانات
      if (analytics.weakTopics.length > 0) {
        recs.push({
          type: 'weak',
          text: isEn
            ? `Based on your MedExam results, focus on reviewing: ${analytics.weakTopics.slice(0, 3).join(', ')}.`
            : `بناءً على نتائجك الفعلية في الاختبارات، تحتاج إلى مراجعة وتقوية الموضوعات التالية: (${analytics.weakTopics.slice(0, 3).join('، ')}).`,
          actionBtn: `<button type="button" class="btn-secondary" style="padding:5px 12px;font-size:12px;" onclick="openToolWorkspace('med_exam')">${isEn ? 'Quiz Myself' : 'اختبر نفسك الآن'}</button>`
        });
      }

      // 4. بطاقات MedFlash المستحقة
      if (analytics.dueCardsCount > 0) {
        recs.push({
          type: 'flash',
          text: isEn
            ? `You have ${analytics.dueCardsCount} MedFlash cards due for Spaced Repetition review today.`
            : `حان موعد مراجعة (${analytics.dueCardsCount}) بطاقة استذكار مستحقة اليوم في نظام MedFlash.`,
          actionBtn: `<button type="button" class="btn-secondary" style="padding:5px 12px;font-size:12px;" onclick="openToolWorkspace('med_flash')">${isEn ? 'Review Cards' : 'مراجعة البطاقات'}</button>`
        });
      }

      return recs;
    },

    setView(mode) {
      this.state.viewMode = mode;
      this.renderDashboard();
    },

    renderDashboard() {
      const c = $('toolOutputContainer');
      if (!c) return;
      const isEn = LANG === 'en';
      const data = this.loadData();
      const analytics = MedStorage.getAnalyticsSummary();
      const todayStr = new Date().toISOString().slice(0, 10);
      const pct = data.tasks.length ? Math.round((analytics.tasksCompleted / data.tasks.length) * 100) : 0;
      const recs = this.buildSmartRecommendations(data, analytics);

      const recsHtml = recs.length
        ? recs.map(r => `<div class="mp-rec-card"><div><i class="fa-solid fa-lightbulb" style="color:var(--mustard);margin-inline-end:6px;"></i><b>${r.text}</b></div><div>${r.actionBtn || ''}</div></div>`).join('')
        : `<p style="font-size:13px;color:var(--muted-text);margin:0;">${isEn ? 'No alerts right now. Complete tasks or take exams to unlock personalized recommendations.' : 'وضعك الدراسي منظم حالياً. عند تسجيل تأخير أو إجراء اختبارات أو إضافة بطاقات ستظهر لك اقتراحات ذكية مخصصة تلقائياً.'}</p>`;

      let scheduleBodyHtml = '';
      if (!data.tasks.length) {
        scheduleBodyHtml = `<p style="text-align:center;padding:24px;color:var(--muted-text);">${isEn ? 'No study schedule created yet. Fill in a subject above and click Generate!' : 'لا يوجد برنامج دراسي محفوظ بعد. أدخل اسم المادة وعدد المحاضرات وتاريخ الامتحان بالأعلى ثم اضغط توليد!'}</p>`;
      } else if (this.state.viewMode === 'daily') {
        const todayTasks = data.tasks.filter(t => t.date === todayStr);
        const upcoming = data.tasks.filter(t => t.date > todayStr).slice(0, 10);
        scheduleBodyHtml = `
          <h4 style="color:var(--petrol);"><i class="fa-solid fa-calendar-day"></i> ${isEn ? `Today's Tasks (${todayStr})` : `مهام اليوم (${todayStr})`}</h4>
          ${todayTasks.length ? todayTasks.map(t => this.renderTaskRow(t)).join('') : `<p style="color:var(--muted-text);font-size:13px;">${isEn ? 'No tasks scheduled specifically for today.' : 'لا توجد مهام مجدولة لتاريخ اليوم تحديداً.'}</p>`}
          ${upcoming.length ? `<h4 style="margin-top:16px;"><i class="fa-solid fa-forward"></i> ${isEn ? 'Upcoming Sessions' : 'الجلسات القادمة'}</h4>${upcoming.map(t => this.renderTaskRow(t, true)).join('')}` : ''}
        `;
      } else {
        // عرض أسبوعي أو تقويمي مجمّع حسب التاريخ
        const byDate = {};
        data.tasks.forEach(t => {
          const d = t.date || todayStr;
          if (!byDate[d]) byDate[d] = [];
          byDate[d].push(t);
        });
        const sortedDates = Object.keys(byDate).sort();
        const limitDates = this.state.viewMode === 'weekly' ? sortedDates.slice(0, 7) : sortedDates;
        scheduleBodyHtml = `<div class="mp-cal-grid">${limitDates.map(d => `
          <div class="mp-day-card ${d === todayStr ? 'today' : ''}">
            <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border-color);padding-bottom:6px;">
              <b style="color:var(--petrol);font-size:13px;">${escapeHtml(d)}</b>
              <small style="color:var(--muted-text);">${byDate[d].filter(x => x.done).length}/${byDate[d].length}</small>
            </div>
            ${byDate[d].map(t => this.renderTaskRow(t)).join('')}
          </div>
        `).join('')}</div>`;
      }

      c.innerHTML = `
        <div class="ai-output-box" data-notr="1">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;">
            <h3 style="margin:0;"><i class="fa-solid fa-calendar-check"></i> ${isEn ? 'MedPlanner — Smart Study Scheduler' : 'منظم البرامج الدراسية الذكي (MedPlanner)'}</h3>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button type="button" class="btn-secondary" style="padding:6px 12px;font-size:12px;" onclick="window.MEDNERD_EXT.MedPlanner.rescheduleOverdue()">
                <i class="fa-solid fa-wand-magic-sparkles"></i> ${isEn ? 'Auto-Reschedule Delays' : 'إعادة تنظيم المتأخر'}
              </button>
              <button type="button" class="btn-secondary" style="padding:6px 12px;font-size:12px;" onclick="window.MEDNERD_EXT.MedPlanner.exportScheduleCSV()">
                <i class="fa-solid fa-file-csv"></i> CSV
              </button>
              <button type="button" class="btn-secondary" style="padding:6px 12px;font-size:12px;border-color:var(--danger);color:var(--danger);" onclick="window.MEDNERD_EXT.MedPlanner.clearAllSchedules()">
                <i class="fa-solid fa-trash"></i> ${isEn ? 'Clear' : 'مسح الكل'}
              </button>
            </div>
          </div>

          <!-- إحصاءات الإنجاز وشريط التقدم -->
          <div class="tea-kpi-grid" style="margin-top:0;">
            <div class="tea-kpi-card"><div class="tea-kpi-val">${pct}%</div><small>${isEn ? 'Completion' : 'نسبة الإنجاز'}</small><div class="tea-bar-track"><div class="tea-bar-fill" style="width:${pct}%;"></div></div></div>
            <div class="tea-kpi-card"><div class="tea-kpi-val">${analytics.tasksCompleted}/${data.tasks.length}</div><small>${isEn ? 'Completed Sessions' : 'الجلسات المنجزة'}</small></div>
            <div class="tea-kpi-card"><div class="tea-kpi-val" style="color:var(--mustard);">${analytics.tasksOverdue.length}</div><small>${isEn ? 'Overdue' : 'مهام متراكمة'}</small></div>
            <div class="tea-kpi-card"><div class="tea-kpi-val" style="color:var(--dark-green);">${(data.courses || []).length}</div><small>${isEn ? 'Active Subjects' : 'مواد مجدولة'}</small></div>
          </div>

          <!-- نظام الاقتراحات الذكية -->
          <div style="margin:14px 0;padding:14px;background:var(--bg-elevated);border:1px solid var(--border-color);border-radius:14px;">
            <div style="font-weight:800;color:var(--petrol);margin-bottom:8px;font-size:14px;">
              <i class="fa-solid fa-brain"></i> ${isEn ? 'Smart Recommendations (Based on Your Actual Data)' : 'الاقتراحات الدراسية الذكية (مبنية على بياناتك الفعلية)'}
            </div>
            ${recsHtml}
          </div>

          <!-- تبديل طريقة العرض: يومي / أسبوعي / تقويم -->
          <div class="a3d-tabs" style="margin-top:12px;">
            <button type="button" class="a3d-tab ${this.state.viewMode === 'daily' ? 'active' : ''}" onclick="window.MEDNERD_EXT.MedPlanner.setView('daily')">${isEn ? 'Daily Tasks' : 'المهام اليومية'}</button>
            <button type="button" class="a3d-tab ${this.state.viewMode === 'weekly' ? 'active' : ''}" onclick="window.MEDNERD_EXT.MedPlanner.setView('weekly')">${isEn ? 'Weekly Schedule' : 'الجدول الأسبوعي'}</button>
            <button type="button" class="a3d-tab ${this.state.viewMode === 'calendar' ? 'active' : ''}" onclick="window.MEDNERD_EXT.MedPlanner.setView('calendar')">${isEn ? 'Calendar View' : 'عرض التقويم الكامل'}</button>
          </div>

          ${scheduleBodyHtml}
        </div>`;
    },

    renderTaskRow(t, showDate = false) {
      return `
        <div class="mp-task-row ${t.done ? 'done' : ''}">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;flex:1;">
            <input type="checkbox" ${t.done ? 'checked' : ''} onchange="window.MEDNERD_EXT.MedPlanner.toggleTaskDone('${t.id}')">
            <div>
              <div style="font-weight:700;">${escapeHtml(t.title)}</div>
              <small style="color:var(--muted-text);">${showDate ? escapeHtml(t.date) + ' • ' : ''}${escapeHtml(t.timeSlot)} • ${t.durationMin}m ${t.type === 'revision' ? '🔁' : '📘'}</small>
            </div>
          </label>
          <button type="button" class="btn-secondary" style="padding:3px 8px;font-size:11px;border-color:var(--danger);color:var(--danger);" onclick="window.MEDNERD_EXT.MedPlanner.deleteTask('${t.id}')">×</button>
        </div>`;
    }
  };

  /* ==========================================================================
     MODULE 9: MEDTUTOR — INTERACTIVE VIDEO WHITEBOARD & PDF TEXT TUTOR
     يعمل كمدرس طبي تفاعلي بالفيديو (لوح شرح متحرك + صوت ناطق متزامن) وبالكتابة
     ========================================================================== */
  const MedTutor = {
    state: {
      slides: [],
      currentSlide: 0,
      isPlayingVideo: false,
      videoTimer: null,
      sourcePdfText: ''
    },

    cleanup() {
      this.stopVideo();
    },

    stopVideo() {
      this.state.isPlayingVideo = false;
      if (this.state.videoTimer) { clearTimeout(this.state.videoTimer); this.state.videoTimer = null; }
      MedVoiceEngine.stop();
      const btn = $('mtPlayPauseBtn');
      if (btn) btn.innerHTML = `<i class="fa-solid fa-play"></i> ${LANG === 'en' ? 'Play Video Lesson' : 'تشغيل درس الفيديو'}`;
    },

    async run() {
      if (APP_STATE.isRequestInFlight) return;
      this.cleanup();
      const pdfInp = $('mt_pdf');
      const textInp = ($('mt_text') && $('mt_text').value.trim()) || '';
      const level = ($('mt_level') && $('mt_level').value) || 'جامعي';
      const mode = ($('mt_mode') && $('mt_mode').value) || 'video_and_text';

      let pdfText = '';
      if (pdfInp && pdfInp.files && pdfInp.files[0]) {
        setToolLoadingState(true, LANG === 'en' ? 'Extracting lecture PDF...' : 'جارٍ استخراج نص محاضرة الـ PDF...');
        try {
          pdfText = await MedDependencyLoader.extractTextFromPdfFile(pdfInp.files[0], 15);
        } catch (err) {
          setToolLoadingState(false);
          renderToolError(err.message);
          return;
        }
      }

      const combinedSource = (pdfText ? `[محتوى ملف المحاضرة PDF]:\n${pdfText.slice(0, 12000)}\n\n` : '') +
        (textInp ? `[طلب/فقرة الطالب]:\n${textInp}` : '');

      if (!combinedSource.trim()) {
        setToolLoadingState(false);
        renderToolError(LANG === 'en' ? 'Please upload a PDF lecture or enter a medical topic/paragraph.' : 'يرجى رفع ملف محاضرة PDF أو لصق فقرة/موضوع طبي للشرح.');
        return;
      }

      this.state.sourcePdfText = pdfText;
      setToolLoadingState(true, LANG === 'en' ? 'Preparing Interactive Video Whiteboard & Text Lesson...' : 'جارٍ إعداد درس الفيديو التفاعلي والشرح الأكاديمي...');
      $('toolOutputContainer').innerHTML = '';

      const sysPrompt = `أنت "MedTutor" مدرس طبي ذكي يشرح بالفيديو والكتابة.
المستوى المطلوب: (${level}).
الوضع: (${mode}).
${pdfText ? 'تنبيه صارم: بما أن الطالب رفع ملف محاضرة PDF، يجب أن تعتمد أساساً على معلومات الملف المرفق، وإذا أضفت أي معلومة إثرائية من خارج الملف فافصلها بوضوح تحت بند [معلومة إضافية من خارج المحاضرة].' : ''}

أخرج كائن JSON واحد فقط بهذا الهيكل الدقيق:
{
  "lessonTitle": "عنوان الدرس",
  "videoSlides": [
    {
      "stepTitle": "عنوان المشهد / الخطوة",
      "visualNodes": ["عنصر 1 في المخطط", "عنصر 2", "عنصر 3"],
      "keyHighlight": "الخلاصة البصرية على السبورة",
      "narration": "النص الذي سينطقه المدرس صوتياً في هذا المشهد (جملتان إلى 4 جمل واضحة وطبيعية)"
    }
  ],
  "writtenExplanation": "الشرح الكتابي المنظم بصيغة Markdown مع فصل معلومات المحاضرة عن الإثراء الخارجي",
  "terminology": [{ "term": "المصطلح الطبي", "meaning": "المعنى الدقيق والمبسط" }],
  "clinicalExamples": ["مثال سريري تطبيقي 1", "مثال 2"],
  "checkpointMcq": {
    "question": "سؤال سريع لاختبار الفهم أثناء الشرح",
    "options": ["خيار A", "خيار B", "خيار C", "خيار D"],
    "correctIndex": 0,
    "explanation": "تعليل الإجابة"
  }
}`;

      try {
        const raw = await callGeminiAPI({
          systemInstruction: sysPrompt + SAFE_RULES,
          contents: [{ role: 'user', parts: [{ text: combinedSource }] }]
        });
        const data = extractJsonBlock(raw);
        this.state.slides = Array.isArray(data.videoSlides) && data.videoSlides.length
          ? data.videoSlides
          : [{ stepTitle: data.lessonTitle || 'الشرح', visualNodes: ['المفهوم الأساسي'], keyHighlight: '', narration: data.writtenExplanation || '' }];
        this.state.currentSlide = 0;
        MedStorage.recordStudyMinutes(15, 'MedTutor: ' + (data.lessonTitle || 'Lesson'));
        this.renderTutorUI(data);
      } catch (e) {
        renderToolError(e.message, () => this.run());
      } finally {
        setToolLoadingState(false);
      }
    },

    renderTutorUI(data) {
      const c = $('toolOutputContainer');
      if (!c) return;
      const isEn = LANG === 'en';
      const terms = Array.isArray(data.terminology) ? data.terminology : [];
      const examples = Array.isArray(data.clinicalExamples) ? data.clinicalExamples : [];
      const q = data.checkpointMcq || null;

      c.innerHTML = `
        <div class="ai-output-box" data-notr="1">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px;">
            <h3 style="margin:0;"><i class="fa-solid fa-chalkboard-user"></i> ${escapeHtml(data.lessonTitle || 'MedTutor Lesson')}</h3>
            <span class="mn-ext-pill green"><i class="fa-solid fa-video"></i> ${isEn ? 'Video Whiteboard + Text' : 'مدرس بالفيديو والكتابة'}</span>
          </div>

          ${MedVoiceEngine.renderVoiceControlToolbar('mtVoiceCtrl', isEn ? 'en-US' : 'ar-SA')}

          <!-- مشغل الفيديو التفاعلي (سبورة متحركة + صوت ناطق متزامن) -->
          <div class="mt-video-stage">
            <div class="mt-canvas-wrap" id="mtSlideStage"></div>
            <div class="mt-controls-bar">
              <div style="display:flex;gap:8px;align-items:center;">
                <button type="button" id="mtPlayPauseBtn" class="btn-primary" style="padding:7px 14px;font-size:12.5px;" onclick="window.MEDNERD_EXT.MedTutor.togglePlayVideo()">
                  <i class="fa-solid fa-play"></i> ${isEn ? 'Play Video Lesson' : 'تشغيل درس الفيديو'}
                </button>
                <button type="button" class="btn-secondary" style="padding:6px 10px;font-size:12px;color:#fff;border-color:#475569;" onclick="window.MEDNERD_EXT.MedTutor.prevSlide()"><i class="fa-solid fa-backward-step"></i></button>
                <button type="button" class="btn-secondary" style="padding:6px 10px;font-size:12px;color:#fff;border-color:#475569;" onclick="window.MEDNERD_EXT.MedTutor.nextSlide()"><i class="fa-solid fa-forward-step"></i></button>
              </div>
              <div id="mtStepDots" style="display:flex;gap:6px;align-items:center;"></div>
              <span id="mtSlideCounter" style="font-size:12px;color:#cbd5e1;font-weight:700;"></span>
            </div>
          </div>

          <!-- الشرح الكتابي المفصل -->
          <div style="background:var(--white);border:1px solid var(--border-color);border-radius:14px;padding:18px;margin-bottom:16px;">
            <h4 style="margin-top:0;color:var(--petrol);"><i class="fa-solid fa-book-open"></i> ${isEn ? 'Written Academic Explanation' : 'الشرح الكتابي المفصل'}</h4>
            <div>${renderSafeMarkdown(data.writtenExplanation || '')}</div>
          </div>

          <!-- المصطلحات والأمثلة السريرية -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin-bottom:16px;">
            <div style="background:var(--white);border:1px solid var(--border-color);border-radius:14px;padding:16px;">
              <h4 style="margin-top:0;color:var(--petrol);"><i class="fa-solid fa-spell-check"></i> ${isEn ? 'Medical Terminology' : 'شرح المصطلحات الطبية'}</h4>
              ${terms.length ? `<ul style="margin:0;padding-inline-start:18px;">${terms.map(t => `<li style="margin-bottom:6px;"><b>${escapeHtml(t.term)}:</b> ${escapeHtml(t.meaning)}</li>`).join('')}</ul>` : '<p>-</p>'}
            </div>
            <div style="background:var(--mustard-soft);border:1px solid var(--mustard);border-radius:14px;padding:16px;">
              <h4 style="margin-top:0;color:var(--mustard);"><i class="fa-solid fa-stethoscope"></i> ${isEn ? 'Clinical Examples' : 'الأمثلة السريرية'}</h4>
              ${examples.length ? `<ul style="margin:0;padding-inline-start:18px;">${examples.map(ex => `<li style="margin-bottom:6px;">${escapeHtml(ex)}</li>`).join('')}</ul>` : '<p>-</p>'}
            </div>
          </div>

          <!-- سؤال التحقق السريع -->
          ${q ? `
            <div style="background:var(--petrol-soft);border:1.5px solid var(--petrol);border-radius:14px;padding:16px;">
              <h4 style="margin-top:0;color:var(--petrol);"><i class="fa-solid fa-circle-question"></i> ${isEn ? 'Quick Understanding Check' : 'اختبر فهمك من هذه الفقرة'}</h4>
              <p style="font-weight:700;">${escapeHtml(q.question)}</p>
              <div id="mtMcqOpts">${(q.options || []).map((opt, idx) => `
                <button type="button" class="tea-option" onclick="window.MEDNERD_EXT.MedTutor.answerCheckpoint(${idx}, ${q.correctIndex}, '${escapeHtml((q.explanation || '').replace(/'/g, "\\'"))}')">
                  <b>${idx + 1}.</b> <span>${escapeHtml(opt)}</span>
                </button>`).join('')}
              </div>
              <div id="mtMcqFeedback" style="margin-top:8px;"></div>
            </div>
          ` : ''}
        </div>`;

      this.renderCurrentSlide();
    },

    renderCurrentSlide() {
      const stage = $('mtSlideStage');
      const dots = $('mtStepDots');
      const counter = $('mtSlideCounter');
      if (!stage || !this.state.slides.length) return;
      const slide = this.state.slides[this.state.currentSlide];
      const total = this.state.slides.length;

      const nodes = Array.isArray(slide.visualNodes) ? slide.visualNodes : [];
      const flowHtml = nodes.map((n, idx) => `
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="background:rgba(26,115,152,0.28);border:1.5px solid #22d3ee;color:#fff;padding:10px 14px;border-radius:12px;font-weight:800;font-size:13.5px;min-width:120px;text-align:center;">
            ${escapeHtml(n)}
          </div>
          ${idx < nodes.length - 1 ? '<i class="fa-solid fa-arrow-left" style="color:#22d3ee;"></i>' : ''}
        </div>
      `).join('');

      stage.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
          <span style="background:#1A7398;color:#fff;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:800;">
            ${LANG === 'en' ? 'Scene' : 'المشهد'} ${this.state.currentSlide + 1} / ${total}
          </span>
          <span style="font-size:12px;color:#94a3b8;font-weight:700;">MEDNERD VIDEO WHITEBOARD</span>
        </div>
        <h2 style="color:#38bdf8;margin:0 0 16px 0;font-size:20px;font-weight:900;">${escapeHtml(slide.stepTitle || '')}</h2>
        <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:center;margin:14px 0;">
          ${flowHtml}
        </div>
        ${slide.keyHighlight ? `<div style="background:rgba(192,106,35,0.2);border-inline-start:4px solid #fbbf24;padding:10px 14px;border-radius:8px;font-size:13.5px;color:#fef3c7;margin-top:10px;"><b>💡 ${escapeHtml(slide.keyHighlight)}</b></div>` : ''}
        <div style="margin-top:16px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.12);font-size:13.5px;color:#e2e8f0;line-height:1.7;">
          <i class="fa-solid fa-volume-high" style="color:#38bdf8;margin-inline-end:6px;"></i>
          ${escapeHtml(slide.narration || '')}
        </div>
      `;

      if (dots) {
        dots.innerHTML = this.state.slides.map((_, idx) =>
          `<span class="mt-step-dot ${idx === this.state.currentSlide ? 'active' : ''}" onclick="window.MEDNERD_EXT.MedTutor.jumpToSlide(${idx})"></span>`
        ).join('');
      }
      if (counter) counter.textContent = `${this.state.currentSlide + 1} / ${total}`;
    },

    jumpToSlide(idx) {
      this.state.currentSlide = idx;
      this.renderCurrentSlide();
      if (this.state.isPlayingVideo) this.playSlideAudioAndAdvance();
    },

    prevSlide() {
      this.state.currentSlide = Math.max(0, this.state.currentSlide - 1);
      this.renderCurrentSlide();
      if (this.state.isPlayingVideo) this.playSlideAudioAndAdvance();
    },

    nextSlide() {
      this.state.currentSlide = Math.min(this.state.slides.length - 1, this.state.currentSlide + 1);
      this.renderCurrentSlide();
      if (this.state.isPlayingVideo) this.playSlideAudioAndAdvance();
    },

    togglePlayVideo() {
      if (this.state.isPlayingVideo) {
        this.stopVideo();
        return;
      }
      this.state.isPlayingVideo = true;
      const btn = $('mtPlayPauseBtn');
      if (btn) btn.innerHTML = `<i class="fa-solid fa-pause"></i> ${LANG === 'en' ? 'Pause Lesson' : 'إيقاف الدرس'}`;
      this.playSlideAudioAndAdvance();
    },

    playSlideAudioAndAdvance() {
      if (!this.state.isPlayingVideo) return;
      const slide = this.state.slides[this.state.currentSlide];
      if (!slide) { this.stopVideo(); return; }
      const langCode = (typeof LANG !== 'undefined' && LANG === 'en') ? 'en-US' : 'ar-SA';
      MedVoiceEngine.speak(slide.narration || slide.stepTitle, langCode, null, () => {
        if (!this.state.isPlayingVideo) return;
        if (this.state.currentSlide < this.state.slides.length - 1) {
          this.state.videoTimer = setTimeout(() => {
            this.state.currentSlide++;
            this.renderCurrentSlide();
            this.playSlideAudioAndAdvance();
          }, 900);
        } else {
          this.stopVideo();
        }
      });
    },

    answerCheckpoint(chosen, correct, explanation) {
      const box = $('mtMcqOpts');
      const fb = $('mtMcqFeedback');
      if (box) {
        box.querySelectorAll('.tea-option').forEach((btn, idx) => {
          btn.classList.remove('correct', 'wrong');
          if (idx === correct) btn.classList.add('correct');
          else if (idx === chosen) btn.classList.add('wrong');
        });
      }
      if (fb) {
        const ok = chosen === correct;
        fb.innerHTML = `<div style="padding:10px;border-radius:10px;background:${ok ? 'var(--dark-green-soft)' : 'var(--danger-soft)'};font-size:13px;font-weight:700;">${ok ? '✓ إجابة صحيحة! ' : '✗ غير دقيقة. '}${escapeHtml(explanation)}</div>`;
      }
    }
  };

  /* ==========================================================================
     MODULE 10: MEDEXAM — MULTI-FORMAT BLIND EXAM SYSTEM
     ========================================================================== */
  const MedExam = {
    state: {
      topic: '',
      questions: [],
      answers: {},
      submitted: false,
      timerSec: 0,
      timerId: null
    },

    cleanup() {
      if (this.state.timerId) { clearInterval(this.state.timerId); this.state.timerId = null; }
    },

    async run() {
      if (APP_STATE.isRequestInFlight) return;
      this.cleanup();
      const pdfInp = $('mex_pdf');
      const topicInp = ($('mex_topic') && $('mex_topic').value.trim()) || '';
      const qType = ($('mex_type') && $('mex_type').value) || 'mixed';
      const count = Math.min(Math.max(parseInt(($('mex_count') && $('mex_count').value) || '6', 10), 3), 15);
      const diff = ($('mex_diff') && $('mex_diff').value) || 'medium';
      const secPerQ = parseInt(($('mex_timer') && $('mex_timer').value) || '60', 10) || 60;

      let pdfText = '';
      if (pdfInp && pdfInp.files && pdfInp.files[0]) {
        setToolLoadingState(true, LANG === 'en' ? 'Reading PDF for Exam...' : 'جارٍ استخراج نص ملف الـ PDF لبناء الامتحان...');
        try {
          pdfText = await MedDependencyLoader.extractTextFromPdfFile(pdfInp.files[0], 18);
        } catch (err) {
          setToolLoadingState(false);
          renderToolError(err.message);
          return;
        }
      }

      const source = (pdfText ? `[ملف المحاضرة]:\n${pdfText.slice(0, 12000)}\n\n` : '') + (topicInp ? `[الموضوع]: ${topicInp}` : '');
      if (!source.trim()) {
        setToolLoadingState(false);
        renderToolError(LANG === 'en' ? 'Please upload a PDF or enter an exam topic.' : 'يرجى رفع ملف PDF أو كتابة موضوع الامتحان.');
        return;
      }

      this.state.topic = topicInp || (pdfInp && pdfInp.files[0] ? pdfInp.files[0].name : 'Medical Exam');
      setToolLoadingState(true, LANG === 'en' ? 'Generating Multi-Format Blind Exam...' : 'جارٍ توليد أسئلة الامتحان وتجهيز المؤقت...');
      $('toolOutputContainer').innerHTML = '';

      const sysPrompt = `أنت نظام امتحانات طبية أكاديمية محترف. أنشئ (${count}) أسئلة بنمط (${qType}) ومستوى صعوبة (${diff}).
أخرج JSON فقط بهذا الهيكل:
{
  "questions": [
    {
      "id": 1,
      "type": "mcq | true_false | clinical_case | fill_blank | matching",
      "domain": "اسم الموضوع الفرعي",
      "prompt": "نص السؤال أو الحالة السريرية (أو جملة مع فراغ ___ لنوع fill_blank)",
      "options": ["خيار A", "خيار B", "خيار C", "خيار D"],
      "correctAnswer": "0 (رقم الفهرس لـ mcq/true_false/clinical_case/matching) أو الكلمة الصحيحة لـ fill_blank",
      "correctRationale": "لماذا الإجابة الصحيحة هي الأدق علمياً",
      "wrongRationales": "لماذا الخيارات الأخرى خاطئة"
    }
  ]
}
ملاحظة: لنوع true_false اجعل options هي ["صح (True)", "خطأ (False)"].`;

      try {
        const raw = await callGeminiAPI({
          systemInstruction: sysPrompt + SAFE_RULES,
          contents: [{ role: 'user', parts: [{ text: source }] }]
        });
        const parsed = extractJsonBlock(raw);
        if (!Array.isArray(parsed.questions) || !parsed.questions.length) throw new Error('لم يتم توليد أسئلة صالحة.');
        this.state.questions = parsed.questions;
        this.state.answers = {};
        this.state.submitted = false;
        this.state.timerSec = count * secPerQ;
        this.startTimer();
        this.renderExamUI();
      } catch (e) {
        renderToolError(e.message, () => this.run());
      } finally {
        setToolLoadingState(false);
      }
    },

    startTimer() {
      this.cleanup();
      this.state.timerId = setInterval(() => {
        if (this.state.submitted) { this.cleanup(); return; }
        if (this.state.timerSec > 0) {
          this.state.timerSec--;
          const el = $('mexTimerClock');
          if (el) {
            const m = Math.floor(this.state.timerSec / 60), s = this.state.timerSec % 60;
            el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
          }
        } else {
          this.submitExam();
        }
      }, 1000);
    },

    setAnswer(qIdx, val) {
      if (this.state.submitted) return;
      this.state.answers[qIdx] = val;
      if (this.state.questions[qIdx].type !== 'fill_blank') {
        this.renderExamUI();
      }
    },

    submitExam() {
      this.state.submitted = true;
      this.cleanup();
      let correctCount = 0;
      const weakDomains = [];

      this.state.questions.forEach((q, idx) => {
        const userAns = this.state.answers[idx];
        let isCorrect = false;
        if (q.type === 'fill_blank') {
          isCorrect = String(userAns || '').trim().toLowerCase() === String(q.correctAnswer || '').trim().toLowerCase();
        } else {
          isCorrect = Number(userAns) === Number(q.correctAnswer);
        }
        q._isCorrect = isCorrect;
        if (isCorrect) correctCount++;
        else if (q.domain && !weakDomains.includes(q.domain)) weakDomains.push(q.domain);
      });

      MedStorage.recordExamAttempt({
        topic: this.state.topic,
        sourceTool: 'MedExam',
        total: this.state.questions.length,
        correct: correctCount,
        timeSec: 0,
        weakDomains
      });

      this.renderExamUI();
    },

    renderExamUI() {
      const c = $('toolOutputContainer');
      if (!c) return;
      const isEn = LANG === 'en';
      const m = Math.floor(this.state.timerSec / 60), s = this.state.timerSec % 60;
      const total = this.state.questions.length;
      const score = this.state.questions.filter(q => q._isCorrect).length;

      const qHtml = this.state.questions.map((q, idx) => {
        const uAns = this.state.answers[idx];
        let body = '';
        if (q.type === 'fill_blank') {
          body = `<input type="text" class="form-input" ${this.state.submitted ? 'disabled' : ''} value="${escapeHtml(uAns || '')}" placeholder="${isEn ? 'Type missing medical term...' : 'اكتب المصطلح أو الكلمة الناقصة...'}" oninput="window.MEDNERD_EXT.MedExam.setAnswer(${idx}, this.value)">`;
        } else {
          const opts = Array.isArray(q.options) ? q.options : [];
          body = opts.map((opt, oIdx) => {
            let cls = 'tea-option';
            if (this.state.submitted) {
              if (oIdx === Number(q.correctAnswer)) cls += ' correct';
              else if (Number(uAns) === oIdx) cls += ' wrong';
            } else if (Number(uAns) === oIdx) {
              cls += ' selected';
            }
            return `<button type="button" class="${cls}" onclick="window.MEDNERD_EXT.MedExam.setAnswer(${idx}, ${oIdx})"><b>${oIdx + 1}.</b> <span>${escapeHtml(opt)}</span></button>`;
          }).join('');
        }

        const reviewHtml = this.state.submitted ? `
          <div style="margin-top:10px;padding:12px;border-radius:10px;background:${q._isCorrect ? 'var(--dark-green-soft)' : 'var(--danger-soft)'};font-size:13.5px;">
            <div><b>${q._isCorrect ? '✓ إجابة صحيحة' : '✗ إجابة خاطئة'}</b> ${q.type === 'fill_blank' ? `(الصحيح: <b>${escapeHtml(q.correctAnswer)}</b>)` : ''}</div>
            <div style="margin-top:6px;"><b>سبب الصحة:</b> ${escapeHtml(q.correctRationale || '')}</div>
            ${q.wrongRationales ? `<div style="margin-top:4px;"><b>سبب خطأ الخيارات الأخرى:</b> ${escapeHtml(q.wrongRationales)}</div>` : ''}
          </div>
        ` : '';

        return `
          <div style="padding:18px;background:var(--white);border:1px solid var(--border-color);border-radius:14px;margin-bottom:14px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span class="mn-ext-pill">${idx + 1} / ${total} • ${escapeHtml(q.type || 'MCQ')}</span>
              <span class="mn-ext-pill mustard">${escapeHtml(q.domain || '')}</span>
            </div>
            <p style="font-weight:700;font-size:15.5px;line-height:1.7;">${escapeHtml(q.prompt || '')}</p>
            ${body}
            ${reviewHtml}
          </div>`;
      }).join('');

      c.innerHTML = `
        <div class="ai-output-box" data-notr="1">
          <div class="tea-topbar">
            <div>
              <h3 style="margin:0;"><i class="fa-solid fa-file-signature"></i> ${escapeHtml(this.state.topic)}</h3>
              <small style="color:var(--muted-text);">${this.state.submitted ? (isEn ? `Final Score: ${score}/${total}` : `النتيجة النهائية: ${score} من ${total} (حُفظت في سجل التقدم)`) : (isEn ? 'Blind Exam Mode — Answers hidden until submission' : 'وضع الامتحان الحقيقي — لا تُكشف الإجابات إلا بعد التسليم')}</small>
            </div>
            <span id="mexTimerClock" class="mn-ext-pill danger" style="font-size:15px;font-family:monospace;">${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}</span>
          </div>
          ${qHtml}
          ${!this.state.submitted ? `<button type="button" class="btn-primary" style="width:100%;background:var(--dark-green);" onclick="window.MEDNERD_EXT.MedExam.submitExam()"><i class="fa-solid fa-check-double"></i> ${isEn ? 'Submit Exam & Reveal Rationales' : 'تسليم الامتحان وتصحيح الإجابات'}</button>` : ''}
        </div>`;
    }
  };

  /* ==========================================================================
     MODULE 11: MEDFLASH — SPACED REPETITION (SM-2 / FSRS ALGORITHM)
     ========================================================================== */
  const MedFlash = {
    state: {
      activeSubjectFilter: 'ALL',
      studyQueue: [],
      currentIndex: 0,
      flipped: false
    },

    loadCards() {
      return MedStorage.read(MedStorage.KEYS.FLASH_DECKS, []);
    },

    saveCards(cards) {
      MedStorage.write(MedStorage.KEYS.FLASH_DECKS, cards);
    },

    async run() {
      const pdfInp = $('mf_pdf');
      const subject = ($('mf_subject') && $('mf_subject').value.trim()) || 'General Medicine';
      const topicText = ($('mf_text') && $('mf_text').value.trim()) || '';
      const count = Math.min(Math.max(parseInt(($('mf_count') && $('mf_count').value) || '6', 10), 2), 20);

      let pdfText = '';
      if (pdfInp && pdfInp.files && pdfInp.files[0]) {
        setToolLoadingState(true, 'جارٍ قراءة ملف المحاضرة لتوليد البطاقات...');
        try {
          pdfText = await MedDependencyLoader.extractTextFromPdfFile(pdfInp.files[0], 12);
        } catch (err) {
          setToolLoadingState(false);
          renderToolError(err.message);
          return;
        }
      }

      const source = (pdfText ? pdfText.slice(0, 10000) + '\n' : '') + topicText;
      if (source.trim()) {
        if (APP_STATE.isRequestInFlight) return;
        setToolLoadingState(true, 'جارٍ استخراج بطاقات الاستذكار الطبية...');
        const sysPrompt = `أنشئ (${count}) بطاقة استذكار طبية عالية العائد للمادة (${subject}) بصيغة JSON فقط:
{ "cards": [{ "front": "السؤال في الوجه الأول", "back": "الإجابة الدقيقة في الوجه الثاني" }] }`;
        try {
          const raw = await callGeminiAPI({
            systemInstruction: sysPrompt + SAFE_RULES,
            contents: [{ role: 'user', parts: [{ text: source }] }]
          });
          const parsed = extractJsonBlock(raw);
          const existing = this.loadCards();
          const newCards = (parsed.cards || []).map((c, idx) => ({
            id: 'fc_' + Date.now() + '_' + idx,
            subject,
            front: c.front || '',
            back: c.back || '',
            repetitions: 0,
            interval: 0,
            easeFactor: 2.5,
            nextReview: Date.now(),
            difficultyFlag: 'normal'
          }));
          this.saveCards([...newCards, ...existing]);
        } catch (e) {
          setToolLoadingState(false);
          renderToolError(e.message, () => this.run());
          return;
        } finally {
          setToolLoadingState(false);
        }
      }

      this.buildQueue();
      this.renderUI();
    },

    buildQueue() {
      const all = this.loadCards();
      const now = Date.now();
      const filtered = this.state.activeSubjectFilter === 'ALL'
        ? all
        : all.filter(c => c.subject === this.state.activeSubjectFilter);
      const due = filtered.filter(c => !c.nextReview || c.nextReview <= now);
      this.state.studyQueue = due.length ? due : filtered;
      this.state.currentIndex = 0;
      this.state.flipped = false;
    },

    // خوارزمية SM-2 للتكرار المتباعد
    rateCard(quality) {
      // quality: 1 (صعب جداً/أعد), 3 (جيد), 5 (سهل جداً)
      const card = this.state.studyQueue[this.state.currentIndex];
      if (!card) return;
      const all = this.loadCards();
      const target = all.find(c => c.id === card.id);
      if (target) {
        let rep = target.repetitions || 0;
        let ef = target.easeFactor || 2.5;
        let interval = target.interval || 0;

        if (quality < 3) {
          rep = 0;
          interval = 1;
          target.difficultyFlag = 'hard';
        } else {
          if (rep === 0) interval = 1;
          else if (rep === 1) interval = 6;
          else interval = Math.round(interval * ef);
          rep++;
          target.difficultyFlag = quality === 5 ? 'easy' : 'normal';
        }
        ef = Math.max(1.3, ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
        target.repetitions = rep;
        target.easeFactor = Math.round(ef * 100) / 100;
        target.interval = interval;
        target.nextReview = Date.now() + interval * 86400000;
        this.saveCards(all);
      }

      this.state.flipped = false;
      if (this.state.currentIndex < this.state.studyQueue.length - 1) {
        this.state.currentIndex++;
      } else {
        this.buildQueue();
      }
      this.renderUI();
    },

    addManualCard() {
      const sub = ($('mf_manual_sub') && $('mf_manual_sub').value.trim()) || 'General';
      const front = ($('mf_manual_front') && $('mf_manual_front').value.trim()) || '';
      const back = ($('mf_manual_back') && $('mf_manual_back').value.trim()) || '';
      if (!front || !back) return;
      const all = this.loadCards();
      all.unshift({
        id: 'fc_' + Date.now(),
        subject: sub,
        front,
        back,
        repetitions: 0,
        interval: 0,
        easeFactor: 2.5,
        nextReview: Date.now(),
        difficultyFlag: 'normal'
      });
      this.saveCards(all);
      this.buildQueue();
      this.renderUI();
    },

    toggleFlip() {
      this.state.flipped = !this.state.flipped;
      const el = $('mfCardInner');
      if (el) el.classList.toggle('flipped', this.state.flipped);
    },

    setFilter(sub) {
      this.state.activeSubjectFilter = sub;
      this.buildQueue();
      this.renderUI();
    },

    renderUI() {
      const c = $('toolOutputContainer');
      if (!c) return;
      const isEn = LANG === 'en';
      const all = this.loadCards();
      const subjects = Array.from(new Set(all.map(x => x.subject).filter(Boolean)));
      const analytics = MedStorage.getAnalyticsSummary();
      const cur = this.state.studyQueue[this.state.currentIndex];

      c.innerHTML = `
        <div class="ai-output-box" data-notr="1">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px;">
            <h3 style="margin:0;"><i class="fa-solid fa-layer-group"></i> ${isEn ? 'MedFlash — Spaced Repetition (SM-2)' : 'نظام البطاقات الذكية (MedFlash SM-2)'}</h3>
            <select class="form-select" style="width:auto;" onchange="window.MEDNERD_EXT.MedFlash.setFilter(this.value)">
              <option value="ALL">${isEn ? 'All Subjects' : 'كل المواد'} (${all.length})</option>
              ${subjects.map(s => `<option value="${escapeHtml(s)}" ${this.state.activeSubjectFilter === s ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('')}
            </select>
          </div>

          <div class="tea-kpi-grid" style="margin-top:0;">
            <div class="tea-kpi-card"><div class="tea-kpi-val">${all.length}</div><small>${isEn ? 'Total Cards' : 'إجمالي البطاقات'}</small></div>
            <div class="tea-kpi-card"><div class="tea-kpi-val" style="color:var(--mustard);">${analytics.dueCardsCount}</div><small>${isEn ? 'Due Today' : 'مستحقة للمراجعة'}</small></div>
            <div class="tea-kpi-card"><div class="tea-kpi-val" style="color:var(--dark-green);">${analytics.masteredCardsCount}</div><small>${isEn ? 'Mastered' : 'بطاقات متقنة'}</small></div>
            <div class="tea-kpi-card"><div class="tea-kpi-val" style="color:var(--danger);">${analytics.hardCardsCount}</div><small>${isEn ? 'Hard Cards' : 'بطاقات صعبة'}</small></div>
          </div>

          ${cur ? `
            <div class="mf-card-stage" onclick="window.MEDNERD_EXT.MedFlash.toggleFlip()">
              <div id="mfCardInner" class="mf-card-inner ${this.state.flipped ? 'flipped' : ''}">
                <div class="mf-card-face">
                  <span class="mn-ext-pill" style="margin-bottom:12px;">${escapeHtml(cur.subject)} • ${this.state.currentIndex + 1}/${this.state.studyQueue.length}</span>
                  <div style="font-size:18px;font-weight:800;line-height:1.6;">${escapeHtml(cur.front)}</div>
                  <small style="color:var(--muted-text);margin-top:16px;">${isEn ? 'Click card to flip' : 'اضغط على البطاقة لقلبها ورؤية الإجابة'}</small>
                </div>
                <div class="mf-card-face mf-card-back">
                  <span class="mn-ext-pill green" style="margin-bottom:12px;">${isEn ? 'Answer' : 'الإجابة'}</span>
                  <div style="font-size:16.5px;font-weight:700;line-height:1.7;">${escapeHtml(cur.back)}</div>
                </div>
              </div>
            </div>
            <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-bottom:18px;">
              <button type="button" class="btn-secondary" style="border-color:var(--danger);color:var(--danger);" onclick="window.MEDNERD_EXT.MedFlash.rateCard(1)">${isEn ? 'Hard / Again (1d)' : 'صعبة / أعدها (غداً)'}</button>
              <button type="button" class="btn-primary" onclick="window.MEDNERD_EXT.MedFlash.rateCard(3)">${isEn ? 'Good (SM-2)' : 'جيدة (مراجعة متباعدة)'}</button>
              <button type="button" class="btn-primary" style="background:var(--dark-green);" onclick="window.MEDNERD_EXT.MedFlash.rateCard(5)">${isEn ? 'Easy' : 'سهلة جداً'}</button>
            </div>
          ` : `<p style="text-align:center;padding:24px;color:var(--muted-text);">${isEn ? 'No flashcards saved yet. Generate from PDF/Text or add manually below.' : 'لا توجد بطاقات محفوظة بعد. ولّد بطاقات من محاضرة بالأعلى أو أضف بطاقة يدوياً أدناه.'}</p>`}

          <!-- إضافة بطاقة يدوياً -->
          <div style="background:var(--bg-elevated);border:1px solid var(--border-color);border-radius:14px;padding:14px;">
            <h4 style="margin-top:0;"><i class="fa-solid fa-plus-circle"></i> ${isEn ? 'Add Flashcard Manually' : 'إضافة بطاقة يدوياً'}</h4>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin-bottom:10px;">
              <input type="text" id="mf_manual_sub" class="form-input" placeholder="${isEn ? 'Subject...' : 'اسم المادة...'}">
              <input type="text" id="mf_manual_front" class="form-input" placeholder="${isEn ? 'Front (Question)...' : 'الوجه الأول (السؤال)...'}">
              <input type="text" id="mf_manual_back" class="form-input" placeholder="${isEn ? 'Back (Answer)...' : 'الوجه الثاني (الإجابة)...'}">
            </div>
            <button type="button" class="btn-secondary" onclick="window.MEDNERD_EXT.MedFlash.addManualCard()">${isEn ? 'Save Card' : 'حفظ البطاقة'}</button>
          </div>
        </div>`;
    }
  };

  /* ==========================================================================
     MODULE 12: ABG ANALYZER (DETERMINISTIC JAVASCRIPT ENGINE)
     ========================================================================== */
  const ABGAnalyzer = {
    async run() {
      const ph = parseFloat($('abg_ph') && $('abg_ph').value);
      const paco2 = parseFloat($('abg_paco2') && $('abg_paco2').value);
      const hco3 = parseFloat($('abg_hco3') && $('abg_hco3').value);
      const elecRaw = ($('abg_elec') && $('abg_elec').value.trim()) || '140, 104';
      const extraRaw = ($('abg_extra') && $('abg_extra').value.trim()) || '4.0, acute';

      if (isNaN(ph) || isNaN(paco2) || isNaN(hco3)) {
        renderToolError(LANG === 'en' ? 'Please enter valid numeric values for pH, PaCO2, and HCO3-.' : 'يرجى إدخال قيم رقمية صحيحة لـ pH وPaCO2 وHCO3.');
        return;
      }

      const [naStr, clStr] = elecRaw.split(',').map(s => s.trim());
      const na = parseFloat(naStr) || 140;
      const cl = parseFloat(clStr) || 104;
      const [albStr, chronStr] = extraRaw.split(',').map(s => s.trim().toLowerCase());
      const albumin = parseFloat(albStr) || 4.0;
      const isChronic = (chronStr || '').includes('chron') || (chronStr || '').includes('مزمن');

      // 1. الاضطراب الأولي
      let primary = 'Normal Acid-Base Balance';
      let primaryAr = 'توازن حامضي قاعدي طبيعي';
      let acidemia = ph < 7.35;
      let alkalemia = ph > 7.45;
      let isMetabolic = false;
      let isRespiratory = false;

      if (acidemia) {
        if (hco3 < 22 && paco2 <= 45) {
          primary = 'Primary Metabolic Acidosis';
          primaryAr = 'حماض استقلابي أولي (Metabolic Acidosis)';
          isMetabolic = true;
        } else if (paco2 > 45) {
          primary = isChronic ? 'Chronic Respiratory Acidosis' : 'Acute Respiratory Acidosis';
          primaryAr = (isChronic ? 'حماض تنفسي مزمن' : 'حماض تنفسي حاد') + ' (Respiratory Acidosis)';
          isRespiratory = true;
        } else {
          primary = 'Mixed Acidosis';
          primaryAr = 'حماض مختلط (تنفسي + استقلابي)';
        }
      } else if (alkalemia) {
        if (hco3 > 26 && paco2 >= 35) {
          primary = 'Primary Metabolic Alkalosis';
          primaryAr = 'قلاء استقلابي أولي (Metabolic Alkalosis)';
          isMetabolic = true;
        } else if (paco2 < 35) {
          primary = isChronic ? 'Chronic Respiratory Alkalosis' : 'Acute Respiratory Alkalosis';
          primaryAr = (isChronic ? 'قلاء تنفسي مزمن' : 'قلاء تنفسي حاد') + ' (Respiratory Alkalosis)';
          isRespiratory = true;
        } else {
          primary = 'Mixed Alkalosis';
          primaryAr = 'قلاء مختلط (تنفسي + استقلابي)';
        }
      } else {
        if (hco3 < 22 || hco3 > 26 || paco2 < 35 || paco2 > 45) {
          primary = 'Compensated or Mixed Acid-Base Disorder (Normal pH)';
          primaryAr = 'اضطراب معاوض بالكامل أو مختلط (pH ضمن المجال الطبيعي 7.35–7.45)';
        }
      }

      // 2. معادلات المعاوضة الحتمية
      let expectedCompText = '';
      let mixedCheckText = '';
      if (isMetabolic && acidemia) {
        // Winter's Formula: Expected PaCO2 = 1.5 * HCO3 + 8 (+/- 2)
        const expCo2 = 1.5 * hco3 + 8;
        const low = (expCo2 - 2).toFixed(1), high = (expCo2 + 2).toFixed(1);
        expectedCompText = `Winter's Formula: PaCO2 المتوقع = ${expCo2.toFixed(1)} (±2) mmHg [${low} – ${high}]`;
        if (paco2 > expCo2 + 2) mixedCheckText = '⚠️ PaCO2 أعلى من المتوقع: يوجد **حماض تنفسي مرافق** (Mixed Metabolic + Respiratory Acidosis).';
        else if (paco2 < expCo2 - 2) mixedCheckText = '⚠️ PaCO2 أقل من المتوقع: يوجد **قلاء تنفسي مرافق** (Mixed Metabolic Acidosis + Respiratory Alkalosis).';
        else mixedCheckText = '✓ المعاوضة التنفسية مناسبة ومتوافقة مع معادلة Winter.';
      } else if (isMetabolic && alkalemia) {
        const expCo2 = 0.7 * (hco3 - 24) + 40;
        expectedCompText = `Expected PaCO2 = ${expCo2.toFixed(1)} (±5) mmHg`;
        if (paco2 > expCo2 + 5) mixedCheckText = '⚠️ يوجد حماض تنفسي مرافق.';
        else if (paco2 < expCo2 - 5) mixedCheckText = '⚠️ يوجد قلاء تنفسي مرافق.';
        else mixedCheckText = '✓ المعاوضة التنفسية مناسبة.';
      } else if (isRespiratory && acidemia) {
        const deltaCo2 = paco2 - 40;
        const expHco3 = isChronic ? (24 + 0.35 * deltaCo2) : (24 + 0.1 * deltaCo2);
        expectedCompText = `Expected HCO3- (${isChronic ? 'Chronic' : 'Acute'}) = ${expHco3.toFixed(1)} (±2) mEq/L`;
        if (hco3 < expHco3 - 2) mixedCheckText = '⚠️ HCO3- أقل من المتوقع: يوجد **حماض استقلابي مرافق**.';
        else if (hco3 > expHco3 + 2) mixedCheckText = '⚠️ HCO3- أعلى من المتوقع: يوجد **قلاء استقلابي مرافق**.';
        else mixedCheckText = '✓ المعاوضة الكلوية مناسبة.';
      } else if (isRespiratory && alkalemia) {
        const deltaCo2 = 40 - paco2;
        const expHco3 = isChronic ? (24 - 0.5 * deltaCo2) : (24 - 0.2 * deltaCo2);
        expectedCompText = `Expected HCO3- (${isChronic ? 'Chronic' : 'Acute'}) = ${expHco3.toFixed(1)} (±2) mEq/L`;
        if (hco3 < expHco3 - 2) mixedCheckText = '⚠️ يوجد حماض استقلابي مرافق.';
        else if (hco3 > expHco3 + 2) mixedCheckText = '⚠️ يوجد قلاء استقلابي مرافق.';
        else mixedCheckText = '✓ المعاوضة الكلوية مناسبة.';
      }

      // 3. الفجوة الأنيونية المصححة بالألبومين (Corrected Anion Gap) و Delta Ratio
      const rawAG = na - (cl + hco3);
      const correctedAG = rawAG + 2.5 * (4.0 - albumin);
      const agStatus = correctedAG > 12
        ? 'High Anion Gap Metabolic Acidosis (HAGMA — MUDPILES)'
        : 'Normal Anion Gap (NAGMA / Non-AG)';
      let deltaRatioText = 'غير مطبق';
      if (correctedAG > 12 && hco3 < 24) {
        const deltaAG = correctedAG - 12;
        const deltaHco3 = Math.max(0.5, 24 - hco3);
        const ratio = deltaAG / deltaHco3;
        let interp = 'Pure HAGMA';
        if (ratio < 1.0) interp = 'HAGMA + Normal AG Metabolic Acidosis (e.g., Diarrhea/RTA)';
        else if (ratio > 2.0) interp = 'HAGMA + Concurrent Metabolic Alkalosis (or Chronic Resp. Acidosis)';
        deltaRatioText = `${ratio.toFixed(2)} — ${interp}`;
      }

      const c = $('toolOutputContainer');
      if (!c) return;
      c.innerHTML = `
        <div class="ai-output-box" data-notr="1">
          <h3><i class="fa-solid fa-lungs-virus"></i> تحليل غازات الدم الشرياني (ABG Deterministic Calculator)</h3>
          <div class="tea-kpi-grid">
            <div class="tea-kpi-card"><div class="tea-kpi-val">${ph.toFixed(2)}</div><small>pH (7.35–7.45)</small></div>
            <div class="tea-kpi-card"><div class="tea-kpi-val">${paco2.toFixed(1)}</div><small>PaCO2 (35–45 mmHg)</small></div>
            <div class="tea-kpi-card"><div class="tea-kpi-val">${hco3.toFixed(1)}</div><small>HCO3- (22–26 mEq/L)</small></div>
            <div class="tea-kpi-card"><div class="tea-kpi-val" style="color:${correctedAG > 12 ? 'var(--danger)' : 'var(--dark-green)'};">${correctedAG.toFixed(1)}</div><small>Corrected Anion Gap</small></div>
          </div>

          <div style="background:var(--petrol-soft);border:1.5px solid var(--petrol);border-radius:14px;padding:16px;margin-bottom:14px;">
            <div style="font-size:16px;font-weight:900;color:var(--petrol);margin-bottom:6px;">${escapeHtml(primaryAr)}</div>
            <div style="font-size:13.5px;margin-bottom:4px;"><b>${escapeHtml(expectedCompText || 'تحقق من القيم المرجعية')}</b></div>
            <div style="font-size:13.5px;">${renderSafeMarkdown(mixedCheckText || primary)}</div>
          </div>

          <table>
            <thead><tr><th>المعيار الحسابي</th><th>القيمة المحسوبة</th><th>التفسير السريري</th></tr></thead>
            <tbody>
              <tr><td><b>Raw Anion Gap</b></td><td>${rawAG.toFixed(1)} mEq/L</td><td>Na - (Cl + HCO3)</td></tr>
              <tr><td><b>Albumin-Corrected AG</b></td><td>${correctedAG.toFixed(1)} mEq/L</td><td>${escapeHtml(agStatus)}</td></tr>
              <tr><td><b>Delta Ratio (ΔAG / ΔHCO3)</b></td><td colspan="2">${escapeHtml(deltaRatioText)}</td></tr>
            </tbody>
          </table>

          <div id="abgAiPearlsBox" style="margin-top:16px;"></div>
        </div>`;

      // إثراء سريري بالذكاء الاصطناعي للتشخيصات التفريقية دون تغيير الحسابات الحتمية أعلاه
      if (!APP_STATE.isRequestInFlight) {
        const aiBox = $('abgAiPearlsBox');
        if (aiBox) aiBox.innerHTML = `<small style="color:var(--petrol);font-weight:700;"><span class="loading-spinner req-spin"></span> جارٍ ربط النتيجة بالأسباب السريرية المرجحة...</small>`;
        try {
          const md = await callGeminiAPI({
            systemInstruction: 'أنت استشاري عناية مركزة. بناءً على نتائج تحليل ABG المحسوبة، قدّم الأسباب السريرية المرجحة وخطوات التدبير الأولية بإيجاز أكاديمي.' + SAFE_RULES,
            contents: [{ role: 'user', parts: [{ text: `pH=${ph}, PaCO2=${paco2}, HCO3=${hco3}, Corrected AG=${correctedAG.toFixed(1)}, Diagnosis=${primary}, Mixed=${mixedCheckText}` }] }]
          });
          if (aiBox) aiBox.innerHTML = `<div style="padding:14px;background:var(--white);border:1px solid var(--border-color);border-radius:12px;">${renderSafeMarkdown(md)}</div>`;
        } catch (_) {
          if (aiBox) aiBox.innerHTML = '';
        }
      }
    }
  };

  /* ==========================================================================
     MODULE 13: ECG TUTOR (CANVAS ECG SIMULATOR + DETERMINISTIC CALCULATORS)
     ========================================================================== */
  const ECGTutor = {
    PATTERNS: {
      normal_sinus: { name: 'Normal Sinus Rhythm (نظم جيبي طبيعي)', rate: 75, pr: '160 ms', qrs: '88 ms', stShift: 0, irregular: false, sawtooth: false, wideQrs: false },
      stemi_ant:    { name: 'Anterior STEMI (احتشاء أمامي حاد)', rate: 98, pr: '160 ms', qrs: '96 ms', stShift: -18, irregular: false, sawtooth: false, wideQrs: false },
      afib:         { name: 'Atrial Fibrillation (رجفان أذيني)', rate: 118, pr: 'Absent (No P)', qrs: '84 ms', stShift: 0, irregular: true, sawtooth: false, wideQrs: false },
      aflutter:     { name: 'Atrial Flutter (رفرفة أذينية 3:1)', rate: 100, pr: 'Sawtooth F-waves', qrs: '88 ms', stShift: 0, irregular: false, sawtooth: true, wideQrs: false },
      vtach:        { name: 'Ventricular Tachycardia (تسرع بطيني)', rate: 170, pr: 'AV Dissociation', qrs: '165 ms (Wide)', stShift: 0, irregular: false, sawtooth: false, wideQrs: true },
      chb:          { name: 'Complete Heart Block 3° (إحصار أذيني بطيني تام)', rate: 36, pr: 'Independent P & QRS', qrs: '130 ms', stShift: 0, irregular: false, sawtooth: false, wideQrs: false }
    },

    async run() {
      const patternKey = ($('ecg_pattern') && $('ecg_pattern').value) || 'normal_sinus';
      const rateRaw = ($('ecg_rate') && $('ecg_rate').value.trim()) || '';
      const axisRaw = ($('ecg_axis') && $('ecg_axis').value.trim()) || '+6, +5';
      const qtRaw = parseFloat($('ecg_qt') && $('ecg_qt').value) || 380;
      const caseCtx = ($('ecg_ctx') && $('ecg_ctx').value.trim()) || '';

      const pat = this.PATTERNS[patternKey] || this.PATTERNS.normal_sinus;
      let hr = pat.rate;
      if (rateRaw) {
        const val = parseFloat(rateRaw);
        if (!isNaN(val) && val > 0) {
          hr = rateRaw.toLowerCase().includes('box') || val < 30 ? Math.round(1500 / val) : Math.round(val);
        }
      }

      // حساب المحور الكهربائي (QRS Axis) من Lead I و aVF
      const [l1Str, avfStr] = axisRaw.split(',').map(s => s.trim());
      const lead1 = parseFloat(l1Str) || 5;
      const leadAVF = parseFloat(avfStr) || 4;
      const axisDeg = Math.round((Math.atan2(leadAVF, lead1) * 180) / Math.PI);
      let axisInterp = 'Normal Axis (-30° to +90°)';
      if (axisDeg < -30 && axisDeg >= -90) axisInterp = 'Left Axis Deviation (LAD)';
      else if (axisDeg > 90 && axisDeg <= 180) axisInterp = 'Right Axis Deviation (RAD)';
      else if (axisDeg < -90 || axisDeg > 180) axisInterp = 'Extreme / Northwest Axis';

      // حساب QTc بمعادلة Bazett
      const rrSec = 60 / Math.max(25, hr);
      const qtc = Math.round(qtRaw / Math.sqrt(rrSec));
      const qtcAlert = qtc > 470 ? '⚠️ Prolonged QTc (Risk of Torsades de Pointes)' : '✓ Normal QTc (< 450-470 ms)';

      const c = $('toolOutputContainer');
      if (!c) return;
      c.innerHTML = `
        <div class="ai-output-box" data-notr="1">
          <h3><i class="fa-solid fa-heart-pulse"></i> مدرب تخطيط القلب الكهربائي (ECG Tutor & Waveform Simulator)</h3>
          <canvas id="ecgLiveCanvas" class="ecg-paper-canvas" width="900" height="210"></canvas>

          <div class="tea-kpi-grid">
            <div class="tea-kpi-card"><div class="tea-kpi-val">${hr} bpm</div><small>Heart Rate (السرعة)</small></div>
            <div class="tea-kpi-card"><div class="tea-kpi-val">${axisDeg}°</div><small>${escapeHtml(axisInterp)}</small></div>
            <div class="tea-kpi-card"><div class="tea-kpi-val" style="color:${qtc > 470 ? 'var(--danger)' : 'var(--dark-green)'};">${qtc} ms</div><small>Bazett QTc (${escapeHtml(qtcAlert)})</small></div>
            <div class="tea-kpi-card"><div class="tea-kpi-val" style="font-size:16px;">${escapeHtml(pat.pr)}</div><small>PR / P-wave • QRS: ${escapeHtml(pat.qrs)}</small></div>
          </div>

          <div id="ecgAiExplainBox"></div>
        </div>`;

      this.drawWaveform('ecgLiveCanvas', pat, hr);

      if (!APP_STATE.isRequestInFlight) {
        const box = $('ecgAiExplainBox');
        if (box) box.innerHTML = `<small style="color:var(--petrol);font-weight:700;"><span class="loading-spinner req-spin"></span> جارٍ إعداد التفسير السريري والحالة التدريبية للنمط (${pat.name})...</small>`;
        try {
          const md = await callGeminiAPI({
            systemInstruction: 'أنت أستاذ أمراض القلب (ECG Instructor). اشرح قراءة التخطيط المحددة وفق الخطوات المنهجية السبع (Rate, Rhythm, Axis, Intervals, Hypertrophy, Ischemia/ST-T) ثم اطرح حالة سريرية تدريبية قصيرة على نفس النمط.' + SAFE_RULES,
            contents: [{ role: 'user', parts: [{ text: `Pattern: ${pat.name}, HR=${hr} bpm, Axis=${axisDeg}° (${axisInterp}), QTc=${qtc} ms. Context: ${caseCtx || 'Training'}` }] }]
          });
          if (box) {
            box.innerHTML = `<div style="padding:16px;background:var(--white);border:1px solid var(--border-color);border-radius:14px;">${renderSafeMarkdown(md)}</div>`;
            addExportBar(box.firstElementChild, md, 'mednerd-ecg-lesson');
          }
        } catch (_) {
          if (box) box.innerHTML = '';
        }
      }
    },

    drawWaveform(canvasId, pat, hr) {
      const canvas = $(canvasId);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width, h = canvas.height;
      const base = h * 0.58;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(0, base);

      const cycleW = Math.max(70, Math.min(240, Math.round(13000 / Math.max(30, hr))));
      let x = 10;
      while (x < w - 20) {
        const stepW = pat.irregular ? cycleW * (0.72 + Math.random() * 0.55) : cycleW;
        if (pat.wideQrs) {
          // VTach wide monomorphic sine-like complexes
          ctx.lineTo(x + stepW * 0.2, base - 65);
          ctx.lineTo(x + stepW * 0.5, base + 55);
          ctx.lineTo(x + stepW * 0.85, base);
        } else {
          if (pat.sawtooth) {
            ctx.lineTo(x + stepW * 0.12, base - 16);
            ctx.lineTo(x + stepW * 0.22, base + 6);
            ctx.lineTo(x + stepW * 0.34, base - 16);
          } else if (!pat.irregular) {
            // P wave
            ctx.lineTo(x + stepW * 0.14, base);
            ctx.quadraticCurveTo(x + stepW * 0.2, base - 14, x + stepW * 0.26, base);
          }
          // QRS complex
          ctx.lineTo(x + stepW * 0.36, base);
          ctx.lineTo(x + stepW * 0.39, base + 12);
          ctx.lineTo(x + stepW * 0.44, base - 72);
          ctx.lineTo(x + stepW * 0.49, base + 22);
          ctx.lineTo(x + stepW * 0.53, base + pat.stShift);
          // T wave
          ctx.quadraticCurveTo(x + stepW * 0.68, base - 26 + pat.stShift, x + stepW * 0.82, base);
        }
        x += stepW;
      }
      ctx.stroke();
    }
  };

  /* ==========================================================================
     MODULE 14: LAB INTERPRETER (REFERENCE RANGES + CRITICAL ALERTS)
     ========================================================================== */
  const LabInterpreter = {
    async run() {
      if (APP_STATE.isRequestInFlight) return;
      const panel = ($('lab_panel') && $('lab_panel').value) || 'CBC';
      const values = ($('lab_values') && $('lab_values').value.trim()) || '';
      const ctx = ($('lab_ctx') && $('lab_ctx').value.trim()) || 'Adult';

      if (!values) {
        renderToolError(LANG === 'en' ? 'Please enter the lab values to interpret.' : 'يرجى إدخال قيم التحاليل المخبرية لتفسيرها.');
        return;
      }

      setToolLoadingState(true, 'جارٍ مطابقة التحاليل مع المجالات المرجعية وتنبيهات القيم الحرجة...');
      $('toolOutputContainer').innerHTML = '';

      const sysPrompt = `أنت أخصائي طب مخبري وسريري. فسر لوحة التحاليل (${panel}) للمريض (${ctx}).
يجب أن تخرج جدولاً دقيقاً يضم:
| التحليل | قيمة المريض | المجال المرجعي القياسي والوحدة | الحالة (طبيعي / مرتفع / منخفض / قيمة حرجة ⚠️) | الدلالة السريرية |
ثم قدم:
1. تنبيهات القيم الحرجة إن وجدت (Critical Values).
2. التشخيص التفريقي المرجح بناءً على نمط التحاليل.
3. الفحوصات التأكيدية التالية.`;

      try {
        const md = await callGeminiAPI({
          systemInstruction: sysPrompt + SAFE_RULES,
          contents: [{ role: 'user', parts: [{ text: `Panel: ${panel}\nPatient: ${ctx}\nValues:\n${values}` }] }]
        });
        renderToolOutput(md);
      } catch (e) {
        renderToolError(e.message, () => this.run());
      } finally {
        setToolLoadingState(false);
      }
    }
  };

  /* ==========================================================================
     MODULE 15: DIFFERENTIAL DIAGNOSIS TRAINER
     ========================================================================== */
  const DiffDxTrainer = {
    async run() {
      if (APP_STATE.isRequestInFlight) return;
      const pres = ($('ddx_pres') && $('ddx_pres').value.trim()) || '';
      const vitals = ($('ddx_vitals') && $('ddx_vitals').value.trim()) || 'Not specified';
      const stage = ($('ddx_stage') && $('ddx_stage').value) || 'full';

      if (!pres) {
        renderToolError(LANG === 'en' ? 'Please enter the patient presentation.' : 'يرجى إدخال قصة المريض والأعراض.');
        return;
      }

      setToolLoadingState(true, 'جارٍ بناء مصفوفة التشخيص التفريقي المنهجية...');
      $('toolOutputContainer').innerHTML = '';

      const sysPrompt = `أنت استشاري تشخيص سريري. طبّق التفكير السريري المنهجي على الحالة (${stage}):
1. **تمثيل المشكلة السريرية (Problem Representation)** بلغة طبية دقيقة.
2. **قائمة التشخيصات التفريقية المصنفة**:
   - تشخيصات خطيرة لا يجوز إغفالها (Must-Not-Miss / Life-Threatening).
   - التشخيصات الأكثر شيوعاً (Most Likely).
3. **الفحوصات المرجِّحة (Discriminating Tests)** وكيف يغيّر كل فحص الاحتمال التشخيصي.
4. **التشخيص المرجّح وتعليله السريري**.`;

      try {
        const md = await callGeminiAPI({
          systemInstruction: sysPrompt + SAFE_RULES,
          contents: [{ role: 'user', parts: [{ text: `Presentation:\n${pres}\n\nVitals & Exam:\n${vitals}` }] }]
        });
        renderToolOutput(md);
      } catch (e) {
        renderToolError(e.message, () => this.run());
      } finally {
        setToolLoadingState(false);
      }
    }
  };

  /* ==========================================================================
     MODULE 16: DRUG INTERACTION CHECKER (CURATED RULES + LIVE OPENFDA LABELS)
     ========================================================================== */
  const DrugChecker = {
    CRITICAL_RULES: [
      { pair: ['warfarin', 'aspirin'], sev: 'MAJOR', mech: 'Additive antiplatelet + anticoagulant inhibition increases GI & intracranial hemorrhage risk.' },
      { pair: ['warfarin', 'amiodarone'], sev: 'MAJOR', mech: 'Amiodarone inhibits CYP2C9 and CYP3A4, markedly increasing Warfarin INR and bleeding risk.' },
      { pair: ['warfarin', 'metronidazole'], sev: 'MAJOR', mech: 'Inhibits S-warfarin metabolism via CYP2C9, causing steep INR elevation.' },
      { pair: ['sildenafil', 'nitroglycerin'], sev: 'CONTRAINDICATED', mech: 'Synergistic cGMP-mediated vasodilation causes profound, potentially fatal hypotension.' },
      { pair: ['spironolactone', 'lisinopril'], sev: 'MAJOR', mech: 'Dual RAAS blockade impairs renal potassium excretion, causing life-threatening hyperkalemia.' },
      { pair: ['spironolactone', 'enalapril'], sev: 'MAJOR', mech: 'High risk of severe hyperkalemia.' },
      { pair: ['clarithromycin', 'simvastatin'], sev: 'CONTRAINDICATED', mech: 'Strong CYP3A4 inhibition increases statin levels, risking rhabdomyolysis.' },
      { pair: ['linezolid', 'sertraline'], sev: 'CONTRAINDICATED', mech: 'MAO inhibition + SSRI increases risk of severe Serotonin Syndrome.' },
      { pair: ['methotrexate', 'ibuprofen'], sev: 'MAJOR', mech: 'NSAIDs reduce renal tubular clearance of Methotrexate, risking bone marrow & renal toxicity.' },
      { pair: ['digoxin', 'amiodarone'], sev: 'MAJOR', mech: 'P-glycoprotein inhibition doubles Digoxin serum levels; reduce Digoxin dose by 50%.' }
    ],

    async fetchOpenFdaLabel(drugName) {
      try {
        const url = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(drugName)}"+openfda.brand_name:"${encodeURIComponent(drugName)}"&limit=1`;
        const resp = await fetch(url);
        if (!resp.ok) return null;
        const data = await resp.json();
        const r = data && data.results && data.results[0];
        if (!r) return null;
        const interText = Array.isArray(r.drug_interactions) ? r.drug_interactions[0] : '';
        const boxed = Array.isArray(r.boxed_warning) ? r.boxed_warning[0] : '';
        return {
          name: drugName,
          interactions: interText ? interText.slice(0, 750) : '',
          boxedWarning: boxed ? boxed.slice(0, 400) : '',
          sourceUrl: `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(drugName)}"`
        };
      } catch (_) {
        return null;
      }
    },

    async run() {
      if (APP_STATE.isRequestInFlight) return;
      const drugsRaw = ($('dc_drugs') && $('dc_drugs').value.trim()) || '';
      const status = ($('dc_status') && $('dc_status').value.trim()) || 'Standard Adult';
      const drugs = drugsRaw.split(/[,،\n]+/).map(s => s.trim()).filter(Boolean);

      if (drugs.length < 2) {
        renderToolError(LANG === 'en' ? 'Please enter at least 2 medications separated by commas.' : 'يرجى إدخال اسم دواءين على الأقل مفصولين بفاصلة.');
        return;
      }

      setToolLoadingState(true, 'جارٍ فحص التداخلات الدوائية والتحقق من نشرات OpenFDA الرسمية...');
      $('toolOutputContainer').innerHTML = '';

      const lowerDrugs = drugs.map(d => d.toLowerCase());
      const localMatches = [];
      this.CRITICAL_RULES.forEach(rule => {
        const hasA = lowerDrugs.some(d => d.includes(rule.pair[0]));
        const hasB = lowerDrugs.some(d => d.includes(rule.pair[1]));
        if (hasA && hasB) localMatches.push(rule);
      });

      const fdaResults = (await Promise.all(drugs.slice(0, 4).map(d => this.fetchOpenFdaLabel(d)))).filter(Boolean);

      const fdaContext = fdaResults.map(f => `[OpenFDA Official Label: ${f.name}]\nDrug Interactions: ${f.interactions}\nBoxed Warning: ${f.boxedWarning}`).join('\n\n');
      const ruleContext = localMatches.map(m => `- ${m.pair.join(' + ')} [${m.sev}]: ${m.mech}`).join('\n');

      try {
        const md = await callGeminiAPI({
          systemInstruction: `أنت صيدلاني سريري متخصص في التداخلات الدوائية. اعتمد على البيانات الرسمية المرفقة من OpenFDA وقواعد الإنذار الدوائي المرفقة في التحليل، وصنف كل تداخل حسب الخطورة (Contraindicated / Major / Moderate / Minor) مع شرح الآلية الدوائية والبدائل الآمنة والمصادر الموثوقة (OpenFDA / Lexicomp / Drugs.com).` + SAFE_RULES,
          contents: [{ role: 'user', parts: [{ text: `Medications: ${drugs.join(', ')}\nPatient Status: ${status}\n\nLocal High-Alert Matches:\n${ruleContext || 'None matched directly in local quick-rules'}\n\nOpenFDA Official Data:\n${fdaContext || 'No direct OpenFDA label returned for exact query'}` }] }]
        });

        const c = $('toolOutputContainer');
        if (!c) return;
        const alertHtml = localMatches.length
          ? localMatches.map(m => `<div style="padding:12px;border-radius:12px;border-inline-start:4px solid var(--danger);background:var(--danger-soft);margin-bottom:10px;font-size:13.5px;"><b>🚨 ${escapeHtml(m.sev)}: ${escapeHtml(m.pair[0].toUpperCase())} + ${escapeHtml(m.pair[1].toUpperCase())}</b> — ${escapeHtml(m.mech)}</div>`).join('')
          : '';
        const fdaBadge = fdaResults.length
          ? `<div class="mn-ext-badge-bar"><span class="mn-ext-pill green"><i class="fa-solid fa-database"></i> تم التحقق من OpenFDA Official Labels لـ (${fdaResults.map(x => escapeHtml(x.name)).join('، ')})</span></div>`
          : '';

        c.innerHTML = `<div class="ai-output-box" data-notr="1">${fdaBadge}${alertHtml}<div>${renderSafeMarkdown(md)}</div></div>`;
        addExportBar(c.firstElementChild, md, 'mednerd-drug-interactions');
      } catch (e) {
        renderToolError(e.message, () => this.run());
      } finally {
        setToolLoadingState(false);
      }
    }
  };

  /* ==========================================================================
     MODULE 17: MEDPROGRESS — REAL-DATA STUDENT PROGRESS DASHBOARD
     ========================================================================== */
  const MedProgress = {
    run() {
      const c = $('toolOutputContainer');
      if (!c) return;
      const isEn = LANG === 'en';
      const a = MedStorage.getAnalyticsSummary();
      const hasData = a.tasksTotal > 0 || a.totalExams > 0 || a.totalCards > 0 || a.totalStudyHours > 0;

      c.innerHTML = `
        <div class="ai-output-box" data-notr="1">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;">
            <h3 style="margin:0;"><i class="fa-solid fa-chart-line"></i> ${isEn ? 'MedProgress — Live Student Academic Analytics' : 'لوحة متابعة تقدم الطالب (MedProgress — بيانات فعلية 100%)'}</h3>
            <span class="mn-ext-pill green">${isEn ? 'Real Local Data Only' : 'بيانات حقيقية من نشاطك فقط'}</span>
          </div>

          <div class="tea-kpi-grid" style="margin-top:0;">
            <div class="tea-kpi-card"><div class="tea-kpi-val">${a.tasksCompleted}/${a.tasksTotal}</div><small>${isEn ? 'Lectures Completed' : 'المحاضرات المكتملة'}</small></div>
            <div class="tea-kpi-card"><div class="tea-kpi-val">${a.totalExams}</div><small>${isEn ? 'Exams Taken' : 'عدد الامتحانات'}</small></div>
            <div class="tea-kpi-card"><div class="tea-kpi-val" style="color:var(--dark-green);">${a.avgExamScore}%</div><small>${isEn ? 'Average Score' : 'متوسط العلامات'}</small></div>
            <div class="tea-kpi-card"><div class="tea-kpi-val">${a.accuracyPct}%</div><small>${isEn ? 'Answer Accuracy' : 'نسبة الإجابات الصحيحة'}</small></div>
            <div class="tea-kpi-card"><div class="tea-kpi-val" style="color:var(--petrol);">${a.masteredCardsCount}/${a.totalCards}</div><small>${isEn ? 'Mastered Flashcards' : 'البطاقات المحفوظة'}</small></div>
            <div class="tea-kpi-card"><div class="tea-kpi-val" style="color:var(--mustard);">${a.totalStudyHours} h</div><small>${isEn ? 'Logged Study Hours' : 'ساعات الدراسة الموثقة'}</small></div>
          </div>

          ${!hasData ? `
            <div style="padding:20px;text-align:center;background:var(--bg-elevated);border:1px dashed var(--petrol);border-radius:14px;">
              <b>${isEn ? 'No activity recorded yet!' : 'لم يتم تسجيل نشاط دراسي بعد!'}</b>
              <p style="font-size:13px;color:var(--muted-text);margin:6px 0 0;">${isEn ? 'Start using MedPlanner, MedExam, MedFlash, or MedTutor and your real metrics will appear here automatically.' : 'ابدأ باستخدام منظم الدراسة (MedPlanner) أو نظام الامتحانات (MedExam) أو البطاقات (MedFlash) وستظهر إحصاءاتك الحقيقية هنا تلقائياً.'}</p>
            </div>
          ` : `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px;margin-top:16px;">
              <div style="background:var(--dark-green-soft);border:1px solid var(--dark-green);border-radius:14px;padding:16px;">
                <h4 style="margin-top:0;color:var(--dark-green);"><i class="fa-solid fa-award"></i> ${isEn ? 'Mastered Topics (≥80%)' : 'المواد والموضوعات المتقنة'}</h4>
                ${a.strongTopics.length ? `<ul>${a.strongTopics.map(t => `<li><b>${escapeHtml(t)}</b></li>`).join('')}</ul>` : `<p style="font-size:13px;">${isEn ? 'No topic ≥80% yet.' : 'لم تسجل علامة ≥ 80% في موضوع بعد.'}</p>`}
              </div>
              <div style="background:var(--danger-soft);border:1px solid var(--danger);border-radius:14px;padding:16px;">
                <h4 style="margin-top:0;color:var(--danger);"><i class="fa-solid fa-triangle-exclamation"></i> ${isEn ? 'Topics Needing Review (<65%)' : 'الموضوعات الضعيفة (تحتاج مراجعة)'}</h4>
                ${a.weakTopics.length ? `<ul>${a.weakTopics.map(t => `<li><b>${escapeHtml(t)}</b></li>`).join('')}</ul>` : `<p style="font-size:13px;">${isEn ? 'No weak topics flagged.' : 'لا توجد موضوعات ضعيفة مسجلة حالياً.'}</p>`}
              </div>
            </div>

            ${a.examsList.length ? `
              <h4 style="margin-top:18px;"><i class="fa-solid fa-clock-rotate-left"></i> ${isEn ? 'Recent Exam History' : 'سجل الامتحانات الأخيرة'}</h4>
              <table>
                <thead><tr><th>التاريخ</th><th>الأداة</th><th>الموضوع</th><th>العلامة</th></tr></thead>
                <tbody>
                  ${a.examsList.slice(0, 10).map(ex => `<tr><td>${escapeHtml(String(ex.date || '').slice(0, 10))}</td><td>${escapeHtml(ex.sourceTool)}</td><td>${escapeHtml(ex.topic)}</td><td><b>${ex.correct}/${ex.total} (${ex.scorePct}%)</b></td></tr>`).join('')}
                </tbody>
              </table>
            ` : ''}
          `}
        </div>`;
    }
  };

  /* ==========================================================================
     MODULE 18: RESEARCH LAB (LIVE NCBI PUBMED API + BIOSTATISTICS ENGINE)
     لا يخترع أي PMID أو DOI — يجلبها حياً من NCBI PubMed E-utilities
     ========================================================================== */
  const ResearchLab = {
    async searchPubMedLive(query) {
      const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=6&retmode=json&sort=relevance`;
      const sResp = await fetch(searchUrl);
      if (!sResp.ok) throw new Error('NCBI PubMed ESearch HTTP ' + sResp.status);
      const sData = await sResp.json();
      const ids = (sData && sData.esearchresult && sData.esearchresult.idlist) || [];
      if (!ids.length) return [];

      const sumUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
      const mResp = await fetch(sumUrl);
      if (!mResp.ok) throw new Error('NCBI PubMed ESummary HTTP ' + mResp.status);
      const mData = await mResp.json();
      const resultObj = (mData && mData.result) || {};
      return ids.map(id => {
        const item = resultObj[id];
        if (!item) return null;
        const authors = Array.isArray(item.authors) ? item.authors.slice(0, 3).map(a => a.name).join(', ') : '';
        const doiObj = Array.isArray(item.articleids) ? item.articleids.find(x => x.idtype === 'doi') : null;
        return {
          pmid: id,
          title: item.title || '',
          journal: item.fulljournalname || item.source || '',
          pubdate: item.pubdate || '',
          authors,
          doi: doiObj ? doiObj.value : '',
          url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`
        };
      }).filter(Boolean);
    },

    computeBiostats2x2(rawStr) {
      const parts = String(rawStr || '').split(/[,،\s]+/).map(Number).filter(n => !isNaN(n));
      if (parts.length < 4) return null;
      const [a, b, c, d] = parts; // a=TP, b=FP, c=FN, d=TN
      const sens = a / Math.max(1, a + c);
      const spec = d / Math.max(1, b + d);
      const ppv = a / Math.max(1, a + b);
      const npv = d / Math.max(1, c + d);
      const or = (a * d) / Math.max(0.001, b * c);
      const r1 = a / Math.max(1, a + b);
      const r2 = c / Math.max(1, c + d);
      const rr = r1 / Math.max(0.0001, r2);
      const arr = Math.abs(r1 - r2);
      const nnt = arr > 0 ? Math.round(1 / arr) : Infinity;
      return { a, b, c, d, sens, spec, ppv, npv, or, rr, arr, nnt };
    },

    async run() {
      const mod = ($('rl_module') && $('rl_module').value) || 'pubmed_search';
      const queryOrText = ($('rl_text') && $('rl_text').value.trim()) || '';
      const statsRaw = ($('rl_stats') && $('rl_stats').value.trim()) || '';

      if (mod === 'biostats') {
        const st = this.computeBiostats2x2(statsRaw);
        if (!st) {
          renderToolError('للمساعد الإحصائي، أدخل 4 أرقام للجدول الرباعي 2x2 مفصولة بفاصلة: TP, FP, FN, TN (مثال: 45, 15, 20, 80).');
          return;
        }
        const c = $('toolOutputContainer');
        if (!c) return;
        c.innerHTML = `
          <div class="ai-output-box" data-notr="1">
            <h3><i class="fa-solid fa-square-root-variable"></i> المساعد الإحصائي الطبي (Deterministic Biostatistics 2x2)</h3>
            <div class="tea-kpi-grid">
              <div class="tea-kpi-card"><div class="tea-kpi-val">${(st.sens * 100).toFixed(1)}%</div><small>Sensitivity (الحساسية)</small></div>
              <div class="tea-kpi-card"><div class="tea-kpi-val">${(st.spec * 100).toFixed(1)}%</div><small>Specificity (النوعية)</small></div>
              <div class="tea-kpi-card"><div class="tea-kpi-val">${(st.ppv * 100).toFixed(1)}%</div><small>PPV</small></div>
              <div class="tea-kpi-card"><div class="tea-kpi-val">${(st.npv * 100).toFixed(1)}%</div><small>NPV</small></div>
              <div class="tea-kpi-card"><div class="tea-kpi-val">${st.or.toFixed(2)}</div><small>Odds Ratio (OR)</small></div>
              <div class="tea-kpi-card"><div class="tea-kpi-val">${st.rr.toFixed(2)}</div><small>Relative Risk (RR)</small></div>
              <div class="tea-kpi-card"><div class="tea-kpi-val">${isFinite(st.nnt) ? st.nnt : '∞'}</div><small>NNT (ARR: ${(st.arr * 100).toFixed(1)}%)</small></div>
            </div>
          </div>`;
        return;
      }

      if (!queryOrText) {
        renderToolError(LANG === 'en' ? 'Please enter your research topic, question, or manuscript text.' : 'يرجى إدخال موضوع البحث أو السؤال السريري أو نص الورقة البحثية.');
        return;
      }

      if (mod === 'pubmed_search') {
        setToolLoadingState(true, 'جارٍ البحث الحي في قاعدة بيانات PubMed (NCBI E-utilities)...');
        $('toolOutputContainer').innerHTML = '';
        try {
          const articles = await this.searchPubMedLive(queryOrText);
          const c = $('toolOutputContainer');
          if (!c) return;
          if (!articles.length) {
            c.innerHTML = `<div class="ai-output-box"><p>لم يتم العثور على أبحاث مطابقة في PubMed لهذا الاستعلام. جرب مصطلحات إنجليزية أدق.</p></div>`;
            return;
          }
          const rowsHtml = articles.map(art => `
            <div style="padding:14px;background:var(--white);border:1px solid var(--border-color);border-radius:12px;margin-bottom:12px;">
              <div style="font-weight:800;font-size:14.5px;color:var(--petrol);margin-bottom:4px;">
                <a href="${art.url}" target="_blank" rel="noopener" style="color:var(--petrol);text-decoration:none;">${escapeHtml(art.title)} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:11px;"></i></a>
              </div>
              <div style="font-size:12.5px;color:var(--muted-text);margin-bottom:6px;">
                <b>Authors:</b> ${escapeHtml(art.authors || 'N/A')} • <b>Journal:</b> ${escapeHtml(art.journal)} (${escapeHtml(art.pubdate)})
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;font-size:12px;">
                <span class="mn-ext-pill">PMID: ${escapeHtml(art.pmid)}</span>
                ${art.doi ? `<span class="mn-ext-pill green">DOI: ${escapeHtml(art.doi)}</span>` : ''}
                <span class="mn-ext-pill mustard">Vancouver: ${escapeHtml(art.authors)}. ${escapeHtml(art.title)} ${escapeHtml(art.journal)}. ${escapeHtml(art.pubdate)}. PMID: ${escapeHtml(art.pmid)}.</span>
              </div>
            </div>
          `).join('');

          c.innerHTML = `
            <div class="ai-output-box" data-notr="1">
              <div class="mn-ext-badge-bar">
                <span class="mn-ext-pill green"><i class="fa-solid fa-globe"></i> نتائج بحث حية وحقيقية من PubMed (NCBI) — بدون أي اختلاق للمراجع</span>
              </div>
              ${rowsHtml}
            </div>`;
        } catch (e) {
          renderToolError(e.message, () => this.run());
        } finally {
          setToolLoadingState(false);
        }
        return;
      }

      if (APP_STATE.isRequestInFlight) return;
      setToolLoadingState(true, 'جارٍ معالجة المهمة البحثية...');
      $('toolOutputContainer').innerHTML = '';

      const prompts = {
        pico: 'أنت خبير منهجية بحث طبي. صغ إطار PICO الكامل (Population, Intervention, Comparison, Outcome) واقترح 3 أسئلة بحثية قابلة للنشر واستراتيجية بحث MeSH Terms لـ PubMed. تنبيه صارم: لا تخترع أي PMID أو DOI.',
        summarizer: 'أنت باحث طبي. لخص الورقة البحثية المرفقة وفق هيكل IMRaD (Objective, Methods, Key Results, Limitations, Clinical Takeaway) مع الأمانة العلمية التامة وعدم اختراع مراجع.',
        abstract: 'أنت محرر مجلات طبية محكمة. ساعد في صياغة وتحسين ملخص بحثي احترافي (Structured Abstract: Background, Methods, Results, Conclusion) مع الالتزام بالمعطيات المقدمة فقط.',
        appraisal: 'أنت خبير طب مسند بالدليل (EBM). قم بالتقييم النقدي (Critical Appraisal) للدراسة المرفقة (تحليل التحيز Bias، الصدق الداخلي والخارجي، القوة الإحصائية، وجدول CASP).',
        references: 'أنت أمين مكتبة طبية. نظم ونسق المراجع المقدمة بصيغتي Vancouver و APA بدقة تامة دون اختراع أي أرقام PMID أو DOI غير موجودة في النص.'
      };

      try {
        const md = await callGeminiAPI({
          systemInstruction: (prompts[mod] || prompts.pico) + SAFE_RULES,
          contents: [{ role: 'user', parts: [{ text: queryOrText }] }]
        });
        renderToolOutput(md);
      } catch (e) {
        renderToolError(e.message, () => this.run());
      } finally {
        setToolLoadingState(false);
      }
    }
  };

  /* ==========================================================================
     تسجيل الأدوات الـ 17 في المنصة وربطها بأقسامها الواضحة
     ========================================================================== */
  const EXT_TOOL_DEFINITIONS = [
    /* --- PRODUCTIVITY --- */
    {
      id: 'med_planner', category: 'study', dept: 'PRODUCTIVITY', name: 'MedPlanner — Smart Scheduler', icon: 'fa-calendar-days', badge: 'منظم الدراسة', custom: true,
      desc: 'منظم برامج دراسية ذكي يتكيف مع تاريخ الامتحان وصعوبة المادة وإتقانك وأيام العطلة، مع عرض تقويمي ويومي وأسبوعي وإعادة جدولة وتوصيات ذكية حقيقية.',
      keywords: 'medplanner smart study scheduler calendar recommendations منظم برامج دراسية جدول مذاكرة',
      btn: ['fa-calendar-check', 'توليد / عرض البرنامج الدراسي الذكي'],
      fields: [
        [
          { id: 'mp_course', type: 'text', label: 'اسم المادة (أو اتركه فارغاً لعرض جدولك المحفوظ):', ph: 'مثال: أمراض القلب والأوعية' },
          { id: 'mp_lecture', type: 'text', label: 'عنوان المجموعة / المحاضرات:', ph: 'مثال: اضطرابات النظم والصمامات' }
        ],
        [
          { id: 'mp_count', type: 'number', label: 'عدد المحاضرات:', def: 6, min: 1, max: 60 },
          { id: 'mp_duration', type: 'number', label: 'مدة كل محاضرة (بالدقائق):', def: 45, min: 15, max: 240 },
          { id: 'mp_exam_date', type: 'date', label: 'تاريخ الامتحان:' }
        ],
        [
          { id: 'mp_difficulty', type: 'select', label: 'مستوى صعوبة المادة:', opts: [['hard', 'صعبة (تخصيص وقت أكبر)'], ['medium', 'متوسطة'], ['easy', 'سهلة']] },
          { id: 'mp_mastery', type: 'select', label: 'مستوى إتقانك الحالي:', opts: [['beginner', 'مبتدئ / دراسة أولى'], ['intermediate', 'متوسط'], ['advanced', 'متقدم / مراجعة']] },
          { id: 'mp_daily_hours', type: 'number', label: 'ساعات الدراسة المتاحة يومياً:', def: 4, min: 1, max: 14 }
        ],
        [
          { id: 'mp_pref_time', type: 'select', label: 'وقت الدراسة المفضل:', opts: [['morning', 'صباحاً'], ['afternoon', 'ظهراً'], ['evening', 'مساءً'], ['night', 'ليلاً']] },
          { id: 'mp_rest_day', type: 'select', label: 'يوم العطلة الأسبوعي:', opts: [['Friday', 'الجمعة'], ['Saturday', 'السبت'], ['Sunday', 'الأحد'], ['None', 'بدون عطلة']] },
          { id: 'mp_rev_hours', type: 'number', label: 'ساعات المراجعة اليومية:', def: 1, min: 0, max: 6 }
        ]
      ]
    },
    {
      id: 'med_progress', category: 'study', dept: 'PRODUCTIVITY', name: 'MedProgress Analytics', icon: 'fa-chart-line', badge: 'متابعة التقدم', custom: true,
      desc: 'لوحة متابعة تقدم الطالب الأكاديمي ببيانات حقيقية 100%: المحاضرات المكتملة، الامتحانات، متوسط العلامات، البطاقات المحفوظة، والموضوعات الضعيفة.',
      keywords: 'medprogress analytics dashboard progress tracker متابعة التقدم احصائيات',
      btn: ['fa-chart-pie', 'عرض لوحة تقدمي الأكاديمي المباشرة'],
      fields: [
        { id: 'mpg_filter', type: 'select', label: 'نطاق العرض:', opts: [['all', 'جميع السجلات والإحصاءات الحقيقية']] }
      ]
    },

    /* --- STUDY --- */
    {
      id: 'med_tutor', category: 'study', dept: 'STUDY', name: 'MedTutor (Video & Text)', icon: 'fa-chalkboard-user', badge: 'مدرس بالفيديو', custom: true,
      desc: 'مدرس طبي ذكي يعمل بالفيديو (سبورة تفاعلية متحركة بالصوت والصورة) والكتابة: ارفع محاضرة PDF أو ألصق فقرة، واختر مستوى الشرح مع أمثلة سريرية وأسئلة فهم.',
      keywords: 'medtutor video whiteboard pdf tutor مدرس ذكي بالفيديو شرح محاضرات',
      btn: ['fa-video', 'بدء درس الفيديو التفاعلي والشرح'],
      fields: [
        { id: 'mt_pdf', type: 'file', accept: '.pdf,application/pdf', label: 'رفع ملف المحاضرة PDF (اختياري):' },
        { id: 'mt_text', type: 'textarea', rows: 4, label: 'أو ألصق فقرة المحاضرة / الموضوع الطبي:', ph: 'ألصق الفقرة أو اكتب المفهوم الذي تريد شرحه بالفيديو والكتابة...' },
        [
          { id: 'mt_level', type: 'select', label: 'مستوى الشرح:', opts: [['مبسط', 'شرح مبسط'], ['جامعي', 'شرح جامعي أكاديمي'], ['متقدم', 'شرح متقدم'], ['سريري', 'شرح سريري تطبيقي']] },
          { id: 'mt_mode', type: 'select', label: 'نمط التدريس:', opts: [['video_and_text', 'فيديو تفاعلي + شرح كتابي + أسئلة'], ['clinical_focus', 'تركيز سريري وأمثلة واقعية']] }
        ]
      ]
    },
    {
      id: 'study_room', category: 'study', dept: 'STUDY', name: 'Collaborative Study Room', icon: 'fa-users-rectangle', badge: 'غرفة دراسة', custom: true,
      desc: 'غرفة مذاكرة جماعية متزامنة تضم مؤقت بومودورو مشترك، محادثة فورية، مشاركة ملفات، قائمة مشاركين حية، وصلاحيات Host / Editor / Viewer.',
      keywords: 'collaborative study room pomodoro chat files rbac غرفة دراسة جماعية بومودورو مشاركة ملفات',
      btn: ['fa-door-open', 'دخول / إنشاء غرفة الدراسة المشتركة'],
      fields: [
        [
          { id: 'csr_mode', type: 'select', label: 'الإجراء:', opts: [['create', 'إنشاء غرفة جديدة (Host)'], ['join', 'الانضمام لغرفة موجودة برمز']] },
          { id: 'csr_code', type: 'text', label: 'رمز الغرفة (يُنشأ تلقائياً إذا تُرك فارغاً):', ph: 'مثال: MED-STEP2-ROOM' },
          { id: 'csr_name', type: 'text', label: 'اسمك المعروض في الغرفة:', ph: 'مثال: د. أحمد' }
        ],
        [
          { id: 'csr_role', type: 'select', label: 'صلاحيتك في الغرفة (RBAC):', opts: [['host', 'Host (تحكم كامل بالمؤقت والدردشة والملفات)'], ['editor', 'Editor (مشاركة في الدردشة ورفع الملفات)'], ['viewer', 'Viewer (مشاهدة ومتابعة المؤقت فقط)']] },
          { id: 'csr_cycle', type: 'select', label: 'دورة بومودورو (تركيز / استراحة):', opts: [['25/5', '25 / 5 (بومودورو قياسي)'], ['50/10', '50 / 10 (جلسة سريرية معمقة)'], ['15/3', '15 / 3 (مراجعة سريعة)']] }
        ]
      ]
    },
    {
      id: 'audio_transcriber', category: 'study', dept: 'STUDY', name: 'Medical Audio Transcriber', icon: 'fa-file-audio', badge: 'تفريغ صوتي', custom: true,
      desc: 'رفع تسجيلات المحاضرات الصوتية (MP3, WAV, M4A) أو التسجيل الحي المباشر بمؤشر طيف صوتي لتفريغها بدقة في المصطلحات الطبية.',
      keywords: 'audio lecture transcriber mp3 wav record تفريغ صوتي تسجيل محاضرات صوت',
      btn: ['fa-waveform-lines', 'تفريغ الصوت واستخراج الملاحظات'],
      fields: [
        { id: 'at_file', type: 'file', accept: 'audio/*,.mp3,.wav,.m4a,.webm,.ogg', label: 'رفع ملف صوتي للمحاضرة (MP3, WAV, M4A, WEBM, OGG):' },
        [
          { id: 'at_spec', type: 'text', label: 'التخصص الطبي (لضبط المصطلحات):', ph: 'مثال: أمراض القلب، التشريح العصبي، الصيدلة' },
          { id: 'at_mode', type: 'select', label: 'نمط المعالجة والمخرجات:', opts: [['complete', 'حزمة كاملة (تفريغ حرفي + ملاحظات منظمة + نقاط امتحانية)'], ['verbatim', 'تفريغ نصي حرفي دقيق فقط (Verbatim)'], ['notes', 'ملاحظات المحاضرة المنظمة واللآلئ الامتحانية فقط']] }
        ]
      ]
    },
    {
      id: 'feynman_engine', category: 'study', dept: 'STUDY', name: 'FeynmanMed Engine', icon: 'fa-chalkboard-user', badge: 'تقييم فاينمان', custom: true,
      desc: 'محرك تقييم شرح الطالب بطريقة فاينمان: يكتشف الفجوات المفاهيمية والاتكاء على المصطلحات ويقترح تشبيهات مع تقييم معياري.',
      keywords: 'feynman engine rubric blind spots jargon تقييم فاينمان شرح الطالب فجوات الفهم',
      btn: ['fa-clipboard-check', 'تحليل شرحي وتقييم الفهم (Feynman Audit)'],
      fields: [
        { id: 'fme_concept', type: 'text', label: 'المفهوم الطبي المستهدف:', ph: 'مثال: قانون فرانك-ستارلينغ للقلب' },
        { id: 'fme_exp', type: 'textarea', rows: 5, label: 'اكتب شرحك للمفهوم بأسلوبك الخاص:', ph: 'اشرح كيف ولماذا تعمل هذه الآلية بكلماتك الخاصة...' },
        { id: 'fme_aud', type: 'select', label: 'معيار الجمهور المستهدف:', opts: [['طالب طب / زميل دراسة', 'طالب طب / زميل دراسة'], ['شخص غير مختص / مريض واعي', 'شخص غير مختص / مريض واعي'], ['مناقشة سريرية معمقة (Attending Level)', 'مناقشة سريرية معمقة']] }
      ]
    },

    /* --- MEMORY --- */
    {
      id: 'med_flash', category: 'memory', dept: 'MEMORY', name: 'MedFlash (SM-2 / FSRS)', icon: 'fa-clone', badge: 'بطاقات ذكية', custom: true,
      desc: 'نظام بطاقات استذكار طبية ثلاثية الأبعاد بخوارزمية SM-2 للتكرار المتباعد: توليد من PDF أو يدوياً، تصنيف حسب المادة، وحفظ التقدم.',
      keywords: 'medflash flashcards spaced repetition sm2 fsrs بطاقات استذكار تكرار متباعد',
      btn: ['fa-layer-group', 'فتح بطاقات MedFlash والمراجعة اليومية'],
      fields: [
        { id: 'mf_pdf', type: 'file', accept: '.pdf,application/pdf', label: 'رفع ملف محاضرة PDF لتوليد بطاقات (اختياري):' },
        [
          { id: 'mf_subject', type: 'text', label: 'اسم المادة / التصنيف:', ph: 'مثال: علم الأدوية / الباطنة' },
          { id: 'mf_count', type: 'number', label: 'عدد البطاقات الجديدة:', def: 6, min: 2, max: 20 }
        ],
        { id: 'mf_text', type: 'textarea', rows: 3, label: 'أو ألصق نصاً لتوليد بطاقات منه (اتركه فارغاً لمراجعة بطاقاتك المحفوظة):', ph: 'ألصق نصاً أو اتركه فارغاً لفتح بطاقاتك المحفوظة...' }
      ]
    },
    {
      id: 'mindmap_studio', category: 'memory', dept: 'MEMORY', name: 'MindMap Studio', icon: 'fa-sitemap', badge: 'خرائط ذهنية', custom: true,
      desc: 'لوحة خرائط ذهنية طبية تفاعلية قابلة للسحب والتكبير والطي وتلوين التصنيفات الطبية مع تصدير مباشر بصيغتي SVG وPNG.',
      keywords: 'mindmap studio tree diagram svg png خريطة ذهنية خرائط شجرة تفاعلية',
      btn: ['fa-sitemap', 'توليد الخريطة الذهنية التفاعلية'],
      fields: [
        { id: 'mm_topic', type: 'textarea', rows: 4, label: 'الموضوع الطبي أو نص المحاضرة:', ph: 'ألصق فقرات المحاضرة أو اكتب اسم المرض/المفهوم...' },
        [
          { id: 'mm_depth', type: 'select', label: 'عمق الشجرة المعرفية:', opts: [['3 مستويات متوازنة', '3 مستويات متوازنة'], ['4 مستويات تفصيلية عميقة', '4 مستويات تفصيلية عميقة']] },
          { id: 'mm_focus', type: 'select', label: 'زاوية التركيز:', opts: [['شامل (آلية + سريريات + تدبير)', 'شامل (آلية + سريريات + تدبير)'], ['تركيز تشخيصي وتفريقي', 'تركيز تشخيصي وتفريقي'], ['تركيز دوائي وفيزيولوجي', 'تركيز دوائي وفيزيولوجي']] }
        ]
      ]
    },

    /* --- EXAMS --- */
    {
      id: 'med_exam', category: 'exam', dept: 'EXAMS', name: 'MedExam System', icon: 'fa-file-circle-check', badge: 'منظومة امتحانات', custom: true,
      desc: 'نظام امتحانات طبية شامل من PDF أو موضوع (MCQ, صح/خطأ, حالات سريرية, توصيل, ملء فراغات) مع وضع امتحان حقيقي وتعليل الخيارات.',
      keywords: 'medexam pdf mcq true false clinical cases fill blanks امتحانات طبية',
      btn: ['fa-file-signature', 'توليد وبدء الامتحان الشامل'],
      fields: [
        { id: 'mex_pdf', type: 'file', accept: '.pdf,application/pdf', label: 'إنشاء امتحان من ملف PDF (اختياري):' },
        { id: 'mex_topic', type: 'textarea', rows: 3, label: 'أو اكتب الموضوع / ألصق نص المحاضرة:', ph: 'مثال: أمراض الكلى أو ألصق نصاً...' },
        [
          { id: 'mex_type', type: 'select', label: 'نوع الأسئلة:', opts: [['mixed', 'مزيج شامل (MCQ + حالات + صح/خطأ + فراغات)'], ['mcq', 'اختيار من متعدد (MCQ)'], ['clinical_case', 'حالات سريرية (Clinical Cases)'], ['true_false', 'صح أو خطأ (True / False)'], ['fill_blank', 'ملء الفراغات (Fill in the Blanks)']] },
          { id: 'mex_count', type: 'number', label: 'عدد الأسئلة (3 - 15):', def: 6, min: 3, max: 15 },
          { id: 'mex_diff', type: 'select', label: 'مستوى الصعوبة:', opts: [['medium', 'متوسط (جامعي)'], ['hard', 'صعب (USMLE / إقامة)'], ['easy', 'تمهيدي']] },
          { id: 'mex_timer', type: 'select', label: 'زمن السؤال:', opts: [['60', '60 ثانية / سؤال'], ['90', '90 ثانية / سؤال'], ['120', '120 ثانية / سؤال']] }
        ]
      ]
    },
    {
      id: 'timed_exam_arena', category: 'exam', dept: 'EXAMS', name: 'Timed Clinical Exam Arena', icon: 'fa-stopwatch-20', badge: 'امتحان موقّت', custom: true,
      desc: 'ميدان اختبارات سريرية موقّتة (مؤقت كلي أو لكل سؤال) مع وضع مراجعة التفسير العلمي ولوحة إحصاءات دقيقة للزمن ونقاط الضعف.',
      keywords: 'timed clinical exam arena timer usmle vignette امتحان موقت مؤقت سريري احصائيات',
      btn: ['fa-stopwatch', 'دخول ميدان الامتحان الموقّت'],
      fields: [
        { id: 'tea_topic', type: 'textarea', rows: 4, label: 'موضوع الامتحان أو نص المحاضرة:', ph: 'مثال: اضطرابات التوازن الحامضي القاعدي، أو ألصق نص محاضرة...' },
        [
          { id: 'tea_count', type: 'number', label: 'عدد الحالات السريرية (3 - 15):', def: 5, min: 3, max: 15 },
          { id: 'tea_tmode', type: 'select', label: 'نظام العد التنازلي:', opts: [['total', 'مؤقت للامتحان الكلي (Total Exam Timer)'], ['per_question', 'مؤقت صارم لكل سؤال (Per-Question Timer)']] },
          { id: 'tea_tsec', type: 'select', label: 'الزمن المخصص لكل سؤال:', opts: [['60', '60 ثانية لكل سؤال'], ['90', '90 ثانية لكل سؤال (إيقاع USMLE)'], ['45', '45 ثانية لكل سؤال (سريع)']] }
        ]
      ]
    },

    /* --- CLINICAL --- */
    {
      id: 'voice_patient', category: 'osce', dept: 'CLINICAL', name: 'MedPatient Clinical & Voice', icon: 'fa-microphone-lines', badge: 'محاكاة صوتية', custom: true,
      desc: 'محاكاة سريرية وصوتية متكاملة مع مريض افتراضي: أخذ القصة بالصوت أو الكتابة، طلب الفحوصات، وضع التشخيص التفريقي والخطة، وتقييم OSCE من 6 محاور.',
      keywords: 'voice patient simulation stt tts microphone osce مريض صوتي محاكاة صوتية ميكروفون',
      btn: ['fa-headset', 'بدء المقابلة السريرية والصوتية'],
      warn: 'يستخدم محرك MedVoiceEngine الذكي مع إيقاف الميكروفون تلقائياً أثناء نطق المريض لمنع الصدى.',
      fields: [
        { id: 'vp_complaint', type: 'text', label: 'الشكوى الرئيسية أو السيناريو السريري:', ph: 'مثال: ألم صدري عاصر يمتد للفك الأيسر منذ ساعة' },
        [
          { id: 'vp_tone', type: 'select', label: 'شخصية المريض ونبرته الشعورية:', opts: [['قلق ومتألم (واقعي)', 'قلق ومتألم (واقعي)'], ['هادئ ومتعاون', 'هادئ ومتعاون'], ['غامض الوصف ويحتاج أسئلة موجهة (صعب)', 'غامض الوصف (تحدي سريري)']] },
          { id: 'vp_vlang', type: 'select', label: 'لغة التعرف الصوتي والنطق:', opts: [['ar-SA', 'العربية (ar-SA)'], ['en-US', 'الإنجليزية (en-US)']] }
        ]
      ]
    },
    {
      id: 'diff_dx_trainer', category: 'osce', dept: 'CLINICAL', name: 'Differential Diagnosis Trainer', icon: 'fa-code-branch', badge: 'تشخيص تفريقي', custom: true,
      desc: 'مدرب التشخيص التفريقي المنهجي: تحليل الأعراض، تمثيل المشكلة، ترتيب الاحتمالات (Must-Not-Miss vs Common)، واقتراح الفحوصات المرجّحة.',
      keywords: 'differential diagnosis trainer ddx clinical reasoning تشخيص تفريقي',
      btn: ['fa-stethoscope', 'بناء مصفوفة التشخيص التفريقي'],
      fields: [
        { id: 'ddx_pres', type: 'textarea', rows: 4, label: 'قصة المريض والأعراض السريرية:', ph: 'العمر، الجنس، الشكوى الرئيسية، وتفاصيل القصة...' },
        [
          { id: 'ddx_vitals', type: 'text', label: 'العلامات الحيوية والفحص السريري:', ph: 'مثال: BP 90/60, HR 118, Temp 39.2...' },
          { id: 'ddx_stage', type: 'select', label: 'مرحلة التدريب:', opts: [['full', 'تحليل كامل + خطة فحوصات'], ['must_not_miss', 'التركيز على العلامات الخطيرة (Red Flags)']] }
        ]
      ]
    },

    /* --- MEDICAL LAB --- */
    {
      id: 'abg_analyzer', category: 'osce', dept: 'MEDICAL LAB', name: 'ABG Analyzer', icon: 'fa-lungs-virus', badge: 'محلل ABG', custom: true,
      desc: 'محلل غازات الدم الشرياني والشوارد بمعادلات JavaScript حتمية دقيقة: الاضطراب الأولي، معادلة Winter، المعاوضة الحادة/المزمنة، الفجوة الأنيونية المصححة، وDelta Ratio.',
      keywords: 'abg analyzer blood gas anion gap winters formula delta ratio غازات الدم',
      btn: ['fa-calculator', 'حساب وتحليل غازات الدم والفجوة الأنيونية'],
      fields: [
        [
          { id: 'abg_ph', type: 'text', label: 'قيمة pH (الطبيعي 7.35 - 7.45):', ph: 'مثال: 7.24' },
          { id: 'abg_paco2', type: 'text', label: 'قيمة PaCO2 mmHg (الطبيعي 35 - 45):', ph: 'مثال: 28' },
          { id: 'abg_hco3', type: 'text', label: 'قيمة HCO3- mEq/L (الطبيعي 22 - 26):', ph: 'مثال: 12' }
        ],
        [
          { id: 'abg_elec', type: 'text', label: 'الصوديوم والكلور (Na, Cl) لحساب الفجوة الأنيونية:', ph: 'مثال: 138, 102' },
          { id: 'abg_extra', type: 'text', label: 'الألبومين (g/dL) والحالة (acute / chronic):', ph: 'مثال: 4.0, acute' }
        ]
      ]
    },
    {
      id: 'ecg_tutor', category: 'osce', dept: 'MEDICAL LAB', name: 'ECG Tutor & Simulator', icon: 'fa-heart-pulse', badge: 'مدرب ECG', custom: true,
      desc: 'مدرب تفسير تخطيط القلب مع راسم موجات تفاعلي (Canvas Waveform) وحاسبات السرعة والمحور الكهربائي (Axis) وQTc (Bazett) وحالات تدريبية.',
      keywords: 'ecg ekg tutor waveform axis qtc stemi afib vtach تخطيط قلب',
      btn: ['fa-wave-square', 'رسم التخطيط وحساب المعالم والتفسير'],
      fields: [
        [
          { id: 'ecg_pattern', type: 'select', label: 'اختر نمط التخطيط:', opts: [['normal_sinus', 'Normal Sinus Rhythm (نظم جيبي طبيعي)'], ['stemi_ant', 'Anterior STEMI (احتشاء أمامي حاد)'], ['afib', 'Atrial Fibrillation (رجفان أذيني)'], ['aflutter', 'Atrial Flutter (رفرفة أذينية)'], ['vtach', 'Ventricular Tachycardia (تسرع بطيني)'], ['chb', 'Complete Heart Block 3° (إحصار تام)']] },
          { id: 'ecg_rate', type: 'text', label: 'السرعة (bpm) أو عدد المربعات الصغيرة لـ RR:', ph: 'مثال: 88' }
        ],
        [
          { id: 'ecg_axis', type: 'text', label: 'صافي QRS في Lead I و aVF (لحساب المحور):', ph: 'مثال: +6, +4' },
          { id: 'ecg_qt', type: 'text', label: 'مسافة QT بالمللي ثانية (ms) لحساب QTc:', ph: 'مثال: 380' },
          { id: 'ecg_ctx', type: 'text', label: 'السياق السريري (اختياري):', ph: 'مثال: مريض بألم صدري...' }
        ]
      ]
    },
    {
      id: 'lab_interpreter', category: 'osce', dept: 'MEDICAL LAB', name: 'Lab Panel Interpreter', icon: 'fa-vial-circle-check', badge: 'مفسر التحاليل', custom: true,
      desc: 'مفسر التحاليل المخبرية (CBC, LFT, RFT, Electrolytes, Thyroid, Coagulation) مع المجالات المرجعية وتنبيهات القيم الحرجة.',
      keywords: 'lab interpreter cbc lft rft electrolytes thyroid coagulation تحاليل مخبرية',
      btn: ['fa-flask-vial', 'مطابقة المجالات المرجعية وتفسير التحاليل'],
      fields: [
        [
          { id: 'lab_panel', type: 'select', label: 'لوحة التحاليل:', opts: [['CBC (تعداد الدم الكامل)', 'CBC — تعداد الدم الكامل'], ['LFT (وظائف الكبد)', 'LFT — وظائف الكبد'], ['RFT (وظائف الكلية)', 'RFT — وظائف الكلية'], ['Electrolytes (الشوارد)', 'Electrolytes — الشوارد'], ['Thyroid Function (الدرق)', 'Thyroid — وظائف الدرق'], ['Coagulation Profile (التخثر)', 'Coagulation — تخثر الدم']] },
          { id: 'lab_ctx', type: 'text', label: 'العمر / الجنس / السياق السريري:', ph: 'مثال: أنثى 32 سنة تعاني من وهن وشحوب' }
        ],
        { id: 'lab_values', type: 'textarea', rows: 4, label: 'أدخل قيم التحاليل المخبرية مع وحداتها:', ph: 'مثال: Hb 8.2 g/dL, MCV 68 fL, WBC 7.4, PLT 460...' }
      ]
    },
    {
      id: 'drug_checker', category: 'osce', dept: 'MEDICAL LAB', name: 'Drug Interaction Checker', icon: 'fa-pills', badge: 'تداخلات دوائية', custom: true,
      desc: 'فاحص التداخلات الدوائية الموثق: يجمع بين قواعد الإنذار الدوائي الحرجة والربط الحي مع نشرات OpenFDA الرسمية لتحديد درجة الخطورة والآلية.',
      keywords: 'drug interaction checker openfda pharmacology contraindicated تداخلات دوائية',
      btn: ['fa-shield-halved', 'فحص التداخلات الدوائية والتحقق من OpenFDA'],
      fields: [
        { id: 'dc_drugs', type: 'textarea', rows: 3, label: 'أسماء الأدوية بالإنجليزية (مفصولة بفاصلة):', ph: 'مثال: Warfarin, Amiodarone, Aspirin, Spironolactone' },
        { id: 'dc_status', type: 'text', label: 'حالة المريض (الكلية / الكبد / الحمل - اختياري):', ph: 'مثال: CKD Stage 3 (eGFR 42)' }
      ]
    },

    /* --- RESEARCH & ANATOMY --- */
    {
      id: 'research_lab', category: 'science', dept: 'RESEARCH', name: 'Research Lab & PubMed', icon: 'fa-microscope', badge: 'مختبر البحث', custom: true,
      desc: 'منظومة البحث العلمي الطبي: باني PICO، بحث PubMed حي وحقيقي (PMID وDOI فعليان)، تلخيص أوراق، تقييم نقدي، حاسبة إحصاء حيوي 2x2، ومنظم مراجع.',
      keywords: 'research lab pico pubmed critical appraisal biostatistics vancouver بحث علمي',
      btn: ['fa-magnifying-glass', 'تشغيل أداة البحث العلمي'],
      fields: [
        {
          id: 'rl_module', type: 'select', label: 'الأداة البحثية:',
          opts: [
            ['pubmed_search', 'بحث حي في PubMed (جلب PMID و DOI حقيقي)'],
            ['pico', 'باني PICO ومولد الأسئلة البحثية'],
            ['summarizer', 'ملخص الأوراق البحثية (IMRaD)'],
            ['abstract', 'مساعد كتابة الملخص (Structured Abstract)'],
            ['appraisal', 'التقييم النقدي للدراسات (Critical Appraisal)'],
            ['biostats', 'المساعد الإحصائي الحتمي (جدول 2x2: Sens/Spec/OR/RR/NNT)'],
            ['references', 'منظم المراجع (Vancouver / APA)']
          ]
        },
        { id: 'rl_text', type: 'textarea', rows: 4, label: 'سؤال البحث / كلمات PubMed (بالإنجليزية) / أو نص الورقة:', ph: 'مثال: SGLT2 inhibitors heart failure preserved ejection fraction' },
        { id: 'rl_stats', type: 'text', label: 'بيانات الإحصاء الحيوي (للجدول الرباعي TP, FP, FN, TN):', ph: 'مثال: 45, 15, 20, 80' }
      ]
    },
    {
      id: 'anatomy_3d_atlas', category: 'science', dept: 'RESEARCH', name: '3D Anatomy Studio & Atlas', icon: 'fa-cubes', badge: 'أطلس 3D', custom: true,
      desc: 'مكتبة وأطلس التشريح ثلاثي الأبعاد (3D): استعراض وتدوير مجسمات الأعضاء والعظام والأعصاب بـ 360° عبر Sketchfab 3D API ومحرك Three.js WebGL وعارض GLB/AR.',
      keywords: '3d anatomy atlas studio sketchfab threejs webgl glb bones muscles heart brain تشريح ثلاثي الابعاد مجسمات اطلس عظام عضلات',
      btn: ['fa-cube', 'فتح استوديو ومكتبة التشريح 3D'],
      fields: [
        [
          {
            id: 'a3d_preset', type: 'select', label: 'اختر الجهاز أو العضو التشريحي (3D Preset):',
            opts: [
              ['Human Heart Anatomy Valves Chambers', 'القلب والصمامات والأوعية الإكليلية (Heart 3D)'],
              ['Human Brain Anatomy Lobes Cranial', 'الدماغ والفصوص والأعصاب القحفية (Brain 3D)'],
              ['Human Skull Anatomy Bones Foramina', 'الجمجمة وعظام القحف والثقوب (Skull 3D)'],
              ['Human Skeleton Full Anatomy', 'الهيكل العظمي البشري الكامل (Full Skeleton 3D)'],
              ['Human Muscular System Ecorche', 'الجهاز العضلي السطحي والعميق (Muscular 3D)'],
              ['Lungs Bronchial Tree Respiratory', 'الرئتان والشجرة القصبية (Respiratory 3D)'],
              ['Digestive System Liver Stomach', 'الجهاز الهضمي والكبد والطرق الصفراوية (Digestive 3D)'],
              ['Kidney Anatomy Nephron Renal', 'الكلية والمقطع الكلوي والمسالك (Kidney 3D)'],
              ['Human Eye Anatomy Orbit', 'تشريح العين وعضلات الحجاج (Eye & Orbit 3D)'],
              ['Inner Ear Anatomy Cochlea', 'الأذن الوسطى والداخلية والحلزون (Ear 3D)']
            ]
          },
          {
            id: 'a3d_aimode', type: 'select', label: 'نمط الشرح التشريحي المرافق للمجسم:',
            opts: [
              ['شامل: المعالم الثلاثية الأبعاد + العلاقات + التعصيب والتروية', 'شامل (المعالم 3D + العلاقات + التروية والتعصيب)'],
              ['المنشأ والمرتكز والعمل العضلي (Origins & Insertions)', 'المنشأ والمرتكز والعمل الحركي'],
              ['المعالم الجراحية والسريرية عالية العائد (Surgical & Clinical)', 'المعالم الجراحية والأهمية السريرية'],
              ['اختبار عملي على معالم المجسم (3D Spotter Quiz)', 'اختبار عملي (Spotter Quiz)']
            ]
          }
        ],
        { id: 'a3d_search', type: 'text', label: 'أو ابحث مباشرةً عن أي تركيب تشريحي خاص بالإنجليزية (اختياري):', ph: 'مثال: Brachial plexus, Circle of Willis, Sphenoid bone...' }
      ]
    }
  ];

  const CUSTOM_RUNNERS = {
    anatomy_3d_atlas:  () => Anatomy3DStudio.run(),
    mindmap_studio:    () => MindMapStudio.run(),
    study_room:        () => CollaborativeStudyRoom.run(),
    voice_patient:     () => MedPatientVoice.run(),
    audio_transcriber: () => MedicalTranscriber.run(),
    timed_exam_arena:  () => TimedExamArena.run(),
    feynman_engine:    () => FeynmanEngine.run(),
    med_planner:       () => MedPlanner.run(),
    med_tutor:         () => MedTutor.run(),
    med_exam:          () => MedExam.run(),
    med_flash:         () => MedFlash.run(),
    abg_analyzer:      () => ABGAnalyzer.run(),
    ecg_tutor:         () => ECGTutor.run(),
    lab_interpreter:   () => LabInterpreter.run(),
    diff_dx_trainer:   () => DiffDxTrainer.run(),
    drug_checker:      () => DrugChecker.run(),
    med_progress:      () => MedProgress.run(),
    research_lab:      () => ResearchLab.run()
  };

  function cleanupAllExtensionModules() {
    Anatomy3DStudio.cleanup();
    CollaborativeStudyRoom.cleanup();
    MedPatientVoice.cleanup();
    MedicalTranscriber.cleanup();
    TimedExamArena.cleanup();
    MedTutor.cleanup();
    MedExam.cleanup();
  }

  function injectDepartmentFilterBar() {
    const grid = $('toolsGrid') || document.querySelector('.tools-grid');
    if (!grid || $('mnDeptFilterBar')) return;
    const depts = [
      { id: 'ALL', label: LANG === 'en' ? 'All Sections' : 'كل الأقسام' },
      { id: 'STUDY', label: 'STUDY' },
      { id: 'MEMORY', label: 'MEMORY' },
      { id: 'CLINICAL', label: 'CLINICAL' },
      { id: 'MEDICAL LAB', label: 'MEDICAL LAB' },
      { id: 'EXAMS', label: 'EXAMS' },
      { id: 'RESEARCH', label: 'RESEARCH' },
      { id: 'PRODUCTIVITY', label: 'PRODUCTIVITY' }
    ];
    const bar = document.createElement('div');
    bar.id = 'mnDeptFilterBar';
    bar.className = 'mn-dept-filter-bar';
    bar.innerHTML = `<span style="font-size:12px;font-weight:800;color:var(--petrol);margin-inline-end:4px;"><i class="fa-solid fa-layer-group"></i></span>` +
      depts.map(d => `<button type="button" class="mn-dept-chip ${d.id === 'ALL' ? 'active' : ''}" data-dept="${d.id}">${d.label}</button>`).join('');
    grid.parentElement.insertBefore(bar, grid);

    bar.querySelectorAll('.mn-dept-chip').forEach(btn => {
      btn.onclick = () => {
        bar.querySelectorAll('.mn-dept-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const dept = btn.getAttribute('data-dept');
        if (dept === 'ALL') {
          if (typeof filterTools === 'function') filterTools();
          return;
        }
        const matchingIds = new Set(EXT_TOOL_DEFINITIONS.filter(t => t.dept === dept).map(t => t.id));
        grid.querySelectorAll('[data-tool-id], .tool-card').forEach(card => {
          const tid = card.getAttribute('data-tool-id') || (card.getAttribute('onclick') || '').match(/openToolWorkspace\(['"]([^'"]+)['"]\)/)?.[1];
          if (tid) card.style.display = matchingIds.has(tid) ? '' : 'none';
        });
      };
    });
  }

  function installExtensionHooks() {
    if (typeof TOOLS === 'undefined' || !Array.isArray(TOOLS)) return;

    EXT_TOOL_DEFINITIONS.forEach(t => {
      const idx = TOOLS.findIndex(existing => existing.id === t.id);
      if (idx === -1) TOOLS.push(t);
      else TOOLS[idx] = t;
    });

    const origOpenToolWorkspace = window.openToolWorkspace;
    if (typeof origOpenToolWorkspace === 'function') {
      window.openToolWorkspace = function (toolId) {
        cleanupAllExtensionModules();
        origOpenToolWorkspace.apply(this, arguments);
        if (CUSTOM_RUNNERS[toolId]) {
          const primaryBtn = $('primaryActionBtn');
          if (primaryBtn) {
            primaryBtn.removeAttribute('onclick');
            primaryBtn.onclick = () => CUSTOM_RUNNERS[toolId]();
          }
          if (toolId === 'audio_transcriber') MedicalTranscriber.injectRecorderWidget();
          if (toolId === 'med_progress') MedProgress.run();
          if (toolId === 'med_planner') {
            const existing = MedPlanner.loadData();
            if (existing.tasks && existing.tasks.length) MedPlanner.renderDashboard();
          }
          if (toolId === 'med_flash') {
            const cards = MedFlash.loadCards();
            if (cards && cards.length) {
              MedFlash.buildQueue();
              MedFlash.renderUI();
            }
          }
        }
      };
    }

    const origDoCloseWorkspace = window.doCloseWorkspace;
    if (typeof origDoCloseWorkspace === 'function') {
      window.doCloseWorkspace = function () {
        cleanupAllExtensionModules();
        return origDoCloseWorkspace.apply(this, arguments);
      };
    }

    const origResetCurrentTool = window.resetCurrentTool;
    if (typeof origResetCurrentTool === 'function') {
      window.resetCurrentTool = function () {
        cleanupAllExtensionModules();
        return origResetCurrentTool.apply(this, arguments);
      };
    }

    if (typeof filterTools === 'function') filterTools();
    const ap = $('allPill');
    if (ap) ap.textContent = (LANG === 'en' ? 'All tools (' : 'جميع الأدوات (') + TOOLS.length + ')';
    injectDepartmentFilterBar();

    // الدخول التلقائي الفوري لغرفة الدراسة عبر رابط الدعوة (?room=XXXX) أو بعد تسجيل الدخول
    const urlParams = new URLSearchParams(window.location.search);
    const invitedRoom = urlParams.get('room') || sessionStorage.getItem('mednerd_pending_room');
    if (invitedRoom) {
      sessionStorage.removeItem('mednerd_pending_room');
      if ($('welcomeModal')) $('welcomeModal').style.display = 'none';
      if (typeof openToolWorkspace === 'function') {
        openToolWorkspace('study_room');
        setTimeout(() => {
          if ($('csr_mode')) $('csr_mode').value = 'join';
          if ($('csr_code')) $('csr_code').value = invitedRoom.toUpperCase();
          if ($('csr_role')) $('csr_role').value = 'editor';
          CollaborativeStudyRoom.run();
        }, 150);
      }
    }
  }

  window.MEDNERD_EXT = {
    MedDependencyLoader,
    MedStorage,
    MedVoiceEngine,
    Anatomy3DStudio,
    MindMapStudio,
    CollaborativeStudyRoom,
    MedPatientVoice,
    MedicalTranscriber,
    TimedExamArena,
    FeynmanEngine,
    MedPlanner,
    MedTutor,
    MedExam,
    MedFlash,
    ABGAnalyzer,
    ECGTutor,
    LabInterpreter,
    DiffDxTrainer,
    DrugChecker,
    MedProgress,
    ResearchLab
  };

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', installExtensionHooks);
  } else {
    installExtensionHooks();
  }
})();
