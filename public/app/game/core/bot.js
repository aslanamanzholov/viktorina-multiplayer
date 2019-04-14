const fieldSize = 8;

export class BotPlayer {
    constructor() {
        this.waitingTime = {
            min: 1, //second
            max: 3 //second
        };
        this.winChance = 75; // %

        bus.on('set-current-player', this.setCurrentPlayer);
    }

    setCurrentPlayer = (pl) => {
        if (pl === 'bot')  this.startActing();
    };

    startActing() {
        bus.on('success:get-available-cells', this.botChoosingCell);
        bus.emit('get-available-cells');
    }

    get randomTime() {
        return Math.floor(Math.random() * (
            this.waitingTime.max - this.waitingTime.min + 1)
        ) + this.waitingTime.max;
    }

    getRandomArrayIndex(arrayLength) {
        return Math.floor(Math.random() * arrayLength);
    }

    botChoosingQuestion = (question) => {
        const answers = question.answers;
        const r = Math.random() * 100; //Получаем случайное число процентов
        let answer;
        if (r <= this.winChance) {
            answer = question.correct; // Выбираем правильный ответ
        } else {
            answers.splice(question.correct, 1); // Удаляем правильный ответ
            answer = this.getRandomArrayIndex(answers.length); // Выбираем случайный ответ из неправильных
        }

        setTimeout(() => {
            bus.emit('selected-answer', answer); // Возвращаем выбранный ответ
            bus.off('success:get-available-cells', this.botChoosingCell);
            bus.off('selected-question', this.botChoosingQuestion);
        }, this.randomTime * 1000);
    };

    botChoosingCell = (availableCells) => {
        setTimeout(() => {
            const mid = fieldSize / 2;
            const aim = {x: 0, y: 0};
            // Найдём номер той ячейки, путь из которой к центру поля будет минимальным
            const bestCell = availableCells.reduce((accumulator, currentValue, index) => {
                // Приз занимает 4 центральных клетки
                // Выберем ближ     айшую клетку в формате координат
                const currentX = currentValue % fieldSize;
                const currentY = Math.floor(currentValue / fieldSize);
                aim.x = currentX <= Math.floor(mid) ? Math.floor(mid) : Math.ceil(mid);
                aim.y = currentY <= Math.floor(mid) ? Math.floor(mid) : Math.ceil(mid);
                // Найдём разницу по обеим координатам относительно текущей позиции
                const dx = Math.abs(currentX - aim.x);
                const dy = Math.abs(currentY - aim.y);
                // Найдём расстояние в ходах от текущей позиции до
                const pathLen = Math.abs(dx - dy) + Math.min(dx, dy);
                if (pathLen < accumulator.pathLen) {
                    accumulator.index = index;
                    accumulator.pathLen = pathLen;
                }

                return accumulator;
            }, {index: -1, pathLen: fieldSize});

            bus.on('selected-question', this.botChoosingQuestion);
            bus.emit('selected-cell', availableCells[bestCell.index]); // Возвращаем клетку с кратчайшим путём до цели
        }, this.randomTime * 1000);
    };

    destroy() {
        bus.off('set-current-player', this.setCurrentPlayer);
        this.waitingTime = null;
        this.winChance = null;
    }
}
