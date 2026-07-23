from django.core.management.base import BaseCommand

from vehicles.models import Vehicle
from notifications.models import Notification


class Command(BaseCommand):

    help = "Generate Fleet Notifications"

    def handle(self, *args, **kwargs):

        Notification.objects.all().delete()

        vehicles = Vehicle.objects.all()

        for vehicle in vehicles:

            if vehicle.mileage > 80000:

                Notification.objects.create(

                    vehicle=vehicle,

                    title="High Mileage",

                    message=f"{vehicle.vehicle_name} crossed 80,000 km.",

                    priority="HIGH",

                )

            if vehicle.status == "MAINTENANCE":

                Notification.objects.create(

                    vehicle=vehicle,

                    title="Vehicle Under Maintenance",

                    message=f"{vehicle.vehicle_name} is currently under maintenance.",

                    priority="MEDIUM",

                )

        self.stdout.write(
            self.style.SUCCESS(
                "Notifications generated successfully!"
            )
        )