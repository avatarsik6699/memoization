from app.seeders.base import BaseSeeder
from app.seeders.demo_data import DemoDataSeeder

# Registration order = execution order.
# To add a new seeder: create the class, import it here, append to the list.
ALL_SEEDERS: list[type[BaseSeeder]] = [
    DemoDataSeeder,
]

__all__ = ["ALL_SEEDERS", "BaseSeeder"]
