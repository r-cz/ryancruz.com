class f extends HTMLElement{#h=!1;#n=!1;#e;#s;#t;#o;static get observedAttributes(){return["width","height","duration","characcters"]}constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){["width","height","duration"].forEach((t)=>{if(!this.hasAttribute(t))return;let r=parseInt(this.getAttribute(t));(isNaN(r)||r<=0)&&this.#i(t)}),this.#h=!1,this.#a(),this.#e=new IntersectionObserver((t)=>{this.#n=t[0].isIntersecting,this.#n&&!this.#h&&this.#r()},{threshold:0.5}),this.#e.observe(this),this.#s=new MutationObserver(async()=>{this.#p(),await Promise.all(Array.from(this.shadowRoot.querySelectorAll(".char")).map((t)=>t.getAnimations()).flat().map((t)=>t.finish())),this.#n&&this.#r()}),this.#s.observe(this,{childList:!0,characterData:!0,subtree:!0})}disconnectedCallback(){this.#e?.disconnect(),this.#e=void 0,this.#s?.disconnect(),this.#s=void 0}attributeChangedCallback(t,r,e){if(["width","height","duration"].includes(t)){let n=parseInt(this.getAttribute(t));if(isNaN(n)||n<=0)return this.#i(t)}t!="duration"&&r!=e&&(this.#a(),this.#n&&this.#r())}get width(){if(this.#t)return this.#t[0].length;if(this.hasAttribute("width")){let t=parseInt(this.getAttribute("width"));if(Number.isInteger(t)&&t>0)return t}return Math.max(...this.textContent.split(`
`).map((t)=>t.length))}set width(t){(!Number.isInteger(t)||t<=0)&&this.#i("width"),this.setAttribute("width",t),this.#a(),this.#n&&this.#r()}get height(){if(this.#t)return this.#t.length;if(this.hasAttribute("height")){let t=parseInt(this.getAttribute("height"));if(Number.isInteger(t)&&t>0)return t}return this.textContent.split(`
`).length}set height(t){(!Number.isInteger(t)||t<=0)&&this.#i("height"),this.setAttribute("height",t),this.#a(),this.#n&&this.#r()}get duration(){let t=150;if(this.hasAttribute("duration")){let r=parseInt(this.getAttribute("duration"));Number.isInteger(r)&&r>0&&(t=r)}return t}set duration(t){if(typeof t!="number"||t<=0)return this.#i("duration");this.setAttribute("duration",t)}get characters(){return this.getAttribute("characters")||` ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!.,:?"'/$`}set characters(t){this.setAttribute("characters",t)}#p(){let t=this.textContent.split(`
`);this.#o=Array.from({length:this.height}).map((r,e)=>{let n=t[e]||"";return Array.from({length:this.width}).map((s,d)=>n[d]?.toUpperCase()||" ")})}#a(){this.#t=null,this.#t=Array.from({length:this.height},()=>Array.from({length:this.width},()=>" ")),this.#p(),this.shadowRoot.innerHTML=[`
      <style>
        :host {
          display: inline-block;
          font-family: Arial, sans-serif;
        }

        #container {
          display: grid;
          grid-template-columns: repeat(${this.width}, auto);
          grid-template-rows: repeat(${this.height}, auto);
          gap: var(--hotfx-split-flap-grid-gap, .1em);
          perspective: 1000px;
        }`,`.char {
          position: relative;
          width: 1em;
          height: 1.2em;
          transform-style: preserve-3d;
        }`,`.top, .bottom, .top-next, .bottom-next {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          color: white;
          background: black;`,`backface-visibility: hidden;
        }`,`.top, .top-next {
          clip-path: polygon(0 0, 100% 0, 100% 50%, 0 50%);
        }

        .bottom, .bottom-next {
          clip-path: polygon(0 50%, 100% 50%, 100% 100%, 0 100%);
        }`,`.divider {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background-color: currentColor;
          color: #999;
          z-index: 10;
          transform: translateY(-50%);
        }
      </style>
      <div id="container">`,this.#t.map((t,r)=>(r+=1,t.map((e,n)=>{let s=e===" "?"&nbsp;":e;return`
              <span
                class=char
                part="char char-${n+=1} char-${r}-${n}">
                <span
                  class=top-next
                  part="flap flap-${n} flap-${r}-${n}"
                  aria-hidden=true>
                  ${s}
                  <span
                    class=divider
                    part="divider flap-${n} divider-${r}-${n}">
                  </span>
                </span>
                <span
                  class=bottom-next
                  part="flap flap-${n} flap-${r}-${n}"
                  aria-hidden=true>
                  ${s}
                  <span
                    class=divider
                    part="divider flap-${n} divider-${r}-${n}">
                  </span>
                </span>
                <span
                  class=top
                  part="flap flap-${n} flap-${r}-${n}">
                  ${s}
                  <span 
                    class=divider
                    part="divider flap-${n} divider-${r}-${n}">
                  </span>
                </span>
                <span
                  class=bottom
                  part="flap flap-${n} flap-${r}-${n}"
                  aria-hidden=true>
                  ${s}
                  <span
                    class=divider
                    part="divider flap-${n} divider-${r}-${n}">
                  </span>
                </span>
              </span>
            `}).join(""))).join(""),"</div>"].join("")}#r(){this.#h=!0;let t=this.#o;this.shadowRoot.querySelectorAll(".char").forEach((r,e)=>{let n=Math.floor(e/this.width),s=e%this.width,d=this.characters.includes(t[n][s])?this.characters.indexOf(t[n][s]):0,a=this.characters.indexOf(this.#t[n][s]);if(a==d)return;let i=async()=>{if(t!=this.#o)return;let h=a<this.characters.length-1?a+1:0,o=this.characters[h];r.querySelector(".top-next").childNodes[0].textContent=o,r.querySelector(".bottom-next").childNodes[0].textContent=o;let p={duration:this.duration,easing:"ease-in"};await Promise.all([r.querySelector(".top").animate([{transform:"rotateX(0deg)"},{transform:"rotateX(-180deg)"}],p).finished,r.querySelector(".bottom-next").animate([{transform:"rotateX(180deg)"},{transform:"rotateX(0deg)"}],p).finished]),r.querySelector(".top").childNodes[0].textContent=o,r.querySelector(".bottom").childNodes[0].textContent=o,a=h,this.#t[n][s]=this.characters[a],a!==d&&i()};i()})}#i(t){console.error(`<hotfx-split-flap> ${t} attribute must be a positive integer; got  "${this.getAttribute(t)}"`)}}customElements.define("hotfx-split-flap",f);document.addEventListener("DOMContentLoaded",()=>{let t=document.querySelector("#app");if(!t){console.error("App element not found");return}t.innerHTML=`
    <div class="relative min-h-screen">
      <!-- Airport Diagram Background -->
      <div 
        id="airport-bg" 
        class="fixed inset-0 pointer-events-none airport-background"
        style="
          background-image: url('/kdal.svg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          opacity: var(--airport-diagram-opacity);
        "
      ></div>
      
      <!-- Gradient Overlay -->
      <div class="fixed inset-0 pointer-events-none gradient-overlay"></div>
      
      <!-- Hero Section -->
      <main class="relative z-10 flex items-center justify-center min-h-screen px-8">
        <div class="text-center max-w-4xl">
          <h1 class="text-6xl md:text-8xl font-bold mb-6 text-[var(--text-primary)]">
            RYAN CRUZ
          </h1>
          <div class="mb-8">
            <hotfx-split-flap>CYBERSECURITY ENGINEER</hotfx-split-flap>
          </div>
        </div>
      </main>
    </div>
  `,g(),setTimeout(()=>{b()},3000)});function g(){let t=document.querySelector(".gradient-overlay");if(!t)return;t.style.background=`
    radial-gradient(
      ellipse at center,
      transparent 20%,
      var(--bg-primary) 80%
    )
  `}function b(){let t=document.querySelector("hotfx-split-flap");if(!t)return;t.setAttribute("duration","100");let r=["IDENTITY ENTHUSIAST","NONREV TRAVELER","PARK LOVER","CINEPHILE","HOMELABBER","GEORGIAN","TEXAN","PENNSYLVANIAN"],e=[],n="CYBERSECURITY ENGINEER";function s(){if(e.length===r.length)e=[];let i=r.filter((p)=>!e.includes(p)),h=Math.floor(Math.random()*i.length),o=i[h];return e.push(o),o}function d(i,h){let o=Math.max(i.length,h.length),p=0;for(let c=0;c<o;c++){let l=i[c]||" ",u=h[c]||" ";if(l!==u)p++}return p*500+3000}function a(){let i=s(),h=d(n,i);setTimeout(()=>{t.textContent=i,n=i,a()},h)}setTimeout(()=>{let i=s();t.textContent=i,n=i,setTimeout(()=>{a()},1000)},4000)}
