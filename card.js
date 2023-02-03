customElements.define('flip-card', class extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }).innerHTML = `
        <link rel=stylesheet href=common.css>
        <style>
        :host {
            display:inline-block;
            width:20em;height:35em;
            perspective:100em;
        }
        article {
            width:100%;height:100%;
            transition:transform 1s;transform-style:preserve-3d;
            text-align:center;
        }
        slot {
            display:block;
            width:100%;height:100%;
            position:absolute;
            backface-visibility:hidden;-webkit-backface-visibility:hidden;
            box-shadow:0 0 1.5em rgba(0,0,0,.5);
            border-radius:1rem;
            overflow:hidden;
        }
        ::slotted(img[slot=front]) {
            width:100%;
        }
        ::slotted(h3) {
            font-size:1.75em !important;line-height:1.4em !important;
            margin:.5em 0 !important;padding:0 .5em !important;
        }
        ::slotted(button) {
            position:absolute;bottom:0;right:0;
            font-size:2em;color:white;
            transform:rotate(45deg);
            padding-right:.3em;
        }
        slot[name=back] {
            padding:1.5em 1em;
            transform:rotateX(180deg);
            background:radial-gradient(circle at 50% 100%,hsl(var(--theme-b),55%,77%),var(--theme2));
            color:white;
        }
        ::slotted([slot=back]) {
            text-align:left !important;
            font-size:1.4em !important;
        }
        ::slotted(p) {
            margin:0 auto .5em auto;
        }
        :host(.clicked)>article {
            transform:rotateX(180deg);
        }
        </style>
        <article>
            <slot name=front part=front></slot>
            <slot name=back part=back></slot>
        </article>`;
        setTimeout(() => this.callback());
    }
    callback() {
        if (!this.classList.contains('click') || this.querySelector('button')) return;
        this.querySelector('[slot=back]').insertAdjacentHTML('beforeBegin', '<button slot=front></button>');
        this.querySelector('button[slot=front]').onclick = this.shadowRoot.querySelector('slot[name=back]').onclick = () => {
            this.classList.toggle('clicked');
            this.querySelector('ribbon-curve')?.callback();
        }
    }
});
customElements.define('card-deck', class extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }).innerHTML = `
        <link rel=stylesheet href=common.css>
        <style>
        :host {
            display:block;height:38em;
            perspective:100em;perspective-origin:50% 20em;
            transform-style:preserve-3d;
            overflow:hidden;
            font-size:.85em;
        }
        ::slotted(*) {
            transform:translate3D( calc(-50% + var(--i)*20em) ,-50%, calc(var(--z)*-20em) ) rotateY(calc(var(--i)*-20deg));
            transition:transform 1s;
            position:absolute;left:50%;top:50%;
            z-index:calc(var(--z)*-1);
        }
        </style>
        <slot name=card></slot>`;
        this.shadowRoot.querySelector('slot').addEventListener('slotchange', ev => {
            (this.slotted = ev.target.assignedElements()).forEach((card, i) => {
                card.CSSvar({ i: i, z: Math.abs(i) });
                card.onclick = () => this.moveTo(i + 1);
                card.hasAttribute('checked') ? setTimeout(() => this.moveTo(i + 1)) : null;
            });
        });
    }
    moveTo(i) {
        this.slotted.forEach((card, j) =>
            card.CSSvar({ i: -i + 1 + j, z: Math.abs(-i + 1 + j) })
        );
    }
});