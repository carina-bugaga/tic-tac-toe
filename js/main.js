import getRandomNumber from './generateRandomNumber.mjs';
import saveLocalStorage from './saveLocalStorage.mjs';

//Получаем все кнопки из DOM
const buttonsAll = document.querySelectorAll('button');

//Получаем элемент body из DOM
const page = document.querySelector('.page');

//Получаем элементы Стартовой страницы из DOM
const pageStart = document.getElementById('page-start');
const buttonPlayers = document.getElementById('button-players');
const buttonEasyPC = document.getElementById('button-pc-easy');
const buttonHardPC = document.getElementById('button-pc-hard');
const titleMode = document.getElementById('title-mode');
const pageMode = document.getElementById('mode-page');

//Режимы игры
const Modes = Object.freeze({
  TWOPLAYERS: 1,
  PCEASY: 2,
  PCHARD: 3
})
  
//Объект с методами игры
let TicTacToe = {
  /**
   * Инициализация игры
   */
  init () {
    TicTacToe.symbols = ['X', 'O'];
    TicTacToe.squares = Array.from(document.querySelectorAll('.square'));
    TicTacToe.turnIndicator = document.querySelector('.turnIndicator');
    TicTacToe.buttonReset = document.getElementById('button-reset');
    TicTacToe.board = document.querySelector('.board');
    TicTacToe.mode;
    TicTacToe.winningSets = [
      //Выигрышные горизонтали
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      //Выигрышные вертикали
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      //Выигрышные диагонали
      [0, 4, 8],
      [2, 4, 6]
    ];
    TicTacToe.addEventListeners();
    if (localStorage.getItem('board') != null) {
      TicTacToe.continueGame();
    } else {
      TicTacToe.newGame();
    }
  },

  /**
   * Слушатели событий
   */
  addEventListeners () {
    this.squares.forEach(square => square.addEventListener('click', () => {
        this.play(square);
    }));
    this.buttonReset.addEventListener('click', () => {
      this.clearLocalStorage();
      this.newGame();
    })
  },

  /**
   * Новая игра
   */
  newGame () {
    this.activePlayer = 0;
    this.gameOver = false;
    this.squares.forEach( el => {
      el.classList.remove('X');
      el.classList.remove('O');
    })
    this.board.classList.remove('gameOver');
    this.turnIndicator.innerHTML = 'Начало игры';
  },
  
  /**
   * Продолжение игры с данными из LocalStorage
   */
  continueGame () {
    this.activePlayer = Number(localStorage.getItem('turn'));
    this.gameOver = false;
    JSON.parse(localStorage.getItem('board')).forEach((el, index) => {
      if (el == 'X') {
        this.squares[index].classList.add('X');
      } else if (el == 'O') {
        this.squares[index].classList.add('O');
      }
    })
    this.turnIndicator.innerHTML = `Ходит игрок ${this.symbols[this.activePlayer]}`;
  },
  
  /**
   * Процесс игры
   * @param {HTMLElement} square Ячейка поля
   */
  play (square) {
    //Проверяем что square незаполненно
    if (!this.gameOver && square.classList[1] == undefined) {
      //Устанавливаем значение Х-О в square игрока
      square.classList.add(this.symbols[this.activePlayer]);
      //Проверяем выиграл ли игрок
      if (this.checkWin()) {
        if (this.mode == Modes.TWOPLAYERS) {
          this.turnIndicator.innerHTML = `🥇 Ура, выиграл игрок ${this.symbols[this.activePlayer]}! 🥳🎉`;
        } else {
          if (this.activePlayer == 1) {
            this.turnIndicator.innerHTML = `😵‍💫 Увы, победил ПК! 🤖`;
          } else {
            this.turnIndicator.innerHTML = `🥇 Ура, ты победил ПК! ✨🥳🎉`;
          }
        }
        this.gameOverGame();
      } 
      //Проверяем на ничью
      else if (this.checkDraw()) {
        this.turnIndicator.innerHTML = '😺 Ничья! 😺';
        this.gameOverGame();
      }
      //Переход хода к следующему игроку
      else {
        this.activePlayer = 1 - this.activePlayer;
        this.setTurnIndicator();
        //Ход компьютера, сложность - легко
        if (this.mode == Modes.PCEASY && this.activePlayer == 1) {
          this.randomMove();
        } 
        //Ход компьютера, сложность - сложно
        else if (this.mode == Modes.PCHARD && this.activePlayer == 1) {
          //Получаем индекс выигрышного хода компьютера
          let indexToWinPC = this.getIndexToWinPC(this.symbols[this.activePlayer]);
          //Получаем индекс хода для защиты от победы игрока
          let indexToDeffendPC = this.getIndexToWinPC(this.symbols[0]);
          if (indexToWinPC != -1) {        
            this.play(this.squares[indexToWinPC]);
          } else if (indexToDeffendPC != -1) {
            this.play(this.squares[indexToDeffendPC]);
          }
          //Если нет выигрышного или защитного хода, то ПК ходит случайно
          else {
            this.randomMove();
          }        
        }
        //Т.к. ход ПК выполняется рекурсивно, поэтому необходима проверка этого хода 
        //на checkWin и checkDraw (этот ход может быть выигрышным внутри рекурсии)
        if (!this.checkWin() && !this.checkDraw()) {
          let arrayBoard = this.squares.map(el => el.classList[1]);
          saveLocalStorage('board', arrayBoard);
          localStorage.setItem('turn', this.activePlayer);
          localStorage.setItem('mode', this.mode);   
        }       
      }
    }
  },
  
  /**
   * Метод для проверки на выигрыш
   * @returns Булевое значение о заполненности полей одним символом
   */
  checkWin () {
    return this.winningSets.some(set => {
      return set.every(index => {
        return Array.from(this.squares[index].classList).indexOf(this.symbols[this.activePlayer]) > -1;
      })
    })
  },
  
  /**
   * Метод для проверки на ничью
   * @returns Булевое значение о заполненности всего поля
   */
  checkDraw () {
    return this.squares.every(el => {
      return el.classList.length > 1;
    })
  },
  /**
   * Генерация случайного хода ПК
   */
  randomMove () {
    let arrayOfEmptySquares = this.squares.filter(el => el.classList.length == 1);
    let randomIndex = getRandomNumber(0, arrayOfEmptySquares.length - 1);
    this.play(arrayOfEmptySquares[randomIndex]);
  },

  /**
   * Метод для нахождения индекса пустого поля для хода ПК, путем перебора выигрышных комбинаций,
   * с нахождением в них ситуации с 2 из 3 заполненными полями переданного символа 
   * @param {String} symbol Символ хода
   * @returns Индекс пустого поля для хода
   */
  getIndexToWinPC (symbol) {
    let indexToWin = -1;

    this.winningSets.forEach(set => {
      let count = 0;
      let haveEmpty = false;
      let indexOfEmpty = -1;
      set.forEach(index => {
        if (this.squares[index].classList[1] == symbol) {
          count++;
        } else if (this.squares[index].classList[1] == undefined) {
          haveEmpty = true;
          indexOfEmpty = index;
        }
      })
      if (count == 2 && haveEmpty) {
        indexToWin = indexOfEmpty;
      }
    })
   return indexToWin;
  },
  
  /**
   * Метод для завершения игры
   */
  gameOverGame () {
    this.gameOver = true;
    this.board.classList.add('gameOver');
    this.clearLocalStorage();
  },

  /**
   * Метод для вывода чей ход
   */
  setTurnIndicator () {
    this.turnIndicator.innerHTML = `Ходит игрок ${this.symbols[this.activePlayer]}`;
  },

  /**
   * Запуск в режиме двух игроков
   */
  openTwoPlayers () {
    page.style.background = 'var(--green-dark)';
    pageMode.classList.remove('hidden');
    titleMode.innerHTML = '<img class="icon" src="./assets/img/two-players.svg" alt="two players"/> 2 игрока';
    this.mode = Modes.TWOPLAYERS;
    this.init();
  },

  /**
   * Запуск в режиме против ПК, сложность - легко
   */
  openEasyPC () {
    page.style.background = 'var(--pink)';
    pageMode.classList.remove('hidden');
    titleMode.innerHTML = '<img class="icon" src="./assets/img/computer.svg" alt="computer"/> Против ПК (легко)';
    this.mode = Modes.PCEASY;
    this.init();
  },

  /**
   * Запуск в режиме против ПК, сложность - сложно
   */
  openHardPC () {
    page.style.background = 'var(--blue-bg)';
    pageMode.classList.remove('hidden');
    titleMode.innerHTML = '<img class="icon" src="./assets/img/computer.svg" alt="computer"/> Против ПК (сложно)';
    this.mode = Modes.PCHARD;
    this.init();
  },

  /**
   * Очистка LocalStorage
   */
  clearLocalStorage () {
    localStorage.removeItem('board');
    localStorage.removeItem('turn');
    localStorage.removeItem('mode');
  }
}

