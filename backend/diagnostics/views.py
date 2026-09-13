from io import BytesIO

from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ai_client.gemini_client import AIConfigError, AIRequestError
from notifications.models import notify

from .models import Diagnostic
from .serializers import DiagnosticUploadSerializer
from .services import analyze_image


class DiagnosticListCreateView(APIView):
    """
    GET  /api/diagnostics — historique des diagnostics de l'utilisateur connecté.
    POST /api/diagnostics — envoie l'image à l'IA et enregistre le résultat.
    """

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        diagnostics = Diagnostic.objects.filter(user=request.user)
        return Response([d.to_history_dict(request=request) for d in diagnostics])

    def post(self, request):
        serializer = DiagnosticUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"message": "Erreur de validation.", "errors": serializer.errors},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        diagnostic_type = serializer.validated_data["type"]
        image_file = serializer.validated_data["image"]

        try:
            result = analyze_image(diagnostic_type, image_file)
        except AIConfigError as exc:
            return Response({"message": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except AIRequestError as exc:
            return Response(
                {"message": f"Erreur lors de l'analyse IA : {exc}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except ValueError as exc:
            return Response(
                {"message": f"Réponse IA invalide : {exc}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        parsed = result["parsed"]
        # Remettre le curseur du fichier au début avant de le sauvegarder en base.
        image_file.seek(0)

        diagnostic = Diagnostic.objects.create(
            user=request.user,
            type=diagnostic_type,
            image=image_file,
            disease_name=parsed["disease_name"],
            scientific_name=parsed["scientific_name"],
            confidence=parsed["confidence"],
            risk_level=parsed["risk_level"],
            causes=parsed["causes"],
            recommendations=parsed["recommendations"],
            treatment=parsed["treatment"],
            raw_ai_response=result["raw_text"],
        )

        notify(
            request.user,
            title="Diagnostic terminé",
            body=f"{diagnostic.disease_name} — risque {diagnostic.risk_level.lower()}.",
            icon="🌿" if diagnostic_type == "culture" else "🐄",
            link=f"/app/diagnostic/resultat/{diagnostic.id}",
        )

        return Response(
            diagnostic.to_result_dict(request=request), status=status.HTTP_201_CREATED
        )


class DiagnosticDetailView(APIView):
    """GET /api/diagnostics/<id> — détail complet d'un diagnostic."""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        diagnostic = get_object_or_404(Diagnostic, pk=pk, user=request.user)
        return Response(diagnostic.to_result_dict(request=request))


class DiagnosticReportView(APIView):
    """GET /api/diagnostics/<id>/report — génère un PDF téléchargeable du diagnostic."""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        diagnostic = get_object_or_404(Diagnostic, pk=pk, user=request.user)

        try:
            from reportlab.lib.pagesizes import A4
            from reportlab.lib.units import cm
            from reportlab.pdfgen import canvas
        except ImportError:
            raise Http404(
                "Génération de PDF indisponible : le paquet 'reportlab' n'est pas installé."
            )

        buffer = BytesIO()
        doc = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4
        y = height - 2 * cm

        def line(text, size=11, bold=False, gap=0.7 * cm):
            nonlocal y
            doc.setFont("Helvetica-Bold" if bold else "Helvetica", size)
            doc.drawString(2 * cm, y, text)
            y -= gap

        line("AgriRisk AI — Rapport de diagnostic", size=16, bold=True, gap=1.2 * cm)
        line(f"Type : {diagnostic.get_type_display()}")
        line(f"Date : {diagnostic.created_at.strftime('%d/%m/%Y %H:%M')}")
        line(f"Agriculteur : {diagnostic.user.name}")
        y -= 0.3 * cm

        line(f"Diagnostic : {diagnostic.disease_name}", size=13, bold=True)
        if diagnostic.scientific_name:
            line(f"Nom scientifique : {diagnostic.scientific_name}")
        line(f"Niveau de risque : {diagnostic.risk_level}")
        line(f"Confiance de l'IA : {diagnostic.confidence}%")
        y -= 0.3 * cm

        line("Causes possibles :", bold=True)
        for cause in diagnostic.causes:
            line(f"  • {cause}")
        y -= 0.2 * cm

        line("Recommandations :", bold=True)
        for reco in diagnostic.recommendations:
            line(f"  • {reco}")
        y -= 0.2 * cm

        line("Traitement conseillé :", bold=True)
        for chunk in [diagnostic.treatment[i : i + 90] for i in range(0, len(diagnostic.treatment), 90)]:
            line(chunk)

        y -= 0.6 * cm
        doc.setFont("Helvetica-Oblique", 8)
        doc.drawString(
            2 * cm, y,
            "Généré automatiquement par une IA — à confirmer par un expert agricole/vétérinaire.",
        )

        doc.showPage()
        doc.save()
        buffer.seek(0)

        return FileResponse(
            buffer,
            as_attachment=True,
            filename=f"diagnostic-{diagnostic.id}.pdf",
            content_type="application/pdf",
        )
