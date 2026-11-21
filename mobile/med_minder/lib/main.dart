// ignore_for_file: unused_local_variable

import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:med_minder/constants/app_lang.dart';
import 'package:med_minder/screens/login.dart';
import 'package:med_minder/screens/onboarding.dart';
import 'package:med_minder/Database/db.dart';
import 'package:med_minder/shared/bottom_navigation.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Hive.initFlutter();

  var passwordsBox = await Hive.openBox("passwordsBox");
  DB.loadPasswordsData();

  var medicationsBox = await Hive.openBox("medicationsBox");
  DB.loadMedicationsData();

  var historyBox = await Hive.openBox('historyBox');
  DB.loadHistoryData();

  var statsBox = await Hive.openBox('statsBox');
  DB.loadStatsData();

  var hasOrSkippedPasswordBox = await Hive.openBox("hasOrSkippedPassword");

  final bool hasPassword = hasOrSkippedPasswordBox.get(
    'hasPasswordValue',
    defaultValue: false,
  ) as bool;

  final bool skippedPassword = hasOrSkippedPasswordBox.get(
    'skippedPasswordValue',
    defaultValue: false,
  ) as bool;


  var isFirstTime = await Hive.openBox("isFirstTime");
  final bool seenOnboardingScreen =
      isFirstTime.get('seenOnboardingScreen', defaultValue: false) as bool;

  var settingsBox = await Hive.openBox('settingsBox');
  AppLang.load();

  runApp(
    MyApp(
      seenOnboardingScreen: seenOnboardingScreen,
      hasPassword: hasPassword,
      skippedPassword: skippedPassword,
    ),
  );
}

class MyApp extends StatelessWidget {
  final bool seenOnboardingScreen;
  final bool hasPassword;
  final bool skippedPassword;

  const MyApp({
    super.key,
    required this.seenOnboardingScreen,
    required this.hasPassword,
    required this.skippedPassword,
  });

  Widget startScreen() {
    if (seenOnboardingScreen) {
      if (hasPassword) {
        return LoginScreen();
      } else if (skippedPassword) {
        return BottomNavigationShared();
      }
    }
    return OnboardingScreen();
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<bool>(
      valueListenable: AppLang.isArabic,
      builder: (context, isAr, _) {
        return MaterialApp(
          debugShowCheckedModeBanner: false,
          builder: (context, child) {
            return Directionality(
              textDirection: isAr ? TextDirection.rtl : TextDirection.ltr,
              child: child!,
            );
          },
          home: startScreen(),
        );
      },
    );
  }
}
