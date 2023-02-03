customElements.define('great-icosahedron', class extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
        this.css = `<style>
        figure {
            margin: 0;
            width: calc(var(--circumR)*var(--diameter)); height :calc(var(--circumR)*var(--diameter));
            animation:spin 30s infinite linear;
            transform-style:preserve-3d;
            border:.1em dotted yellowgreen;border-radius:9em;
        }
        figure::before,figure::after {
            border:.1em dotted yellowgreen;border-radius:9em;
            content:'';
            position:absolute;
            width:100%;height:100%;
            box-sizing:border-box;
        }
        figure::before {
            animation:before-spin 30s infinite linear alternate-reverse;
        }
        figure::after {
            animation:after-spin 30s infinite linear alternate-reverse;
        }
        @keyframes spin {
            100% {transform: rotateX(360deg) rotateY(720deg) rotateZ(1080deg);}
        }
        @keyframes before-spin {
            to {transform:rotate3d(var(--x),var(--y),var(--z),calc(1deg*var(--a)));}
        }
        @keyframes after-spin {
            to {transform:rotate3d(var(--x),var(--y),var(--z),calc(-1deg*var(--a)));}
        }
        figure,figure::before,figure::after {
            animation-play-state:var(--paused);
        }
        div, svg {
            position: absolute;
            width: calc(var(--diameter));
            overflow: visible;
            transform-style: preserve-3d;
        }
        use {
            stroke: hsl(268,100%,50%); stroke-width: var(--stroke);
            fill: hsl(var(--c),50%,50%,.8);
        }
        div:nth-of-type(odd) {
            transform: translateZ(calc(var(--safari)*var(--inR)*var(--diameter)/2));
        }
        div:nth-of-type(even) {
            transform: rotateY(180deg) translateZ(calc(var(--safari)*var(--inR)*var(--diameter)/2));
        }
        div svg {
            transform-origin: 50% 50% calc(var(--diameter)*var(--inR)/-2);
            transform: rotate(var(--centerA)) rotateY(calc(-1*var(--slant)));
        }
        div:nth-of-type(n+3) svg {
            transform: rotate(calc(var(--centerA) + 36deg)) rotateY(calc(-1*var(--midSlant)));
        }
        </style>`;
        [this.face, this.side, this.portion, this.around] = [20, 3, 5, 5];
        setTimeout(() => this.callback());
    }
    get stroke() {
        return this.getAttribute('stroke');
    }
    get elements() {
        const svg = document.createElement('svg');
        svg.innerHTML = `
        <defs>
            <polygon id=${this.side} points='${Gon.points(this.side)}'></polygon>
        </defs>`;

        const fillSVG = n => new Array(n).fill(`<svg><use href=#${this.side} /></svg>`).join('');
        const figure = document.createElement('figure');
        figure.innerHTML = new Array(Math.floor(this.face / this.portion)).fill(`<div>${fillSVG(this.portion)}</div>`).join('')
            + (fillSVG(this.face % this.portion) || '');

        figure.querySelectorAll('svg').forEach(svg => svg.setAttribute('viewBox', '-1,-1 2,2'));
        for (let i = 1; i <= this.around; i++)
            figure.querySelectorAll(`div svg:nth-child(${i})`).forEach(svg => svg.style.setProperty('--centerA', 360 / this.around * i + 'deg'));

        return svg.outerHTML + figure.outerHTML;
    }
    callback() {
        this.shadow.innerHTML = this.css + this.elements;
        this.figure = this.shadow.querySelector('figure');
        this.variables();
        setTimeout(() => this.color());
        ['--x', '--y', '--z', '--a'].forEach(p => this.style.setProperty(p, Math.random() * 360 + 360));
    }
    color() {
        [
            [[1, 1], [2, 1], [3, 4], [4, 4]],
            [[1, 2], [2, 5], [3, 5], [4, 3]],
            [[1, 3], [2, 4], [3, 1], [4, 2]],
            [[1, 4], [2, 3], [3, 2], [4, 1]],
            [[1, 5], [2, 2], [3, 3], [4, 5]]
        ].forEach((colgroup, i) => colgroup.forEach(([g, t]) =>
            this.shadowRoot.querySelector(`div:nth-of-type(${g}) svg:nth-child(${t}) use`).style.setProperty('--c', 230 + i * 30)
        ));
    }
    static get observedAttributes() {
        return ['stroke', 'diameter'];
    }
    variables(...others) {
        this.gon = new Gon(this.side, this.stroke);
        [
            ['--stroke', this.stroke],
            ['--diameter', this.getAttribute('diameter') + 'em'],
            ['--slant', (this.face == 12 ? Math.PI - this.constant.foldA : this.constant.slant) + 'rad'],
            ['--inR', this.constant.inR * this.gon.side],
            ['--circumR', 1 || this.constant.circumR * this.gon.side],
            ['--midSlant', this.constant.foldA - this.constant.slant + 'rad'],
            ['--safari', + !/^((?!chrome|android).)*safari/i.test(navigator.userAgent)],
            ...others
        ].forEach(([p, v]) => this.figure.style.setProperty(p, v));
    }
    attributeChangedCallback() {
        if (!this.figure)
            return () => this.callback()();
        this.variables();
    }
    get constant() {
        let [inR, circumR] = [(3 * Math.sqrt(3) + Math.sqrt(15)) / 12, Math.sqrt(10 + 2 * Math.sqrt(5)) / 4];
        return ({
            inR: Math.sqrt(3) * (Math.sqrt(5) - 3) / 12,
            circumR: Math.sqrt(11 - 4 * Math.sqrt(5)) / 2,
            foldA: Math.acos(Math.sqrt(5) / -3),
            slant: Math.PI / 2 - Math.asin(inR / circumR),
        });
    }
});
class Gon {
    constructor(n, stroke = 0, r = 1) {
        this.n = n;
        this.r = r;
        this.stroke = parseFloat(stroke);
    }
    static points(n, r = 1, start = 0, alt = false) {
        const point = i => [Math.cos(2 * Math.PI / n * i + start), Math.sin(2 * Math.PI / n * i + start)].map(c => Math.round(c * r * 100000) / 100000);
        const points = [...Array(n).keys()].map(i => [...point(i), ...n < 6 ? point(i) : []]).flat();
        return (alt ? [...points.slice(2), ...points.slice(0, 2)] : points).join(' ');
    }
    get halfA() { return Math.PI * (1 - 2 / this.n) / 2; }
    get centerA() { return 2 * Math.PI / this.n; }
    get normal() { return this.r * Math.sin(this.halfA) + this.stroke / 2; }
    get side() { return this.normal / Math.tan(this.halfA) * 2; }
    get strokedR() { return this.normal / Math.sin(this.halfA); }
    get height() { return this.strokedR * (1 + Math.cos(this.centerA / 2)); }
    get truncatedR() { return this.r * Math.sin(this.halfA) / Math.sin(Math.PI - new Gon(this.n * 2).centerA / 2 - this.halfA); }
}