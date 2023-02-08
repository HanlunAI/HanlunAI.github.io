customElements.define('book-page', class extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }).innerHTML = `
        <link rel=stylesheet href=common.css>
        <style>
        :host {
            display:inline-block;
            perspective:100em;
            text-align:left;
            font-size:.9em;
        }
        slot::after {
            content: '';
            width: 100%;height: 100%;
            position:absolute;left:0;top:0;z-index:1;
            pointer-events: none;
        }
        slot[name=front]::after {
            background:linear-gradient(to right, rgba(0,0,0,0.1), transparent);
        }
        slot[name=back]::after {
            background:linear-gradient(to left, rgba(0,0,0,0.1), transparent);
        }
        slot {
            display:block;
            width:100%;height:100%;
            position:absolute;
            backface-visibility:hidden;-webkit-backface-visibility:hidden;
            overflow:hidden;
            background:#fefdfb;
            z-index:0;
        }
        slot,::slotted(header) {
            box-shadow:inset 0 0 .2em rgb(0 0 0 / 25%),inset -.1em -.1em .1em rgb(0 0 0 / 10%) !important;
        }
        :host(.cover) slot[name=front] {
            display:flex;align-items:flex-end;
            text-align:right;
        }
        slot[name=back] {
            transform:rotateY(180deg);
            box-shadow:inset 0 0 .2em rgb(0 0 0 / 25%),inset .1em -.1em .1em rgb(0 0 0 / 10%) !important;
        }
        :host(.cover) slot[name=back] {
            display:flex;flex-direction:column;justify-content:space-between;
            padding:1em;
        }
        ::slotted(header) {
            display:flex;justify-content:space-between;align-items:center;
            background:var(--theme1);
        }
        ::slotted(article) {
            margin:1em;
        }
        ::slotted(aside) {
            font-size:.75em;
            padding-top:.5em;
            border-top:.1em solid;
        }
        </style>
        <template>
            <header slot>
                <button data-goto></button>
                <button data-goto></button>
            </header>
        </template>
        <slot name=front part=front></slot>
        <slot name=back part=back></slot>`;
    }
});
customElements.define('turn-book', class extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }).innerHTML = `
        <link rel=stylesheet href=common.css>
        <style>
        :host {
            display:block;
            overflow:hidden;
            padding:6em 0 !important;margin:-3em auto !important;
            width:55em;transition:width 1s;
        }
        #book,::slotted(*),#spine {
            transition:transform 1s;transform-style:preserve-3d;transform-origin:left;
        }
        #book {
            --magnifier:min(1.2em,4.8vw);font-size:var(--magnifier);
            width:20em;height:34em;max-width:100%;
            perspective:100em;
            --spacing:5px;
            margin:auto;
        }
        ::slotted(*) {
            position:absolute;
            width:100%;height:100%;
            transform:translateZ(calc(-1*var(--spacing)*var(--z)));
        }
        #spine {
            position:absolute;left:calc(50% - 1em);top:-1%;
            width:calc(var(--spacing)*(var(--n) - 1));height:102%;
            background:hsl(var(--theme-h),33%,60%);
            transform:rotateY(90deg);
        }
        #spine::before,#spine::after {
            content:'';
            position:absolute;top:0;
            width:1em;height:100%;
            background:linear-gradient(to right,rgb(70,70,70),rgb(50,50,50));
            box-shadow:inset .1em -.1em .1em rgb(0 0 0 / 15%) !important;
            transition:opacity 1s;
        }
        :host(:not([reading=right-0])) #spine::after {
            opacity:0;transition-delay:.2s;
        }
        #spine::before {
            left:100%;
            transform-origin:left;transform:rotateY(-90deg);
        }
        #spine::after {
            right:100%;
            transform-origin:right;transform:rotateY(90deg);
        }
        @media (max-width:750px) {
            :host([reading|=left]) #book {
                transform:translate3d(50%,0,100px);
            }
            :host([reading|=right]) #book {
                transform:translate3d(-50%,0,100px);
            }
        }
        :host([reading='right-0']) #book {
            transform:translate3d(-44%,0,100px) rotateY(-20deg);
        }
        ::slotted(.cover) {
            width:102%;height:102%;
            top:-1%;
        }
        ::slotted(.cover)::before {
            content:'';
            position:absolute;left:100%;top:0;
            width:.3em;height:100%;
            background:grey;
            transition:transform 1s;transform:rotateY(90deg);transform-origin:left;
        }
        ::slotted(.cover.turned)::before {
            transform:rotateY(90deg) translate(-100%);
        }
        ::slotted(.turned) {
            transform:translateZ(calc(-1*var(--spacing)*var(--z))) rotateY(-180deg);
        }
        ::slotted([style*='0']) {
            transform:translateZ(calc(-1*var(--spacing)*var(--z))) rotateY(-10deg);
        }
        ::slotted(.turned[style*='0']) {
            transform:translateZ(calc(-1*var(--spacing)*var(--z))) rotateY(-170deg);
        }
        </style>
        <slot name=page></slot>
        <div id=book>
            <slot name=paper></slot>
            <div id=spine></div>
        </div>`;
        this.shadowRoot.querySelector('slot[name=paper]').addEventListener('slotchange', ev => 
            (this.slotted = ev.target.assignedElements()).reverse().forEach((page, i) => page.CSSvar({z: i}))
        );
        setTimeout(() => {
            this.cover();
            this.contents();
            this.bookbind();
            this.paginate();
            this.dragMove();
            this.popImage();
            this.instruct();
        }, 100);
    }
    cover() {
        const cover = document.createElement('h3');
        cover.slot = 'page';
        cover.setAttribute('data-page', 0);
        cover.innerHTML = `${this.id.replace(/([A-Z])/g, ' $1')}<br><small>Hanlun AI</small>`;
        this.prepend(cover);
    }
    contents() {
        if (this.getAttribute('auto-contents') == null) 
            return;
        const contents = {};
        this.querySelectorAll('article h4').forEach(h4 => {
            contents[h4.innerText] ??= {page: h4.parentNode.getAttribute('data-page'), tasks: []}
        });
        this.querySelectorAll('article h5').forEach(h5 => {
            contents[h5.parentNode.querySelector('h4')?.innerText]?.tasks.push([h5.parentNode.getAttribute('data-page'), h5.innerText]);
        });
        const ul = document.createElement('ul');
        ul.slot = 'page';
        ul.setAttribute('data-page', 1);
        ul.innerHTML = Object.entries(contents).map(([project, {page, tasks}]) => 
            `<li><h4 data-goto=${page}>${project}</h4><ul>` + tasks.map(([page, h5]) => `<li data-goto=${page}>${h5}`).join('') + '</ul>'
        ).join('');
        this.querySelector('h3').after(ul);
    }
    bookbind() {
        let newPaper, h4;
        if (!this.querySelector('article+div'))
            this.insertAdjacentHTML('beforeend', '<div slot=page></div>' + (this.querySelectorAll('[slot=page]').length % 2 == 1 ? '<div slot=page></div>' : ''));
        this.querySelectorAll('[slot=page]').forEach((page, i, pages) => {
            page.slot = i % 2 == 0 ? 'front' : 'back';
            if (i % 2 == 0) 
                newPaper = document.createElement('book-page');
            if (page.tagName != 'UL' && (h4 = page.querySelector('h4'))) {
                h4.setAttribute('data-goto', 1);
                const header = newPaper.shadowRoot.querySelector('template').content.cloneNode(true);
                header.querySelector('header').slot = page.slot;
                header.querySelector('button:first-of-type').after(h4);
                header.querySelector('button:first-of-type').setAttribute('data-goto', i - 1);
                header.querySelector('button:last-of-type').setAttribute('data-goto', i + 1);
                newPaper.append(header);
            }
            if (i == 0 || i == pages.length - 1)
                newPaper.classList.add('cover');
            if (i == pages.length - 1)
                newPaper.setAttribute('data-goto', 0);
            newPaper.slot = 'paper';
            newPaper.append(page);
            this.prepend(newPaper);
        });
        this.CSSvar({n: this.querySelectorAll('book-page').length});
    }
    paginate() {
        this.querySelectorAll('[data-goto]').forEach(link => link.onclick = ev => {
            ev.stopPropagation();
            this.moveTo(link.getAttribute('data-goto'));
        });
        [...this.querySelectorAll('book-page')].map(p => 
            [...p.shadowRoot.querySelectorAll('slot')]
        ).flat().reverse().forEach((page, i) =>
            page.onclick = () => this.moveTo(i)
        );
    }
    dragMove() {
        let press;
        this.ontouchstart = this.onmousedown = ev => press = ev.clientX ?? ev.touches[0].clientX;
        this.ontouchmove = this.onmousemove = ev => {
            if (press == null) return;
            const moved = press - (ev.clientX ?? ev.touches[0].clientX);
            const [LR, page] = this.getAttribute('reading').split('-');
            if (moved > 100 && LR == 'left')
                this.moveTo(parseInt(page) + 1);
            else if (moved < -100 && LR == 'right')
                this.moveTo(parseInt(page) - 1);
        };
        this.ontouchend = this.onmouseup = () => press = null;
    }
    popImage() {
        this.querySelectorAll('article img').forEach(img => {
            const figure = document.createElement('figure');
            figure.append(img.cloneNode());
            const button = document.createElement('button');
            figure.prepend(button);
            img.replaceWith(figure);
            button.setAttribute('onclick', 'event.stopPropagation();window.open(this.nextElementSibling.src);');
        });
    }
    instruct() {
        this.querySelector('book-page:last-child').insertAdjacentHTML('beforeend', `
        <aside slot=back>
            To turn the pages:
            <ul>
                <li>Click on the page</li>
                <li>Click on the arrows at the top of the page</li>
                <li>Drag the book to left or right on touch devices</li>
            </ul><br>
            To navigate:
            <ul>
                <li>Click on the lines on this page to jump to the section</li>
                <li>Click on the header at the top of the page to return to this page</li>
            </ul>
        </aside>`)
    }
    moveTo(i) {
        this.setAttribute('reading', `${i % 2 == 0 ? 'right' : 'left'}-${i}`);
        i = Math.round(i / 2);
        this.slotted.forEach((page, j) => {
            page.CSSvar({ z: j < i ? i - j - 1 : j - i });
            page.classList[j < i ? 'add' : 'remove']('turned');
        });
    }
});