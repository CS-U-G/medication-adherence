// ignore_for_file: unused_local_variable

import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:med_minder/screens/login.dart';
import 'package:med_minder/screens/onboarding.dart';
import 'package:med_minder/models/db.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Hive.initFlutter();

  var passwordsBox = await Hive.openBox("passwordsBox");
  DB.loadData();
  // Guys this box is to check if it's the first time the user opens the application so we can skip the onboardingScreen!
  var isFirstTime = await Hive.openBox("isFirstTime");
  final bool seenOnboardingScreen =
      isFirstTime.get('seenOnboardingScreen', defaultValue: false) as bool;

  runApp(MyApp(seenOnboardingScreen: seenOnboardingScreen));
}

class MyApp extends StatelessWidget {
  final bool seenOnboardingScreen;

  const MyApp({super.key, required this.seenOnboardingScreen});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: seenOnboardingScreen
          ? const LoginScreen()
          : const OnboardingScreen(),
    );
  }
}
