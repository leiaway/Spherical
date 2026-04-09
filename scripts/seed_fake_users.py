#!/usr/bin/env python3
"""
Seed fake user profiles for Spherical app.

Creates realistic-looking users distributed across all regions so the UserMap
and discovery features look populated. Each fake user gets:
  - A real auth.users row (via Supabase Admin API)
  - An auto-created profiles row (via DB trigger)
  - Coordinates scattered near their region center (+/- ~2 degrees)
  - A display name and home country

Run:
    python scripts/seed_fake_users.py            # seed all regions
    python scripts/seed_fake_users.py --dry-run  # preview without writing
    python scripts/seed_fake_users.py --delete   # remove all seeded users
"""

import os
import sys
import json
import time
import random
import argparse
from pathlib import Path

import requests
from dotenv import load_dotenv

project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))
load_dotenv(project_root / ".env")

SUPABASE_URL = (os.getenv("VITE_SUPABASE_URL") or "").strip("\"'")
SERVICE_ROLE_KEY = (os.getenv("SUPABASE_SERVICE_ROLE_KEY") or "").strip("\"'")

if not SUPABASE_URL or not SERVICE_ROLE_KEY:
    print("❌  Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")
    sys.exit(1)

# ---------------------------------------------------------------------------
# Fake user data: 2-3 users per region.
# Coordinates are approximate city centres — jitter is added at runtime.
# ---------------------------------------------------------------------------
FAKE_USERS = [
    # Nigeria
    {"display_name": "Emeka Okafor",    "home_country": "Nigeria",      "region": "Nigeria",      "lat":  6.5244, "lon":  3.3792},
    {"display_name": "Chisom Adeyemi",  "home_country": "Nigeria",      "region": "Nigeria",      "lat":  9.0579, "lon":  7.4951},
    # Ghana
    {"display_name": "Kofi Mensah",     "home_country": "Ghana",        "region": "Ghana",        "lat":  5.6037, "lon": -0.1870},
    {"display_name": "Ama Asante",      "home_country": "Ghana",        "region": "Ghana",        "lat":  6.6884, "lon": -1.6244},
    # Senegal
    {"display_name": "Fatou Diallo",    "home_country": "Senegal",      "region": "Senegal",      "lat": 14.7167, "lon": -17.4677},
    {"display_name": "Moussa Ndiaye",   "home_country": "Senegal",      "region": "Senegal",      "lat": 14.6928, "lon": -17.4467},
    # Kenya
    {"display_name": "Wanjiru Kamau",   "home_country": "Kenya",        "region": "Kenya",        "lat": -1.2921, "lon": 36.8219},
    {"display_name": "Jomo Otieno",     "home_country": "Kenya",        "region": "Kenya",        "lat": -4.0435, "lon": 39.6682},
    # Uganda
    {"display_name": "Tendo Ssali",     "home_country": "Uganda",       "region": "Uganda",       "lat":  0.3476, "lon": 32.5825},
    # Ethiopia
    {"display_name": "Selam Haile",     "home_country": "Ethiopia",     "region": "Ethiopia",     "lat":  9.0250, "lon": 38.7469},
    {"display_name": "Biruk Tadesse",   "home_country": "Ethiopia",     "region": "Ethiopia",     "lat": 13.4967, "lon": 39.4753},
    # South Africa
    {"display_name": "Thabo Dlamini",   "home_country": "South Africa", "region": "South Africa", "lat": -26.2041, "lon": 28.0473},
    {"display_name": "Naledi Mokoena",  "home_country": "South Africa", "region": "South Africa", "lat": -33.9249, "lon": 18.4241},
    # United States
    {"display_name": "Jordan Hayes",    "home_country": "United States","region": "United States","lat": 40.7128, "lon": -74.0060},
    {"display_name": "Aaliyah Brooks",  "home_country": "United States","region": "United States","lat": 34.0522, "lon": -118.2437},
    {"display_name": "Marcus Webb",     "home_country": "United States","region": "United States","lat": 41.8781, "lon": -87.6298},
    # Canada
    {"display_name": "Priya Sharma",    "home_country": "Canada",       "region": "Canada",       "lat": 43.6532, "lon": -79.3832},
    {"display_name": "Liam Tremblay",   "home_country": "Canada",       "region": "Canada",       "lat": 45.5017, "lon": -73.5673},
    # Brazil
    {"display_name": "Lucas Ferreira",  "home_country": "Brazil",       "region": "Brazil",       "lat": -23.5505, "lon": -46.6333},
    {"display_name": "Ana Ribeiro",     "home_country": "Brazil",       "region": "Brazil",       "lat": -12.9777, "lon": -38.5016},
    # Colombia
    {"display_name": "Valentina Cruz",  "home_country": "Colombia",     "region": "Colombia",     "lat":  4.7110, "lon": -74.0721},
    # Mexico
    {"display_name": "Diego Reyes",     "home_country": "Mexico",       "region": "Mexico",       "lat": 19.4326, "lon": -99.1332},
    {"display_name": "Sofía Morales",   "home_country": "Mexico",       "region": "Mexico",       "lat": 20.6597, "lon": -103.3496},
    # South Korea
    {"display_name": "Ji-ho Park",      "home_country": "South Korea",  "region": "South Korea",  "lat": 37.5665, "lon": 126.9780},
    {"display_name": "Soo-yeon Kim",    "home_country": "South Korea",  "region": "South Korea",  "lat": 35.1796, "lon": 129.0756},
    # Japan
    {"display_name": "Haruto Tanaka",   "home_country": "Japan",        "region": "Japan",        "lat": 35.6762, "lon": 139.6503},
    {"display_name": "Yuki Watanabe",   "home_country": "Japan",        "region": "Japan",        "lat": 34.6937, "lon": 135.5023},
    # China
    {"display_name": "Wei Zhang",       "home_country": "China",        "region": "China",        "lat": 39.9042, "lon": 116.4074},
    {"display_name": "Mei Lin",         "home_country": "China",        "region": "China",        "lat": 31.2304, "lon": 121.4737},
    # Vietnam
    {"display_name": "Minh Nguyen",     "home_country": "Vietnam",      "region": "Vietnam",      "lat": 21.0285, "lon": 105.8542},
    {"display_name": "Lan Pham",        "home_country": "Vietnam",      "region": "Vietnam",      "lat": 10.8231, "lon": 106.6297},
    # Thailand
    {"display_name": "Nattawut Chai",   "home_country": "Thailand",     "region": "Thailand",     "lat": 13.7563, "lon": 100.5018},
    # Indonesia
    {"display_name": "Rizky Pratama",   "home_country": "Indonesia",    "region": "Indonesia",    "lat": -6.2088, "lon": 106.8456},
    {"display_name": "Dewi Santoso",    "home_country": "Indonesia",    "region": "Indonesia",    "lat": -7.7956, "lon": 110.3695},
    # India
    {"display_name": "Arjun Patel",     "home_country": "India",        "region": "India",        "lat": 19.0760, "lon": 72.8777},
    {"display_name": "Priya Nair",      "home_country": "India",        "region": "India",        "lat": 12.9716, "lon": 77.5946},
    {"display_name": "Rahul Singh",     "home_country": "India",        "region": "India",        "lat": 28.6139, "lon": 77.2090},
    # Lebanon
    {"display_name": "Layla Khoury",    "home_country": "Lebanon",      "region": "Lebanon",      "lat": 33.8938, "lon": 35.5018},
    # Egypt
    {"display_name": "Omar Hassan",     "home_country": "Egypt",        "region": "Egypt",        "lat": 30.0444, "lon": 31.2357},
    {"display_name": "Nour El-Din",     "home_country": "Egypt",        "region": "Egypt",        "lat": 31.2001, "lon": 29.9187},
    # Iran
    {"display_name": "Dariush Ahmadi",  "home_country": "Iran",         "region": "Iran",         "lat": 35.6892, "lon": 51.3890},
    # Sweden
    {"display_name": "Maja Lindqvist",  "home_country": "Sweden",       "region": "Sweden",       "lat": 59.3293, "lon": 18.0686},
    {"display_name": "Erik Johansson",  "home_country": "Sweden",       "region": "Sweden",       "lat": 57.7089, "lon": 11.9746},
    # Norway
    {"display_name": "Ingrid Berg",     "home_country": "Norway",       "region": "Norway",       "lat": 59.9139, "lon": 10.7522},
    # Denmark
    {"display_name": "Sofie Nielsen",   "home_country": "Denmark",      "region": "Denmark",      "lat": 55.6761, "lon": 12.5683},
    {"display_name": "Mikkel Hansen",   "home_country": "Denmark",      "region": "Denmark",      "lat": 56.1629, "lon": 10.2039},
    # Greece
    {"display_name": "Eleni Papadaki",  "home_country": "Greece",       "region": "Greece",       "lat": 37.9838, "lon": 23.7275},
    # Italy
    {"display_name": "Marco Ricci",     "home_country": "Italy",        "region": "Italy",        "lat": 41.9028, "lon": 12.4964},
    {"display_name": "Giulia Ferrari",  "home_country": "Italy",        "region": "Italy",        "lat": 45.4654, "lon":  9.1859},
    # Spain
    {"display_name": "Pablo García",    "home_country": "Spain",        "region": "Spain",        "lat": 40.4168, "lon": -3.7038},
    {"display_name": "Carmen Ruiz",     "home_country": "Spain",        "region": "Spain",        "lat": 41.3851, "lon":  2.1734},
]

