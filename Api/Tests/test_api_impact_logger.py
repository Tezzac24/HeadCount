import pytest
import sys
import os
from datetime import datetime
sys.path.append("..")
from db_manager import app

date = datetime.today().strftime("%d-%m-%Y")

def test_impact_logger():
    player_payload = new_player_payload()
    create_player_response = create_player(player_payload)
    assert create_player_response.status_code == 201

    if not os.path.exists('impact_logs'):
        os.makedirs('impact_logs')

    impact_logger_payload = new_impact_logger_payload()
    create_impact_logger_response = update_impact_logger(impact_logger_payload)
    assert create_impact_logger_response.status_code == 201
    assert len(os.listdir('impact_logs')) == 1

    os.remove(f'impact_logs/impact_logs_{date}.json')
    os.rmdir('impact_logs')

    delete_player_response = delete_player(player_payload)
    assert delete_player_response.status_code == 204


def create_player(payload):
    return app.test_client().post('/api/v1/players', json=payload)

def delete_player(payload):
    return app.test_client().delete('/api/v1/players', json=payload)

def update_impact_logger(payload):
    return app.test_client().post('/api/v1/impacts/logs', json=payload)

def new_player_payload():
    return {
        'pid': 1,
        'firstName': 'John',
        'lastName': 'Doe',
        'impacts': []
    }

def new_impact_logger_payload():
    return {
        'pid': 1,
        'time': 37.12,
        'max_impact': 100000,
        'all_readings': [{'time': 1, 'impact': 12}, {'time': 2, 'impact': 1}, {'time': 3, 'impact': 1}]
    }

if __name__ == '__main__':
    pytest.main()