from fastapi import FastAPI, Query, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy import create_engine, func
from sqlalchemy.orm import Session
from database import Base, City, House, Review, Guide, SessionLocal
from seed import seed
import math

app = FastAPI(title="候鸟旅居通 API")

app.mount("/static", StaticFiles(directory="../static"), name="static")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
def startup():
    seed()

@app.get("/")
def index():
    return FileResponse("../static/index.html")

@app.get("/api/cities")
def list_cities(
    category: str = None,
    search: str = None,
    min_budget: int = None,
    max_budget: int = None,
    min_medical: float = None,
    sort: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(City)
    if category:
        query = query.filter(City.category == category)
    if search:
        query = query.filter(City.name.like(f"%{search}%"))
    if min_budget:
        query = query.filter(City.rent_avg >= min_budget)
    if max_budget:
        query = query.filter(City.rent_avg <= max_budget)
    if min_medical:
        query = query.filter(City.medical_score >= min_medical)
    if sort == "elderly":
        query = query.order_by(City.elderly_score.desc())
    elif sort == "price":
        query = query.order_by(City.rent_avg.asc())
    elif sort == "medical":
        query = query.order_by(City.medical_score.desc())
    cities = query.all()
    return [{
        "id": c.id, "name": c.name, "province": c.province,
        "summer_temp": c.summer_temp, "winter_temp": c.winter_temp,
        "rent_avg": c.rent_avg, "rent_desc": c.rent_desc,
        "medical_score": c.medical_score, "transport_score": c.transport_score,
        "living_score": c.living_score, "elderly_score": c.elderly_score,
        "category": c.category, "tags": c.tags.split(",") if c.tags else [],
        "image_url": c.image_url,
        "altitude": c.altitude, "air_quality": c.air_quality, "humidity": c.humidity,
        "hospitals_3a": c.hospitals_3a, "has_high_speed_rail": c.has_high_speed_rail,
        "airport_distance": c.airport_distance
    } for c in cities]

@app.get("/api/cities/{city_id}")
def get_city(city_id: int, db: Session = Depends(get_db)):
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        return {"error": "城市不存在"}
    houses = db.query(House).filter(House.city_id == city_id).all()
    reviews = db.query(Review).filter(Review.city_id == city_id).all()
    return {
        "city": {
            "id": city.id, "name": city.name, "province": city.province,
            "lat": city.lat, "lng": city.lng, "altitude": city.altitude,
            "summer_temp": city.summer_temp, "winter_temp": city.winter_temp,
            "air_quality": city.air_quality, "humidity": city.humidity,
            "rent_avg": city.rent_avg, "rent_desc": city.rent_desc,
            "medical_score": city.medical_score,
            "transport_score": city.transport_score,
            "living_score": city.living_score,
            "elderly_score": city.elderly_score,
            "category": city.category,
            "tags": city.tags.split(",") if city.tags else [],
            "description": city.description,
            "image_url": city.image_url,
            "hospitals_3a": city.hospitals_3a,
            "has_high_speed_rail": city.has_high_speed_rail,
            "airport_distance": city.airport_distance,
        },
        "houses": [{
            "id": h.id, "title": h.title, "price": h.price,
            "area": h.area, "house_type": h.house_type,
            "category": h.category, "contact": h.contact,
            "nearby_hospital": h.nearby_hospital,
            "nearby_market": h.nearby_market,
            "min_rent": h.min_rent, "rating": h.rating,
            "image_url": h.image_url, "description": h.description,
        } for h in houses],
        "reviews": [{
            "id": r.id, "user_name": r.user_name,
            "rating_living": r.rating_living,
            "rating_medical": r.rating_medical,
            "rating_market": r.rating_market,
            "rating_elderly": r.rating_elderly,
            "content": r.content, "stay_duration": r.stay_duration,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        } for r in reviews],
    }

@app.get("/api/houses")
def list_houses(
    city_id: int = None,
    min_price: int = None,
    max_price: int = None,
    category: str = None,
    min_rent: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(House)
    if city_id:
        query = query.filter(House.city_id == city_id)
    if min_price:
        query = query.filter(House.price >= min_price)
    if max_price:
        query = query.filter(House.price <= max_price)
    if category:
        query = query.filter(House.category == category)
    if min_rent:
        query = query.filter(House.min_rent == min_rent)
    houses = query.all()
    return [{
        "id": h.id, "city_id": h.city_id, "title": h.title,
        "price": h.price, "area": h.area, "house_type": h.house_type,
        "category": h.category, "contact": h.contact,
        "nearby_hospital": h.nearby_hospital,
        "nearby_market": h.nearby_market,
        "min_rent": h.min_rent, "rating": h.rating,
        "image_url": h.image_url, "description": h.description,
    } for h in houses]

@app.get("/api/recommend")
def recommend(
    age: int = Query(65, description="年龄"),
    budget: int = Query(2000, description="预算"),
    month: int = Query(7, description="居住月份"),
    health: str = Query(None, description="健康情况"),
    preference: str = Query(None, description="偏好"),
    db: Session = Depends(get_db)
):
    is_summer = month in [5, 6, 7, 8, 9]
    query = db.query(City)
    if is_summer:
        query = query.filter(City.category == "避暑")
    else:
        query = query.filter(City.category == "避寒")
    cities = query.all()

    def score(city):
        s = 0
        budget_ratio = budget / max(city.rent_avg, 1)
        if budget_ratio >= 1.2:
            s += 30
        elif budget_ratio >= 1.0:
            s += 25
        elif budget_ratio >= 0.7:
            s += 15
        else:
            s += 5
        s += city.medical_score * 5
        s += city.elderly_score * 0.3
        s += city.transport_score * 3
        s += city.living_score * 3
        if preference:
            if "安静" in preference and city.elderly_score > 80:
                s += 5
            if "热闹" in preference and city.elderly_score < 85:
                s += 5
            if "山区" in preference and city.altitude > 500:
                s += 5
            if "海边" in preference and city.altitude <= 100:
                s += 5
        if health:
            if "高血压" in health and city.altitude > 1500:
                s -= 10
            if "心脏病" in health and city.altitude > 1500:
                s -= 10
        return s

    ranked = sorted(cities, key=score, reverse=True)
    return [{
        "id": c.id, "name": c.name, "province": c.province,
        "summer_temp": c.summer_temp, "winter_temp": c.winter_temp,
        "rent_avg": c.rent_avg, "elderly_score": c.elderly_score,
        "medical_score": c.medical_score,
        "altitude": c.altitude,
        "category": c.category,
        "image_url": c.image_url,
        "tags": c.tags.split(",") if c.tags else [],
        "recommend_score": round(score(c), 1),
    } for c in ranked[:10]]

@app.get("/api/reviews/{city_id}")
def get_reviews(city_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.city_id == city_id).all()
    return [{
        "id": r.id, "user_name": r.user_name,
        "rating_living": r.rating_living,
        "rating_medical": r.rating_medical,
        "rating_market": r.rating_market,
        "rating_elderly": r.rating_elderly,
        "content": r.content, "stay_duration": r.stay_duration,
        "created_at": r.created_at.isoformat() if r.created_at else None,
    } for r in reviews]

@app.get("/api/search")
def full_search(q: str = Query(""), db: Session = Depends(get_db)):
    cities = db.query(City).filter(City.name.like(f"%{q}%")).all()
    houses = db.query(House).filter(House.title.like(f"%{q}%")).all()
    rural = db.query(City).filter(
        City.province.like(f"%{q}%"),
        City.rent_avg <= 1000,
        City.air_quality == "优"
    ).order_by(City.elderly_score.desc()).all()
    return {
        "cities": [{"id": c.id, "name": c.name, "province": c.province,
                     "category": c.category, "image_url": c.image_url,
                     "elderly_score": c.elderly_score} for c in cities],
        "houses": [{"id": h.id, "title": h.title, "price": h.price,
                     "house_type": h.house_type} for h in houses],
        "rural": [{"id": c.id, "name": c.name, "province": c.province,
                    "rent_avg": c.rent_avg, "air_quality": c.air_quality,
                    "elderly_score": c.elderly_score, "image_url": c.image_url,
                    "tags": c.tags.split(",") if c.tags else [],
                    "altitude": c.altitude, "description": c.description} for c in rural],
    }

@app.get("/api/province/{province_name}")
def get_province_cities(
    province_name: str,
    max_price: int = None,
    min_price: int = None,
    min_medical: float = None,
    sort: str = None,
    category: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(City).filter(City.province.like(f"%{province_name}%"))
    if max_price:
        query = query.filter(City.rent_avg <= max_price)
    if min_price:
        query = query.filter(City.rent_avg >= min_price)
    if min_medical:
        query = query.filter(City.medical_score >= min_medical)
    if category:
        query = query.filter(City.category == category)
    if sort == "elderly":
        query = query.order_by(City.elderly_score.desc())
    elif sort == "price":
        query = query.order_by(City.rent_avg.asc())
    elif sort == "medical":
        query = query.order_by(City.medical_score.desc())
    all_cities = query.all()
    return {
        "province": province_name,
        "total": len(all_cities),
        "cities": [{
            "id": c.id, "name": c.name, "rent_avg": c.rent_avg,
            "air_quality": c.air_quality, "elderly_score": c.elderly_score,
            "medical_score": c.medical_score, "transport_score": c.transport_score,
            "living_score": c.living_score,
            "image_url": c.image_url, "altitude": c.altitude,
            "humidity": c.humidity, "category": c.category,
            "summer_temp": c.summer_temp, "winter_temp": c.winter_temp,
            "description": c.description,
            "tags": c.tags.split(",") if c.tags else [],
            "is_rural": c.rent_avg <= 1000 and c.air_quality == "优",
        } for c in all_cities],
    }

@app.get("/api/guides")
def list_guides(category: str = None, city_id: int = None, db: Session = Depends(get_db)):
    query = db.query(Guide)
    if category:
        query = query.filter(Guide.category == category)
    if city_id:
        query = query.filter(Guide.city_id == city_id)
    guides = query.all()
    return [{
        "id": g.id, "city_id": g.city_id, "category": g.category,
        "title": g.title, "content": g.content, "source": g.source,
        "tags": g.tags.split(",") if g.tags else [],
    } for g in guides]

@app.get("/api/guides/{guide_id}")
def get_guide(guide_id: int, db: Session = Depends(get_db)):
    guide = db.query(Guide).filter(Guide.id == guide_id).first()
    if not guide:
        return {"error": "攻略不存在"}
    return {
        "id": guide.id, "city_id": guide.city_id, "category": guide.category,
        "title": guide.title, "content": guide.content, "source": guide.source,
        "tags": guide.tags.split(",") if guide.tags else [],
    }

@app.get("/api/categories")
def get_categories(db: Session = Depends(get_db)):
    summer = db.query(City).filter(City.category == "避暑").order_by(City.elderly_score.desc()).limit(8).all()
    winter = db.query(City).filter(City.category == "避寒").order_by(City.elderly_score.desc()).limit(8).all()
    cheapest = db.query(City).order_by(City.rent_avg.asc()).limit(8).all()
    best_medical = db.query(City).order_by(City.medical_score.desc()).limit(8).all()
    return {
        "summer": [{"id": c.id, "name": c.name, "province": c.province,
                     "summer_temp": c.summer_temp, "rent_avg": c.rent_avg,
                     "elderly_score": c.elderly_score, "image_url": c.image_url,
                     "altitude": c.altitude,
                     "tags": c.tags.split(",") if c.tags else []} for c in summer],
        "winter": [{"id": c.id, "name": c.name, "province": c.province,
                     "winter_temp": c.winter_temp, "rent_avg": c.rent_avg,
                     "elderly_score": c.elderly_score, "image_url": c.image_url,
                     "altitude": c.altitude,
                     "tags": c.tags.split(",") if c.tags else []} for c in winter],
        "cheapest": [{"id": c.id, "name": c.name, "province": c.province,
                       "rent_avg": c.rent_avg, "elderly_score": c.elderly_score,
                       "altitude": c.altitude,
                       "image_url": c.image_url} for c in cheapest],
        "best_medical": [{"id": c.id, "name": c.name, "province": c.province,
                           "medical_score": c.medical_score,
                           "elderly_score": c.elderly_score,
                           "altitude": c.altitude,
                           "image_url": c.image_url} for c in best_medical],
    }
