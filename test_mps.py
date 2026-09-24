import asyncio
import httpx

async def main():
    async with httpx.AsyncClient() as client:
        res = await client.post(
            'https://services.dograh.com/api/v1/workflow/create-workflow', 
            json={'call_type': 'INBOUND', 'use_case': 'test', 'activity_description': 'test'}, 
            headers={'X-Created-By': '1'}
        )
        print(res.status_code, res.text)

asyncio.run(main())
