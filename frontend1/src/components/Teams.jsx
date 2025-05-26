import React from "react";
import img1 from '../assets/img/team/victoria.jpg';
import img2 from '../assets/img/team/gabriel.jpg';
import img3 from '../assets/img/team/guxta.jpg';
import img4 from '../assets/img/team/raul.jpg';
import img5 from '../assets/img/team/marcos.jpg';
import img6 from '../assets/img/team/amanda.jpg';
import img7 from '../assets/img/team/matheus.jpg';

const teamMembers = [
    {
        name: "Victoria Alves",
        role: "Analista de Documentação",
        img: img1,
        socials: [
            { icon: "fab fa-github", label: "GitHub Profile", href: "#!" },
            { icon: "fab fa-linkedin-in", label: "LinkedIn Profile", href: "#!" },
        ],
    },
    {
        name: "Gabriel Oliveira",
        role: "Desenvolvedor Front-End",
        img: img2,
        socials: [
            { icon: "fab fa-github", label: "GitHub Profile", href: "https://github.com/SmankyR" },
            { icon: "fab fa-linkedin-in", label: "LinkedIn Profile", href: "https://br.linkedin.com/in/gabriel-olivera-2795732b6/" },
        ],
    },
    {
        name: "Gustavo Couto",
        role: "Administrador de Banco de Dados",
        img: img3,
        socials: [
            { icon: "fab fa-github", label: "GitHub Profile", href: "https://github.com/GuxtaDelas" },
            { icon: "fab fa-linkedin-in", label: "LinkedIn Profile", href: "https://br.linkedin.com/in/gustavo-couto-carvalho-4098022b0/" },
        ],
    },
    {
        name: "Raul Alcântara",
        role: "Analista de Documentação",
        img: img4,
        socials: [
            { icon: "fab fa-github", label: "GitHub Profile", href: "https://github.com/rAuuL777" },
            { icon: "fab fa-linkedin-in", label: "LinkedIn Profile", href: "https://br.linkedin.com/in/raul-alc%C3%A2ntara-a3b7132ab" },
        ],
    },
    {
        name: "Marcos Vinicius", 
        role: "Desenvolvedor Full Stack",
        img: img5,
        socials: [
            { icon: "fab fa-github", label: "GitHub Profile", href: "https://github.com/Markk1172" },
            { icon: "fab fa-linkedin-in", label: "LinkedIn Profile", href: "https://www.linkedin.com/in/marcos-vinicius-599a96313/" },
        ],
    },
    {
        name: "Ämanda Guimarães",
        role: "Desenvolvedor Front-End",
        img: img6,
        socials: [
            { icon: "fab fa-github", label: "GitHub Profile", href: "https://github.com/amandagmrsz" },
            { icon: "fab fa-linkedin-in", label: "LinkedIn Profile", href: "https://www.linkedin.com/in/amanda-beatriz-guimar%C3%A3es-alves/" },
        ],
    },
    {
        name: "Matheus Araujo",
        role: "Desenvolvedor Full Stack",
        img: img7,
        socials: [
            { icon: "fab fa-github", label: "GitHub Profile", href: "https://github.com/matheus0araujo" },
            { icon: "fab fa-linkedin-in", label: "LinkedIn Profile", href: "https://www.linkedin.com/in/matheusaraujotch/" },
        ],
    },
];

// ...restante do componente igual...

const Teams = () => (
    <section className="page-section bg-light" id="team">
        <div className="container">
            <div className="text-center">
                <h2 className="section-heading text-uppercase">Quem Somos</h2>
                <h3 className="section-subheading text-muted">
                    Trabalhamos juntos para transformar ideias em realidade e entregar resultados excepcionais.
                </h3>
            </div>
            <div className="row flex-wrap justify-content-center">
                {teamMembers.map((member, idx) => (
                    <div className="col-lg-3 col-md-4 col-sm-6 mb-4" key={member.name + idx}>
                        <div className="team-member">
                            <img
                                className="mx-auto rounded-circle team-img-small"
                                src={member.img}
                                alt={member.name}
                            />
                            <h4>{member.name}</h4>
                            <p className="text-muted">{member.role}</p>
                            {member.socials.map((social, i) => (
                                <a
                                    className="btn btn-dark btn-sm mx-1 my-1"
                                    href={social.href}
                                    aria-label={`${member.name} ${social.label}`}
                                    key={social.icon}
                                >
                                    <i className={social.icon}></i>
                                </a>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="row">
                <div className="col-lg-8 mx-auto text-center">
                    <p className="large text-muted">
                        Nossa equipe é o coração do que fazemos. 
                        Valorizamos a colaboração, a criatividade e a busca constante por conhecimento, 
                        construindo um ambiente onde cada um pode crescer e inovar.
                    </p>
                </div>
            </div>
        </div>
    </section>
);

export default Teams;