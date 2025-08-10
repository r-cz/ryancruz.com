class u extends HTMLElement{#h=!1;#r=!1;#a;#i;#t;#o;static get observedAttributes(){return["width","height","duration","characters"]}constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){["width","height","duration"].forEach((t)=>{if(!this.hasAttribute(t))return;let r=parseInt(this.getAttribute(t));(isNaN(r)||r<=0)&&this.#s(t)}),this.#h=!1,this.#e(),this.#a=new IntersectionObserver((t)=>{this.#r=t[0].isIntersecting,this.#r&&!this.#h&&this.#n()},{threshold:0.5}),this.#a.observe(this),this.#i=new MutationObserver(async()=>{this.#p(),await Promise.all(Array.from(this.shadowRoot.querySelectorAll(".char")).map((t)=>t.getAnimations()).flat().map((t)=>t.finish())),this.#r&&this.#n()}),this.#i.observe(this,{childList:!0,characterData:!0,subtree:!0})}disconnectedCallback(){this.#a?.disconnect(),this.#a=void 0,this.#i?.disconnect(),this.#i=void 0}attributeChangedCallback(t,r,a){if(["width","height","duration"].includes(t)){let n=parseInt(this.getAttribute(t));if(isNaN(n)||n<=0)return this.#s(t)}t!="duration"&&r!=a&&(this.#e(),this.#r&&this.#n())}get width(){if(this.#t)return this.#t[0].length;if(this.hasAttribute("width")){let t=parseInt(this.getAttribute("width"));if(Number.isInteger(t)&&t>0)return t}return Math.max(...this.textContent.split(`
`).map((t)=>t.length))}set width(t){(!Number.isInteger(t)||t<=0)&&this.#s("width"),this.setAttribute("width",t),this.#e(),this.#r&&this.#n()}get height(){if(this.#t)return this.#t.length;if(this.hasAttribute("height")){let t=parseInt(this.getAttribute("height"));if(Number.isInteger(t)&&t>0)return t}return this.textContent.split(`
`).length}set height(t){(!Number.isInteger(t)||t<=0)&&this.#s("height"),this.setAttribute("height",t),this.#e(),this.#r&&this.#n()}get duration(){let t=150;if(this.hasAttribute("duration")){let r=parseInt(this.getAttribute("duration"));Number.isInteger(r)&&r>0&&(t=r)}return t}set duration(t){if(typeof t!="number"||t<=0)return this.#s("duration");this.setAttribute("duration",t)}get characters(){return this.getAttribute("characters")||` ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!.,:?"'/$`}set characters(t){this.setAttribute("characters",t)}#p(){let t=this.textContent.split(`
`);this.#o=Array.from({length:this.height}).map((r,a)=>{let n=t[a]||"";return Array.from({length:this.width}).map((i,d)=>n[d]?.toUpperCase()||" ")})}#e(){this.#t=null,this.#t=Array.from({length:this.height},()=>Array.from({length:this.width},()=>" ")),this.#p(),this.shadowRoot.innerHTML=[`
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
      <div id="container">`,this.#t.map((t,r)=>(r+=1,t.map((a,n)=>{let i=a===" "?"&nbsp;":a;return`
              <span
                class=char
                part="char char-${n+=1} char-${r}-${n}">
                <span
                  class=top-next
                  part="flap flap-${n} flap-${r}-${n}"
                  aria-hidden=true>
                  ${i}
                  <span
                    class=divider
                    part="divider flap-${n} divider-${r}-${n}">
                  </span>
                </span>
                <span
                  class=bottom-next
                  part="flap flap-${n} flap-${r}-${n}"
                  aria-hidden=true>
                  ${i}
                  <span
                    class=divider
                    part="divider flap-${n} divider-${r}-${n}">
                  </span>
                </span>
                <span
                  class=top
                  part="flap flap-${n} flap-${r}-${n}">
                  ${i}
                  <span 
                    class=divider
                    part="divider flap-${n} divider-${r}-${n}">
                  </span>
                </span>
                <span
                  class=bottom
                  part="flap flap-${n} flap-${r}-${n}"
                  aria-hidden=true>
                  ${i}
                  <span
                    class=divider
                    part="divider flap-${n} divider-${r}-${n}">
                  </span>
                </span>
              </span>
            `}).join(""))).join(""),"</div>"].join("")}#n(){this.#h=!0;let t=this.#o;this.shadowRoot.querySelectorAll(".char").forEach((r,a)=>{let n=Math.floor(a/this.width),i=a%this.width,d=this.characters.includes(t[n][i])?this.characters.indexOf(t[n][i]):0,s=this.characters.indexOf(this.#t[n][i]);if(s==d)return;let e=async()=>{if(t!=this.#o)return;let h=s<this.characters.length-1?s+1:0,o=this.characters[h];r.querySelector(".top-next").childNodes[0].textContent=o,r.querySelector(".bottom-next").childNodes[0].textContent=o;let c={duration:this.duration,easing:"ease-in"};await Promise.all([r.querySelector(".top").animate([{transform:"rotateX(0deg)"},{transform:"rotateX(-180deg)"}],c).finished,r.querySelector(".bottom-next").animate([{transform:"rotateX(180deg)"},{transform:"rotateX(0deg)"}],c).finished]),r.querySelector(".top").childNodes[0].textContent=o,r.querySelector(".bottom").childNodes[0].textContent=o,s=h,this.#t[n][i]=this.characters[s],s!==d&&e()};e()})}#s(t){console.error(`<hotfx-split-flap> ${t} attribute must be a positive integer; got  "${this.getAttribute(t)}"`)}}customElements.define("hotfx-split-flap",u);var f={INITIAL_DELAY:3000,FIRST_TRANSITION_DELAY:4000,DYNAMIC_CYCLE_GAP:1000,ANIMATION_DURATION:100,TIME_PER_CHANGED_CHAR:500,BASE_DISPLAY_TIME:3000},b=["IDENTITY ENTHUSIAST","NONREV TRAVELER","PARK LOVER","CINEPHILE","HOMELABBER","GEORGIAN","TEXAN","PENNSYLVANIAN"],l,p=!1;document.addEventListener("DOMContentLoaded",()=>{try{let t=document.querySelector("#app");if(!t){console.error("App element not found");return}t.innerHTML=`
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
    `,y(),setTimeout(()=>{m()},f.INITIAL_DELAY)}catch(t){console.error("Failed to initialize app:",t)}});window.addEventListener("beforeunload",()=>{g()});document.addEventListener("visibilitychange",()=>{if(document.hidden)g();else if(!p)setTimeout(()=>{m()},f.INITIAL_DELAY)});function g(){if(l)clearTimeout(l),l=void 0;p=!1}function y(){try{let t=document.querySelector(".gradient-overlay");if(!t)return;t.style.background=`
      radial-gradient(
        ellipse at center,
        transparent 20%,
        var(--bg-primary) 80%
      )
    `}catch(t){console.error("Failed to initialize gradient overlay:",t)}}function m(){try{let n=function(){if(r.length===b.length)r=[];let s=b.filter((o)=>!r.includes(o)),e=Math.floor(Math.random()*s.length),h=s[e];return r.push(h),h},i=function(s,e){let h=Math.max(s.length,e.length),o=0;for(let c=0;c<h;c++){let $=s[c]||" ",x=e[c]||" ";if($!==x)o++}return o*f.TIME_PER_CHANGED_CHAR+f.BASE_DISPLAY_TIME},d=function(){if(!p||!document.querySelector("hotfx-split-flap"))return;let s=n(),e=i(a,s);l=window.setTimeout(()=>{let h=document.querySelector("hotfx-split-flap");if(!h||!p)return;h.textContent=s,a=s,d()},e)},t=document.querySelector("hotfx-split-flap");if(!t){console.warn("Split-flap element not found, skipping title cycling");return}p=!0,t.setAttribute("duration",f.ANIMATION_DURATION.toString());let r=[],a="CYBERSECURITY ENGINEER";l=window.setTimeout(()=>{if(!p)return;let s=n(),e=document.querySelector("hotfx-split-flap");if(!e)return;e.textContent=s,a=s,l=window.setTimeout(()=>{if(p)d()},f.DYNAMIC_CYCLE_GAP)},f.FIRST_TRANSITION_DELAY)}catch(t){console.error("Failed to initialize title cycling:",t),p=!1}}
