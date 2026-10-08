
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'audio_player_screen.dart';
import '../widgets/purchase_dialog.dart';

class StoryDetailScreen extends StatefulWidget {
  final String storyId;
  final ApiService api;

  const StoryDetailScreen({
    super.key,
    required this.storyId,
    required this.api,
  });

  @override
  State<StoryDetailScreen> createState() => _StoryDetailScreenState();
}

class _StoryDetailScreenState extends State<StoryDetailScreen> {
  Map<String, dynamic>? story;
  bool loading = true;

  Future<void> loadStory() async {
    try {
      final result = await widget.api.getStory(widget.storyId);
      if (!mounted) return;
      setState(() {
        story = result;
        loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => loading = false);
    }
  }

  @override
  void initState() {
    super.initState();
    loadStory();
  }

  Future<void> openEpisode(Map<String, dynamic> episode) async {
    if (episode['locked'] == true) {
      final purchased = await showModalBottomSheet<bool>(
        context: context,
        isScrollControlled: true,
        builder: (_) => PurchaseDialog(
          story: story!,
          api: widget.api,
        ),
      );

      if (purchased == true) await loadStory();
      return;
    }

    final url = episode['audio_url'];
    if (url is! String || url.isEmpty) return;

    if (!mounted) return;
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => AudioPlayerScreen(
          episodes: List<Map<String, dynamic>>.from(story!['episodes'])
              .where((e) => e['locked'] != true)
              .toList(),
          initialEpisode: episode,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (story == null) {
      return Scaffold(
        appBar: AppBar(),
        body: const Center(child: Text('Unable to load story')),
      );
    }

    final episodes = List<Map<String, dynamic>>.from(
      story!['episodes'],
    );

    return Scaffold(
      appBar: AppBar(title: Text(story!['title'])),
      body: ListView(
        children: [
          Image.network(
            story!['banner_url'],
            height: 210,
            width: double.infinity,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) =>
                const SizedBox(height: 160, child: Icon(Icons.book)),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  story!['title'],
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 8),
                Text(story!['description'] ?? ''),
                const SizedBox(height: 8),
                Text('Total Episodes: ${story!['total_episodes']}'),
                const SizedBox(height: 16),
                ...episodes.map((episode) {
                  final locked = episode['locked'] == true;
                  return ListTile(
                    leading: Icon(
                      locked ? Icons.lock_outline : Icons.play_circle,
                    ),
                    title: Text(
                      'Episode ${episode['ep_no']}: ${episode['title']}',
                    ),
                    subtitle: Text(
                      locked ? 'Locked' :
                      episode['is_free'] == true ? 'Free' : 'Unlocked',
                    ),
                    trailing: locked
                        ? const Icon(Icons.chevron_right)
                        : const Icon(Icons.play_arrow),
                    onTap: () => openEpisode(episode),
                  );
                }),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
