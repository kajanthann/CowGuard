import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../models/cow.dart';
import '../services/firebase_service.dart';
import '../utils/constants.dart';

class LiveMapScreen extends StatefulWidget {
  const LiveMapScreen({super.key});

  @override
  State<LiveMapScreen> createState() => _LiveMapScreenState();
}

class _LiveMapScreenState extends State<LiveMapScreen> {
  final _service = FirebaseService();
  List<Cow> _cows = [];
  bool _loading = true;

  // TODO: replace with your actual farm geofence polygon points
  final List<LatLng> _geofence = const [
    LatLng(6.9290, 79.8590),
    LatLng(6.9290, 79.8635),
    LatLng(6.9250, 79.8635),
    LatLng(6.9250, 79.8590),
  ];

  @override
  void initState() {
    super.initState();
    _loadCows();
  }

  Future<void> _loadCows() async {
    final cows = await _service.fetchCows();
    if (!mounted) return;
    setState(() {
      _cows = cows;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    final center = _cows.isNotEmpty
        ? LatLng(_cows.first.latitude, _cows.first.longitude)
        : const LatLng(AppConstants.defaultGeofenceLat, AppConstants.defaultGeofenceLng);

    return Stack(
      children: [
        FlutterMap(
          options: MapOptions(
            initialCenter: center,
            initialZoom: 16,
          ),
          children: [
            TileLayer(
              urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
              userAgentPackageName: 'com.example.cowguard_app',
            ),
            PolygonLayer(
              polygons: [
                Polygon(
                  points: _geofence,
                  color: AppColors.primary.withOpacity(0.15),
                  borderColor: AppColors.primary,
                  borderStrokeWidth: 2,
                ),
              ],
            ),
            MarkerLayer(
              markers: _cows.map((cow) {
                return Marker(
                  point: LatLng(cow.latitude, cow.longitude),
                  width: 44,
                  height: 44,
                  child: Column(
                    children: [
                      Icon(
                        Icons.location_on,
                        color: cow.isInsideGeofence
                            ? AppColors.primary
                            : AppColors.danger,
                        size: 34,
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ],
        ),
        Positioned(
          top: 12,
          left: 12,
          right: 12,
          child: Card(
            elevation: 3,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _legendDot(AppColors.primary, 'Inside'),
                  _legendDot(AppColors.danger, 'Outside'),
                  Text('${_cows.length} cows tracked',
                      style: const TextStyle(fontSize: 12, color: AppColors.textLight)),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _legendDot(Color color, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(Icons.circle, size: 10, color: color),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(fontSize: 12)),
      ],
    );
  }
}