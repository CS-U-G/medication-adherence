
import 'package:flutter/material.dart';
import '../core/app_colors.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _formKey = GlobalKey<FormState>();

  final _nameController = TextEditingController();
  final _ageController = TextEditingController();
  final _heightController = TextEditingController();
  final _weightController = TextEditingController();
  final _allergiesController = TextEditingController();

  String? _gender;
  String? _bloodType;
  bool _remindersEnabled = true;

  @override
  void dispose() {
    _nameController.dispose();
    _ageController.dispose();
    _heightController.dispose();
    _weightController.dispose();
    _allergiesController.dispose();
    super.dispose();
  }

  Widget _sectionTitle(String title, {String? subtitle}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 13),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 19,
              fontWeight: FontWeight.w800,
              color: AppColors.darkGreen,
            ),
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.secondaryText,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _textField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
    String? suffix,
    String? Function(String?)? validator,
    int maxLines = 1,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      validator: validator,
      maxLines: maxLines,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: AppColors.primary, size: 21),
        suffixText: suffix,
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 15,
          vertical: 16,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(15),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(15),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(15),
          borderSide: const BorderSide(
            color: AppColors.primary,
            width: 1.5,
          ),
        ),
      ),
    );
  }

  Widget _dropdown<T>({
    required String label,
    required IconData icon,
    required T? value,
    required List<DropdownMenuItem<T>> items,
    required ValueChanged<T?> onChanged,
  }) {
    return DropdownButtonFormField<T>(
      initialValue: value,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: AppColors.primary, size: 21),
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(15),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(15),
          borderSide: const BorderSide(color: AppColors.border),
        ),
      ),
      items: items,
      onChanged: onChanged,
    );
  }

  void _saveProfile() {
    if (!_formKey.currentState!.validate()) return;

    // TODO: Persist the profile using your backend API or local storage.
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text(
          'Profile validated. Saving to storage is not connected yet.',
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F9F6),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF5F9F6),
        title: const Text(
          'Profile',
          style: TextStyle(
            color: AppColors.darkGreen,
            fontWeight: FontWeight.w800,
          ),
        ),
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 600),
          child: Form(
            key: _formKey,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 30),
              children: [
                // Profile header
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    children: [
                      Container(
                        width: 78,
                        height: 78,
                        decoration: const BoxDecoration(
                          color: AppColors.paleGreen,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.person_rounded,
                          size: 43,
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'Your health profile',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                          color: AppColors.darkGreen,
                        ),
                      ),
                      const SizedBox(height: 5),
                      const Text(
                        'Add details to personalise your experience.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 13,
                          color: AppColors.secondaryText,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 27),

                _sectionTitle(
                  'Personal information',
                  subtitle: 'You can complete or update these details later.',
                ),
                _textField(
                  controller: _nameController,
                  label: 'Full name',
                  icon: Icons.person_outline_rounded,
                ),
                const SizedBox(height: 13),

                Row(
                  children: [
                    Expanded(
                      child: _textField(
                        controller: _ageController,
                        label: 'Age',
                        icon: Icons.cake_outlined,
                        suffix: 'years',
                        keyboardType: TextInputType.number,
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return null;
                          }
                          final age = int.tryParse(value.trim());
                          if (age == null || age < 1 || age > 120) {
                            return 'Enter a valid age';
                          }
                          return null;
                        },
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _dropdown<String>(
                        label: 'Gender (optional)',
                        icon: Icons.person_outline,
                        value: _gender,
                        items: const [
                          DropdownMenuItem(
                            value: 'Female',
                            child: Text('Female'),
                          ),
                          DropdownMenuItem(
                            value: 'Male',
                            child: Text('Male'),
                          ),
                          DropdownMenuItem(
                            value: 'Other',
                            child: Text('Other'),
                          ),
                          DropdownMenuItem(
                            value: 'Prefer not to say',
                            child: Text('Prefer not to say'),
                          ),
                        ],
                        onChanged: (value) =>
                            setState(() => _gender = value),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 13),

                Row(
                  children: [
                    Expanded(
                      child: _textField(
                        controller: _heightController,
                        label: 'Height',
                        icon: Icons.height_rounded,
                        suffix: 'cm',
                        keyboardType: TextInputType.number,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _textField(
                        controller: _weightController,
                        label: 'Weight',
                        icon: Icons.monitor_weight_outlined,
                        suffix: 'kg',
                        keyboardType: const TextInputType.numberWithOptions(
                          decimal: true,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 27),

                _sectionTitle(
                  'Health information',
                  subtitle: 'Optional details to record in your profile.',
                ),
                _dropdown<String>(
                  label: 'Blood type (optional)',
                  icon: Icons.water_drop_outlined,
                  value: _bloodType,
                  items: const [
                    DropdownMenuItem(value: 'A+', child: Text('A+')),
                    DropdownMenuItem(value: 'A-', child: Text('A-')),
                    DropdownMenuItem(value: 'B+', child: Text('B+')),
                    DropdownMenuItem(value: 'B-', child: Text('B-')),
                    DropdownMenuItem(value: 'AB+', child: Text('AB+')),
                    DropdownMenuItem(value: 'AB-', child: Text('AB-')),
                    DropdownMenuItem(value: 'O+', child: Text('O+')),
                    DropdownMenuItem(value: 'O-', child: Text('O-')),
                    DropdownMenuItem(
                      value: 'Unknown',
                      child: Text('Unknown'),
                    ),
                  ],
                  onChanged: (value) =>
                      setState(() => _bloodType = value),
                ),
                const SizedBox(height: 13),
                _textField(
                  controller: _allergiesController,
                  label: 'Allergies (optional)',
                  icon: Icons.warning_amber_rounded,
                  maxLines: 2,
                ),

                const SizedBox(height: 27),

                _sectionTitle('Preferences'),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(17),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: SwitchListTile(
                    value: _remindersEnabled,
                    activeThumbColor: AppColors.primary,
                    onChanged: (value) {
                      setState(() => _remindersEnabled = value);
                    },
                    secondary: const Icon(
                      Icons.notifications_active_outlined,
                      color: AppColors.primary,
                    ),
                    title: const Text(
                      'Medication reminders',
                      style: TextStyle(fontWeight: FontWeight.w700),
                    ),
                    subtitle: const Text(
                      'Receive reminders for scheduled doses.',
                      style: TextStyle(fontSize: 12),
                    ),
                  ),
                ),

                const SizedBox(height: 25),

                SizedBox(
                  height: 53,
                  child: FilledButton.icon(
                    onPressed: _saveProfile,
                    icon: const Icon(Icons.check_rounded),
                    label: const Text(
                      'Save profile',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'You can leave optional fields blank and update them later.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.secondaryText,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
