(function () {
  'use strict';
  if (window.MEDNERD_EXT_LOADED) return;
  window.MEDNERD_EXT_LOADED = true;

  /* ==========================================================================
     0. حقن التنسيقات (CSS) تلقائياً في الصفحة
     ========================================================================== */
  const styleEl = document.createElement('style');
  styleEl.id = 'mednerd-extension-styles';
  styleEl.textContent = `
    .mn-ext-badge-bar { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 16px; padding: 10px 14px; background: var(--bg-elevated); border: 1px solid var(--border-color); border-radius: 12px; font-size: 13px; }
    .mn-ext-pill { padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 12px; background: var(--petrol-soft); color: var(--petrol); border: 1px solid var(--border-color); }
    .mn-ext-pill.green { background: var(--dark-green-soft); color: var(--dark-green); }
    .mn-ext-pill.mustard { background: var(--mustard-soft); color: var(--mustard); }
    .mn-ext-pill.danger { background: var(--danger-soft); color: var(--danger); }

    /* 1. MindMap Studio */
    .mm-viewport { position: relative; width: 100%; height: 540px; background: radial-gradient(circle, var(--border-color) 1px, transparent 1px); background-size: 22px 22px; background-color: var(--bg-main); border: 1px solid var(--border-color); border-radius: 16px; overflow: hidden; cursor: grab; user-select: none; margin-top: 16px; }
    .mm-viewport:active { cursor: grabbing; }
    .mm-floating-Controls { position: absolute; top: 12px; inset-inline-end: 12px; z-index: 10; display: flex; gap: 6px; flex-wrap: wrap; background: var(--white); padding: 6px; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); }
    .mm-legend { position: absolute; bottom: 12px; inset-inline-start: 12px; z-index: 10; display: flex; gap: 8px; flex-wrap: wrap; background: var(--white); padding: 6px 12px; border-radius: 10px; border: 1px solid var(--border-color); font-size: 12px; font-weight: 700; }
    .mm-legend-item { display: inline-flex; align-items: center; gap: 5px; }
    .mm-legend-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }

  /* ==========================================================================
     MODULE 2: COLLABORATIVE STUDY ROOM (UPGRADED: INVITE LINKS + CROSS-DEVICE P2P SYNC)
     ========================================================================== */
  const CollaborativeStudyRoom = {
    state: {
      channel: null,
      peer: null,
      connections: [],
      isHostPeer: false,
      roomCode: '',
      userName: '',
      role: 'host',
      focusSec: 1500,
      breakSec: 300,
      phase: 'FOCUS',
      remainingSec: 1500,
      running: false,
      intervalId: null,
      messages: [],
      files: [],
      peersCount: 1
    },

    permissions() {
      const r = this.state.role;
      return {
        canControlTimer: r === 'host',
        canChat: r === 'host' || r === 'editor',
        canUpload: r === 'host' || r === 'editor',
        canDeleteFile: r === 'host',
        canAskAiCoPilot: r === 'host' || r === 'editor'
      };
    },

    cleanup() {
      if (this.state.intervalId) { clearInterval(this.state.intervalId); this.state.intervalId = null; }
      if (this.state.channel) { try { this.state.channel.close(); } catch (_) {} this.state.channel = null; }
      if (this.state.peer) { try { this.state.peer.destroy(); } catch (_) {} this.state.peer = null; }
      this.state.connections = [];
    },

    ensurePeerJS() {
      if (window.Peer) return Promise.resolve();
      return new Promise((resolve) => {
        const sc = document.createElement('script');
        sc.src = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';
        sc.onload = () => resolve();
        sc.onerror = () => resolve(); // يستمر بالعمل محلياً إذا تعذر تحميل المكتبة
        document.head.appendChild(sc);
      });
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
        btnEl.innerHTML = `<i class="fa-solid fa-check"></i> ${LANG === 'en' ? 'Link Copied!' : 'تم نسخ رابط الغرفة!'}`;
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

    async run() {
      this.cleanup();
      const codeRaw = (($('csr_code') && $('csr_code').value.trim()) || 'MED-ROOM-' + Math.floor(1000 + Math.random() * 9000));
      const code = codeRaw.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
      if ($('csr_code')) $('csr_code').value = code;

      const p = typeof getProfile === 'function' ? getProfile() : null;
      const name = (($('csr_name') && $('csr_name').value.trim()) || (p && p.name) || (LANG === 'en' ? 'Med Student' : 'طالب طب'));
      const roleVal = ($('csr_role') && $('csr_role').value) || 'host';
      const cycleVal = ($('csr_cycle') && $('csr_cycle').value) || '25/5';
      const [fMin, bMin] = cycleVal.split('/').map(n => parseInt(n, 10) || 25);

      this.state.roomCode = code;
      this.state.userName = name;
      this.state.role = roleVal;
      this.state.focusSec = fMin * 60;
      this.state.breakSec = bMin * 60;
      this.state.phase = 'FOCUS';
      this.state.remainingSec = this.state.focusSec;
      this.state.running = false;
      this.state.peersCount = 1;

      const savedRoom = this.loadRoomStorage(code);
      this.state.messages = savedRoom.messages || [];
      this.state.files = savedRoom.files || [];

      if (typeof BroadcastChannel !== 'undefined') {
        this.state.channel = new BroadcastChannel('mednerd_csr_' + code);
        this.state.channel.onmessage = ev => this.handleIncomingPacket(ev.data, null);
      }

      this.renderRoomUI();
      await this.initPeerNetwork(code);
    },

    async initPeerNetwork(code) {
      await this.ensurePeerJS();
      if (!window.Peer) return;
      const hostPeerId = 'mednerd-room-v2-' + code.toLowerCase();

      const peer = new Peer(hostPeerId);
      this.state.peer = peer;

      peer.on('open', () => {
        this.state.isHostPeer = true;
        this.updateNetStatus(LANG === 'en' ? 'Online Room Ready' : 'الغرفة متصلة وجاهزة لاستقبال الزملاء');
      });

      peer.on('connection', conn => {
        this.registerConn(conn);
      });

      peer.on('error', err => {
        if (err && err.type === 'unavailable-id') {
          // الغرفة منشأة مسبقاً من زميل آخر -> ندخل كعضو متصل بالمضيف
          const guestPeer = new Peer();
          this.state.peer = guestPeer;
          this.state.isHostPeer = false;
          guestPeer.on('open', () => {
            const conn = guestPeer.connect(hostPeerId, { reliable: true });
            this.registerConn(conn);
          });
        }
      });
    },

    registerConn(conn) {
      conn.on('open', () => {
        if (!this.state.connections.includes(conn)) this.state.connections.push(conn);
        this.state.peersCount = this.state.connections.length + 1;
        this.updateNetStatus(
          LANG === 'en'
            ? `Connected (${this.state.peersCount} in room)`
            : `متصل الآن (${this.state.peersCount} طلاب في الغرفة)`
        );
        // إذا كنا المضيف، نرسل الحالة الكاملة للزميل الجديد فور دخوله
        if (this.state.isHostPeer) {
          conn.send({
            type: 'FULL_SYNC',
            phase: this.state.phase,
            remainingSec: this.state.remainingSec,
            running: this.state.running,
            messages: this.state.messages,
            files: this.state.files,
            peersCount: this.state.peersCount
          });
        }
      });

      conn.on('data', data => {
        this.handleIncomingPacket(data, conn);
      });

      conn.on('close', () => {
        this.state.connections = this.state.connections.filter(c => c !== conn);
        this.state.peersCount = Math.max(1, this.state.connections.length + 1);
        this.updateNetStatus(
          LANG === 'en'
            ? `Online (${this.state.peersCount} in room)`
            : `متصل (${this.state.peersCount} في الغرفة)`
        );
      });
    },

    updateNetStatus(txt) {
      const el = $('csrNetBadge');
      if (el) el.innerHTML = `<i class="fa-solid fa-wifi"></i> ${escapeHtml(txt)}`;
    },

    loadRoomStorage(code) {
      try { return JSON.parse(sessionStorage.getItem('mednerd_csr_data_' + code) || '{}'); } catch (_) { return {}; }
    },

    saveRoomStorage() {
      try {
        sessionStorage.setItem('mednerd_csr_data_' + this.state.roomCode, JSON.stringify({
          messages: this.state.messages.slice(-50),
          files: this.state.files.slice(-15)
        }));
      } catch (_) {}
    },

    broadcast(payload, excludeConn = null) {
      if (this.state.channel) { try { this.state.channel.postMessage(payload); } catch (_) {} }
      this.state.connections.forEach(conn => {
        if (conn !== excludeConn && conn.open) {
          try { conn.send(payload); } catch (_) {}
        }
      });
    },

    handleIncomingPacket(msg, senderConn) {
      if (!msg || typeof msg !== 'object') return;
      // إذا كنا الـ Host الرئيسي، نعيد بث الرسالة لبقية الزملاء المتصلين
      if (this.state.isHostPeer && senderConn) {
        this.broadcast(msg, senderConn);
      }

      if (msg.type === 'FULL_SYNC') {
        this.state.phase = msg.phase;
        this.state.remainingSec = msg.remainingSec;
        this.state.running = msg.running;
        this.state.messages = msg.messages || [];
        this.state.files = msg.files || [];
        this.saveRoomStorage();
        this.syncIntervalLoop();
        this.updateTimerDOM();
        this.renderChatList();
        this.renderFileList();
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
      this.renderRoomUI();
    },

    sendChatMessage() {
      if (!this.permissions().canChat) return;
      const inp = $('csrChatInput');
      if (!inp) return;
      const txt = inp.value.trim();
      if (!txt) return;
      inp.value = '';
      const entry = { id: 'm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5), user: this.state.userName, role: this.state.role, text: txt, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
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

      const userEntry = { id: 'm_' + Date.now(), user: this.state.userName + ' (@AI)', role: this.state.role, text: question, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      this.state.messages.push(userEntry);
      this.renderChatList();
      this.broadcast({ type: 'CHAT_MSG', entry: userEntry });

      const aiBtn = $('csrAskAiBtn');
      if (aiBtn) aiBtn.disabled = true;

      try {
        const sharedContext = this.state.files.filter(f => f.textPreview).map(f => `[File: ${f.name}]\n${f.textPreview.slice(0, 1800)}`).join('\n\n');
        const reply = await callGeminiAPI({
          systemInstruction: 'أنت مساعد دراسة طبي تعاوني داخل غرفة مذاكرة. أجب بإيجاز ودقة علمية عالية.' + SAFE_RULES,
          contents: [{ role: 'user', parts: [{ text: (sharedContext ? `ملفات الغرفة:\n${sharedContext}\n\n` : '') + `سؤال الطالب: ${question}` }] }]
        });
        const aiEntry = { id: 'm_' + Date.now() + '_ai', user: 'MEDNERD AI Co-Pilot', role: 'ai', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
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
        if (file.size > 8 * 1024 * 1024) continue;
        let textPreview = '';
        if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
          try { textPreview = await file.text(); } catch (_) {}
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
        box.innerHTML = `<p style="color:var(--muted-text);text-align:center;font-size:13px;margin:auto;">${LANG === 'en' ? 'No messages yet. Share the invite link above so your peers can join!' : 'لا توجد رسائل بعد. انسخ رابط الدعوة في الأعلى وأرسله لزملائك ليدخلوا الغرفة!'}</p>`;
        return;
      }
      box.innerHTML = this.state.messages.map(m => `
        <div class="chat-bubble ${m.user === this.state.userName ? 'user' : 'patient'}" style="max-width:92%;">
          <div style="display:flex;justify-content:space-between;gap:10px;font-size:11.5px;font-weight:800;margin-bottom:4px;opacity:0.85;">
            <span>${escapeHtml(m.user)} [${escapeHtml(String(m.role).toUpperCase())}]</span>
            <span>${escapeHtml(m.time || '')}</span>
          </div>
          <div data-notr="1">${m.role === 'ai' ? renderSafeMarkdown(m.text) : escapeHtml(m.text)}</div>
        </div>
      `).join('');
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
          <!-- شريط مشاركة الغرفة ودعوة الزملاء -->
          <div style="background:var(--petrol-soft);border:1.5px solid var(--petrol);border-radius:14px;padding:14px 16px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
            <div style="flex:1;min-width:220px;">
              <div style="font-weight:800;color:var(--petrol);font-size:14.5px;margin-bottom:4px;">
                <i class="fa-solid fa-share-nodes"></i> ${isEn ? 'Invite Peers to Join This Room' : 'مشاركة الغرفة ودعوة الزملاء للدخول الفوري'}
              </div>
              <input type="text" class="form-input" value="${escapeHtml(inviteUrl)}" readonly dir="ltr" onclick="this.select()" style="font-size:12.5px;padding:6px 10px;background:var(--white);font-family:monospace;">
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
              <button type="button" class="btn-primary" style="padding:9px 14px;font-size:13px;" onclick="window.MEDNERD_EXT.CollaborativeStudyRoom.copyInviteLink(this)">
                <i class="fa-solid fa-link"></i> ${isEn ? 'Copy Invite Link' : 'نسخ رابط الدعوة'}
              </button>
              <button type="button" class="btn-secondary" style="padding:9px 12px;font-size:13px;" onclick="window.MEDNERD_EXT.CollaborativeStudyRoom.copyRoomCodeOnly(this)">
                <i class="fa-solid fa-hashtag"></i> ${isEn ? 'Copy Code' : 'نسخ الرمز'}
              </button>
              <button type="button" class="btn-telegram" style="padding:9px 12px;font-size:13px;" onclick="window.MEDNERD_EXT.CollaborativeStudyRoom.shareViaTelegram()" title="Telegram">
                <i class="fa-brands fa-telegram"></i> Telegram
              </button>
              <button type="button" class="btn-primary" style="padding:9px 12px;font-size:13px;background:#25D366;" onclick="window.MEDNERD_EXT.CollaborativeStudyRoom.shareViaWhatsApp()" title="WhatsApp">
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
              <small style="color:var(--muted-text);font-weight:700;">${isEn ? 'RBAC Role:' : 'تبديل الصلاحية:'}</small>
              <select class="form-select" style="width:auto;padding:4px 8px;font-size:12px;" onchange="window.MEDNERD_EXT.CollaborativeStudyRoom.changeRoleLive(this.value)">
                <option value="host" ${this.state.role === 'host' ? 'selected' : ''}>Host</option>
                <option value="editor" ${this.state.role === 'editor' ? 'selected' : ''}>Editor</option>
                <option value="viewer" ${this.state.role === 'viewer' ? 'selected' : ''}>Viewer</option>
              </select>
            </div>
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
                <h4 style="margin:0;"><i class="fa-solid fa-folder-open"></i> ${isEn ? 'File Sharing Hub' : 'مركز مشاركة الملفات'}</h4>
                <div id="csrDropzone" class="csr-dropzone ${!perm.canUpload ? 'disabled' : ''}">
                  <i class="fa-solid fa-cloud-arrow-up" style="font-size:24px;margin-bottom:6px;display:block;"></i>
                  ${perm.canUpload ? (isEn ? 'Drag & drop files or click to browse' : 'اسحب وأفلت ملفات الدراسة هنا أو اضغط للاختيار') : (isEn ? 'Viewer Role: Uploads disabled' : 'صلاحية مشاهد: الرفع غير متاح')}
                  <input type="file" id="csrHiddenFileInput" style="display:none;" multiple ${!perm.canUpload ? 'disabled' : ''}>
                </div>
                <div id="csrFileList" style="display:flex;flex-direction:column;gap:8px;max-height:190px;overflow-y:auto;"></div>
              </div>
            </div>

            <div class="csr-panel">
              <h4 style="margin:0;"><i class="fa-solid fa-comments"></i> ${isEn ? 'Real-Time Room Chat' : 'المحادثة الفورية للغرفة'}</h4>
              <div id="csrChatLog" class="chat-container" style="height:310px;margin-bottom:6px;"></div>
              <div style="display:flex;gap:8px;">
                <input type="text" id="csrChatInput" class="form-input" ${!perm.canChat ? 'disabled' : ''} placeholder="${perm.canChat ? (isEn ? 'Type message or question...' : 'اكتب رسالة أو سؤالاً طبياً...') : (isEn ? 'Read-only' : 'للقراءة فقط')}">
                <button type="button" class="btn-primary" style="padding:10px 16px;" ${!perm.canChat ? 'disabled' : ''} onclick="window.MEDNERD_EXT.CollaborativeStudyRoom.sendChatMessage()"><i class="fa-solid fa-paper-plane"></i></button>
                <button type="button" id="csrAskAiBtn" class="btn-secondary" ${!perm.canAskAiCoPilot ? 'disabled' : ''} onclick="window.MEDNERD_EXT.CollaborativeStudyRoom.askRoomAI()"><i class="fa-solid fa-robot"></i> AI</button>
              </div>
            </div>
          </div>
        </div>`;

      this.updateTimerDOM();
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
    /* 3. Voice Patient Simulation */
    .vp-orb-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 22px; background: var(--bg-elevated); border-radius: 16px; border: 1px solid var(--border-color); margin-bottom: 16px; }
    .vp-mic-btn { width: 82px; height: 82px; border-radius: 50%; border: none; background: var(--petrol); color: #fff; font-size: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 25px rgba(14,116,144,.35); transition: all .25s; }
    .vp-mic-btn.listening { background: var(--danger); animation: vpPulse 1.2s infinite; }
    .vp-mic-btn.speaking { background: var(--dark-green); animation: vpPulse 1.5s infinite; }
    @keyframes vpPulse { 0% { box-shadow: 0 0 0 0 rgba(220,38,38,.55); transform: scale(1); } 70% { box-shadow: 0 0 0 20px rgba(220,38,38,0); transform: scale(1.06); } 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0); transform: scale(1); } }

    /* 4. Audio Transcriber */
    .at-recorder-box { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 16px; background: var(--bg-elevated); border: 1px solid var(--border-color); border-radius: 14px; margin-bottom: 16px; }
    .at-rec-dot { width: 12px; height: 12px; border-radius: 50%; background: var(--muted-text); display: inline-block; }
    .at-rec-dot.active { background: var(--danger); animation: pulseDot 1s infinite; }

    /* 5. Timed Clinical Exam Arena */
    .tea-topbar { position: sticky; top: 0; z-index: 20; background: var(--white); border: 1px solid var(--border-color); border-radius: 14px; padding: 12px 18px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; box-shadow: var(--shadow-sm); }
    .tea-option { display: flex; align-items: flex-start; gap: 12px; padding: 13px 16px; border: 1.5px solid var(--border-color); border-radius: 12px; background: var(--white); cursor: pointer; transition: all .15s; margin-bottom: 10px; text-align: start; width: 100%; font-size: 15px; color: var(--dark-text); }
    .tea-option:hover { border-color: var(--petrol); background: var(--petrol-soft); }
    .tea-option.selected { border-color: var(--petrol); background: var(--petrol-soft); font-weight: 700; }
    .tea-option.correct { border-color: var(--dark-green); background: var(--dark-green-soft); }
    .tea-option.wrong { border-color: var(--danger); background: var(--danger-soft); }
    .tea-kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin: 16px 0; }
    .tea-kpi-card { background: var(--white); border: 1px solid var(--border-color); border-radius: 14px; padding: 16px; text-align: center; }
    .tea-kpi-val { font-size: 26px; font-weight: 800; color: var(--petrol); }
    .tea-bar-track { width: 100%; height: 10px; background: var(--bg-elevated); border-radius: 8px; overflow: hidden; margin-top: 6px; }
    .tea-bar-fill { height: 100%; background: var(--petrol); border-radius: 8px; transition: width .4s; }

    /* 6. FeynmanMed Engine */
    .fme-rubric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 18px; }
    .fme-score-card { background: var(--white); border: 1px solid var(--border-color); border-radius: 14px; padding: 16px; text-align: center; }
    .fme-ring { font-size: 30px; font-weight: 800; color: var(--petrol); margin: 6px 0; }
  `;
  document.head.appendChild(styleEl);

  /* ==========================================================================
     1. القواميس والترجمة والأدوات المساعدة
     ========================================================================== */
  const EXT_EN_EXACT = {
    "خرائط ذهنية": "Mind Maps",
    "غرفة دراسة": "Study Room",
    "محاكاة صوتية": "Voice Sim",
    "تفريغ صوتي": "Transcriber",
    "امتحان موقّت": "Timed Arena",
    "تقييم فاينمان": "Feynman Eval"
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
      "d": "Synchronized multi-user Pomodoro study room with real-time chat, drag-and-drop file sharing hub, and Role-Based Access Control (Host, Editor, Viewer).",
      "l": ["Room Code (share with peers):", "Your Display Name:", "Your Role (RBAC Permission):", "Pomodoro Focus / Break (minutes):"],
      "p": ["e.g., MED-STEP2-ROOM", "e.g., Dr. Ahmad"],
      "o": {
        "role": ["Host (Full Timer, Chat & File Control)", "Editor (Chat & Upload Files)", "Viewer (Read-Only & Sync Timer)"],
        "cycle": ["25 / 5 (Classic Pomodoro)", "50 / 10 (Deep Clinical Block)", "15 / 3 (Rapid Sprint)"]
      },
      "b": "Launch / Join Collaborative Room"
    },
    "voice_patient": {
      "d": "Bidirectional real-time voice simulation (Mic STT -> Patient LLM -> TTS) for clinical history taking, followed by an objective clinical feedback report.",
      "l": ["Chief Complaint or Clinical Scenario:", "Patient Persona & Emotional Tone:", "Voice Recognition / TTS Language:"],
      "p": ["e.g., 58-year-old with crushing retrosternal chest pain radiating to left jaw"],
      "o": {
        "tone": ["Anxious & In Pain (Realistic)", "Calm & Cooperative", "Vague / Poor Historian (Challenging)"],
        "vlang": ["Arabic (ar-SA)", "English (en-US)"]
      },
      "w": "Uses browser Web Speech API (Microphone & Speaker). Educational simulation only.",
      "b": "Initialize Voice Encounter"
    },
    "audio_transcriber": {
      "d": "Upload lecture audio (MP3, WAV, M4A) or record live via microphone for medical-grade transcription, structured notes, and exam pearls.",
      "l": ["Upload Audio File (MP3, WAV, M4A, WEBM, OGG):", "Medical Specialty Context (improves nomenclature accuracy):", "Post-Processing Output Mode:"],
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
      "l": ["Target Medical Concept:", "Your Explanation (write in your own words as if teaching a peer):", "Target Audience Benchmark:"],
      "p": ["e.g., Frank-Starling Mechanism or Renin-Angiotensin-Aldosterone System", "Explain how and why it works in your own words..."],
      "o": {
        "aud": ["Junior Medical Student / Peer", "Intelligent Layperson / Patient", "Clinical Attending (Mechanism Deep-Dive)"]
      },
      "ld": "Auditing explanation for blind spots & jargon...",
      "v": "Please enter both the medical concept and your explanation.",
      "b": "Analyze My Explanation (Feynman Audit)"
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
      core:        { bg: '#0e7490', border: '#0b5c73', text: '#ffffff', labelAr: 'مفهوم رئيسي', labelEn: 'Core' },
      patho:       { bg: '#fef3c7', border: '#d97706', text: '#78350f', labelAr: 'آلية مرضية', labelEn: 'Pathophysiology' },
      clinical:    { bg: '#dcfce7', border: '#15803d', text: '#14532d', labelAr: 'سريري/أعراض', labelEn: 'Clinical' },
      diagnosis:   { bg: '#e0e7ff', border: '#4338ca', text: '#1e1b4b', labelAr: 'تشخيص', labelEn: 'Diagnosis' },
      pharma:      { bg: '#fce7f3', border: '#be185d', text: '#831843', labelAr: 'علاج/أدوية', labelEn: 'Pharmacology/Tx' },
      redflag:     { bg: '#fee2e2', border: '#dc2626', text: '#7f1d1d', labelAr: 'علامة خطر', labelEn: 'Red Flag' }
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
     MODULE 2: COLLABORATIVE STUDY ROOM
     ========================================================================== */
  const CollaborativeStudyRoom = {
    state: { channel: null, roomCode: '', userName: '', role: 'host', focusSec: 1500, breakSec: 300, phase: 'FOCUS', remainingSec: 1500, running: false, intervalId: null, messages: [], files: [] },

    permissions() {
      const r = this.state.role;
      return {
        canControlTimer: r === 'host',
        canChat: r === 'host' || r === 'editor',
        canUpload: r === 'host' || r === 'editor',
        canDeleteFile: r === 'host',
        canAskAiCoPilot: r === 'host' || r === 'editor'
      };
    },

    cleanup() {
      if (this.state.intervalId) { clearInterval(this.state.intervalId); this.state.intervalId = null; }
      if (this.state.channel) { try { this.state.channel.close(); } catch (_) {} this.state.channel = null; }
    },

    run() {
      this.cleanup();
      const code = (($('csr_code') && $('csr_code').value.trim()) || 'MEDNERD-ROOM-1').toUpperCase();
      const p = typeof getProfile === 'function' ? getProfile() : null;
      const name = (($('csr_name') && $('csr_name').value.trim()) || (p && p.name) || (LANG === 'en' ? 'Med Student' : 'طالب طب'));
      const roleVal = ($('csr_role') && $('csr_role').value) || 'host';
      const cycleVal = ($('csr_cycle') && $('csr_cycle').value) || '25/5';
      const [fMin, bMin] = cycleVal.split('/').map(n => parseInt(n, 10) || 25);

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

      if (typeof BroadcastChannel !== 'undefined') {
        this.state.channel = new BroadcastChannel('mednerd_csr_' + code);
        this.state.channel.onmessage = ev => this.handleBroadcast(ev.data);
      }

      this.renderRoomUI();
    },

    loadRoomStorage(code) {
      try { return JSON.parse(sessionStorage.getItem('mednerd_csr_data_' + code) || '{}'); } catch (_) { return {}; }
    },

    saveRoomStorage() {
      try {
        sessionStorage.setItem('mednerd_csr_data_' + this.state.roomCode, JSON.stringify({
          messages: this.state.messages.slice(-50),
          files: this.state.files.slice(-15)
        }));
      } catch (_) {}
    },

    broadcast(payload) {
      if (this.state.channel) { try { this.state.channel.postMessage(payload); } catch (_) {} }
    },

    handleBroadcast(msg) {
      if (!msg || typeof msg !== 'object') return;
      if (msg.type === 'TIMER_SYNC') {
        this.state.phase = msg.phase;
        this.state.remainingSec = msg.remainingSec;
        this.state.running = msg.running;
        this.syncIntervalLoop();
        this.updateTimerDOM();
      } else if (msg.type === 'CHAT_MSG') {
        this.state.messages.push(msg.entry);
        this.saveRoomStorage();
        this.renderChatList();
      } else if (msg.type === 'FILE_ADD') {
        this.state.files.push(msg.file);
        this.saveRoomStorage();
        this.renderFileList();
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
      this.renderRoomUI();
    },

    sendChatMessage() {
      if (!this.permissions().canChat) return;
      const inp = $('csrChatInput');
      if (!inp) return;
      const txt = inp.value.trim();
      if (!txt) return;
      inp.value = '';
      const entry = { id: 'm_' + Date.now(), user: this.state.userName, role: this.state.role, text: txt, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
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

      const userEntry = { id: 'm_' + Date.now(), user: this.state.userName + ' (@AI)', role: this.state.role, text: question, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      this.state.messages.push(userEntry);
      this.renderChatList();
      this.broadcast({ type: 'CHAT_MSG', entry: userEntry });

      const aiBtn = $('csrAskAiBtn');
      if (aiBtn) aiBtn.disabled = true;

      try {
        const sharedContext = this.state.files.filter(f => f.textPreview).map(f => `[File: ${f.name}]\n${f.textPreview.slice(0, 1800)}`).join('\n\n');
        const reply = await callGeminiAPI({
          systemInstruction: 'أنت مساعد دراسة طبي تعاوني داخل غرفة مذاكرة. أجب بإيجاز ودقة علمية عالية.' + SAFE_RULES,
          contents: [{ role: 'user', parts: [{ text: (sharedContext ? `ملفات الغرفة:\n${sharedContext}\n\n` : '') + `سؤال الطالب: ${question}` }] }]
        });
        const aiEntry = { id: 'm_' + Date.now(), user: 'MEDNERD AI Co-Pilot', role: 'ai', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
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
        if (file.size > 8 * 1024 * 1024) continue;
        let textPreview = '';
        if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
          try { textPreview = await file.text(); } catch (_) {}
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
        box.innerHTML = `<p style="color:var(--muted-text);text-align:center;font-size:13px;margin:auto;">${LANG === 'en' ? 'No messages yet.' : 'لا توجد رسائل بعد. ابدأ النقاش العلمي!'}</p>`;
        return;
      }
      box.innerHTML = this.state.messages.map(m => `
        <div class="chat-bubble ${m.user === this.state.userName ? 'user' : 'patient'}" style="max-width:92%;">
          <div style="display:flex;justify-content:space-between;gap:10px;font-size:11.5px;font-weight:800;margin-bottom:4px;opacity:0.85;">
            <span>${escapeHtml(m.user)} [${escapeHtml(String(m.role).toUpperCase())}]</span>
            <span>${escapeHtml(m.time || '')}</span>
          </div>
          <div data-notr="1">${m.role === 'ai' ? renderSafeMarkdown(m.text) : escapeHtml(m.text)}</div>
        </div>
      `).join('');
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

      c.innerHTML = `
        <div class="ai-output-box" data-notr="1">
          <div class="mn-ext-badge-bar" style="justify-content:space-between;">
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
              <span class="mn-ext-pill"><i class="fa-solid fa-door-open"></i> ${escapeHtml(this.state.roomCode)}</span>
              <span class="mn-ext-pill green"><i class="fa-solid fa-user-check"></i> ${escapeHtml(this.state.userName)}</span>
              <span class="mn-ext-pill mustard"><i class="fa-solid fa-user-shield"></i> ${roleLabels[this.state.role]}</span>
            </div>
            <div style="display:flex;gap:6px;align-items:center;">
              <small style="color:var(--muted-text);font-weight:700;">${isEn ? 'RBAC Role:' : 'تبديل الصلاحية:'}</small>
              <select class="form-select" style="width:auto;padding:4px 8px;font-size:12px;" onchange="window.MEDNERD_EXT.CollaborativeStudyRoom.changeRoleLive(this.value)">
                <option value="host" ${this.state.role === 'host' ? 'selected' : ''}>Host</option>
                <option value="editor" ${this.state.role === 'editor' ? 'selected' : ''}>Editor</option>
                <option value="viewer" ${this.state.role === 'viewer' ? 'selected' : ''}>Viewer</option>
              </select>
            </div>
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
                <h4 style="margin:0;"><i class="fa-solid fa-folder-open"></i> ${isEn ? 'File Sharing Hub' : 'مركز مشاركة الملفات'}</h4>
                <div id="csrDropzone" class="csr-dropzone ${!perm.canUpload ? 'disabled' : ''}">
                  <i class="fa-solid fa-cloud-arrow-up" style="font-size:24px;margin-bottom:6px;display:block;"></i>
                  ${perm.canUpload ? (isEn ? 'Drag & drop files or click to browse' : 'اسحب وأفلت ملفات الدراسة هنا أو اضغط للاختيار') : (isEn ? 'Viewer Role: Uploads disabled' : 'صلاحية مشاهد: الرفع غير متاح')}
                  <input type="file" id="csrHiddenFileInput" style="display:none;" multiple ${!perm.canUpload ? 'disabled' : ''}>
                </div>
                <div id="csrFileList" style="display:flex;flex-direction:column;gap:8px;max-height:190px;overflow-y:auto;"></div>
              </div>
            </div>

            <div class="csr-panel">
              <h4 style="margin:0;"><i class="fa-solid fa-comments"></i> ${isEn ? 'Real-Time Room Chat' : 'المحادثة الفورية للغرفة'}</h4>
              <div id="csrChatLog" class="chat-container" style="height:310px;margin-bottom:6px;"></div>
              <div style="display:flex;gap:8px;">
                <input type="text" id="csrChatInput" class="form-input" ${!perm.canChat ? 'disabled' : ''} placeholder="${perm.canChat ? (isEn ? 'Type message or question...' : 'اكتب رسالة أو سؤالاً طبياً...') : (isEn ? 'Read-only' : 'للقراءة فقط')}">
                <button type="button" class="btn-primary" style="padding:10px 16px;" ${!perm.canChat ? 'disabled' : ''} onclick="window.MEDNERD_EXT.CollaborativeStudyRoom.sendChatMessage()"><i class="fa-solid fa-paper-plane"></i></button>
                <button type="button" id="csrAskAiBtn" class="btn-secondary" ${!perm.canAskAiCoPilot ? 'disabled' : ''} onclick="window.MEDNERD_EXT.CollaborativeStudyRoom.askRoomAI()"><i class="fa-solid fa-robot"></i> AI</button>
              </div>
            </div>
          </div>
        </div>`;

      this.updateTimerDOM();
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
     MODULE 3: MEDPATIENT VOICE SIMULATION
     ========================================================================== */
  const MedPatientVoice = {
    state: { recognition: null, listening: false, speaking: false, autoSpeak: true, vlang: 'ar-SA', complaint: '', tone: '', history: [] },

    cleanup() {
      this.stopListening();
      if (window.speechSynthesis) { try { window.speechSynthesis.cancel(); } catch (_) {} }
      this.state.speaking = false;
    },

    systemPrompt() {
      return `أنت مريض حقيقي في محاكاة صوتية سريرية لطلاب الطب.
