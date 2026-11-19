/**
 * Some engines load a variable font but ignore its axes (or the font fails to load).
 * CSS.supports() can't tell — they still claim support — so measure instead:
 * if text is the same width at wdth 50 and wdth 150, axes aren't being applied,
 * and html.no-vf swaps in bold system fonts rather than rendering hairlines.
 */
export function checkVariableFonts() {
  const probe = (wdth) => {
    const s = document.createElement('span')
    s.textContent = 'MANISHA RAI'
    s.setAttribute('aria-hidden', 'true')
    s.style.cssText = `position:absolute;left:-9999px;top:0;visibility:hidden;white-space:nowrap;font-family:'Anybody Variable';font-size:100px;font-variation-settings:'wdth' ${wdth}`
    document.body.appendChild(s)
    const w = s.getBoundingClientRect().width
    s.remove()
    return w
  }
  const run = () => {
    if (Math.abs(probe(150) - probe(50)) < 4) {
      document.documentElement.classList.add('no-vf')
      window.dispatchEvent(new Event('mr:fonts')) // fitted headlines re-measure
    }
  }
  const load = document.fonts?.load ? document.fonts.load("100px 'Anybody Variable'") : Promise.resolve()
  load.then(run, run)
}
