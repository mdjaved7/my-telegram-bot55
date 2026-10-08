
import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // Android emulator: 10.0.2.2 reaches your development computer.
  // Use your server's HTTPS URL in production.
  static const baseUrl = 'http://10.0.2.2:5000/api';

  final String token;

  ApiService({required this.token});

  Map<String, String> get headers => {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $token',
  };

  Future<List<dynamic>> getStories() async {
    final response = await http.get(
      Uri.parse('$baseUrl/stories'),
    );
    if (response.statusCode != 200) {
      throw Exception('Could not load stories');
    }
    return jsonDecode(response.body) as List<dynamic>;
  }

  Future<Map<String, dynamic>> getStory(String id) async {
    final response = await http.get(
      Uri.parse('$baseUrl/stories/$id'),
      headers: headers,
    );
    if (response.statusCode != 200) {
      throw Exception('Could not load story');
    }
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createOrder(String storyId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/payments/create-order'),
      headers: headers,
      body: jsonEncode({'storyId': storyId}),
    );
    if (response.statusCode != 200) {
      throw Exception('Could not create payment order');
    }
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<void> verifyPayment({
    required String orderId,
    required String paymentId,
    required String signature,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/payments/verify'),
      headers: headers,
      body: jsonEncode({
        'razorpay_order_id': orderId,
        'razorpay_payment_id': paymentId,
        'razorpay_signature': signature,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Payment verification failed');
    }
  }
}
