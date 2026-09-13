#!/usr/bin/env bash
# Exécuté par Render avant chaque déploiement du backend.
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate
