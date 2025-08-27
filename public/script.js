// Grab references to each section
const firstSection = document.querySelector('.section--first');
const secondSection = document.querySelector('.section--second');

/**
 * We’ll use IntersectionObserver to detect when
 * the second section is about to enter the viewport.
 *
 * - rootMargin: “0px 0px -50% 0px” means:
 *   “Fire the callback when SECOND-SECTION’s top crosses halfway down the viewport.”
 */
const observerOptions = {
  root: null,                  // viewport
  rootMargin: '0px 0px -60% 0px',
  threshold: 0                 // As soon as any pixel is visible, callback runs
};

function onIntersection(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // SECOND section is halfway into view…
      // Fade out the FIRST section:x
      firstSection.classList.add('is-hidden');
      // Fade in the SECOND section:
      secondSection.classList.add('is-visible');
    } else {
      // If scrolling back up above that threshold…
      firstSection.classList.remove('is-hidden');
      secondSection.classList.remove('is-visible');
    }
  });
}

// Create the observer, watching the second section
const observer = new IntersectionObserver(onIntersection, observerOptions);
observer.observe(secondSection);
 navigator