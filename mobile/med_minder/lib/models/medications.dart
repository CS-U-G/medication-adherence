class Medication {
  final String time;
  final String name;
  final String dosage;

  Medication({required this.time, required this.name, required this.dosage});

  Map<String, String> toMap() {
    return {'time': time, 'name': name, 'dosage': dosage};
  }

  factory Medication.fromMap(Map map) {
    return Medication(
      time: map['time'] as String,
      name: map['name'] as String,
      dosage: map['dosage'] as String,
    );
  }
}
