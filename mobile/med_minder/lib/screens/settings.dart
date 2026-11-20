import 'package:flutter/material.dart';
import 'package:med_minder/constants/app_lang.dart';
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
              Text(
                AppLang.t('Change Password?', 'تغيير كلمة المرور؟'),
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
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
                hintText: AppLang.t('Old password', 'كلمة المرور القديمة'),
                isObscured: hideOld,
                onToggleVisibility: () =>
                    setDialogState(() => hideOld = !hideOld),
              ),
              const SizedBox(height: 14),
              buildPasswordField(
                controller: _newPassCtrl,
                hintText: AppLang.t('New password', 'كلمة المرور الجديدة'),
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
                    SnackBar(
                      content: Text(
                        AppLang.t('Password changed!', 'تم تغيير كلمة المرور!'),
                      ),
                      backgroundColor: AppColors.medMinderGreen,
                      behavior: SnackBarBehavior.floating,
                      duration: const Duration(seconds: 2),
                    ),
                  );
                  Navigator.pop(context);
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        AppLang.t(
                          'Could not change password. Check your inputs.',
                          'تعذر تغيير كلمة المرور. تحقق من المدخلات.',
                        ),
                      ),
                      backgroundColor: Colors.red.shade700,
                      behavior: SnackBarBehavior.floating,
                      duration: const Duration(seconds: 2),
                    ),
                  );
                }
              },
              child: Text(
                AppLang.t('Change', 'تغيير'),
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
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
            Text(
              AppLang.t('Settings', 'الإعدادات'),
              style: const TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1D1F1E),
              ),
            ),
            const SizedBox(height: 32),
            Text(
              AppLang.t('APP PREFERENCES', 'تفضيلات التطبيق'),
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
                color: Color(0xFF6C757D),
              ),
            ),
            const SizedBox(height: 12),
            settingCard(
              Icons.lock_outline,
              AppLang.t('Change App Password', 'تغيير كلمة مرور التطبيق'),
              AppLang.t(
                "Leave a blank if you don't have one",
                "اتركه فارغاً إذا لم يكن لديك كلمة مرور",
              ),
              _showChangePasswordDialog,
            ),
            settingCard(
              Icons.language,
              AppLang.t('Language', 'اللغة'),
              AppLang.t('English', 'العربية'),
              () async {
                await AppLang.toggle();
                setState(() {});
              },
            ),
            //settingCard(Icons.wb_sunny_outlined, 'App Theme', 'Light', () {}),
          ],
        ),
      ),
    );
  }
}
