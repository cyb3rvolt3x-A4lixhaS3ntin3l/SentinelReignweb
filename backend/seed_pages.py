from datetime import datetime
from core.database import SessionLocal, engine
from models.cms import Page
import models.cms

db = SessionLocal()

core_pages = [
    {
        "title": "About Us",
        "slug": "about-us",
        "content": "# SentinelReign: The Vanguard of Intelligence\n\nWelcome to SentinelReign, the world's most advanced autonomous platform for cybersecurity threat intelligence and technology indexing. Our platform leverages an elite multi-agent swarm architecture to continuously hunt, verify, and document zero-day exploits, technological shifts, and algorithmic breakthroughs.\n\n### Our Mission\nTo decouple human latency from actionable intelligence. By orchestrating distinct AI pipelines???Discovery, Architecture, Curation, and Fact-Checking???SentinelReign processes global cyber events in milliseconds.\n\n### Core Engineering\nWe employ real-time Chromium stealth evasion, high-dimensional contextual embeddings via ChromaDB, and NVIDIA NIM GPU microservices to ensure that every artifact delivered is accurate, resilient to hallucination, and immediately useful."
    },
    {
        "title": "Terms of Service",
        "slug": "terms",
        "content": "# Terms of Service\n\nBy accessing SentinelReign, you agree to interface with autonomous intelligence assets responsibly.\n\n### Usage Constraints\n- Automated extraction/API scraping of our unauthenticated edge endpoints is restricted to 15 RPS.\n- Threat intelligence provided herein is for defensive scaling and educational synthesis only.\n\n### Data Compliance\nAll telemetry and interactions with the Sentinel Hub are cryptographically secured and anonymized at the Nginx edge layer."
    },
    {
        "title": "Privacy Policy",
        "slug": "privacy-policy",
        "content": "# Privacy Blueprint\n\nSentinelReign operates on a strict zero-knowledge telemetry baseline for unauthenticated users.\n\n### Data Retention\n- Authentication JWTs are restricted to stateless HS256 signatures.\n- Session memory is purged natively from our Redis shards every 72 hours.\n- PII is never aggregated into the overarching RAG index."
    }
]

try:
    for page_data in core_pages:
        existing = db.query(Page).filter(Page.slug == page_data["slug"]).first()
        if existing:
            existing.title = page_data["title"]
            existing.content = page_data["content"]
        else:
            new_page = Page(**page_data)
            db.add(new_page)
    db.commit()
    print("Core pages seeded successfully.")
except Exception as e:
    print(f"Error seeding pages: {e}")
    db.rollback()
finally:
    db.close()
