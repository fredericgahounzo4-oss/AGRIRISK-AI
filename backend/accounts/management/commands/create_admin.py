import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    """
    Crée (ou met à jour) un compte administrateur à partir de variables
    d'environnement, pour pouvoir se connecter sans accès shell sur Render.

    Variables lues :
      ADMIN_EMAIL    - email de connexion (requis pour que la commande fasse quelque chose)
      ADMIN_PASSWORD - mot de passe (requis)
      ADMIN_NAME     - nom affiché (optionnel, "Administrateur" par défaut)

    Si ADMIN_EMAIL ou ADMIN_PASSWORD ne sont pas définis, la commande ne fait
    rien silencieusement (pratique pour ne pas bloquer le build en local).
    """

    help = "Crée ou met à jour un compte admin à partir de ADMIN_EMAIL / ADMIN_PASSWORD."

    def handle(self, *args, **options):
        email = os.environ.get("ADMIN_EMAIL")
        password = os.environ.get("ADMIN_PASSWORD")
        name = os.environ.get("ADMIN_NAME", "Administrateur")

        if not email or not password:
            self.stdout.write(
                self.style.WARNING(
                    "ADMIN_EMAIL / ADMIN_PASSWORD non définis : aucun compte admin créé."
                )
            )
            return

        User = get_user_model()
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "username": email,
                "name": name,
                "role": User.Role.ADMIN,
                "is_staff": True,
                "is_superuser": True,
            },
        )

        # On force ces champs à chaque déploiement, même si le compte existait déjà
        # (utile si tu changes le mot de passe via la variable d'env et redéploies).
        user.set_password(password)
        user.role = User.Role.ADMIN
        user.is_staff = True
        user.is_superuser = True
        if not user.name:
            user.name = name
        user.save()

        action = "créé" if created else "mis à jour"
        self.stdout.write(self.style.SUCCESS(f"Compte admin {action} : {email}"))
