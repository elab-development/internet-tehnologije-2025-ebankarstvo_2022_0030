import "dotenv/config"

process.env.JWT_SECRET ||= "test_jwt_secret"

if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "postgres://postgres:postgres@localhost:5432/ebanka"
}