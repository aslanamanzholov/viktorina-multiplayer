import { PaginationComponent } from '../pagination/pagination.js';

export class BoardComponent {
    _template;
    _players = [];
    _pager;

    constructor() {
        this._render();
        this._getLeaders(1);
    }

    get template() {
        return this._template;
    }

    _render() {
        this._template = Handlebars.templates.board({
            players: this._players
        });
    }

    _getLeaders(page) {
        bus.emit('get-leaders', page);
        bus.on('success:get-leaders', (players) => {
            players.forEach(item => {
                this._players.push({
                    name: item.nickname,
                    win: item.won,
                    lost: item.lost,
                    playingTime: item.play_time
                });
            });
            const pageCount = res.pages_total;
            const currentPage = res.page; // eslint-disable-line

            const pager = new PaginationComponent({
                baseUrl:    'scoreboard',
                pagesNumber: pageCount
            });

            this._template = Handlebars.templates.board({
                players: this._players
            }) + pager.template;

            this._pager = pager;
            this.runGetScoreboardByPage()
        });
    }

    runGetScoreboardByPage() {
        this._pager.on('click', (event) => {
            let target = event.target;
            if (!(target instanceof HTMLAnchorElement)) {
                return;
            }

            event.preventDefault();
            this._getLeaders(target.innerText);
        });
    }
}
