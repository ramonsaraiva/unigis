import random

from shapely import wkb
from shapely.geometry import Polygon
from shapely.geometry import Point as SPoint

from flask.ext.sqlalchemy import SQLAlchemy
from geoalchemy2 import Geometry

from sqlalchemy import func

db = SQLAlchemy()

class Point(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	geom = db.Column(Geometry('POINT'))

	@property
	def coords(self):
		p =  wkb.loads(bytes(self.geom.data))
		return (p.x, p.y)

class Building(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	geom = db.Column(Geometry('POLYGON'))
	name = db.Column(db.String())

	stroke_color = db.Column(db.String(6))
	stroke_opacity = db.Column(db.Numeric(precision=3, scale=2))
	stroke_weight = db.Column(db.Integer)

	fill_color = db.Column(db.String(6))
	fill_opacity = db.Column(db.Numeric(precision=3, scale=2))

	def __init__(self, data):
		self.geom = data['geom']
		self.name = data['name']
		self.stroke_color = data['stroke_color']
		self.stroke_opacity = data['stroke_opacity']
		self.stroke_weight = data['stroke_weight']
		self.fill_color = data['fill_color']
		self.fill_opacity = data['fill_opacity']

	@property
	def serialize(self):
		poly = wkb.loads(bytes(self.geom.data))
		contains = Point.query.filter(Point.geom.ST_Within(self.geom)).all()
		area = self.geom.ST_Area()
		print(area)
		return {
			'id': self.id,
			'points': [{'lat': c[0], 'lng': c[1]} for c in poly.exterior.coords],
			'name': self.name,
			'stroke_color': self.stroke_color,
			'stroke_opacity': float(self.stroke_opacity),
			'stroke_weight': int(self.stroke_weight),
			'fill_color': self.fill_color,
			'fill_opacity': float(self.fill_opacity),
			'contains': len(contains)
		}

	def random_point(self):
		poly = wkb.loads(bytes(self.geom.data))
		(min_x, min_y, max_x, max_y) = poly.bounds
		while True:
			p = SPoint(random.uniform(min_x, max_x), random.uniform(min_y, max_y))
			if poly.contains(p):
				return p
