from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float, DateTime, Table, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from models.base import Base

# Many-to-Many Association Table for Knowledge Graph (Interlinking topics)
knowledge_graph_association = Table(
    'knowledge_graph',
    Base.metadata,
    Column('source_article_id', Integer, ForeignKey('articles.id')),
    Column('target_article_id', Integer, ForeignKey('articles.id'))
)

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    parent_id = Column(Integer, ForeignKey('categories.id'), nullable=True)
    
    subcategories = relationship("Category", backref="parent", remote_side=[id])
    articles = relationship("Article", back_populates="category")

class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    summary = Column(Text, nullable=True) # AI Generated summary
    content = Column(Text, nullable=False) # Markdown content
    html_content = Column(Text, nullable=True) # Rendered HTML
    image_url = Column(String(500), nullable=True) # Cover Image
    is_published = Column(Boolean, default=True)
    
    # EEAT & Trust Metrics
    ai_verification_score = Column(Float, default=0.0) # 0.0 to 100.0 (Confidence)
    author_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    
    # Metadata for SEO
    seo_metadata = Column(Text, nullable=True) # JSON stored as string: {"meta_title":"", "meta_description":"", "keywords":[]}
    
    category_id = Column(Integer, ForeignKey('categories.id'))
    category = relationship("Category", back_populates="articles")
    author = relationship("User")

    # Engagement
    comments = relationship("ArticleComment", back_populates="article", cascade="all, delete-orphan")

    # Knowledge Graph Self-Referential Many-to-Many
    related_articles = relationship(
        "Article",
        secondary=knowledge_graph_association,
        primaryjoin=id==knowledge_graph_association.c.source_article_id,
        secondaryjoin=id==knowledge_graph_association.c.target_article_id,
        backref="linked_from"
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class TutorialCluster(Base):
    """
    Manages structured learning paths. e.g., 'Linux Privilege Escalation'
    containing multiple ordered articles.
    """
    __tablename__ = "tutorial_clusters"

    id = Column(Integer, primary_key=True, index=True)
    cluster_name = Column(String(255), nullable=False, unique=True)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)

class ClusterItem(Base):
    """
    Mapping an article to a tutorial cluster with an order sequence.
    """
    __tablename__ = "cluster_items"

    id = Column(Integer, primary_key=True, index=True)
    cluster_id = Column(Integer, ForeignKey('tutorial_clusters.id'))
    article_id = Column(Integer, ForeignKey('articles.id'))
    sequence_order = Column(Integer, default=0)
    
    cluster = relationship("TutorialCluster")
    article = relationship("Article")

class ArticleComment(Base):
    """
    Supports anonymous user engagement with moderation.
    """
    __tablename__ = "article_comments"

    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, ForeignKey('articles.id'), nullable=False)
    author_name = Column(String(100), default="Anonymous")
    content = Column(Text, nullable=False)
    is_approved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    article = relationship("Article", back_populates="comments")
