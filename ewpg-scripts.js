/**
 * EWPG Bundesverband – Main Application Script
 * =============================================
 * Single-page site logic: i18n, scroll effects, form handling,
 * animations, and the hero node-network visualization.
 *
 * Architecture:
 *   - IIFE wrapping for zero global pollution
 *   - All DOM queries cached at initialization
 *   - RAF-throttled scroll handlers for 60 fps
 *   - IntersectionObserver for lazy reveals & counters
 *   - Respects prefers-reduced-motion throughout
 *
 * @version 3.0.0
 * @license MIT
 */
(function () {
  'use strict';

  /* ── Configuration ──────────────────────────────── */
  /** @const {number} NAV_OFFSET Scroll offset for anchor navigation (matches --nav-height) */
  var NAV_OFFSET = 72;
  /** @const {number} LOADER_DELAY_MS Delay before hiding the loader overlay */
  var LOADER_DELAY_MS = 500;
  /** @const {number} SCROLL_SPY_OFFSET Extra pixels for scroll-spy section detection */
  var SCROLL_SPY_OFFSET = 120;
  /** @const {number} BACK_TO_TOP_THRESHOLD Scroll distance before back-to-top appears */
  var BACK_TO_TOP_THRESHOLD = 500;

  /**
   * i18n — Trilingual translations (DE / EN / FR)
   * Each key maps to a `data-i18n` attribute in the DOM.
   * Values containing HTML (e.g. `<em>`, `<br>`) are applied via innerHTML.
   */
  var translations = {
    'nav-members': { de: 'Mitgliedsunternehmen', en: 'Member Companies', fr: 'Entreprises membres' },
    'nav-about': { de: 'Über uns', en: 'About Us', fr: '\u00C0 propos' },
    'nav-opinion': { de: 'Meinung', en: 'Opinion', fr: 'Opinion' },
    'nav-contact': { de: 'Kontakt', en: 'Contact', fr: 'Contact' },
    'hero-org': { de: 'Bundesverband für elektronische Wertpapiere e.V.', en: 'Federal Association for Electronic Securities (Bundesverband für elektronische Wertpapiere e.V.)', fr: 'Association f\u00e9d\u00e9rale pour les titres \u00e9lectroniques (Bundesverband für elektronische Wertpapiere e.V.)' },
    'hero-title': { de: 'Elektro\u00ADnische Wertpapiere <em>im Blick</em>', en: 'Electronic Securities <em>in Focus</em>', fr: 'Titres \u00e9lectro\u00ADniques <em>en vue</em>' },
    'hero-em': { de: 'im Blick', en: 'in Focus', fr: 'en vue' },
    'hero-subtitle': { de: 'Wir stehen für die Verbesserung der maßgeblichen Rahmenbedingungen für elektronische Wertpapiere.', en: 'We stand for improving the key regulatory framework for electronic securities.', fr: 'Nous nous engageons pour l\u2019am\u00e9lioration du cadre r\u00e9glementaire d\u00e9terminant applicable aux titres \u00e9lectroniques.' },
    'hero-about': { de: 'Über uns', en: 'About Us', fr: '\u00C0 propos' },
    'hero-contact-btn': { de: 'Kontakt aufnehmen', en: 'Contact Us', fr: 'Nous contacter' },
    'hero-badge': { de: 'Mitglieds-<br>unternehmen', en: 'Member<br>Companies', fr: 'Entreprises<br>membres' },
    'hero-scroll': { de: 'Scroll', en: 'Scroll', fr: 'D\u00e9filer' },
    'members-label': { de: 'Mitgliedsunternehmen', en: 'Member Companies', fr: 'Entreprises membres' },
    'members-title': { de: 'Partner', en: 'Partners', fr: 'Partenaires' },
    'members-subtitle': { de: 'Führende Unternehmen der Branche gestalten gemeinsam die Zukunft elektronischer Wertpapiere.', en: 'Leading companies in the industry are jointly shaping the future of electronic securities.', fr: 'Des entreprises de premier plan du secteur fa\u00e7onnent ensemble l\u2019avenir des titres \u00e9lectroniques.' },
    'about-label': { de: 'Über uns', en: 'About Us', fr: '\u00C0 propos' },
    'about-title': { de: 'Vereins\u00ADzweck', en: 'Purpose of the Association', fr: 'Objet de l\u2019asso\u00ADciation' },
    'about-lead': { de: 'Der Bundesverband für elektronische Wertpapiere e.V. wurde im April 2023 gegründet.', en: 'The Federal Association for Electronic Securities (Bundesverband für elektronische Wertpapiere e.V.) was founded in April 2023.', fr: 'L\u2019Association f\u00e9d\u00e9rale pour les titres \u00e9lectroniques (Bundesverband für elektronische Wertpapiere e.V.) a \u00e9t\u00e9 fond\u00e9e en avril 2023.' },
    'about-body': { de: 'Zweck des Verbandes ist Steigerung des Bekanntheitsgrades und der Akzeptanz elektronischer Wertpapiere nach dem Gesetz über elektronische Wertpapiere (eWpG) und dabei insbesondere von Kryptowertpapieren, und die Förderung der Interessen der an der Emission elektronischer Wertpapiere beteiligten Personen und Unternehmen, um auf diese Weise das Wertpapierrecht zu modernisieren und damit den Finanzplatz Deutschland zu stärken. Die Kryptowertpapierregisterführung ist eine nach nach § 1 Absatz 1a Nr. 8 KWG in Verbindung mit § 32 Absatz 1 KWG erlaubnispflichtige Finanzdienstleistung. Zuständig für die Erteilung der Erlaubnis ist die Bundesanstalt für Finanzdienstleistungsaufsicht.', en: 'The purpose of the association is to increase awareness and acceptance of electronic securities under the Electronic Securities Act (Gesetz über elektronische Wertpapiere \u2013 eWpG), and in particular of crypto securities, and to promote the interests of individuals and companies involved in the issuance of electronic securities, in order to modernize securities law and thereby strengthen Germany as a financial center. The keeping of crypto securities registers is a financial service requiring a license pursuant to Section 1(1a) No. 8 of the Banking Act (Kreditwesengesetz \u2013 KWG) in conjunction with Section 32(1) KWG. The authority responsible for granting the license is the Federal Financial Supervisory Authority (Bundesanstalt für Finanzdienstleistungsaufsicht \u2013 BaFin).', fr: 'L\u2019objet de l\u2019association est d\u2019accro\u00eetre la notori\u00e9t\u00e9 et l\u2019acceptation des titres \u00e9lectroniques au sens de la loi sur les titres \u00e9lectroniques (Gesetz über elektronische Wertpapiere \u2013 eWpG), et en particulier des crypto-titres, et de promouvoir les int\u00e9r\u00eats des personnes et entreprises participant \u00e0 l\u2019\u00e9mission de titres \u00e9lectroniques, afin de moderniser le droit des valeurs mobili\u00e8res et de renforcer ainsi la place financi\u00e8re allemande. La tenue de registres de crypto-titres est un service financier soumis \u00e0 autorisation en vertu du \u00a7\u00a01, alin\u00e9a\u00a01a, n\u00b0\u00a08 de la loi bancaire (Kreditwesengesetz \u2013 KWG) en liaison avec le \u00a7\u00a032, alin\u00e9a\u00a01 KWG. L\u2019autorit\u00e9 comp\u00e9tente pour la d\u00e9livrance de l\u2019autorisation est l\u2019Autorit\u00e9 f\u00e9d\u00e9rale de surveillance financi\u00e8re (Bundesanstalt für Finanzdienstleistungsaufsicht \u2013 BaFin).' },
    'about-body-2': { de: 'Wir setzen uns insbesondere für die Verbesserung der maßgeblichen Rahmenbedingungen für elektronische Wertpapiere ein, treten aktiv für die Verbesserung der maßgeblichen Rahmenbedingungen für elektronische Wertpapiere und die Belange von an der Emission elektronischer Wertpapiere beteiligter Personen und Unternehmen und in Dialog mit Politik, Gesetzgebungsorganen, Aufsichtsbehörden, Institutionen des Kapitalmarkts, Interessenverbänden und der Öffentlichkeit ein, fördern den regelmäßigen fachlichen Austausch unserer Mitglieder untereinander und informieren diese über laufende Konsultationsverfahren und koordinieren etwaige gemeinsame Stellungnahmen im Rahmen solcher Konsultationsverfahren.', en: 'We are particularly committed to improving the key regulatory framework for electronic securities, actively advocating for the improvement of the key regulatory framework for electronic securities and the interests of individuals and companies involved in the issuance of electronic securities, and engaging in dialogue with policymakers, legislative bodies, regulatory authorities, capital markets institutions, industry associations, and the public, promoting regular professional exchange among our members, keeping them informed about ongoing consultation procedures, and coordinating any joint position papers in the context of such consultation procedures.', fr: 'Nous nous engageons en particulier pour l\u2019am\u00e9lioration du cadre r\u00e9glementaire d\u00e9terminant applicable aux titres \u00e9lectroniques, intervenons activement en faveur de l\u2019am\u00e9lioration du cadre r\u00e9glementaire d\u00e9terminant applicable aux titres \u00e9lectroniques et des int\u00e9r\u00eats des personnes et entreprises participant \u00e0 l\u2019\u00e9mission de titres \u00e9lectroniques, et dialoguons avec les responsables politiques, les organes l\u00e9gislatifs, les autorit\u00e9s de surveillance, les institutions du march\u00e9 des capitaux, les associations professionnelles et le public, favorisons l\u2019\u00e9change professionnel r\u00e9gulier entre nos membres, les informons des proc\u00e9dures de consultation en cours et coordonnons les \u00e9ventuelles prises de position communes dans le cadre de ces proc\u00e9dures de consultation.' },
    'about-founded': { de: 'Gegründet', en: 'Founded', fr: 'Fond\u00e9e' },
    'about-members': { de: 'Mitglieder', en: 'Members', fr: 'Membres' },
    'about-location': { de: 'Standort', en: 'Location', fr: 'Si\u00e8ge' },
    'board-label': { de: 'Vorstand', en: 'Board of Directors', fr: 'Directoire' },
    'board-title': { de: 'Unser Vorstand', en: 'Our Board of Directors', fr: 'Notre directoire' },
    'board-intro': { de: 'Unser Vorstand besteht aus drei Mitgliedern:', en: 'Our board of directors consists of three members:', fr: 'Notre directoire se compose de trois membres\u00a0:' },
    'board-ceo': { de: 'Vorstandsvorsitzender', en: 'Chairman of the Board', fr: 'Pr\u00e9sident du directoire' },
    'board-vice': { de: 'Stellv. Vorstandsvorsitzender', en: 'Deputy Chairman of the Board', fr: 'Vice-pr\u00e9sident du directoire' },
    'board-member': { de: 'Vorstandsmitglied', en: 'Board Member', fr: 'Membre du directoire' },
    'pub-label': { de: 'Meinung', en: 'Opinion', fr: 'Opinion' },
    'pub-title': { de: 'Stellungnahmen, News & Standards', en: 'Position Papers, News & Standards', fr: 'Prises de position, actualit\u00e9s & standards' },
    'pub-subtitle': { de: 'Unsere Positionen zu regulatorischen Entwicklungen und technischen Standards.', en: 'Our positions on regulatory developments and technical standards.', fr: 'Nos positions sur les \u00e9volutions r\u00e9glementaires et les standards techniques.' },
    'pub-cat-statements': { de: 'Stellungnahmen', en: 'Position Papers', fr: 'Prises de position' },
    'pub-cat-news': { de: 'News', en: 'News', fr: 'Actualit\u00e9s' },
    'pub-cat-standard': { de: 'Tokenstandard', en: 'Token Standard', fr: 'Standard de jetons' },
    'pub-cat-media': { de: 'Medien', en: 'Media', fr: 'M\u00e9dias' },
    'pub-badge-statement': { de: 'Stellungnahme', en: 'Position Paper', fr: 'Prise de position' },
    'pub-badge-news': { de: 'News', en: 'News', fr: 'Actualit\u00e9s' },
    'pub-badge-standard': { de: 'Standard', en: 'Standard', fr: 'Standard' },
    'pub-badge-media': { de: 'Medien', en: 'Media', fr: 'M\u00e9dias' },
    'pub-title-brubeg': { de: 'Referentenentwurf eines Bankenrichtlinienumsetzungs- und B\u00fcrokratieentlastungsgesetzes (BRUBEG)', en: 'Draft Bill on the Transposition of the Banking Directive and Reduction of Bureaucracy (BRUBEG)', fr: 'Projet de loi sur la transposition de la directive bancaire et la r\u00e9duction de la bureaucratie (BRUBEG)' },
    'pub-title-dataact': { de: 'Stellungnahme zur Erw\u00e4hnung von Smart Contracts im Data Act', en: 'Statement on the Mention of Smart Contracts in the Data Act', fr: 'Prise de position sur la mention des contrats intelligents dans le Data Act' },
    'pub-title-zufing': { de: 'Referentenentwurf des Zukunfts\u00ADfinanzierungs\u00ADgesetztes', en: 'Draft of the Future Financing Act', fr: 'Projet de loi sur le financement de l\u2019avenir' },
    'pub-title-euparlament': { de: 'Vorschlag des Europ\u00e4ischen Parlaments und des Rates', en: 'Proposal of the European Parliament and of the Council', fr: 'Proposition du Parlement europ\u00e9en et du Conseil' },
    'pub-title-confirms': { de: 'Bundesverband f\u00fcr elektronische Wertpapiere best\u00e4tigt zwei eWpG-konforme Implementierungen seines technischen Standards', en: 'German Association for Electronic Securities Confirms two eWpG-Compliant Implementations under its Technical Standard', fr: 'L\u2019Association f\u00e9d\u00e9rale pour les titres \u00e9lectroniques confirme deux impl\u00e9mentations conformes \u00e0 l\u2019eWpG de son standard technique' },
    'pub-title-mv-standard': { de: 'Mitgliederversammlung des Bundesverbandes der Kryptowertpapierregisterf\u00fchrer beschlie\u00dft technischen Standard f\u00fcr Kryptowertpapiere', en: 'General Assembly of the Federal Association of Crypto Securities Register Operators Adopts Technical Standard for Crypto Securities', fr: 'L\u2019assembl\u00e9e g\u00e9n\u00e9rale de l\u2019Association f\u00e9d\u00e9rale des teneurs de registres de crypto-titres adopte un standard technique pour les crypto-titres' },
    'pub-title-tokenstandard': { de: 'Technischer Standard f\u00fcr tokenbasierte Kryptowertpapiere', en: 'Technical Standard for Token-Based Crypto Securities', fr: 'Standard technique pour les crypto-titres tokenis\u00e9s' },
    'pub-title-interview': { de: 'Interview \u2018Konstruktive Kryptoregulierung\u2019', en: 'Interview \u2018Constructive Crypto Regulation\u2019', fr: 'Interview \u00ab R\u00e9gulation constructive des cryptoactifs \u00bb' },
    'cta-badge': { de: 'Gemeinsam den Finanzplatz<br>Deutschland stärken', en: 'Together, Strengthening Germany<br>as a Financial Center', fr: 'Ensemble, renforcer la place<br>financi\u00e8re allemande' },
    'cta-label': { de: 'Mitglied werden', en: 'Become a Member', fr: 'Devenir membre' },
    'cta-title': { de: 'Werden Sie Teil des Verbands', en: 'Become Part of the Association', fr: 'Rejoignez l\u2019association' },
    'cta-subtitle': { de: 'Gestalten Sie die Zukunft elektronischer Wertpapiere aktiv mit – als Mitglied im Bundesverband für elektronische Wertpapiere e.V.', en: 'Actively help shape the future of electronic securities \u2013 as a member of the Federal Association for Electronic Securities (Bundesverband für elektronische Wertpapiere e.V.).', fr: 'Contribuez activement \u00e0 fa\u00e7onner l\u2019avenir des titres \u00e9lectroniques \u2013 en tant que membre de la Association f\u00e9d\u00e9rale pour les titres \u00e9lectroniques (Bundesverband für elektronische Wertpapiere e.V.).' },
    'cta-contact': { de: 'Kontakt aufnehmen', en: 'Contact Us', fr: 'Nous contacter' },
    'cta-learn': { de: 'Mehr erfahren', en: 'Learn More', fr: 'En savoir plus' },
    'contact-label': { de: 'Kontakt', en: 'Contact', fr: 'Contact' },
    'contact-title': { de: 'Sprechen Sie uns an', en: 'Get in Touch', fr: 'Contactez-nous' },
    'contact-address': { de: 'Adresse', en: 'Address', fr: 'Adresse' },
    'contact-address-value': {
      de: '<a href="https://www.google.com/maps/search/?api=1&query=Magnusstra%C3%9Fe+13%2C+50672+K%C3%B6ln" target="_blank" rel="noopener noreferrer">Bundesverband f\u00fcr elektronische<br>Wertpapiere e.V.<br>c/o Heuking K\u00fchn L\u00fcer Wojtek PartGmbB<br>Magnusstra\u00dfe 13, 50672 K\u00f6ln</a>',
      en: '<a href="https://www.google.com/maps/search/?api=1&query=Magnusstra%C3%9Fe+13%2C+50672+K%C3%B6ln" target="_blank" rel="noopener noreferrer">Bundesverband f\u00fcr elektronische<br>Wertpapiere e.V.<br>c/o Heuking K\u00fchn L\u00fcer Wojtek PartGmbB<br>Magnusstra\u00dfe 13, 50672 K\u00f6ln, Germany</a>',
      fr: '<a href="https://www.google.com/maps/search/?api=1&query=Magnusstra%C3%9Fe+13%2C+50672+K%C3%B6ln" target="_blank" rel="noopener noreferrer">Bundesverband f\u00fcr elektronische<br>Wertpapiere e.V.<br>c/o Heuking K\u00fchn L\u00fcer Wojtek PartGmbB<br>Magnusstra\u00dfe 13, 50672 K\u00f6ln, Allemagne</a>'
    },
    'contact-phone': { de: 'Telefon', en: 'Phone', fr: 'T\u00e9l\u00e9phone' },
    'contact-phone-value': {
      de: '<a href="tel:+4922120522220">0221 20 52-220</a>',
      en: '<a href="tel:+4922120522220">+49 221 20 52-220</a>',
      fr: '<a href="tel:+4922120522220">+49 221 20 52-220</a>'
    },
    'contact-fax': { de: 'Fax', en: 'Fax', fr: 'Fax' },
    'contact-fax-value': {
      de: '<a href="tel:+49221205201">0221 20 52-1</a>',
      en: '<a href="tel:+49221205201">+49 221 20 52-1</a>',
      fr: '<a href="tel:+49221205201">+49 221 20 52-1</a>'
    },
    'contact-email': { de: 'E-Mail', en: 'Email', fr: 'E-mail' },
    'vcard-download': { de: 'Kontakt speichern', en: 'Save Contact', fr: 'Enregistrer le contact' },
    'form-firstname': { de: 'Vorname*', en: 'First Name*', fr: 'Pr\u00e9nom*' },
    'form-lastname': { de: 'Nachname*', en: 'Last Name*', fr: 'Nom*' },
    'form-email': { de: 'E-Mail*', en: 'Email*', fr: 'E-mail*' },
    'form-phone': { de: 'Telefon', en: 'Phone', fr: 'T\u00e9l\u00e9phone' },
    'form-subject': { de: 'Betreff', en: 'Subject', fr: 'Objet' },
    'form-message': { de: 'Nachricht*', en: 'Message*', fr: 'Message*' },
    'form-consent': { de: '* Ich erkläre mich mit der Verarbeitung der eingegebenen Daten sowie der über den Link unten auf dieser Seite aufrufbaren Datenschutzerklärung einverstanden.', en: '* I consent to the processing of the data entered and to the privacy policy accessible via the link at the bottom of this page.', fr: '* Je consens au traitement des donn\u00e9es saisies ainsi qu\u2019\u00e0 la politique de confidentialit\u00e9 accessible via le lien en bas de cette page.' },
    'form-submit': { de: 'Absenden', en: 'Submit', fr: 'Envoyer' },
    'form-success': { de: '<strong>Vielen Dank</strong><br>Ihre Nachricht wurde gesendet.<br><br>Wir werden uns in Kürze bei Ihnen melden.', en: '<strong>Thank You</strong><br>Your message has been sent.<br><br>We will be in touch shortly.', fr: '<strong>Merci beaucoup</strong><br>Votre message a \u00e9t\u00e9 envoy\u00e9.<br><br>Nous vous recontacterons dans les meilleurs d\u00e9lais.' },
    'form-error': { de: 'Oh, da ist etwas schief gelaufen. Bitte versuchen Sie es noch einmal oder schreiben Sie uns eine E-Mail an <a href="mailto:info@ewpg.de">info@ewpg.de</a>. Vielen Dank.', en: 'Oh, something went wrong. Please try again or send us an email at <a href="mailto:info@ewpg.de">info@ewpg.de</a>. Thank you.', fr: 'Oh, une erreur s\u2019est produite. Veuillez r\u00e9essayer ou nous envoyer un e-mail \u00e0 <a href="mailto:info@ewpg.de">info@ewpg.de</a>. Merci.' },
    'back-to-top': { de: 'Nach oben scrollen', en: 'Scroll to top', fr: 'Retour en haut' },
    'footer-copyright': { de: '\u00A9 ' + new Date().getFullYear() + ' Bundesverband f\u00fcr elektronische Wertpapiere e. V.', en: '\u00A9 ' + new Date().getFullYear() + ' Federal Association for Electronic Securities (Bundesverband f\u00fcr elektronische Wertpapiere e. V.)', fr: '\u00A9 ' + new Date().getFullYear() + ' Association f\u00e9d\u00e9rale pour les titres \u00e9lectroniques (Bundesverband f\u00fcr elektronische Wertpapiere e. V.)' },
    'footer-imprint': { de: 'Impressum', en: 'Legal Notice', fr: 'Mentions l\u00e9gales' },
    'footer-privacy': { de: 'Datenschutzerklärung', en: 'Privacy Policy', fr: 'Politique de confidentialit\u00e9' },
    'modal-imprint-title': { de: 'Impressum', en: 'Legal Notice', fr: 'Mentions l\u00e9gales' },
    'modal-privacy-title': { de: 'Datenschutzerklärung', en: 'Privacy Policy', fr: 'Politique de confidentialit\u00e9' }
  };

  /* ── i18n Engine ─────────────────────────────────── */
  /** @type {'de'|'en'|'fr'} Current active language */
  var currentLang = 'de';
  try {
    var saved = localStorage.getItem('ewpg-lang');
    if (saved === 'en' || saved === 'de' || saved === 'fr') {
      currentLang = saved;
    }
  } catch (e) { /* localStorage unavailable in private browsing — fall back to 'de' */ }

  /**
   * Apply a language to all `[data-i18n]` elements on the page.
   * Persists choice to localStorage. Updates `<html lang>` attribute.
   * @param {'de'|'en'|'fr'} lang — ISO language key
   */
  function applyLanguage(lang) {
    currentLang = lang;
    try {
      localStorage.setItem('ewpg-lang', lang);
    } catch (e) { /* private browsing */ }
    var langMap = { de: 'de-DE', en: 'en-US', fr: 'fr-FR' };
    document.documentElement.setAttribute('lang', langMap[lang] || 'de-DE');

    var elements = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      var key = el.getAttribute('data-i18n');
      if (translations[key]) {
        var text = translations[key][lang];
        if (text.indexOf('<') !== -1) {
          el.innerHTML = text;
        } else {
          el.textContent = text;
        }
      }
    }

    var ariaElements = document.querySelectorAll('[data-i18n-aria]');
    for (var j = 0; j < ariaElements.length; j++) {
      var ariaEl = ariaElements[j];
      var ariaKey = ariaEl.getAttribute('data-i18n-aria');
      if (translations[ariaKey]) {
        ariaEl.setAttribute('aria-label', translations[ariaKey][lang]);
      }
    }

    var langBtns = document.querySelectorAll('.lang-switch__btn');
    for (var k = 0; k < langBtns.length; k++) {
      var btn = langBtns[k];
      var btnLang = btn.getAttribute('data-lang');
      if (btnLang === lang) {
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-pressed', 'false');
      }
    }
  }

  var langSwitch = document.getElementById('langSwitch');
  if (langSwitch) {
    var langBtns = langSwitch.querySelectorAll('.lang-switch__btn');
    for (var l = 0; l < langBtns.length; l++) {
      langBtns[l].addEventListener('click', function () {
        var lang = this.getAttribute('data-lang');
        applyLanguage(lang);
      });
    }
  }

  applyLanguage(currentLang);

  /**
   * Hide loader overlay once all resources are ready.
   * Uses a short delay for perceived smoothness.
   */
  window.addEventListener('load', function () {
    setTimeout(function () {
      document.getElementById('loader').classList.add('is-hidden');
    }, LOADER_DELAY_MS);
  });

  /* ── Cached DOM References ───────────────────────── */
  var progressBar = document.getElementById('progressBar');
  var nav = document.getElementById('nav');
  var backToTop = document.getElementById('backToTop');
  var heroBg = document.querySelector('.hero__bg img');
  var heroEl = document.querySelector('.hero');
  var spySections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav__menu a[href^="#"]:not(.nav__cta)');

  /* ── Unified Scroll Handler (single RAF-throttled listener) ── */
  var scrollTicking = false;
  var supportsScrollTimeline = CSS.supports && CSS.supports('animation-timeline', 'scroll()');

  function onScroll() {
    var scrollY = window.scrollY;
    var docH = document.documentElement.scrollHeight - window.innerHeight;

    /* Progress bar */
    var pct = docH > 0 ? (scrollY / docH * 100) : 0;
    progressBar.style.width = pct + '%';
    progressBar.setAttribute('aria-valuenow', Math.round(pct));

    /* Nav shadow */
    nav.classList.toggle('is-scrolled', scrollY > 10);

    /* Back-to-top visibility */
    if (backToTop) {
      backToTop.classList.toggle('is-visible', scrollY > BACK_TO_TOP_THRESHOLD);
    }

    /* Scroll-spy */
    var scrollPos = scrollY + SCROLL_SPY_OFFSET;
    var current = '';
    for (var s = 0; s < spySections.length; s++) {
      if (spySections[s].offsetTop <= scrollPos) {
        current = spySections[s].getAttribute('id');
      }
    }
    for (var nl = 0; nl < navLinks.length; nl++) {
      var href = navLinks[nl].getAttribute('href');
      navLinks[nl].classList.toggle('is-active', href === '#' + current);
    }

    /* Hero parallax (JS fallback — skip if CSS scroll-timeline is supported) */
    if (heroBg && !supportsScrollTimeline) {
      var heroH = heroEl.offsetHeight;
      if (scrollY < heroH) {
        heroBg.style.transform = 'scale(1.05) translateY(' + (scrollY * 0.15) + 'px)';
      }
    }

    scrollTicking = false;
  }

  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      requestAnimationFrame(onScroll);
      scrollTicking = true;
    }
  }, { passive: true });
  onScroll();

  /* ── Mobile Menu ─────────────────────────────────── */
  var mobileMenu = document.getElementById('mobileMenu');
  var burgerBtn = document.getElementById('burgerBtn');
  var closeBtn = document.getElementById('mobileMenuClose');
  function openMobileMenu() {
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    burgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    var firstLink = mobileMenu.querySelector('a');
    if (firstLink) firstLink.focus();
  }
  function closeMobileMenu() {
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    burgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  burgerBtn.addEventListener('click', openMobileMenu);
  closeBtn.addEventListener('click', closeMobileMenu);
  var mobileLinks = mobileMenu.querySelectorAll('a');
  for (var i = 0; i < mobileLinks.length; i++) {
    mobileLinks[i].addEventListener('click', closeMobileMenu);
  }

  /* ── Focus Trap (WCAG 2.2 compliant) ────────────── */
  mobileMenu.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var focusable = mobileMenu.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    var first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  /* ── Scroll Reveal (IntersectionObserver) ────────── */
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -48px 0px' });
  var revealElements = document.querySelectorAll('.reveal, .stagger-children');
  for (var j = 0; j < revealElements.length; j++) {
    observer.observe(revealElements[j]);
  }

  /* ── Animated Counters (easeOutExpo) ─────────────── */
  /** easeOutExpo — EWPG Motion Identity signature easing for counters */
  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }
  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10);
        var suffix = el.getAttribute('data-suffix') || '';
        if (isNaN(target)) return;
        var duration = 2200;
        var start = performance.now();
        var startVal = 0;
        function tick(now) {
          var elapsed = now - start;
          var progress = Math.min(elapsed / duration, 1);
          var eased = easeOutExpo(progress);
          var current = Math.round(startVal + (target - startVal) * eased);
          el.textContent = current + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  var counters = document.querySelectorAll('[data-count]');
  for (var c = 0; c < counters.length; c++) {
    counterObserver.observe(counters[c]);
  }

  /* ── Smooth Anchor Scrolling ─────────────────────── */
  var anchors = document.querySelectorAll('a[href^="#"]');
  for (var k = 0; k < anchors.length; k++) {
    anchors[k].addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      var target = document.querySelector(href);
      if (target) {
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.pageYOffset - NAV_OFFSET,
          behavior: 'smooth'
        });
      }
    });
  }

  /* ── vCard Download ─────────────────────────────── */
  var vcardBtn = document.getElementById('vcardDownload');
  if (vcardBtn) {
    vcardBtn.addEventListener('click', function () {
      var vcard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'N:;;;;',
        'FN:Bundesverband für elektronische Wertpapiere e.V.',
        'ORG:Bundesverband für elektronische Wertpapiere e.V.',
        'ADR;TYPE=WORK:;;Magnusstraße 13;Köln;;50672;Germany',
        'TEL;TYPE=WORK,VOICE:+49 221 20 52-220',
        'TEL;TYPE=WORK,FAX:+49 221 20 52-1',
        'EMAIL;TYPE=WORK:info@ewpg.de',
        'URL:https://www.ewpg.de',
        'NOTE:c/o Heuking Kühn Lüer Wojtek PartGmbB',
        'END:VCARD'
      ].join('\r\n');
      var blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'EWPG-Kontakt.vcf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  /* ── Modal Management ────────────────────────────── */
  var lastFocusedEl = null;
  function openModal(id) {
    lastFocusedEl = document.activeElement;
    var modal = document.getElementById(id);
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    var focusable = modal.querySelector('button, [href], input');
    if (focusable) focusable.focus();
    modal.addEventListener('keydown', trapFocus);
  }
  function closeModal(id) {
    var modal = document.getElementById(id);
    modal.classList.remove('is-open');
    modal.removeEventListener('keydown', trapFocus);
    document.body.style.overflow = '';
    if (lastFocusedEl) lastFocusedEl.focus();
  }
  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    var modal = e.currentTarget.querySelector('.modal');
    var els = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    var first = els[0], last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  document.getElementById('openImprint').addEventListener('click', function (e) {
    e.preventDefault();
    openModal('imprintModal');
  });
  document.getElementById('openPrivacy').addEventListener('click', function (e) {
    e.preventDefault();
    openModal('privacyModal');
  });
  document.getElementById('openPrivacy2').addEventListener('click', function (e) {
    e.preventDefault();
    openModal('privacyModal');
  });

  var closeBtns = document.querySelectorAll('.modal__close');
  for (var m = 0; m < closeBtns.length; m++) {
    closeBtns[m].addEventListener('click', function () {
      closeModal(this.getAttribute('data-close'));
    });
  }
  var overlays = document.querySelectorAll('.modal-overlay');
  for (var n = 0; n < overlays.length; n++) {
    overlays[n].addEventListener('click', function (e) {
      if (e.target === this) closeModal(this.id);
    });
  }
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var o = document.querySelectorAll('.modal-overlay.is-open');
      for (var p = 0; p < o.length; p++) {
        closeModal(o[p].id);
      }
      closeMobileMenu();
    }
  });

  /* ── Auto-update Copyright Year ──────────────────── */
  var copyrightEl = document.querySelector('.footer__bottom span');
  if (copyrightEl) {
    copyrightEl.textContent = '\u00A9 ' + new Date().getFullYear() + ' Bundesverband f\u00fcr elektronische Wertpapiere e. V.';
  }

  /* ── Back-to-Top: visibility handled by unified scroll handler above.
     Navigation uses native <a href="#hero"> with CSS scroll-behavior: smooth. */

  /* ── Skeleton Loading States ─────────────────────── */
  var images = document.querySelectorAll('img');
  var imageLoadObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting && entry.target.parentElement) {
        entry.target.parentElement.classList.add('skeleton');
        var img = entry.target;
        function onImageLoad() {
          img.parentElement.classList.remove('skeleton');
          img.removeEventListener('load', onImageLoad);
          img.removeEventListener('error', onImageLoad);
        }
        img.addEventListener('load', onImageLoad);
        img.addEventListener('error', onImageLoad);
        imageLoadObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '50px' });
  
  for (var ii = 0; ii < images.length; ii++) {
    if (images[ii].src && !images[ii].complete) {
      imageLoadObserver.observe(images[ii]);
    }
  }

  /**
   * EWPG Node Network — Animated blockchain/tokenization visualization
   * Renders an elegant particle network on the hero canvas.
   * Nodes drift slowly and connect with lines when close enough.
   * Responds to scroll position (parallax shift).
   * Respects prefers-reduced-motion.
   */
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var heroCanvas = document.getElementById('heroNodes');

  if (heroCanvas && !prefersReducedMotion && window.innerWidth > 768) {
    (function initNodeNetwork() {
      var ctx = heroCanvas.getContext('2d');
      var dpr = window.devicePixelRatio || 1;
      var W, H;
      var nodes = [];
      var NODE_COUNT = Math.min(Math.round(window.innerWidth / 18), 80);
      var CONNECTION_DIST = 160;
      var scrollY = 0;
      var animId;

      function resize() {
        var rect = heroCanvas.parentElement.getBoundingClientRect();
        W = rect.width;
        H = rect.height;
        heroCanvas.width = W * dpr;
        heroCanvas.height = H * dpr;
        heroCanvas.style.width = W + 'px';
        heroCanvas.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      function createNodes() {
        nodes = [];
        for (var i = 0; i < NODE_COUNT; i++) {
          nodes.push({
            x: Math.random() * W,
            y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.25,
            r: Math.random() * 2 + 1.2,
            opacity: Math.random() * 0.5 + 0.3
          });
        }
      }

      function draw() {
        ctx.clearRect(0, 0, W, H);
        var parallaxOffset = scrollY * 0.08;

        /* Draw connections */
        for (var i = 0; i < nodes.length; i++) {
          for (var j = i + 1; j < nodes.length; j++) {
            var dx = nodes[i].x - nodes[j].x;
            var dy = (nodes[i].y - parallaxOffset) - (nodes[j].y - parallaxOffset);
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CONNECTION_DIST) {
              var alpha = (1 - dist / CONNECTION_DIST) * 0.18;
              ctx.beginPath();
              ctx.moveTo(nodes[i].x, nodes[i].y - parallaxOffset);
              ctx.lineTo(nodes[j].x, nodes[j].y - parallaxOffset);
              ctx.strokeStyle = 'rgba(7, 20, 59, ' + alpha + ')';
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
        }

        /* Draw nodes */
        for (var k = 0; k < nodes.length; k++) {
          var n = nodes[k];
          ctx.beginPath();
          ctx.arc(n.x, n.y - parallaxOffset, n.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(7, 20, 59, ' + n.opacity + ')';
          ctx.fill();
        }
      }

      function update() {
        for (var i = 0; i < nodes.length; i++) {
          var n = nodes[i];
          n.x += n.vx;
          n.y += n.vy;
          /* Wrap around edges smoothly */
          if (n.x < -10) n.x = W + 10;
          if (n.x > W + 10) n.x = -10;
          if (n.y < -10) n.y = H + 10;
          if (n.y > H + 10) n.y = -10;
        }
      }

      function loop() {
        update();
        draw();
        animId = requestAnimationFrame(loop);
      }

      /* Stop animation when hero is out of viewport */
      var heroEl = document.querySelector('.hero');
      var isAnimating = false;
      var heroObserver = new IntersectionObserver(function(entries) {
        if (entries[0].isIntersecting) {
          if (!isAnimating) { isAnimating = true; loop(); }
        } else {
          if (isAnimating) { isAnimating = false; cancelAnimationFrame(animId); }
        }
      }, { threshold: 0 });
      heroObserver.observe(heroEl);

      window.addEventListener('scroll', function() {
        scrollY = window.scrollY;
      }, { passive: true });

      window.addEventListener('resize', function() {
        resize();
        NODE_COUNT = Math.min(Math.round(window.innerWidth / 18), 80);
        createNodes();
      });

      resize();
      createNodes();
    })();
  }

  })();
