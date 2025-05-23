import React from "react";
import img1 from '../assets/img/team/img1Team.jpg';
import img2 from '../assets/img/team/img2Team.jpg';
import img3 from '../assets/img/team/img3Team.jpg';

const teamMembers = [
    {
        name: "Parveen Anand",
        role: "Lead Designer",
        img: img1,
        socials: [
            { icon: "fab fa-twitter", label: "Twitter Profile", href: "#!" },
            { icon: "fab fa-facebook-f", label: "Facebook Profile", href: "#!" },
            { icon: "fab fa-linkedin-in", label: "LinkedIn Profile", href: "#!" },
        ],
    },
    {
        name: "Diana Petersen",
        role: "Lead Marketer",
        img: img2,
        socials: [
            { icon: "fab fa-twitter", label: "Twitter Profile", href: "#!" },
            { icon: "fab fa-facebook-f", label: "Facebook Profile", href: "#!" },
            { icon: "fab fa-linkedin-in", label: "LinkedIn Profile", href: "#!" },
        ],
    },
    {
        name: "Larry Parker",
        role: "Lead Developer",
        img: img3,
        socials: [
            { icon: "fab fa-twitter", label: "Twitter Profile", href: "#!" },
            { icon: "fab fa-facebook-f", label: "Facebook Profile", href: "#!" },
            { icon: "fab fa-linkedin-in", label: "LinkedIn Profile", href: "#!" },
        ],
    },
    {
        name: "Larry Parker",
        role: "Lead Developer",
        img: img3,
        socials: [
            { icon: "fab fa-twitter", label: "Twitter Profile", href: "#!" },
            { icon: "fab fa-facebook-f", label: "Facebook Profile", href: "#!" },
            { icon: "fab fa-linkedin-in", label: "LinkedIn Profile", href: "#!" },
        ],
    },
    {
        name: "Larry Parker",
        role: "Lead Developer",
        img: img3,
        socials: [
            { icon: "fab fa-twitter", label: "Twitter Profile", href: "#!" },
            { icon: "fab fa-facebook-f", label: "Facebook Profile", href: "#!" },
            { icon: "fab fa-linkedin-in", label: "LinkedIn Profile", href: "#!" },
        ],
    },
    {
        name: "Larry Parker",
        role: "Lead Developer",
        img: img3,
        socials: [
            { icon: "fab fa-twitter", label: "Twitter Profile", href: "#!" },
            { icon: "fab fa-facebook-f", label: "Facebook Profile", href: "#!" },
            { icon: "fab fa-linkedin-in", label: "LinkedIn Profile", href: "#!" },
        ],
    },
    {
        name: "Larry Parker",
        role: "Lead Developer",
        img: img3,
        socials: [
            { icon: "fab fa-twitter", label: "Twitter Profile", href: "#!" },
            { icon: "fab fa-facebook-f", label: "Facebook Profile", href: "#!" },
            { icon: "fab fa-linkedin-in", label: "LinkedIn Profile", href: "#!" },
        ],
    },
];

// ...restante do componente igual...

const Teams = () => (
    <section className="page-section bg-light" id="team">
        <div className="container">
            <div className="text-center">
                <h2 className="section-heading text-uppercase">Our Amazing Team</h2>
                <h3 className="section-subheading text-muted">
                    Lorem ipsum dolor sit amet consectetur.
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
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aut eaque,
                        laboriosam veritatis, quos non quis ad perspiciatis, totam corporis
                        ea, alias ut unde.
                    </p>
                </div>
            </div>
        </div>
    </section>
);

export default Teams;