# Tag all seeded users so we can find and delete them later
SEED_TAG = "spherical_seed_user"


# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------

def admin_headers():
    return {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }

def rest_headers():
    return {
        **admin_headers(),
        "Prefer": "return=representation",
    }

def create_auth_user(email: str, display_name: str) -> str | None:
    """Create an auth user via the Supabase Admin API. Returns the new user's UUID."""
    url = f"{SUPABASE_URL}/auth/v1/admin/users"
    payload = {
        "email": email,
        "password": "Spherical_Seed_2026!",
        "email_confirm": True,
        "user_metadata": {
            "display_name": display_name,
            "seed_tag": SEED_TAG,
        },
    }
    resp = requests.post(url, headers=admin_headers(), json=payload, timeout=15)
    if resp.status_code in (200, 201):
        return resp.json()["id"]
    print(f"    [AUTH ERROR {resp.status_code}] {resp.text[:200]}")
    return None


def update_profile(user_id: str, data: dict) -> bool:
    """Patch the profiles row for a given user UUID."""
    url = f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{user_id}"
    resp = requests.patch(url, headers=rest_headers(), json=data, timeout=15)
    return resp.status_code in (200, 204)


def get_region_id(region_name: str) -> str | None:
    """Look up a region UUID by name."""
    url = f"{SUPABASE_URL}/rest/v1/regions?select=id&name=eq.{requests.utils.quote(region_name)}"
    resp = requests.get(url, headers=rest_headers(), timeout=10)
    if resp.status_code == 200 and resp.json():
        return resp.json()[0]["id"]
    return None


