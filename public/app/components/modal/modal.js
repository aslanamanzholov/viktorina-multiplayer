import { uniqueId } from '../../modules/utils.js';

export class ModalComponent {
    _body;
    _customClasses;
    _header;
    _template;

    constructor({
        customClasses = '',
        header = '',
        body = ''
    } = {}){
        this._customClasses = customClasses;
        this._header = header;
        this._body = body;
        this._id = `modal_${uniqueId()}`;
        this._render();
    }

    get template() {
        return this._template;
    }

    get innerElement() {
        return document.getElementById(this._id);
    }

    _render() {
        this._template = Handlebars.templates.modal({
            customClasses: this._customClasses,
            header:        this._header,
            body: this._body,
            id:   this._id
        });
    }

    show() {
        this.innerElement.style.opacity = 1;
        this.closeModal();
    }

    hide() {
        this.innerElement.style.opacity = 0;
        setTimeout(() => {
            const parent = this.innerElement.parentNode;
            parent.removeChild(this.innerElement);
        }, 100);
    }

    closeModal() {
        const closeBtn = document.getElementById(`close_${this._id}`);
        closeBtn.addEventListener('click', () => this.hide());
    }
}
