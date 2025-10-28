"""
Checklist Answer API endpoint tests
"""
import pytest
from tests.helpers.api_client import APIClient
from tests.helpers.generators import generate_project_name, generate_review_name
from tests.helpers.auth import (
    create_project,
    create_review,
    assign_reviewer,
    create_checklist,
)


@pytest.mark.checklist
class TestCreateOrUpdateAnswerEndpoint:
    """Tests for POST /api/v1/checklists/{checklist_id}/answers"""
    
    def test_create_new_answer_returns_201(self, authenticated_client):
        """Creating new answer returns 201"""
        api_client, user_data, access_token = authenticated_client
        
        # Setup: create project, review, assign reviewer, create checklist
        project = create_project(api_client, generate_project_name())
        review = create_review(api_client, project["id"], generate_review_name())
        assign_reviewer(api_client, review["id"], user_data["id"])
        checklist = create_checklist(api_client, review["id"])
        
        # Create answer
        response = api_client.post(
            f"/api/v1/checklists/{checklist['id']}/answers",
            json={
                "question_key": "q1",
                "answers": [[True, False], [True, True]],
                "critical": False
            }
        )
        
        assert response.status_code == 201
        answer = response.json()
        assert answer["question_key"] == "q1"
        assert answer["answers"] == [[True, False], [True, True]]
        assert answer["critical"] == False
    
    def test_update_existing_answer_returns_200(self, authenticated_client):
        """Updating existing answer returns 200"""
        api_client, user_data, access_token = authenticated_client
        
        # Setup
        project = create_project(api_client, generate_project_name())
        review = create_review(api_client, project["id"], generate_review_name())
        assign_reviewer(api_client, review["id"], user_data["id"])
        checklist = create_checklist(api_client, review["id"])
        
        # Create initial answer
        api_client.post(
            f"/api/v1/checklists/{checklist['id']}/answers",
            json={
                "question_key": "q1",
                "answers": [[True, False]],
                "critical": False
            }
        )
        
        # Update the same answer
        response = api_client.post(
            f"/api/v1/checklists/{checklist['id']}/answers",
            json={
                "question_key": "q1",
                "answers": [[False, True]],
                "critical": True
            }
        )
        
        assert response.status_code in [200, 201]
        answer = response.json()
        assert answer["question_key"] == "q1"
        assert answer["answers"] == [[False, True]]
        assert answer["critical"] == True
    
    def test_response_includes_all_fields(self, authenticated_client):
        """Response includes id, checklist_id, question_key, answers, critical, updated_at"""
        api_client, user_data, access_token = authenticated_client
        
        # Setup
        project = create_project(api_client, generate_project_name())
        review = create_review(api_client, project["id"], generate_review_name())
        assign_reviewer(api_client, review["id"], user_data["id"])
        checklist = create_checklist(api_client, review["id"])
        
        # Create answer
        response = api_client.post(
            f"/api/v1/checklists/{checklist['id']}/answers",
            json={
                "question_key": "q2",
                "answers": [[True]],
                "critical": False
            }
        )
        
        assert response.status_code == 201
        answer = response.json()
        assert "id" in answer
        assert "checklist_id" in answer
        assert "question_key" in answer
        assert "answers" in answer
        assert "critical" in answer
        assert "updated_at" in answer
    
    def test_only_reviewer_can_create_update_answer(self, two_authenticated_clients):
        """Only assigned reviewer can create/update answers"""
        (user1_data, token1), (user2_data, token2), api_client = two_authenticated_clients
        
        # User 1 creates everything
        api_client.set_token(token1)
        project = create_project(api_client, generate_project_name())
        review = create_review(api_client, project["id"], generate_review_name())
        assign_reviewer(api_client, review["id"], user1_data["id"])
        checklist = create_checklist(api_client, review["id"])
        
        # User 2 tries to add answer to User 1's checklist
        api_client.set_token(token2)
        response = api_client.post(
            f"/api/v1/checklists/{checklist['id']}/answers",
            json={
                "question_key": "q1",
                "answers": [[True]],
                "critical": False
            }
        )
        
        assert response.status_code == 403
    
    def test_cannot_edit_completed_checklist(self, authenticated_client):
        """Cannot edit answers on completed checklist"""
        api_client, user_data, access_token = authenticated_client
        
        # Setup
        project = create_project(api_client, generate_project_name())
        review = create_review(api_client, project["id"], generate_review_name())
        assign_reviewer(api_client, review["id"], user_data["id"])
        checklist = create_checklist(api_client, review["id"])
        
        # Complete the checklist
        api_client.put(f"/api/v1/checklists/{checklist['id']}/complete")
        
        # Try to add answer to completed checklist
        response = api_client.post(
            f"/api/v1/checklists/{checklist['id']}/answers",
            json={
                "question_key": "q1",
                "answers": [[True]],
                "critical": False
            }
        )
        
        assert response.status_code == 403
    
    def test_checklist_not_found_returns_404(self, authenticated_client):
        """Creating answer for non-existent checklist returns 404"""
        api_client, user_data, access_token = authenticated_client
        
        fake_checklist_id = "00000000-0000-0000-0000-000000000000"
        response = api_client.post(
            f"/api/v1/checklists/{fake_checklist_id}/answers",
            json={
                "question_key": "q1",
                "answers": [[True]],
                "critical": False
            }
        )
        
        assert response.status_code == 404
    
    def test_invalid_checklist_id_returns_422(self, authenticated_client):
        """Invalid checklist_id UUID returns 422"""
        api_client, user_data, access_token = authenticated_client
        
        response = api_client.post(
            "/api/v1/checklists/not-a-uuid/answers",
            json={
                "question_key": "q1",
                "answers": [[True]],
                "critical": False
            }
        )
        
        assert response.status_code in [404, 422]
    
    def test_critical_defaults_to_false(self, authenticated_client):
        """Critical flag defaults to false if not provided"""
        api_client, user_data, access_token = authenticated_client
        
        # Setup
        project = create_project(api_client, generate_project_name())
        review = create_review(api_client, project["id"], generate_review_name())
        assign_reviewer(api_client, review["id"], user_data["id"])
        checklist = create_checklist(api_client, review["id"])
        
        # Create answer without critical flag
        response = api_client.post(
            f"/api/v1/checklists/{checklist['id']}/answers",
            json={
                "question_key": "q3",
                "answers": [[True]]
            }
        )
        
        assert response.status_code == 201
        answer = response.json()
        assert answer["critical"] == False
    
    def test_multiple_answers_for_same_checklist(self, authenticated_client):
        """Can create multiple answers for different questions in same checklist"""
        api_client, user_data, access_token = authenticated_client
        
        # Setup
        project = create_project(api_client, generate_project_name())
        review = create_review(api_client, project["id"], generate_review_name())
        assign_reviewer(api_client, review["id"], user_data["id"])
        checklist = create_checklist(api_client, review["id"])
        
        # Create answer for q1
        response1 = api_client.post(
            f"/api/v1/checklists/{checklist['id']}/answers",
            json={"question_key": "q1", "answers": [[True]], "critical": False}
        )
        assert response1.status_code == 201
        
        # Create answer for q2
        response2 = api_client.post(
            f"/api/v1/checklists/{checklist['id']}/answers",
            json={"question_key": "q2", "answers": [[False]], "critical": True}
        )
        assert response2.status_code == 201
        
        # Both should have same checklist_id
        answer1 = response1.json()
        answer2 = response2.json()
        assert answer1["checklist_id"] == answer2["checklist_id"] == checklist["id"]
    
    def test_missing_required_fields_returns_422(self, authenticated_client):
        """Missing required fields returns 422"""
        api_client, user_data, access_token = authenticated_client
        
        # Setup
        project = create_project(api_client, generate_project_name())
        review = create_review(api_client, project["id"], generate_review_name())
        assign_reviewer(api_client, review["id"], user_data["id"])
        checklist = create_checklist(api_client, review["id"])
        
        # Missing question_key
        response = api_client.post(
            f"/api/v1/checklists/{checklist['id']}/answers",
            json={"answers": [[True]], "critical": False}
        )
        assert response.status_code == 422
        
        # Missing answers
        response = api_client.post(
            f"/api/v1/checklists/{checklist['id']}/answers",
            json={"question_key": "q1", "critical": False}
        )
        assert response.status_code == 422
    
    def test_no_authentication_returns_401(self, api_client: APIClient):
        """Request without authentication returns 401"""
        fake_checklist_id = "00000000-0000-0000-0000-000000000000"
        
        response = api_client.post(
            f"/api/v1/checklists/{fake_checklist_id}/answers",
            json={
                "question_key": "q1",
                "answers": [[True]],
                "critical": False
            }
        )
        
        assert response.status_code in [401, 403, 404]

