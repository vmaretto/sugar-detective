import React from 'react';
import './FooterSwitch.css';

export default function FooterSwitch() {
  return (
    <footer
      id="colophon"
      role="contentinfo"
      className="footer-switch"
    >
      <div className="footer-switch__top">
        <div className="footer-switch__logo">
          <img
            src="https://switchdiet.eu/wp-content/uploads/2023/03/H-white-logo_switch.png"
            alt="Switch Diet logo"
          />
        </div>

        <nav className="footer-switch__menu" aria-label="Footer menu">
          <a href="https://switchdiet.eu/discover-our-food-hubs/" target="_blank" rel="noreferrer">
            FOOD HUBS
          </a>
          <a href="https://switchdiet.eu/about-switch-project/" target="_blank" rel="noreferrer">
            ABOUT
          </a>
          <a href="https://switchdiet.eu/news-and-events/" target="_blank" rel="noreferrer">
            NEWS & EVENTS
          </a>
          <a href="https://switchdiet.eu/contact/" target="_blank" rel="noreferrer">
            CONTACTS
          </a>
        </nav>
      </div>

      <div className="footer-switch__social">
        <h2>Follow us</h2>
        <div className="footer-switch__social-links">
          <a href="https://twitter.com/switchdiet" target="_blank" rel="noreferrer">
            <img
              src="https://switchdiet.eu/wp-content/uploads/2023/03/X.png"
              alt="X / Twitter"
            />
          </a>
          <a
            href="https://www.linkedin.com/company/switchdiet/"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://switchdiet.eu/wp-content/uploads/2023/03/Risorsa-4loghi-social.png"
              alt="LinkedIn"
            />
          </a>
          <a
            href="https://www.instagram.com/switch.diet/"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://switchdiet.eu/wp-content/uploads/2023/03/Risorsa-5loghi-social.png"
              alt="Instagram"
            />
          </a>
          <a
            href="https://www.facebook.com/switch.diet.eu/"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://switchdiet.eu/wp-content/uploads/2023/03/Risorsa-1loghi-social.png"
              alt="Facebook"
            />
          </a>
          <a
            href="https://www.tiktok.com/@switch_diet?lang=en"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://switchdiet.eu/wp-content/uploads/2023/03/Risorsa-2loghi-social.png"
              alt="TikTok"
            />
          </a>
          <a
            href="https://www.youtube.com/channel/UC1xQStx19n7V7iwa22DQgYA"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://switchdiet.eu/wp-content/uploads/2023/03/Risorsa-1@3x-1024x723.png"
              alt="YouTube"
            />
          </a>
        </div>
      </div>

      <div className="footer-switch__legal">
        <a href="https://switchdiet.eu/privacy-policy/" target="_blank" rel="noreferrer">
          Privacy and Cookie Policy
        </a>
        <a href="https://switchdiet.eu/project-privacy-policy/" target="_blank" rel="noreferrer">
          Project Privacy Policy
        </a>
      </div>

      <div className="footer-switch__funding">
        <img
          src="https://switchdiet.eu/wp-content/uploads/2023/03/EN-Funded-by-the-EU-WHITE-Outline-1024x215.png"
          alt="EU Funded"
          className="footer-switch__funding-logo"
        />
        <p className="footer-switch__funding-details">
          SWITCH – Project number: 101060483
          <br />
          Call: HORIZON-CL6-2021-FARM2FORK-01-15: Transition to sustainable and
          healthy dietary behaviour
        </p>
        <p className="footer-switch__funding-disclaimer">
          Funded by the European Union. Views and opinions expressed are however those of the author(s) only and do not necessarily reflect those of the European Union. Neither the European Union nor the granting authority can be held responsible for them.
        </p>
      </div>
    </footer>
  );
}
