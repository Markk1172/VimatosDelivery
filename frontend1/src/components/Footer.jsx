import React from 'react';

function Footer() {
  const phoneNumber = '+5561999990000'; // Substitua pelo seu número de telefone com o código do país e DDD
  const displayPhoneNumber = '(61) 99999-0000'; // Como o número será exibido

  const locationLink = 'https://maps.app.goo.gl/9aRoX3cbzzpADzyLA';
  const displayLocation = 'Brasília, DF - Brazil';

  return (
    <footer className="footer py-4" id='footer'>
      <div className="container">
        <div className="row align-items-center justify-content-center">
          <div className="col-lg-4 text-center">
            Copyright © Vimatos Delivery 2025
          </div>

          <div className="col-lg-4 text-center mt-3 mt-lg-0">
            <ul className="list-inline quicklinks">
              <li className="list-inline-item">
                <a href={`tel:${phoneNumber}`} style={{ textDecoration: 'none', color: '#6c757d' }}>
                  <i className="fas fa-phone-alt me-0"></i> {displayPhoneNumber}
                </a>
              </li>
              <li className="list-inline-item" style={{ marginLeft: '24px' }}>
                <a href={locationLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#6c757d' }}>
                  <i className="fas fa-map-marker-alt me-6"></i> {displayLocation}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;