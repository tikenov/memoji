'use strict';

class Card {
    constructor(emoji, node) {
        this.emoji = emoji;
        this.node = node;
        this.node.innerHTML = '<div class="back"></div><div class="emoji">' + emoji + '</div>';
        this.isFlipped = false;
    }
    flip() {
        this.isFlipped = true;
        this.node.classList.add('flipped');
        this.node.style.cursor = "default";
    }
    unflip() {
        this.isFlipped = false;
        this.node.classList.remove('flipped');
        this.node.classList.remove('red');
        this.node.style.cursor = "pointer";
    }
    reset(emoji) {
        this.isFlipped = false;
        this.node.classList.remove('flipped');
        setTimeout(function () {
            this.emoji = emoji;
            this.node.innerHTML = '<div class="back"></div><div class="emoji">' + emoji + '</div>';
            this.node.classList.remove('red');
            this.node.classList.remove('green');
            this.node.style.cursor = "pointer";
        }.bind(this), 300);
    }
}

class Game {
    constructor(props) {
        this.props = props;
        this.cardArea = document.getElementById(props.area);
        document.getElementById(props.modalButton).addEventListener("click", function () {
            this.restart();
        }.bind(this));
    }
    showModal(text, button) {
        clearInterval(this.interval);
        document.getElementById(this.props.modal).style.display = "block";
        text = text.split("").map(function (e, i) { return '<span class="modal-letter letter_' + i + '">' + e + '</span>' }).join("");
        document.getElementById(this.props.modalText).innerHTML = text;
        document.getElementById(this.props.modalButton).innerHTML = button;
    }
    showTimer(time) {
        var timer = document.getElementById(this.props.timer);
        if (time == 60) timer.innerHTML = "01:00";
        else if (time > 9) timer.innerHTML = "00:" + time;
        else timer.innerHTML = "00:0" + time;
    };
    init() {
        this.globalClickable = true;
        this.gameStarted = false;
        this.timer = 0;
        this.cards = [];
        this.showTimer(this.timer);
        document.getElementById(this.props.modal).style.display = "none";
        this.cardArea.innerHTML = "";
        for (var i = 0; i < 12; i++)
            this.cardArea.innerHTML += '<div id="card-' + i + '" class="card"></div>';
        var emoji = [...this.props.emoji, ...this.props.emoji].sort(function () { return Math.random() - 0.5 });
        var elements = document.getElementsByClassName(this.props.card);
        for (var i = 0; i < elements.length; i++) {
            this.cards[i] = new Card(emoji[i], elements[i]);
        }
    }
    unflipRed() {
        this.cards.forEach(function (card) {
            if (card.node.classList.contains('red')) {
                card.unflip();
                card.node.classList.remove('red')
            }
        });
    }
    restart() {
        this.globalClickable = true;
        this.gameStarted = false;
        this.timer = 0;
        this.prev = undefined;
        this.showTimer(this.timer);
        document.getElementById(this.props.modal).style.display = "none";
        var emoji = [...this.props.emoji, ...this.props.emoji].sort(function () { return Math.random() - 0.5 });
        this.cards.forEach(function (card, i) {
            card.reset(emoji[i]);
        });
    }
    start() {
        this.init();
        this.prev = undefined;
        this.cardArea.addEventListener("click", function (event) {
            if (event.target.classList.contains(this.props.card)) {
                var card = this.cards[parseInt(event.target.id.substring(5))];
                if (this.globalClickable && !card.isFlipped) {
                    if (!this.gameStarted) {
                        this.gameStarted = true;
                        this.timer = 60;
                        this.showTimer(this.timer);
                        this.interval = setInterval(function () {
                            if (this.timer > 0 && this.gameStarted) {
                                this.timer--;
                                this.showTimer(this.timer);
                            }
                            if (this.gameStarted && this.timer == 0) {
                                this.showModal("Lose", "Try again");
                            }
                        }.bind(this), 1000);
                    }
                    card.flip();
                    this.unflipRed();
                    if (this.prev) {
                        if (this.prev.emoji == card.emoji && this.prev.node.id != card.node.id) {
                            this.prev.node.classList.add(this.props.cardCorrect);
                            card.node.classList.add(this.props.cardCorrect);
                            if (this.cards.every(function (e) { return e.isFlipped; })) {
                                this.showModal("Win", "Play again");
                                this.gameStarted = false;
                            }
                            this.prev = undefined;
                        } else {
                            this.prev.node.classList.add(this.props.cardIncorrect);
                            card.node.classList.add(this.props.cardIncorrect);
                            this.prev = undefined;
                        }
                    } else this.prev = card;
                }
            }
        }.bind(this));
    }
}
