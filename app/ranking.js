const rankingState = {
    isLoading: false
}

const setRankingStatus = (message) => {
    const statusElement = document.getElementById("rankingStatus")
    if (statusElement) {
        statusElement.innerText = message
    }
}

const renderRanking = (rows) => {
    const table = document.getElementById("rankingTable")
    const body = document.getElementById("rankingBody")

    if (!table || !body) {
        return
    }

    body.innerHTML = ""

    rows.forEach((row) => {
        const tr = document.createElement("tr")
        tr.innerHTML = `<td>${row.rank}</td><td>${row.name}</td><td>${row.emailMasked}</td><td>${row.score}</td>`
        body.appendChild(tr)
    })

    table.hidden = rows.length === 0
}

const loadRanking = async () => {
    if (rankingState.isLoading) {
        return
    }

    rankingState.isLoading = true
    setRankingStatus("Carregando ranking...")

    try {
        const response = await fetch("/api/ranking?limit=50")
        const payload = await response.json()

        if (!response.ok) {
            throw new Error(payload.error || "Erro ao carregar ranking.")
        }

        renderRanking(payload)

        if (!Array.isArray(payload) || payload.length === 0) {
            setRankingStatus("Ainda nao ha scores salvos.")
        } else {
            setRankingStatus("")
        }
    } catch (error) {
        setRankingStatus(error.message || "Erro de rede ao carregar ranking.")
    } finally {
        rankingState.isLoading = false
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadRanking)
} else {
    loadRanking()
}
