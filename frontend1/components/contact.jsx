import React, { useState } from "react";

const initialState = {
    name: "",
    email: "",
    phone: "",
    message: "",
};

export default function Contact() {
    const [form, setForm] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [submitStatus, setSubmitStatus] = useState(null); // "success" | "error" | null

    const validate = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = "A name is required.";
        if (!form.email.trim()) newErrors.email = "An email is required.";
        else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Email is not valid.";
        if (!form.phone.trim()) newErrors.phone = "A phone number is required.";
        if (!form.message.trim()) newErrors.message = "A message is required.";
        return newErrors;
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: undefined });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setSubmitStatus(null);
            return;
        }
        // Simulate successful submission
        setSubmitStatus("success");
        setForm(initialState);
        setTimeout(() => setSubmitStatus(null), 4000);
    };

    return (
        <section className="page-section" id="contact">
            <div className="container">
                <div className="text-center">
                    <h2 className="section-heading text-uppercase">Contact Us</h2>
                    <h3 className="section-subheading text-muted">
                        Lorem ipsum dolor sit amet consectetur.
                    </h3>
                </div>
                <form id="contactForm" onSubmit={handleSubmit} noValidate>
                    <div className="row align-items-stretch mb-5">
                        <div className="col-md-6">
                            <div className="form-group">
                                <input
                                    className={`form-control${errors.name ? " is-invalid" : ""}`}
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Your Name *"
                                    value={form.name}
                                    onChange={handleChange}
                                />
                                {errors.name && (
                                    <div className="invalid-feedback">{errors.name}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <input
                                    className={`form-control${errors.email ? " is-invalid" : ""}`}
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Your Email *"
                                    value={form.email}
                                    onChange={handleChange}
                                />
                                {errors.email && (
                                    <div className="invalid-feedback">{errors.email}</div>
                                )}
                            </div>
                            <div className="form-group mb-md-0">
                                <input
                                    className={`form-control${errors.phone ? " is-invalid" : ""}`}
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    placeholder="Your Phone *"
                                    value={form.phone}
                                    onChange={handleChange}
                                />
                                {errors.phone && (
                                    <div className="invalid-feedback">{errors.phone}</div>
                                )}
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group form-group-textarea mb-md-0">
                                <textarea
                                    className={`form-control${errors.message ? " is-invalid" : ""}`}
                                    id="message"
                                    name="message"
                                    placeholder="Your Message *"
                                    value={form.message}
                                    onChange={handleChange}
                                    rows={6}
                                />
                                {errors.message && (
                                    <div className="invalid-feedback">{errors.message}</div>
                                )}
                            </div>
                        </div>
                    </div>
                    {submitStatus === "success" && (
                        <div id="submitSuccessMessage">
                            <div className="text-center text-white mb-3">
                                <div className="fw-bolder">Form submission successful!</div>
                                To activate this form, sign up at
                                <br />
                                <a href="https://startbootstrap.com/solution/contact-forms">
                                    https://startbootstrap.com/solution/contact-forms
                                </a>
                            </div>
                        </div>
                    )}
                    {submitStatus === "error" && (
                        <div id="submitErrorMessage">
                            <div className="text-center text-danger mb-3">
                                Error sending message!
                            </div>
                        </div>
                    )}
                    <div className="text-center">
                        <button
                        className="btn btn-primary btn-xl text-uppercase"
                        id="submitButton"
                        type="submit"
                        disabled={Object.keys(errors).length > 0}
                        >
                        Send Message
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}