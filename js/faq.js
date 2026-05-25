/**
 * Watchly FAQ Accordion Logic
 * Gestionează întrebările frecvente și injectarea răspunsurilor.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Lista de răspunsuri care vor fi injectate în HTML
  const faqAnswers = [
    "Watchly is your premium streaming platform offering access to thousands of movies and TV shows. Enjoy unlimited entertainment with high-quality content, personalized recommendations, and seamless viewing experience across all your devices.",
    "Watchly includes movie browsing, trending categories, favorites, rentals, purchases, subscription plans, account tools and secure checkout in one place.",
    "You can watch Watchly on laptops, desktops, tablets and supported smart devices from your browser.",
    "Yes. Watchly is responsive, so you can browse, save, rent and buy movies from your phone.",
    "You can cancel from your account subscription area. Your plan remains available until the end of the paid period."
  ];

  const allFaqItems = document.querySelectorAll('.faq-items-container > div');
  
  // Iconițele folosite pentru stările Plus/Minus
  const ICON_PLUS = '../img/icons/Plus Math.svg';
  const ICON_MINUS = '../img/icons/Subtract.svg';

  allFaqItems.forEach((item, index) => {
    const header = item.querySelector('.faq-header, .faq-header-collapsed');
    const icon = item.querySelector('.faq-toggle-icon');

    if (!header || !icon) return;

    // 1. Injectăm textul răspunsului dacă acesta nu există deja în HTML
    if (!item.querySelector('.faq-answer')) {
      const answerDiv = document.createElement('div');
      answerDiv.className = 'faq-answer';
      // Luăm textul din array-ul de mai sus în funcție de index
      const textContent = faqAnswers[index] || faqAnswers[0];
      answerDiv.innerHTML = `<div class="faq-answer-text">${textContent}</div>`;
      item.appendChild(answerDiv);
    }

    const currentAnswer = item.querySelector('.faq-answer');

    // 2. Setăm starea inițială (primul element e deschis, restul închise)
    if (index === 0) {
      item.classList.add('expanded', 'active');
      if (currentAnswer) currentAnswer.classList.remove('collapsed');
      icon.src = ICON_MINUS;
    } else {
      item.classList.remove('expanded', 'active');
      if (currentAnswer) currentAnswer.classList.add('collapsed');
      icon.src = ICON_PLUS;
    }

    // 3. Funcția care închide toate celelalte elemente
    const closeAllOthers = () => {
      allFaqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove('expanded', 'active');
          
          const otherIcon = otherItem.querySelector('.faq-toggle-icon');
          if (otherIcon) otherIcon.src = ICON_PLUS;
          
          const otherAnswer = otherItem.querySelector('.faq-answer');
          if (otherAnswer) otherAnswer.classList.add('collapsed');
        }
      });
    };

    // 4. Logica de Toggle la click pe header
    header.addEventListener('click', () => {
      const isExpanded = item.classList.contains('expanded');

      // Închidem tot restul înainte de a deschide elementul curent
      closeAllOthers();

      if (!isExpanded) {
        // Dacă era închis, îl deschidem
        item.classList.add('expanded', 'active');
        icon.src = ICON_MINUS;
        if (currentAnswer) currentAnswer.classList.remove('collapsed');
      } else {
        // Dacă era deja deschis, îl închidem
        item.classList.remove('expanded', 'active');
        icon.src = ICON_PLUS;
        if (currentAnswer) currentAnswer.classList.add('collapsed');
      }
    });

    // 5. Permitem click și direct pe iconiță
    icon.addEventListener('click', (e) => {
      e.stopPropagation(); // Evităm declanșarea dublă dacă iconița e în header
      header.click();
    });
  });
});