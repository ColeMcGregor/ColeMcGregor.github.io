class CertificationsFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="certifications-footer" aria-label="Business certifications">
        <div class="certifications-footer-inner">
          <img
            src="assets/NYS-Certified-Logo.png"
            alt="New York State Certified Service-Disabled Veteran-Owned Business logo"
            class="certification-logo"
            loading="lazy"
          />

          <div class="certification-text">
            <h2>NYS-Certified Service-Disabled Veteran-Owned Business</h2>
            <p>
              McGregor Systems LLC is certified by New York State as a
              Service-Disabled Veteran-Owned Business. This certification reflects
              verified veteran ownership and allows the business to participate in
              applicable New York State SDVOB contracting opportunities.
            </p>
          </div>
        </div>
      </section>
    `;
  }
}

customElements.define("certifications-footer", CertificationsFooter);