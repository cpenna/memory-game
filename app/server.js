const http = require("http")
const fs = require("fs")
const path = require("path")

const PORT = Number(process.env.PORT || 80)
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".ico": "image/x-icon",
    ".webmanifest": "application/manifest+json"
}

const sendJson = (res, statusCode, payload) => {
    res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" })
    res.end(JSON.stringify(payload))
}

const readBody = (req) =>
    new Promise((resolve, reject) => {
        let raw = ""
        req.on("data", (chunk) => {
            raw += chunk
        })
        req.on("end", () => {
            if (!raw) {
                resolve({})
                return
            }

            try {
                resolve(JSON.parse(raw))
            } catch (error) {
                reject(new Error("JSON invalido no body."))
            }
        })
        req.on("error", reject)
    })

const ensureSupabaseConfig = () => {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sao obrigatorios.")
    }
}

const supabaseRequest = async (endpoint, method, payload, preferHeader) => {
    ensureSupabaseConfig()

    const headers = {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json"
    }

    if (preferHeader) {
        headers.Prefer = preferHeader
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
        method,
        headers,
        body: payload ? JSON.stringify(payload) : undefined
    })

    const text = await response.text()
    let data = null

    if (text) {
        try {
            data = JSON.parse(text)
        } catch {
            data = text
        }
    }

    if (!response.ok) {
        const error = typeof data === "object" && data !== null ? data.message || JSON.stringify(data) : String(data)
        throw new Error(error || "Erro ao comunicar com Supabase.")
    }

    return data
}

const maskEmail = (email) => {
    const value = String(email || "").trim().toLowerCase()
    const [local, domain] = value.split("@")

    if (!local || !domain) {
        return ""
    }

    if (local.length <= 2) {
        return `${local[0] || ""}***@${domain}`
    }

    return `${local.slice(0, 2)}***@${domain}`
}

const registerPlayer = async (name, email) => {
    const normalizedName = String(name || "").trim()
    const normalizedEmail = String(email || "").trim().toLowerCase()
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)

    if (!normalizedName) {
        throw new Error("Nome obrigatorio.")
    }

    if (!emailValid) {
        throw new Error("E-mail invalido.")
    }

    const players = await supabaseRequest(
        "players?on_conflict=email&select=id,name,email",
        "POST",
        { name: normalizedName, email: normalizedEmail },
        "resolution=merge-duplicates,return=representation"
    )

    const player = Array.isArray(players) ? players[0] : null

    if (!player) {
        throw new Error("Falha ao salvar jogador.")
    }

    const scores = await supabaseRequest("scores?select=best_score&player_id=eq." + player.id, "GET")
    const bestScore = Array.isArray(scores) && scores[0] ? Number(scores[0].best_score || 0) : 0

    return {
        playerId: player.id,
        name: player.name,
        email: player.email,
        bestScore
    }
}

const upsertBestScore = async (playerId, email, score) => {
    const normalizedEmail = String(email || "").trim().toLowerCase()
    const parsedScore = Number(score || 0)

    if (!Number.isFinite(parsedScore) || parsedScore < 0) {
        throw new Error("Score invalido.")
    }

    let resolvedPlayerId = String(playerId || "").trim()

    if (!resolvedPlayerId) {
        const players = await supabaseRequest("players?select=id&email=eq." + encodeURIComponent(normalizedEmail), "GET")
        if (!Array.isArray(players) || !players[0]) {
            throw new Error("Jogador nao encontrado para este e-mail.")
        }
        resolvedPlayerId = players[0].id
    }

    const existingRows = await supabaseRequest("scores?select=best_score&player_id=eq." + resolvedPlayerId, "GET")
    const existingBest = Array.isArray(existingRows) && existingRows[0] ? Number(existingRows[0].best_score || 0) : 0
    const nextBest = Math.max(existingBest, parsedScore)

    await supabaseRequest(
        "scores?on_conflict=player_id&select=best_score",
        "POST",
        { player_id: resolvedPlayerId, best_score: nextBest },
        "resolution=merge-duplicates,return=representation"
    )

    return {
        bestScore: nextBest,
        updated: nextBest > existingBest
    }
}

const fetchRanking = async (limit) => {
    const parsedLimit = Number(limit || 50)
    const safeLimit = Number.isFinite(parsedLimit) ? Math.max(1, Math.min(200, parsedLimit)) : 50
    const rows = await supabaseRequest(
        `scores?select=best_score,updated_at,players(name,email)&order=best_score.desc,updated_at.asc&limit=${safeLimit}`,
        "GET"
    )

    return (Array.isArray(rows) ? rows : []).map((row, index) => ({
        rank: index + 1,
        name: row.players ? row.players.name : "Jogador",
        emailMasked: maskEmail(row.players ? row.players.email : ""),
        score: Number(row.best_score || 0),
        updatedAt: row.updated_at
    }))
}

const handleApi = async (req, res, parsedUrl) => {
    if (req.method === "POST" && parsedUrl.pathname === "/api/players/register") {
        const body = await readBody(req)
        const data = await registerPlayer(body.name, body.email)
        sendJson(res, 200, data)
        return true
    }

    if (req.method === "POST" && parsedUrl.pathname === "/api/scores/upsert-best") {
        const body = await readBody(req)
        const data = await upsertBestScore(body.playerId, body.email, body.score)
        sendJson(res, 200, data)
        return true
    }

    if (req.method === "GET" && parsedUrl.pathname === "/api/ranking") {
        const data = await fetchRanking(parsedUrl.searchParams.get("limit"))
        sendJson(res, 200, data)
        return true
    }

    return false
}

const serveStaticFile = (req, res, parsedUrl) => {
    let pathname = parsedUrl.pathname

    if (pathname === "/") {
        pathname = "/index.html"
    }

    const unsafePath = path.join(process.cwd(), pathname)
    const safePath = path.normalize(unsafePath)

    if (!safePath.startsWith(process.cwd())) {
        res.writeHead(403)
        res.end("Forbidden")
        return
    }

    fs.readFile(safePath, (error, content) => {
        if (error) {
            res.writeHead(404)
            res.end("Not Found")
            return
        }

        const extname = path.extname(safePath).toLowerCase()
        const contentType = MIME_TYPES[extname] || "application/octet-stream"
        res.writeHead(200, { "Content-Type": contentType })
        res.end(content)
    })
}

const server = http.createServer(async (req, res) => {
    try {
        const parsedUrl = new URL(req.url, `http://${req.headers.host}`)
        const handled = await handleApi(req, res, parsedUrl)

        if (!handled) {
            serveStaticFile(req, res, parsedUrl)
        }
    } catch (error) {
        sendJson(res, 500, { error: error.message || "Internal Server Error" })
    }
})

server.listen(PORT, () => {
    console.log(`memory-game server running on port ${PORT}`)
})
