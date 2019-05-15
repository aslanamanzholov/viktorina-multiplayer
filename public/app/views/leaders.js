import { BoardComponent }  from '../components/scoreboard/board.js';
import { HeaderComponent } from '../components/header/header.js';
import { IconComponent }   from '../components/icon/icon.js';
import { LinkComponent }   from '../components/link/link.js';
import { ContainerComponent } from '../components/container/container.js';
import { BaseView } from './base.js';
import bus from '../modules/bus.js';

export class LeadersView extends BaseView {
    _pageTitle;

    constructor(el) {
        super(el);
        this._pageTitle = 'Таблица лидеров';
        this._render();
    }

    get pageTitle() {
        return this._pageTitle;
    }

    get backBtn() {
        const link = new LinkComponent({
            className: 'link_primary',
            href: '',
            dataHref: '/',
            text: '',
            icon: {
                customClasses: 'md-48',
                name: 'arrow_forward_ios'
            }
        });

        this._backBtn = new ContainerComponent({
            customClasses: 'w3 container_theme-primary2 align-items-center justify-content-center',
            content: link.template
        });

        return this._backBtn;
    }

    get _header() {
        const leaderIcon = new IconComponent({
            customClasses: 'md-inherit md-48',
            name: 'poll'
        });

        return new HeaderComponent({
            title: `${leaderIcon.template} Leader Board`
        });
    }

    _render() {
        const board = new BoardComponent();
        const container = new ContainerComponent({
           customClasses: 'container_column w97 container_theme-secondary1 align-items-center justify-content-center',
           content: `
              ${this._header.template}
              ${board.template}
           `
        });

        super.renderContainer({
            customClasses: 'container_skewed h100 container__absolute',
            container: `
                ${container.template}
                ${this.backBtn.template}
            `,
        });

        this._backBtn.href = '/';
        bus.emit('fetch-leaders');
    }
}
