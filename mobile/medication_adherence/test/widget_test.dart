import 'package:flutter_test/flutter_test.dart';
import 'package:medication_adherence/app.dart';

void main() {
  testWidgets('Welcome screen appears on launch', (tester) async {
    await tester.pumpWidget(const MedicationAdherenceApp());

    expect(find.text('MedMinder'), findsOneWidget);
    expect(find.text('Get Started'), findsOneWidget);
    expect(find.text('I already have an account'), findsOneWidget);
  });
}