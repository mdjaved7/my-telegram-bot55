import 'package:flutter/material.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class StoryDetailsScreen extends StatefulWidget {
  final Map story;
  final List userPurchasedStories;
  final String userId;

  StoryDetailsScreen({required this.story, required this.userPurchasedStories, required this.userId});

  @override
  _StoryDetailsScreenState createState() => _StoryDetailsScreenState();
}

class _StoryDetailsScreenState extends State<StoryDetailsScreen> {
  late Razorpay _razorpay;
  bool _hasAccess = false;

  @override
  void initState() {
    super.initState();
    _hasAccess = widget.userPurchasedStories.contains(widget.story['_id']);
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
  }

  void _handlePaymentSuccess(PaymentSuccessResponse response) async {
    // Call Node.js backend to verify signature and update DB
    var res = await http.post(Uri.parse('https://your-api.com/purchase/verify'), body: {
      'razorpay_order_id': response.orderId,
      'razorpay_payment_id': response.paymentId,
      'razorpay_signature': response.signature,
      'userId': widget.userId,
      'storyId': widget.story['_id']
    });
    
    if (jsonDecode(res.body)['success']) {
      setState(() => _hasAccess = true);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Story Unlocked!')));
    }
  }

  void _handlePaymentError(PaymentFailureResponse response) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Payment Failed')));
  }

  void _startPurchaseFlow() async {
    // 1. Get Order ID from your Node backend
    var res = await http.post(Uri.parse('https://your-api.com/purchase/order'), body: {'storyId': widget.story['_id']});
    var orderData = jsonDecode(res.body);

    // 2. Open Razorpay Checkout
    var options = {
      'key': 'rzp_test_YOUR_KEY',
      'amount': orderData['amount'], 
      'name': 'All Story FM',
      'description': 'Unlock ${widget.story['title']}',
      'order_id': orderData['id'],
      'prefill': {'contact': '9876543210'}
    };
    _razorpay.open(options);
  }

  void _showPurchaseSheet() {
    final s = widget.story;
    showModalBottomSheet(context: context, builder: (context) {
      return Container(
        padding: EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text("Unlock Unlimited Access", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            SizedBox(height: 10),
            if (s['is_discount_active']) 
              Text("Festive Offer: ₹${s['discount_price']} (Original: ₹${s['original_price']})", style: TextStyle(color: Colors.green)),
            if (!s['is_discount_active'])
              Text("Price: ₹${s['original_price']}"),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                _startPurchaseFlow();
              },
              child: Text("Pay Now via UPI/Cards"),
            )
          ],
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final episodes = widget.story['episodes'];
    return Scaffold(
      appBar: AppBar(title: Text(widget.story['title'])),
      body: Column(
        children: [
          Image.network(widget.story['banner_url']),
          Text("Total Episodes: ${widget.story['total_episodes']}"),
          Expanded(
            child: ListView.builder(
              itemCount: episodes.length,
              itemBuilder: (context, index) {
                var ep = episodes[index];
                bool isLocked = !ep['is_free'] && !_hasAccess;

                return ListTile(
                  title: Text(ep['title']),
                  trailing: isLocked ? Icon(Icons.lock, color: Colors.red) : Icon(Icons.play_arrow, color: Colors.green),
                  onTap: () {
                    if (isLocked) {
                      _showPurchaseSheet();
                    } else {
                      // Navigate to AudioPlayerScreen passing ep['audio_url']
                    }
                  },
                );
              },
            ),
          )
        ],
      ),
    );
  }
}
