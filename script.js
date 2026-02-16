// ===============================
// ✅ SAFETY: never let JS errors freeze loader
// ===============================
(function () {
  const safe = (fn) => {
    try { fn(); } catch (e) { console.error(e); }
  };

  // Loader + page reveal (kept same behavior, added fallbacks)
  const hideLoader = () => {
    const loader = document.getElementById("loader");
    const page = document.getElementById("page");
    if (loader) loader.classList.add("hide");
    if (page) page.classList.add("ready");
  };

  window.addEventListener("load", () => {
    setTimeout(hideLoader, 900);
  });

  // ✅ Fallbacks if "load" event doesn't fire (rare but happens)
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      // if still visible after 2s, force hide
      const loader = document.getElementById("loader");
      if (loader && !loader.classList.contains("hide")) hideLoader();
    }, 2000);
  });

  // ===============================
  // ✅ Reveal sections on scroll
  // ===============================
  safe(() => {
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) e.target.classList.add("in");
          });
        },
        { threshold: 0.12 }
      );
      document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    } else {
      // old browsers fallback
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
    }
  });

  // ===============================
  // ✅ Skill bars fill
  // ===============================
  safe(() => {
    document.querySelectorAll(".bar-row").forEach((row) => {
      const val = Number(row.getAttribute("data-bar")) || 0;
      const fill = row.querySelector(".bar-fill");
      if (fill) fill.style.width = val + "%";
    });
  });

  // ===============================
  // ✅ Ring progress fallback (ALWAYS shows progress)
  // ===============================
  safe(() => {
    document.querySelectorAll(".stat.ring").forEach((card) => {
      const p = Number(card.getAttribute("data-ring")) || 0;
      card.style.setProperty("--p", p);

      // make sure the ring stroke is visible even if CSS calculates weirdly
      const fg = card.querySelector(".ring-fg");
      if (fg) {
        const C = 289;
        fg.style.strokeDasharray = String(C);
        fg.style.strokeDashoffset = String(C - (C * p) / 100);
      }
    });
  });

  // ===============================
  // ✅ Floating code: randomized positions + endless
  // ===============================
  safe(() => {
    const spans = document.querySelectorAll(".code-bg span");
    spans.forEach((s) => {
      const left = Math.random() * 100;
      const dx = (Math.random() * 180 - 90).toFixed(0) + "px";
      const rot = (Math.random() * 16 - 8).toFixed(1) + "deg";
      const dur = (16 + Math.random() * 18).toFixed(1) + "s";
      const delay = (-Math.random() * 30).toFixed(1) + "s";
      const size = (11 + Math.random() * 5).toFixed(0) + "px";
      const op = (0.35 + Math.random() * 0.45).toFixed(2);

      s.style.left = left + "%";
      s.style.setProperty("--dx", dx);
      s.style.setProperty("--rot", rot);
      s.style.animationDuration = dur;
      s.style.animationDelay = delay;
      s.style.fontSize = size;
      s.style.opacity = op;
    });
  });

  // ===============================
  // ✅ Hire Me modal open/close
  // ===============================
  safe(() => {
    const modal = document.getElementById("hireModal");
    const open1 = document.getElementById("hireOpen");
    const open2 = document.getElementById("hireOpen2");
    const closeBtn = document.getElementById("hireClose");

    const openModal = () => {
      if (!modal) return;
      modal.classList.add("show");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
      if (!modal) return;
      modal.classList.remove("show");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    };

    if (open1) open1.addEventListener("click", openModal);
    if (open2) open2.addEventListener("click", openModal);
    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    // click backdrop close
    modal?.addEventListener("click", (e) => {
      const t = e.target;
      if (t && t.dataset && t.dataset.close === "hire") closeModal();
    });

    // Esc key close
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal?.classList.contains("show")) closeModal();
    });

    // plan buttons -> prefill message + scroll contact
    document.querySelectorAll("[data-hire]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const plan = btn.getAttribute("data-hire") || "plan";
        closeModal();
        const msg = document.getElementById("message");
        if (msg) {
          const textMap = {
            starter: "Hi Deepanshu, I want the Starter plan (₹3,999). My requirement: ",
            pro: "Hi Deepanshu, I want the Pro plan (₹9,999). My requirement: ",
            premium: "Hi Deepanshu, I want the Premium plan (₹24,999+). My requirement: "
          };
          msg.value = textMap[plan] || "Hi Deepanshu, I want to hire you. My requirement: ";
        }
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
      });
    });
  });

  // ===============================
  // ✅ REAL CONTACT FORM BACKEND (kept)
  // ===============================
  const WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycbyFPwTjn59h2etajQbsmFcnP1YLek-fqDSXFh-Jk46s0LPPCkYNHd3Ut1iEa3aDSds9/exec";

  safe(() => {
    const contactForm = document.getElementById("contactForm");
    const statusEl = document.getElementById("formStatus");

    if (contactForm) {
      contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name")?.value.trim();
        const email = document.getElementById("email")?.value.trim();
        const message = document.getElementById("message")?.value.trim();

        if (!name || !email || !message) {
          alert("Please fill all fields.");
          return;
        }

        const btn = contactForm.querySelector("button");
        if (btn) btn.disabled = true;
        if (statusEl) statusEl.textContent = "Sending…";

        try {
          const response = await fetch(WEB_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({
              name,
              email,
              message,
              ua: navigator.userAgent
            })
          });

          const result = await response.json().catch(() => ({}));

          if (result.ok) {
            alert("✅ Message sent successfully!");
            if (statusEl) statusEl.textContent = "✅ Sent successfully!";
            contactForm.reset();
          } else {
            alert("❌ Failed: " + (result.error || "Unknown error"));
            if (statusEl) statusEl.textContent = "❌ Failed to send.";
          }
        } catch (error) {
          console.error(error);
          alert("❌ Error sending message.");
          if (statusEl) statusEl.textContent = "❌ Error sending message.";
        }

        if (btn) btn.disabled = false;
      });
    }
  });
})();
