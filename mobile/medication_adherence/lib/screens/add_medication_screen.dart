import 'package:flutter/material.dart';
import '../core/app_colors.dart';
import '../models/medication.dart';
import '../services/medication_service.dart';

class AddMedicationScreen extends StatefulWidget {
  const AddMedicationScreen({super.key});

  @override
  State<AddMedicationScreen> createState() => _AddMedicationScreenState();
}

class _AddMedicationScreenState extends State<AddMedicationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _dose = TextEditingController();
  final _notes = TextEditingController();

  String _frequency = 'Once daily';
  DateTime _startDate = DateTime.now();
  DateTime? _endDate;
  final Set<String> _times = {'08:00 AM'};

  final List<String> _availableTimes = [
    '08:00 AM',
    '12:00 PM',
    '06:00 PM',
    '09:00 PM',
  ];

  @override
  void dispose() {
    _name.dispose();
    _dose.dispose();
    _notes.dispose();
    super.dispose();
  }

  Future<void> _pickDate({required bool isEnd}) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: isEnd ? (_endDate ?? _startDate) : _startDate,
      firstDate: isEnd ? _startDate : DateTime(2020),
      lastDate: DateTime(2100),
    );

    if (picked != null) {
      setState(() {
        if (isEnd) {
          _endDate = picked;
        } else {
          _startDate = picked;
          if (_endDate != null && _endDate!.isBefore(_startDate)) {
            _endDate = null;
          }
        }
      });
    }
  }

  void _save() {
    if (!_formKey.currentState!.validate()) return;

    if (_times.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Choose at least one reminder time.')),
      );
      return;
    }

    MedicationService.add(
      Medication(
        name: _name.text.trim(),
        dose: _dose.text.trim(),
        frequency: _frequency,
        startDate: _startDate,
        endDate: _endDate,
        reminderTimes: _times.toList()..sort(),
        notes: _notes.text.trim(),
      ),
    );

    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Add medication')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            const Text(
              'Medication details',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            const Text(
              'Enter the details from your prescription or care instructions.',
              style: TextStyle(color: AppColors.secondaryText),
            ),
            const SizedBox(height: 24),
            _label('Medication name'),
            TextFormField(
              controller: _name,
              decoration: const InputDecoration(
                hintText: 'e.g. Medication name',
                prefixIcon: Icon(Icons.medication_outlined),
              ),
              validator: (value) =>
                  value == null || value.trim().isEmpty
                      ? 'Enter the medication name'
                      : null,
            ),
            const SizedBox(height: 18),
            _label('Dose / strength'),
            TextFormField(
              controller: _dose,
              decoration: const InputDecoration(
                hintText: 'e.g. 1 tablet, 500 mg',
                prefixIcon: Icon(Icons.scale_outlined),
              ),
              validator: (value) =>
                  value == null || value.trim().isEmpty
                      ? 'Enter the dose'
                      : null,
            ),
            const SizedBox(height: 18),
            _label('Frequency'),
            DropdownButtonFormField<String>(
              initialValue: _frequency,
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.repeat),
              ),
              items: const [
                'Once daily',
                'Twice daily',
                'Three times daily',
                'Four times daily',
                'As prescribed',
              ].map((value) {
                return DropdownMenuItem(value: value, child: Text(value));
              }).toList(),
              onChanged: (value) {
                if (value != null) setState(() => _frequency = value);
              },
            ),
            const SizedBox(height: 22),
            _label('Start date'),
            _dateTile(
              date: _startDate,
              onTap: () => _pickDate(isEnd: false),
            ),
            const SizedBox(height: 14),
            _label('End date (optional)'),
            ListTile(
              contentPadding: const EdgeInsets.symmetric(horizontal: 12),
              shape: RoundedRectangleBorder(
                side: const BorderSide(color: AppColors.border),
                borderRadius: BorderRadius.circular(12),
              ),
              leading: const Icon(Icons.event_outlined),
              title: Text(
                _endDate == null ? 'No end date' : _formatDate(_endDate!),
              ),
              trailing: IconButton(
                onPressed: _endDate == null
                    ? () => _pickDate(isEnd: true)
                    : () => setState(() => _endDate = null),
                icon: Icon(
                  _endDate == null ? Icons.calendar_month : Icons.close,
                ),
              ),
              onTap: () => _pickDate(isEnd: true),
            ),
            const SizedBox(height: 22),
            _label('Reminder times'),
            const Text(
              'Select the times you want displayed in your schedule.',
              style: TextStyle(color: AppColors.secondaryText),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: _availableTimes.map((time) {
                return FilterChip(
                  label: Text(time),
                  selected: _times.contains(time),
                  onSelected: (selected) {
                    setState(() {
                      selected ? _times.add(time) : _times.remove(time);
                    });
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 22),
            _label('Notes (optional)'),
            TextFormField(
              controller: _notes,
              maxLines: 3,
              decoration: const InputDecoration(
                hintText: 'Additional instructions',
                alignLabelWithHint: true,
              ),
            ),
            const SizedBox(height: 28),
            SizedBox(
              height: 52,
              child: FilledButton.icon(
                onPressed: _save,
                icon: const Icon(Icons.check),
                label: const Text('Save medication'),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _label(String text) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Text(text,
            style: const TextStyle(fontWeight: FontWeight.w600)),
      );

  Widget _dateTile({required DateTime date, required VoidCallback onTap}) {
    return ListTile(
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 12),
      shape: RoundedRectangleBorder(
        side: const BorderSide(color: AppColors.border),
        borderRadius: BorderRadius.circular(12),
      ),
      leading: const Icon(Icons.calendar_month),
      title: Text(_formatDate(date)),
      trailing: const Icon(Icons.chevron_right),
    );
  }

  String _formatDate(DateTime date) =>
      '${date.day.toString().padLeft(2, '0')}/'
      '${date.month.toString().padLeft(2, '0')}/${date.year}';
}