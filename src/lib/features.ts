export const ALL_FEATURES: Record<string, string> = {
    'courses': 'Courses',
    'video': 'Video Learning',
    'quizzes': 'Inline Quizzes',
    'certificates': 'Certificates',
    'analytics': 'Analytics',
    'notifications': 'Notifications',
    'ai_builder': 'AI Course Builder',
    'leaderboards': 'Leaderboards',
    'surveys': 'Surveys',
    'gamification': 'Gamification',
    'forums': 'Discussion Forums',
    'sso': 'SSO Integration'
};

export const DEFAULT_FEATURE_COLUMNS = {
    available: { id: 'available', title: '🟡 Available Features', itemIds: ['ai_builder', 'leaderboards', 'surveys', 'gamification'] },
    enabled: { id: 'enabled', title: '🟢 Enabled Features', itemIds: ['courses', 'video', 'quizzes', 'certificates', 'analytics', 'notifications'] },
    disabled: { id: 'disabled', title: '🔴 Disabled Features', itemIds: ['forums', 'sso'] },
};
