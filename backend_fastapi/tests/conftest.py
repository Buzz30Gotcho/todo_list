import os
import tempfile
from pathlib import Path

# Les tests utilisent une base temporaire, jamais la base de développement.
_test_database_dir = tempfile.TemporaryDirectory()
os.environ["DATABASE_URL"] = f"sqlite:///{Path(_test_database_dir.name) / 'test.db'}"
