import React from "react";
import img1 from './../assets/img/about/1.jpg';
import img2 from './../assets/img/about/2.jpg';
import img3 from './../assets/img/about/3.jpg';
import img4 from './../assets/img/about/4.jpg';

const timelineEvents = [
    {
        date: "2024",
        title: "Um novo ano, um novo começo",
        text: "No ano de 2024, 7 jovens iniciam uma nova jornada, a tão esperada faculdade, cada um com seus objetivos mas todos com a mesma paixão por pizzas!",
        img: img1,
        inverted: false,
    },
    {
        date: "Agosto 2024",
        title: "Separações",
        text: "Depois de um primeiro semestre juntos, por uma jogada do destino, foram separados em duas turmas diferentes e tiveram vivencias distintas.   ",
        img: img2,
        inverted: true,
    },
    {
        date: "Março 2025",
        title: "Reencontro",
        text: "Após um momento conturbado de tentativas de reunião, todos conseguiram estar na mesma turma e decidem formar um grupo para resolver os trabalhos que vieram no semestre.",
        img: img3,
        inverted: false,
    },
    {
        date: "Maio 2025",
        title: "Jornada de Pizzas",
        text: "Em momentos de finalização de mais um semestre, ainda há mais uma tarefa a ser realizada, um delivery de pizzas! Cruzando com todos os temas que foram abordados no semestre",
        img: img4,
        inverted: true,
    },
];

// ...restante do componente igual...

const About = () => (
    <section className="page-section" id="about">
        <div className="container">
            <div className="text-center">
                <h2 className="section-heading text-uppercase">Trajetoria</h2>
                <h3 className="section-subheading text-muted">
                    Uma breve introdução ao nosso grupo!
                </h3>
            </div>
            <ul className="timeline">
                {timelineEvents.map((event, idx) => (
                    <li
                        key={idx}
                        className={event.inverted ? "timeline-inverted" : undefined}
                    >
                        <div className="timeline-image">
                            <img
                                className="rounded-circle img-fluid"
                                src={event.img}
                                alt="..."
                            />
                        </div>
                        <div className="timeline-panel">
                            <div className="timeline-heading">
                                <h4>{event.date}</h4>
                                <h4 className="subheading">{event.title}</h4>
                            </div>
                            <div className="timeline-body">
                                <p className="text-muted">{event.text}</p>
                            </div>
                        </div>
                    </li>
                ))}
                <li className="timeline-inverted">
                    <div className="timeline-image">
                        <h4>
                            Uma historia
                            <br />
                            que não termina
                            <br />
                            aqui!
                        </h4>
                    </div>
                </li>
            </ul>
        </div>
    </section>
);

export default About;