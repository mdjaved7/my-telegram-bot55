
import 'package:flutter/material.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import '../services/api_service.dart';

class PurchaseDialog extends StatefulWidget {
  final Map<String, dynamic> story;
  final ApiService api;

  const PurchaseDialog({
    super.key,
    required this.story,
    required this.api,
  });

  @override
  State<PurchaseDialog> createState() => _PurchaseDialogState();
}

class _PurchaseDialogState extends State<PurchaseDialog> {
  late final Razorpay razorpay;
  bool busy = false;

  @override
  void initState() {
    super.initState();
    razorpay = Razorpay();
    razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, onSuccess);
    razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, onError);
    razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, onWallet);
  }

  Future<void> buyStory() async {
    setState(() => busy = true);

    try {
      final order = await widget.api.createOrder(
        widget.story['_id'].toString(),
      );

      razorpay.open({
        'key': order['keyId'],
        'amount': order['amount'],
        'currency': order['currency'],
        'order_id': order['orderId'],
        'name': 'All Story FM',
        'description': 'Unlimited story access',
        'theme': {'color': '#6C3CE9'},
      });
    } catch (e) {
      if (mounted) {
        setState(() => busy = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Unable to start payment')),
        );
      }
    }
  }

  Future<void> onSuccess(PaymentSuccessResponse response) async {
    try {
      await widget.api.verifyPayment(
        orderId: response.orderId!,
        paymentId: response.paymentId!,
        signature: response.signature!,
      );

      if (mounted) Navigator.pop(context, true);
    } catch (_) {
      // Do not grant access locally. Refresh purchase status or retry
      // verification; the server/webhook is authoritative.
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Payment received; verifying access.'),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  void onError(PaymentFailureResponse response) {
    if (mounted) {
      setState(() => busy = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Payment failed or cancelled')),
      );
    }
  }

  void onWallet(ExternalWalletResponse response) {
    // External wallet selected. Do not grant access from this callback.
  }

  @override
  void dispose() {
    razorpay.clear();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final original = (widget.story['original_price'] as num).toDouble();
    final current = (widget.story['current_price'] as num).toDouble();
    final discount = widget.story['is_discount_active'] == true;

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Unlock ${widget.story['title']}',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 12),
            if (discount)
              Text(widget.story['sale_banner_message'] ??
                  'Special offer'),
            Text(
              '₹${current.toStringAsFixed(0)}',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            if (discount)
              Text(
                'Original: ₹${original.toStringAsFixed(0)}',
                style: const TextStyle(
                  decoration: TextDecoration.lineThrough,
                ),
              ),
            const SizedBox(height: 12),
            const Text(
              'One-time purchase. Unlock all episodes permanently '
              'for this account.',
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: busy ? null : buyStory,
                child: Text(busy ? 'Processing...' : 'Purchase Story'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
