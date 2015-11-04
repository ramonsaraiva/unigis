from flask import jsonify

from flask.ext.restful import Resource
from flask.ext.restful import reqparse

from models import db

from models import Point
from models import Building

class Points(Resource):
	def __init__(self):
		self.reqparse = reqparse.RequestParser()
		self.reqparse.add_argument('points', type=int, location='json')

	def get(self):
		return jsonify(results=[p.coords for p in Point.query.all()])

	def post(self):
		args = self.reqparse.parse_args()

		Point.query.delete()
		points = []

		for i in range(args['points']):
			unisinos = Building.query.filter(Building.name == 'Unisinos').first()
			random_point = unisinos.random_point()
			points.append(random_point)

			p = Point()
			p.geom = 'POINT({0} {1})'.format(random_point.x, random_point.y)
			db.session.add(p)

		db.session.commit()
		return jsonify(results=[p.coords for p in Point.query.all()])

class Buildings(Resource):
	def __init__(self):
		self.reqparse = reqparse.RequestParser()
		self.reqparse.add_argument('polygon', type=str, location='json')

	def get(self):
		buildings = Building.query.all()
		return jsonify(results=[b.serialize for b in Building.query.filter(Building.name != 'Unisinos')])

	def post(self):
		args = self.reqparse.parse_args()
		contains = Point.query.filter(Point.geom.ST_Within(args['polygon'])).all()
		intersects = Building.query.filter(Building.geom.ST_Intersects(args['polygon'])).filter(Building.name != 'Unisinos').all()
		data = {
			'contains': len(contains),
			'intersects': (', ').join([b.name for b in intersects])
		}
		return jsonify(data)
