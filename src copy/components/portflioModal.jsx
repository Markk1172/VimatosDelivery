import React from "react";

const portfolioModals = [
  {
    id: "portfolioModal1",
    title: "Threads",
    subtitle: "Lorem ipsum dolor sit amet consectetur.",
    img: "/assets/img/portfolio/1.jpg",
    description:
      "Use this area to describe your project. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Est blanditiis dolorem culpa incidunt minus dignissimos deserunt repellat aperiam quasi sunt officia expedita beatae cupiditate, maiores repudiandae, nostrum, reiciendis facere nemo!",
    client: "Threads",
    category: "Illustration",
  },
  {
    id: "portfolioModal2",
    title: "Explore",
    subtitle: "Lorem ipsum dolor sit amet consectetur.",
    img: "/assets/img/portfolio/2.jpg",
    description:
      "Use this area to describe your project. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Est blanditiis dolorem culpa incidunt minus dignissimos deserunt repellat aperiam quasi sunt officia expedita beatae cupiditate, maiores repudiandae, nostrum, reiciendis facere nemo!",
    client: "Explore",
    category: "Graphic Design",
  },
  {
    id: "portfolioModal3",
    title: "Finish",
    subtitle: "Lorem ipsum dolor sit amet consectetur.",
    img: "/assets/img/portfolio/3.jpg",
    description:
      "Use this area to describe your project. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Est blanditiis dolorem culpa incidunt minus dignissimos deserunt repellat aperiam quasi sunt officia expedita beatae cupiditate, maiores repudiandae, nostrum, reiciendis facere nemo!",
    client: "Finish",
    category: "Identity",
  },
  {
    id: "portfolioModal4",
    title: "Lines",
    subtitle: "Lorem ipsum dolor sit amet consectetur.",
    img: "/assets/img/portfolio/4.jpg",
    description:
      "Use this area to describe your project. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Est blanditiis dolorem culpa incidunt minus dignissimos deserunt repellat aperiam quasi sunt officia expedita beatae cupiditate, maiores repudiandae, nostrum, reiciendis facere nemo!",
    client: "Lines",
    category: "Branding",
  },
  {
    id: "portfolioModal5",
    title: "Southwest",
    subtitle: "Lorem ipsum dolor sit amet consectetur.",
    img: "/assets/img/portfolio/5.jpg",
    description:
      "Use this area to describe your project. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Est blanditiis dolorem culpa incidunt minus dignissimos deserunt repellat aperiam quasi sunt officia expedita beatae cupiditate, maiores repudiandae, nostrum, reiciendis facere nemo!",
    client: "Southwest",
    category: "Website Design",
  },
  {
    id: "portfolioModal6",
    title: "Window",
    subtitle: "Lorem ipsum dolor sit amet consectetur.",
    img: "/assets/img/portfolio/6.jpg",
    description:
      "Use this area to describe your project. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Est blanditiis dolorem culpa incidunt minus dignissimos deserunt repellat aperiam quasi sunt officia expedita beatae cupiditate, maiores repudiandae, nostrum, reiciendis facere nemo!",
    client: "Window",
    category: "Photography",
  },
  // Adicione mais itens conforme necessário
];

function PortfolioModals() {
  return (
    <>
      {portfolioModals.map((item) => (
        <div
          className="portfolio-modal modal fade"
          id={item.id}
          tabIndex={-1}
          role="dialog"
          aria-hidden="true"
          key={item.id}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="close-modal" data-bs-dismiss="modal">
                <img src="/assets/img/close-icon.svg" alt="Close modal" />
              </div>
              <div className="container">
                <div className="row justify-content-center">
                  <div className="col-lg-8">
                    <div className="modal-body">
                      {/* Project details */}
                      <h2 className="text-uppercase">{item.title}</h2>
                      <p className="item-intro text-muted">{item.subtitle}</p>
                      <img
                        className="img-fluid d-block mx-auto"
                        src={item.img}
                        alt={item.title}
                      />
                      <p>{item.description}</p>
                      <ul className="list-inline">
                        <li>
                          <strong>Client:</strong> {item.client}
                        </li>
                        <li>
                          <strong>Category:</strong> {item.category}
                        </li>
                      </ul>
                      <button
                        className="btn btn-primary btn-xl text-uppercase"
                        data-bs-dismiss="modal"
                        type="button"
                      >
                        <i className="fas fa-xmark me-1"></i>
                        Close Project
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export default PortfolioModals;