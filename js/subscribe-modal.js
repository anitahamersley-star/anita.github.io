import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-functions.js";

// TODO: replace with CalmShare production Firebase config for this site.
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBY5VVFYZlcI7sdgtO16QZUaBPZ4hd8FL8",
  authDomain: "calmshare-dev.firebaseapp.com",
  projectId: "calmshare-dev",
  storageBucket: "calmshare-dev.firebasestorage.app",
  messagingSenderId: "384994574622",
  appId: "1:384994574622:web:8d544160ed85cccbb3090f",
  measurementId: "G-TNX0NWX9FV"
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app, "australia-southeast1");
const startCheckout = httpsCallable(functions, "startCheckout");

const modal = document.getElementById("subscribe-modal");
const form = document.getElementById("subscribe-form");
const planSelect = document.getElementById("subscribe-plan");
const practitionerGroup = document.getElementById("practitioner-count-group");
const practitionerInput = document.getElementById("subscribe-practitioner-count");
const clinicNameInput = document.getElementById("subscribe-clinic-name");
const clinicEmailInput = document.getElementById("subscribe-clinic-email");
const purchaserEmailInput = document.getElementById("subscribe-purchaser-email");
const msg = document.getElementById("subscribe-msg");
const submitBtn = document.getElementById("subscribe-submit");
const planNote = document.getElementById("subscribe-plan-note");

function setMsg(text) {
  if (msg) {
    msg.textContent = text || "";
    msg.classList.toggle("is-error", Boolean(text));
  }
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function toggleClinicFields(plan) {
  if (!practitionerGroup) return;
  const isClinic = plan === "clinic";
  practitionerGroup.style.display = isClinic ? "" : "none";
  if (!isClinic && practitionerInput) {
    practitionerInput.value = "";
  } else if (isClinic && practitionerInput && !practitionerInput.value) {
    practitionerInput.value = "5";
  }
}

function updatePlanNote(plan) {
  if (!planNote) return;
  const label = plan === "clinic" ? "Clinic plan selected." : "Solo plan selected.";
  planNote.textContent = label;
}

function openModal(plan) {
  if (!modal) return;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  if (planSelect) {
    planSelect.value = plan || planSelect.value || "solo";
    toggleClinicFields(planSelect.value);
    updatePlanNote(planSelect.value);
    planSelect.focus();
  }
  setMsg("");
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  setMsg("");
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = "Start checkout";
  }
}

document.querySelectorAll("[data-open-subscribe]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const plan = btn.getAttribute("data-plan");
    openModal(plan);
  });
});

modal?.addEventListener("click", (event) => {
  const target = event.target;
  if (target && (target === modal || target.hasAttribute("data-close-subscribe"))) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal?.classList.contains("is-open")) {
    closeModal();
  }
});

planSelect?.addEventListener("change", (event) => {
  toggleClinicFields(event.target.value);
  updatePlanNote(event.target.value);
});

const initialPlan = planSelect?.value || "solo";
toggleClinicFields(initialPlan);
updatePlanNote(initialPlan);

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMsg("");

  const plan = planSelect?.value || "solo";
  const clinicName = clinicNameInput?.value.trim();
  const clinicEmail = clinicEmailInput?.value.trim();
  const purchaserEmail = purchaserEmailInput?.value.trim();

  if (!plan || !clinicName || !clinicEmail || !purchaserEmail) {
    setMsg("Please complete all required fields.");
    return;
  }

  if (!isValidEmail(clinicEmail)) {
    setMsg("Enter a valid clinic email address.");
    return;
  }

  if (!isValidEmail(purchaserEmail)) {
    setMsg("Enter a valid purchaser email address.");
    return;
  }

  const payload = { plan, clinicName, clinicEmail, purchaserEmail };
  if (plan === "clinic") {
    const practitionerCount = parseInt(practitionerInput?.value || "", 10);
    if (!Number.isFinite(practitionerCount) || practitionerCount < 1) {
      setMsg("Enter the number of practitioners for the clinic plan.");
      return;
    }
    payload.practitionerCount = practitionerCount;
  } else {
    payload.practitionerCount = null;
  }

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Starting checkout...";
    }

    const res = await startCheckout(payload);
    const url = res?.data?.url;
    if (!url) {
      throw new Error("Checkout link was not returned.");
    }

    window.location.assign(url);
  } catch (error) {
    console.error(error);
    setMsg(error?.message || "Checkout failed. Please try again.");
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Start checkout";
    }
  }
});
