// --- pricing.js ---

document.addEventListener('DOMContentLoaded', function() {
  
  // === 1. LOGICA PENTRU FAQ (ACORDEON) ===
  // Selectam toate elementele de tip intrebare/raspuns
  const elementeFaq = document.querySelectorAll('.faq-item');
  
  elementeFaq.forEach(articol => {
    const intrebare = articol.querySelector('.faq-question');
    
    if (intrebare) {
      intrebare.addEventListener('click', () => {
        // Inchidem celelalte intrebari daca sunt deschise (pentru aspect curat)
        elementeFaq.forEach(altArticol => {
          if (altArticol !== articol) {
            altArticol.classList.remove('active');
          }
        });
        
        // Deschiem sau inchidem intrebarea pe care s-a dat click
        articol.classList.toggle('active');
      });
    }
  });

  // === 2. COMUTATOR PLATA (LUNAR / ANUAL) ===
  const containerToggle = document.querySelector('.billing-toggle');
  
  if (containerToggle) {
    // Cautam fie butoane, fie input-uri radio (pentru a fi compatibil cu orice varianta de HTML)
    const optiuni = containerToggle.querySelectorAll('button, input[type="radio"]');
    
    optiuni.forEach(optiune => {
      // Ascultam pentru click (la butoane) sau change (la radio-uri)
      const tipEveniment = optiune.tagName === 'INPUT' ? 'change' : 'click';
      
      optiune.addEventListener(tipEveniment, function() {
        // Daca este buton, gestionam clasa 'active' manual
        if (this.tagName === 'BUTTON') {
          optiuni.forEach(b => b.classList.remove('active'));
          this.classList.add('active');
        }
        
        // Preluam valoarea (monthly/yearly)
        // Daca e buton, ne uitam la text, daca e radio, ne uitam la proprietatea 'value'
        let perioada = "";
        if (this.tagName === 'INPUT') {
          perioada = this.value;
        } else {
          perioada = this.textContent.toLowerCase().includes('yearly') ? 'yearly' : 'monthly';
        }
        
        actualizeazaPreturile(perioada);
      });
    });
  }

  // === 3. BUTOANELE DE ABONARE ===
  // Cautam butoanele de subscribe si trimitem userul la inregistrare
  const butoaneAbonare = document.querySelectorAll('.plan-button, .btn-subscribe-plan');
  butoaneAbonare.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Prevenim link-ul gol (#)
      e.preventDefault();
      window.location.href = '../html/cart.html';
    });
  });
});

/**
 * Functie care schimba preturile afisate in carduri
 * @param {string} perioada - poate fi 'monthly' sau 'yearly'
 */
function actualizeazaPreturile(perioada) {
  const carduri = document.querySelectorAll('.plan-card, .pricing-card');
  
  // Definim preturile (exact cum erau in original sau adaptate dupa nevoie)
  const seturiPret = {
    monthly: { starter: '$9.99', pro: '$19.99', premium: '$29.99' },
    yearly: { starter: '$69.99', pro: '$139.99', premium: '$209.99' } // Exemplu cu reducere
  };

  carduri.forEach(card => {
    const elementSuma = card.querySelector('.amount, .plan-price span');
    const elementPerioada = card.querySelector('.period');
    
    if (!elementSuma) return; // Siguranta: daca nu gasim pretul in card, sarim peste

    // Verificam ce tip de card este dupa clasele de stil
    if (card.classList.contains('starter-card') || card.innerText.includes('Gold')) {
      elementSuma.textContent = seturiPret[perioada].starter;
    } else if (card.classList.contains('pro-card') || card.innerText.includes('Diamond')) {
      elementSuma.textContent = seturiPret[perioada].pro;
    } else if (card.classList.contains('premium-card') || card.innerText.includes('Platinum')) {
      elementSuma.textContent = seturiPret[perioada].premium;
    }
    
    // Actualizam textul de sub pret (/month sau /year)
    if (elementPerioada) {
      elementPerioada.textContent = (perioada === 'monthly') ? '/month' : '/year';
    }
  });
}