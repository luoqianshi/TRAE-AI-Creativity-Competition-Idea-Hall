from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime

DATABASE_URL = "sqlite:///./hometown.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class City(Base):
    __tablename__ = "cities"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), index=True)
    province = Column(String(50))
    lat = Column(Float)
    lng = Column(Float)
    altitude = Column(Integer)
    summer_temp = Column(String(20))
    winter_temp = Column(String(20))
    air_quality = Column(String(20))
    humidity = Column(String(20))
    rent_avg = Column(Integer)
    rent_desc = Column(String(100))
    medical_score = Column(Float)
    transport_score = Column(Float)
    living_score = Column(Float)
    elderly_score = Column(Float)
    category = Column(String(20))
    tags = Column(Text)
    description = Column(Text)
    image = Column(String(200))
    hospitals_3a = Column(Integer)
    has_high_speed_rail = Column(Integer)
    airport_distance = Column(Integer)
    image_url = Column(String(500))
    houses = relationship("House", back_populates="city")
    reviews = relationship("Review", back_populates="city")

class House(Base):
    __tablename__ = "houses"
    id = Column(Integer, primary_key=True, index=True)
    city_id = Column(Integer, ForeignKey("cities.id"))
    title = Column(String(200))
    price = Column(Integer)
    area = Column(String(50))
    house_type = Column(String(50))
    category = Column(String(50))
    contact = Column(String(100))
    nearby_hospital = Column(String(100))
    nearby_market = Column(String(100))
    min_rent = Column(String(20))
    rating = Column(Float)
    image = Column(String(200))
    image_url = Column(String(500))
    description = Column(Text)
    city = relationship("City", back_populates="houses")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True)
    password = Column(String(100))
    age = Column(Integer)
    budget = Column(Integer)
    health = Column(String(100))

class Favorite(Base):
    __tablename__ = "favorites"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    city_id = Column(Integer)
    house_id = Column(Integer, nullable=True)

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    city_id = Column(Integer, ForeignKey("cities.id"))
    user_name = Column(String(50))
    rating_living = Column(Integer)
    rating_medical = Column(Integer)
    rating_market = Column(Integer)
    rating_elderly = Column(Integer)
    content = Column(Text)
    stay_duration = Column(String(50))
    created_at = Column(DateTime, default=datetime.now)
    city = relationship("City", back_populates="reviews")

class HouseReview(Base):
    __tablename__ = "house_reviews"
    id = Column(Integer, primary_key=True, index=True)
    house_id = Column(Integer, ForeignKey("houses.id"))
    user_name = Column(String(50))
    rating = Column(Integer)
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.now)

class Guide(Base):
    __tablename__ = "guides"
    id = Column(Integer, primary_key=True, index=True)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=True)
    category = Column(String(20))
    title = Column(String(200))
    content = Column(Text)
    source = Column(String(100), nullable=True)
    tags = Column(Text, nullable=True)
    city = relationship("City")

Base.metadata.create_all(bind=engine)
