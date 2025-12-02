"""
Database setup script.
Creates database schema and runs migrations.
"""
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from backend.database.connection import init_db, test_connection, engine
from backend.config import config
from loguru import logger
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT


def create_database_if_not_exists():
    """Create the database if it doesn't exist."""
    try:
        # Connect to PostgreSQL server (not to a specific database)
        conn = psycopg2.connect(
            host=config.database.host,
            port=config.database.port,
            user=config.database.user,
            password=config.database.password,
            database="postgres"  # Connect to default postgres database
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute(
            f"SELECT 1 FROM pg_database WHERE datname = '{config.database.name}'"
        )
        exists = cursor.fetchone()
        
        if not exists:
            # Create database
            cursor.execute(f'CREATE DATABASE "{config.database.name}"')
            logger.info(f"Database '{config.database.name}' created successfully")
        else:
            logger.info(f"Database '{config.database.name}' already exists")
        
        cursor.close()
        conn.close()
        return True
    
    except Exception as e:
        logger.error(f"Error creating database: {e}")
        return False


def run_migrations():
    """Run SQL migration files."""
    migrations_dir = Path(__file__).parent.parent / "database" / "migrations"
    
    if not migrations_dir.exists():
        logger.warning("Migrations directory not found")
        return
    
    migration_files = sorted(migrations_dir.glob("*.sql"))
    
    if not migration_files:
        logger.warning("No migration files found")
        return
    
    try:
        conn = engine.connect()
        
        for migration_file in migration_files:
            logger.info(f"Running migration: {migration_file.name}")
            with open(migration_file, "r", encoding="utf-8") as f:
                sql = f.read()
                # Execute each statement separately
                for statement in sql.split(";"):
                    statement = statement.strip()
                    if statement:
                        conn.execute(statement)
                conn.commit()
        
        conn.close()
        logger.info("Migrations completed successfully")
    
    except Exception as e:
        logger.error(f"Error running migrations: {e}")
        raise


def main():
    """Main setup function."""
    logger.info("Setting up database...")
    
    # Create database if it doesn't exist
    if not create_database_if_not_exists():
        logger.error("Failed to create database")
        sys.exit(1)
    
    # Test connection
    if not test_connection():
        logger.error("Database connection failed")
        sys.exit(1)
    
    # Initialize tables (SQLAlchemy)
    logger.info("Creating database tables...")
    try:
        init_db()
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        sys.exit(1)
    
    # Run migrations
    logger.info("Running migrations...")
    try:
        run_migrations()
    except Exception as e:
        logger.error(f"Error running migrations: {e}")
        sys.exit(1)
    
    logger.info("Database setup completed successfully!")


if __name__ == "__main__":
    main()


