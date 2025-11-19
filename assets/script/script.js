// ======= ATTAQUES =======
let atkOne = {
    name: "Frappe Rapide",
    strength: 10,
    chanceTouch: 1 / 2,
};
let atkTwo = {
    name: "Soin Léger",
    soin: 15,
    chanceTouch: 1 / 3,
};
let atkThree = {
    name: "Coup Puissant",
    strength: 20,
    chanceTouch: 1 / 3,
};
let atkFour = {
    name: "Frappe Dévastatrice",
    strength: 30,
    chanceTouch: 1 / 4,
};
let atkFive = {
    name: "Incinération Total!",
    strength: 50,
    chanceTouch: 1 / 5,
};

// ======= PERSONNAGES =======
let warriorfire = {
    name: "Guerrier de feu",
    lifepoint: 100,
    maxLife: 100,
    atks: [atkOne, atkTwo, atkThree, atkFour,atkFive]
};

let darklutin = {
    name: "Sombre Lutin",
    lifepoint: 100,
    maxLife: 100,
    atks: [atkOne, atkTwo, atkThree, atkFour]
};

// ======= RÉFÉRENCES DOM =======
const warriorCard = document.querySelector(".fire-warrior");
const lutinCard = document.querySelector(".dark-lutin");
const warriorLifeBar = document.getElementById("warrior-life");
const lutinLifeBar = document.getElementById("lutin-life");
const logBox = document.querySelector(".log-window");
const retryBtn = document.getElementById("retry-btn");
const startBtn = document.getElementById("start-btn");
const menuScreen = document.getElementById("menu-screen");
const gameWrapper = document.getElementById("game-wrapper");
const attackButtons = document.querySelectorAll(".attack-btn");

// Sons
const sfxHit = document.getElementById("sfx-hit");
const sfxHeal = document.getElementById("sfx-heal");
const sfxStart = document.getElementById("sfx-start");
const sfxWin = document.getElementById("sfx-win");
const sfxLose = document.getElementById("sfx-lose");

// État du jeu
let isPlayerTurn = true;
let gameOver = false;

// ======= UTIL : jouer un son =======
function playSound(audio) {
    if (!audio) return;
    audio.currentTime = 0;
    audio.play()
}

// ======= FONCTION RANDOM POUR LE LUTIN =======
function lutinRandom() {
    let atk;
    do {
        atk = darklutin.atks[Math.floor(Math.random() * darklutin.atks.length)];
    } while (atk.soin && darklutin.lifepoint === darklutin.maxLife);
    return atk;
}

// ======= PARTICULES =======
function spawnParticles(card, type) {
    if (!card) return;
    for (let i = 0; i < 8; i++) {
        const p = document.createElement("span");
        p.classList.add("particle", type); // type = "fire" ou "shadow"
        p.style.left = 10 + Math.random() * 80 + "%";
        p.style.top = 20 + Math.random() * 60 + "%";
        card.appendChild(p);
        setTimeout(() => p.remove(), 550);
    }
}

// ======= ANIMATIONS =======
function playHitAnimation(targetCard, isFireAttacker) {
    if (!targetCard) return;
    targetCard.classList.remove("hit-left", "hit-right", "damage-flash");

    const cls = targetCard === warriorCard ? "hit-left" : "hit-right";
    targetCard.classList.add(cls, "damage-flash");

    // Particules
    spawnParticles(
        targetCard,
        isFireAttacker ? "fire" : "shadow"
    );

    setTimeout(() => {
        targetCard.classList.remove(cls, "damage-flash");
    }, 550);
}

function playHealAnimation(card) {
    if (!card) return;
    card.classList.add("heal-glow");
    spawnParticles(card, "shadow"); // petits éclats verts/bleus pour soin

    setTimeout(() => {
        card.classList.remove("heal-glow");
    }, 1000);
}

