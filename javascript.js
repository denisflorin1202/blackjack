let dealer = {
    sum: 0,
    cardCount: 0
};

let player = {
    sum: 0,
    cardCount: 0
};

let dealerAceCount = 0;
let yourAceCount = 0;

let hidden;
let deck;

let canHit = true; // daca cartile mele sunt sub sau egale cu 21, pot sa iau inca o carte sau mai multe

window.onload = function() {
    buildDeck();
    startGame();
};

function buildDeck() {
    let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    let types = ["C", "D", "H", "S"];
    deck = [];

    for (let i = 0; i < types.length; i++) {
        for (let j = 0; j < values.length; j++) {
            deck.push(values[j] + "-" + types[i]); // A-C -> K-C, A-D -> K-D
        }
    }

    shuffleDeck();
}

function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function startGame() {
    // aranjeaza cartile si incepe noul joc
    document.getElementById("dealer-cards").innerHTML = '<img id="hidden" src="./cards/BACK.png">';
    document.getElementById("your-cards").innerHTML = '';
    document.getElementById("dealer-sum").innerText = '';
    document.getElementById("dealer-card-count").innerText = '';
    document.getElementById("your-sum").innerText = '';
    document.getElementById("your-card-count").innerText = '';
    document.getElementById("results").innerText = '';

    // se verifica cartile din pachet
    if (deck.length < 10) { // alegem un numar mic pentru a forta amestecul pachetului mai des
        buildDeck(); // se reface pachetul de carti
        shuffleDeck(); // se amesteca pachetul de carti
    }

    hidden = deck.pop();
    dealer.sum += getValue(hidden); // aici se adauga la suma cartea ascunsa a dealerului
    dealer.cardCount++;

    while (dealer.sum < 17) {
        let cardImg = document.createElement("img");
        let card = deck.pop();
        cardImg.src = "./cards/" + card + ".png";
        dealer.sum += getValue(card);
        dealer.cardCount++;
        document.getElementById("dealer-cards").append(cardImg);
    }

    // aici e afisa suma dealerului fara cartea ascunsa
    document.getElementById("dealer-sum").innerText = dealer.sum - getValue(hidden);
    document.getElementById("dealer-card-count").innerText = dealer.cardCount;

    for (let i = 0; i < 2; i++) {
        let cardImg = document.createElement("img");
        let card = deck.pop();
        cardImg.src = "./cards/" + card + ".png";
        player.sum += getValue(card);
        player.cardCount++;
        document.getElementById("your-cards").append(cardImg);
    }

    document.getElementById("your-sum").innerText = player.sum;
    document.getElementById("your-card-count").innerText = player.cardCount;

    //
    document.getElementById("hit").disabled = false;
    document.getElementById("stay").disabled = false;

    // 
    document.getElementById("next-game").disabled = true;

    document.getElementById("hit").addEventListener("click", hit);
    document.getElementById("stay").addEventListener("click", stay);
    document.getElementById("next-game").addEventListener("click", nextGame);

    // 
    document.getElementById("reset-game").addEventListener("click", resetGame);
    document.getElementById("deal-another-hand").addEventListener("click", dealAnotherHand);
}

function hit() {
    if (!canHit) {
        return;
    }

    if (deck.length < 1) { // verifica daca mai sunt carti in pachet
        buildDeck(); // reface pachetu daca e gol
        shuffleDeck(); // amesteca cartile
    }

    let cardImg = document.createElement("img");
    let card = deck.pop();
    cardImg.src = "./cards/" + card + ".png";
    player.sum += getValue(card);
    player.cardCount++;
    document.getElementById("your-cards").append(cardImg);

    document.getElementById("your-sum").innerText = player.sum;
    document.getElementById("your-card-count").innerText = player.cardCount;

    if (reduceAce(player.sum, yourAceCount) > 21) {
        canHit = false;
        endGame("Ai pierdut!");
    }
}

function stay() {
    dealer.sum = reduceAce(dealer.sum, dealerAceCount);
    player.sum = reduceAce(player.sum, yourAceCount);

    // afiseaza cartea dealerului si suma acestuia
    document.getElementById("hidden").src = "./cards/" + hidden + ".png";
    document.getElementById("dealer-sum").innerText = dealer.sum;

    canHit = false;

    let message = "";
    if (player.sum > 21) {
        message = "Ai pierdut!";
    }
    else if (dealer.sum > 21) {
        message = "Ai castigat!";
    }
    else if (player.sum === dealer.sum) {
        message = "Egalitate!";
    }
    else if (player.sum > dealer.sum) {
        message = "Ai castigat!";
    }
    else if (player.sum < dealer.sum) {
        message = "Ai pierdut!";
    }

    document.getElementById("results").innerText = message;

    // se opreste butonul next game
    document.getElementById("next-game").disabled = false;
}

function nextGame() {
    // Curatam cartile de pe masa
    document.getElementById("dealer-cards").innerHTML = '<img id="hidden" src="./cards/BACK.png">';
    document.getElementById("your-cards").innerHTML = '';

    // Resetam variabilele
    dealer.sum = 0;
    dealer.cardCount = 0;
    player.sum = 0;
    player.cardCount = 0;
    dealerAceCount = 0;
    yourAceCount = 0;
    canHit = true;

    // Reconstruim intregul pachet de carti
    buildDeck();
    shuffleDeck(); // Amestecam pachetul de carti

    // Incepem un joc nou
    startGame();

    // Dezactivam butonul "Next Game"
    document.getElementById("next-game").disabled = true;
}

function dealAnotherHand() {
    // alegem alte carti pentru dealer si player
    document.getElementById("dealer-cards").innerHTML = '<img id="hidden" src="./cards/BACK.png">';
    document.getElementById("your-cards").innerHTML = '';

    // resetam variabilele
    dealer.sum = 0;
    dealer.cardCount = 0;
    player.sum = 0;
    player.cardCount = 0;
    dealerAceCount = 0;
    yourAceCount = 0;
    canHit = true;

    // incepe un joc nou
    startGame();

    // next game este dezactivat
    document.getElementById("next-game").disabled = true;
}

function getValue(card) {
    let data = card.split("-");
    let value = data[0];

    if (isNaN(value)) {
        if (value === "A") {
            return 11;
        }
        return 10;
    }
    return parseInt(value);
}

function reduceAce(playerSum, playerAceCount) {
    while (playerSum > 21 && playerAceCount > 0) {
        playerSum -= 10;
        playerAceCount--;
    }
    return playerSum;
}

function endGame(message) {
    // afiseaza cartea ascunsa si suma dealerului
    document.getElementById("hidden").src = "./cards/" + hidden + ".png";
    document.getElementById("dealer-sum").innerText = dealer.sum;

    // afiseaza mesajul final
    document.getElementById("results").innerText = message;

    // dezactiveaza butoanele dupa ce se termina jocul
    document.getElementById("hit").disabled = true;
    document.getElementById("stay").disabled = true;

    // aici se activeaza butonul next game dupa ce se termina jocul
    document.getElementById("next-game").disabled = false;
}
