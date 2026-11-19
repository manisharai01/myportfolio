import { PROFILE } from '../data/content'
import { copyText, toast } from '../lib/toast'
import KineticName from './KineticName.jsx'
import { ArrowUpRight, CopyIcon, GitHubIcon, LinkedInIcon, Magnetic, Reveal, Scramble } from './ui/Primitives.jsx'
import './Contact.css'

export default function Contact() {
  const copy = async () => toast((await copyText(PROFILE.email)) ? 'Email copied — talk soon' : PROFILE.email)
  return (
    <section id="contact" className="contact" aria-label="Contact">
      <div className="container">
        <div className="contact__top">
          <Scramble as="p" className="mono" text="05 — Contact" />
          <p className="mono">Replies within a day · IST (UTC+5:30)</p>
        </div>
        <KineticName as="h2" className="contact__kn" lines={[{ text: 'LET’S TALK' }]} />
        <div className="contact__grid">
          <Reveal className="contact__pitch">
            <p>
              Hiring for a team that ships real-time, mobile or backend work? Building something that has to stay up? I’d love to hear about it.
            </p>
          </Reveal>
          <Reveal className="contact__actions" delay={0.1}>
            <Magnetic strength={0.2}>
              <a className="contact__email" href={`mailto:${PROFILE.email}`} data-cursor="label" data-cursor-label="Write">
                {PROFILE.email}
              </a>
            </Magnetic>
            <div className="contact__row">
              <button className="cbtn mono" onClick={copy} data-cursor="label" data-cursor-label="Copy">
                <CopyIcon width={14} height={14} /> Copy email
              </button>
              <a className="cbtn mono" href={PROFILE.linkedin} target="_blank" rel="noreferrer">
                <LinkedInIcon width={14} height={14} /> LinkedIn <ArrowUpRight width={11} height={11} />
              </a>
              <a className="cbtn mono" href={PROFILE.github} target="_blank" rel="noreferrer">
                <GitHubIcon width={14} height={14} /> GitHub <ArrowUpRight width={11} height={11} />
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