- الشكوى الرئيسية: (${this.state.complaint}).
- الحالة الشعورية: (${this.state.tone}).
تحدث بلسان المريض فقط بجمل قصيرة وطبيعية (1 إلى 3 جمل) لتناسب النطق الصوتي المباشر (TTS)، ولا تكشف القصة المرضية دفعة واحدة، ولا تذكر التشخيص النهائي أثناء الحوار.`;
    },

    async run() {
      if (APP_STATE.isRequestInFlight) return;
      this.cleanup();
      this.state.complaint = ($('vp_complaint') && $('vp_complaint').value.trim()) || (LANG === 'en' ? '55-year-old male with acute retrosternal chest pain' : 'رجل 55 سنة يعاني من ألم صدري عاصر خلف القص منذ ساعة');
      this.state.tone = ($('vp_tone') && $('vp_tone').value) || 'Anxious';
      this.state.vlang = ($('vp_vlang') && $('vp_vlang').value) || (LANG === 'en' ? 'en-US' : 'ar-SA');
      this.state.history = [{ role: 'user', parts: [{ text: `ابدأ المحاكاة الصوتية الآن. قدم نفسك كمريض في جملتين تصف شكواك الرئيسية وشعورك الحالي، وانتظر سؤالي.` }] }];

      setToolLoadingState(true, LANG === 'en' ? 'Initializing voice encounter...' : 'جارٍ تهيئة المريض الصوتي...');
      $('toolOutputContainer').innerHTML = '';

      try {
        const opening = await callGeminiAPI({ systemInstruction: this.systemPrompt() + SAFE_RULES, contents: this.state.history, generationConfig: { maxOutputTokens: 1024 } });
        this.state.history.push({ role: 'model', parts: [{ text: opening }] });
        this.mountVoiceUI();
        this.appendVoiceLog('patient', opening);
        this.speakText(opening);
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
          <div class="vp-orb-wrap">
            <button type="button" id="vpMicBtn" class="vp-mic-btn" onclick="window.MEDNERD_EXT.MedPatientVoice.toggleMic()">
              <i class="fa-solid fa-microphone"></i>
            </button>
            <p id="vpStatusLabel" style="font-weight:800;color:var(--petrol);margin-top:12px;font-size:14.5px;">
              ${hasSR ? (isEn ? 'Tap microphone to speak (or type below)' : 'اضغط زر الميكروفون للتحدث بصوتك (أو اكتب أدناه)') : (isEn ? 'Use text input below (TTS audio enabled)' : 'استخدم الكتابة أدناه (النطق الصوتي للمريض مفعّل)')}
            </p>
            <label class="checkbox-label" style="margin-top:8px;font-size:13px;">
              <input type="checkbox" checked onchange="window.MEDNERD_EXT.MedPatientVoice.state.autoSpeak = this.checked">
              <span>${isEn ? 'Auto-speak patient replies (TTS)' : 'نطق ردود المريض صوتياً تلقائياً (TTS)'}</span>
            </label>
          </div>

          <div id="vpChatLog" class="chat-container" style="max-height:320px;"></div>

          <div style="display:flex;gap:8px;margin-bottom:12px;">
            <input type="text" id="vpTextInput" class="form-input" placeholder="${isEn ? 'Speak via mic or type your question...' : 'تحدث بالميكروفون أو اكتب سؤالك السريري هنا...'}">
            <button type="button" id="vpSendBtn" class="btn-primary" style="padding:10px 18px;" onclick="window.MEDNERD_EXT.MedPatientVoice.submitDoctorTurn()"><i class="fa-solid fa-paper-plane"></i></button>
            <button type="button" class="btn-secondary" onclick="window.MEDNERD_EXT.MedPatientVoice.replayLastAudio()"><i class="fa-solid fa-volume-high"></i></button>
          </div>

          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding-top:10px;border-top:1px solid var(--border-color);">
            <input type="text" id="vpProvisionalDx" class="form-input" style="flex:1;min-width:220px;" placeholder="${isEn ? 'Enter Provisional Diagnosis (optional)...' : 'اكتب تشخيصك المبدئي قبل إنهاء المقابلة (اختياري)...'}">
            <button type="button" id="vpEndBtn" class="btn-secondary" style="border-color:var(--dark-green);color:var(--dark-green);" onclick="window.MEDNERD_EXT.MedPatientVoice.evaluateEncounter()">
              <i class="fa-solid fa-clipboard-check"></i> ${isEn ? 'End & Get Feedback' : 'إنهاء المقابلة وتقييم القصة المرضية'}
            </button>
          </div>
          <div id="vpFeedbackBox"></div>
        </div>`;

      const inp = $('vpTextInput');
      if (inp) inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); this.submitDoctorTurn(); } };
    },

    toggleMic() {
      if (this.state.listening) { this.stopListening(); return; }
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) return;
      if (window.speechSynthesis) window.speechSynthesis.cancel();

      const rec = new SR();
      rec.lang = this.state.vlang;
      rec.interimResults = true;
      rec.continuous = false;

      rec.onstart = () => {
        this.state.listening = true;
        const btn = $('vpMicBtn'), st = $('vpStatusLabel');
        if (btn) btn.classList.add('listening');
        if (st) st.textContent = LANG === 'en' ? 'Listening... Speak now' : 'جارٍ الاستماع لسؤالك... تحدث الآن';
      };
      rec.onresult = event => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) transcript += event.results[i][0].transcript;
        const inp = $('vpTextInput');
        if (inp) inp.value = transcript;
        if (event.results[event.results.length - 1].isFinal) {
          this.stopListening();
          this.submitDoctorTurn();
        }
      };
      rec.onerror = () => this.stopListening();
      rec.onend = () => this.stopListening();
      this.state.recognition = rec;
      rec.start();
    },

    stopListening() {
      this.state.listening = false;
      if (this.state.recognition) { try { this.state.recognition.stop(); } catch (_) {} this.state.recognition = null; }
      const btn = $('vpMicBtn');
      if (btn) btn.classList.remove('listening');
    },

    speakText(rawText) {
      if (!this.state.autoSpeak || !window.speechSynthesis) return;
      try {
        window.speechSynthesis.cancel();
        const clean = String(rawText || '').replace(/[*_#`~>]/g, '').replace(/\(.*?\)/g, '');
        const utter = new SpeechSynthesisUtterance(clean);
        utter.lang = this.state.vlang;
        const btn = $('vpMicBtn');
        utter.onstart = () => { this.state.speaking = true; if (btn) btn.classList.add('speaking'); };
        utter.onend = () => { this.state.speaking = false; if (btn) btn.classList.remove('speaking'); };
        window.speechSynthesis.speak(utter);
      } catch (_) {}
    },

    replayLastAudio() {
      const lastModel = [...this.state.history].reverse().find(m => m.role === 'model');
      if (lastModel && lastModel.parts && lastModel.parts[0]) this.speakText(lastModel.parts[0].text);
    },

    appendVoiceLog(role, text) {
      const log = $('vpChatLog');
      if (!log) return;
      const b = document.createElement('div');
      b.className = 'chat-bubble ' + (role === 'user' ? 'user' : 'patient');
      const header = document.createElement('div');
      header.style.cssText = 'font-weight:800;font-size:12px;margin-bottom:4px;';
      header.textContent = role === 'user' ? (LANG === 'en' ? 'Doctor (You):' : 'الطبيب (أنت):') : (LANG === 'en' ? 'Patient:' : 'المريض:');
      const content = document.createElement('div');
      content.textContent = text;
      b.append(header, content);
      log.appendChild(b);
      log.scrollTop = log.scrollHeight;
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
      const sendBtn = $('vpSendBtn');
      if (sendBtn) sendBtn.disabled = true;

      try {
        const reply = await callGeminiAPI({ systemInstruction: this.systemPrompt() + SAFE_RULES, contents: this.state.history, generationConfig: { maxOutputTokens: 1024 } });
        this.state.history.push({ role: 'model', parts: [{ text: reply }] });
        this.appendVoiceLog('patient', reply);
        this.speakText(reply);
      } catch (e) {
        this.state.history.pop();
        renderToolError(e.message);
      } finally {
        APP_STATE.isRequestInFlight = false;
        if (sendBtn) sendBtn.disabled = false;
      }
    },

    async evaluateEncounter() {
      if (APP_STATE.isRequestInFlight) return;
      this.cleanup();
      const provDx = ($('vpProvisionalDx') && $('vpProvisionalDx').value.trim()) || (LANG === 'en' ? 'Not provided' : 'لم يُذكر');
      const box = $('vpFeedbackBox'), endBtn = $('vpEndBtn');
      APP_STATE.isRequestInFlight = true;
      if (endBtn) endBtn.disabled = true;

      const evalPrompt = `[تقييم المقابلة الصوتية السريرية]: التشخيص المبدئي المقترح من الطالب: (${provDx}). اخرج من دور المريض وقدّم تقريراً تقييمياً شاملاً: 1) أسلوب أخذ القصة المرضية 2) المفاتيح والـ Red Flags التي سأل عنها والتي أغفلها 3) تقييم التشخيص المبدئي ومقارنته بالتشخيص التفريقي 4) الدرجة من 100.`;

      try {
        const report = await callGeminiAPI({ systemInstruction: this.systemPrompt() + SAFE_RULES, contents: [...this.state.history, { role: 'user', parts: [{ text: evalPrompt }] }] });
        if (box) {
          box.innerHTML = `<div style="margin-top:18px;padding:20px;border-radius:14px;background:var(--dark-green-soft);border:1px solid var(--dark-green);"><div data-notr="1">${renderSafeMarkdown(report)}</div></div>`;
          addExportBar(box.firstElementChild, report, 'mednerd-voice-encounter-report');
        }
      } catch (e) {
        if (box) box.innerHTML = `<div class="error-alert">${escapeHtml(e.message)}</div>`;
      } finally {
        APP_STATE.isRequestInFlight = false;
        if (endBtn) endBtn.disabled = false;
      }
    }
  };

  /* ==========================================================================
     MODULE 4: MEDICAL AUDIO & LECTURE TRANSCRIBER
     ========================================================================== */
  const MedicalTranscriber = {
    state: { mediaRecorder: null, chunks: [], recordedBlob: null, recordedMime: '', isRecording: false, secElapsed: 0, timerId: null },

    cleanup() {
      if (this.state.timerId) { clearInterval(this.state.timerId); this.state.timerId = null; }
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
            <div style="font-weight:800;font-size:14px;color:var(--petrol);">${isEn ? 'Live Lecture Recorder' : 'مسجل المحاضرات الصوتي المباشر'}</div>
            <small id="atRecStatus" style="color:var(--muted-text);">${isEn ? 'Record from mic or upload file above' : 'سجّل مباشرة من الميكروفون أو ارفع ملفاً صوتياً أعلاه'}</small>
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <button type="button" id="atRecBtn" class="btn-secondary" onclick="window.MEDNERD_EXT.MedicalTranscriber.toggleRecording()">
            <i class="fa-solid fa-microphone-lines"></i> <span>${isEn ? 'Start Recording' : 'بدء التسجيل'}</span>
          </button>
          <audio id="atAudioPreview" controls style="display:none;height:36px;max-width:220px;"></audio>
        </div>`;
      fileInput.parentElement.insertAdjacentElement('afterend', wrap);
    },

    async toggleRecording() {
      const isEn = LANG === 'en';
      if (this.state.isRecording) {
        this.cleanup();
        const btn = $('atRecBtn'), dot = $('atRecDot');
        if (dot) dot.classList.remove('active');
        if (btn) btn.innerHTML = `<i class="fa-solid fa-microphone-lines"></i> <span>${isEn ? 'Re-record' : 'إعادة التسجيل'}</span>`;
        return;
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        renderToolError(isEn ? 'Microphone recording not supported.' : 'التسجيل الصوتي غير مدعوم في هذا المتصفح.');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
        const mr = new MediaRecorder(stream, { mimeType: mime });
        this.state.chunks = [];
        this.state.recordedBlob = null;
        this.state.recordedMime = mime;
        this.state.secElapsed = 0;

        mr.ondataavailable = e => { if (e.data && e.data.size > 0) this.state.chunks.push(e.data); };
        mr.onstop = () => {
          stream.getTracks().forEach(t => t.stop());
          this.state.recordedBlob = new Blob(this.state.chunks, { type: mime });
          const audioEl = $('atAudioPreview');
          if (audioEl) { audioEl.src = URL.createObjectURL(this.state.recordedBlob); audioEl.style.display = 'block'; }
          const st = $('atRecStatus');
          if (st) st.textContent = isEn ? `Recorded ${this.state.secElapsed}s — Ready` : `تم تسجيل ${this.state.secElapsed} ثانية — جاهز للتفريغ`;
        };

        mr.start();
        this.state.mediaRecorder = mr;
        this.state.isRecording = true;
        const btn = $('atRecBtn'), dot = $('atRecDot'), st = $('atRecStatus');
        if (dot) dot.classList.add('active');
        if (btn) btn.innerHTML = `<i class="fa-solid fa-stop" style="color:var(--danger);"></i> <span>${isEn ? 'Stop' : 'إيقاف التسجيل'}</span>`;
        this.state.timerId = setInterval(() => {
          this.state.secElapsed++;
          if (st) st.textContent = (isEn ? 'Recording... ' : 'جارٍ التسجيل... ') + this.state.secElapsed + 's';
        }, 1000);
      } catch (e) {
        renderToolError(e.message);
      }
    },

    resolveAudioMime(file) {
      if (file.type && file.type.startsWith('audio/')) return file.type;
      const n = file.name.toLowerCase();
      if (n.endsWith('.wav')) return 'audio/wav';
      if (n.endsWith('.m4a') || n.endsWith('.mp4')) return 'audio/mp4';
      if (n.endsWith('.ogg')) return 'audio/ogg';
      if (n.endsWith('.webm')) return 'audio/webm';
      return 'audio/mp3';
    },

    async run() {
      if (APP_STATE.isRequestInFlight) return;
      const fileInp = $('at_file');
      const uploadedFile = fileInp && fileInp.files && fileInp.files[0];
      const spec = ($('at_spec') && $('at_spec').value.trim()) || 'General Medicine';
      const mode = ($('at_mode') && $('at_mode').value) || 'complete';

      let targetBlob = null, mimeType = '';
      if (uploadedFile) {
        if (uploadedFile.size > GEMINI_CONFIG.maxFileSizeBytes) {
          renderToolError(LANG === 'en' ? 'Audio file exceeds 12 MB limit.' : 'حجم الملف الصوتي يتجاوز 12 ميجابايت.');
          return;
        }
        targetBlob = uploadedFile;
        mimeType = this.resolveAudioMime(uploadedFile);
      } else if (this.state.recordedBlob) {
        targetBlob = this.state.recordedBlob;
        mimeType = this.state.recordedMime || 'audio/webm';
      } else {
        renderToolError(LANG === 'en' ? 'Upload an audio file or record live audio first.' : 'يرجى رفع ملف صوتي أو تسجيل مقطع صوتي أولاً.');
        return;
      }

      setToolLoadingState(true, LANG === 'en' ? EXT_EN_TOOLS.audio_transcriber.ld : 'جارٍ تفريغ الصوت وضبط المصطلحات الطبية...');
      $('toolOutputContainer').innerHTML = '';

      try {
        const b64 = await fileToBase64(targetBlob);
        const sysPrompt = `أنت محرر ومحاضر طبي متخصص في تفريغ المحاضرات الصوتية الطبية بدقة قياسية في المصطلحات التشريحية والدوائية والسريرية (التخصص: ${spec} | الوضع: ${mode}).
قدّم المخرجات منسقة في: 1) النص المفرّغ الكامل (Verbatim Medical Transcript) 2) ملاحظات المحاضرة المنظمة (Structured Lecture Notes) 3) الخلاصات الذهبية وأسئلة الامتحانات (Key Takeaways & Exam Pearls).`;

        const output = await callGeminiAPI({
          systemInstruction: sysPrompt + SAFE_RULES,
          contents: [{ role: 'user', parts: [{ text: `فرّغ وحلّل هذا التسجيل الصوتي الطبي.` }, { inlineData: { mimeType, data: b64 } }] }]
        });
        renderToolOutput(output);
      } catch (e) {
        renderToolError(e.message, () => this.run());
      } finally {
        setToolLoadingState(false);
      }
    }
  };

  /* ==========================================================================
     MODULE 5: TIMED CLINICAL EXAM ARENA
     ========================================================================== */
  const TimedExamArena = {
    state: { questions: [], currentIndex: 0, timerMode: 'total', secPerQ: 60, remainingSec: 0, timerId: null, qStartTimestamp: 0, finished: false },

    cleanup() {
      if (this.state.timerId) { clearInterval(this.state.timerId); this.state.timerId = null; }
    },

    async run() {
      if (APP_STATE.isRequestInFlight) return;
      this.cleanup();
      const topic = ($('tea_topic') && $('tea_topic').value.trim()) || '';
      const count = Math.min(Math.max(parseInt(($('tea_count') && $('tea_count').value) || '5', 10), 3), 15);
      const tmode = ($('tea_tmode') && $('tea_tmode').value) || 'total';
      const tsec = parseInt(($('tea_tsec') && $('tea_tsec').value) || '60', 10) || 60;

      if (!topic) {
        renderToolError(LANG === 'en' ? EXT_EN_TOOLS.timed_exam_arena.v : 'يرجى تحديد موضوع الامتحان أو لصق المادة العلمية.');
        return;
      }

      setToolLoadingState(true, LANG === 'en' ? EXT_EN_TOOLS.timed_exam_arena.ld : 'جارٍ إعداد الحالات السريرية الموقّتة...');
      $('toolOutputContainer').innerHTML = '';

      const sysPrompt = `أنت رئيس لجنة امتحانات سريرية (USMLE Step 2 CK). أنشئ (${count}) أسئلة سريرية (Clinical Vignettes) حول الموضوع المحدد.
