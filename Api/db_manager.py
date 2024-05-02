import json
from os import environ
from flask import Flask
from flask_restful import Resource, Api, reqparse, abort, fields, marshal_with
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime


app = Flask(__name__)

api = Api(app) 
app.config['SQLALCHEMY_DATABASE_URI'] = environ.get('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


# Creates Table model for player
class PlayerModel(db.Model):
    __tablename__ = "player"
    pid = db.Column(db.Integer, primary_key=True)
    firstName = db.Column(db.String, nullable=False)
    lastName = db.Column(db.String, nullable=False)
    impacts = db.relationship('MaxImpactModel', backref= "player", cascade="delete, delete-orphan")
    
    def __repr__(self):
        return f"Player(pid = {self.pid}, firstName = {self.firstName}, lastName = {self.lastName})"


class MaxImpactModel(db.Model):
    player_id = db.Column(db.Integer, db.ForeignKey('player.pid'))
    id = db.Column(db.String, primary_key=True)
    linearForce = db.Column(db.Float)
    rotationalForce = db.Column(db.Float)
    time = db.Column(db.String(20))

    def __repr__(self):
        return f"Impact(id = {self.id}, player id = {self.player_id}, linear Force = {self.linearForce}, Rotational Force = {self.rotationalForce}, Time = {self.time})"


# Validates arguments required for a Player post request
player_post_args = reqparse.RequestParser()
player_post_args.add_argument("pid", type=int, help="Player's unique id", required=True)
player_post_args.add_argument("firstName", type=str, help="First Name of Player", required=True)
player_post_args.add_argument("lastName", type=str, help="Last Name of Player", required=True)

# Validates arguments required for Player update request
player_update_args = reqparse.RequestParser()
player_update_args.add_argument("pid", type=int, help="Player's unique id")
player_update_args.add_argument("firstName", type=str, help="First Name of Player")
player_update_args.add_argument("lastName", type=str, help="Last Name of Player")

# Validates arguments required for Impact update request
impact_post_args = reqparse.RequestParser()
impact_post_args.add_argument("id", type=str, help="Impactid", required=True)
impact_post_args.add_argument("linearForce", type=float, help="Linear Force of Impact", required=True)
impact_post_args.add_argument("rotationalForce", type=float, help="Rotational Force of Impact", required=True)
impact_post_args.add_argument("time", type=str, help="Time of Concussion", required=True)
impact_post_args.add_argument("player_id", type=int, help="ID of associated player", required=False)

# Validates arguments required for Impact update request
impact_update_args = reqparse.RequestParser()
impact_update_args.add_argument("id", type=str, help="Impact ID")
impact_update_args.add_argument("linearForce", type=float, help="Linear Force")
impact_update_args.add_argument("rotationalForce", type=float, help="Rotational Force")
impact_update_args.add_argument("time", type=str, help="Time of concussion")
impact_update_args.add_argument("player_id", type=int, help="Player ID")

# Validates arguments required for Impact logger
impact_logger_args = reqparse.RequestParser()
impact_logger_args.add_argument("pid", type=int, help="Player ID", required=True)
impact_logger_args.add_argument("max_impact", type=float, help="Impact ID")
impact_logger_args.add_argument("time", type=str, help="Time of impact")
impact_logger_args.add_argument("all_readings",
                                type=list,
                                location="json",
                                help="List of all readings for impacts associated with player", 
                                required=True)

with app.app_context():
    db.create_all()

impactField = {
    'id': fields.String,
    'linearForce': fields.Float,
    'rotationalForce': fields.Float,
    'time': fields.String
}

resourceField = {
    "pid": fields.Integer,
    "firstName": fields.String,
    "lastName": fields.String,
    "impacts": fields.List(fields.Nested(impactField))
}

class Player(Resource):
    @marshal_with(resourceField)
    def get(self):
        args = player_update_args.parse_args()
        result = PlayerModel.query.filter_by(pid=args["pid"]).first()
        if not result:
            abort(404, message="Could not find player")

        return result
    
    @marshal_with(resourceField)
    def post(self):
        args = player_post_args.parse_args()
        result = PlayerModel.query.filter_by(pid=args["pid"]).first()
        if result:
            abort(409, message="Player already exists")
        player = PlayerModel(pid=args["pid"], firstName=args["firstName"], lastName=args["lastName"])
        db.session.add(player)
        db.session.commit()
        print(f'Added: {player}')
        return player, 201
    
    @marshal_with(resourceField)
    def patch(self):
        args = player_update_args.parse_args()
        result = PlayerModel.query.filter_by(pid=args["pid"]).first()
        if not result:
            abort(404, message="Player doesn't exit, cannot update")
        
        if args["pid"]:
            result.id = args["pid"]
        if args["firstName"]:
            result.firstName = args["firstName"]
        if args["lastName"]:
            result.lastName = args["lastName"]

        db.session.commit()
        print(f'Edited: {result}')
        return {"message": "Player updated"}
    
    def delete(self):
        args = player_update_args.parse_args()
        result = PlayerModel.query.filter_by(pid=args["pid"]).first()
        if not result:
            abort(404, message="Player id is invalid")
        
        db.session.delete(result)
        db.session.commit()
        print(f'Deleted: {result}')
        return "", 204


class Impacts(Resource):
    @marshal_with(impactField)
    def get(self):
        args = impact_update_args.parse_args()
        result = MaxImpactModel.query.filter_by(player_id=args["player_id"]).all()
        if not result:
            abort(404, message="Could not get impacts by player ID")
        return result

    @marshal_with(impactField)
    def post(self):
        args = impact_post_args.parse_args()
        pQuery = PlayerModel.query.filter_by(pid=args["player_id"]).first()
        if pQuery is None:
            abort(404, message="Player doesn't exist")

        iQuery = MaxImpactModel.query.filter_by(id=args["id"]).first()
        if iQuery:
            abort(409, message="Impact has already been recorded")

        impact = MaxImpactModel(id=args["id"], 
                                player=pQuery, 
                                linearForce=args["linearForce"], 
                                rotationalForce=args["rotationalForce"], 
                                time=args["time"])

        db.session.add(impact)
        db.session.commit()
        print(f'Added impact: {impact}')
        return impact, 201

    @marshal_with(impactField)
    def patch(self):
        args = impact_update_args.parse_args()
        result = MaxImpactModel.query.filter_by(id=args["id"]).first()
        if not result:
            abort(404, message="Could not find impact by ID")

        if args["id"]:
            result.id = args["id"]
        if args["linearForce"]:
            result.linearForce = args["linearForce"]
        if args["rotationalForce"]:
            result.rotationalForce = args["rotationalForce"]
        if args["time"]:
            result.time = args["time"]

        db.session.commit()
        print(f'Edited impact: {result}')
        return result

    def delete(self):
        args = impact_update_args.parse_args()
        result = []
        result = MaxImpactModel.query.filter_by(player_id=args["player_id"]).all()
        if result is None:
            abort(404, message="Player has not recorded any impacts")

        for i in result:
            db.session.delete(i)
        db.session.commit()
        print(f'Deleted impacts')
        return "", 204

class AllPlayers(Resource):
    @marshal_with(resourceField)
    def get(self):
        result = PlayerModel.query.all()
        return result
    

class ImpactLogs(Resource):
    def post(self):
        args = impact_logger_args.parse_args()
        result = PlayerModel.query.filter_by(pid=args["pid"]).first()
        if not result:
            abort(404, message="Could not find player")
        date = datetime.today().strftime("%d-%m-%Y")

        data_to_write = {
        "player_id": args.pid,
        "time": args.time,
        "max_impact": args.max_impact,
        "all_readings": args.all_readings
        }

        try:
            with open(f'./impact_logs/impact_logs_{date}.json', 'r') as f:
                existing_data = json.load(f)
        except FileNotFoundError:
            existing_data = []

        existing_data.append(data_to_write)

        with open(f'./impact_logs/impact_logs_{date}.json', 'w') as f:
            json.dump(existing_data, f, indent=4)

        return data_to_write, 201

class AllImpacts(Resource):
    def delete(self):
        players = PlayerModel.query.all()
        if not players:
            abort(404, message="No players to delete")
        
        for p in players:
            impacts = MaxImpactModel.query.filter_by(player_id=p.pid).all()
            if not impacts:
                continue
            for i in impacts:
                db.session.delete(i)
        print(f'Deleted all impacts')
        db.session.commit()

api.add_resource(Player, "/api/v1/players")
api.add_resource(Impacts, "/api/v1/impacts")
api.add_resource(AllPlayers, "/api/v1/players/all")
api.add_resource(AllImpacts, "/api/v1/impacts/all")
api.add_resource(ImpactLogs, "/api/v1/impacts/logs")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
