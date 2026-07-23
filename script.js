(() => {
  "use strict";

  const config = window.CAMPAIGN_CONFIG;
  if (!config) {
    console.error("CAMPAIGN_CONFIG is missing.");
    return;
  }

  const offerConfig = config.offerUrls;
  const storageKey = config.storageKey;
  const sections = ["intro", "loader", "info", "checking", "share", "claim"];
  const byId = id => document.getElementById(id);
  const onlyDigits = value => String(value || "").replace(/\D/g, "");
  let shareProgress = Number(localStorage.getItem(storageKey) || 0);

  const show = id => {
    sections.forEach(name => {
      const section = byId(name);
      if (section) section.style.display = name === id ? "block" : "none";
    });
  };

  function setActiveStep(stepName) {
    document.querySelectorAll(".step").forEach(step => {
      step.classList.toggle("active", step.dataset.step === stepName);
    });
  }

  function startRegistration() {
    setActiveStep("register");
    show("loader");
    window.scrollTo({
      top: document.querySelector(".steps").offsetTop,
      behavior: "smooth"
    });

    let progress = 0;
    byId("num").textContent = "0%";

    const timer = setInterval(() => {
      progress += 1;
      byId("num").textContent = progress + "%";
      if (progress >= 100) {
        clearInterval(timer);
        show("info");
      }
    }, 25);
  }

  function renderShare() {
    shareProgress = Math.max(0, Math.min(100, shareProgress));
    byId("fill2").style.width = shareProgress + "%";
    byId("percentage2").textContent = shareProgress + "%";

    if (shareProgress >= 100) {
      setActiveStep("complete");
      show("claim");
    }
  }

  function buildShareText() {
    const pageUrl = location.href.split("#")[0];
    return [
      "*Wedding Celebration ₦30,000 Cash Giveaway*",
      "",
      "Join our wedding celebration and register for the ₦30,000 Cash Giveaway.",
      "",
      "Register here 👇",
      pageUrl
    ].join("\n");
  }

  const shareSteps = [
    { increment: 50, counted: true },
    { increment: 0, counted: false },
    { increment: 15, counted: true },
    { increment: 5, counted: true },
    { increment: 0, counted: false },
    { increment: 10, counted: true },
    { increment: 5, counted: true },
    { increment: 0, counted: false },
    { increment: 5, counted: true },
    { increment: 3, counted: true },
    { increment: 2, counted: true },
    { increment: 2, counted: true },
    { increment: 1, counted: true },
    { increment: 1, counted: true },
    { increment: 1, counted: true }
  ];

  function setShareFeedback(type, message) {
    const box = byId("shareFeedback");
    box.className = "share-feedback " + type;
    box.textContent = message;
  }

  function openConfiguredUrl(url, fallbackMessage) {
    if (url) {
      window.location.href = url;
    } else {
      alert(fallbackMessage);
    }
  }

  byId("go").addEventListener("click", startRegistration);
  byId("heroGo").addEventListener("click", startRegistration);

  byId("confirm").addEventListener("click", () => {
    const fullName = byId("fullName").value.trim();
    const phoneNumber = onlyDigits(byId("phoneNumber").value);

    if (fullName.length < 3 || phoneNumber.length < 10 || phoneNumber.length > 14) {
      byId("formError").style.display = "block";
      return;
    }

    byId("formError").style.display = "none";
    sessionStorage.setItem("wedding30kName", fullName);
    sessionStorage.setItem("wedding30kPhone", phoneNumber);
    byId("getname").textContent = fullName;
    setActiveStep("verify");
    show("checking");

    let progress = 0;
    const timer = setInterval(() => {
      progress += 1;
      byId("percentage").textContent = progress + "%";
      byId("fill").style.width = progress + "%";

      if (progress >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          renderShare();
          if (shareProgress >= 100) {
            setActiveStep("complete");
            show("claim");
          } else {
            setActiveStep("share");
            show("share");
          }
        }, 300);
      }
    }, 25);
  });

  byId("whatsapp").addEventListener("click", () => {
    const currentStep = Number(localStorage.getItem(storageKey + "Step") || 0);
    const step = shareSteps[Math.min(currentStep, shareSteps.length - 1)];
    localStorage.setItem(storageKey + "Step", String(currentStep + 1));

    if (step.counted) {
      shareProgress = Math.min(100, shareProgress + step.increment);
      localStorage.setItem(storageKey, String(shareProgress));
      setShareFeedback("ok", "Share activity recorded. Return after WhatsApp opens to continue.");
    } else {
      setShareFeedback("fail", "This share attempt was not counted yet. Open WhatsApp, choose another contact or group, then return and try again.");
    }

    renderShare();
    window.location.href = "https://wa.me/?text=" + encodeURIComponent(buildShareText());
  });

  byId("continueButton").addEventListener("click", () => {
    openConfiguredUrl(offerConfig.continueUrl, "Add your CONTINUE URL inside config.js.");
  });

  byId("paymentButton").addEventListener("click", () => {
    openConfiguredUrl(offerConfig.paymentUrl, "Add your payment URL inside config.js.");
  });

  byId("statusButton").addEventListener("click", () => {
    openConfiguredUrl(offerConfig.statusUrl, "Add your status URL inside config.js.");
  });

  const savedName = sessionStorage.getItem("wedding30kName");
  if (savedName) byId("getname").textContent = savedName;
  renderShare();
})();
