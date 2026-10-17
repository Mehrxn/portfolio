/* =====================================================================
   CONTROLLER — listens to the user, updates the Model, tells the View.
   ===================================================================== */

const Controller = {

  transitioning: false,
  audioUnlocked: false,

  init() {
    View.init();
    this.bindHistory();
    this.bindMenu();
    this.bindKeyboard();
    this.bindAudioUnlock();
    this.bindAudioButton();
    this.bindContactForm();
  },

  /* ---------- Contact form (relayed via formsubmit.co, mailto fallback) ---------- */
  bindContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;
    const status = document.getElementById("form-status");
    const btn = form.querySelector(".form-send");

    form.addEventListener("submit", async e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      if (data._honey) return;  // honeypot caught a bot
      if (!data.name.trim() || !data.email.trim() || !data.message.trim()) {
        status.textContent = "Fill in all three fields first.";
        return;
      }
      btn.disabled = true;
      status.textContent = "Sending…";
      try {
        const res = await fetch(`https://formsubmit.co/ajax/${Model.contactEmail}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            message: data.message,
            _subject: `Portfolio message from ${data.name}`,
          }),
        });
        if (!res.ok) throw new Error(res.status);
        status.textContent = "Sent! I'll get back to you soon.";
        form.reset();
        this.play();
      } catch {
        // relay unreachable: open the visitor's own mail app instead
        status.textContent = "Couldn't reach the relay, opening your email app instead…";
        const subject = encodeURIComponent(`Portfolio message from ${data.name}`);
        const body = encodeURIComponent(`${data.message}\n\nReply to: ${data.email}`);
        location.href = `mailto:${Model.contactEmail}?subject=${subject}&body=${body}`;
      } finally {
        btn.disabled = false;
      }
    });
  },

  /* ---------- Navigation & History ---------- */
  goTo(screen, pushState = true) { 
    if (this.transitioning || screen === Model.state.screen) return; 
    this.transitioning = true; 
    this.play(); 

    if (pushState) {
      const url = screen === "home" ? (location.pathname + location.search) : `#${screen}`;
      try {
        history.pushState({ screen }, "", url);
      } catch (_) {}
    }

    View.wipe( 
      () => {                       // mid-wipe: swap screens while covered
        Model.state.screen = screen;
        View.showScreen(screen);
        if (screen === "projects") this.loadProjects();
        if (screen === "skills") this.loadSkills();
      },
      () => { this.transitioning = false; }
    );
  },

  goBack() {
    if (Model.state.screen === "home") return;
    if (history.state && history.state.screen === Model.state.screen && history.length > 1) {
      history.back();
    } else {
      this.goTo("home", true);
    }
  },

  bindHistory() {
    const validScreens = ["home", "projects", "skills", "about", "contact"];
    const hash = location.hash ? location.hash.slice(1).toLowerCase() : "";
    const startScreen = validScreens.includes(hash) ? hash : "home";

    try {
      history.replaceState(
        { screen: startScreen },
        "",
        location.hash || (startScreen === "home" ? location.pathname + location.search : `#${startScreen}`)
      );
    } catch (_) {}

    if (startScreen !== "home") {
      Model.state.screen = startScreen;
      View.showScreen(startScreen);
      if (startScreen === "projects") this.loadProjects();
      if (startScreen === "skills") this.loadSkills();
    }

    window.addEventListener("popstate", e => {
      const targetScreen = (e.state && e.state.screen) || (location.hash ? location.hash.slice(1).toLowerCase() : "home");
      const screenToGo = validScreens.includes(targetScreen) ? targetScreen : "home";

      if (screenToGo === Model.state.screen) return;

      if (this.transitioning) {
        setTimeout(() => this.goTo(screenToGo, false), 350);
        return;
      }

      this.goTo(screenToGo, false);
    });
  },

  select(index) {
    const n = View.els.menuItems.length;
    const next = (index + n) % n;
    if (next !== Model.state.menuIndex) this.play();
    Model.state.menuIndex = next;
    View.setMenuSelection(next);
  },

  /* ---------- Screen data loading ---------- */
  loadProjects() {
    View.renderFeatured(Model.featured);
  },

  loadSkills() {
    if (!Model.state.skillsBuilt) {
      View.renderSkills(Model.skills);
      Model.state.skillsBuilt = true;
    }
    View.animateSkillBars();
  },

  /* ---------- Sound & Mobile Playback Kickstart ---------- */
  play() {
    if (this.audioUnlocked) View.playSelect();
  },

  bindAudioUnlock() {
    const unlock = () => {
      this.audioUnlocked = true;

      const music = document.getElementById("bg-music");
      const button = document.getElementById("audio-toggle");
      const homeArt = document.getElementById("art-home");

      if (music && music.paused) {
        music.volume = 0.4;
        music.play().then(() => {
          if (button) {
            button.textContent = "🔊";
            button.setAttribute("aria-label", "Mute audio");
          }
        }).catch(() => {
          // Playback might be blocked by browser policy or file is empty
        });
      }

      // Ensure home background video starts if mobile browser blocked initial autoplay
      if (homeArt && homeArt.paused) {
        homeArt.muted = true;
        homeArt.play().then(() => {
          document.body.classList.add("has-art-home");
        }).catch(() => {});
      }
    };

    addEventListener("pointerdown", unlock, { once: true, capture: true });
    addEventListener("touchstart", unlock, { once: true, capture: true });
    addEventListener("keydown", unlock, { once: true, capture: true });
  },

  bindAudioButton() {
    const button = document.getElementById("audio-toggle");
    const music = document.getElementById("bg-music");

    if (!button) return;

    button.addEventListener("click", (e) => {
      e.stopPropagation();
      this.audioUnlocked = true;

      const isMuted = button.textContent.includes("🔇");

      if (isMuted) {
        button.textContent = "🔊";
        button.setAttribute("aria-label", "Mute audio");

        if (music) {
          music.muted = false;
          music.volume = 0.4;
          music.play().catch(() => {});
        }
      } else {
        button.textContent = "🔇";
        button.setAttribute("aria-label", "Turn audio on");

        if (music) {
          music.pause();
          music.muted = true;
        }
      }
    });
  },

  /* ---------- Input bindings ---------- */
  bindMenu() {
    View.els.menuItems.forEach((item, i) => {
      item.addEventListener("mouseenter", () => this.select(i));
      item.addEventListener("click", () => this.goTo(item.dataset.target));
    });

    document.querySelectorAll("[data-back]").forEach(b =>
      b.addEventListener("click", () => this.goBack()));

    // Clicking the name takes you back if in a sub-screen
    document.getElementById("big-name").addEventListener("click", () => {
      if (Model.state.screen !== "home") this.goBack();
      else this.play();
    });
  },

  bindKeyboard() {
    addEventListener("keydown", e => {
      if (Model.state.screen === "home") {
        if (e.key === "ArrowDown") { this.select(Model.state.menuIndex + 1); e.preventDefault(); }
        else if (e.key === "ArrowUp") { this.select(Model.state.menuIndex - 1); e.preventDefault(); }
        else if (e.key === "Enter") {
          this.goTo(View.els.menuItems[Model.state.menuIndex].dataset.target);
        }
      } else if (e.key === "Escape") {
        this.goBack();
      }
    });
  },
};

Controller.init();
