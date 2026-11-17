
/*
 * Shared Back to Top component.
 *
 * Include this script on any page that needs the control.
 * The component creates its own button and uses the page's
 * main scrolling area.
 */

const BackToTop = {
  threshold: 300,
  button: null,

  init() {
    if (document.getElementById('back-to-top')) {
      return;
    }

    const button = document.createElement('button');

    button.id = 'back-to-top';
    button.className = 'back-to-top';
    button.type = 'button';
    button.hidden = true;
    button.title = 'Back to top';

    button.setAttribute('aria-label', 'Back to top');
    button.textContent = '↑';

    document.body.append(button);
    this.button = button;

    const updateVisibility = () => {
      button.hidden = window.scrollY < this.threshold;
    };

    window.addEventListener(
      'scroll',
      updateVisibility,
      { passive: true }
    );

    button.addEventListener('click', () => {
      const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      window.scrollTo({
        top: 0,
        behavior: reducedMotion ? 'instant' : 'smooth'
      });
    });

    updateVisibility();
  }
};

// Initialize after the document is available.
if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    () => BackToTop.init(),
    { once: true }
  );
} else {
  BackToTop.init();
}
