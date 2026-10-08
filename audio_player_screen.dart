
import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';

class AudioPlayerScreen extends StatefulWidget {
  final List<Map<String, dynamic>> episodes;
  final Map<String, dynamic> initialEpisode;

  const AudioPlayerScreen({
    super.key,
    required this.episodes,
    required this.initialEpisode,
  });

  @override
  State<AudioPlayerScreen> createState() => _AudioPlayerScreenState();
}

class _AudioPlayerScreenState extends State<AudioPlayerScreen> {
  final player = AudioPlayer();
  late int index;

  @override
  void initState() {
    super.initState();
    index = widget.episodes.indexWhere(
      (e) => e['ep_no'] == widget.initialEpisode['ep_no'],
    );
    if (index < 0) index = 0;
    loadEpisode();
  }

  Future<void> loadEpisode() async {
    if (widget.episodes.isEmpty) return;
    final url = widget.episodes[index]['audio_url'] as String?;
    if (url == null || url.isEmpty) return;

    try {
      await player.setUrl(url);
      await player.play();
      if (mounted) setState(() {});
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Unable to play this episode')),
        );
      }
    }
  }

  Future<void> changeEpisode(int next) async {
    if (next < 0 || next >= widget.episodes.length) return;
    setState(() => index = next);
    await loadEpisode();
  }

  String format(Duration d) {
    final m = d.inMinutes.toString().padLeft(2, '0');
    final s = (d.inSeconds % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  @override
  void dispose() {
    player.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.episodes.isEmpty) {
      return const Scaffold(
        body: Center(child: Text('No playable episodes')),
      );
    }

    final episode = widget.episodes[index];

    return Scaffold(
      appBar: AppBar(title: const Text('All Story FM Player')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.headphones, size: 100),
            const SizedBox(height: 24),
            Text(
              episode['title'] ?? 'Episode',
              style: Theme.of(context).textTheme.headlineSmall,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            StreamBuilder<Duration>(
              stream: player.positionStream,
              builder: (context, snapshot) {
                final position = snapshot.data ?? Duration.zero;
                final duration = player.duration ?? Duration.zero;
                final max = duration.inMilliseconds.toDouble();
                final value = position.inMilliseconds
                    .toDouble().clamp(0.0, max > 0 ? max : 1.0);

                return Column(
                  children: [
                    Slider(
                      value: value,
                      max: max > 0 ? max : 1,
                      onChanged: (v) => player.seek(
                        Duration(milliseconds: v.round()),
                      ),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(format(position)),
                        Text(format(duration)),
                      ],
                    ),
                  ],
                );
              },
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  onPressed: () => changeEpisode(index - 1),
                  icon: const Icon(Icons.skip_previous),
                  iconSize: 36,
                ),
                StreamBuilder<PlayerState>(
                  stream: player.playerStateStream,
                  builder: (context, snapshot) {
                    final playing = snapshot.data?.playing ?? false;
                    return IconButton(
                      iconSize: 56,
                      onPressed: () => playing
                          ? player.pause()
                          : player.play(),
                      icon: Icon(
                        playing ? Icons.pause_circle : Icons.play_circle,
                      ),
                    );
                  },
                ),
                IconButton(
                  onPressed: () => changeEpisode(index + 1),
                  icon: const Icon(Icons.skip_next),
                  iconSize: 36,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
