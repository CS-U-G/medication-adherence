import 'package:flutter/material.dart';
import 'package:med_minder/Database/db.dart';
import 'package:med_minder/constants/app_colors.dart';
import 'package:med_minder/widgets/password_field.dart';
import 'package:med_minder/widgets/sittings_card.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final _oldPassCtrl = TextEditingController();
  final _newPassCtrl = TextEditingController();

  @override
  void dispose() {
    _oldPassCtrl.dispose();
    _newPassCtrl.dispose();
    super.dispose();
  }

  void _showChangePasswordDialog() {
    bool hideOld = true, hideNew = true;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          backgroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
          ),
          title: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Change Password?',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              buildPasswordField(
                controller: _oldPassCtrl,
                hintText: 'Old password',
                isObscured: hideOld,
                onToggleVisibility: () =>
                    setDialogState(() => hideOld = !hideOld),
              ),
              const SizedBox(height: 14),
              buildPasswordField(
                controller: _newPassCtrl,
                hintText: 'New password',
                isObscured: hideNew,
                onToggleVisibility: () =>
                    setDialogState(() => hideNew = !hideNew),
              ),
            ],
          ),
          actionsAlignment: MainAxisAlignment.center,
          actions: [
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.medMinderGreen,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: 48,
                  vertical: 14,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              onPressed: () async {
                bool confirmed = await DB.confirmChangingPassword(
                  _oldPassCtrl.text,
                  _newPassCtrl.text,
                );
                if (!context.mounted) return;

                if (confirmed) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Password changed!'),
                      backgroundColor: AppColors.medMinderGreen,
                      behavior: SnackBarBehavior.floating,
                      duration: Duration(seconds: 2),
                    ),
                  );
                  Navigator.pop(context);
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: const Text(
                        'Could not change password. Check your inputs.',
                      ),
                      backgroundColor: Colors.red.shade700,
                      behavior: SnackBarBehavior.floating,
                      duration: const Duration(seconds: 2),
                    ),
                  );
                }
              },
              child: const Text(
                'Change',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Settings',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1D1F1E),
              ),
            ),
            const SizedBox(height: 32),
            const Text(
              'APP PREFERENCES',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
                color: Color(0xFF6C757D),
              ),
            ),
            const SizedBox(height: 12),
            settingCard(
              Icons.lock_outline,
              'Change App Password',
              "Leave a blank if you don't have one",
              _showChangePasswordDialog,
            ),
            settingCard(Icons.wb_sunny_outlined, 'App Theme', 'Light', () {}),
          ],
        ),
      ),
    );
  }
}