// ======= MISE À JOUR DES BARRES DE VIE =======
function updateLifeBars() {
    warriorLifeBar.style.width =
        (warriorfire.lifepoint / warriorfire.maxLife) * 100 + "%";
    warriorLifeBar.textContent = warriorfire.lifepoint + " PV";

    lutinLifeBar.style.width =
        (darklutin.lifepoint / darklutin.maxLife) * 100 + "%";
    lutinLifeBar.textContent = darklutin.lifepoint + " PV";
}

// ======= LOG =======
function addLog(text) {
    const p = document.createElement("p");
    p.textContent = text;
    logBox.appendChild(p);
    logBox.scrollTop = logBox.scrollHeight;
}

// ======= FIN DU JEU =======
function checkEndGame() {
    if (warriorfire.lifepoint <= 0 && !gameOver) {
        addLog("TU AS PERDU !");
        playSound(sfxLose);
        gameOver = true;
        disableButtons();
        retryBtn.classList.remove("hidden");
    } else if (darklutin.lifepoint <= 0 && !gameOver) {
        addLog("🏆 BRAVO ! Tu as vaincu le Sombre Lutin !");
        playSound(sfxWin);
        gameOver = true;
        disableButtons();
        retryBtn.classList.remove("hidden");
    }
}

// ======= DÉSACTIVER / ACTIVER LES BOUTONS =======
function disableButtons() {
    attackButtons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = "0.6";
    });
}

function enableButtons() {
    attackButtons.forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = "1";
    });
}

// ======= FONCTION D’ATTAQUE PRINCIPALE =======
function atkChance(atk, player, target) {
    let chance = Math.random();
    addLog(`${player.name} utilise ${atk.name}...`);

    const attackerCard = player === warriorfire ? warriorCard : lutinCard;
    const targetCard = target === warriorfire ? warriorCard : lutinCard;

    if (chance <= atk.chanceTouch) {
        if (atk.soin) {
            player.lifepoint += atk.soin;
            addLog(`${player.name} se soigne de ${atk.soin} PV !`);

            playSound(sfxHeal);
            playHealAnimation(attackerCard);
        } else {
            target.lifepoint -= atk.strength;
            if (target.lifepoint < 0) target.lifepoint = 0;
            addLog(`Attaque réussie ! ${target.name} perd ${atk.strength} PV !`);

            playSound(sfxHit);
            playHitAnimation(
                targetCard,
                player === warriorfire // pour la couleur des particules
            );
        }
    } else {
        addLog(`${player.name} rate son action...`);
    }

    updateLifeBars();
    checkEndGame();
}

// ======= MENU : DÉMARRER LA PARTIE =======
startBtn.addEventListener("click", () => {
    menuScreen.classList.add("hidden");
    gameWrapper.classList.remove("hidden");
    playSound(sfxStart);

    // Message d'intro
    logBox.innerHTML = "";
    addLog("Le combat commence !");
    addLog("À toi de jouer, Guerrier de feu.");
    updateLifeBars();
});

// ======= REJOUER =======
retryBtn.addEventListener("click", () => {
    // Reset état
    warriorfire.lifepoint = warriorfire.maxLife;
    darklutin.lifepoint = darklutin.maxLife;
    gameOver = false;
    isPlayerTurn = true;

    updateLifeBars();

    // Reset log
    logBox.innerHTML = "";
    addLog("Un nouveau combat commence !");
    addLog("À toi de jouer, Guerrier de feu.");

    // Réactiver les attaques
    enableButtons();

    // Cacher bouton rejouer
    retryBtn.classList.add("hidden");
});

// ======= BOUTONS D’ATTAQUE =======
attackButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        if (!isPlayerTurn || gameOver) return;

        let index = parseInt(btn.dataset.atk) - 1;
        let playerAtk = warriorfire.atks[index];

        isPlayerTurn = false;
        atkChance(playerAtk, warriorfire, darklutin);  // tour joueur

        setTimeout(() => {
            if (!gameOver && darklutin.lifepoint > 0) {
                let lutinAtk = lutinRandom();
                atkChance(lutinAtk, darklutin, warriorfire); // tour lutin
            }
            if (!gameOver) isPlayerTurn = true;
        }, 800);
    });
});
