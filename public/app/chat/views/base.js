import { MsgContainerComponent } from '../../components/msgContainer/msgContainer.js';
import { ButtonComponent }       from '../../components/button/button.js';
import { FormControlComponent }  from '../../components/form/__control/formControl.js';
import { PanelComponent } from '../../components/panel/panel.js';
import { IconComponent }  from '../../components/icon/icon.js';
import { makeAvatarPath } from '../../modules/utils.js';
import bus from '../../modules/bus.js';

export class BaseChatView {
    constructor(root) {
        this.root = root;
        this._input = {
            type: 'text',
            customClasses: '',
            placeholder: 'Type something ...',
            name: 'message'
        };

        // this.messagesSection = document.createElement('div');
        // this.root.insertAdjacentHTML('beforeend', this.messagesSection);

        bus.on('chat:get-message', this.onMessageCome);
    }

    onMessageCome = (message) => {
        if (message.nickname === 'Guest' || message.nickname !== user.nickname) {
            const msgContainer = new MsgContainerComponent({
                type: 'receive',
                datetime: '2009-11-13T20:00',
                nickname: message.nickname,
                avatarUrl: makeAvatarPath(message.avatarPath),
                msgText: message.text
            });

            bus.emit('chat:update-container', msgContainer.template);

            setTimeout(() => {
                msgContainer.show();
            }, 100);
        }
    };

    renderButton() {
        const icon = new IconComponent({
           customClasses: 'md-24',
           name: 'send' 
        });
        
        this.button = new ButtonComponent({
            text: icon.template
        });

        this.input = new FormControlComponent(this._input);
    }

    renderPanel(classes, header) {
        this.panel = new PanelComponent({
            customPanelClass: `${classes}`,
            customClasses: `msg-container-base`,
            header: header,
            body: ``,
            footer: `
                <div class='form__group m-none'>
                    ${this.input.template}
                </div>
                ${this.button.template}
            `
        });

        return this.panel;
    };

    startListening() {
        this.button.on('click', this.sendMessage);
        this.input.on('keydown', (event) => {
            if(event.keyCode === 13) {
                this.sendMessage();
            }
        });
    }

    sendMessage = () => {
        if (this.input.value) {
            const msgContainer = new MsgContainerComponent({
                type: 'sent',
                datetime: '2009-11-13T20:00',
                nickname: user.nickname,
                avatarUrl: '/assets/img/default-avatar.png',
                msgText: this.input.value
            });

            bus.emit('chat:update-container', msgContainer.template);
            bus.emit('chat:send-message', this.input.value);

            setTimeout(() => {
                msgContainer.show();
            }, 100);

            this.input.value = '';
        }
    };
}
