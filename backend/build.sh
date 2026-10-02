#!/usr/bin/env bash
# Render Build Script
# This runs during each deploy on Render

set -o errexit  # exit on error

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Seed data (uses get_or_create, so it's safe to run multiple times)
python manage.py seed_data