//Получаем данные из LocalStorage при загрузке
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('board') != null) {
    pageStart.classList.add('hidden');
    if (localStorage.getItem('mode') == Modes.TWOPLAYERS) {
      TicTacToe.openTwoPlayers();
    } else if (localStorage.getItem('mode') == Modes.PCEASY) {
      TicTacToe.openEasyPC();
    } else {
      TicTacToe.openHardPC();
    }
  }
})

//Снимаем default состояние со всех кнопок
buttonsAll.forEach(btn => btn.addEventListener('click', event => event.preventDefault()));

//Скрытие Стартовой страницы по нажатия кнопок с режимами игр
document.querySelectorAll('.button-start').forEach(btn => btn.addEventListener('click', () => {
  pageStart.classList.add('hidden-page');
}))

//Возврат на Стартовую страницу для выбора режима игры
document.getElementById('button-setting').addEventListener('click', () => {
  pageStart.classList.remove('hidden');
  pageStart.classList.remove('hidden-page');
})

//Запуск 1 из 3 выбранных режимов и проверка режимов LocalStorage
buttonPlayers.addEventListener('click', () => {
  if (TicTacToe.mode != Modes.TWOPLAYERS) {
    TicTacToe.clearLocalStorage();
  }
  TicTacToe.openTwoPlayers();
})
buttonEasyPC.addEventListener('click', () => {
  if (TicTacToe.mode != Modes.PCEASY) {
    TicTacToe.clearLocalStorage();
  }
  TicTacToe.openEasyPC();
})
buttonHardPC.addEventListener('click', () => {
  if (TicTacToe.mode != Modes.PCHARD) {
    TicTacToe.clearLocalStorage();
  }
  TicTacToe.openHardPC();
})
