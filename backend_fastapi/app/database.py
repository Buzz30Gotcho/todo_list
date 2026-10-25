import os

from sqlalchemy import URL, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
else:
    password = os.getenv("POSTGRES_PASSWORD")
    if not password:
        raise RuntimeError(
            "Set DATABASE_URL or POSTGRES_PASSWORD to configure the database."
        )

    database_url = URL.create(
        "postgresql",
        username=os.getenv("POSTGRES_USER", "todo"),
        password=password,
        host=os.getenv("POSTGRES_HOST", "db"),
        port=int(os.getenv("POSTGRES_PORT", "5432")),
        database=os.getenv("POSTGRES_DB", "todolist"),
    )
    engine = create_engine(database_url, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
