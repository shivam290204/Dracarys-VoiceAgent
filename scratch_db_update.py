import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def main():
    engine = create_async_engine("postgresql+asyncpg://postgres:postgres@localhost:5432/postgres")
    async with engine.begin() as conn:
        await conn.execute(text("UPDATE telephony_configurations SET name = 'Dracarys Cloudonix SIP' WHERE name = 'Dograh Cloudonix SIP'"))
    print("Database updated!")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
