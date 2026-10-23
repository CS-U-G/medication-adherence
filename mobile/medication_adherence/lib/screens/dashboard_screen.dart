
import 'package:flutter/material.dart';
// import '../core/app_colors.dart';
import '../models/medication.dart';
import '../services/medication_service.dart';
import 'add_medication_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  DateTime selectedDate = DateUtils.dateOnly(DateTime.now());
  int selectedTab = 0;

  // Dose completion is tracked separately for each date and medication.
  final Set<String> takenDoses = {};

  static const Color ink = Color(0xFF182C25);
  static const Color muted = Color(0xFF718078);
  static const Color green = Color(0xFF137D56);
  static const Color canvas = Color(0xFFF5F9F6);
  static const Color border = Color(0xFFE1EAE3);

  String dateKey(DateTime date) =>
      '${date.year}-${date.month}-${date.day}';

  String doseKey(int index, String time) =>
      '${dateKey(selectedDate)}-$index-$time';

  String get greeting {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  String get formattedDate =>
      '${_weekday(selectedDate.weekday)}, '
      '${_month(selectedDate.month)} ${selectedDate.day}, '
      '${selectedDate.year}';

  String _weekday(int day) => const [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday',
        'Friday', 'Saturday', 'Sunday',
      ][day - 1];

  String _month(int month) => const [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ][month - 1];

  String _shortWeekday(int day) => const [
        'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun',
      ][day - 1];

  bool _isScheduled(Medication medication) {
    final date = DateUtils.dateOnly(selectedDate);
    final start = DateUtils.dateOnly(medication.startDate);
    final end = medication.endDate == null
        ? null
        : DateUtils.dateOnly(medication.endDate!);

    return !date.isBefore(start) && (end == null || !date.isAfter(end));
  }

  int _timeMinutes(String time) {
    final match = RegExp(
      r'^(\d{1,2}):(\d{2})\s*(AM|PM)$',
      caseSensitive: false,
    ).firstMatch(time.trim());

    if (match == null) return 0;

    var hour = int.parse(match.group(1)!);
    final minute = int.parse(match.group(2)!);
    final period = match.group(3)!.toUpperCase();

    if (period == 'PM' && hour != 12) hour += 12;
    if (period == 'AM' && hour == 12) hour = 0;

    return hour * 60 + minute;
  }

  @override
  Widget build(BuildContext context) {
    final allMedications = MedicationService.medications;
    final scheduled = allMedications.where(_isScheduled).toList();

    final entries = <_DoseEntry>[];

    for (final medication in scheduled) {
      final index = allMedications.indexOf(medication);

      for (final time in medication.reminderTimes) {
        entries.add(_DoseEntry(
          medication: medication,
          medicationIndex: index,
          time: time,
          key: doseKey(index, time),
        ));
      }
    }

    entries.sort(
      (a, b) => _timeMinutes(a.time).compareTo(_timeMinutes(b.time)),
    );

    // final completed = entries.where((e) => takenDoses.contains(e.key)).length;
    // final isToday = DateUtils.isSameDay(selectedDate, DateTime.now());

    if (selectedTab != 0) {
      return _secondaryPage();
    }

    return Scaffold(
      backgroundColor: canvas,
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 560),
            child: CustomScrollView(
              slivers: [
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(20, 14, 20, 28),
                  sliver: SliverList(
                    delegate: SliverChildListDelegate([
                      _header(),
                      const SizedBox(height: 27),

                      Text(
                        '$greeting!',
                        style: const TextStyle(
                          fontSize: 25,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.7,
                          color: ink,
                        ),
                      ),
                      const SizedBox(height: 5),
                      Text(
                        formattedDate,
                        style: const TextStyle(
                          fontSize: 14,
                          color: muted,
                        ),
                      ),

                      const SizedBox(height: 22),
                      _daySelector(),

                      const SizedBox(height: 27),
                      Row(
                        children: [
                          const Expanded(
                            child: Text(
                              "Today's schedule",
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w800,
                                letterSpacing: -0.5,
                                color: ink,
                              ),
                            ),
                          ),
                          Text(
                            '${scheduled.length} '
                            '${scheduled.length == 1 ? 'medication' : 'medications'}',
                            style: const TextStyle(
                              color: muted,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 19),

                      if (entries.isEmpty)
                        _emptyState()
                      else
                        ...List.generate(entries.length, (index) {
                          final entry = entries[index];
                          final isTaken = takenDoses.contains(entry.key);

                          return _timelineRow(
                            entry: entry,
                            isTaken: isTaken,
                            isLast: index == entries.length - 1,
                            onToggle: () {
                              setState(() {
                                if (isTaken) {
                                  takenDoses.remove(entry.key);
                                } else {
                                  takenDoses.add(entry.key);
                                }
                              });
                            },
                          );
                        }),

                      const SizedBox(height: 20),
                    ]),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      bottomNavigationBar: _bottomNavigation(),
    );
  }

  Widget _header() {
    return Row(
      children: [
       Container(
          width: 46,
          height: 46,
          padding: const EdgeInsets.all(5),
          decoration: BoxDecoration(
            color: const Color(0xFFDDF1E4),
            borderRadius: BorderRadius.circular(15),
          ),
          child: Image.asset(
            'assets/images/medreminder_unified_logo.png',
            fit: BoxFit.contain,
            errorBuilder: (context, error, stackTrace) => const Icon(
              Icons.medication_rounded,
              color: Color(0xFF137D56),
              size: 28,
            ),
          ),
        ),
        const SizedBox(width: 11),
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'MedMinder',
                style: TextStyle(
                  fontSize: 21,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -0.7,
                  color: ink,
                ),
              ),
              SizedBox(height: 2),
              Text(
                'YOUR DAILY HEALTH COMPANION',
                style: TextStyle(
                  fontSize: 8,
                  letterSpacing: 1.1,
                  fontWeight: FontWeight.w600,
                  color: muted,
                ),
              ),
            ],
          ),
        ),
        IconButton(
          tooltip: 'Notifications',
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Notifications are not configured yet.'),
              ),
            );
          },
          style: IconButton.styleFrom(
            backgroundColor: Colors.white,
            fixedSize: const Size(44, 44),
          ),
          icon: const Icon(
            Icons.notifications_none_rounded,
            color: Color(0xFF355447),
          ),
        ),
      ],
    );
  }

  Widget _daySelector() {
    // Show four consecutive dates, beginning with today.
    final today = DateUtils.dateOnly(DateTime.now());

    return Row(
      children: List.generate(4, (index) {
        final date = today.add(Duration(days: index));
        final selected = DateUtils.isSameDay(date, selectedDate);

        return Expanded(
          child: Padding(
            padding: EdgeInsets.only(right: index == 3 ? 0 : 8),
            child: Material(
              color: selected ? green : Colors.white,
              borderRadius: BorderRadius.circular(17),
              child: InkWell(
                borderRadius: BorderRadius.circular(17),
                onTap: () => setState(() => selectedDate = date),
                child: Container(
                  constraints: const BoxConstraints(minHeight: 76),
                  padding: const EdgeInsets.symmetric(
                    vertical: 13,
                    horizontal: 3,
                  ),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(17),
                    border: Border.all(
                      color: selected ? green : border,
                    ),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'Day ${index + 1}',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: selected ? Colors.white : ink,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        '${_shortWeekday(date.weekday)} ${date.day}',
                        style: TextStyle(
                          fontSize: 11,
                          color: selected
                              ? const Color(0xFFD8F0E1)
                              : muted,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        );
      }),
    );
  }

  Widget _timelineRow({
    required _DoseEntry entry,
    required bool isTaken,
    required bool isLast,
    required VoidCallback onToggle,
  }) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SizedBox(
            width: 84,
            child: Column(
              children: [
                Row(
                  children: [
                    Container(
                      width: 10,
                      height: 10,
                      margin: const EdgeInsets.only(left: 2, right: 8),
                      decoration: BoxDecoration(
                        color: isTaken ? green : const Color(0xFF229B6D),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: const Color(0xFFD3EBDD),
                          width: 2,
                        ),
                      ),
                    ),
                    Expanded(
                      child: Text(
                        entry.time,
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: ink,
                        ),
                      ),
                    ),
                  ],
                ),
                if (!isLast)
                  Expanded(
                    child: Container(
                      width: 2,
                      margin: const EdgeInsets.only(top: 7),
                      color: const Color(0xFFD4E5D9),
                    ),
                  ),
              ],
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 13),
              child: _medicationCard(
                entry: entry,
                isTaken: isTaken,
                onToggle: onToggle,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _medicationCard({
    required _DoseEntry entry,
    required bool isTaken,
    required VoidCallback onToggle,
  }) {
    final medication = entry.medication;
    final iconData = _medicationIcon(medication.name);
    final iconColor = _medicationColor(medication.name);

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(19),
        border: Border.all(color: border),
        boxShadow: const [
          BoxShadow(
            color: Color(0x080F4D32),
            blurRadius: 13,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: iconColor.withValues(alpha: 0.14),
                  shape: BoxShape.circle,
                ),
                child: Icon(iconData, color: iconColor, size: 21),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      medication.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: ink,
                        decoration:
                            isTaken ? TextDecoration.lineThrough : null,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      medication.dose,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 12,
                        color: muted,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 4),
              const Icon(
                Icons.chevron_right_rounded,
                color: Color(0xFF84938B),
                size: 23,
              ),
            ],
          ),
          const SizedBox(height: 11),
          SizedBox(
            width: double.infinity,
            height: 36,
            child: FilledButton.icon(
              onPressed: onToggle,
              icon: Icon(
                isTaken
                    ? Icons.check_circle
                    : Icons.check_circle_outline,
                size: 17,
              ),
              label: Text(
                isTaken ? 'Taken' : 'Mark as taken',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
              style: FilledButton.styleFrom(
                elevation: 0,
                backgroundColor: isTaken
                    ? const Color(0xFFD3EBDD)
                    : const Color(0xFFE8F5EC),
                foregroundColor: green,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(11),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  IconData _medicationIcon(String name) {
    final value = name.toLowerCase();
    if (value.contains('vitamin')) return Icons.wb_sunny_rounded;
    if (value.contains('liquid') || value.contains('syrup')) {
      return Icons.water_drop_rounded;
    }
    return Icons.medication_rounded;
  }

  Color _medicationColor(String name) {
    final value = name.toLowerCase();
    if (value.contains('vitamin')) return const Color(0xFFF2AC36);
    if (value.contains('amoxicillin') || value.contains('antibiotic')) {
      return const Color(0xFF409CEB);
    }
    if (value.contains('magnesium')) return const Color(0xFF9571E8);
    return green;
  }

  Widget _emptyState() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 31),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: border),
      ),
      child: Column(
        children: [
          Container(
            width: 58,
            height: 58,
            decoration: const BoxDecoration(
              color: Color(0xFFE5F4E9),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.medication_outlined,
              color: green,
              size: 29,
            ),
          ),
          const SizedBox(height: 15),
          const Text(
            'Nothing scheduled yet',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: ink,
            ),
          ),
          const SizedBox(height: 7),
          const Text(
            'Add your medication details to see them here.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 12, color: muted),
          ),
          const SizedBox(height: 17),
          OutlinedButton.icon(
            onPressed: _openAddMedication,
            icon: const Icon(Icons.add_rounded),
            label: const Text('Add medication'),
            style: OutlinedButton.styleFrom(
              foregroundColor: green,
              side: const BorderSide(color: Color(0xFFB7DCC5)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _bottomNavigation() {
    const labels = ['Home', 'Schedule', 'History', 'Profile'];
    const icons = [
      Icons.home_rounded,
      Icons.calendar_month_outlined,
      Icons.bar_chart_rounded,
      Icons.person_outline_rounded,
    ];

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: border)),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(8, 8, 8, 5),
          child: Row(
            children: List.generate(labels.length, (index) {
              final selected = selectedTab == index;

              return Expanded(
                child: InkWell(
                  borderRadius: BorderRadius.circular(14),
                  onTap: () => setState(() => selectedTab = index),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 7),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          icons[index],
                          size: 23,
                          color: selected ? green : muted,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          labels[index],
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: selected
                                ? FontWeight.w800
                                : FontWeight.w500,
                            color: selected ? green : muted,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Container(
                          width: 4,
                          height: 4,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: selected
                                ? green
                                : Colors.transparent,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }

  Widget _secondaryPage() {
    final titles = ['Home', 'Schedule', 'History', 'Profile'];

    return Scaffold(
      backgroundColor: canvas,
      appBar: AppBar(
        backgroundColor: canvas,
        title: Text(
          titles[selectedTab],
          style: const TextStyle(
            color: ink,
            fontWeight: FontWeight.w800,
          ),
        ),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                selectedTab == 1
                    ? Icons.calendar_month_outlined
                    : selectedTab == 2
                        ? Icons.bar_chart_rounded
                        : Icons.person_outline_rounded,
                color: green,
                size: 52,
              ),
              const SizedBox(height: 14),
              Text(
                '${titles[selectedTab]} coming next',
                style: const TextStyle(
                  color: ink,
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 7),
              const Text(
                'This section has not been implemented yet.',
                textAlign: TextAlign.center,
                style: TextStyle(color: muted),
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: _bottomNavigation(),
    );
  }

  Future<void> _openAddMedication() async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => const AddMedicationScreen(),
      ),
    );
    if (mounted) setState(() {});
  }
}

class _DoseEntry {
  const _DoseEntry({
    required this.medication,
    required this.medicationIndex,
    required this.time,
    required this.key,
  });

  final Medication medication;
  final int medicationIndex;
  final String time;
  final String key;
}
