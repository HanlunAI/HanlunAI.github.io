customElements.define('spin-arrow', class extends HTMLElement {
    static observedAttributes = ['width', 'height', 'depth', 'head'];
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }).innerHTML = `
        <link rel=stylesheet href=common.css>
        <style>
        :host {
            display:block;
            width:calc(var(--width) + var(--head)/2);height:var(--height);
            transform-style:preserve-3d;
            animation:spin 10s infinite alternate;
            margin:10em;
        }
        @keyframes spin {
            50% {transform:rotate3d(-2,3,-2,-190deg);}
            to {transform:rotate3d(2,3,-2,90deg);}
        }
        *,*::before,*::after {
            content:'';
            transform-style:preserve-3d;
            position:absolute;
        }
        [class|=arrow] {
            width:var(--width);height:var(--height);
            background:linear-gradient(to left,yellow,yellowgreen);
        }
        [class|=arrow]::after {
            border-style:solid;
            border-width:calc(var(--head)/2) 0 calc(var(--head)/2) calc(var(--head)/2);
            border-color:transparent transparent transparent yellow;
            left:100%;top:50%;transform:translate(0,-50%);
        }
        .arrow-2 {
            transform:rotateX(180deg) translateZ(calc(var(--depth)*-1));
        }
        .end {
            background:turquoise;
            width:var(--depth);height:var(--height);
            transform:rotateY(-90deg) translate3d(50%,0,calc(var(--depth)/2));
        }
        .end::before,.end::after {
            background:pink;
            height:var(--width);width:var(--depth);
            left:0;
        }
        .end::before {
            top:100%;
            transform:translate3d(0,-50%,calc(var(--width)/-2)) rotateX(90deg);
        }
        .end::after {
            bottom:100%;
            transform:translate3d(0,50%,calc(var(--width)/-2)) rotateX(90deg);
        }
        [class|=head] {
            background:turquoise;
            width:var(--depth);height:calc((var(--head) - var(--height))/2);
            left:var(--width);
            transform:translate3d(-50%,0,calc(var(--depth)/2)) rotateY(90deg);
        }
        [class|=head]::before {
            background:red;
            width:inherit;height:calc(var(--head)*1.414/2);
            left:0;bottom:100%;
            transform:translate3d(0,calc(var(--head)*1.414/2),calc(var(--head)*1.414/4)) rotateX(-135deg);
        }
        .head-1 {
            bottom:100%;
        }
        // .head-2 {
        //     top:100%;
        // }
        </style>
        <div class=arrow-1></div>
        <div class=arrow-2></div>
        <div class=end></div>
        <div class=head-1></div>
        <!--div class=head-2></div-->`;
    }
    connectedCallback() {
        ['width', 'height', 'depth', 'head'].forEach(attr => this.style.setProperty(`--${attr}`, this.getAttribute(attr)));
    }
})
customElements.define('icosi-dodeca-hedron', class extends HTMLElement {
    constructor() {
        super();
        (this.shadow = this.attachShadow({mode:'open'})).innerHTML = `
        <style>
        :host {
            position:relative;
            display:block;
            animation:spin 30s infinite linear;
            transform-style:preserve-3d;
        }
        @keyframes spin {
            100% {transform: rotateX(360deg) rotateY(720deg) rotateZ(1080deg);}
        }
        hedron-p {
            position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
            transform-style:preserve-3d;
        }
        </style>
        <hedron-p exportparts='solid:dodeca' face='12' diameter='6' stroke='0.02' truncate='full'></hedron-p>
        <hedron-p exportparts='solid:icosa' face='20' diameter='6' stroke='0.02' truncate='full'></hedron-p>`;
    }
    connectedCallback() {
        const Q = sel => this.shadow.querySelector(sel);
        const Qf = (sel, prop) => Q(sel).shadowRoot.querySelector('figure').style.getPropertyValue(prop);
        Q('hedron-p[face="20"]').setAttribute('diameter', Q('hedron-p[face="20"]').getAttribute('diameter') * Qf('hedron-p[face="12"]', '--edge') / Qf('hedron-p[face="20"]', '--edge'));
    }
});
customElements.define('layers-depth', class extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }).innerHTML = `
        <link rel=stylesheet href=common.css>
        <style>
        :host {
            display:block;
            overflow:hidden;
            perspective:${this.step = 50}rem;
        }
        ol {
            display:flex;justify-content:space-between;
            font-size:1.5em;
            list-style:none;
            padding:0;
        }
        ol li {
            padding:.25em .5em;
            border:.1em solid plum;border-radius:.25em;
            cursor:pointer;
        }
        li.checked {
            background:plum;
        }
        slot {
            display:block;
            --step:${this.step}rem;
            transform-style:preserve-3D;
            transition:transform 1s;
            transform:rotateY( calc(var(--flip,0)*1deg) ) rotate(calc(var(--angle,0deg)*-1)) translate3D(var(--left,0),var(--top,0),calc( var(--step)*(-1/4*(var(--flip,0)/90 - 1) + var(--checked,0)) ));
            pointer-events:none;
        }
        ::slotted(*) {
            position:absolute;left:50%;top:50%;
            transform:translate3D( calc(-50% - var(--left)), calc(-50% - var(--top)), calc(var(--step)*var(--i)*-1) ) rotate(var(--angle)) rotateY( calc(var(--flip)*1deg) );
        }
        ::slotted(:first-child),::slotted(.checked) {
            pointer-events:auto;
        }
        </style>
        <ol></ol>
        <slot name=layer></slot>`;
        this.shadowRoot.querySelector('slot').addEventListener('slotchange', ev =>
            (this.slotted = ev.target.assignedElements()).forEach((layer, i) => {
                HTMLElement.CSSvar(layer, { i: i, angle: (i && (Math.random() - .5) * 180) + 'deg', flip: i && Math.round(Math.random()) * 180, left: (i && (Math.random() - .5) * 40) + 'rem', top: (i && (Math.random() - .5) * 40) + 'rem' });
                layer.title ? this.createMenu(layer.title, i) : null;
                layer.onclick = () => this.moveTo(i + 1);
                if (layer.offsetHeight > this.offsetHeight)
                    this.shadowRoot.querySelector('slot').style.height = layer.offsetHeight * 2 + 'px';
            })
        );
    }
    createMenu(title, i) {
        const li = document.createElement('li');
        li.textContent = title;
        li.onclick = () => this.moveTo(i);
        this.shadowRoot.querySelector('ol').appendChild(li);

    }
    moveTo(i) {
        let next = this.slotted[i], left, top, angle, flip;
        next ? [left, top, angle, flip] = ['left', 'top', 'angle', 'flip'].map(p => next.style.getPropertyValue(`--${p}`)) : i = 0;
        HTMLElement.CSSvar(this.shadowRoot.querySelector('slot'), { checked: i, angle: angle || '0deg', flip: flip || '0', left: left || 0, top: top || 0 });
        this.shadowRoot.querySelectorAll('ol li').forEach(li => li.classList[li.textContent == next?.title ? 'add' : 'remove']('checked'));
        this.slotted.forEach((el, j) => el.classList[i == j ? 'add' : 'remove']('checked'));
    }
});

