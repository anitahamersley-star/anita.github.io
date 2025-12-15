// Simple year in footer
document.getElementById("year").textContent = new Date().getFullYear();

// Example placeholder for form submit
const form = document.getElementById("early-access-form");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = form.email.value;
  // TODO: send email to your backend / Formspree / Airtable / Firebase, etc.
  alert(`Thanks! We'll email ${email} when it's ready.`);
  form.reset();
});
