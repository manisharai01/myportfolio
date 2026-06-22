import { HiOutlineEnvelope, HiOutlinePhone } from 'react-icons/hi2'
import { FaGithub, FaLinkedinIn } from 'react-icons/fa'
import { Reveal } from './Reveal.jsx'
import { Magnetic, SplitText } from './Animated.jsx'
import { PROFILE } from '../data.js'

export default function Contact() {
  return (
    <section id="contact" className="contact">
      <div className="container">
        <Reveal><span className="eyebrow">Get in touch</span></Reveal>
        <h2>
          <SplitText text="Let's build" />
          <br />
          <span className="serif-accent"><SplitText text="something great." delay={0.2} /></span>
        </h2>
        <Reveal delay={0.1}>
          <p>
            Open to full-time roles, internships and freelance work. I'll usually reply within a day —
            send a note and let's chat.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="contact-links">
            <Magnetic strength={0.3}>
              <a className="btn btn-primary" href={`mailto:${PROFILE.email}`}>
                <HiOutlineEnvelope /> {PROFILE.email}
              </a>
            </Magnetic>
            <Magnetic strength={0.3}>
              <a className="btn btn-ghost" href={`tel:${PROFILE.phone}`}>
                <HiOutlinePhone /> {PROFILE.phone}
              </a>
            </Magnetic>
            <Magnetic strength={0.3}>
              <a className="btn btn-ghost" href={PROFILE.github} target="_blank" rel="noreferrer">
                <FaGithub /> GitHub
              </a>
            </Magnetic>
            <Magnetic strength={0.3}>
              <a className="btn btn-ghost" href={PROFILE.linkedin} target="_blank" rel="noreferrer">
                <FaLinkedinIn /> LinkedIn
              </a>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
