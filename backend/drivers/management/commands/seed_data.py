"""
Management command to seed sample Drivers and Vehicles data.
Run with: python manage.py seed_data
"""
import datetime
from django.core.management.base import BaseCommand
from drivers.models import Driver
from vehicles.models import Vehicle


class Command(BaseCommand):
    help = "Seeds the database with sample drivers and vehicles data"

    def handle(self, *args, **options):
        self.stdout.write("[*] Seeding Drivers...")

        drivers_data = [
            {
                "full_name": "Rajesh Kumar",
                "email": "rajesh.kumar@fleet.com",
                "phone": "9876543210",
                "license_number": "DL-01-2019-0012345",
                "address": "12, MG Road, New Delhi",
                "date_of_birth": datetime.date(1990, 5, 15),
                "joining_date": datetime.date(2022, 1, 10),
                "status": "AVAILABLE",
            },
            {
                "full_name": "Amit Sharma",
                "email": "amit.sharma@fleet.com",
                "phone": "9876543211",
                "license_number": "MH-02-2020-0056789",
                "address": "45, Andheri West, Mumbai",
                "date_of_birth": datetime.date(1988, 8, 22),
                "joining_date": datetime.date(2021, 6, 1),
                "status": "AVAILABLE",
            },
            {
                "full_name": "Suresh Patel",
                "email": "suresh.patel@fleet.com",
                "phone": "9876543212",
                "license_number": "GJ-05-2018-0034567",
                "address": "78, CG Road, Ahmedabad",
                "date_of_birth": datetime.date(1992, 3, 10),
                "joining_date": datetime.date(2023, 2, 15),
                "status": "AVAILABLE",
            },
            {
                "full_name": "Vikram Singh",
                "email": "vikram.singh@fleet.com",
                "phone": "9876543213",
                "license_number": "RJ-14-2017-0098765",
                "address": "22, MI Road, Jaipur",
                "date_of_birth": datetime.date(1985, 11, 30),
                "joining_date": datetime.date(2020, 9, 20),
                "status": "AVAILABLE",
            },
            {
                "full_name": "Pradeep Reddy",
                "email": "pradeep.reddy@fleet.com",
                "phone": "9876543214",
                "license_number": "TN-09-2021-0045678",
                "address": "56, Anna Salai, Chennai",
                "date_of_birth": datetime.date(1993, 7, 8),
                "joining_date": datetime.date(2023, 5, 1),
                "status": "AVAILABLE",
            },
            {
                "full_name": "Manoj Verma",
                "email": "manoj.verma@fleet.com",
                "phone": "9876543215",
                "license_number": "UP-32-2019-0067890",
                "address": "33, Hazratganj, Lucknow",
                "date_of_birth": datetime.date(1991, 1, 25),
                "joining_date": datetime.date(2022, 8, 12),
                "status": "AVAILABLE",
            },
            {
                "full_name": "Arjun Nair",
                "email": "arjun.nair@fleet.com",
                "phone": "9876543216",
                "license_number": "KA-01-2020-0023456",
                "address": "89, MG Road, Bengaluru",
                "date_of_birth": datetime.date(1994, 9, 18),
                "joining_date": datetime.date(2024, 1, 5),
                "status": "AVAILABLE",
            },
            {
                "full_name": "Deepak Yadav",
                "email": "deepak.yadav@fleet.com",
                "phone": "9876543217",
                "license_number": "MP-09-2018-0078901",
                "address": "44, New Market, Bhopal",
                "date_of_birth": datetime.date(1987, 4, 12),
                "joining_date": datetime.date(2021, 3, 25),
                "status": "LEAVE",
            },
            {
                "full_name": "Rohit Chauhan",
                "email": "rohit.chauhan@fleet.com",
                "phone": "9876543218",
                "license_number": "HR-06-2022-0089012",
                "address": "67, Sector 17, Chandigarh",
                "date_of_birth": datetime.date(1996, 12, 5),
                "joining_date": datetime.date(2024, 4, 10),
                "status": "AVAILABLE",
            },
            {
                "full_name": "Sanjay Mishra",
                "email": "sanjay.mishra@fleet.com",
                "phone": "9876543219",
                "license_number": "WB-06-2019-0090123",
                "address": "12, Park Street, Kolkata",
                "date_of_birth": datetime.date(1989, 6, 28),
                "joining_date": datetime.date(2022, 11, 1),
                "status": "AVAILABLE",
            },
        ]

        created_drivers = []
        for d in drivers_data:
            driver, created = Driver.objects.get_or_create(
                license_number=d["license_number"],
                defaults=d,
            )
            created_drivers.append(driver)
            status = "[+] Created" if created else "[=] Exists"
            self.stdout.write(f"  {status}: {driver.full_name}")

        self.stdout.write(self.style.SUCCESS(f"\n[OK] Drivers done! ({len(created_drivers)} total)\n"))

        # ── Vehicles ──────────────────────────────────────────────────
        self.stdout.write("[*] Seeding Vehicles...")

        vehicles_data = [
            {
                "registration_number": "DL-01-AB-1234",
                "vehicle_name": "Swift Dzire",
                "vehicle_type": "CAR",
                "manufacturer": "Maruti Suzuki",
                "model": "Dzire VXI",
                "manufacturing_year": 2022,
                "color": "Pearl White",
                "fuel_type": "Petrol",
                "seating_capacity": 5,
                "mileage": 22.0,
                "status": "ACTIVE",
                "purchase_date": datetime.date(2022, 3, 15),
                "insurance_expiry": datetime.date(2027, 3, 14),
            },
            {
                "registration_number": "MH-02-CD-5678",
                "vehicle_name": "Innova Crysta",
                "vehicle_type": "CAR",
                "manufacturer": "Toyota",
                "model": "Crysta GX",
                "manufacturing_year": 2023,
                "color": "Super White",
                "fuel_type": "Diesel",
                "seating_capacity": 7,
                "mileage": 15.0,
                "status": "ACTIVE",
                "purchase_date": datetime.date(2023, 1, 20),
                "insurance_expiry": datetime.date(2028, 1, 19),
            },
            {
                "registration_number": "KA-01-EF-9012",
                "vehicle_name": "Eicher Pro 2049",
                "vehicle_type": "TRUCK",
                "manufacturer": "Eicher",
                "model": "Pro 2049",
                "manufacturing_year": 2021,
                "color": "Red",
                "fuel_type": "Diesel",
                "seating_capacity": 3,
                "mileage": 12.5,
                "status": "ACTIVE",
                "purchase_date": datetime.date(2021, 7, 10),
                "insurance_expiry": datetime.date(2026, 7, 9),
            },
            {
                "registration_number": "GJ-05-GH-3456",
                "vehicle_name": "Tata Ace Gold",
                "vehicle_type": "TRUCK",
                "manufacturer": "Tata Motors",
                "model": "Ace Gold",
                "manufacturing_year": 2022,
                "color": "Blazing Red",
                "fuel_type": "Diesel",
                "seating_capacity": 2,
                "mileage": 18.0,
                "status": "ACTIVE",
                "purchase_date": datetime.date(2022, 5, 25),
                "insurance_expiry": datetime.date(2027, 5, 24),
            },
            {
                "registration_number": "RJ-14-IJ-7890",
                "vehicle_name": "Ashok Leyland Viking",
                "vehicle_type": "BUS",
                "manufacturer": "Ashok Leyland",
                "model": "Viking BS6",
                "manufacturing_year": 2023,
                "color": "Blue",
                "fuel_type": "Diesel",
                "seating_capacity": 52,
                "mileage": 6.0,
                "status": "ACTIVE",
                "purchase_date": datetime.date(2023, 4, 1),
                "insurance_expiry": datetime.date(2028, 3, 31),
            },
            {
                "registration_number": "TN-09-KL-1234",
                "vehicle_name": "Honda City",
                "vehicle_type": "CAR",
                "manufacturer": "Honda",
                "model": "City ZX CVT",
                "manufacturing_year": 2024,
                "color": "Radiant Red",
                "fuel_type": "Petrol",
                "seating_capacity": 5,
                "mileage": 17.8,
                "status": "ACTIVE",
                "purchase_date": datetime.date(2024, 2, 14),
                "insurance_expiry": datetime.date(2029, 2, 13),
            },
            {
                "registration_number": "UP-32-MN-5678",
                "vehicle_name": "Royal Enfield Classic",
                "vehicle_type": "BIKE",
                "manufacturer": "Royal Enfield",
                "model": "Classic 350",
                "manufacturing_year": 2023,
                "color": "Stealth Black",
                "fuel_type": "Petrol",
                "seating_capacity": 2,
                "mileage": 35.0,
                "status": "ACTIVE",
                "purchase_date": datetime.date(2023, 6, 1),
                "insurance_expiry": datetime.date(2028, 5, 31),
            },
            {
                "registration_number": "MP-09-OP-9012",
                "vehicle_name": "Hyundai Creta",
                "vehicle_type": "CAR",
                "manufacturer": "Hyundai",
                "model": "Creta SX(O)",
                "manufacturing_year": 2024,
                "color": "Titan Grey",
                "fuel_type": "Diesel",
                "seating_capacity": 5,
                "mileage": 21.4,
                "status": "MAINTENANCE",
                "purchase_date": datetime.date(2024, 1, 10),
                "insurance_expiry": datetime.date(2029, 1, 9),
            },
            {
                "registration_number": "HR-06-QR-3456",
                "vehicle_name": "Tata Nexon EV",
                "vehicle_type": "CAR",
                "manufacturer": "Tata Motors",
                "model": "Nexon EV Max",
                "manufacturing_year": 2024,
                "color": "Pristine White",
                "fuel_type": "Electric",
                "seating_capacity": 5,
                "mileage": 0.0,
                "status": "ACTIVE",
                "purchase_date": datetime.date(2024, 3, 20),
                "insurance_expiry": datetime.date(2029, 3, 19),
            },
            {
                "registration_number": "WB-06-ST-7890",
                "vehicle_name": "BharatBenz 1217C",
                "vehicle_type": "TRUCK",
                "manufacturer": "BharatBenz",
                "model": "1217C",
                "manufacturing_year": 2022,
                "color": "Silver",
                "fuel_type": "Diesel",
                "seating_capacity": 3,
                "mileage": 10.0,
                "status": "ACTIVE",
                "purchase_date": datetime.date(2022, 9, 5),
                "insurance_expiry": datetime.date(2027, 9, 4),
            },
            {
                "registration_number": "DL-03-UV-2345",
                "vehicle_name": "Mahindra Bolero",
                "vehicle_type": "CAR",
                "manufacturer": "Mahindra",
                "model": "Bolero Neo N10",
                "manufacturing_year": 2023,
                "color": "Diamond White",
                "fuel_type": "Diesel",
                "seating_capacity": 7,
                "mileage": 16.0,
                "status": "ACTIVE",
                "purchase_date": datetime.date(2023, 8, 18),
                "insurance_expiry": datetime.date(2028, 8, 17),
            },
            {
                "registration_number": "KA-03-WX-6789",
                "vehicle_name": "Force Traveller",
                "vehicle_type": "BUS",
                "manufacturer": "Force Motors",
                "model": "Traveller 26",
                "manufacturing_year": 2022,
                "color": "White",
                "fuel_type": "Diesel",
                "seating_capacity": 26,
                "mileage": 9.5,
                "status": "INACTIVE",
                "purchase_date": datetime.date(2022, 11, 1),
                "insurance_expiry": datetime.date(2026, 10, 31),
            },
        ]

        created_vehicles = []
        for v in vehicles_data:
            vehicle, created = Vehicle.objects.get_or_create(
                registration_number=v["registration_number"],
                defaults=v,
            )
            created_vehicles.append(vehicle)
            status = "[+] Created" if created else "[=] Exists"
            self.stdout.write(f"  {status}: {vehicle.vehicle_name} ({vehicle.registration_number})")

        self.stdout.write(self.style.SUCCESS(f"\n[OK] Vehicles done! ({len(created_vehicles)} total)\n"))

        # ── Assign some drivers to vehicles ───────────────────────────
        self.stdout.write("[*] Assigning drivers to vehicles...")
        assignments = [
            (0, 0),  # Rajesh Kumar -> Swift Dzire
            (1, 1),  # Amit Sharma -> Innova Crysta
            (2, 2),  # Suresh Patel -> Eicher Pro 2049
            (3, 4),  # Vikram Singh -> Ashok Leyland Viking
            (4, 5),  # Pradeep Reddy -> Honda City
            (5, 3),  # Manoj Verma -> Tata Ace Gold
            (6, 8),  # Arjun Nair -> Tata Nexon EV
        ]

        for driver_idx, vehicle_idx in assignments:
            driver = created_drivers[driver_idx]
            vehicle = created_vehicles[vehicle_idx]
            if vehicle.assigned_driver is None:
                vehicle.assigned_driver = driver
                vehicle.save()
                self.stdout.write(f"  [+] {driver.full_name} -> {vehicle.vehicle_name}")
            else:
                self.stdout.write(f"  [=] {vehicle.vehicle_name} already has a driver")

        self.stdout.write(self.style.SUCCESS("\n[DONE] Seeding complete! All data has been added."))
