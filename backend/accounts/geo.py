"""
Géolocalisation approximative pour la carte des fournisseurs.

On n'a pas de vrai service de géocodage ici : on associe chaque région
connue (villes du Togo et de Côte d'Ivoire, les deux pays couverts par
cette démo) à des coordonnées approximatives de son centre-ville, avec un
léger décalage aléatoire mais stable (dérivé de l'id du compte) pour que
plusieurs fournisseurs d'une même ville n'apparaissent pas exactement au
même point sur la carte.
"""

import hashlib
import math

# Centres-villes approximatifs (latitude, longitude).
CITY_COORDS: dict[str, tuple[float, float]] = {
    # Togo
    "lome": (6.1319, 1.2228),
    "kara": (9.5511, 1.1861),
    "sokode": (8.9833, 1.1333),
    "kpalime": (6.9000, 0.6333),
    "atakpame": (7.5333, 1.1333),
    "dapaong": (10.8631, 0.2075),
    "tsevie": (6.4270, 1.2130),
    "aneho": (6.2333, 1.5833),
    # Côte d'Ivoire
    "abidjan": (5.3600, -4.0083),
    "yopougon": (5.3453, -4.0864),
    "yamoussoukro": (6.8276, -5.2893),
    "bouake": (7.6900, -5.0300),
    "korhogo": (9.4580, -5.6296),
    "san-pedro": (4.7485, -6.6363),
    "abengourou": (6.7297, -3.4964),
    "daloa": (6.8770, -6.4502),
}

# Point par défaut si la région n'est pas reconnue (Lomé, centre de la zone
# de lancement de la plateforme).
DEFAULT_COORDS = CITY_COORDS["lome"]

_JITTER_DEGREES = 0.03  # ~± 3 km, purement visuel pour éviter les points superposés


def _normalize(region: str | None) -> str:
    if not region:
        return ""
    return (
        region.strip()
        .lower()
        .replace("é", "e")
        .replace("è", "e")
        .replace("ê", "e")
        .replace("î", "i")
        .replace("ô", "o")
        .replace("'", "-")
        .replace(" ", "-")
    )


def resolve_coordinates(region: str | None, seed: str) -> tuple[float, float]:
    """Renvoie (lat, lng) pour une région donnée, avec un léger décalage stable."""
    key = _normalize(region)
    base_lat, base_lng = CITY_COORDS.get(key, DEFAULT_COORDS)

    # Décalage déterministe basé sur l'id du compte : stable à chaque appel,
    # mais différent d'un compte à l'autre.
    digest = hashlib.md5(seed.encode()).hexdigest()
    offset_lat = ((int(digest[:8], 16) / 0xFFFFFFFF) - 0.5) * 2 * _JITTER_DEGREES
    offset_lng = ((int(digest[8:16], 16) / 0xFFFFFFFF) - 0.5) * 2 * _JITTER_DEGREES

    return base_lat + offset_lat, base_lng + offset_lng


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Distance à vol d'oiseau entre deux points (km)."""
    r = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return round(r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)), 1)
