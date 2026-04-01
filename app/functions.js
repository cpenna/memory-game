let userArray = []
let computerArray = []
let isComputerTurn = false
const elementsClass = "memory-card"
const defaultPlayerName = "Jogador"
const playerState = {
    playerId: null,
    name: defaultPlayerName,
    email: "",
    bestScore: 0
}
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
    const currentScore = Number(computerArray.length - 1)
    updateScoreDisplay(currentScore)
    upsertHighScoreIfNeeded(currentScore)
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

const getPlayerProfile = () => {

    const nameInput = document.getElementById("playerName")
    const emailInput = document.getElementById("playerEmail")
    const name = nameInput ? nameInput.value.trim() : ""
    const email = emailInput ? emailInput.value.trim().toLowerCase() : ""

    if (!name) {
        return { valid: false, message: "Informe seu nome." }
    }

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    if (!isEmailValid) {
        return { valid: false, message: "Informe um e-mail valido." }
    }

    return {
        valid: true,
        name,
        email
    }
}

const updatePlayerGreeting = () => {

    const name = getPlayerName()
    const scoreTitleElement = document.getElementById("scoreTitle")

    if (scoreTitleElement) {
        scoreTitleElement.innerText = "Score de " + name
    }
}

const updateSaveStatus = (message, type) => {

    const statusElement = document.getElementById("saveStatus")

    if (!statusElement) {
        return
    }

    statusElement.innerText = message || ""
    statusElement.className = "save-status"

    if (type) {
        statusElement.classList.add(type)
    }
}

const updateScoreDisplay = (score) => {

    const scoreElement = document.getElementById("scoreValue")

    if (scoreElement) {
        scoreElement.innerText = Number(score)
    }
}

const savePlayerProfile = async () => {

    const profile = getPlayerProfile()

    if (!profile.valid) {
        updateSaveStatus(profile.message, "error")
        return
    }

    updateSaveStatus("Salvando...", "")

    try {
        const response = await fetch("/api/players/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: profile.name,
                email: profile.email
            })
        })

        const payload = await response.json()

        if (!response.ok) {
            throw new Error(payload.error || "Falha ao salvar.")
        }

        playerState.playerId = payload.playerId
        playerState.name = payload.name
        playerState.email = payload.email
        playerState.bestScore = Number(payload.bestScore || 0)
        updatePlayerGreeting()
        updateSaveStatus("Perfil salvo com sucesso.", "success")
    } catch (error) {
        updateSaveStatus(error.message || "Erro de rede ao salvar.", "error")
    }
}

const upsertHighScoreIfNeeded = async (score) => {

    if (!playerState.playerId || !playerState.email) {
        return
    }

    if (score <= Number(playerState.bestScore || 0)) {
        return
    }

    try {
        const response = await fetch("/api/scores/upsert-best", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                playerId: playerState.playerId,
                email: playerState.email,
                score
            })
        })

        const payload = await response.json()

        if (!response.ok) {
            throw new Error(payload.error || "Falha ao atualizar score.")
        }

        playerState.bestScore = Number(payload.bestScore || score)
        updateSaveStatus("Novo recorde salvo.", "success")
    } catch (error) {
        updateSaveStatus(error.message || "Nao foi possivel salvar o score.", "error")
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

const setupSaveButton = () => {

    const saveButton = document.getElementById("savePlayerBtn")

    if (!saveButton) {
        return
    }

    saveButton.addEventListener("click", savePlayerProfile)
}

const initUI = () => {

    setupPlayerNameEvents()
    setupSaveButton()
    updatePlayerGreeting()
    updateScoreDisplay(0)
    updateSaveStatus("", "")
}

cleanup()

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initUI)
} else {
    initUI()
}
