"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'English' | 'Spanish' | 'French' | 'German' | 'Arabic';

type Translations = Record<Language, Record<string, string>>;

const translations: Translations = {
    English: {
        'platformSettings': 'Platform Settings',
        'platformSettingsDesc': 'Configure global platform settings and preferences.',
        'general': 'General',
        'appearance': 'Appearance',
        'security': 'Security',
        'email': 'Email',
        'storage': 'Storage',
        'notifications': 'Notifications',
        'generalSettings': 'General Settings',
        'platformName': 'Platform Name',
        'platformUrl': 'Platform URL',
        'defaultLanguage': 'Default Language',
        'twoFactorAuth': 'Two-Factor Authentication',
        'twoFactorAuthDesc': 'Require 2FA for all admin accounts',
        'passwordComplexity': 'Password Complexity',
        'passwordComplexityDesc': 'Enforce strong password requirements',
        'sessionTimeout': 'Session Timeout',
        'sessionTimeoutDesc': 'Auto-logout after 30 minutes of inactivity',
        'ipWhitelisting': 'IP Whitelisting',
        'ipWhitelistingDesc': 'Restrict access to specific IP ranges',
        'emailConfig': 'Email Configuration',
        'smtpServer': 'SMTP Server',
        'smtpPort': 'SMTP Port',
        'fromAddress': 'From Address',
        'reset': 'Reset',
        'saveChanges': 'Save Changes',
        // Appearance
        'themeSelection': 'Theme Selection',
        'primaryColor': 'Primary Color',
        'darkMode': 'Dark Mode Default',
        // Storage
        'storageProvider': 'Storage Provider',
        'maxUploadSize': 'Max Upload Size (MB)',
        // Notifications
        'enableEmailNotif': 'Enable Email Notifications',
        'enablePushNotif': 'Enable Push Notifications',
        'enableSmsNotif': 'Enable SMS Notifications',
    },
    Spanish: {
        'platformSettings': 'Configuración de la plataforma',
        'platformSettingsDesc': 'Configure la configuración global de la plataforma.',
        'general': 'General',
        'appearance': 'Apariencia',
        'security': 'Seguridad',
        'email': 'Correo',
        'storage': 'Almacenamiento',
        'notifications': 'Notificaciones',
        'generalSettings': 'Configuración general',
        'platformName': 'Nombre de la plataforma',
        'platformUrl': 'URL de la plataforma',
        'defaultLanguage': 'Idioma predeterminado',
        'twoFactorAuth': 'Autenticación de dos factores',
        'twoFactorAuthDesc': 'Requerir 2FA para todas las cuentas de administrador',
        'passwordComplexity': 'Complejidad de la contraseña',
        'passwordComplexityDesc': 'Hacer cumplir requisitos estrictos de contraseña',
        'sessionTimeout': 'Tiempo de espera de sesión',
        'sessionTimeoutDesc': 'Cierre de sesión automático después de 30 minutos',
        'ipWhitelisting': 'Listas blancas de IP',
        'ipWhitelistingDesc': 'Restringir el acceso a rangos de IP',
        'emailConfig': 'Configuración de correo',
        'smtpServer': 'Servidor SMTP',
        'smtpPort': 'Puerto SMTP',
        'fromAddress': 'Dirección del remitente',
        'reset': 'Restablecer',
        'saveChanges': 'Guardar cambios',
        'themeSelection': 'Selección de tema',
        'primaryColor': 'Color primario',
        'darkMode': 'Modo oscuro predeterminado',
        'storageProvider': 'Proveedor de almacenamiento',
        'maxUploadSize': 'Tamaño máximo de carga (MB)',
        'enableEmailNotif': 'Habilitar notificaciones por correo',
        'enablePushNotif': 'Habilitar notificaciones Push',
        'enableSmsNotif': 'Habilitar notificaciones SMS',
    },
    French: {
        'platformSettings': 'Paramètres de la plateforme',
        'platformSettingsDesc': 'Configurez les paramètres globaux de la plateforme.',
        'general': 'Général',
        'appearance': 'Apparence',
        'security': 'Sécurité',
        'email': 'E-mail',
        'storage': 'Stockage',
        'notifications': 'Notifications',
        'generalSettings': 'Paramètres généraux',
        'platformName': 'Nom de la plateforme',
        'platformUrl': 'URL de la plateforme',
        'defaultLanguage': 'Langue par défaut',
        'twoFactorAuth': 'Authentification à deux facteurs',
        'twoFactorAuthDesc': 'Exiger le 2FA pour tous les administrateurs',
        'passwordComplexity': 'Complexité des mots de passe',
        'passwordComplexityDesc': 'Exiger des mots de passe forts',
        'sessionTimeout': 'Déconnexion automatique',
        'sessionTimeoutDesc': 'Déconnexion après 30 minutes',
        'ipWhitelisting': 'Liste blanche IP',
        'ipWhitelistingDesc': 'Restreindre l\'accès par IP',
        'emailConfig': 'Configuration de la messagerie',
        'smtpServer': 'Serveur SMTP',
        'smtpPort': 'Port SMTP',
        'fromAddress': 'Adresse d\'expédition',
        'reset': 'Réinitialiser',
        'saveChanges': 'Enregistrer',
        'themeSelection': 'Sélection du thème',
        'primaryColor': 'Couleur primaire',
        'darkMode': 'Mode sombre',
        'storageProvider': 'Fournisseur de stockage',
        'maxUploadSize': 'Taille max de téléchargement (MB)',
        'enableEmailNotif': 'Activer les e-mails',
        'enablePushNotif': 'Activer les notifications push',
        'enableSmsNotif': 'Activer les SMS',
    },
    German: {
        'platformSettings': 'Plattformeinstellungen',
        'platformSettingsDesc': 'Globale Plattformeinstellungen konfigurieren.',
        'general': 'Allgemein',
        'appearance': 'Aussehen',
        'security': 'Sicherheit',
        'email': 'E-Mail',
        'storage': 'Speicher',
        'notifications': 'Benachrichtigungen',
        'generalSettings': 'Allgemeine Einstellungen',
        'platformName': 'Plattformname',
        'platformUrl': 'Plattform-URL',
        'defaultLanguage': 'Standardsprache',
        'twoFactorAuth': 'Zwei-Faktor-Authentifizierung',
        'twoFactorAuthDesc': '2FA für Administratoren erforderlich',
        'passwordComplexity': 'Passwortkomplexität',
        'passwordComplexityDesc': 'Starke Passwörter erzwingen',
        'sessionTimeout': 'Sitzungstimeout',
        'sessionTimeoutDesc': 'Auto-Logout nach 30 Minuten',
        'ipWhitelisting': 'IP-Whitelisting',
        'ipWhitelistingDesc': 'IP-Bereiche beschränken',
        'emailConfig': 'E-Mail-Konfiguration',
        'smtpServer': 'SMTP-Server',
        'smtpPort': 'SMTP-Port',
        'fromAddress': 'Absenderadresse',
        'reset': 'Zurücksetzen',
        'saveChanges': 'Änderungen speichern',
        'themeSelection': 'Themenauswahl',
        'primaryColor': 'Primärfarbe',
        'darkMode': 'Dunkler Modus',
        'storageProvider': 'Speicheranbieter',
        'maxUploadSize': 'Max. Uploadgröße (MB)',
        'enableEmailNotif': 'E-Mail-Benachrichtigungen',
        'enablePushNotif': 'Push-Benachrichtigungen',
        'enableSmsNotif': 'SMS-Benachrichtigungen',
    },
    Arabic: {
        'platformSettings': 'إعدادات المنصة',
        'platformSettingsDesc': 'تكوين الإعدادات العالمية والتفضيلات للمنصة.',
        'general': 'عام',
        'appearance': 'المظهر',
        'security': 'الأمان',
        'email': 'البريد الإلكتروني',
        'storage': 'التخزين',
        'notifications': 'الإشعارات',
        'generalSettings': 'الإعدادات العامة',
        'platformName': 'اسم المنصة',
        'platformUrl': 'رابط المنصة',
        'defaultLanguage': 'اللغة الافتراضية',
        'twoFactorAuth': 'المصادقة الثنائية',
        'twoFactorAuthDesc': 'مطلوب للمسؤولين',
        'passwordComplexity': 'تعقيد كلمة المرور',
        'passwordComplexityDesc': 'فرض كلمات مرور قوية',
        'sessionTimeout': 'مهلة الجلسة',
        'sessionTimeoutDesc': 'تسجيل خروج بعد 30 دقيقة',
        'ipWhitelisting': 'القائمة البيضاء لعناوين IP',
        'ipWhitelistingDesc': 'تقييد الوصول عبر IP',
        'emailConfig': 'تكوين البريد الإلكتروني',
        'smtpServer': 'خادم SMTP',
        'smtpPort': 'منفذ SMTP',
        'fromAddress': 'عنوان المرسل',
        'reset': 'إعادة ضبط',
        'saveChanges': 'حفظ التغييرات',
        'themeSelection': 'اختيار المظهر',
        'primaryColor': 'اللون الأساسي',
        'darkMode': 'الوضع المظلم',
        'storageProvider': 'مزود التخزين',
        'maxUploadSize': 'الحد الأقصى للرفع (MB)',
        'enableEmailNotif': 'تفعيل إشعارات البريد',
        'enablePushNotif': 'تفعيل الإشعارات بالدفع',
        'enableSmsNotif': 'تفعيل إشعارات SMS',
    }
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('English');

    const t = (key: string): string => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {/* If Arabic is selected, change document direction to RTL */}
            <div dir={language === 'Arabic' ? 'rtl' : 'ltr'} style={{ height: '100%', width: '100%' }}>
                {children}
            </div>
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
