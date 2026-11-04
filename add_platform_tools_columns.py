from sqlalchemy import inspect, text
from app.core.database import engine

inspector = inspect(engine)

existing_columns = {
    column["name"]
    for column in inspector.get_columns("employees")
}

with engine.begin() as connection:

    if "platform_tools" not in existing_columns:
        connection.execute(text(
            "ALTER TABLE employees ADD COLUMN platform_tools JSON"
        ))
        print("Added platform_tools")

    if "platform_tools_proficiency" not in existing_columns:
        connection.execute(text(
            "ALTER TABLE employees ADD COLUMN platform_tools_proficiency JSON"
        ))
        print("Added platform_tools_proficiency")

    connection.execute(text("""
        UPDATE employees
        SET platform_tools = '[]'
        WHERE platform_tools IS NULL
    """))

    connection.execute(text("""
        UPDATE employees
        SET platform_tools_proficiency = '[]'
        WHERE platform_tools_proficiency IS NULL
    """))

print("Database update completed successfully!")