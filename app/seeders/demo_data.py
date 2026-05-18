"""Development/demo data seeder for memoization.

Idempotent: skips if the demo user already exists.

Fixed credentials
-----------------
User: email=demo@memoization.local  password=Demo1234!

Future document/page seed data belongs here once the corresponding domain models
land in a phase.
"""

from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.auth.utils import hash_password
from app.modules.users.models import User, UserRole
from app.seeders.base import BaseSeeder


class DemoDataSeeder(BaseSeeder):
    name = "demo_data"
    description = "Demo memoization user; extend with documents when document models exist"

    USER_EMAIL = "demo@memoization.local"
    USER_PASSWORD = "Demo1234!"

    async def run(self, session: AsyncSession) -> int:
        existing = await session.scalar(select(User).where(User.email == self.USER_EMAIL))
        if existing is not None:
            return 0

        session.add(
            User(
                email=self.USER_EMAIL,
                hashed_password=hash_password(self.USER_PASSWORD),
                role=UserRole.user,
                consent_152fz=True,
                consent_at=datetime.now(UTC).replace(tzinfo=None),
                is_active=True,
            )
        )
        await session.commit()
        return 1
