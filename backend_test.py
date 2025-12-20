#!/usr/bin/env python3
"""
Comprehensive backend API testing for Trip Planner application
Tests all authentication, trip management, booking, and contact endpoints
"""

import requests
import sys
import json
from datetime import datetime, timedelta

class TripPlannerAPITester:
    def __init__(self, base_url="https://tripcraft-43.preview.emergentagent.com"):
        self.base_url = base_url
        self.user_token = None
        self.admin_token = None
        self.test_user_id = None
        self.test_trip_id = None
        self.test_booking_id = None
        self.test_contact_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
            self.failed_tests.append(f"{name}: {details}")

    def make_request(self, method, endpoint, data=None, token=None, expected_status=200):
        """Make HTTP request with proper headers"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            return success, response.json() if success else response.text, response.status_code

        except Exception as e:
            return False, str(e), 0

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime("%H%M%S")
        test_data = {
            "name": f"Test User {timestamp}",
            "email": f"testuser{timestamp}@example.com",
            "password": "testpass123"
        }
        
        success, response, status = self.make_request('POST', 'auth/register', test_data, expected_status=200)
        
        if success and 'access_token' in response:
            self.user_token = response['access_token']
            self.test_user_id = response['user']['id']
            self.log_test("User Registration", True)
            return True
        else:
            self.log_test("User Registration", False, f"Status: {status}, Response: {response}")
            return False

    def test_admin_login(self):
        """Test admin login with provided credentials"""
        login_data = {
            "email": "admin@tripplanner.com",
            "password": "admin123"
        }
        
        success, response, status = self.make_request('POST', 'auth/login', login_data, expected_status=200)
        
        if success and 'access_token' in response:
            self.admin_token = response['access_token']
            self.log_test("Admin Login", True)
            return True
        else:
            self.log_test("Admin Login", False, f"Status: {status}, Response: {response}")
            return False

    def test_user_login(self):
        """Test user login"""
        timestamp = datetime.now().strftime("%H%M%S")
        login_data = {
            "email": f"testuser{timestamp}@example.com",
            "password": "testpass123"
        }
        
        success, response, status = self.make_request('POST', 'auth/login', login_data, expected_status=200)
        
        if success and 'access_token' in response:
            self.log_test("User Login", True)
            return True
        else:
            self.log_test("User Login", False, f"Status: {status}, Response: {response}")
            return False

    def test_get_current_user(self):
        """Test get current user endpoint"""
        success, response, status = self.make_request('GET', 'auth/me', token=self.user_token, expected_status=200)
        
        if success and 'email' in response:
            self.log_test("Get Current User", True)
            return True
        else:
            self.log_test("Get Current User", False, f"Status: {status}, Response: {response}")
            return False

    def test_create_trip(self):
        """Test creating a trip (admin only)"""
        trip_data = {
            "title": "Test Paradise Island",
            "destination": "Test Maldives",
            "duration": "5 days",
            "price": 1299.99,
            "description": "A beautiful test trip to paradise island with crystal clear waters.",
            "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
        }
        
        success, response, status = self.make_request('POST', 'trips', trip_data, token=self.admin_token, expected_status=200)
        
        if success and 'id' in response:
            self.test_trip_id = response['id']
            self.log_test("Create Trip", True)
            return True
        else:
            self.log_test("Create Trip", False, f"Status: {status}, Response: {response}")
            return False

    def test_get_all_trips(self):
        """Test getting all trips"""
        success, response, status = self.make_request('GET', 'trips', expected_status=200)
        
        if success and isinstance(response, list):
            self.log_test("Get All Trips", True)
            return True
        else:
            self.log_test("Get All Trips", False, f"Status: {status}, Response: {response}")
            return False

    def test_get_trip_by_id(self):
        """Test getting trip by ID"""
        if not self.test_trip_id:
            self.log_test("Get Trip By ID", False, "No test trip ID available")
            return False
            
        success, response, status = self.make_request('GET', f'trips/{self.test_trip_id}', expected_status=200)
        
        if success and 'id' in response:
            self.log_test("Get Trip By ID", True)
            return True
        else:
            self.log_test("Get Trip By ID", False, f"Status: {status}, Response: {response}")
            return False

    def test_update_trip(self):
        """Test updating a trip (admin only)"""
        if not self.test_trip_id:
            self.log_test("Update Trip", False, "No test trip ID available")
            return False
            
        updated_data = {
            "title": "Updated Test Paradise Island",
            "destination": "Updated Test Maldives",
            "duration": "7 days",
            "price": 1599.99,
            "description": "An updated beautiful test trip to paradise island.",
            "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
        }
        
        success, response, status = self.make_request('PUT', f'trips/{self.test_trip_id}', updated_data, token=self.admin_token, expected_status=200)
        
        if success and response.get('title') == updated_data['title']:
            self.log_test("Update Trip", True)
            return True
        else:
            self.log_test("Update Trip", False, f"Status: {status}, Response: {response}")
            return False

    def test_create_booking(self):
        """Test creating a booking"""
        if not self.test_trip_id or not self.user_token:
            self.log_test("Create Booking", False, "Missing trip ID or user token")
            return False
            
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        booking_data = {
            "trip_id": self.test_trip_id,
            "travel_date": tomorrow,
            "travelers": 2
        }
        
        success, response, status = self.make_request('POST', 'bookings', booking_data, token=self.user_token, expected_status=200)
        
        if success and 'id' in response:
            self.test_booking_id = response['id']
            self.log_test("Create Booking", True)
            return True
        else:
            self.log_test("Create Booking", False, f"Status: {status}, Response: {response}")
            return False

    def test_get_user_bookings(self):
        """Test getting user's bookings"""
        success, response, status = self.make_request('GET', 'bookings/my', token=self.user_token, expected_status=200)
        
        if success and isinstance(response, list):
            self.log_test("Get User Bookings", True)
            return True
        else:
            self.log_test("Get User Bookings", False, f"Status: {status}, Response: {response}")
            return False

    def test_get_all_bookings(self):
        """Test getting all bookings (admin only)"""
        success, response, status = self.make_request('GET', 'bookings', token=self.admin_token, expected_status=200)
        
        if success and isinstance(response, list):
            self.log_test("Get All Bookings (Admin)", True)
            return True
        else:
            self.log_test("Get All Bookings (Admin)", False, f"Status: {status}, Response: {response}")
            return False

    def test_update_booking_status(self):
        """Test updating booking status (admin only)"""
        if not self.test_booking_id:
            self.log_test("Update Booking Status", False, "No test booking ID available")
            return False
            
        status_data = {"status": "confirmed"}
        
        success, response, status = self.make_request('PATCH', f'bookings/{self.test_booking_id}/status', status_data, token=self.admin_token, expected_status=200)
        
        if success and response.get('status') == 'confirmed':
            self.log_test("Update Booking Status", True)
            return True
        else:
            self.log_test("Update Booking Status", False, f"Status: {status}, Response: {response}")
            return False

    def test_submit_contact(self):
        """Test submitting contact form"""
        contact_data = {
            "name": "Test Contact User",
            "email": "testcontact@example.com",
            "message": "This is a test contact message for the trip planner application."
        }
        
        success, response, status = self.make_request('POST', 'contact', contact_data, expected_status=200)
        
        if success and 'id' in response:
            self.test_contact_id = response['id']
            self.log_test("Submit Contact Form", True)
            return True
        else:
            self.log_test("Submit Contact Form", False, f"Status: {status}, Response: {response}")
            return False

    def test_get_all_contacts(self):
        """Test getting all contact messages (admin only)"""
        success, response, status = self.make_request('GET', 'contact', token=self.admin_token, expected_status=200)
        
        if success and isinstance(response, list):
            self.log_test("Get All Contacts (Admin)", True)
            return True
        else:
            self.log_test("Get All Contacts (Admin)", False, f"Status: {status}, Response: {response}")
            return False

    def test_reply_to_contact(self):
        """Test replying to contact message (admin only)"""
        if not self.test_contact_id:
            self.log_test("Reply to Contact", False, "No test contact ID available")
            return False
            
        reply_data = {"reply": "Thank you for your inquiry! We'll get back to you soon."}
        
        success, response, status = self.make_request('PATCH', f'contact/{self.test_contact_id}/reply', reply_data, token=self.admin_token, expected_status=200)
        
        if success and response.get('reply') == reply_data['reply']:
            self.log_test("Reply to Contact", True)
            return True
        else:
            self.log_test("Reply to Contact", False, f"Status: {status}, Response: {response}")
            return False

    def test_dashboard_stats(self):
        """Test getting dashboard statistics (admin only)"""
        success, response, status = self.make_request('GET', 'dashboard/stats', token=self.admin_token, expected_status=200)
        
        if success and 'total_trips' in response:
            self.log_test("Dashboard Statistics", True)
            return True
        else:
            self.log_test("Dashboard Statistics", False, f"Status: {status}, Response: {response}")
            return False

    def test_delete_trip(self):
        """Test deleting a trip (admin only) - run last"""
        if not self.test_trip_id:
            self.log_test("Delete Trip", False, "No test trip ID available")
            return False
            
        success, response, status = self.make_request('DELETE', f'trips/{self.test_trip_id}', token=self.admin_token, expected_status=200)
        
        if success:
            self.log_test("Delete Trip", True)
            return True
        else:
            self.log_test("Delete Trip", False, f"Status: {status}, Response: {response}")
            return False

    def run_all_tests(self):
        """Run all API tests in sequence"""
        print("🚀 Starting Trip Planner API Tests...")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)

        # Authentication Tests
        print("\n🔐 Authentication Tests:")
        self.test_user_registration()
        self.test_admin_login()
        self.test_user_login()
        self.test_get_current_user()

        # Trip Management Tests
        print("\n🏝️ Trip Management Tests:")
        self.test_create_trip()
        self.test_get_all_trips()
        self.test_get_trip_by_id()
        self.test_update_trip()

        # Booking Tests
        print("\n📅 Booking Tests:")
        self.test_create_booking()
        self.test_get_user_bookings()
        self.test_get_all_bookings()
        self.test_update_booking_status()

        # Contact Tests
        print("\n📧 Contact Tests:")
        self.test_submit_contact()
        self.test_get_all_contacts()
        self.test_reply_to_contact()

        # Dashboard Tests
        print("\n📊 Dashboard Tests:")
        self.test_dashboard_stats()

        # Cleanup Tests
        print("\n🧹 Cleanup Tests:")
        self.test_delete_trip()

        # Results Summary
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for failure in self.failed_tests:
                print(f"  - {failure}")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"\n✨ Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = TripPlannerAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())