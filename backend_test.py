#!/usr/bin/env python3

import requests
import json
import sys
import os
from urllib.parse import urljoin

# Get base URL from environment or use default
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://structured-tutoring.preview.emergentagent.com')
API_BASE_URL = urljoin(BASE_URL.rstrip('/') + '/', 'api/')

def test_catch_all_api_route():
    """
    Test the catch-all API route behavior for various HTTP methods and paths
    """
    print(f"Testing catch-all API route at: {API_BASE_URL}")
    print("=" * 60)
    
    # Test different API paths
    test_paths = [
        'users',
        'posts', 
        'auth/login',
        'data/fetch',
        'unknown/endpoint'
    ]
    
    # Test different HTTP methods
    methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    
    all_tests_passed = True
    test_results = []
    
    for path in test_paths:
        full_url = urljoin(API_BASE_URL, path)
        print(f"\nTesting path: {path} ({full_url})")
        print("-" * 40)
        
        for method in methods:
            try:
                # Prepare request data for POST/PUT/PATCH methods
                data = None
                headers = {'Content-Type': 'application/json'}
                
                if method in ['POST', 'PUT', 'PATCH']:
                    data = json.dumps({"test": "data", "method": method})
                
                # Make the request
                response = requests.request(
                    method=method,
                    url=full_url,
                    data=data,
                    headers=headers,
                    timeout=10
                )
                
                # Check response status
                expected_status = 404
                status_passed = response.status_code == expected_status
                
                # Check response format (should be JSON)
                try:
                    response_json = response.json()
                    json_format_passed = True
                    
                    # Check for expected message
                    expected_message = "No backend API is required for the current Mentora Edutors homepage build."
                    message_passed = response_json.get('message') == expected_message
                    
                except (json.JSONDecodeError, ValueError):
                    response_json = None
                    json_format_passed = False
                    message_passed = False
                
                # Overall test result for this method
                test_passed = status_passed and json_format_passed and message_passed
                if not test_passed:
                    all_tests_passed = False
                
                # Store result
                result = {
                    'method': method,
                    'path': path,
                    'url': full_url,
                    'status_code': response.status_code,
                    'expected_status': expected_status,
                    'status_passed': status_passed,
                    'json_format_passed': json_format_passed,
                    'message_passed': message_passed,
                    'response_json': response_json,
                    'test_passed': test_passed
                }
                test_results.append(result)
                
                # Print result
                status_symbol = "✅" if test_passed else "❌"
                print(f"  {method:6} | Status: {response.status_code:3} | JSON: {json_format_passed} | Message: {message_passed} | {status_symbol}")
                
                if not test_passed:
                    print(f"    Expected status: {expected_status}, Got: {response.status_code}")
                    if response_json:
                        print(f"    Response: {response_json}")
                    else:
                        print(f"    Raw response: {response.text[:200]}")
                        
            except requests.exceptions.RequestException as e:
                print(f"  {method:6} | ERROR: {str(e)} | ❌")
                all_tests_passed = False
                test_results.append({
                    'method': method,
                    'path': path,
                    'url': full_url,
                    'error': str(e),
                    'test_passed': False
                })
    
    # Summary
    print("\n" + "=" * 60)
    print("BACKEND TEST SUMMARY")
    print("=" * 60)
    
    total_tests = len([r for r in test_results if 'error' not in r])
    passed_tests = len([r for r in test_results if r.get('test_passed', False)])
    
    print(f"Total API calls tested: {len(test_results)}")
    print(f"Successful tests: {passed_tests}/{total_tests}")
    
    if all_tests_passed:
        print("🎉 ALL TESTS PASSED - Catch-all API route is working correctly")
        print("\nKey validations:")
        print("✅ All HTTP methods (GET, POST, PUT, PATCH, DELETE) return 404 status")
        print("✅ All responses are properly formatted JSON")
        print("✅ All responses contain the expected message")
        print("✅ No runtime errors or server exceptions")
    else:
        print("❌ SOME TESTS FAILED - Issues found with catch-all API route")
        print("\nFailed tests:")
        for result in test_results:
            if not result.get('test_passed', False):
                if 'error' in result:
                    print(f"  - {result['method']} {result['path']}: {result['error']}")
                else:
                    print(f"  - {result['method']} {result['path']}: Status {result['status_code']}, JSON: {result['json_format_passed']}, Message: {result['message_passed']}")
    
    return all_tests_passed, test_results

def test_api_route_no_crashes():
    """
    Test that the API route doesn't cause server crashes or unhandled exceptions
    """
    print(f"\nTesting for server stability...")
    print("-" * 40)
    
    try:
        # Make a simple GET request to check server is responding
        response = requests.get(urljoin(API_BASE_URL, 'health-check'), timeout=10)
        
        if response.status_code == 404:
            # Expected behavior - catch-all route caught it
            print("✅ Server is responding properly to requests")
            return True
        else:
            print(f"⚠️  Unexpected status code: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Server appears to be down or unreachable")
        return False
    except requests.exceptions.Timeout:
        print("❌ Server response timeout - possible performance issue")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return False

