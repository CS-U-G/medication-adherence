import 'package:hive_flutter/hive_flutter.dart';

class DB {
  static final _passwordsBox = Hive.box("passwordsBox");

  static List _passwords = [];

  static void onboardingSeen() async {
    await Hive.box('isFirstTime').put('seenOnboardingScreen', true);
  }

  static void loadData() {
    final savedList = _passwordsBox.get("passwordsList");
    if (savedList is List) {
      _passwords = savedList;
    }
  }

  static void updatePasswordsData() {
    _passwordsBox.put("passwordsList", _passwords);
  }

  static bool checkPassword(String input) {
    final trimmed = input.trim();
    if (trimmed.isEmpty) return false;
    return _passwords.contains(trimmed);
  }

  static bool confirmPassword(String input1, String input2) {
    final a = input1.trim();
    final b = input2.trim();
    if (a.length >= 4 && a == b) {
      _passwords.add(a);
      updatePasswordsData();
      return true;
    }
    return false;
  }
}
