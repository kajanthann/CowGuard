import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../widgets/cow_header.dart';
import '../widgets/cow_bottom_nav.dart';
import '../utils/constants.dart';
import 'login_screen.dart';
import 'live_map_screen.dart';
import 'cows_screen.dart';
import 'devices_screen.dart';
import 'alerts_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _index = 0;
  final _authService = AuthService();

  final List<Widget> _pages = const [
    LiveMapScreen(),
    CowsScreen(),
    DevicesScreen(),
    AlertsScreen(),
  ];

  final List<String> _titles = const ['Live Map', 'Cows', 'Devices', 'Alerts'];

  Future<void> _logout() async {
    await _authService.logout();
    if (!mounted) return;
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CowHeader(
        alertCount: 2,
        onNotificationTap: () => setState(() => _index = 3), // jump to Alerts
      ),
      drawer: Drawer(
        child: SafeArea(
          child: Column(
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                color: AppColors.primary,
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('🐄', style: TextStyle(fontSize: 36)),
                    SizedBox(height: 8),
                    Text('CowGuard',
                        style: TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
              ListTile(
                leading: const Icon(Icons.settings_outlined),
                title: const Text('Settings'),
                onTap: () => Navigator.pop(context),
              ),
              ListTile(
                leading: const Icon(Icons.info_outline),
                title: const Text('About CowGuard'),
                onTap: () => Navigator.pop(context),
              ),
              const Spacer(),
              ListTile(
                leading: const Icon(Icons.logout, color: AppColors.danger),
                title: const Text('Logout', style: TextStyle(color: AppColors.danger)),
                onTap: _logout,
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
      body: IndexedStack(
        index: _index,
        children: _pages,
      ),
      bottomNavigationBar: CowBottomNav(
        currentIndex: _index,
        onTap: (i) => setState(() => _index = i),
      ),
    );
  }
}