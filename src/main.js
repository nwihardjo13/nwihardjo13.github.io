import "./styles.css";

(() => {
  const root = document.getElementById("portfolio-dark-render");
  if (!root) return;

  const revealItems = root.querySelectorAll(".reveal");
  const tocLinks = Array.from(root.querySelectorAll(".toc-link[href^='#']"));
  const sectionIds = ["overview", "projects", "experience", "contact"];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const setActiveLink = (id) => {
    tocLinks.forEach((link) => {
      const target = link.getAttribute("href")?.slice(1);
      link.classList.toggle("is-active", target === id);
    });
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        } else if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          entry.target.classList.remove("is-visible");
        }
      }
    }, { threshold: 0.18 });

    revealItems.forEach((el) => {
      if (!el.classList.contains("is-visible")) {
        observer.observe(el);
      }
    });

    const tocObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveLink(visible.target.id);
    }, { threshold: [0.2, 0.4, 0.6] });

    sections.forEach((section) => tocObserver.observe(section));
  } else {
    revealItems.forEach((el) => el.classList.add("is-visible"));
  }

  const currentHash = window.location.hash.slice(1);
  setActiveLink(sectionIds.includes(currentHash) ? currentHash : "overview");

  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    const status = document.getElementById("contact-status");
    const submitButton = contactForm.querySelector("button[type='submit']");
    const w3FormsAccessKey =
      import.meta.env.VITE_W3FORMS_ACCESS_KEY || import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
    const isW3FormsKey = w3FormsAccessKey?.startsWith("w3f_");

    if (w3FormsAccessKey && !isW3FormsKey) {
      contactForm.action = "https://api.web3forms.com/submit";
      contactForm.method = "POST";
      contactForm.querySelector("input[name='access_key']").value = w3FormsAccessKey;
      contactForm.querySelector("input[name='redirect']").value =
        `${window.location.origin}${window.location.pathname}#contact`;
    }

    const openMailto = ({ name, email, message }) => {
      const subject = encodeURIComponent(
        name ? `Portfolio enquiry from ${name}` : "Portfolio enquiry"
      );
      const body = encodeURIComponent(
        [
          name ? `Name: ${name}` : "",
          email ? `Email: ${email}` : "",
          "",
          message || "Tell me what you're building."
        ].filter(Boolean).join("\n")
      );
      window.location.href = `mailto:wihardjo.nathaniel@gmail.com?subject=${subject}&body=${body}`;
    };

    contactForm.addEventListener("submit", (event) => {
      const formData = new FormData(contactForm);
      const name = formData.get("name")?.toString().trim() ?? "";
      const email = formData.get("email")?.toString().trim() ?? "";
      const message = formData.get("message")?.toString().trim() ?? "";
      const payload = { name, email, message };

      if (!w3FormsAccessKey) {
        event.preventDefault();
        openMailto(payload);
        return;
      }

      if (!isW3FormsKey) {
        return;
      }

      event.preventDefault();
      formData.set("access_key", w3FormsAccessKey);
      formData.set("subject", name ? `Portfolio enquiry from ${name}` : "Portfolio enquiry");
      formData.set("from_name", "Nathaniel Wihardjo Portfolio");

      if (status) status.textContent = "Sending...";
      if (submitButton) submitButton.disabled = true;

      fetch("https://api.w3forms.com/submit", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json"
        }
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`Form service returned ${response.status}`);
          }
          const result = await response.json();
          if (!result.success) {
            throw new Error(result.message || "Form service rejected submission");
          }
          contactForm.reset();
          if (status) status.textContent = "Sent. Thanks.";
        })
        .catch(() => {
          if (status) status.textContent = "Opening email client instead.";
          openMailto(payload);
        })
        .finally(() => {
          if (submitButton) submitButton.disabled = false;
        });
    });
  }

  if (window.lucide?.createIcons) {
    window.lucide.createIcons();
  }
})();
