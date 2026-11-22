import 'package:flutter/material.dart';
import 'package:med_minder/constants/app_colors.dart';
import 'package:med_minder/constants/app_lang.dart';
import 'package:med_minder/screens/add_medication.dart';
import 'package:med_minder/screens/dashboard.dart';
import 'package:med_minder/screens/history.dart';
import 'package:med_minder/screens/settings.dart';

class BottomNavigationShared extends StatefulWidget {
  const BottomNavigationShared({super.key});

  @override
  State<BottomNavigationShared> createState() => _BottomNavigationSharedState();
}

class _BottomNavigationSharedState extends State<BottomNavigationShared> {
  int _navigationIndex = 0;
  void navigatePages(int index) {
    setState(() {
      _navigationIndex = index;
    });
  }

  final List _pages = [
    DashboardScreen(),
    AddMedicationScreen(),
    HistoryScreen(),
    SettingsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.white,
        selectedItemColor: AppColors.medMinderGreen,
        unselectedItemColor: Colors.grey.shade600,
        currentIndex: _navigationIndex,
        onTap: navigatePages,
        items: [
          BottomNavigationBarItem(
            icon: const Icon(Icons.calendar_today_outlined),
            activeIcon: const Icon(Icons.calendar_today),
            label: AppLang.t("Today", "اليوم"),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.medication_outlined),
            activeIcon: const Icon(Icons.medication),
            label: AppLang.t("Add Med", "إضافة دواء"),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.history),
            label: AppLang.t("History", "السجل"),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.settings_outlined),
            activeIcon: const Icon(Icons.settings),
            label: AppLang.t("Settings", "الإعدادات"),
          ),
        ],
      ),

      body: _pages[_navigationIndex],
    );
  }
}