def test_supabase_intro_requests_api():
    """
    Test the Supabase intro requests insertion API
    """
    print(f"\nTesting Supabase intro requests API...")
    print("=" * 60)
    
    intro_requests_url = urljoin(API_BASE_URL, 'intro-requests')
    print(f"Testing endpoint: {intro_requests_url}")
    
    all_tests_passed = True
    test_results = []
    
    # Test 1: Valid payload
    print("\n1. Testing valid payload...")
    print("-" * 40)
    valid_payload = {
        "parent_name": "Test Parent",
        "phone": "9999999999",
        "class_level": "Class 11–12",
        "subject": "Physics",
        "topic_cluster": "Physics: Foundation & Core Concepts",
        "area": "Bengaluru"
    }
    
    try:
        response = requests.post(
            intro_requests_url,
            json=valid_payload,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        status_passed = response.status_code == 201
        
        try:
            response_json = response.json()
            json_format_passed = True
            
            # Check response structure
            expected_message = "Intro request stored successfully."
            message_passed = response_json.get('message') == expected_message
            
        except (json.JSONDecodeError, ValueError):
            response_json = None
            json_format_passed = False
            message_passed = False
        
        test_passed = status_passed and json_format_passed and message_passed
        if not test_passed:
            all_tests_passed = False
        
        result = {
            'test': 'valid_payload',
            'status_code': response.status_code,
            'expected_status': 201,
            'status_passed': status_passed,
            'json_format_passed': json_format_passed,
            'message_passed': message_passed,
            'response_json': response_json,
            'test_passed': test_passed
        }
        test_results.append(result)
        
        status_symbol = "✅" if test_passed else "❌"
        print(f"  POST valid payload | Status: {response.status_code:3} | JSON: {json_format_passed} | Message: {message_passed} | {status_symbol}")
        
        if not test_passed:
            print(f"    Expected status: 201, Got: {response.status_code}")
            if response_json:
                print(f"    Response: {response_json}")
            else:
                print(f"    Raw response: {response.text[:200]}")
                
    except requests.exceptions.RequestException as e:
        print(f"  POST valid payload | ERROR: {str(e)} | ❌")
        all_tests_passed = False
        test_results.append({
            'test': 'valid_payload',
            'error': str(e),
            'test_passed': False
        })
    
    # Test 2: Missing required fields
    print("\n2. Testing missing required fields...")
    print("-" * 40)
    
    missing_field_tests = [
        {"payload": {}, "description": "all fields missing"},
        {"payload": {"parent_name": "Test Parent"}, "description": "only parent_name"},
        {"payload": {"parent_name": "Test Parent", "phone": "9999999999"}, "description": "missing class_level, subject, topic_cluster, area"},
        {"payload": {"parent_name": "", "phone": "9999999999", "class_level": "Class 11–12", "subject": "Physics", "topic_cluster": "Physics: Foundation & Core Concepts", "area": "Bengaluru"}, "description": "empty parent_name"},
    ]
    
    for test_case in missing_field_tests:
        payload = test_case["payload"]
        description = test_case["description"]
        
        try:
            response = requests.post(
                intro_requests_url,
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            status_passed = response.status_code == 400
            
            try:
                response_json = response.json()
                json_format_passed = True
                
                # Check for error message about missing fields
                expected_message = "Missing required fields."
                message_passed = response_json.get('message') == expected_message
                
            except (json.JSONDecodeError, ValueError):
                response_json = None
                json_format_passed = False
                message_passed = False
            
            test_passed = status_passed and json_format_passed and message_passed
            if not test_passed:
                all_tests_passed = False
            
            result = {
                'test': f'missing_fields_{description}',
                'status_code': response.status_code,
                'expected_status': 400,
                'status_passed': status_passed,
                'json_format_passed': json_format_passed,
                'message_passed': message_passed,
                'response_json': response_json,
                'test_passed': test_passed
            }
            test_results.append(result)
            
            status_symbol = "✅" if test_passed else "❌"
            print(f"  POST {description:25} | Status: {response.status_code:3} | JSON: {json_format_passed} | Message: {message_passed} | {status_symbol}")
            
            if not test_passed:
                print(f"    Expected status: 400, Got: {response.status_code}")
                if response_json:
                    print(f"    Response: {response_json}")
                else:
                    print(f"    Raw response: {response.text[:200]}")
                    
        except requests.exceptions.RequestException as e:
            print(f"  POST {description:25} | ERROR: {str(e)} | ❌")
            all_tests_passed = False
            test_results.append({
                'test': f'missing_fields_{description}',
                'error': str(e),
                'test_passed': False
            })
    
    # Test 3: Invalid JSON payload
    print("\n3. Testing invalid JSON payload...")
    print("-" * 40)
    
    try:
        response = requests.post(
            intro_requests_url,
            data="invalid json",
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        # Should return some error status (400, 422, or 500)
        status_passed = response.status_code >= 400
        
        try:
            response_json = response.json()
            json_format_passed = True
        except (json.JSONDecodeError, ValueError):
            response_json = None
            json_format_passed = False
        
        test_passed = status_passed  # JSON format not critical for error cases
        if not test_passed:
            all_tests_passed = False
        
        result = {
            'test': 'invalid_json',
            'status_code': response.status_code,
            'status_passed': status_passed,
            'json_format_passed': json_format_passed,
            'response_json': response_json,
            'test_passed': test_passed
        }
        test_results.append(result)
        
        status_symbol = "✅" if test_passed else "❌"
        print(f"  POST invalid JSON     | Status: {response.status_code:3} | JSON: {json_format_passed} | Error handling: {status_passed} | {status_symbol}")
        
        if not test_passed:
            print(f"    Expected error status (>=400), Got: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"  POST invalid JSON     | ERROR: {str(e)} | ❌")
        all_tests_passed = False
        test_results.append({
            'test': 'invalid_json',
            'error': str(e),
            'test_passed': False
        })
    
    # Test 4: Non-matching API paths should still use catch-all behavior
    print("\n4. Testing non-matching API paths preserve catch-all behavior...")
    print("-" * 40)
    
    non_matching_paths = ['intro-requests-wrong', 'other-endpoint', 'intro/requests']
    
    for path in non_matching_paths:
        try:
            response = requests.post(
                urljoin(API_BASE_URL, path),
                json=valid_payload,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            # Should return 404 like catch-all route
            status_passed = response.status_code == 404
            
            try:
                response_json = response.json()
                json_format_passed = True
                
                expected_message = "No backend API is required for the current Mentora Edutors homepage build."
                message_passed = response_json.get('message') == expected_message
                
            except (json.JSONDecodeError, ValueError):
                response_json = None
                json_format_passed = False
                message_passed = False
            
            test_passed = status_passed and json_format_passed and message_passed
            if not test_passed:
                all_tests_passed = False
            
            result = {
                'test': f'catch_all_{path}',
                'status_code': response.status_code,
                'expected_status': 404,
                'status_passed': status_passed,
                'json_format_passed': json_format_passed,
                'message_passed': message_passed,
                'response_json': response_json,
                'test_passed': test_passed
            }
            test_results.append(result)
            
            status_symbol = "✅" if test_passed else "❌"
            print(f"  POST {path:20} | Status: {response.status_code:3} | JSON: {json_format_passed} | Message: {message_passed} | {status_symbol}")
            
        except requests.exceptions.RequestException as e:
            print(f"  POST {path:20} | ERROR: {str(e)} | ❌")
            all_tests_passed = False
            test_results.append({
                'test': f'catch_all_{path}',
                'error': str(e),
                'test_passed': False
            })
    
    # Summary for Supabase API tests
    print("\n" + "=" * 60)
    print("SUPABASE INTRO REQUESTS API TEST SUMMARY")
    print("=" * 60)
    
    total_tests = len([r for r in test_results if 'error' not in r])
    passed_tests = len([r for r in test_results if r.get('test_passed', False)])
    
    print(f"Total Supabase API tests: {len(test_results)}")
    print(f"Successful tests: {passed_tests}/{total_tests}")
    
    if all_tests_passed:
        print("🎉 ALL SUPABASE API TESTS PASSED")
        print("\nKey validations:")
        print("✅ Valid payload returns 201 status with success message")
        print("✅ Missing fields return 400 status with error message")
        print("✅ Invalid JSON handled properly")
        print("✅ Non-matching paths preserve catch-all behavior")
        print("✅ No runtime errors or server exceptions")
    else:
        print("❌ SOME SUPABASE API TESTS FAILED")
        print("\nFailed tests:")
        for result in test_results:
            if not result.get('test_passed', False):
                if 'error' in result:
                    print(f"  - {result['test']}: {result['error']}")
                else:
                    print(f"  - {result['test']}: Status {result['status_code']}, Expected: {result.get('expected_status', 'N/A')}")
    
    return all_tests_passed, test_results

if __name__ == "__main__":
    print("MENTORA EDUTORS - BACKEND API TESTING")
    print("=" * 60)
    print(f"Base URL: {BASE_URL}")
    print(f"API URL: {API_BASE_URL}")
    
    try:
        # Test catch-all API route behavior
        route_tests_passed, results = test_catch_all_api_route()
        
        # Test Supabase intro requests API
        supabase_tests_passed, supabase_results = test_supabase_intro_requests_api()
        
        # Test server stability
        stability_passed = test_api_route_no_crashes()
        
        # Overall result
        overall_success = route_tests_passed and supabase_tests_passed and stability_passed
        
        print(f"\n{'='*60}")
        print("FINAL RESULT")
        print(f"{'='*60}")
        
        if overall_success:
            print("🎉 BACKEND TESTING COMPLETE - ALL TESTS PASSED")
            sys.exit(0)
        else:
            print("❌ BACKEND TESTING COMPLETE - SOME ISSUES FOUND")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nUnexpected error during testing: {str(e)}")
        sys.exit(1)