أخرج JSON فقط دون أي نص خارجه وفق الهيكل:
{
  "questions": [
    {
      "id": 1,
      "domain": "اسم التخصص الفرعي",
      "stem": "نص الحالة السريرية والسؤال",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctIndex": 0,
      "rationale": "التفسير العلمي المفصل للصحيح والخاطئ"
    }
  ]
}`;

      try {
        const raw = await callGeminiAPI({ systemInstruction: sysPrompt + SAFE_RULES, contents: [{ role: 'user', parts: [{ text: topic }] }] });
        const parsed = extractJsonBlock(raw);
        if (!parsed.questions || !parsed.questions.length) throw new Error('No questions generated.');

        this.state.questions = parsed.questions.map((q, idx) => ({
          id: idx + 1,
          domain: q.domain || 'Clinical Medicine',
          stem: q.stem || '',
          options: Array.isArray(q.options) ? q.options.slice(0, 5) : ['A', 'B', 'C', 'D'],
          correctIndex: Number.isInteger(q.correctIndex) ? q.correctIndex : 0,
          rationale: q.rationale || '',
          selected: null,
          timeSpentSec: 0
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
      const c = $('toolOutputContainer');
      if (!c) return;
      const isEn = LANG === 'en';
      const q = this.state.questions[this.state.currentIndex];
      const total = this.state.questions.length;
      const m = Math.floor(this.state.remainingSec / 60), s = this.state.remainingSec % 60;

      c.innerHTML = `
        <div class="ai-output-box" data-notr="1">
          <div class="tea-topbar">
            <div>
              <span class="mn-ext-pill">${isEn ? 'Question' : 'السؤال'} ${this.state.currentIndex + 1} / ${total}</span>
              <span class="mn-ext-pill green" style="margin-inline-start:6px;">${escapeHtml(q.domain)}</span>
            </div>
            <span id="teaClockText" class="mn-ext-pill danger" style="font-size:15px;font-family:monospace;">
              ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}
            </span>
          </div>
          <p style="font-size:16px;font-weight:700;line-height:1.8;margin-bottom:18px;">${escapeHtml(q.stem)}</p>
          <div>
            ${q.options.map((opt, idx) => `
              <button type="button" class="tea-option ${q.selected === idx ? 'selected' : ''}" onclick="window.MEDNERD_EXT.TimedExamArena.selectOption(${idx})">
                <span style="font-weight:800;color:var(--petrol);">${idx + 1}.</span>
                <span>${escapeHtml(opt)}</span>
              </button>
            `).join('')}
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:18px;padding-top:14px;border-top:1px solid var(--border-color);flex-wrap:wrap;gap:10px;">
            <div style="display:flex;gap:8px;">
              ${this.state.timerMode === 'total' ? `<button type="button" class="btn-secondary" ${this.state.currentIndex === 0 ? 'disabled' : ''} onclick="window.MEDNERD_EXT.TimedExamArena.goToQuestion(${this.state.currentIndex - 1})">${isEn ? 'Previous' : 'السابق'}</button>` : ''}
              ${this.state.currentIndex < total - 1 ? `<button type="button" class="btn-primary" onclick="window.MEDNERD_EXT.TimedExamArena.goToQuestion(${this.state.currentIndex + 1})">${isEn ? 'Next' : 'التالي'}</button>` : ''}
            </div>
            <button type="button" class="btn-primary" style="background:var(--dark-green);" onclick="window.MEDNERD_EXT.TimedExamArena.finishExam()">
              <i class="fa-solid fa-flag-checkered"></i> ${isEn ? 'Submit & Analytics' : 'تسليم الامتحان وعرض لوحة الأداء'}
            </button>
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

      qs.forEach(q => {
        const ok = q.selected === q.correctIndex;
        if (ok) correctCount++;
        totalTime += q.timeSpentSec;
        if (!domainMap[q.domain]) domainMap[q.domain] = { total: 0, correct: 0, time: 0 };
        domainMap[q.domain].total++;
        if (ok) domainMap[q.domain].correct++;
        domainMap[q.domain].time += q.timeSpentSec;
      });

      const scorePct = Math.round((correctCount / total) * 100);
      const avgTime = Math.round(totalTime / total);
      const isEn = LANG === 'en';

      const domainRowsHtml = Object.entries(domainMap).map(([dom, st]) => {
        const pct = Math.round((st.correct / st.total) * 100);
        const col = pct >= 70 ? 'var(--dark-green)' : pct >= 50 ? 'var(--mustard)' : 'var(--danger)';
        return `<div style="margin-bottom:12px;">
          <div style="display:flex;justify-content:space-between;font-size:13.5px;font-weight:700;">
            <span>${escapeHtml(dom)}</span><span style="color:${col};">${st.correct}/${st.total} (${pct}%) • ${st.time}s</span>
          </div>
          <div class="tea-bar-track"><div class="tea-bar-fill" style="width:${pct}%;background:${col};"></div></div>
        </div>`;
      }).join('');

      const reviewCardsHtml = qs.map((q, i) => {
        const ok = q.selected === q.correctIndex;
        return `<div style="padding:18px;border:1px solid var(--border-color);border-radius:14px;background:var(--white);margin-bottom:14px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
            <span class="mn-ext-pill ${ok ? 'green' : 'danger'}">${ok ? (isEn ? '✓ Correct' : '✓ صحيحة') : (isEn ? '✗ Incorrect' : '✗ خاطئة')}</span>
            <small style="font-weight:700;color:var(--muted-text);">${q.timeSpentSec}s</small>
          </div>
          <p style="font-weight:700;margin-bottom:12px;">Q${i + 1}: ${escapeHtml(q.stem)}</p>
          ${q.options.map((opt, oIdx) => `<div class="tea-option ${oIdx === q.correctIndex ? 'correct' : (q.selected === oIdx ? 'wrong' : '')}" style="cursor:default;"><span>${escapeHtml(opt)}</span></div>`).join('')}
          <div style="margin-top:10px;padding:12px 14px;border-radius:10px;background:var(--petrol-soft);font-size:14px;">${renderSafeMarkdown(q.rationale)}</div>
        </div>`;
      }).join('');

      const c = $('toolOutputContainer');
      if (!c) return;
      c.innerHTML = `<div class="ai-output-box" data-notr="1">
        <h3><i class="fa-solid fa-chart-pie"></i> ${isEn ? 'Performance Metrics & Review' : 'لوحة مؤشرات الأداء والمراجعة التفصيلية'}</h3>
        <div class="tea-kpi-grid">
          <div class="tea-kpi-card"><div class="tea-kpi-val">${scorePct}%</div><small>${correctCount}/${total}</small></div>
          <div class="tea-kpi-card"><div class="tea-kpi-val">${avgTime}s</div><small>${isEn ? 'Avg Time/Q' : 'متوسط زمن السؤال'}</small></div>
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

      if (!concept || !explanation) {
        renderToolError(LANG === 'en' ? EXT_EN_TOOLS.feynman_engine.v : 'يرجى إدخال المفهوم الطبي وشرحك الشخصي له أولاً.');
        return;
      }

      setToolLoadingState(true, LANG === 'en' ? EXT_EN_TOOLS.feynman_engine.ld : 'جارٍ فحص شرحك واكتشاف الفجوات المفاهيمية...');
      $('toolOutputContainer').innerHTML = '';

      const sysPrompt = `أنت مقيم أكاديمي خبير بتقنية فاينمان الطبية. حلّل شرح الطالب للمفهوم (${concept}) الموجه لجمهور (${aud}).