def list_seeded_users() -> list[dict]:
    """Return all auth users whose metadata contains our seed tag."""
    url = f"{SUPABASE_URL}/auth/v1/admin/users?per_page=1000"
    resp = requests.get(url, headers=admin_headers(), timeout=15)
    if resp.status_code != 200:
        return []
    all_users = resp.json().get("users", [])
    return [
        u for u in all_users
        if (u.get("user_metadata") or {}).get("seed_tag") == SEED_TAG
    ]


def delete_auth_user(user_id: str) -> bool:
    url = f"{SUPABASE_URL}/auth/v1/admin/users/{user_id}"
    resp = requests.delete(url, headers=admin_headers(), timeout=15)
    return resp.status_code in (200, 204)


def jitter(value: float, amount: float = 1.5) -> float:
    """Add small random offset so users don't all stack on the exact same point."""
    return round(value + random.uniform(-amount, amount), 6)


# ---------------------------------------------------------------------------
# Main actions
# ---------------------------------------------------------------------------

def seed(dry_run: bool = False):
    print("🌍  Spherical – Fake User Seeder\n" + "=" * 45)
    if dry_run:
        print("DRY RUN — no data will be written\n")

    # Pre-fetch region IDs once to avoid N+1 lookups
    regions_needed = {u["region"] for u in FAKE_USERS}
    region_cache: dict[str, str | None] = {}
    print("Fetching region IDs...")
    for name in regions_needed:
        rid = get_region_id(name) if not dry_run else f"dry-run-id-{name}"
        region_cache[name] = rid
        status = "✓" if rid else "✗ NOT FOUND"
        print(f"  {status}  {name}")
    print()

    created = 0
    skipped = 0
    for i, user in enumerate(FAKE_USERS):
        name = user["display_name"]
        # Derive a deterministic seed email so re-runs are idempotent
        slug = name.lower().replace(" ", ".").replace("'", "").replace("-", "")
        email = f"{slug}.{SEED_TAG}@example.com"

        region_id = region_cache.get(user["region"])

        print(f"[{i+1:02d}/{len(FAKE_USERS)}] {name} ({user['home_country']})")

        if dry_run:
            print(f"        email={email}  lat={jitter(user['lat']):.4f}  lon={jitter(user['lon']):.4f}")
            created += 1
            continue

        # Create auth user (trigger will auto-create the profiles row)
        user_id = create_auth_user(email, name)
        if not user_id:
            print(f"        ✗ Skipped (likely already exists)")
            skipped += 1
            time.sleep(0.3)
            continue

        # Update profile with location + metadata
        profile_data = {
            "display_name": name,
            "home_country": user["home_country"],
            "current_latitude": jitter(user["lat"]),
            "current_longitude": jitter(user["lon"]),
            "location_enabled": True,
        }
        if region_id:
            profile_data["current_region_id"] = region_id

        ok = update_profile(user_id, profile_data)
        if ok:
            print(f"        ✓ Created & located")
            created += 1
        else:
            print(f"        ⚠ Auth user created but profile update failed")
            created += 1  # user still exists, just without coords

        time.sleep(0.4)  # stay well under Supabase rate limits

    print("\n" + "=" * 45)
    print(f"✅  Done — {created} created, {skipped} skipped")


def delete_seeded():
    print("🗑   Removing all seeded users...\n")
    users = list_seeded_users()
    if not users:
        print("No seeded users found.")
        return
    print(f"Found {len(users)} seeded users.")
    removed = 0
    for u in users:
        name = (u.get("user_metadata") or {}).get("display_name", u["email"])
        ok = delete_auth_user(u["id"])
        status = "✓" if ok else "✗"
        print(f"  {status}  {name} ({u['email']})")
        if ok:
            removed += 1
        time.sleep(0.2)
    print(f"\n✅  Removed {removed}/{len(users)} users")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed fake users into Spherical")
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--dry-run", action="store_true", help="Preview without writing")
    group.add_argument("--delete",  action="store_true", help="Remove all seeded users")
    args = parser.parse_args()

    random.seed(42)  # reproducible jitter

    if args.delete:
        delete_seeded()
    else:
        seed(dry_run=args.dry_run)
