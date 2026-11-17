import 'package:flutter/material.dart';
import 'package:med_minder/constants/app_colors.dart';
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
        type: BottomNavigationBarType
            .fixed, // Prevents the invisible white-on-white shifting mode
        backgroundColor: Colors.white,
        selectedItemColor: const Color(0xFF136F48), // Your forest green
        unselectedItemColor: Colors.grey.shade600,
        currentIndex: _navigationIndex, // Highlights "Today"
        onTap: navigatePages,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.calendar_today_outlined),
            activeIcon: Icon(Icons.calendar_today),
            label: "Today",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.medication_outlined),
            activeIcon: Icon(Icons.medication),
            label: "Add Med",
          ),
          BottomNavigationBarItem(icon: Icon(Icons.history), label: "History"),
          BottomNavigationBarItem(
            icon: Icon(Icons.settings_outlined),
            activeIcon: Icon(Icons.settings),
            label: "Settings",
          ),
        ],
      ),

      body: _pages[_navigationIndex],
    );
  }
}
