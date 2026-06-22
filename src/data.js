import {
  SiPython, SiJavascript, SiReact, SiFlutter, SiHtml5, SiCss,
  SiMongodb, SiPostgresql, SiTensorflow, SiOpencv, SiBootstrap,
  SiFigma, SiAndroidstudio, SiJupyter, SiTypescript,
} from 'react-icons/si'
import { FaJava, FaDatabase, FaCode, FaTools, FaCertificate, FaCompass, FaShieldAlt, FaBrain, FaMobileAlt, FaAws } from 'react-icons/fa'
import { TbBrandVscode, TbSql } from 'react-icons/tb'

export const PROFILE = {
  name: 'Manisha Rai',
  role: 'Full Stack Developer',
  phone: '+91-892061853',
  email: 'manisharai8920@gmail.com',
  github: 'https://github.com/manishatfm',
  linkedin: 'https://www.linkedin.com/in/manisha-rai-810b022a6/',
  location: 'Gurugram, India',
  tagline:
    'I craft fast, accessible, and beautifully animated web & mobile experiences — from FinTech apps to ML-driven tools.',
}

export const EDUCATION = [
  {
    title: 'B.Tech — Computer Science & Engineering (Data Science)',
    school: 'Maharshi Dayanand University, Rohtak',
    year: '2022 – 2026',
    grade: 'CGPA 7.9',
  },
  {
    title: 'Senior Secondary (Class XII) — PCBM',
    school: 'Rockford Convent Sr. Secondary School, Gurugram',
    year: '2021 – 2022',
    grade: 'CGPA 8.9',
  },
]

export const EXPERIENCE = [
  {
    role: 'Frontend Developer Intern',
    company: 'TFM Global Pvt. Ltd.',
    location: 'Gurgaon, India',
    period: 'Jul 2025 — Present',
    points: [
      'Developed Flutter-based mobile application for a fintech platform, boosting app stability and performance by 20%.',
      'Designed responsive interfaces and shipped 10+ core features across trading, utilities, and customer support modules.',
      'Integrated RESTful APIs with backend services, reducing data fetch times by 30%.',
      'Collaborated in Agile sprints, delivering 100% of assigned tasks on schedule.',
    ],
  },
  {
    role: 'IT Intern',
    company: 'Sheeraj Projects Pvt. Ltd.',
    location: 'Gurgaon, India',
    period: 'Jan 2025 — Jun 2025',
    points: [
      'Managed Microsoft Admin Panel, AWS EC2 instances, and enterprise software setups for 100+ employees.',
      'Built & launched the Astra Designs website (HTML/CSS/JS), increasing online traffic by 25%.',
      'Integrated biometric attendance systems and automated workflows, lifting operational efficiency by 20%.',
      'Created Visio process diagrams and tested mobile apps, fixing 15+ pre-deployment issues.',
    ],
  },
  {
    role: 'Web Developer Intern',
    company: 'Webs Jyoti',
    location: 'Gurgaon, India',
    period: 'Jul 2024 — Aug 2024',
    points: [
      'Built and deployed 3+ responsive static websites with HTML, CSS, JS, and Bootstrap.',
      'Optimized front-end performance, cutting page load time by 25% with lightweight design practices.',
    ],
  },
  {
    role: 'Data Science & ML Virtual Intern',
    company: 'YBI Foundation',
    location: 'Online',
    period: 'Jun 2024 — Jul 2024',
    points: [
      'Built ML models with TensorFlow & Keras, achieving 85% accuracy on classification tasks.',
      'Used Google Colab for prototyping & preprocessing, reducing training time by 15%.',
    ],
  },
]

/**
 * PROJECTS
 * --------
 * Add a new project by appending an object to this array. Required: name, tagline, points.
 * Optional: year, description, tech, repo, live, accent (card glow color), featured (bool).
 *
 * Example:
 * {
 *   name: 'My New App', year: '2026',
 *   tagline: 'A short, punchy one-liner.',
 *   points: ['Bullet 1', 'Bullet 2'],
 *   tech: ['React', 'Node'],
 *   repo: 'https://github.com/...', live: 'https://...',
 *   accent: '#7c3aed', featured: false,
 * }
 */
export const PROJECTS = [
  {
    name: 'Sign Language Translator',
    year: '2025',
    tagline: 'Real-time communication support tool.',
    points: [
      'Built in Python with OpenCV and Machine Learning.',
      'Recognizes hand gestures and translates them into text/speech.',
      'Helps bridge accessibility gaps for the hearing-impaired.',
    ],
    tech: ['Python', 'OpenCV', 'ML'],
    accent: '#22d3ee',
    featured: true,
  },
  {
    name: 'Chat Analyzer',
    year: '2025',
    tagline: 'Privacy-first text analysis for mood, stress and wellbeing.',
    points: [
      'Processes WhatsApp & SMS exports entirely on-device.',
      'VADER sentiment analysis to detect mood and stress patterns.',
      'Visualized wellbeing reports for actionable user insights.',
    ],
    tech: ['React', 'JavaScript', 'VADER', 'Chart.js'],
    accent: '#a78bfa',
  },
]

export const SKILL_GROUPS = [
  {
    icon: FaCode,
    title: 'Languages',
    items: [
      { name: 'Python', icon: SiPython },
      { name: 'Java', icon: FaJava },
      { name: 'JavaScript', icon: SiJavascript },
      { name: 'TypeScript', icon: SiTypescript },
      { name: 'SQL', icon: TbSql },
      { name: 'HTML', icon: SiHtml5 },
      { name: 'CSS', icon: SiCss },
    ],
  },
  {
    icon: FaMobileAlt,
    title: 'Frameworks & UI',
    items: [
      { name: 'React', icon: SiReact },
      { name: 'Flutter', icon: SiFlutter },
      { name: 'Bootstrap', icon: SiBootstrap },
      { name: 'TensorFlow', icon: SiTensorflow },
      { name: 'OpenCV', icon: SiOpencv },
    ],
  },
  {
    icon: FaTools,
    title: 'Tools & Platforms',
    items: [
      { name: 'VS Code', icon: TbBrandVscode },
      { name: 'Jupyter', icon: SiJupyter },
      { name: 'Figma', icon: SiFigma },
      { name: 'Android Studio', icon: SiAndroidstudio },
      { name: 'AWS EC2', icon: FaAws },
    ],
  },
  {
    icon: FaDatabase,
    title: 'Databases',
    items: [
      { name: 'MongoDB', icon: SiMongodb },
      { name: 'PostgreSQL', icon: SiPostgresql },
    ],
  },
  {
    icon: FaCertificate,
    title: 'Certifications',
    items: [
      { name: 'YBI — Data Science & ML' },
      { name: 'Webs Jyoti — Web Dev' },
      { name: 'TCS — Cybersecurity' },
      { name: 'Vodafone Idea — AI Design' },
    ],
  },
  {
    icon: FaCompass,
    title: 'Areas of Interest',
    items: [
      { name: 'Web & Mobile Dev' },
      { name: 'Cloud Security', icon: FaShieldAlt },
      { name: 'AI / ML', icon: FaBrain },
      { name: 'FinTech' },
    ],
  },
]
