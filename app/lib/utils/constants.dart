import 'package:flutter/material.dart';

class AppColors {
  static const primary = Color(0xFF2E7D32);      // green
  static const primaryDark = Color(0xFF1B5E20);
  static const accent = Color(0xFF66BB6A);
  static const danger = Color(0xFFD32F2F);
  static const warning = Color(0xFFFFA000);
  static const background = Color(0xFFF5F7F5);
  static const cardBg = Colors.white;
  static const textDark = Color(0xFF212121);
  static const textLight = Color(0xFF757575);
}

class ApiConfig {
  // TODO: point this at your Node.js backend
  static const String baseUrl = 'http://localhost:3000/api';

  static const String loginEndpoint = '$baseUrl/auth/login';
  static const String cowsEndpoint = '$baseUrl/cows';
  static const String devicesEndpoint = '$baseUrl/devices';
  static const String alertsEndpoint = '$baseUrl/alerts';
}

class AppConstants {
  static const double defaultGeofenceLat = 6.9271;
  static const double defaultGeofenceLng = 79.8612;
  static const String prefsTokenKey = 'auth_token';
}