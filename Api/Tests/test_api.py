import pytest
import sys
sys.path.append("..")
from db_manager import app


def test_create_player():
    payload = new_player_payload()
    create_player_response = create_player(payload)
    assert create_player_response.status_code == 201
    json_data = create_player_response.get_json()
    assert json_data == { 'pid': 1, 'firstName': 'John', 'lastName': 'Doe', 'impacts': [] }

    delete_player_response = delete_player(payload)
    assert delete_player_response.status_code == 204


def test_get_player():
    payload = new_player_payload()
    create_player_response = create_player(payload)
    assert create_player_response.status_code == 201
    get_player_respone = get_player(payload)
    assert get_player_respone.status_code == 200

    delete_player_response = delete_player(payload)
    assert delete_player_response.status_code == 204


def test_patch_player():
    payload = new_player_payload()
    create_player_response = create_player(payload)
    assert create_player_response.status_code == 201
    pid = create_player_response.get_json()['pid']

    updated_payload = {
        'pid': pid,
        'firstName': 'John',
        'lastName': 'Snow'
    }
    update_player_response = update_player(updated_payload)
    assert update_player_response.status_code == 200

    delete_player_response = delete_player(payload)
    assert delete_player_response.status_code == 204


def test_get_all_players():
    for i in range(1, 4):
        payload = new_player_payload(i)
        create_player_response = create_player(payload)
        assert create_player_response.status_code == 201

    get_all_players_response = get_all_players()
    json_data = get_all_players_response.get_json()
    assert len(json_data)  == 3

    for i in range(1, 4):
        payload = new_player_payload(i)
        delete_player_response = delete_player(payload)
        assert delete_player_response.status_code == 204


def test_delete_player():
    payload = new_player_payload()
    create_player_response = create_player(payload)
    assert create_player_response.status_code == 201

    delete_player_response = delete_player(payload)
    assert delete_player_response.status_code == 204


def test_create_impact():
    player_payload = new_player_payload()
    create_player_response = create_player(player_payload)
    assert create_player_response.status_code == 201

    payload = new_impact_payload()
    create_impact_response = create_impact(payload)
    assert create_impact_response.status_code == 201

    delete_player_response = delete_player(player_payload)
    assert delete_player_response.status_code == 204

def test_get_impacts():
    player_payload = new_player_payload()
    create_player_response = create_player(player_payload)
    assert create_player_response.status_code == 201

    payload = new_impact_payload()
    create_impact_response = create_impact(payload)
    payload["id"] = "1-2-687126"
    create_impact_response2 = create_impact(payload)
    assert create_impact_response.status_code == 201
    assert create_impact_response2.status_code == 201

    get_impacts_response = get_impacts(payload)
    assert get_impacts_response.status_code == 200
    assert len(get_impacts_response.get_json()) == 2

    delete_player_response = delete_player(player_payload)
    assert delete_player_response.status_code == 204

def test_update_impact():
    player_payload = new_player_payload()
    create_player_response = create_player(player_payload)
    assert create_player_response.status_code == 201

    payload = new_impact_payload()
    create_impact_response = create_impact(payload)
    assert create_impact_response.status_code == 201

    get_impacts_response = get_impacts(payload)
    assert get_impacts_response.status_code == 200
    id = get_impacts_response.get_json()[0]['id']

    updated_payload = {
        "id": id,
        "linearForce": 512.0
    }
    update_impact_response = update_impact(updated_payload)
    assert update_impact_response.status_code == 200

    get_impacts_response = get_impacts(payload)
    assert get_impacts_response.status_code == 200
    assert get_impacts_response.get_json()[0]['linearForce'] == updated_payload['linearForce']

    delete_player_response = delete_player(player_payload)
    assert delete_player_response.status_code == 204


def test_delete_impact():
    player_payload = new_player_payload()
    create_player_response = create_player(player_payload)
    assert create_player_response.status_code == 201

    payload = new_impact_payload()
    create_impact_response = create_impact(payload)
    assert create_impact_response.status_code == 201

    delete_impact_response = delete_impact(payload)
    assert delete_impact_response.status_code == 204

    delete_player_response = delete_player(player_payload)
    assert delete_player_response.status_code == 204


def create_player(payload):
    return app.test_client().post('/api/v1/players', json=payload)

def update_player(payload):
    return app.test_client().patch('/api/v1/players', json=payload)

def get_player(payload):
    return app.test_client().get('/api/v1/players', json=payload)

def get_all_players():
    return app.test_client().get('/api/v1/players/all')

def delete_player(payload):
    return app.test_client().delete('/api/v1/players', json=payload)

def create_impact(payload):
    return app.test_client().post('/api/v1/impacts', json=payload)

def get_impacts(payload):
    return app.test_client().get('/api/v1/impacts', json=payload)

def update_impact(payload):
    return app.test_client().patch('/api/v1/impacts', json=payload)

def delete_impact(payload):
    return app.test_client().delete('/api/v1/impacts', json=payload)

def new_player_payload(pid=1):
    if pid == 2:
        return {
            'pid': 2,
            'firstName': 'Jane',
            'lastName': 'Doe',
            'impacts': []
        }
    
    if pid == 3:
        return {
            'pid': 3,
            'firstName': 'Jack',
            'lastName': 'Sparrow',
            'impacts': []
        }
    
    return {
        'pid': 1,
        'firstName': 'John',
        'lastName': 'Doe',
        'impacts': []
    }

def new_impact_payload(id=1):
    if id == 2:
        return {
            'id': '1-2-687126',
            'linearForce': 50.0,
            'rotationalForce': 181.78,
            'time': '2020-01-01',
            'player_id': 1
        }

    return {
        'id': '1-1-687126',
        'linearForce': 120.0,
        'rotationalForce': 255.0,
        'time': '2020-01-01',
        'player_id': 1
    }

if __name__ == '__main__':
    pytest.main()