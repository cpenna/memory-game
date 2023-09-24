let userArray = []
let computerArray = []
const elementsClass = "rounded-circle"
const dictionary = {
    1: "Cavalier",
    2: "Dachshund",
    3: "Dalmatian",
    4: "Shepherd",
    5: "Golden",
    6: "Pug"
}

const userSequence = (id) => {

    if (computerArray.length > 0) {
        userArray.push(Number(id))
    
        if (userArray.length < computerArray.length)
            // Update strokes
            document.getElementById("strokesLeft").innerText = "Cliques restantes: " + Number(computerArray.length - userArray.length)
            
        if (userArray.length == computerArray.length)
            setTimeout(compare(), 800)
    } else {
        window.alert("Clique em Iniciar!")
    }
}

const generateNumber = () => {

    const options = document.getElementsByClassName(elementsClass).length
    const randomNumber = Math.ceil(Math.random() * options)
    computerArray.push(randomNumber)
    return randomNumber
}

const computerSequence = () => {

    let playListCounter = 0
    let intervalId

    generateNumber()

    function loop() {
        intervalId = setInterval(() => {
            animate(computerArray[playListCounter])
            playListCounter++
            
            if (playListCounter >= computerArray.length)
                clearInterval(intervalId)
        }, 1000)
    }

    loop()
    document.getElementById("points").innerText = "Hits: " + Number(computerArray.length - 1)
    cleanup("user")
}

const animate = (randomNumber) => {
    
    const color = "computer-click"
    const element = document.getElementById(randomNumber)

    element.className = `rounded-circle ${color} border border-5 border-primary`

    setTimeout(() => {
        element.className = "rounded-circle"
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
        document.getElementById("strokesLeft").innerText = userArray
    } else {
        userArray = []
        computerArray = []
        document.getElementById("strokesLeft").innerText = userArray
        document.getElementById("points").innerText = computerArray
    }
}

const idTranslator = (array) => {

    let users = []

    array.forEach(element => {
        users.push(dictionary[element])
    });

    return users
}