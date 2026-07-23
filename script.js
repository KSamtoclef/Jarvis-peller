(() => {
  "use strict";

  const config = window.CAMPAIGN_CONFIG;
  if (!config) {
    console.error("CAMPAIGN_CONFIG is missing.");
    return;
  }

  const offerConfig = config.offerUrls;
  const sections = ["intro", "loader", "info", "checking", "share", "claim"];
  const byId = id => document.getElementById(id);
  const onlyDigits = value => String(value || "").replace(/\D/g, "");

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
    const steps = document.querySelector(".steps");
    if (steps) {
      window.scrollTo({ top: steps.offsetTop, behavior: "smooth" });
    }

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
          setActiveStep("share");
          show("share");
        }, 300);
      }
    }, 25);
  });

  byId("whatsapp").addEventListener("click", () => {
    byId("shareFeedback").className = "share-feedback ok";
    byId("shareFeedback").textContent = "WhatsApp has been opened. This website cannot verify how many people you share with. Return here and tap Continue Registration when you are ready.";
    byId("continueShare").style.display = "block";
    window.location.href = "https://wa.me/?text=" + encodeURIComponent(buildShareText());
  });

  byId("continueShare").addEventListener("click", () => {
    setActiveStep("complete");
    show("claim");
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
})();