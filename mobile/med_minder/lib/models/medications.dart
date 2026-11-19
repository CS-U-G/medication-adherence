class Medication {
  final String time;
  final String name;
  final String dosage;

  Medication({required this.time, required this.name, required this.dosage});

  //This shit is from the AI *_*
  // Convert Medication -> Map so Hive can save it easily
  Map<String, String> toMap() {
    return {'time': time, 'name': name, 'dosage': dosage};
  }

  // Convert Map -> Medication when loading from Hive
  factory Medication.fromMap(Map map) {
    return Medication(
      time: map['time'] as String,
      name: map['name'] as String,
      dosage: map['dosage'] as String,
    );
  }
}
