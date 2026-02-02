chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: fillGigyaForm,
    });
  } catch (error) {
    console.error("Error:", error);
  }
});

async function fillGigyaForm() {
  // Fetch data from API
  async function getFormData() {
    try {
      const response = await fetch(
        "http://localhost:3000/api/search/status?value=N/A",
      );
      const data = await response.json();
      return data;
    } catch (error) {}
  }

  // Get data from API
  const defaults = await getFormData();

  // Fill text inputs
  function fillInput(selector, value) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      if (el && value) {
        el.value = value;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        el.dispatchEvent(new Event("blur", { bubbles: true }));
      }
    });
  }

  // Fill dropdown/select
  function fillSelect(selector, value) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      if (el && value) {
        el.value = value;
        el.dispatchEvent(new Event("change", { bubbles: true }));
        el.dispatchEvent(new Event("blur", { bubbles: true }));
      }
    });
  }

  // Check checkboxes
  function checkBox(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      if (el && !el.checked) {
        el.checked = true;
        el.dispatchEvent(new Event("change", { bubbles: true }));
        el.dispatchEvent(new Event("click", { bubbles: true }));
      }
    });
  }

  // Click submit button
  function clickSubmit() {
    const submitBtn = document.querySelector(
      'input[type="submit"].gigya-input-submit',
    );
    if (submitBtn) {
      submitBtn.click();
    }
  }

  // Fill all fields
  fillInput('input[type="email"], input[name*="email"]', defaults.email);
  fillInput(
    'input[type="password"], input[name*="password"]',
    defaults.password,
  );
  fillInput(
    'input[name*="firstName"], input[name*="first"]',
    defaults.firstName,
  );
  fillInput('input[name*="lastName"], input[name*="last"]', defaults.lastName);
  fillSelect('select[name="profile.country"]', defaults.country);

  // Check checkboxes
  checkBox('input[name="preferences.confirmationAge.isConsentGranted"]');
  checkBox('input[name="preferences.terms.LA2028siteTerms.isConsentGranted"]');

  // Wait for postal code field to appear, fill it, then submit
  setTimeout(() => {
    fillInput('input[name="profile.zip"]', defaults.postalCode);
    // Submit the form after everything is filled
    // setTimeout(() => {
    //   clickSubmit();
    // }, 500);
    fetch("http://localhost:3000/api/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: defaults.email, status: "Used" }),
    });
  }, 500);
}
