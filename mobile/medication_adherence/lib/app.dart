import 'package:flutter/material.dart';
import 'core/app_theme.dart';
import 'screens/welcome_screen.dart';

class MedicationAdherenceApp extends StatelessWidget {
  const MedicationAdherenceApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MedMinder',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      home: const WelcomeScreen(),
    );
  }
}