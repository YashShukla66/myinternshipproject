from io import BytesIO

from django.http import HttpResponse

from openpyxl import Workbook

from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate

from rest_framework.views import APIView

from vehicles.models import Vehicle


class VehiclePDFReportAPIView(APIView):

    def get(self, request):

        buffer = BytesIO()

        doc = SimpleDocTemplate(buffer)

        styles = getSampleStyleSheet()

        elements = []

        elements.append(
            Paragraph("<b>Vehicle Report</b>", styles["Heading1"])
        )

        vehicles = Vehicle.objects.all()

        for vehicle in vehicles:

            elements.append(
                Paragraph(
                    f"""
                    Registration: {vehicle.registration_number}<br/>
                    Vehicle: {vehicle.vehicle_name}<br/>
                    Mileage: {vehicle.mileage}<br/>
                    Status: {vehicle.status}<br/><br/>
                    """,
                    styles["BodyText"],
                )
            )

        doc.build(elements)

        pdf = buffer.getvalue()

        buffer.close()

        response = HttpResponse(
            pdf,
            content_type="application/pdf"
        )

        response[
            "Content-Disposition"
        ] = 'attachment; filename="vehicles.pdf"'

        return response


class VehicleExcelReportAPIView(APIView):

    def get(self, request):

        workbook = Workbook()

        sheet = workbook.active

        sheet.title = "Vehicles"

        sheet.append([
            "Registration",
            "Vehicle",
            "Mileage",
            "Status",
        ])

        vehicles = Vehicle.objects.all()

        for vehicle in vehicles:

            sheet.append([
                vehicle.registration_number,
                vehicle.vehicle_name,
                vehicle.mileage,
                vehicle.status,
            ])

        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

        response[
            "Content-Disposition"
        ] = 'attachment; filename="vehicles.xlsx"'

        workbook.save(response)

        return response