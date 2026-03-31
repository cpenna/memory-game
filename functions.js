let userArray = []
let computerArray = []
let isComputerTurn = false
const elementsClass = "memory-card"
const defaultPlayerName = "Jogador"
const dictionary = {
    1: "Cavalier",
    2: "Dachshund",
    3: "Dalmatian",
    4: "Shepherd",
    5: "Golden",
    6: "Pug"
}

const userSequence = (id) => {

    if (computerArray.length === 0) {
        window.alert("Clique em Iniciar!")
        return
    }

    if (isComputerTurn) {
        return
    }

    userArray.push(Number(id))
    animate(Number(id))

    if (userArray[userArray.length - 1] !== computerArray[userArray.length - 1]) {
        window.alert("Errou!\nSequência correta: " + idTranslator(computerArray) + "\nSua sequencia: " + idTranslator(userArray))
        cleanup()
        return
    }

    if (userArray.length === computerArray.length) {
        setTimeout(compare, 800)
    }
}

const generateNumber = () => {

    const options = document.getElementsByClassName(elementsClass).length
    const randomNumber = Math.ceil(Math.random() * options)
    computerArray.push(randomNumber)
    return randomNumber
}

const computerSequence = () => {

    if (isComputerTurn) {
        return
    }

    let playListCounter = 0
    let intervalId

    isComputerTurn = true
    generateNumber()

    function loop() {
        intervalId = setInterval(() => {
            animate(computerArray[playListCounter])
            playListCounter++
            
            if (playListCounter >= computerArray.length) {
                clearInterval(intervalId)
                setTimeout(() => {
                    isComputerTurn = false
                }, 500)
            }
        }, 1000)
    }

    loop()
    updateScoreDisplay(Number(computerArray.length - 1))
    cleanup("user")
}

const animate = (randomNumber) => {
    
    const color = "computer-click"
    const element = document.getElementById(randomNumber)

    element.className = `memory-card ${color} border border-5 border-primary`

    setTimeout(() => {
        element.className = "memory-card"
    }, 500)
}

const compare = () => {

    console.log(userArray, computerArray)
    //  Proceed if both computed and user arrays are equals
    if (userArray.join() === computerArray.join()) {
        computerSequence()
    } else {
        window.alert("Errou!\nSequência correta: " + idTranslator(computerArray) + "\nSua sequencia: " + idTranslator(userArray))
        cleanup()
    }
}

const cleanup = (type) => {

    if (type == "user") {
        userArray = []
    } else {
        userArray = []
        computerArray = []
        isComputerTurn = false
        updateScoreDisplay(0)
    }
}

const idTranslator = (array) => {

    let users = []

    array.forEach(element => {
        users.push(dictionary[element])
    });

    return users
}

const getPlayerName = () => {

    const input = document.getElementById("playerName")

    if (!input) {
        return defaultPlayerName
    }

    const name = input.value.trim()
    return name || defaultPlayerName
}

const updatePlayerGreeting = () => {

    const name = getPlayerName()
    const scoreTitleElement = document.getElementById("scoreTitle")

    if (scoreTitleElement) {
        scoreTitleElement.innerText = "Score de " + name
    }
}

const updateScoreDisplay = (score) => {

    const scoreElement = document.getElementById("scoreValue")

    if (scoreElement) {
        scoreElement.innerText = Number(score)
    }
}

const setupPlayerNameEvents = () => {

    const input = document.getElementById("playerName")

    if (!input) {
        return
    }

    input.addEventListener("input", updatePlayerGreeting)
    input.addEventListener("change", updatePlayerGreeting)
}

const initUI = () => {

    setupPlayerNameEvents()
    updatePlayerGreeting()
    updateScoreDisplay(0)
}

cleanup()

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initUI)
} else {
    initUI()
}
