HTMLElement.prototype.CSSvar = function(obj) {Object.entries(obj).forEach(([n, v]) => this.style.setProperty(`--${n}`, v));}

customElements.define('dual-nav', class extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }).innerHTML = `
        <link rel=stylesheet href=common.css>
        <style>
        :host {
            display:flex;justify-content: space-between;
            position:fixed;top:0;
            width:100%;height:3em;
            z-index:99;
            padding:0 1em;
            background:linear-gradient(to right,var(--theme2),var(--theme1) 30%,var(--theme1) 70%,var(--theme3));
            filter:drop-shadow(0 0 .2em rgba(0,0,0,0.5));        
        }
        ::slotted(*),label {
            font-size:1.3em !important;
            cursor:pointer !important;
            color:var(--light2) !important;
            text-align:center;
        }
        label {
            font-size:1.5em !important;
        }
        slot {
            display:flex;justify-content:space-evenly;align-items:center;
            width:50%;
        }
        label {
            display:none;
            font-family:'header';
            width:50%;
        }
        label[for=right]::after {
            content:attr(data-icon);
            font-family:FA,FAb;
            margin-left:.25em;
        }
        label[for=right]::before {
            content:initial;
        }
        #logo {
            padding:.5em;
            position:relative;
            height:3.6em;width:3.6em;
        }
        #logo::before {
            content:'';
            position:absolute;bottom:0;left:50%;transform:translate(-50%,0);
            z-index:-1;
            width:90%;
            box-sizing:content-box;
            border-color:var(--theme1) transparent transparent transparent;
            border-width:1.6rem 1.6rem 0 1.6rem;border-style:solid;
        }
        img {
            width:3.5em;
        }
        ::slotted(*)::before,::slotted(*)::after {
            display:inline-block;
            width:1.2em;
            text-align:center;
        }
        @media (max-width:850px) {
            :host {
                padding:0 .5em;
                font-size:.9em;
            }
            label {
                display:flex;align-items:center;
            }
            label[for=right] {
                justify-content:flex-end;
            }
            slot {
                display:none;
            }
            input:checked+slot {
                display:block;
                position:absolute;top:100%;left:0;
                width:100%;
                background:hsla(var(--theme-h),33%,70%,.8);
                z-index:-2;
            }
            ::slotted(*) {
                display:block !important;
                padding:.2em .5em !important;
                color:var(--theme1) !important;
            }
            slot[name=left] {
                text-align:left;
            }
            slot[name=right] {
                text-align:right;
            }
        }
        </style>
        <input type=checkbox id=left>
        <slot name=left></slot>
        <label for=left data-icon=>Info</label>
        <a href=# id=logo><img src=assets/logo.svg#r alt='○○ Artifical Intelligence Limited'></a>
        <input type=checkbox id=right>
        <slot name=right></slot>
        <label for=right data-icon=>Work</label>`;
        setTimeout(() => this.callback());
    }
    callback() {
        const [buttonL, buttonR] = ['#left', '#right'].map(b => this.shadowRoot.querySelector(b));
        setTimeout(() => {
            buttonL.onchange = ev => buttonR.checked = ev.target.checked && false;
            buttonR.onchange = ev => buttonL.checked = ev.target.checked && false;
            this.shadowRoot.querySelector('slot[name=left]').assignedElements().forEach(a => a.addEventListener('click', () => 
                buttonL.checked = false));
            this.shadowRoot.querySelector('slot[name=right]').assignedElements().forEach(a => a.addEventListener('click', () => 
                buttonR.checked = false));
        });
    }
});

customElements.define('ribbon-curve', class extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }).innerHTML = `
        <link rel=stylesheet href=common.css>
        <style>
        :host {
            display:block;
            width:100%;
            background:linear-gradient(to right,hsl(200,80%,70%),hsl(var(--theme-b),80%,70%),hsl(var(--theme-h),80%,70%),hsl(330,80%,70%));
        }
        </style>`;
        setTimeout(() => this.callback());
    }
    callback() {
        let [start, height, pointsUp, pointsDown] = [0, this.getAttribute('height'), '', ''];
        const move = () => this.offsetWidth / 10 * (1 + Math.random() * 2);
        const [pointsU, pointsD] = [x => `${x},${Math.random() * height / 4 + 10}`, x => `${x},${height - Math.random() * height / 4 + 10}`];
        while (start < this.offsetWidth + 50) {
            start += move();
            pointsUp += ` S ${pointsU(start)} `;
            start += move();
            pointsUp += pointsU(start);
        }
        while (start > 0) {
            start -= move();
            pointsDown += ` S ${pointsD(start)} `;
            start -= move();
            pointsDown += pointsD(start);
        }
        this.style.clipPath = `path('M 0,0 ${pointsUp} v ${height} ${pointsDown} z')`;
        this.style.height = `${height * 1.5}px`;
    }
});

customElements.define('img-blind', class extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open'}).innerHTML = `
        <link rel=stylesheet href=common.css>
        <style>
        :host {
            display:block;
        }
        div {
            position:relative;
            height:calc(100%/var(--pieces));
            transform:rotateX(calc(var(--s)*-120deg));transform-style:preserve-3d;
            transition:1s;
        }
        figure {
            position:absolute;left:0;top:0;
            width:100%;height:100%;
            background:url(/assets/office.jpg) 0 calc(var(--i)*100%/(var(--pieces) - 1)) / cover;
            transform:translateZ(var(--inR));
            border:.01em solid grey;
        }
        figure::after {
            content:'';
            position:absolute;left:0;
            width:100%;height:100%;
            background:black;opacity:.5;transition:opacity 1s;
        }
        figure.showing::after {
            opacity:0;
        }
        figure:nth-child(2) {
            background:url(/assets/sphere.png) 0 calc(var(--i)*100%/(var(--pieces) - 1)) / cover;
            transform:rotateX(120deg) translateZ(var(--inR)) ;
        }
        figure:last-child {
            background:url(/assets/view.jpg) 0 calc(var(--i)*100%/(var(--pieces) - 1)) / cover;
            transform:rotateX(240deg) translateZ(var(--inR));
        }
        </style>`;
        setTimeout(() => this.callback());
    }
    callback() {
        if (this.shadowRoot.querySelector('div')) return;
        this.create();
        this.spin();
    }
    create() {
        const pieces = this.getAttribute('pieces');
        this.CSSvar({pieces: pieces});
        for (let i = 1; i <= pieces; i++) {
            const div = document.createElement('div');
            div.CSSvar({i: i - 1});
            this.shadowRoot.appendChild(div);
            for (let j = 0; j < 3; j++)
                this.shadowRoot.querySelector('div:last-child').appendChild(document.createElement('figure'));
        }
        setTimeout(() => this.CSSvar({inR: this.shadowRoot.querySelector('div').offsetHeight / 2 / Math.sqrt(3) + 'px'}));
    }
    spin() {
        this.shadowRoot.querySelectorAll('figure:first-child').forEach(fig => fig.classList.add('showing'));
        let s = 0;
        setInterval(() => {
            s++;
            this.shadowRoot.querySelectorAll(`div`).forEach(div => 
                setTimeout(() => {
                    div.CSSvar({s: s})
                    div.querySelectorAll('figure').forEach((fig, i) => 
                        fig.classList[s % 3 == i ? 'add' : 'remove']('showing')
                    )
                }, Math.random() * 500)
            );
        }, 4000);
    }
});