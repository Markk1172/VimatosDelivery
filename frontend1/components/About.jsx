import React from "react";
import img1 from './../assets/img/about/1.jpg';
import img2 from './../assets/img/about/2.jpg';
import img3 from './../assets/img/about/3.jpg';
import img4 from './../assets/img/about/4.jpg';

const timelineEvents = [
    {
        date: "2009-2011",
        title: "Our Humble Beginnings",
        text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sunt ut voluptatum eius sapiente, totam reiciendis temporibus qui quibusdam, recusandae sit vero unde, sed, incidunt et ea quo dolore laudantium consectetur!",
        img: img1,
        inverted: false,
    },
    {
        date: "March 2011",
        title: "An Agency is Born",
        text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sunt ut voluptatum eius sapiente, totam reiciendis temporibus qui quibusdam, recusandae sit vero unde, sed, incidunt et ea quo dolore laudantium consectetur!",
        img: img2,
        inverted: true,
    },
    {
        date: "December 2015",
        title: "Transition to Full Service",
        text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sunt ut voluptatum eius sapiente, totam reiciendis temporibus qui quibusdam, recusandae sit vero unde, sed, incidunt et ea quo dolore laudantium consectetur!",
        img: img3,
        inverted: false,
    },
    {
        date: "July 2020",
        title: "Phase Two Expansion",
        text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sunt ut voluptatum eius sapiente, totam reiciendis temporibus qui quibusdam, recusandae sit vero unde, sed, incidunt et ea quo dolore laudantium consectetur!",
        img: img4,
        inverted: true,
    },
];

// ...restante do componente igual...

const About = () => (
    <section className="page-section" id="about">
        <div className="container">
            <div className="text-center">
                <h2 className="section-heading text-uppercase">About</h2>
                <h3 className="section-subheading text-muted">
                    Lorem ipsum dolor sit amet consectetur.
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
                            Be Part
                            <br />
                            Of Our
                            <br />
                            Story!
                        </h4>
                    </div>
                </li>
            </ul>
        </div>
    </section>
);

export default About;