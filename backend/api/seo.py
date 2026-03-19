from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from core.database import get_db
from models.article import Article
from models.cms import SiteSettings
import json

router = APIRouter(prefix="/api/seo", tags=["seo"])

def get_base_url(db: Session):
    setting = db.query(SiteSettings).filter(SiteSettings.key == "site_url").first()
    if setting:
        # Values in SiteSettings might be JSON strings
        try:
            return json.loads(setting.value).strip("/")
        except:
            return setting.value.strip('"').strip("'").strip("/")
    return "https://sentinelreign.com"

@router.get("/sitemap.xml", response_class=Response)
def generate_sitemap(db: Session = Depends(get_db)):
    """
    Dynamically generates XML sitemap for Google Search Console.
    """
    base_url = get_base_url(db)
    articles = db.query(Article).order_by(Article.created_at.desc()).limit(1000).all()
    
    xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    # Static pages
    static_pages = ["", "/threat-intel.html", "/tutorials.html"]
    for page in static_pages:
        xml_content += f"  <url>\n    <loc>{base_url}{page}</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n"
        
    # Dynamic articles
    for article in articles:
        # Provide ISO 8601 date
        date_str = article.updated_at.isoformat() if article.updated_at else article.created_at.isoformat() if article.created_at else "2026-03-16T00:00:00+00:00"
        xml_content += f"  <url>\n    <loc>{base_url}/#/article/{article.slug}</loc>\n    <lastmod>{date_str}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n"
        
    xml_content += '</urlset>'
    
    return Response(content=xml_content, media_type="application/xml")

@router.get("/robots.txt", response_class=Response)
def generate_robots(db: Session = Depends(get_db)):
    """
    Dynamically generates robots.txt for search engines.
    """
    base_url = get_base_url(db)
    robots_content = f"User-agent: *\nAllow: /\nSitemap: {base_url}/sitemap.xml\n"
    
    return Response(content=robots_content, media_type="text/plain")

@router.get("/feed.xml", response_class=Response)
def generate_rss(db: Session = Depends(get_db)):
    """
    Generates a professional Atom/RSS feed for news aggregators.
    """
    base_url = get_base_url(db)
    articles = db.query(Article).filter(Article.is_published == True).order_by(Article.created_at.desc()).limit(20).all()
    
    rss_content = '<?xml version="1.0" encoding="UTF-8" ?>\n'
    rss_content += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n'
    rss_content += '  <channel>\n'
    rss_content += '    <title>SentinelReign Intelligence Feed</title>\n'
    rss_content += f'    <link>{base_url}</link>\n'
    rss_content += '    <description>High-authority technical intelligence and zero-day analysis.</description>\n'
    rss_content += f'    <atom:link href="{base_url}/feed.xml" rel="self" type="application/rss+xml" />\n'
    
    for article in articles:
        pub_date = article.created_at.strftime("%a, %d %b %Y %H:%M:%S +0000") if article.created_at else "Mon, 16 Mar 2026 00:00:00 +0000"
        rss_content += '    <item>\n'
        rss_content += f'      <title><![CDATA[{article.title}]]></title>\n'
        rss_content += f'      <link>{base_url}/#/article/{article.slug}</link>\n'
        rss_content += f'      <guid isPermaLink="false">{article.id}</guid>\n'
        rss_content += f'      <pubDate>{pub_date}</pubDate>\n'
        rss_content += f'      <description><![CDATA[{article.summary or ""}]]></description>\n'
        rss_content += '    </item>\n'
        
    rss_content += '  </channel>\n'
    rss_content += '</rss>'
    
    return Response(content=rss_content, media_type="application/rss+xml")
