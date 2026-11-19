import 'package:hive_flutter/hive_flutter.dart';
import 'package:med_minder/models/medications.dart';

class DB {
  static final _passwordsBox = Hive.box("passwordsBox");
  static final _medicationsBox = Hive.box("medicationsBox");

  static List _passwords = [];
  static List<Medication> medications = [
    Medication(time: '14:00', name: 'Metformin', dosage: '500 mg · 1 tablet'),
    Medication(time: '20:00', name: 'Atorvastatin', dosage: '20 mg · 1 tablet'),
    Medication(time: '02:00', name: 'Atorvastatin', dosage: '20 mg · 1 tablet'),
  ];

  static void onboardingSeen() async {
    await Hive.box('isFirstTime').put('seenOnboardingScreen', true);
  }

  static void hasPassword() async {
    await Hive.box('hasOrSkippedPassword').put('hasPasswordValue', true);
  }

  static void skippedPassword() async {
    await Hive.box('hasOrSkippedPassword').put('skippedPasswordValue', true);
  }

  static void loadPasswordsData() {
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

  //The medications side of logic type of shit..
  static void loadMedicationsData() {
    final savedList = _medicationsBox.get("medicationsList");
    if (savedList is List) {
      medications = savedList
          .map((item) => Medication.fromMap(item as Map))
          .toList();
    }
  }

  static void updateMedicationsData() {
    final mappedList = medications.map((med) => med.toMap()).toList();
    _medicationsBox.put("medicationsList", mappedList);
  }

  static void deleteMedication(int index) {
    medications.removeAt(index);
    updateMedicationsData();
  }
}
