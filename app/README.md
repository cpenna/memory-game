# memory-game

Memory Game based on old Genius, created a while ago using my friend's pics instead of colors.

I'll work on some improvements later this year if I have free time:
- Enhance UI for mobile
- Connection with a database to save scores
- Create a branch with animal images
- Admin page for tracking stats and records

Docker Hub image available at: https://hub.docker.com/r/cpenna/memory-game

## New features

- Player profile save (`nome` + `e-mail`) with a `Salvar` button in the sidebar
- Persistent best score per player in Supabase
- Ranking page (`/ranking.html`) with sorted scores

## Supabase setup

1. Create a Supabase project.
2. Run `supabase-schema.sql` in the SQL editor.
3. Configure environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Run with Docker Compose

```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... docker-compose up --build
```

Then open:
- `http://localhost` (game)
- `http://localhost/ranking.html` (ranking)

## Credit for images:

- Golden Retriever, Photo by Cesar Penna
- Corgi, Photo by Nataliya Vaitkevich from Pexels: https://www.pexels.com/photo/cute-corgi-in-front-of-a-laptop-5122188/
- Chihuahua, Photo by wkn from Pexels: https://www.pexels.com/photo/brown-chihuahua-puppy-lying-on-brown-textile-1933464/
- Dachshund, Photo by Dominika Roseclay from Pexels: https://www.pexels.com/photo/dachshund-surrounded-by-purple-flowers-3104786/
- Pug, Photo by Charles from Pexels: https://www.pexels.com/photo/portrait-photo-of-an-adult-black-pug-1851164/
- German Shepherd, Photo by Summer Stock from Pexels: https://www.pexels.com/photo/adult-german-shepherd-lying-on-ground-333083/
- Cavalier, Photo by Steshka Willems from Pexels: https://www.pexels.com/photo/shallow-focus-photography-of-a-cavalier-king-charles-spaniel-1390361/
- Dalmatian, Photo by Kasuma from Pexels: https://www.pexels.com/photo/dalmatian-sitting-white-surface-933498/
