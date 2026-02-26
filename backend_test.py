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

if __name__ == "__main__":
    print("MENTORA EDUTORS - BACKEND API TESTING")
    print("=" * 60)
    print(f"Base URL: {BASE_URL}")
    print(f"API URL: {API_BASE_URL}")
    
    try:
        # Test catch-all API route behavior
        route_tests_passed, results = test_catch_all_api_route()
        
        # Test server stability
        stability_passed = test_api_route_no_crashes()
        
        # Overall result
        overall_success = route_tests_passed and stability_passed
        
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