أخرج JSON فقط دون أي نص خارجه وفق الهيكل:
{
  "scores": { "clarity": 85, "accuracy": 90, "depth": 75, "overall": 83 },
  "blindSpots": ["نقطة أغفلها الطالب أو أخطأ فيها"],
  "jargonDetected": [{ "term": "المصطلح", "issue": "مشكلة الفهم", "simplerRewrite": "البديل المبسط" }],
  "analogies": ["تشبيه مقترح لتبسيط الآلية"],
  "idealFeynmanRewrite": "إعادة صياغة نموذجية"
}`;

      try {
        const raw = await callGeminiAPI({
          systemInstruction: sysPrompt + SAFE_RULES,
          contents: [{ role: 'user', parts: [{ text: `المفهوم: ${concept}\n\nشرح الطالب:\n${explanation}` }] }]
        });
        this.renderReport(extractJsonBlock(raw), concept);
      } catch (e) {
        renderToolError(e.message, () => this.run());
      } finally {
        setToolLoadingState(false);
      }
    },

    renderReport(d, concept) {
      const c = $('toolOutputContainer');
      if (!c) return;
      const isEn = LANG === 'en';
      const sc = d.scores || { clarity: 0, accuracy: 0, depth: 0, overall: 0 };
      const blind = Array.isArray(d.blindSpots) ? d.blindSpots : [];
      const jargon = Array.isArray(d.jargonDetected) ? d.jargonDetected : [];
      const analogies = Array.isArray(d.analogies) ? d.analogies : [];

      const jargonRows = jargon.length
        ? `<table><thead><tr><th>${isEn ? 'Jargon Term' : 'المصطلح'}</th><th>${isEn ? 'Issue' : 'المشكلة'}</th><th>${isEn ? 'Plain Rewrite' : 'البديل الواضح'}</th></tr></thead>
            <tbody>${jargon.map(j => `<tr><td><b>${escapeHtml(j.term || '')}</b></td><td>${escapeHtml(j.issue || '')}</td><td>${escapeHtml(j.simplerRewrite || '')}</td></tr>`).join('')}</tbody></table>`
        : `<p>${isEn ? 'No unexplained jargon detected.' : 'لم يُرصد اتكاء مفرط على مصطلحات غامضة.'}</p>`;

      c.innerHTML = `<div class="ai-output-box" data-notr="1">
        <h3><i class="fa-solid fa-magnifying-glass-chart"></i> ${isEn ? 'Feynman Rubric Audit' : 'تقرير تقييم فاينمان وفحص الفهم العميق'}</h3>
        <div class="fme-rubric-grid">
          <div class="fme-score-card"><div>${isEn ? 'Clarity' : 'الوضوح'}</div><div class="fme-ring">${sc.clarity}/100</div></div>
          <div class="fme-score-card"><div>${isEn ? 'Accuracy' : 'الدقة العلمية'}</div><div class="fme-ring" style="color:var(--dark-green);">${sc.accuracy}/100</div></div>
          <div class="fme-score-card"><div>${isEn ? 'Depth' : 'العمق السببي'}</div><div class="fme-ring" style="color:var(--mustard);">${sc.depth}/100</div></div>
          <div class="fme-score-card"><div>${isEn ? 'Overall' : 'الدرجة الكلية'}</div><div class="fme-ring">${sc.overall}/100</div></div>
        </div>
        <h4>${isEn ? 'a) Conceptual Blind Spots' : 'أ) الفجوات المفاهيمية والأخطاء المرصودة'}</h4>
        <ul>${blind.map(b => `<li>${escapeHtml(b)}</li>`).join('')}</ul>
        <h4>${isEn ? 'b) Medical Jargon Detector' : 'ب) كاشف الاتكاء على المصطلحات دون شرح الآلية'}</h4>
        ${jargonRows}
        <h4>${isEn ? 'c) Suggested Analogies' : 'ج) تشبيهات مقترحة للتبسيط'}</h4>
        <ul>${analogies.map(a => `<li>${escapeHtml(a)}</li>`).join('')}</ul>
        <h4>${isEn ? 'Model Feynman Explanation' : 'الصياغة النموذجية بطريقة فاينمان'}</h4>
        <blockquote>${renderSafeMarkdown(d.idealFeynmanRewrite || '')}</blockquote>
      </div>`;
    }
  };

  /* ==========================================================================
     تسجيل الأدوات الـ 6 وربطها التلقائي بالواجهة
     ========================================================================== */
  const EXT_TOOL_DEFINITIONS = [
    {
      id: 'mindmap_studio', category: 'memory', name: 'MindMap Studio', icon: 'fa-sitemap', badge: 'خرائط ذهنية', custom: true,
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
    {
      id: 'study_room', category: 'study', name: 'Collaborative Study Room', icon: 'fa-users-rectangle', badge: 'غرفة دراسة', custom: true,
      desc: 'غرفة مذاكرة جماعية متزامنة تضم مؤقت بومودورو مشترك، محادثة فورية، مركز رفع ومشاركة ملفات بالسحب والإفلات، ونظام صلاحيات (Host, Editor, Viewer).',
      keywords: 'collaborative study room pomodoro chat files rbac غرفة دراسة جماعية بومودورو مشاركة ملفات',
      btn: ['fa-door-open', 'دخول / إنشاء غرفة الدراسة المشتركة'],
      fields: [
        [
          { id: 'csr_code', type: 'text', label: 'رمز الغرفة (شاركه مع زملائك):', ph: 'مثال: MED-STEP2-ROOM' },
          { id: 'csr_name', type: 'text', label: 'اسمك المعروض في الغرفة:', ph: 'مثال: د. أحمد' }
        ],
        [
          { id: 'csr_role', type: 'select', label: 'صلاحيتك في الغرفة (RBAC):', opts: [['host', 'Host (تحكم كامل بالمؤقت والدردشة والملفات)'], ['editor', 'Editor (مشاركة في الدردشة ورفع الملفات)'], ['viewer', 'Viewer (مشاهدة ومتابعة المؤقت فقط)']] },
          { id: 'csr_cycle', type: 'select', label: 'دورة بومودورو (تركيز / استراحة بالدقائق):', opts: [['25/5', '25 / 5 (بومودورو قياسي)'], ['50/10', '50 / 10 (جلسة سريرية معمقة)'], ['15/3', '15 / 3 (مراجعة سريعة)']] }
        ]
      ]
    },
    {
      id: 'voice_patient', category: 'osce', name: 'MedPatient Voice Sim', icon: 'fa-microphone-lines', badge: 'محاكاة صوتية', custom: true,
      desc: 'محاكاة صوتية ثنائية الاتجاه بالزمن الحقيقي (تحدث بالميكروفون ⬅ مريض ذكي ⬅ رد صوتي ناطق) لأخذ القصة المرضية مع تقرير تقييم ختامي.',
      keywords: 'voice patient simulation stt tts microphone osce مريض صوتي محاكاة صوتية ميكروفون',
      btn: ['fa-headset', 'بدء المقابلة الصوتية مع المريض'],
      warn: 'تعتمد الأداة على Web Speech API في متصفحك (الميكروفون والسماعة) وهي مخصصة للتدريب السريري فقط.',
      fields: [
        { id: 'vp_complaint', type: 'text', label: 'الشكوى الرئيسية أو السيناريو السريري:', ph: 'مثال: ألم صدري عاصر يمتد للفك الأيسر منذ ساعة' },
        [
          { id: 'vp_tone', type: 'select', label: 'شخصية المريض ونبرته الشعورية:', opts: [['قلق ومتألم (واقعي)', 'قلق ومتألم (واقعي)'], ['هادئ ومتعاون', 'هادئ ومتعاون'], ['غامض الوصف ويحتاج أسئلة موجهة (صعب)', 'غامض الوصف (تحدي سريري)']] },
          { id: 'vp_vlang', type: 'select', label: 'لغة التعرف الصوتي والنطق:', opts: [['ar-SA', 'العربية (ar-SA)'], ['en-US', 'الإنجليزية (en-US)']] }
        ]
      ]
    },
    {
      id: 'audio_transcriber', category: 'study', name: 'Medical Audio Transcriber', icon: 'fa-file-audio', badge: 'تفريغ صوتي', custom: true,
      desc: 'رفع تسجيلات المحاضرات الصوتية (MP3, WAV, M4A) أو التسجيل الحي المباشر لتفريغها بدقة في المصطلحات الطبية والدوائية والتشريحية وتحويلها لملخصات.',
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
      id: 'timed_exam_arena', category: 'exam', name: 'Timed Clinical Exam Arena', icon: 'fa-stopwatch-20', badge: 'امتحان موقّت', custom: true,
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
    {
      id: 'feynman_engine', category: 'study', name: 'FeynmanMed Engine', icon: 'fa-chalkboard-user', badge: 'تقييم فاينمان', custom: true,
      desc: 'محرك تقييم شرح الطالب بطريقة فاينمان: يكتشف الفجوات المفاهيمية، والاتكاء على المصطلحات دون فهم، ويقترح تشبيهات مع تقييم معياري (Rubric).',
      keywords: 'feynman engine rubric blind spots jargon تقييم فاينمان شرح الطالب فجوات الفهم',
      btn: ['fa-clipboard-check', 'تحليل شرحي وتقييم الفهم (Feynman Audit)'],
      fields: [
        { id: 'fme_concept', type: 'text', label: 'المفهوم الطبي المستهدف:', ph: 'مثال: قانون فرانك-ستارلينغ للقلب' },
        { id: 'fme_exp', type: 'textarea', rows: 6, label: 'اكتب شرحك للمفهوم بأسلوبك الخاص (كأنك تشرحه لزميلك):', ph: 'اشرح كيف ولماذا تعمل هذه الآلية بكلماتك الخاصة...' },
        { id: 'fme_aud', type: 'select', label: 'معيار الجمهور المستهدف:', opts: [['طالب طب / زميل دراسة', 'طالب طب / زميل دراسة'], ['شخص غير مختص / مريض واعي', 'شخص غير مختص / مريض واعي'], ['مناقشة سريرية معمقة (Attending Level)', 'مناقشة سريرية معمقة (Attending Level)']] }
      ]
    }
  ];

  const CUSTOM_RUNNERS = {
    mindmap_studio:    () => MindMapStudio.run(),
    study_room:        () => CollaborativeStudyRoom.run(),
    voice_patient:     () => MedPatientVoice.run(),
    audio_transcriber: () => MedicalTranscriber.run(),
    timed_exam_arena:  () => TimedExamArena.run(),
    feynman_engine:    () => FeynmanEngine.run()
  };

  function cleanupAllExtensionModules() {
    CollaborativeStudyRoom.cleanup();
    MedPatientVoice.cleanup();
    MedicalTranscriber.cleanup();
    TimedExamArena.cleanup();
  }

  function installExtensionHooks() {
    EXT_TOOL_DEFINITIONS.forEach(t => {
      if (!TOOLS.some(existing => existing.id === t.id)) TOOLS.push(t);
    });

    const origOpenToolWorkspace = window.openToolWorkspace;
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
      }
    };

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
  }

  window.MEDNERD_EXT = { MindMapStudio, CollaborativeStudyRoom, MedPatientVoice, MedicalTranscriber, TimedExamArena, FeynmanEngine };

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', installExtensionHooks);
  } else {
    installExtensionHooks();
   // فتح الغرفة تلقائياً إذا دخل الطالب عبر رابط دعوة (?room=XXXX)
    const urlParams = new URLSearchParams(window.location.search);
    const invitedRoom = urlParams.get('room');
    if (invitedRoom) {
      if ($('welcomeModal')) $('welcomeModal').style.display = 'none';
      openToolWorkspace('study_room');
      if ($('csr_code')) $('csr_code').value = invitedRoom.toUpperCase();
      if ($('csr_role')) $('csr_role').value = 'editor'; // يدخل الضيف كمحرر افتراضياً 
  }
})();
