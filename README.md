# E-Bankarstvo

Web aplikacija za elektronsko bankarstvo razvijena u okviru predmeta Internet tehnologije.

## Funkcionalnosti

- Registracija i prijava korisnika
- Pregled tekućih i deviznih računa
- Pregled i filtriranje transakcija
- Prenos sredstava između računa
- Devizna konverzija po dnevnom kursu
- Grafički prikaz potrošnje
- Administracija korisnika

---

## Tehnologije

- Next.js (React + TypeScript)
- Tailwind CSS
- PostgreSQL
- Drizzle ORM
- JWT autentifikacija (HttpOnly cookie)
- Docker

---

## Pokretanje projekta

### 1. Kloniranje repozitorijuma

```bash
git clone https://github.com/elab-development/internet-tehnologije-2025-ebankarstvo_2022_0030.git
cd internet-tehnologije-2025-ebankarstvo_2022_0030
```

### 2. Instalacija paketa

```bash
npm install
```

### 3. Pokretanje PostgreSQL baze (Docker)

```bash
docker run --name ebanking-postgres \
-e POSTGRES_USER=postgres \
-e POSTGRES_PASSWORD=postgres \
-e POSTGRES_DB=ebanking \
-p 5432:5432 \
-v ebanking_pgdata:/var/lib/postgresql/data \
-d postgres:17
```

### 4. Kreirati `.env` fajl u root folderu

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/ebanking
JWT_SECRET=SUPER_TAJNA
JWT_EXPIRES=7d
```

### 5. Migracije baze

```bash
npm run db:migrate
```

### 6. (Opcionalno) Seed podaci

```bash
npm run db:seed
```

### 7. Pokretanje aplikacije

```bash
npm run dev
```

Aplikacija je dostupna na:

```
http://localhost:3000
```

## Deploy

Aplikacija je deployovana na Vercel platformi i dostupna je javno putem produkcionog URL-a: \
https://internet-tehnologije-2025-ebankarstvo-2022-0030-8g8o-ptvzwyq5s.vercel.app/.\
Za produkciju se koristi cloud PostgreSQL baza i environment varijable podešene na Vercel-u.

---

## Autor

Uroš Kotaranin  
2022/0030  
Fakultet organizacionih nauka