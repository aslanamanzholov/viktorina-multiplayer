import { AvatarComponent } from '../../components/avatar/avatar.js';
import { ListComponent } from '../../components/list/list.js';
import { CellComponent } from '../../components/gameBoardCell/cell.js';
import { CardComponent } from '../../components/card/card.js';
import { ContainerComponent } from '../../components/_new/container/container.js';
import { GameBoardComponent } from '../../components/gameBoard/gameBoard.js';
import { SelectAnswerScene }  from './selectAnswer.js';
import { EndGameScene } from './endGame.js';
import { GameScene }    from './index.js';
import bus from '../../modules/bus.js';

export class PlayingScene extends GameScene {
    constructor(root) {
        super(root);
        this.CELL_COUNT = 8;
        this.cells = [];
        this.availableCells = [];
        this.gameBoard = null;

        this.selectAnswerScene = new SelectAnswerScene(root);
        this.endGameScene = new EndGameScene(root);

        this._packsSection = document.createElement('section');
        this._packsSection.className = 'packs-section';

        bus.on('fill-pack-list', this.updatePackList);
        bus.on('fill-cells', this.fillCells);
        bus.on('selected-cell', this.onSelectedCell);
        bus.on('answered-cell', this.onAnsweredCell);
        bus.on('success:get-available-cells', this.onGetAvailableCells);
        bus.on('set-current-player', this.onChangePlayer);

        this.render();
    }

    get packsSection() {
        return this._packsSection.outerHTML;
    }

    set packsSection(data) {
        const ps = document.getElementsByClassName('packs-section')[0];
        ps.innerHTML = data;
    }

    render() {
        this.avatarMe = new AvatarComponent({ customClasses: 'avatar_game-board' });
        const leftContainer = new ContainerComponent({
            customClasses: 'container__col-w25',
            content: `${this.avatarMe.template} ${this.packsSection}`
        });

        this.avatarOponent = new AvatarComponent({ customClasses: 'avatar_game-board' });
        const rightContainer = new ContainerComponent({
            customClasses: 'container__col-w25',
            content: this.avatarOponent.template
        });

        for (let i = 0; i < this.CELL_COUNT ** 2; i++) {
            const newCell = new CellComponent();
            this.cells.push(newCell);
        }
        this.gameBoard = new GameBoardComponent(this.cells.map(cell => cell.template));

        const centreContainer = new ContainerComponent({
            customClasses: 'container__col-w50',
            content: this.gameBoard.template
        });

        this.root.insertAdjacentHTML('beforeend', `
                ${leftContainer.template}
                ${centreContainer.template}
                ${rightContainer.template}
            `);

        this.root.style.background = 'linear-gradient(180deg, #ffffff 50%, #f3f3f3 50%)';
    }

    updatePackList = (packs) => {
        packs.unshift({
            name: 'Приз',
            color: '#0c5460'
        });

        const _list = [];
        packs.forEach(pack => {
            const cell = new CellComponent({
                customClasses: 'game-board__cell_pack',
                bgColor: pack.color,
                type: 'pack-description'
            });

            _list.push({
                customClasses: 'list__item_sticky',
                text: `${cell.template} <span class="pack-name">${pack.name}</span>`
            });
        });

        const list = new ListComponent({
            list: _list
        });
        const card = new CardComponent({
            customClasses: 'card_pack shadow-l',
            body: list.template
        });

        this.packsSection = card.template;
    };

    fillCells = (data) => {
        const count = data.length;
        let i = 0;

        const timer = setInterval(() => {
            const d = data[i];
            const cell = this.cells[i].innerElem;
            cell.dataset.type = d.type;
            cell.style.backgroundColor = d.color;

            if (d.type === 'question') {
                cell.dataset.id = i;
            }

            if (++i >= count) clearInterval(timer);
        }, 10);
    };

    onChangePlayer = (pl) => {
        if (pl === 'me') {
            this.gameBoard.on('click', this.chooseQuestion);
        } else {
            this.gameBoard.off('click', this.chooseQuestion);
        }
    };

    chooseQuestion = (event) => {
        const target = event.target;
        if ('type' in target.dataset && target.dataset.state === 'active') {
            const type = target.dataset.type;
            if (type === 'question') {
                bus.emit('selected-cell', +target.dataset.id);
            } else if (type === 'prize') {
                bus.emit('selected-prize');
            }
        }
    };

    onAnsweredCell = (answer) => {
        const cell = this.cells[this.selectedCell];
        if (answer) {
            cell.setAnswered();
        } else {
            cell.setFailed();
        }
        bus.emit('set-answered-cell', { id: this.selectedCell, answer });
    };

    onGetAvailableCells = (availableCells) => {
        this.availableCells = availableCells;
        availableCells.forEach(i => this.cells[i].setActive());
    };

    onSelectedCell = (id) => {
        this.selectedCell = id;
        this.availableCells.forEach(i => this.cells[i].setDeActive());
        this.availableCells = [];
    };

    destroy() {
        super.destroy();
        this.selectAnswerScene.destroy();
        this.endGameScene.destroy();

        bus.off('fill-pack-list', this.updatePackList);
        bus.off('fill-cells', this.fillCells);
        bus.off('selected-cell', this.onSelectedCell);
        bus.off('answered-cell', this.onAnsweredCell);
        bus.off('success:get-available-cells', this.onGetAvailableCells);
        bus.off('set-current-player', this.onChangePlayer);
    }
}
